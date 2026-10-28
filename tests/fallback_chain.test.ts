import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateGroundedLegalResponse } from "../lib/engine/generator";
import { hybridRetrieve } from "../lib/engine/hybrid_retriever";
import { runTriagePipeline } from "../lib/engine/triage_orchestrator";

describe("Fallback Chain & Edge-Case Fault Tolerance Suite", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.GROQ_API_KEY;
    delete process.env.LLM_PROVIDER;
    delete process.env.LLM_MODEL;
  });

  it("Chain Step 1 -> 2: Primary Groq model failure automatically triggers secondary Groq model", async () => {
    process.env.GROQ_API_KEY = "gsk_dummy_test_key_for_controlled_mock";
    process.env.LLM_PROVIDER = "groq";
    process.env.LLM_MODEL = "openai/gpt-oss-120b";

    const passages = hybridRetrieve("defective product warranty replacement", 2);

    let callCount = 0;
    const requestedModels: string[] = [];

    global.fetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      callCount++;
      const body = JSON.parse(opts.body);
      requestedModels.push(body.model);

      if (body.model === "openai/gpt-oss-120b") {
        // Primary model simulated failure (HTTP 429 Rate Limit)
        return {
          ok: false,
          status: 429,
          text: async () => JSON.stringify({ error: { message: "Rate limit reached on TPM" } }),
        };
      }

      if (body.model === "qwen/qwen3.8-27b") {
        // Secondary model succeeds
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    plain_summary: "Under CPA 2019, consumer may seek product replacement.",
                    legal_analysis: "Deficiency in service is established under Section 2(11).",
                    statutory_citations: [
                      {
                        provision_id: passages[0].provision.provision_id,
                        act_title: passages[0].provision.act_title,
                        act_short: passages[0].provision.act_short,
                        section_number: passages[0].provision.section_number,
                        section_heading: passages[0].provision.section_heading,
                        source_url: passages[0].provision.source_url,
                      },
                    ],
                    actionable_next_steps: ["Send legal notice within 15 days."],
                    uncertainty_notes: "Requires purchase bill proof.",
                    professional_referral: {
                      type: "CONSUMER_COMMISSION",
                      authority_name: "District Commission",
                      helpline_number: "1915",
                      notes: "Helpline mediation.",
                    },
                  }),
                },
              },
            ],
          }),
        };
      }

      throw new Error("Unexpected model");
    });

    const output = await generateGroundedLegalResponse({
      query: "defective product warranty replacement",
      passages,
      context_domain: "Consumer",
      risk_level: "NORMAL",
    });

    expect(callCount).toBe(2);
    expect(requestedModels[0]).toBe("openai/gpt-oss-120b");
    expect(requestedModels[1]).toBe("qwen/qwen3.8-27b");
    expect(output.model).toBe("qwen/qwen3.8-27b");
    expect(output.provider).toContain("Groq API (qwen/qwen3.8-27b)");
    expect(output.response.statutory_citations.length).toBe(1);
  });

  it("Chain Step 2 -> 3: Secondary Groq model failure triggers deterministic offline fallback", async () => {
    process.env.GROQ_API_KEY = "gsk_dummy_test_key_for_controlled_mock";
    process.env.LLM_PROVIDER = "groq";
    process.env.LLM_MODEL = "openai/gpt-oss-120b";

    const passages = hybridRetrieve("cheque bounced insufficient funds", 2);

    global.fetch = vi.fn().mockImplementation(async () => {
      // Both primary and secondary models fail
      return {
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: { message: "Service Unavailable" } }),
      };
    });

    const output = await generateGroundedLegalResponse({
      query: "cheque bounced insufficient funds",
      passages,
      context_domain: "Civil_Other",
      risk_level: "NORMAL",
    });

    expect(output.provider).toContain("Deterministic Grounded Engine (Offline Fallback)");
    expect(output.model).toBe("deterministic-statute-synthesizer-v1");
    expect(output.response.statutory_citations.length).toBeGreaterThan(0);
    expect(output.response.statutory_citations[0].provision_id).toBe(passages[0].provision.provision_id);
  });

  it("Chain Step: Network Timeout (AbortSignal) triggers deterministic offline fallback", async () => {
    process.env.GROQ_API_KEY = "gsk_dummy_test_key_for_controlled_mock";
    process.env.LLM_PROVIDER = "groq";
    process.env.LLM_MODEL = "openai/gpt-oss-120b";

    const passages = hybridRetrieve("landlord security deposit", 2);

    global.fetch = vi.fn().mockImplementation(async () => {
      const err = new Error("The operation was aborted");
      err.name = "AbortError";
      throw err;
    });

    const output = await generateGroundedLegalResponse({
      query: "landlord security deposit",
      passages,
      context_domain: "Property_Tenancy",
      risk_level: "NORMAL",
    });

    expect(output.provider).toContain("Deterministic");
    expect(output.model).toBe("deterministic-statute-synthesizer-v1");
  });

  it("Chain Step: Malformed JSON output from LLM triggers deterministic offline fallback", async () => {
    process.env.GROQ_API_KEY = "gsk_dummy_test_key_for_controlled_mock";
    process.env.LLM_PROVIDER = "groq";
    process.env.LLM_MODEL = "qwen/qwen3.8-27b";

    const passages = hybridRetrieve("unauthorized bank debit cyber fraud", 2);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: "I am unable to answer this question in JSON format. Please contact a lawyer.",
            },
          },
        ],
      }),
    });

    const output = await generateGroundedLegalResponse({
      query: "unauthorized bank debit cyber fraud",
      passages,
      context_domain: "Cyber_Financial",
      risk_level: "HIGH_RISK",
    });

    // Malformed non-JSON output safely triggers fallback
    expect(output.provider).toContain("Deterministic");
    expect(output.model).toBe("deterministic-statute-synthesizer-v1");
  });

  it("Pipeline Guard: Empty / vacuous query returns UNCERTAIN without calling retriever or LLM", async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const res1 = await runTriagePipeline({ query: "" });
    expect(res1.route).toBe("UNCERTAIN");
    expect(res1.evidence_status).toBe("INSUFFICIENT");
    expect(res1.clarification_prompt?.missing_elements.length).toBeGreaterThan(0);

    const res2 = await runTriagePipeline({ query: "help please" });
    expect(res2.route).toBe("UNCERTAIN");
    expect(res2.evidence_status).toBe("INSUFFICIENT");

    // Zero API calls made for vacuous queries
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
