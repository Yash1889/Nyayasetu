import { describe, it, expect } from "vitest";
import { validateAndSanitizeOutput } from "@/lib/engine/output_validator";
import { GroundedLegalResponse, RetrievedPassage } from "@/lib/types";
import { hybridRetrieve } from "@/lib/engine/hybrid_retriever";

describe("OutputValidator - Citation Provenance & Anti-Hallucination Guard", () => {
  const passages: RetrievedPassage[] = hybridRetrieve("defective product warranty", 2);

  const validResponse: GroundedLegalResponse = {
    plain_summary: "Under the Consumer Protection Act, consumers can seek repair or refund.",
    legal_analysis: "Section 2(11) of CPA 2019 defines deficiency in service.",
    statutory_citations: [
      {
        provision_id: passages[0].provision.provision_id,
        act_title: passages[0].provision.act_title,
        act_short: passages[0].provision.act_short,
        section_number: passages[0].provision.section_number,
        section_heading: passages[0].provision.section_heading,
        source_url: passages[0].provision.source_url
      }
    ],
    actionable_next_steps: [
      "Issue a written notice to the seller.",
      "Lodge a complaint on consumer helpline portal."
    ],
    uncertainty_notes: "Subject to terms of warranty.",
    professional_referral: {
      type: "CONSUMER_COMMISSION",
      authority_name: "District Consumer Disputes Redressal Commission",
      helpline_number: "1915",
      notes: "Free pre-litigation mediation available."
    }
  };

  it("approves responses with valid retrieved citations and attaches statutory disclaimer", () => {
    const result = validateAndSanitizeOutput(validResponse, passages);
    expect(result.isValid).toBe(true);
    expect(result.droppedCitationsCount).toBe(0);
    expect(result.sanitizedResponse.statutory_citations.length).toBe(1);
    expect(result.sanitizedResponse.uncertainty_notes).toContain("Disclaimer:");
    expect(result.sanitizedResponse.uncertainty_notes).toContain("not a court");
  });

  it("drops hallucinated citations not present in retrieved passages", () => {
    const responseWithHallucination: GroundedLegalResponse = {
      ...validResponse,
      statutory_citations: [
        {
          provision_id: "FABRICATED_ACT_S999",
          act_title: "Fictitious Indian Law Act, 2099",
          act_short: "FILA 2099",
          section_number: "999",
          section_heading: "Instant Victory Order",
          source_url: "https://fake.url"
        }
      ]
    };

    const result = validateAndSanitizeOutput(responseWithHallucination, passages);
    expect(result.droppedCitationsCount).toBe(1);
    expect(result.warnings.some(w => w.includes("FABRICATED_ACT_S999"))).toBe(true);
    // Since only citation was hallucinated, validator restores top retrieved provision
    expect(result.sanitizedResponse.statutory_citations[0].provision_id).toBe(passages[0].provision.provision_id);
  });

  it("neutralizes prohibited predictive claims giving false certainty to citizens", () => {
    const responseWithPredictiveClaims: GroundedLegalResponse = {
      ...validResponse,
      plain_summary: "You will definitely win this lawsuit against the company.",
      legal_analysis: "The court will guarantee bail and rule in your favor.",
      actionable_next_steps: [
        "File the case because you are guaranteed to win."
      ]
    };

    const result = validateAndSanitizeOutput(responseWithPredictiveClaims, passages);
    expect(result.flaggedPredictiveCount).toBeGreaterThanOrEqual(3);
    expect(result.sanitizedResponse.plain_summary).not.toContain("You will definitely win");
    expect(result.sanitizedResponse.legal_analysis).not.toContain("guarantee bail");
    expect(result.sanitizedResponse.actionable_next_steps[0]).not.toContain("guaranteed to win");
  });
});
