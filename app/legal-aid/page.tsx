"use client";

import React, { useState, useEffect } from "react";
import { 
  HeartHandshake, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  PhoneCall, 
  ExternalLink, 
  FileText, 
  Info, 
  Search,
  Building2
} from "lucide-react";

interface StateCeiling {
  state: string;
  subordinateCourtCeiling: number;
  highCourtCeiling: number;
  supremeCourtCeiling: number;
}

const STATE_INCOME_CEILINGS: StateCeiling[] = [
  { state: "Delhi (NCT)", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 },
  { state: "Maharashtra", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 },
  { state: "Uttar Pradesh", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 },
  { state: "Karnataka", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 },
  { state: "Tamil Nadu", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 },
  { state: "Gujarat", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 },
  { state: "West Bengal", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 },
  { state: "Rajasthan", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 },
  { state: "Madhya Pradesh", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 },
  { state: "Other States / UTs (General Standard)", subordinateCourtCeiling: 300000, highCourtCeiling: 300000, supremeCourtCeiling: 500000 }
];

export default function LegalAidPage() {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [selectedState, setSelectedState] = useState(STATE_INCOME_CEILINGS[0].state);
  const [annualIncome, setAnnualIncome] = useState<number | "">("");
  const [cnrQuery, setCnrQuery] = useState("");

  const currentState = STATE_INCOME_CEILINGS.find(s => s.state === selectedState) || STATE_INCOME_CEILINGS[0];

  const isCategoricallyExempt = [
    "woman_child", 
    "sc_st", 
    "trafficking", 
    "disability", 
    "custody", 
    "disaster", 
    "workman"
  ].includes(selectedCategory);

  const isIncomeEligible = !isCategoricallyExempt && typeof annualIncome === "number" && annualIncome <= currentState.subordinateCourtCeiling;
  const isEvaluated = isCategoricallyExempt || (typeof annualIncome === "number" && annualIncome >= 0);

  return (
    <div className="space-y-12">
      {/* Title & Introduction */}
      <div className="border-b border-paper-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink-deep flex items-center gap-2.5">
            <HeartHandshake className="w-7 h-7 text-legal-gold" />
            <span>NALSA Free Legal Aid & Case Tracking Guidance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Preliminary eligibility check under Section 12 of the Legal Services Authorities Act, 1987.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <a
            href="tel:15100"
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call NALSA 15100</span>
          </a>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Criteria selection */}
        <div className="lg:col-span-5 bg-white border border-paper-border rounded-lg p-6 shadow-xs space-y-5">
          <div className="border-b border-paper-border pb-2">
            <h2 className="text-sm font-serif font-bold text-ink-deep uppercase tracking-wider">
              Step 1: Check Statutory Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Section 12 of LSAA 1987 grants free legal services to specific eligible groups:
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 p-2.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="woman_child"
                checked={selectedCategory === "woman_child"}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-legal-green focus:ring-legal-green"
              />
              <span className="font-semibold text-slate-800">
                Woman or Child (Section 12(c)) &mdash; <em className="text-emerald-700 font-normal">Income ceiling exempt</em>
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="sc_st"
                checked={selectedCategory === "sc_st"}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-legal-green focus:ring-legal-green"
              />
              <span className="font-semibold text-slate-800">
                Scheduled Caste (SC) or Scheduled Tribe (ST) (Section 12(a))
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="disability"
                checked={selectedCategory === "disability"}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-legal-green focus:ring-legal-green"
              />
              <span className="font-semibold text-slate-800">
                Person with Disability or Mental Illness (Section 12(d))
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="custody"
                checked={selectedCategory === "custody"}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-legal-green focus:ring-legal-green"
              />
              <span className="font-semibold text-slate-800">
                In Custody, Protective Home, or Juvenile Facility (Section 12(g))
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="trafficking"
                checked={selectedCategory === "trafficking"}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-legal-green focus:ring-legal-green"
              />
              <span className="font-semibold text-slate-800">
                Victim of Human Trafficking or Begar (Section 12(g))
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="workman"
                checked={selectedCategory === "workman"}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-legal-green focus:ring-legal-green"
              />
              <span className="font-semibold text-slate-800">
                Industrial Workman (Section 12(f))
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="general"
                checked={selectedCategory === "general"}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-legal-green focus:ring-legal-green"
              />
              <span className="font-semibold text-slate-800">
                General Citizen / Low-Income Basis (Section 12(h))
              </span>
            </label>
          </div>

          {/* State Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-deep mb-1">
              Select Your State or Union Territory
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800 bg-white"
            >
              {STATE_INCOME_CEILINGS.map(s => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>
          </div>

          {/* Income field if not exempt */}
          {!isCategoricallyExempt && (
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-deep mb-1">
                Annual Family Income (in INR)
              </label>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g. 240000"
                className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
              />
              <p className="text-[10px] text-slate-500">
                Prescribed income ceiling in {selectedState} for Subordinate Courts: <strong>₹{currentState.subordinateCourtCeiling.toLocaleString("en-IN")}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Preliminary Evaluation & Guidance */}
        <div className="lg:col-span-7 space-y-6">
          {/* Result Card */}
          <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-paper-border pb-3">
              <h2 className="text-base font-serif font-bold text-ink-deep flex items-center gap-2">
                <Scale className="w-5 h-5 text-legal-gold" />
                <span>Preliminary Guidance Outcome</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold border border-amber-200">
                Preliminary & Non-Binding
              </span>
            </div>

            {isEvaluated && (isCategoricallyExempt || isIncomeEligible) ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-md space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>Prima Facie Statutorily Eligible for Free Legal Aid</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  Based on the selected criteria ({selectedCategory === "general" ? `Annual Income ₹${annualIncome?.toLocaleString("en-IN")} ≤ Ceiling ₹${currentState.subordinateCourtCeiling.toLocaleString("en-IN")}` : `Statutory exemption under Section 12 for ${selectedCategory.replace("_", " ")}`}), you qualify for free legal services provided by the National Legal Services Authority (NALSA) and State Legal Services Authority (SLSA).
                </p>
                <div className="pt-2 text-xs text-emerald-900">
                  <strong>Entitlements include:</strong> Free court fee payment, provision of an allocated legal aid advocate, preparation and drafting of legal pleadings, and certified copies of judicial orders.
                </div>
              </div>
            ) : isEvaluated && !isCategoricallyExempt && !isIncomeEligible ? (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-md space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Income Appears to Exceed Subordinate Court Ceiling</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  Your reported income (₹{annualIncome?.toLocaleString("en-IN")}) exceeds the current statutory ceiling of ₹{currentState.subordinateCourtCeiling.toLocaleString("en-IN")} in {selectedState} for general category representation.
                </p>
                <p className="text-xs text-slate-700">
                  <strong>Alternative Avenues:</strong> You may still access community mediation at Permanent Lok Adalats, seek free counseling at DLSA front office clinics, or apply for discretionary legal assistance if hardship or exceptional injustice is demonstrated.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                Select your statutory category and enter your annual income to view preliminary eligibility thresholds.
              </div>
            )}

            {/* Mandatory Disclaimer */}
            <div className="p-3 bg-paper-warm border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
              <Info className="w-3.5 h-3.5 inline text-amber-700 mr-1" />
              <strong>Official Disclaimer:</strong> This wizard provides preliminary guidance only and is not a formal legal determination. The decision to grant legal aid and allocate defense counsel rests entirely with the Member Secretary / Chairman of the District Legal Services Authority (DLSA) or High Court Legal Services Committee, following statutory verification of documents and merits.
            </div>

            {/* Practical Steps to Apply */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-deep">
                How to Apply for Free Legal Aid (3 Steps):
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <strong className="text-ink-deep block mb-0.5">1. Reach Out Directly:</strong>
                  Call toll-free national helpline <strong className="text-ink-deep">15100</strong> (24 hours) or visit the online portal at <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="text-legal-green underline">nalsa.gov.in</a>.
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <strong className="text-ink-deep block mb-0.5">2. Visit the DLSA Front Office:</strong>
                  Walk into the District Legal Services Authority office located in the premises of your nearest District Court Complex.
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <strong className="text-ink-deep block mb-0.5">3. Submit Basic Documents:</strong>
                  Carry photo ID (Aadhaar or Voter card), dispute documents, and income self-declaration / caste certificate (if applicable).
                </div>
              </div>
            </div>
          </div>

          {/* Honest eCourts Case Tracking Section */}
          <div className="bg-white border border-paper-border rounded-lg p-6 shadow-xs space-y-4">
            <div className="border-b border-paper-border pb-2">
              <h2 className="text-sm font-serif font-bold text-ink-deep uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-legal-gold" />
                <span>eCourts Case Status (Manual CNR Tracking)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized official gateway to track pending or disposed court matters.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed">
                Every case filed across 3,000+ district and subordinate court complexes in India has a unique <strong>16-digit alphanumeric CNR Number</strong> (Case Number Record), formatted as <code>XXYY01-123456-2024</code>.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={18}
                  value={cnrQuery}
                  onChange={(e) => setCnrQuery(e.target.value.toUpperCase())}
                  placeholder="Enter 16-character CNR Number..."
                  className="flex-1 p-2.5 border border-slate-300 rounded text-xs font-mono tracking-wider text-slate-800 placeholder-slate-400"
                />
                <a
                  href={cnrQuery.trim() ? `https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index&cnr=${encodeURIComponent(cnrQuery.trim())}` : "https://services.ecourts.gov.in/ecourtindia_v6/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-ink-deep hover:bg-ink-navy text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Track on eCourts</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Security Boundary Notice */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p>
                  <strong>Security & Verification Notice:</strong> Official eCourts portals require interactive CAPTCHA verification to prevent scraping and ensure privacy. NyayaSetu redirects you directly to the official government portal rather than intercepting judicial records.
                </p>
              </div>

              {/* Direct Official Links */}
              <div className="flex flex-wrap gap-2 pt-2 text-xs">
                <a
                  href="https://services.ecourts.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span>District Courts Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
                <a
                  href="https://hcservices.ecourts.gov.in/hcservices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span>High Courts Services</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
                <a
                  href="https://main.sci.gov.in/case-status"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Supreme Court Status</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified DLSA Directory Component */}
      <DLSADirectorySection />
    </div>
  );
}

function DLSADirectorySection() {
  const [dlsaState, setDlsaState] = useState("All States & UTs");
  const [dlsaSearch, setDlsaSearch] = useState("");
  const [dlsaList, setDlsaList] = useState<any[]>([]);

  useEffect(() => {
    import("@/data/dlsa_directory.json").then((mod) => {
      setDlsaList(mod.default || mod);
    });
  }, []);

  const filtered = dlsaList.filter((d) => {
    if (dlsaState !== "All States & UTs" && d.state !== dlsaState) {
      return false;
    }
    if (dlsaSearch.trim()) {
      const q = dlsaSearch.toLowerCase();
      const text = `${d.authority_name} ${d.district} ${d.court_complex} ${d.office_address}`.toLowerCase();
      return text.includes(q);
    }
    return true;
  });

  const states = ["All States & UTs", ...Array.from(new Set(dlsaList.map((d) => d.state))).sort()];

  return (
    <div className="p-6 bg-white border border-paper-border rounded-lg shadow-xs space-y-5">
      <div className="border-b border-paper-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-serif font-bold text-ink-deep flex items-center gap-2">
            <Building2 className="w-4 h-4 text-legal-gold" />
            <span>Verified District Legal Services Authorities (DLSA) Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Locate official DLSA front offices located inside District Court complexes across India.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
          {filtered.length} DLSA Front Offices
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 text-xs">
        <select
          value={dlsaState}
          onChange={(e) => setDlsaState(e.target.value)}
          className="p-2.5 border border-slate-300 rounded text-xs bg-white text-slate-800 font-medium"
        >
          {states.map((st: any) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            value={dlsaSearch}
            onChange={(e) => setDlsaSearch(e.target.value)}
            placeholder="Search by district name, court complex (e.g. Saket, Tis Hazari, Fort, Surajpur)..."
            className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dlsa) => (
          <div
            key={dlsa.id}
            className="p-4 bg-paper-warm border border-slate-200 rounded-lg space-y-2.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  {dlsa.state}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {dlsa.district}
                </span>
              </div>
              <h3 className="text-xs font-bold text-ink-deep font-serif mt-1">
                {dlsa.authority_name}
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                <strong>Court:</strong> {dlsa.court_complex}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                <strong>Address:</strong> {dlsa.office_address}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                <strong>Phone:</strong> {dlsa.phone} &bull; <strong>Email:</strong> {dlsa.email}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <a
                href={`tel:${dlsa.phone}`}
                className="text-xs font-bold text-legal-green hover:underline inline-flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Front Office</span>
              </a>
              <a
                href={dlsa.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-ink-deep inline-flex items-center gap-1"
                title="Official district portal"
              >
                <span>Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
