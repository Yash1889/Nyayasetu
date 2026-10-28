"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Scale, 
  Send, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  ExternalLink, 
  Phone, 
  Clock, 
  Cpu, 
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import { TriageQuery, TriageResult, LegalProvision } from "@/lib/types";
import { StatutoryDrawer } from "@/components/StatutoryDrawer";
import seedProvisionsData from "@/data/seed_provisions.json";

const seedProvisions: LegalProvision[] = seedProvisionsData as LegalProvision[];

const INDIAN_STATES = [
  "National / Central Jurisdiction",
  "Delhi (NCT)",
  "Uttar Pradesh",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Telangana",
  "Kerala",
  "Madhya Pradesh",
  "Bihar",
  "Punjab",
  "Haryana"
];

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [incidentDate, setIncidentDate] = useState("");
  const [stateJurisdiction, setStateJurisdiction] = useState(INDIAN_STATES[0]);
  const [isAnonymous, setIsAnonymous] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selected provision for slide-over drawer
  const [activeProvision, setActiveProvision] = useState<LegalProvision | null>(null);

  useEffect(() => {
    if (initialQuery && !result && !loading) {
      handleTriage(initialQuery);
    }
  }, [initialQuery]);

  const handleTriage = async (customQuery?: string) => {
    const textToSubmit = (customQuery || query).trim();
    if (!textToSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const payload: TriageQuery = {
        query: textToSubmit,
        incident_date: incidentDate || undefined,
        state_jurisdiction: stateJurisdiction === INDIAN_STATES[0] ? undefined : stateJurisdiction,
        is_anonymous: isAnonymous
      };

      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data: TriageResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error("Triage execution error:", err);
      setError("Unable to process triage request. Please verify connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatuteDrawer = (provisionId: string) => {
    const found = seedProvisions.find(p => p.provision_id === provisionId);
    if (found) {
      setActiveProvision(found);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Context */}
      <div className="border-b border-paper-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink-deep flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-legal-gold" />
            <span>Statutory Triage Assistant</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Grounded pre-litigation triage analyzing dispute facts against verified Central Acts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-medium border border-emerald-300">
            Seed Corpus: 16 Provisions
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-medium">
            Profile 1 CPU-First
          </span>
        </div>
      </div>

      {/* Main Grid: Left Column Form, Right Column Live Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Query & Context Controls */}
        <div className="lg:col-span-5 bg-white border border-paper-border rounded-lg p-5 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-deep mb-1.5">
              Describe Your Factual Dispute
            </label>
            <textarea
              rows={5}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="State key facts: what was agreed, what breach or loss occurred, amounts involved, and current status..."
              className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded focus:ring-2 focus:ring-ink-deep focus:border-transparent placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Incident Date Picker (Crucial for Section 358 savings clause) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-legal-gold" />
                <span>Incident Date</span>
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-700 bg-white"
                title="Date incident occurred (determines BNS 2023 vs IPC 1860 applicability)"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                July 1, 2024 cutoff for BNS
              </span>
            </div>

            {/* Jurisdiction Dropdown */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                State Jurisdiction
              </label>
              <select
                value={stateJurisdiction}
                onChange={(e) => setStateJurisdiction(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-700 bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Local rent/police rules
              </span>
            </div>
          </div>

          {/* Privacy and Anonymous Checkbox */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              id="anon-check"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-0.5 rounded text-legal-green focus:ring-legal-green"
            />
            <label htmlFor="anon-check" className="text-slate-600 leading-normal">
              <strong>Anonymous session</strong> (Do not persist query in local browser cache; server logs do not record IP addresses).
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleTriage()}
              disabled={loading || !query.trim()}
              className="flex-1 py-2.5 px-4 bg-ink-deep hover:bg-ink-navy disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Evaluating Statutes...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute Triage</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setQuery("");
                setResult(null);
                setError(null);
              }}
              className="p-2.5 text-slate-500 hover:text-slate-800 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
              title="Reset query"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Sample quick fill buttons */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Test Cases:
            </span>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setQuery("Online merchant delivered a damaged refrigerator and customer service refuses replacement or refund under warranty.");
                  setIncidentDate("2024-08-15");
                }}
                className="w-full text-left p-1.5 text-xs text-slate-700 hover:bg-amber-50 rounded border border-slate-200 hover:border-amber-300 transition-colors block"
              >
                1. Consumer Dispute (Deficiency in service)
              </button>
              <button
                onClick={() => {
                  setQuery("Landlord locked the apartment and is refusing to return my security deposit of 80,000 rupees after moving out.");
                  setIncidentDate("2024-09-01");
                }}
                className="w-full text-left p-1.5 text-xs text-slate-700 hover:bg-amber-50 rounded border border-slate-200 hover:border-amber-300 transition-colors block"
              >
                2. Tenancy Dispute (Security deposit withholding)
              </button>
              <button
                onClick={() => {
                  setQuery("I received a fake SMS asking to update KYC. I clicked the link and 45,000 rupees was debited from my bank account.");
                  setIncidentDate("2024-10-01");
                }}
                className="w-full text-left p-1.5 text-xs text-slate-700 hover:bg-amber-50 rounded border border-slate-200 hover:border-amber-300 transition-colors block"
              >
                3. Cyber Financial Fraud (Phishing & Cheating)
              </button>
              <button
                onClick={() => {
                  setQuery("Cheque of 50,000 rupees given for loan repayment bounced due to insufficient funds. Bank memo received yesterday.");
                  setIncidentDate("2024-07-20");
                }}
                className="w-full text-left p-1.5 text-xs text-slate-700 hover:bg-amber-50 rounded border border-slate-200 hover:border-amber-300 transition-colors block"
              >
                4. Negotiable Instruments (Section 138 Dishonour)
              </button>
              <button
                onClick={() => {
                  setQuery("Accused attacked shopkeeper on January 10, 2024 and caused severe head injuries with an iron rod.");
                  setIncidentDate("2024-01-10");
                }}
                className="w-full text-left p-1.5 text-xs text-slate-700 hover:bg-red-50 rounded border border-slate-200 hover:border-red-300 transition-colors block text-red-900 font-medium"
              >
                5. Criminal Transition Case (Pre-July 2024 Savings Test)
              </button>
              <button
                onClick={() => {
                  setQuery("Help me now my husband is beating me with a knife save me call police");
                  setIncidentDate("2024-10-28");
                }}
                className="w-full text-left p-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-300 transition-colors block font-bold"
              >
                6. Emergency Active Assault Cry
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Triage Result & Statutory Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs sm:text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="p-8 bg-white border border-paper-border rounded-lg text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-ink-deep">
                Ready to Evaluate Legal Scenario
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Enter your dispute description on the left or click any test scenario. The engine will perform hybrid statutory retrieval against primary legislation, check evidence sufficiency, and synthesize verifiable next steps.
              </p>
            </div>
          )}

          {loading && (
            <div className="p-10 bg-white border border-paper-border rounded-lg text-center space-y-4 shadow-xs">
              <div className="w-10 h-10 border-3 border-ink-deep border-t-legal-gold rounded-full animate-spin mx-auto"></div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-ink-deep">
                  Evaluating Statutory Provisions...
                </h3>
                <p className="text-xs text-slate-500">
                  Executing BM25 lexical + dense semantic matching and transitional savings validation.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Route & Urgency Banner */}
              <div className={`p-4 rounded-lg border shadow-xs ${
                result.route === "EMERGENCY" 
                  ? "bg-red-50 border-red-300 text-red-900"
                  : result.route === "HIGH_RISK"
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : result.route === "UNCERTAIN"
                  ? "bg-yellow-50 border-yellow-300 text-yellow-900"
                  : "bg-emerald-50 border-emerald-300 text-emerald-950"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.route === "EMERGENCY" ? (
                      <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
                    ) : result.route === "HIGH_RISK" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                    ) : result.route === "UNCERTAIN" ? (
                      <HelpCircle className="w-5 h-5 text-yellow-700 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    )}
                    <span className="font-serif font-bold text-sm tracking-wide">
                      Triage Assessment: {result.route}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-white/80 font-medium border border-current">
                      Domain: {result.assessed_context}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/80 font-medium border border-current">
                      Evidence: {result.evidence_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* EMERGENCY VIEW: Direct Help & Fast Contacts */}
              {result.route === "EMERGENCY" && result.emergency_guidance && (
                <div className="p-6 bg-white border-2 border-red-600 rounded-lg shadow-md space-y-5">
                  <div className="border-b border-red-100 pb-3">
                    <h3 className="text-lg font-serif font-black text-red-700">
                      {result.emergency_guidance.alert_title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Our deterministic risk filter identified an active safety threat. Immediate emergency routing is engaged.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                      Immediate Protective Steps:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {result.emergency_guidance.immediate_steps.map((st, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Emergency Helpline Cards */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                      Verified Emergency Helplines (Direct Dial):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.emergency_guidance.applicable_contacts.map((c) => (
                        <div key={c.number} className="p-3 bg-red-50/70 border border-red-200 rounded flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-lg font-black text-red-800 tracking-tight">
                                {c.number}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-semibold border border-red-200">
                                {c.badge}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900">{c.name}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5">{c.description}</p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Scope: {c.scope} &bull; Auth: {c.authority}
                            </p>
                          </div>
                          <a
                            href={c.direct_dial}
                            className="mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call {c.number} Now</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CLARIFICATION PROMPT VIEW (When evidence is insufficient) */}
              {result.clarification_prompt && (
                <div className="p-6 bg-white border border-yellow-300 rounded-lg shadow-xs space-y-4">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Additional Facts Required to Determine Applicable Law
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {result.clarification_prompt.issue}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200 text-xs">
                    <span className="font-semibold text-amber-900 block mb-1">Missing Elements:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      {result.clarification_prompt.missing_elements.map((elem, idx) => (
                        <li key={idx}>{elem}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs space-y-1.5">
                    <span className="font-semibold text-slate-800 block">Suggested Clarifying Questions:</span>
                    {result.clarification_prompt.suggested_questions.map((q, idx) => (
                      <p key={idx} className="text-slate-600 pl-2 border-l-2 border-amber-400">
                        {q}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* GROUNDED LEGAL BREAKDOWN (When evidence status is sufficient or outdated_law) */}
              {result.grounded_response && (
                <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs space-y-6">
                  {/* Plain Language Summary */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-md">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1">
                      <BookOpen className="w-4 h-4 text-legal-gold" />
                      <span>Plain-Language Legal Summary</span>
                    </div>
                    <p className="text-sm text-slate-900 leading-relaxed font-sans">
                      {result.grounded_response.plain_summary}
                    </p>
                  </div>

                  {/* Statutory Citations Cards */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-deep mb-2 flex items-center justify-between">
                      <span>Governing Statutory Citations</span>
                      <span className="text-[10px] text-slate-400 font-normal">Click provision to inspect verbatim text</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.grounded_response.statutory_citations.map((c) => (
                        <div
                          key={c.provision_id}
                          className="p-3 bg-white border border-slate-200 rounded hover:border-legal-green transition-all shadow-2xs group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-legal-green">
                                {c.act_short} &bull; §{c.section_number}
                              </span>
                              <span className="text-[10px] text-slate-400">ID: {c.provision_id}</span>
                            </div>
                            <h4 className="text-xs font-serif font-bold text-slate-900 group-hover:text-ink-deep">
                              {c.section_heading}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                              {c.act_title}
                            </p>
                            {c.historical_reference && c.historical_reference !== "None" && (
                              <p className="text-[10px] text-amber-700 mt-1">
                                Historical: {c.historical_reference}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleOpenStatuteDrawer(c.provision_id)}
                            className="mt-3 text-xs text-ink-deep hover:text-legal-green font-semibold inline-flex items-center gap-1 text-left"
                          >
                            <span>Inspect Statute Text</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legal Analysis */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-deep mb-2">
                      Statutory Framework & Jurisprudence
                    </h3>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 font-serif">
                      <p>{result.grounded_response.legal_analysis}</p>
                    </div>
                  </div>

                  {/* Actionable Next Steps */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-deep mb-2">
                      Actionable Pre-Litigation Steps
                    </h3>
                    <ol className="space-y-2 text-xs sm:text-sm text-slate-800">
                      {result.grounded_response.actionable_next_steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 p-2.5 bg-paper-warm border border-paper-border rounded">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-ink-deep text-white text-[11px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="leading-normal">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Professional Referral */}
                  {result.grounded_response.professional_referral && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                          Recommended Official Redressal Authority
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                          {result.grounded_response.professional_referral.type}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {result.grounded_response.professional_referral.authority_name}
                      </p>
                      <p className="text-xs text-slate-700 mt-1">
                        {result.grounded_response.professional_referral.notes}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                        {result.grounded_response.professional_referral.helpline_number && (
                          <a
                            href={`tel:${result.grounded_response.professional_referral.helpline_number}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Helpline: {result.grounded_response.professional_referral.helpline_number}</span>
                          </a>
                        )}
                        {result.grounded_response.professional_referral.portal_url && (
                          <a
                            href={result.grounded_response.professional_referral.portal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 font-semibold rounded hover:bg-emerald-100 transition-colors"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Uncertainty & Limitations */}
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
                    <Info className="w-3.5 h-3.5 inline text-slate-500 mr-1" />
                    <strong>Uncertainty & Statutory Limitations:</strong> {result.grounded_response.uncertainty_notes}
                  </div>
                </div>
              )}

              {/* Execution & Attribution Footer */}
              <div className="p-3 bg-white border border-paper-border rounded flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-legal-gold" />
                  <span>Engine: {result.provider_used}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Execution Latency: {result.latency_ms} ms</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statutory Drawer for inspecting selected provisions */}
      <StatutoryDrawer
        provision={activeProvision}
        onClose={() => setActiveProvision(null)}
      />
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-500 text-xs">
        Loading Statutory Triage Engine...
      </div>
    }>
      <AssistantContent />
    </Suspense>
  );
}
