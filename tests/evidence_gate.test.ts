import { describe, it, expect } from "vitest";
import { evaluateEvidenceSufficiency } from "@/lib/engine/evidence_gate";
import { hybridRetrieve } from "@/lib/engine/hybrid_retriever";
import { RetrievedPassage } from "@/lib/types";

describe("EvidenceGate - Relevance Threshold & Savings Clause Evaluation", () => {
  it("rejects queries with zero retrieved passages as INSUFFICIENT", () => {
    const result = evaluateEvidenceSufficiency("random meaningless query", []);
    expect(result.status).toBe("INSUFFICIENT");
    expect(result.passed).toBe(false);
    expect(result.relevance_score).toBe(0);
  });

  it("identifies offences occurring prior to July 1, 2024 as OUTDATED_LAW and applies Section 358 savings clause", () => {
    const passages = hybridRetrieve("assault causing grievous hurt with weapon", 3);
    const incidentDatePreTransition = "2024-02-15"; // Before July 1, 2024

    const result = evaluateEvidenceSufficiency(
      "assault causing grievous hurt with weapon",
      passages,
      incidentDatePreTransition
    );

    // If top match was BNS, it must flag OUTDATED_LAW due to Section 358 savings clause
    if (passages[0].provision.act_short.startsWith("BNS")) {
      expect(result.status).toBe("OUTDATED_LAW");
      expect(result.transitional_guidance).toBeDefined();
      expect(result.transitional_guidance).toContain("Section 358");
      expect(result.transitional_guidance).toContain("Indian Penal Code, 1860 (IPC)");
    }
  });

  it("approves post-July 1, 2024 criminal incidents as SUFFICIENT", () => {
    const passages = hybridRetrieve("cheating and dishonest inducement", 3);
    const incidentDatePostTransition = "2024-08-20"; // After July 1, 2024

    const result = evaluateEvidenceSufficiency(
      "cheating and dishonest inducement",
      passages,
      incidentDatePostTransition
    );

    expect(result.status).toBe("SUFFICIENT");
    expect(result.passed).toBe(true);
  });

  it("flags missing incident date as a missing fact when BNS is retrieved", () => {
    const passages = hybridRetrieve("cheating and dishonestly inducing delivery of property", 3);
    const result = evaluateEvidenceSufficiency(
      "cheating and dishonestly inducing delivery of property",
      passages,
      undefined // No incident date
    );

    if (passages[0].provision.act_short.startsWith("BNS")) {
      expect(result.missing_facts.some(f => f.includes("Incident date"))).toBe(true);
    }
  });

  it("marks low relevance passages below threshold as INSUFFICIENT", () => {
    const dummyLowPassage: RetrievedPassage = {
      provision: passages_sample[0],
      bm25_score: 0.1,
      dense_score: 0.1,
      hybrid_score: 0.20 // Below 0.35 threshold
    };

    const result = evaluateEvidenceSufficiency("unrelated query", [dummyLowPassage]);
    expect(result.status).toBe("INSUFFICIENT");
    expect(result.passed).toBe(false);
  });
});

const passages_sample = hybridRetrieve("consumer warranty", 1).map(p => p.provision);
