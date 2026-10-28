import { GroundedLegalResponse, RetrievedPassage, SourcedCitation } from "../types";

export interface ValidationResult {
  isValid: boolean;
  sanitizedResponse: GroundedLegalResponse;
  droppedCitationsCount: number;
  flaggedPredictiveCount: number;
  warnings: string[];
}

// Prohibited deterministic predictive strings that give false certainty to litigants
const FORBIDDEN_PREDICTIVE_PATTERNS: RegExp[] = [
  /\b(you\s+will\s+(definitely|certainly|surely)\s+win)\b/gi,
  /\b(the\s+court\s+will\s+(guarantee|definitely|certainly)?.*rule\s+in\s+your\s+favo[u]?r)\b/gi,
  /\b(100%\s+chance\s+of\s+success)\b/gi,
  /\b(guarantee[d]?\s+(bail|acquittal|victory|relief|remedy))\b/gi,
  /\b(the\s+judge\s+will\s+rule\s+in\s+your\s+favo[u]?r)\b/gi,
  /\b(you\s+are\s+guaranteed\s+to\s+win)\b/gi,
  /\b(there\s+is\s+no\s+chance\s+you\s+can\s+lose)\b/gi
];

const MANDATORY_DISCLAIMER = 
  "Disclaimer: NyayaSetu provides evidence-grounded legal information and pre-litigation triage for civic literacy. It is not a court, police authority, or law firm, and does not provide formal legal representation or guarantee any judicial outcome. For case-specific legal action, consult a licensed advocate or visit your District Legal Services Authority (DLSA).";

export function validateAndSanitizeOutput(
  rawResponse: GroundedLegalResponse,
  retrievedPassages: RetrievedPassage[]
): ValidationResult {
  const warnings: string[] = [];
  let droppedCitationsCount = 0;
  let flaggedPredictiveCount = 0;

  // 1. Validate Citations against actually retrieved provisions
  const allowedProvisionIds = new Set(retrievedPassages.map(p => p.provision.provision_id));
  const validCitations: SourcedCitation[] = [];

  for (const citation of rawResponse.statutory_citations) {
    if (allowedProvisionIds.has(citation.provision_id)) {
      validCitations.push(citation);
    } else {
      droppedCitationsCount++;
      warnings.push(`Dropped hallucinated citation: ${citation.act_short} §${citation.section_number} (${citation.provision_id})`);
    }
  }

  // If LLM dropped all citations or hallucinated all, fall back to the top retrieved passage
  if (validCitations.length === 0 && retrievedPassages.length > 0) {
    const top = retrievedPassages[0].provision;
    validCitations.push({
      provision_id: top.provision_id,
      act_title: top.act_title,
      act_short: top.act_short,
      section_number: top.section_number,
      section_heading: top.section_heading,
      source_url: top.source_url,
      historical_reference: top.transition_mapping?.historical_section
    });
    warnings.push(`Restored top retrieved provision citation (${top.act_short} §${top.section_number}) after zero valid citations returned.`);
  }

  // 2. Scan and Neutralize Prohibited Predictive Assertions
  let sanitizedSummary = rawResponse.plain_summary;
  let sanitizedAnalysis = rawResponse.legal_analysis;
  const sanitizedSteps = [...rawResponse.actionable_next_steps];

  for (const pattern of FORBIDDEN_PREDICTIVE_PATTERNS) {
    if (pattern.test(sanitizedSummary)) {
      sanitizedSummary = sanitizedSummary.replace(pattern, "legal precedent suggests reasonable grounds to examine");
      flaggedPredictiveCount++;
      warnings.push("Neutralized predictive outcome claim in plain_summary.");
    }
    if (pattern.test(sanitizedAnalysis)) {
      sanitizedAnalysis = sanitizedAnalysis.replace(pattern, "such claims are subject to judicial discretion and standard of proof");
      flaggedPredictiveCount++;
      warnings.push("Neutralized predictive outcome claim in legal_analysis.");
    }
    for (let i = 0; i < sanitizedSteps.length; i++) {
      if (pattern.test(sanitizedSteps[i])) {
        sanitizedSteps[i] = sanitizedSteps[i].replace(pattern, "seek legal advice regarding this prospective remedy");
        flaggedPredictiveCount++;
        warnings.push("Neutralized predictive outcome claim in actionable_next_steps.");
      }
    }
  }

  // 3. Ensure uncertainty notes contain statutory/disclaimer safeguards
  let uncertainty = rawResponse.uncertainty_notes || "";
  if (!uncertainty.includes("Disclaimer:") && !uncertainty.includes("not a court")) {
    uncertainty = uncertainty.trim().length > 0 
      ? `${uncertainty}\n\n${MANDATORY_DISCLAIMER}` 
      : MANDATORY_DISCLAIMER;
  }

  const sanitizedResponse: GroundedLegalResponse = {
    plain_summary: sanitizedSummary,
    legal_analysis: sanitizedAnalysis,
    statutory_citations: validCitations,
    actionable_next_steps: sanitizedSteps,
    uncertainty_notes: uncertainty,
    professional_referral: rawResponse.professional_referral
  };

  return {
    isValid: droppedCitationsCount === 0 && flaggedPredictiveCount === 0,
    sanitizedResponse,
    droppedCitationsCount,
    flaggedPredictiveCount,
    warnings
  };
}
