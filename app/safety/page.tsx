"use client";

import React from "react";
import { 
  PhoneCall, 
  ShieldAlert, 
  HeartHandshake, 
  ExternalLink, 
  Scale, 
  FileText, 
  CheckCircle2, 
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { QuickExit } from "@/components/QuickExit";
import emergencyContactsData from "@/data/emergency_contacts.json";
import { EmergencyContact } from "@/lib/types";

const contacts: EmergencyContact[] = emergencyContactsData as EmergencyContact[];

export default function SafetyPage() {
  return (
    <div className="space-y-10">
      {/* Top Warning & Quick-Exit Banner */}
      <div className="p-4 bg-red-100 border-l-4 border-red-700 rounded-r-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
            <h2 className="text-sm font-bold text-red-900">
              Immediate Safety Priority & Discretion Notice
            </h2>
          </div>
          <p className="text-xs text-red-800 mt-1">
            If you are in danger or your internet activity is monitored, please press <strong className="text-red-950">Esc</strong> or click Quick Exit. Reach a safe physical location or trusted friend before browsing legal remedies.
          </p>
        </div>
        <div className="shrink-0">
          <QuickExit />
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs font-semibold text-red-800">
          <PhoneCall className="w-3.5 h-3.5 text-red-700" />
          <span>Trauma-Informed & Confidential Guidance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-ink-deep">
          Women Safety, Emergency Helplines & Legal Rights
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Access verified nationwide crisis response numbers, statutory protection mechanisms under PWDVA 2005, and criminal reporting procedures under BNSS 2023 without disclosing sensitive personal details.
        </p>
      </div>

      {/* Verified Helpline Directory */}
      <div className="space-y-4">
        <div className="border-b border-paper-border pb-2 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-ink-deep flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-700" />
            <span>Verified Public Helplines Directory</span>
          </h2>
          <span className="text-xs text-slate-500">Updated: October 2026 Official Registry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.number}
              className={`p-5 rounded-lg border flex flex-col justify-between shadow-xs transition-shadow hover:shadow-md ${
                contact.number === "112" || contact.number === "181"
                  ? "bg-red-50/60 border-red-300"
                  : "bg-white border-paper-border"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-ink-deep tracking-tight">
                    {contact.number}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    contact.is_national
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {contact.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {contact.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {contact.description}
                </p>
                <div className="pt-2 text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100">
                  <p><strong>Geographic Scope:</strong> {contact.scope}</p>
                  <p><strong>Authority:</strong> {contact.authority}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <a
                  href={contact.direct_dial}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded transition-colors shadow-2xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Direct Dial {contact.number}</span>
                </a>
                <a
                  href={contact.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  title="Visit official authority portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Statutory Rights for Women */}
      <div className="space-y-6 pt-4">
        <div className="border-b border-paper-border pb-2">
          <h2 className="text-lg font-serif font-bold text-ink-deep flex items-center gap-2">
            <Scale className="w-5 h-5 text-legal-gold" />
            <span>Core Statutory Protections & Emergency Legal Rights</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: PWDVA 2005 */}
          <div className="p-5 bg-white border border-paper-border rounded-lg shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-legal-green font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Civil Injunctions & Residence</span>
            </div>
            <h3 className="text-sm font-serif font-bold text-ink-deep">
              Protection of Women from Domestic Violence Act, 2005 (PWDVA)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides civil remedies without immediate criminal conviction:
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5">
              <li>
                <strong>Section 17 (Right to Reside):</strong> Every woman in a domestic relationship has the statutory right to reside in the shared household; she cannot be evicted or dispossessed without due legal procedure.
              </li>
              <li>
                <strong>Section 18 (Protection Orders):</strong> Magistrate can restrain the respondent from committing, aiding, or attempting violence, or entering the woman's workplace or residence.
              </li>
              <li>
                <strong>Section 19 & 20:</strong> Residence orders and monetary relief for medical expenses, maintenance, and food.
              </li>
            </ul>
          </div>

          {/* Card 2: BNSS 2023 */}
          <div className="p-5 bg-white border border-paper-border rounded-lg shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
              <FileText className="w-4 h-4" />
              <span>Criminal Procedure & Police Duties</span>
            </div>
            <h3 className="text-sm font-serif font-bold text-ink-deep">
              Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modern criminal procedure safeguards for women victims:
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5">
              <li>
                <strong>Section 173(1) (e-FIR & Zero-FIR):</strong> Information regarding cognizable offences may be given orally or electronically (e-FIR). Any police station is legally bound to register a Zero-FIR regardless of jurisdiction.
              </li>
              <li>
                <strong>Woman Police Officer Presence:</strong> Recording of statements of women victims must be conducted by a woman police officer at her place of residence or convenience.
              </li>
              <li>
                <strong>Free Copy of FIR:</strong> A free certified copy of the registered FIR must be furnished immediately to the complainant.
              </li>
            </ul>
          </div>

          {/* Card 3: Free Legal Aid LSAA 1987 */}
          <div className="p-5 bg-white border border-paper-border rounded-lg shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
              <HeartHandshake className="w-4 h-4" />
              <span>Universal Free Legal Aid</span>
            </div>
            <h3 className="text-sm font-serif font-bold text-ink-deep">
              Legal Services Authorities Act, 1987 (LSAA)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Constitutional and statutory right to free representation:
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5">
              <li>
                <strong>Section 12(c):</strong> Every woman is statutorily entitled to free legal services across all courts, tribunals, and commissions in India.
              </li>
              <li>
                <strong>Zero Income Requirement:</strong> Unlike general citizens, women do not need to satisfy income limits to obtain an allocated legal aid defense counsel.
              </li>
              <li>
                <strong>24/7 Helpline:</strong> Dial <strong>15100</strong> to reach NALSA directly or visit the DLSA front office at any district court.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Safety Protocol Checklist */}
      <div className="p-6 bg-paper-warm border border-slate-300 rounded-lg space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-legal-green" />
          <span>Practical Evidence & Safety Checklist (If Safe to Collect)</span>
        </h3>
        <p className="text-xs text-slate-600">
          Only preserve records if doing so does not jeopardize your immediate physical safety:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3 bg-white rounded border border-paper-border">
            <strong className="text-ink-deep block mb-0.5">1. Contemporaneous Notes:</strong>
            Keep a secure diary or cloud note of dates, times, and exact statements made during threats or abusive incidents.
          </div>
          <div className="p-3 bg-white rounded border border-paper-border">
            <strong className="text-ink-deep block mb-0.5">2. Medical Examination (MLC):</strong>
            In cases of physical injury, visit a government hospital casualty unit and request a formal Medico-Legal Certificate (MLC).
          </div>
          <div className="p-3 bg-white rounded border border-paper-border">
            <strong className="text-ink-deep block mb-0.5">3. Digital Evidence:</strong>
            Take screenshots of threatening messages, call logs, or audio recordings and send them to a trusted confidant's email address.
          </div>
          <div className="p-3 bg-white rounded border border-paper-border">
            <strong className="text-ink-deep block mb-0.5">4. Safe Relocation Plan:</strong>
            Keep original identity cards (Aadhaar, Voter ID), bank passbook, and child birth certificates in an accessible grab-bag.
          </div>
        </div>
      </div>
    </div>
  );
}
