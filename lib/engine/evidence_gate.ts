import { EvidenceStatus, RetrievedPassage } from "../types";

export interface EvidenceGateResult {
  status: EvidenceStatus;
  passed: boolean;
  reasons: string[];
  relevance_score: number;
  transitional_guidance?: string;
  missing_facts: string[];
}

export const RELEVANCE_THRESHOLD = 0.35;
export const CRIMINAL_TRANSITION_DATE = new Date("2024-07-01");

export function evaluateEvidenceSufficiency(
  query: string,
  passages: RetrievedPassage[],
  incidentDateStr?: string,
  stateJurisdiction?: string
): EvidenceGateResult {
  const reasons: string[] = [];
  const missingFacts: string[] = [];

  if (passages.length === 0) {
    return {
      status: "INSUFFICIENT",
      passed: false,
      reasons: ["Zero relevant statutory provisions identified for this query."],
      relevance_score: 0,
      missing_facts: ["Specific legal dispute details", "Dispute category"]
    };
  }

  const topPassage = passages[0];
  const relevance = topPassage.hybrid_score;

  // 1. Relevance threshold check
  if (relevance < RELEVANCE_THRESHOLD) {
    return {
      status: "INSUFFICIENT",
      passed: false,
      reasons: [
        `Top statutory match (${topPassage.provision.act_short} §${topPassage.provision.section_number}) achieved relevance score ${relevance}, below the sufficiency threshold of ${RELEVANCE_THRESHOLD}.`
      ],
      relevance_score: relevance,
      missing_facts: ["Core transactional details", "Specific harm or loss alleged"]
    };
  }

  // 2. Statutory Savings Clause & Transition Check (BNS / IPC Cutoff)
  let transitionalGuidance: string | undefined = undefined;
  let status: EvidenceStatus = "SUFFICIENT";

  if (topPassage.provision.act_short === "BNS 2023" || topPassage.provision.act_short === "BNSS 2023") {
    if (incidentDateStr) {
      const parsedDate = new Date(incidentDateStr);
      if (!isNaN(parsedDate.getTime()) && parsedDate < CRIMINAL_TRANSITION_DATE) {
        status = "OUTDATED_LAW";
        reasons.push(
          `Incident reported on ${incidentDateStr} occurred prior to the July 1, 2024 commencement of new criminal laws.`
        );
        transitionalGuidance = 
          `Under Section 358 of BNS 2023 and Section 531 of BNSS 2023 (Repeal and Savings clauses), offences committed before July 1, 2024 continue to be investigated, prosecuted, and tried under the Indian Penal Code, 1860 (IPC) and Code of Criminal Procedure, 1973 (CrPC). The corresponding historical section is ${topPassage.provision.transition_mapping?.historical_section || "IPC"}.`;
      }
    } else {
      missingFacts.push("Incident date (crucial to confirm whether IPC 1860 or BNS 2023 applies under Section 358 savings clause)");
    }
  }

  // 3. State Jurisdiction Check for State Subjects
  if (/rent|tenancy|police\s+complaint/i.test(query) && !stateJurisdiction) {
    missingFacts.push("State of residence / dispute location (State Rent Control Acts and local Police Rules may apply)");
  }

  const passed = status === "SUFFICIENT" && relevance >= RELEVANCE_THRESHOLD;

  return {
    status,
    passed,
    reasons,
    relevance_score: relevance,
    transitional_guidance: transitionalGuidance,
    missing_facts: missingFacts
  };
}
