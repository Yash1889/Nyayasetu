import { describe, it, expect } from "vitest";
import { analyzeQueryRisk } from "@/lib/engine/risk_router";

describe("RiskRouter - Deterministic Safety & Context Classification", () => {
  it("routes active physical violence in English to EMERGENCY with high confidence", () => {
    const query = "My husband is beating me and holding a knife, please help me now";
    const result = analyzeQueryRisk(query);

    expect(result.route).toBe("EMERGENCY");
    expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    expect(result.requires_immediate_safety).toBe(true);
    expect(result.context).toBe("Personal_Safety");
    expect(result.matched_signals.length).toBeGreaterThan(0);
  });

  it("routes Hindi/Hinglish distress cries to EMERGENCY", () => {
    const hindiQuery = "bachao bachao mujhe mar raha hai please police bulao";
    const result = analyzeQueryRisk(hindiQuery);

    expect(result.route).toBe("EMERGENCY");
    expect(result.requires_immediate_safety).toBe(true);
  });

  it("routes self-harm and suicidal crisis to EMERGENCY", () => {
    const query = "I cannot take this harassment anymore, I want to commit suicide";
    const result = analyzeQueryRisk(query);

    expect(result.route).toBe("EMERGENCY");
    expect(result.requires_immediate_safety).toBe(true);
    expect(result.matched_signals).toContain("Self-harm / Suicide risk");
  });

  it("routes cyber financial loss or blackmail to HIGH_RISK, not immediate physical emergency", () => {
    const query = "Someone is blackmailing me and demanding money or they will leak my photos";
    const result = analyzeQueryRisk(query);

    expect(result.route).toBe("HIGH_RISK");
    expect(result.requires_immediate_safety).toBe(false);
  });

  it("routes routine civil and consumer queries to NORMAL route", () => {
    const query = "Flipkart delivered a defective phone and refused replacement under warranty";
    const result = analyzeQueryRisk(query);

    expect(result.route).toBe("NORMAL");
    expect(result.context).toBe("Consumer");
    expect(result.requires_immediate_safety).toBe(false);
  });

  it("does not false-trigger EMERGENCY on academic or legal inquiries about domestic violence", () => {
    const query = "What are the legal remedies for residence orders under the Domestic Violence Act 2005?";
    const result = analyzeQueryRisk(query);

    expect(result.route).not.toBe("EMERGENCY");
    expect(result.context).toBe("Personal_Safety");
  });
});
