import { GroundedLegalResponse, RetrievedPassage, SourcedCitation } from "../types";
import { resolveProviderConfig } from "../server/provider_config";

// ─── Public Interfaces ────────────────────────────────────────────────────────

export interface GenerationInput {
  query: string;
  passages: RetrievedPassage[];
  context_domain: string;
  risk_level: string;
  transitional_note?: string;
  missing_facts?: string[];
}

export interface GenerationOutput {
  response: GroundedLegalResponse;
  /** Human-readable label: never includes raw API keys */
  provider: string;
  model: string;
  generation_latency_ms: number;
}

// ─── System Prompt (shared across providers) ─────────────────────────────────

const GROUNDING_SYSTEM_PROMPT = `You are NyayaSetu, an evidence-grounded legal information assistant for Indian citizens seeking pre-litigation guidance.

STRICT RULES (violation causes your output to be rejected):
1. Ground EVERY legal claim in one of the provided <provision> elements. Never cite a law or section not present in the context.
2. Populate statutory_citations using ONLY provision_id values from the context. Do not fabricate IDs.
3. Do NOT predict court outcomes. Never write "you will win", "the court will rule in your favour", "guaranteed bail", or similar deterministic predictions.
4. Do NOT provide formal legal advice or represent yourself as a lawyer.
5. Acknowledge relevant uncertainty: incident date, jurisdiction, or missing facts must be noted in uncertainty_notes.
6. All source_url values must be copied exactly from the matching <provision> element.

OUTPUT FORMAT — respond with a single valid JSON object containing these exact fields:
{
  "plain_summary": "string — civic plain-language summary in 2-3 sentences",
  "legal_analysis": "string — statutory analysis grounded in provided provisions",
  "statutory_citations": [
    {
      "provision_id": "string — exact id attribute from provision element",
      "act_title": "string",
      "act_short": "string",
      "section_number": "string",
      "section_heading": "string",
      "source_url": "string — exact source_url from provision element",
      "historical_reference": "string or null — historical IPC/CrPC mapping if relevant"
    }
  ],
  "actionable_next_steps": ["string — concrete pre-litigation step"],
  "uncertainty_notes": "string — factual gaps, jurisdictional limits, and standard disclaimer",
  "professional_referral": {
    "type": "DLSA | POLICE_STATION | CONSUMER_COMMISSION | CYBER_PORTAL | RTI_OFFICER",
    "authority_name": "string",
    "helpline_number": "string",
    "portal_url": "string or null",
    "notes": "string"
  }
}`;

// ─── Context XML Builder ──────────────────────────────────────────────────────

function buildProvisionContextXml(passages: RetrievedPassage[]): string {
  return passages
    .map(
      (p) =>
        `<provision id="${p.provision.provision_id}" act="${p.provision.act_title}" ` +
        `section="${p.provision.section_number}" heading="${p.provision.section_heading}" ` +
        `source_url="${p.provision.source_url}">\n` +
        `Summary: ${p.provision.plain_summary}\n` +
        `Statutory Text: ${p.provision.verbatim_text}\n` +
        (p.provision.transition_mapping?.historical_section &&
        p.provision.transition_mapping.historical_section !== "None"
          ? `Historical Reference: ${p.provision.transition_mapping.historical_act} — ${p.provision.transition_mapping.historical_section}\n`
          : "") +
        `</provision>`
    )
    .join("\n\n");
}

function buildUserPrompt(input: GenerationInput, contextXml: string): string {
  let prompt = `Dispute Query: ${input.query}\n\n`;
  prompt += `Legal Domain: ${input.context_domain}\n`;
  prompt += `Risk Level: ${input.risk_level}\n`;
  if (input.transitional_note) {
    prompt += `\nCriminal Law Transitional Note: ${input.transitional_note}\n`;
  }
  if (input.missing_facts && input.missing_facts.length > 0) {
    prompt += `\nIdentified Missing Facts: ${input.missing_facts.join("; ")}\n`;
  }
  prompt += `\nRetrieved Statutory Provisions:\n${contextXml}\n\n`;
  prompt += `Generate the grounded JSON response now. Only use provision IDs from the context above.`;
  return prompt;
}

// ─── Groq Generation (OpenAI-compatible endpoint) ────────────────────────────

async function callGroqAPI(
  input: GenerationInput,
  model: string,
  apiKey: string,
  endpoint: string
): Promise<GroundedLegalResponse> {
  const contextXml = buildProvisionContextXml(input.passages);
  const userPrompt = buildUserPrompt(input, contextXml);

  const payload = {
    model,
    messages: [
      { role: "system", content: GROUNDING_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,      // Low temperature for deterministic legal grounding
    max_tokens: 2000,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "NyayaSetu/1.0 (Indian Legal-Tech Research)",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000), // 20s hard timeout
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "(unreadable)");
    throw new Error(`Groq API error ${res.status}: ${errorBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const rawContent: string = data?.choices?.[0]?.message?.content ?? "";
  if (!rawContent) throw new Error("Groq API returned empty content");

  let parsed: Partial<GroundedLegalResponse>;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error("Groq API returned non-JSON content");
  }

  // Enforce shape — reject incomplete responses rather than silently accept
  if (
    typeof parsed.plain_summary !== "string" ||
    !Array.isArray(parsed.statutory_citations) ||
    !Array.isArray(parsed.actionable_next_steps)
  ) {
    throw new Error("Groq response missing required fields");
  }

  return parsed as GroundedLegalResponse;
}

// ─── Gemini Generation (kept for future provider support) ────────────────────

async function callGeminiAPI(
  input: GenerationInput,
  model: string,
  apiKey: string
): Promise<GroundedLegalResponse> {
  const contextXml = buildProvisionContextXml(input.passages);
  const userPrompt = buildUserPrompt(input, contextXml);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        parts: [
          {
            text:
              GROUNDING_SYSTEM_PROMPT + "\n\n" + userPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 2000,
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "(unreadable)");
    throw new Error(`Gemini API error ${res.status}: ${errorBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const rawContent: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!rawContent) throw new Error("Gemini API returned empty content");

  let parsed: Partial<GroundedLegalResponse>;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error("Gemini API returned non-JSON content");
  }

  if (
    typeof parsed.plain_summary !== "string" ||
    !Array.isArray(parsed.statutory_citations)
  ) {
    throw new Error("Gemini response missing required fields");
  }

  return parsed as GroundedLegalResponse;
}

// ─── Deterministic Offline Fallback ──────────────────────────────────────────

function buildDeterministicGroundedResponse(input: GenerationInput): GroundedLegalResponse {
  const primaryPassage =
    input.passages.length > 0 ? input.passages[0].provision : null;
  const secondaryPassage =
    input.passages.length > 1 ? input.passages[1].provision : null;

  // Build citations from actually-retrieved passages only
  const citations: SourcedCitation[] = input.passages.slice(0, 3).map((p) => ({
    provision_id: p.provision.provision_id,
    act_title: p.provision.act_title,
    act_short: p.provision.act_short,
    section_number: p.provision.section_number,
    section_heading: p.provision.section_heading,
    source_url: p.provision.source_url,
    historical_reference:
      p.provision.transition_mapping?.historical_section !== "None"
        ? p.provision.transition_mapping?.historical_section
        : undefined,
  }));

  let plainSummary: string;
  let legalAnalysis: string;
  let steps: string[];
  let referral: GroundedLegalResponse["professional_referral"] = {
    type: "DLSA",
    authority_name: "District Legal Services Authority (DLSA)",
    helpline_number: "15100",
    notes:
      "Contact your nearest District Legal Services Authority for free preliminary legal consultation.",
  };

  if (
    input.context_domain === "Consumer" ||
    /consumer|refund|product|defective|warranty|seller|delivery/i.test(input.query)
  ) {
    plainSummary =
      "Under the Consumer Protection Act, 2019, a seller or service provider who delivers a defective product or inadequate service may be held liable for deficiency. The District Consumer Disputes Redressal Commission provides an accessible and cost-effective dispute resolution forum.";
    legalAnalysis = primaryPassage
      ? `${primaryPassage.act_short} §${primaryPassage.section_number} (${primaryPassage.section_heading}) establishes the governing standard. ${primaryPassage.plain_summary}${secondaryPassage ? ` Additionally, ${secondaryPassage.act_short} §${secondaryPassage.section_number} provides supplementary procedural grounds.` : ""}`
      : "The Consumer Protection Act, 2019 provides statutory remedies for deficiency in service and product quality.";
    steps = [
      "Preserve all purchase invoices, warranty cards, delivery receipts, and written communications with the seller.",
      "Issue a formal written complaint notice to the seller or manufacturer by registered post, demanding repair, replacement, or refund within 15 days.",
      "If unresolved, file a complaint before the District Consumer Disputes Redressal Commission where the dispute value is up to ₹1 crore (no court fees for claims up to ₹5 lakh).",
      "Alternatively, use the National Consumer Helpline portal at consumerhelpline.gov.in or call 1915.",
    ];
    referral = {
      type: "CONSUMER_COMMISSION",
      authority_name: "District Consumer Disputes Redressal Commission",
      helpline_number: "1915",
      portal_url: "https://consumerhelpline.gov.in",
      notes:
        "The National Consumer Helpline (1915) provides pre-litigation guidance and can facilitate mediated settlement before formal filing.",
    };
  } else if (
    input.context_domain === "Cyber_Financial" ||
    /cyber|fraud|otp|scam|bank|upi|phishing|deducted|hacked/i.test(input.query)
  ) {
    plainSummary =
      "Digital financial fraud and unauthorized account debits are strictly punishable offences under the Information Technology Act, 2000 and the Bharatiya Nyaya Sanhita, 2023. Immediate reporting to the National Cyber Financial Fraud Helpline (1930) significantly improves the probability of freezing stolen funds.";
    legalAnalysis = primaryPassage
      ? `${primaryPassage.act_short} §${primaryPassage.section_number} (${primaryPassage.section_heading}): ${primaryPassage.plain_summary}${secondaryPassage ? ` ${secondaryPassage.act_short} §${secondaryPassage.section_number} further establishes ${secondaryPassage.section_heading.toLowerCase()}.` : ""} RBI guidelines also mandate zero liability for consumers who report unauthorized electronic transactions to their bank within three working days.`
      : "The IT Act 2000 and BNS 2023 together cover identity theft, cheating by personation, and online financial fraud.";
    steps = [
      "Immediately call 1930 (National Cyber Financial Fraud Helpline) and notify your bank to block the compromised account, card, or UPI handle — the faster you report, the higher the chance of a fund freeze.",
      "File a formal cybercrime complaint at the official portal cybercrime.gov.in with transaction records, screenshots, and bank statements.",
      "Obtain and preserve a certified bank statement showing the unauthorized debit — this is the primary evidence document.",
      "Request an FIR at your nearest police station citing Section 66C / 66D of the IT Act, 2000.",
    ];
    referral = {
      type: "CYBER_PORTAL",
      authority_name: "Indian Cyber Crime Coordination Centre (I4C)",
      helpline_number: "1930",
      portal_url: "https://cybercrime.gov.in",
      notes:
        "Report within the golden hour — 1930 can trigger an inter-bank freeze before stolen funds are withdrawn.",
    };
  } else if (
    input.context_domain === "Property_Tenancy" ||
    /deposit|landlord|tenant|rent|flat|evict|lease/i.test(input.query)
  ) {
    plainSummary =
      "Under the Transfer of Property Act, 1882 and applicable tenancy law, a landlord is legally obligated to return the undisputed portion of a security deposit upon lawful vacation, subject to verifiable deductions agreed in writing. Forcible eviction without due process is unlawful.";
    legalAnalysis = primaryPassage
      ? `${primaryPassage.act_short} §${primaryPassage.section_number} (${primaryPassage.section_heading}): ${primaryPassage.plain_summary}${secondaryPassage ? ` ${secondaryPassage.act_short} §${secondaryPassage.section_number} may also apply if criminal force or wrongful restraint is used.` : ""}`
      : "TPA 1882 §108(B) governs mutual obligations between lessor and lessee, including return of the security deposit.";
    steps = [
      "Collect and preserve the rental agreement, bank transfer proof of deposit payment, and any move-out inspection records or acknowledgements.",
      "Send a formal demand notice to the landlord by registered post specifying the amount and demanding refund within 15 days.",
      "If refused, file a civil suit for recovery before the appropriate Rent Authority, Civil Court, or District Consumer Commission (if rental is from a builder/developer).",
    ];
    referral = {
      type: "DLSA",
      authority_name: "District Legal Services Authority (DLSA)",
      helpline_number: "15100",
      notes:
        "A DLSA panel advocate can provide free initial guidance and assist in drafting the demand notice.",
    };
  } else if (/cheque|bounce|dishonour|138/i.test(input.query)) {
    plainSummary =
      "Dishonour of a cheque due to insufficiency of funds is a criminal offence under Section 138 of the Negotiable Instruments Act, 1881, carrying imprisonment up to two years or a fine up to twice the cheque amount, or both.";
    legalAnalysis =
      "NI Act 1881 §138 mandates a strict four-step procedural ladder: (1) Cheque presented within validity period (3 months); (2) Bank return memo received; (3) Statutory demand notice sent to drawer within 30 days of the memo; (4) Drawer fails to pay within 15 days of notice receipt. A criminal complaint must then be filed within 30 days under §142. Missing any deadline extinguishes the remedy.";
    steps = [
      "Secure the original bounced cheque and the official bank return memo stating the reason for dishonour — these two documents are mandatory evidence.",
      "Serve a statutory legal demand notice on the cheque drawer by registered post within exactly 30 days of receiving the bank memo.",
      "Allow 15 days from delivery of notice. If the amount remains unpaid on day 16, file a criminal complaint before the Judicial Magistrate First Class within 30 days.",
    ];
    referral = {
      type: "DLSA",
      authority_name: "District Legal Services Authority / Judicial Magistrate",
      helpline_number: "15100",
      notes: "A civil pre-trial mediation via Lok Adalat can also be attempted for faster settlement.",
    };
  } else {
    plainSummary = primaryPassage
      ? `Under ${primaryPassage.act_short}, Section ${primaryPassage.section_number} (${primaryPassage.section_heading}) establishes the applicable statutory standard. ${primaryPassage.plain_summary}`
      : "Under applicable Indian law, statutory protections and procedural remedies are available for the described dispute.";
    legalAnalysis = primaryPassage
      ? `${primaryPassage.act_short} §${primaryPassage.section_number} establishes the governing legal standard and applicable consequences. ${secondaryPassage ? `Additionally, ${secondaryPassage.act_short} §${secondaryPassage.section_number} (${secondaryPassage.section_heading}) provides complementary procedural grounds.` : ""}`
      : "The applicable statutory framework provides specific procedural rights enforceable before civil or judicial authorities.";
    steps = [
      "Preserve all relevant contemporaneous records — notices, receipts, agreements, invoices, and electronic communications.",
      "Obtain preliminary legal guidance from the nearest District Legal Services Authority (DLSA) clinic (free for all).",
      "Establish applicable limitation deadlines before initiating any formal legal proceedings.",
    ];
  }

  const uncertaintyNotes = input.transitional_note
    ? input.transitional_note
    : input.missing_facts && input.missing_facts.length > 0
    ? `Missing facts that could affect applicable law: ${input.missing_facts.join("; ")}. State-specific rules and local court jurisdiction may also apply. Consult a qualified advocate for case-specific representation.`
    : "State-specific rules, local court jurisdiction, and individual case merits may significantly affect the outcome. NyayaSetu provides evidence-grounded legal information only. Consult a licensed advocate or visit your District Legal Services Authority (DLSA) for formal legal representation.";

  return {
    plain_summary: plainSummary,
    legal_analysis: legalAnalysis,
    statutory_citations: citations,
    actionable_next_steps: steps,
    uncertainty_notes: uncertaintyNotes,
    professional_referral: referral,
  };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function generateGroundedLegalResponse(
  input: GenerationInput
): Promise<GenerationOutput> {
  const startTime = Date.now();
  const config = resolveProviderConfig();

  // ── Attempt live provider generation ──────────────────────────────────────
  if (config.isConfigured && config.apiKey) {
    try {
      let response: GroundedLegalResponse;
      let providerLabel: string;

      if (config.provider === "groq") {
        let actualModel = config.model;
        try {
          response = await callGroqAPI(input, config.model, config.apiKey, config.groqEndpoint);
        } catch (primaryErr) {
          // If primary model encounters an error and is not qwen/qwen3.8-27b, try qwen/qwen3.8-27b as secondary high-speed fallback
          if (config.model !== "qwen/qwen3.8-27b") {
            console.warn(`[NyayaSetu] Primary Groq model (${config.model}) failed, attempting fallback model (qwen/qwen3.8-27b):`, primaryErr);
            response = await callGroqAPI(input, "qwen/qwen3.8-27b", config.apiKey, config.groqEndpoint);
            actualModel = "qwen/qwen3.8-27b";
          } else {
            throw primaryErr;
          }
        }
        providerLabel = `Groq API (${actualModel})`;
        return {
          response,
          provider: providerLabel,
          model: actualModel,
          generation_latency_ms: Date.now() - startTime,
        };
      } else {
        response = await callGeminiAPI(input, config.model, config.apiKey);
        providerLabel = `Google Gemini API (${config.model})`;
        return {
          response,
          provider: providerLabel,
          model: config.model,
          generation_latency_ms: Date.now() - startTime,
        };
      }
    } catch (err) {
      // Log server-side only; never expose API key or error detail to response
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `[NyayaSetu] ${config.provider} API call failed — falling back to deterministic grounded engine:`,
        message
      );
    }
  }

  // ── Deterministic Grounded Fallback ────────────────────────────────────────
  const fallbackResponse = buildDeterministicGroundedResponse(input);

  return {
    response: fallbackResponse,
    provider: "NyayaSetu Deterministic Grounded Engine (Offline Fallback)",
    model: "deterministic-statute-synthesizer-v1",
    generation_latency_ms: Date.now() - startTime,
  };
}
