"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Scale, 
  ShieldAlert, 
  ArrowRight, 
  HeartHandshake, 
  PhoneCall, 
  Search, 
  ShoppingBag, 
  Home, 
  CreditCard, 
  FileCheck2, 
  ShieldCheck,
  ExternalLink
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [queryInput, setQueryInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      router.push(`/assistant?q=${encodeURIComponent(queryInput.trim())}`);
    } else {
      router.push("/assistant");
    }
  };

  const sampleQueries = [
    { text: "Landlord refusing to refund ₹75,000 security deposit", category: "Property" },
    { text: "Unauthorized debit of ₹30,000 via fake UPI payment link", category: "Cyber" },
    { text: "Cheque for ₹1,20,000 bounced due to insufficient funds", category: "Commercial" },
    { text: "Brand refusing replacement for defective laptop under warranty", category: "Consumer" },
    { text: "Husband threatening physical violence at home", category: "Emergency" }
  ];

  return (
    <div className="space-y-12">
      {/* Emergency Immediate Action Banner */}
      <div className="p-4 bg-legal-crimson-subtle border-l-4 border-legal-crimson rounded-r-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-legal-crimson shrink-0" />
          <p className="text-xs sm:text-sm text-slate-800">
            <strong>In immediate physical danger or need urgent police help?</strong> Call national helpline <strong className="text-red-700">112</strong> or Women Helpline <strong className="text-red-700">181</strong> right away.
          </p>
        </div>
        <Link
          href="/safety"
          className="shrink-0 px-3 py-1.5 bg-legal-crimson text-white text-xs font-semibold rounded hover:bg-red-800 transition-colors inline-flex items-center gap-1"
        >
          <span>Emergency Contacts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-legal-gold/30 rounded-full text-xs font-semibold text-legal-gold">
          <Scale className="w-3.5 h-3.5" />
          <span>Research-Led Legal Triage & Rights Portal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-ink-deep leading-tight">
          Evidence-Grounded Legal Clarity <br className="hidden sm:inline" />
          <span className="text-legal-green">Before Formal Litigation</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Navigate Indian statutes, identify your legal standing, verify governing sections, and locate free legal aid or official grievance channels without misleading court predictions.
        </p>

        {/* Search Entry */}
        <form onSubmit={handleSearchSubmit} className="pt-2">
          <div className="relative max-w-2xl mx-auto flex items-center shadow-md rounded-lg overflow-hidden border-2 border-ink-deep focus-within:border-legal-green transition-colors bg-white">
            <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Describe your legal issue (e.g. cheque bounce, security deposit, online fraud)..."
              className="w-full py-3.5 px-3 text-sm text-ink-deep placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-3.5 bg-ink-deep hover:bg-ink-navy text-white text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Prompt suggestion pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-slate-500 font-medium">Try practical scenarios:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => router.push(`/assistant?q=${encodeURIComponent(q.text)}`)}
              className="text-xs px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors shadow-2xs hover:border-slate-400 text-left"
            >
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Three Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Card 1: Grounded Triage */}
        <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 text-legal-green flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold text-ink-deep">
              Statutory Triage Assistant
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesize your facts against primary Indian statutes (BNS 2023, Consumer Protection 2019, IT Act 2000, NI Act 1881, TPA 1882) with 100% citation provenance and zero outcome hallucinations.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-legal-green"></span>
                <span>Hybrid BM25 + Dense statutory retrieval</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-legal-green"></span>
                <span>Section 358 BNS July 2024 savings check</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-legal-green"></span>
                <span>Non-predictive procedural guidance</span>
              </li>
            </ul>
          </div>
          <Link
            href="/assistant"
            className="mt-6 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-ink-deep hover:bg-ink-navy text-white text-xs font-semibold rounded transition-colors"
          >
            <span>Start Legal Triage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Women Safety & Helplines */}
        <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-md bg-red-50 border border-red-200 text-legal-crimson flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold text-ink-deep">
              Women Safety & Emergency Hub
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trauma-informed, privacy-conscious portal. Access verified direct-dial contacts (112, 181, 1098, 1090 UP), domestic violence residence rights under PWDVA 2005, and e-FIR rights under BNSS 2023.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-legal-crimson"></span>
                <span>One-click Quick-Exit browser evasion (Esc)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-legal-crimson"></span>
                <span>Verified geographical scope tags</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-legal-crimson"></span>
                <span>Section 173 BNSS Zero-FIR procedures</span>
              </li>
            </ul>
          </div>
          <Link
            href="/safety"
            className="mt-6 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-legal-crimson hover:bg-red-800 text-white text-xs font-semibold rounded transition-colors"
          >
            <span>Open Safety Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Free Legal Aid (NALSA) */}
        <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-md bg-amber-50 border border-amber-200 text-legal-gold flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold text-ink-deep">
              NALSA Free Legal Aid Guide
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Preliminary guidance under Section 12 of the Legal Services Authorities Act, 1987. Check statutory eligibility for women, children, SC/ST, and low-income citizens before approaching the DLSA.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-legal-gold"></span>
                <span>Preliminary statutory eligibility checklist</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-legal-gold"></span>
                <span>State-wise income ceiling thresholds</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-legal-gold"></span>
                <span>Helpline 15100 & DLSA office directories</span>
              </li>
            </ul>
          </div>
          <Link
            href="/legal-aid"
            className="mt-6 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded transition-colors"
          >
            <span>Check Legal Aid Criteria</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Second Row: Knowledge Hub, Case Tracker, Pathways/Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 4: Knowledge Hub */}
        <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold text-ink-deep">
              Statutory Knowledge Hub
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore 26 verified statutory provisions across all 10 Central Acts (BNS, BNSS, BSA, CPA, IT Act, LSAA, NI Act, PWDVA, RTI, TPA) with historical transitions and Gazette links.
            </p>
          </div>
          <Link
            href="/knowledge"
            className="mt-6 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-800 hover:bg-ink-navy text-white text-xs font-semibold rounded transition-colors"
          >
            <span>Explore Knowledge Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 5: Procedural Pathways & Checklist */}
        <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-md bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold text-ink-deep">
              Pathways & Notice Drafter
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Step-by-step procedural ladders with strict limitation deadlines (Section 138 NI Act, Consumer CPA, Tenancy, Cyber). Generate structured pre-litigation legal notices.
            </p>
          </div>
          <Link
            href="/checklist"
            className="mt-6 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold rounded transition-colors"
          >
            <span>View Pathways & Checklists</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 6: Case Tracker */}
        <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold text-ink-deep">
              eCourts CNR Case Tracker
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analyze 16-character CNR numbers across 3,000+ Indian court complexes. Direct links to official eCourts/NJDG portals and private, in-browser case diary.
            </p>
          </div>
          <Link
            href="/case-tracker"
            className="mt-6 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors"
          >
            <span>Track Case & View Diary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Domain Knowledge Pillars */}
      <div className="pt-8">
        <div className="border-b border-paper-border pb-3 mb-6 flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-ink-deep flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-legal-gold" />
            <span>Supported Legal Domains in Curated Seed Corpus</span>
          </h3>
          <span className="text-xs text-slate-500">26 Primary Statutory Provisions across 10 Central Acts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-paper-border rounded-md">
            <div className="flex items-center gap-2 mb-2 text-ink-deep font-semibold text-xs">
              <ShoppingBag className="w-4 h-4 text-legal-green" />
              <span>Consumer Protection</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              CPA 2019 Sections 2(11) & 35: Deficiency in service, unfair trade practices, and district commission territorial jurisdiction.
            </p>
          </div>

          <div className="p-4 bg-white border border-paper-border rounded-md">
            <div className="flex items-center gap-2 mb-2 text-ink-deep font-semibold text-xs">
              <CreditCard className="w-4 h-4 text-blue-700" />
              <span>Cyber & Financial Fraud</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              IT Act 2000 Sections 66C & 66D, BNS Section 318: Identity theft, phishing, cheating by personation, and 1930 golden-hour reporting.
            </p>
          </div>

          <div className="p-4 bg-white border border-paper-border rounded-md">
            <div className="flex items-center gap-2 mb-2 text-ink-deep font-semibold text-xs">
              <Home className="w-4 h-4 text-amber-800" />
              <span>Tenancy & Property</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              TPA 1882 Section 108(B), BNS Section 316: Security deposit refund obligations, lawful possession, and criminal breach of trust.
            </p>
          </div>

          <div className="p-4 bg-white border border-paper-border rounded-md">
            <div className="flex items-center gap-2 mb-2 text-ink-deep font-semibold text-xs">
              <Scale className="w-4 h-4 text-purple-800" />
              <span>Cheque Dishonour</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              NI Act 1881 Section 138: Strict 30-day notice limitation, 15-day payment window, and criminal court prosecution criteria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
