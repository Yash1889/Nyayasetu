import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { generateGroundedLegalResponse } from "@/lib/engine/generator";
import { hybridRetrieve } from "@/lib/engine/hybrid_retriever";

/**
 * Generator tests — two separate suites:
 *
 * 1. Deterministic Fallback Suite:
 *    Runs with no API key present (GROQ_API_KEY unset).
 *    Verifies the fallback engine returns grounded, non-hallucinated responses
 *    with valid citation provenance and no predictive outcome assertions.
 *
 * 2. Provider Config Suite:
 *    Verifies resolveProviderConfig reads env vars correctly without
 *    requiring a live network call.
 */

describe("Generator — Deterministic Grounded Fallback (Offline Mode)", () => {
  // Suppress env vars for this suite so no live API is called
  beforeAll(() => {
    delete process.env.GROQ_API_KEY;
    delete process.env.GEMINI_API_KEY;
    process.env.LLM_PROVIDER = "groq";
    process.env.LLM_MODEL = "openai/gpt-oss-120b";
  });

  afterAll(() => {
    delete process.env.LLM_PROVIDER;
    delete process.env.LLM_MODEL;
  });

  it("returns a deterministic response for a consumer dispute without API key", async () => {
    const passages = hybridRetrieve("defective refrigerator company refused warranty replacement", 3);
    const output = await generateGroundedLegalResponse({
      query: "defective refrigerator company refused warranty replacement",
      passages,
      context_domain: "Consumer",
      risk_level: "NORMAL",
    });

    expect(output.provider).toContain("Deterministic");
    expect(output.model).toBe("deterministic-statute-synthesizer-v1");
    expect(output.generation_latency_ms).toBeGreaterThanOrEqual(0);
    expect(output.response.plain_summary.length).toBeGreaterThan(20);
    expect(output.response.statutory_citations.length).toBeGreaterThan(0);
    expect(output.response.actionable_next_steps.length).toBeGreaterThanOrEqual(2);
  });

  it("only cites provision IDs that exist in retrieved passages", async () => {
    const passages = hybridRetrieve("cheque bounced insufficient funds bank memo", 3);
    const output = await generateGroundedLegalResponse({
      query: "cheque bounced insufficient funds bank memo",
      passages,
      context_domain: "Civil_Other",
      risk_level: "NORMAL",
    });

    const validIds = new Set(passages.map((p) => p.provision.provision_id));
    for (const citation of output.response.statutory_citations) {
      expect(validIds.has(citation.provision_id)).toBe(true);
    }
  });

  it("includes Section 358 transitional note in uncertainty_notes when provided", async () => {
    const passages = hybridRetrieve("cheating criminal breach of trust", 3);
    const transitionalNote =
      "Under Section 358 of BNS 2023 and Section 531 of BNSS 2023, offences before July 1, 2024 continue under IPC 1860 / CrPC 1973.";
    const output = await generateGroundedLegalResponse({
      query: "cheating criminal breach of trust",
      passages,
      context_domain: "Civil_Other",
      risk_level: "NORMAL",
      transitional_note: transitionalNote,
    });

    expect(output.response.uncertainty_notes).toContain("Section 358");
    expect(output.response.uncertainty_notes).toContain("IPC 1860");
  });

  it("does not include forbidden predictive language in any response field", async () => {
    const passages = hybridRetrieve("cyber fraud otp stolen bank", 3);
    const output = await generateGroundedLegalResponse({
      query: "cyber fraud otp stolen bank",
      passages,
      context_domain: "Cyber_Financial",
      risk_level: "HIGH_RISK",
    });

    const allText = [
      output.response.plain_summary,
      output.response.legal_analysis,
      ...output.response.actionable_next_steps,
    ].join(" ");

    const forbidden = [
      "you will definitely win",
      "guaranteed bail",
      "100% chance",
      "you are guaranteed to win",
    ];
    for (const phrase of forbidden) {
      expect(allText.toLowerCase()).not.toContain(phrase);
    }
  });

  it("returns cyber fraud response with 1930 referral helpline", async () => {
    const passages = hybridRetrieve("phishing link bank account deducted", 3);
    const output = await generateGroundedLegalResponse({
      query: "phishing link bank account deducted",
      passages,
      context_domain: "Cyber_Financial",
      risk_level: "HIGH_RISK",
    });

    expect(output.response.professional_referral.helpline_number).toBe("1930");
    expect(output.response.professional_referral.type).toBe("CYBER_PORTAL");
  });
});

describe("Generator — Provider Config Resolution", () => {
  it("reads GROQ provider and model from env vars", async () => {
    process.env.LLM_PROVIDER = "groq";
    process.env.LLM_MODEL = "openai/gpt-oss-120b";
    process.env.GROQ_API_KEY = "gsk_test_key_longer_than_ten_chars_padding";

    const { resolveProviderConfig } = await import("@/lib/server/provider_config");
    const cfg = resolveProviderConfig();

    expect(cfg.provider).toBe("groq");
    expect(cfg.model).toBe("openai/gpt-oss-120b");
    expect(cfg.isConfigured).toBe(true);
    expect(cfg.apiKey).toBeDefined();
    // Key must not be exposed via the response serialization path (it's just a string)
    expect(typeof cfg.apiKey).toBe("string");

    delete process.env.LLM_PROVIDER;
    delete process.env.LLM_MODEL;
    delete process.env.GROQ_API_KEY;
  });

  it("marks provider as unconfigured when API key is absent", async () => {
    process.env.LLM_PROVIDER = "groq";
    delete process.env.GROQ_API_KEY;

    // Force fresh module evaluation by re-importing
    const { resolveProviderConfig } = await import("@/lib/server/provider_config");
    const cfg = resolveProviderConfig();

    expect(cfg.isConfigured).toBe(false);
    expect(cfg.apiKey).toBeUndefined();

    delete process.env.LLM_PROVIDER;
  });

  it("defaults to groq provider when LLM_PROVIDER is unset", async () => {
    delete process.env.LLM_PROVIDER;
    delete process.env.GROQ_API_KEY;

    const { resolveProviderConfig } = await import("@/lib/server/provider_config");
    const cfg = resolveProviderConfig();

    expect(cfg.provider).toBe("groq");
  });

  it("switches to gemini provider when LLM_PROVIDER=gemini", async () => {
    process.env.LLM_PROVIDER = "gemini";
    process.env.LLM_MODEL = "gemini-2.5-flash";
    process.env.GEMINI_API_KEY = "AIzaSy_test_key_longer_than_ten_chars";

    const { resolveProviderConfig } = await import("@/lib/server/provider_config");
    const cfg = resolveProviderConfig();

    expect(cfg.provider).toBe("gemini");
    expect(cfg.model).toBe("gemini-2.5-flash");
    expect(cfg.isConfigured).toBe(true);

    delete process.env.LLM_PROVIDER;
    delete process.env.LLM_MODEL;
    delete process.env.GEMINI_API_KEY;
  });
});
