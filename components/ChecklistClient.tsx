"use client";

import React, { useState } from "react";
import { 
  FileCheck2, 
  Clock, 
  Scale, 
  Copy, 
  Check, 
  Printer, 
  Send
} from "lucide-react";
import pathwaysData from "@/data/procedural_pathways.json";
import { ProceduralPathway } from "@/lib/types";

const pathways: ProceduralPathway[] = pathwaysData as ProceduralPathway[];

export function ChecklistClient() {
  const [selectedPathwayId, setSelectedPathwayId] = useState(pathways[0].id);
  const [checkedEvidence, setCheckedEvidence] = useState<Record<string, boolean>>({});

  // Legal Notice Form State
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [disputeDate, setDisputeDate] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [generatedNotice, setGeneratedNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentPathway = pathways.find(p => p.id === selectedPathwayId) || pathways[0];

  const toggleEvidence = (key: string) => {
    setCheckedEvidence(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleGenerateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = disputeDate || new Date().toLocaleDateString("en-IN");
    let notice = "";

    if (currentPathway.id === "pathway_cheque_bounce") {
      notice = `STATUTORY LEGAL DEMAND NOTICE
(UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881)

Date: ${new Date().toLocaleDateString("en-IN")}
MODE: REGISTERED POST WITH ACKNOWLEDGMENT DUE / SPEED POST

To:
${recipientName || "[Name of Cheque Drawer / Accused]"}
[Address of Recipient]

From:
${senderName || "[Name of Payee / Complainant]"}
[Address of Complainant]

SUB: STATUTORY DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR PAYMENT OF DISHONOURED CHEQUE AMOUNTING TO ₹${claimAmount || "[Amount]"}

Sir/Madam,

Under instructions and on behalf of my client / undersigned, I hereby serve upon you this Statutory Legal Demand Notice:

1. That in discharge of your legally enforceable debt and liability, you issued Cheque No. [Cheque Number] dated ${formattedDate} drawn on [Bank Name, Branch] for an amount of ₹${claimAmount || "[Amount]"} in favour of the undersigned.

2. That the said cheque was presented by the undersigned to their banker, but the same was returned unpaid by the bank vide official Bank Return Memo dated [Memo Date] with the statutory endorsement: "FUNDS INSUFFICIENT" / "EXCEEDS ARRANGEMENT".

3. That the dishonour of the said cheque has taken place in direct violation of Section 138 of the Negotiable Instruments Act, 1881.

4. You are hereby formally called upon through this Statutory Notice to make full payment of the cheque amount of ₹${claimAmount || "[Amount]"} to the undersigned within 15 (FIFTEEN) DAYS from the date of receipt of this notice.

5. Please take note that if you fail to make payment within the aforesaid statutory period of 15 days, my client shall be constrained to initiate criminal proceedings against you under Section 138 and Section 142 of the Negotiable Instruments Act, 1881 before the competent Judicial Magistrate, wherein you shall be liable to be prosecuted and punished with imprisonment for a term which may extend to two years, or with fine up to twice the amount of the cheque, or both, alongside interim compensation under Section 143A.

Yours faithfully,

${senderName || "[Complainant Signature]"}
[Contact Details]`;
    } else {
      notice = `PRE-LITIGATION LEGAL GRIEVANCE & DEMAND NOTICE

Date: ${new Date().toLocaleDateString("en-IN")}
MODE: REGISTERED POST / VERIFIABLE ELECTRONIC MAIL

To:
${recipientName || "[Name of Counter-Party / Entity / Landlord]"}
[Address of Recipient]

From:
${senderName || "[Name of Claimant / Consumer / Tenant]"}
[Address of Claimant]

SUB: FORMAL PRE-LITIGATION DEMAND NOTICE IN RESPECT OF: ${currentPathway.title}

Sir/Madam,

1. That the undersigned entered into a legal transaction / contract on or about ${formattedDate} regarding:
${disputeDetails || "[Factual summary of dispute, transaction, or tenancy]"}

2. That despite lawful obligations under ${currentPathway.governing_statutes.join(", ")}, you have committed a persistent default, deficiency, and breach causing serious financial injury and mental distress to the tune of ₹${claimAmount || "[Claim Amount]"}.

3. You are hereby called upon to immediately rectify the aforesaid default and remit the lawful refund/dues of ₹${claimAmount || "[Claim Amount]"} within 15 (FIFTEEN) DAYS of the receipt of this notice.

4. Take notice that in default of compliance within the statutory period of 15 days, the undersigned shall institute formal proceedings before the ${currentPathway.forum} for restitution, compensation, interest, and litigation costs, entirely at your risk and consequence.

Yours faithfully,

${senderName || "[Claimant Signature]"}`;
    }

    setGeneratedNotice(notice);
  };

  const handleCopyNotice = () => {
    if (generatedNotice) {
      navigator.clipboard.writeText(generatedNotice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="border-b border-paper-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-legal-gold" />
            <span>Statutory Pre-Litigation Tools</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink-deep">
            Procedural Pathways & Evidence Checklist Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Understand strict statutory limitation deadlines, verify mandatory documentary evidence, and draft structured pre-litigation notices.
          </p>
        </div>
      </div>

      {/* Pathway Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-paper-border pb-3">
        {pathways.map(p => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedPathwayId(p.id);
              setGeneratedNotice(null);
            }}
            className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
              selectedPathwayId === p.id
                ? "bg-ink-deep text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {p.title.split("(")[0]}
          </button>
        ))}
      </div>

      {/* Pathway Overview Card */}
      <div className="p-6 bg-white border border-paper-border rounded-lg shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-legal-gold">
              {currentPathway.category}
            </span>
            <h2 className="text-lg font-serif font-bold text-ink-deep">
              {currentPathway.title}
            </h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 font-medium">
            Appropriate Forum: {currentPathway.forum}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">Governing Primary Legislation:</span>
            <div className="flex flex-wrap gap-1">
              {currentPathway.governing_statutes.map(s => (
                <span key={s} className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-ink-deep">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-900 block">Statutory Relief Available:</span>
            <p className="text-emerald-950 leading-relaxed">{currentPathway.statutory_relief}</p>
          </div>
        </div>

        {/* Prerequisites */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Mandatory Statutory Prerequisites:
          </h3>
          <ul className="space-y-1 text-xs text-slate-700">
            {currentPathway.statutory_prerequisites.map((prereq, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-legal-green font-bold">&bull;</span>
                <span>{prereq}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Procedural Ladder & Interactive Evidence Checklist */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink-deep flex items-center gap-2">
          <Clock className="w-4 h-4 text-legal-gold" />
          <span>Statutory Procedural Ladder & Required Evidence Checklist</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPathway.procedural_steps.map((step) => (
            <div
              key={step.step_number}
              className="bg-white border border-paper-border rounded-lg p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-ink-deep text-white font-bold text-xs flex items-center justify-center">
                    {step.step_number}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-semibold border border-amber-200">
                    {step.statutory_deadline}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 font-serif">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {step.description}
                </p>

                {/* Evidence checkboxes */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Verify Required Evidence:
                  </span>
                  {step.evidence_required.map((evidence, eIdx) => {
                    const key = `${currentPathway.id}_step_${step.step_number}_ev_${eIdx}`;
                    const isChecked = Boolean(checkedEvidence[key]);
                    return (
                      <label
                        key={eIdx}
                        className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors text-xs ${
                          isChecked ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEvidence(key)}
                          className="mt-0.5 rounded text-legal-green focus:ring-legal-green"
                        />
                        <span className="leading-snug">{evidence}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Litigation Legal Notice Generator */}
      <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs space-y-6">
        <div className="border-b border-paper-border pb-3">
          <h3 className="text-base font-serif font-bold text-ink-deep flex items-center gap-2">
            <Scale className="w-5 h-5 text-legal-gold" />
            <span>Generate Pre-Litigation Notice Draft</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Create a structured legal demand notice grounded in the statutory provisions of {currentPathway.title.split("(")[0]}.
          </p>
        </div>

        <form onSubmit={handleGenerateNotice} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Your Full Name (Claimant / Payee)
            </label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Ramesh Chandra Sharma"
              className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recipient Name (Opposing Party / Drawer / Seller)
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. ABC Enterprises Pvt Ltd / Tenant Name"
              className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Claim / Cheque Amount (in INR)
            </label>
            <input
              type="text"
              required
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              placeholder="e.g. 75,000"
              className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Date of Incident / Cheque Date
            </label>
            <input
              type="date"
              value={disputeDate}
              onChange={(e) => setDisputeDate(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Factual Dispute Summary (1-2 sentences)
            </label>
            <textarea
              rows={2}
              value={disputeDetails}
              onChange={(e) => setDisputeDetails(e.target.value)}
              placeholder="Describe the transaction, cheque details, or deposit withholding details..."
              className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-ink-deep hover:bg-ink-navy text-white font-semibold rounded text-xs flex items-center gap-2 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Generate Notice Draft</span>
            </button>
          </div>
        </form>

        {generatedNotice && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Generated Legal Notice Draft
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyNotice}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Draft"}</span>
                </button>
                <button
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="px-3 py-1.5 bg-ink-deep hover:bg-ink-navy text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <pre className="p-5 bg-slate-50 border border-slate-300 rounded font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
              {generatedNotice}
            </pre>

            <p className="text-[11px] text-slate-500">
              * Note: Send this notice via Speed Post with Postal Acknowledgment or registered email. Preserve postal receipt and online tracking report as mandatory primary evidence under Section 138 NI Act / Section 38 CPA 2019.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
