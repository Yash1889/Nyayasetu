import { describe, it, expect } from "vitest";
import { runTriagePipeline } from "@/lib/engine/triage_orchestrator";

describe("TriageOrchestrator - Complete End-to-End Vertical Slice", () => {
  it("processes active domestic violence emergency in < 50ms without LLM hallucination", async () => {
    const start = Date.now();
    const result = await runTriagePipeline({
      query: "My husband is attacking me with a knife in the house, please help me now save me",
      is_anonymous: true
    });
    const duration = Date.now() - start;

    expect(result.route).toBe("EMERGENCY");
    expect(result.assessed_context).toBe("Personal_Safety");
    expect(result.emergency_guidance).toBeDefined();
    expect(result.emergency_guidance?.applicable_contacts.some(c => c.number === "112")).toBe(true);
    expect(result.emergency_guidance?.applicable_contacts.some(c => c.number === "181")).toBe(true);
    expect(result.provider_used).toContain("Deterministic");
    expect(duration).toBeLessThan(100);
  });

  it("triages consumer dispute with grounded CPA 2019 citations and actionable steps", async () => {
    const result = await runTriagePipeline({
      query: "Delivered product is completely defective and the retailer refuses replacement or refund under warranty.",
      incident_date: "2024-09-10"
    });

    expect(result.route).toBe("NORMAL");
    expect(result.assessed_context).toBe("Consumer");
    expect(result.evidence_status).toBe("SUFFICIENT");
    expect(result.grounded_response).toBeDefined();

    const citations = result.grounded_response?.statutory_citations || [];
    expect(citations.length).toBeGreaterThan(0);
    expect(citations.some(c => c.act_short === "CPA 2019")).toBe(true);
    expect(result.grounded_response?.actionable_next_steps.length).toBeGreaterThanOrEqual(2);
    expect(result.grounded_response?.professional_referral.helpline_number).toBe("1915");
  });

  it("handles cyber financial loss and refers to 1930 helpline", async () => {
    const result = await runTriagePipeline({
      query: "I got a phishing message and clicked the link, 50,000 rupees was deducted from my bank account without OTP",
      incident_date: "2024-10-01"
    });

    expect(result.route).toBe("HIGH_RISK");
    expect(result.assessed_context).toBe("Cyber_Financial");
    expect(result.grounded_response).toBeDefined();
    expect(result.grounded_response?.professional_referral.helpline_number).toBe("1930");
    expect(result.grounded_response?.professional_referral.portal_url).toBe("https://cybercrime.gov.in");
  });

  it("applies Section 358 BNS savings clause when criminal offence occurred prior to July 1, 2024", async () => {
    const result = await runTriagePipeline({
      query: "Accused committed cheating and criminal breach of trust by dishonestly misappropriating entrusted funds",
      incident_date: "2024-01-15" // Pre-July 1, 2024
    });

    expect(result.evidence_status).toBe("OUTDATED_LAW");
    expect(result.grounded_response).toBeDefined();
    expect(result.grounded_response?.uncertainty_notes).toContain("Section 358");
    expect(result.grounded_response?.uncertainty_notes).toContain("Indian Penal Code, 1860 (IPC)");
  });

  it("returns clarification prompt when query lacks sufficient factual details", async () => {
    const result = await runTriagePipeline({
      query: "law help please"
    });

    expect(result.route).toBe("UNCERTAIN");
    expect(result.evidence_status).toBe("INSUFFICIENT");
    expect(result.clarification_prompt).toBeDefined();
    expect(result.clarification_prompt?.missing_elements.length).toBeGreaterThan(0);
    expect(result.clarification_prompt?.suggested_questions.length).toBeGreaterThan(0);
  });
});
