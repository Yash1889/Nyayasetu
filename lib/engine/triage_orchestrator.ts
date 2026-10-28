import { EmergencyContact, GroundedLegalResponse, TriageQuery, TriageResult } from "../types";
import { analyzeQueryRisk } from "./risk_router";
import { retrieveHybrid } from "./hybrid_retriever";
import { evaluateEvidenceSufficiency } from "./evidence_gate";
import { generateGroundedLegalResponse } from "./generator";
import { validateAndSanitizeOutput } from "./output_validator";
import emergencyContactsData from "../../data/emergency_contacts.json";

const emergencyContacts: EmergencyContact[] = emergencyContactsData as EmergencyContact[];

export async function runTriagePipeline(query: TriageQuery): Promise<TriageResult> {
  const startTime = Date.now();
  const trimmedQuery = (query.query || "").trim();

  if (!trimmedQuery) {
    return {
      route: "UNCERTAIN",
      assessed_context: "Civil_Other",
      evidence_status: "INSUFFICIENT",
      clarification_prompt: {
        issue: "Query is empty.",
        missing_elements: ["Factual narrative", "Parties involved", "Specific incident details"],
        suggested_questions: [
          "What happened?",
          "When and where did this event take place?",
          "Are you or anyone else currently in physical danger?"
        ]
      },
      latency_ms: Date.now() - startTime,
      provider_used: "NyayaSetu Pipeline Guard"
    };
  }

  // Step 1: Deterministic Risk Routing (Emergency & Safety Filter)
  const riskAnalysis = analyzeQueryRisk(trimmedQuery);

  if (riskAnalysis.route === "EMERGENCY") {
    // Select applicable contacts (112 universal, 181 women, 1098 child, 1930 cyber)
    const applicableContacts = emergencyContacts.filter(contact => {
      if (contact.number === "112") return true;
      if (contact.number === "181" && (riskAnalysis.context === "Personal_Safety" || /woman|wife|girl|female|domestic|husband/i.test(trimmedQuery))) return true;
      if (contact.number === "1098" && /child|minor|kid|daughter|son/i.test(trimmedQuery)) return true;
      if (contact.number === "1930" && riskAnalysis.context === "Cyber_Financial") return true;
      if (contact.number === "1090" && (query.state_jurisdiction === "Uttar Pradesh" || /up|lucknow|noida|kanpur/i.test(trimmedQuery))) return true;
      return false;
    });

    // Ensure at least 112 and 181 are present if list is small
    if (applicableContacts.length === 1 && applicableContacts[0].number === "112") {
      const whl = emergencyContacts.find(c => c.number === "181");
      if (whl) applicableContacts.push(whl);
    }

    return {
      route: "EMERGENCY",
      assessed_context: riskAnalysis.context,
      evidence_status: "SUFFICIENT",
      emergency_guidance: {
        alert_title: "IMMEDIATE PHYSICAL SAFETY PRIORITY",
        immediate_steps: [
          "Call the Universal Emergency Helpline 112 immediately or reach a safe public location.",
          "If you are experiencing domestic violence or abuse, dial 181 (Women Helpline) for shelter and police coordination.",
          "Do not share confidential location information on digital channels if your device or network is monitored.",
          "Use the Quick-Exit button (or press the Esc key) if someone approaches your screen."
        ],
        applicable_contacts: applicableContacts,
        quick_exit_url: "https://www.google.com"
      },
      latency_ms: Date.now() - startTime,
      provider_used: "NyayaSetu Deterministic Safety Router"
    };
  }

  // Handle ambiguous / overly brief queries before statutory retrieval
  if (riskAnalysis.route === "UNCERTAIN") {
    return {
      route: "UNCERTAIN",
      assessed_context: riskAnalysis.context,
      evidence_status: "INSUFFICIENT",
      clarification_prompt: {
        issue: "The dispute query is overly brief or ambiguous to reliably match statutory provisions.",
        missing_elements: [
          "Detailed factual narrative",
          "Parties involved",
          "Specific harm, breach, or loss suffered",
          "Incident date and location"
        ],
        suggested_questions: [
          "Can you describe what occurred in 2-3 sentences?",
          "When did this dispute happen?",
          "What specific relief or outcome are you seeking?"
        ]
      },
      latency_ms: Date.now() - startTime,
      provider_used: "NyayaSetu Risk Router (Ambiguity Guard)"
    };
  }

  // Step 2: Hybrid Statutory Retrieval
  const passages = retrieveHybrid(trimmedQuery, 5);

  // Step 3: Evidence Gate & Transitional Savings Check
  const gate = evaluateEvidenceSufficiency(
    trimmedQuery,
    passages,
    query.incident_date,
    query.state_jurisdiction
  );

  // If evidence is completely insufficient, prompt for clarification without hallucinating
  if (gate.status === "INSUFFICIENT") {
    return {
      route: "UNCERTAIN",
      assessed_context: riskAnalysis.context,
      evidence_status: "INSUFFICIENT",
      clarification_prompt: {
        issue: "The provided information does not contain sufficient factual specifics to identify governing statutory provisions.",
        missing_elements: gate.missing_facts.length > 0 ? gate.missing_facts : [
          "Date of incident",
          "Parties involved (e.g. consumer vs trader, tenant vs landlord)",
          "Specific remedy sought"
        ],
        suggested_questions: [
          "When did the transaction, dispute, or incident occur?",
          "Do you have a written agreement, receipt, invoice, or formal communication?",
          "Which State or Union Territory did this take place in?"
        ]
      },
      latency_ms: Date.now() - startTime,
      provider_used: "NyayaSetu Evidence Gate"
    };
  }

  // Step 4: Grounded Legal Response Generation
  const genOutput = await generateGroundedLegalResponse({
    query: trimmedQuery,
    passages,
    context_domain: riskAnalysis.context,
    risk_level: riskAnalysis.route,
    transitional_note: gate.transitional_guidance,
    missing_facts: gate.missing_facts
  });

  // Step 5: Output Validation & Citation Guard
  const validation = validateAndSanitizeOutput(genOutput.response, passages);

  return {
    route: riskAnalysis.route,
    assessed_context: riskAnalysis.context,
    evidence_status: gate.status,
    grounded_response: validation.sanitizedResponse,
    retrieved_passages: passages,
    latency_ms: Date.now() - startTime,
    provider_used: genOutput.provider
  };
}
