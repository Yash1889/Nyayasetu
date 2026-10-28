"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  ExternalLink, 
  Calendar, 
  Plus, 
  Trash2, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Lock,
  Clock
} from "lucide-react";

interface SavedCase {
  id: string;
  cnr: string;
  title: string;
  court: string;
  nextHearingDate: string;
  stage: string;
  notes: string;
}

const STATE_CODE_MAP: Record<string, string> = {
  DL: "Delhi",
  MH: "Maharashtra",
  UP: "Uttar Pradesh",
  KA: "Karnataka",
  TN: "Tamil Nadu",
  WB: "West Bengal",
  GJ: "Gujarat",
  RJ: "Rajasthan",
  MP: "Madhya Pradesh",
  KL: "Kerala",
  TS: "Telangana",
  PB: "Punjab",
  HR: "Haryana",
  BR: "Bihar"
};

export default function CaseTrackerPage() {
  const [cnrInput, setCnrInput] = useState("");
  const [analysis, setAnalysis] = useState<{
    valid: boolean;
    state?: string;
    courtCode?: string;
    caseNumber?: string;
    year?: string;
    message?: string;
  } | null>(null);

  // Client-side local diary (persisted purely in browser localStorage)
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCnr, setNewCnr] = useState("");
  const [newCourt, setNewCourt] = useState("");
  const [newHearing, setNewHearing] = useState("");
  const [newStage, setNewStage] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nyayasetu_case_diary");
      if (stored) {
        setSavedCases(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read local case diary:", e);
    }
  }, []);

  const saveToLocalStorage = (cases: SavedCase[]) => {
    setSavedCases(cases);
    try {
      localStorage.setItem("nyayasetu_case_diary", JSON.stringify(cases));
    } catch (e) {
      console.warn("Could not persist case diary to localStorage:", e);
    }
  };

  const handleAnalyzeCnr = (inputStr: string) => {
    const clean = inputStr.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    setCnrInput(clean);

    if (clean.length === 16) {
      const stateCode = clean.slice(0, 2);
      const courtCode = clean.slice(2, 6);
      const caseNum = clean.slice(6, 12);
      const year = clean.slice(12, 16);

      const stateName = STATE_CODE_MAP[stateCode] || `State (${stateCode})`;

      setAnalysis({
        valid: true,
        state: stateName,
        courtCode: courtCode,
        caseNumber: caseNum,
        year: year
      });
    } else if (clean.length > 0) {
      setAnalysis({
        valid: false,
        message: `CNR Number must be exactly 16 alphanumeric characters. Currently entered: ${clean.length} characters.`
      });
    } else {
      setAnalysis(null);
    }
  };

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCase: SavedCase = {
      id: Date.now().toString(),
      cnr: newCnr.trim().toUpperCase(),
      title: newTitle.trim(),
      court: newCourt.trim(),
      nextHearingDate: newHearing,
      stage: newStage.trim() || "Pending Hearing",
      notes: newNotes.trim()
    };

    const updated = [newCase, ...savedCases];
    saveToLocalStorage(updated);

    // Reset form
    setNewTitle("");
    setNewCnr("");
    setNewCourt("");
    setNewHearing("");
    setNewStage("");
    setNewNotes("");
    setShowAddModal(false);
  };

  const handleDeleteCase = (id: string) => {
    const updated = savedCases.filter(c => c.id !== id);
    saveToLocalStorage(updated);
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="border-b border-paper-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-blue-800" />
            <span>eCourts Services & Citizen Case Diary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink-deep">
            CNR Number Analyzer & Private Case Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Decode official 16-character CNR numbers, access authorized eCourts portals, and maintain a private, in-browser court diary.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Private: Diary stored in your browser only</span>
        </div>
      </div>

      {/* CNR Analyzer Card */}
      <div className="p-6 bg-white border border-paper-border rounded-lg shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-serif font-bold text-ink-deep flex items-center gap-2">
            <Search className="w-4 h-4 text-legal-gold" />
            <span>CNR Number Decoder & Portal Redirect</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            The CNR (Case Number Record) is a unique 16-character alphanumeric code assigned to every judicial matter across 3,000+ Indian court complexes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={18}
              value={cnrInput}
              onChange={(e) => handleAnalyzeCnr(e.target.value)}
              placeholder="Enter 16-character CNR (e.g. DLHC01-012345-2024)..."
              className="w-full p-3 font-mono text-sm tracking-wider uppercase border border-slate-300 rounded focus:ring-2 focus:ring-ink-deep focus:outline-none"
            />
          </div>
          <a
            href={cnrInput ? `https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index&cnr=${encodeURIComponent(cnrInput)}` : "https://services.ecourts.gov.in/ecourtindia_v6/"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-ink-deep hover:bg-ink-navy text-white text-xs sm:text-sm font-semibold rounded flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <span>Track on Official eCourts</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Real-time Decomposition */}
        {analysis && (
          <div className={`p-4 rounded border text-xs ${
            analysis.valid ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-amber-50 border-amber-300 text-amber-950"
          }`}>
            {analysis.valid ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Valid CNR Structure Detected</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 block">Jurisdiction:</span>
                    <strong className="text-slate-900">{analysis.state}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Court Code:</span>
                    <strong className="text-slate-900">{analysis.courtCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Case Sequence:</span>
                    <strong className="text-slate-900">#{analysis.caseNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Filing Year:</span>
                    <strong className="text-slate-900">{analysis.year}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{analysis.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Official Portal Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
          <strong>Security Notice:</strong> The official eCourts platform enforces interactive CAPTCHA authentication to protect litigant privacy and prevent unauthorized automated scraping. NyayaSetu directs you directly to the authenticated official portals of the Supreme Court, High Courts, and District Courts.
        </div>
      </div>

      {/* In-Browser Citizen Case Diary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-ink-deep flex items-center gap-2">
              <Calendar className="w-4 h-4 text-legal-gold" />
              <span>Personal Case Diary & Hearing Tracker</span>
            </h3>
            <p className="text-xs text-slate-500">
              Track upcoming hearing dates and maintain case notes. Stored locally in your browser.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-ink-deep hover:bg-ink-navy text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Case to Diary</span>
          </button>
        </div>

        {savedCases.length === 0 ? (
          <div className="p-8 text-center bg-white border border-paper-border rounded-lg space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Your Case Diary is empty</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your pending consumer complaints, tenancy cases, or cheque bounce matters to receive timely visual hearing reminders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCases.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-white border border-paper-border rounded-lg shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                        {c.stage}
                      </span>
                      <h4 className="text-sm font-bold text-ink-deep font-serif mt-1">
                        {c.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleDeleteCase(c.id)}
                      className="text-slate-400 hover:text-red-700 p-1"
                      title="Delete from diary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {c.cnr && (
                    <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
                      CNR: <strong>{c.cnr}</strong>
                    </div>
                  )}

                  {c.court && (
                    <p className="text-xs text-slate-600">
                      <strong>Court:</strong> {c.court}
                    </p>
                  )}

                  {c.nextHearingDate && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Next Hearing: {new Date(c.nextHearingDate).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
                    </div>
                  )}

                  {c.notes && (
                    <p className="text-xs text-slate-600 italic bg-paper-warm p-2 rounded border border-paper-border">
                      &ldquo;{c.notes}&rdquo;
                    </p>
                  )}
                </div>

                {c.cnr && (
                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href={`https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index&cnr=${encodeURIComponent(c.cnr)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-ink-deep hover:text-legal-green inline-flex items-center gap-1"
                    >
                      <span>Check Status on eCourts</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Case Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-300">
            <h3 className="text-base font-serif font-bold text-ink-deep">
              Add New Case to Private Diary
            </h3>
            <form onSubmit={handleAddCase} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Case Title / Parties
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sharma vs. XYZ Builder (Flat Possession)"
                  className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  CNR Number (Optional)
                </label>
                <input
                  type="text"
                  value={newCnr}
                  onChange={(e) => setNewCnr(e.target.value.toUpperCase())}
                  placeholder="e.g. DLHC01-012345-2024"
                  className="w-full p-2.5 font-mono border border-slate-300 rounded text-xs text-slate-800 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Court / Commission
                  </label>
                  <input
                    type="text"
                    value={newCourt}
                    onChange={(e) => setNewCourt(e.target.value)}
                    placeholder="e.g. Saket District Court, Courtroom 4"
                    className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Next Hearing Date
                  </label>
                  <input
                    type="date"
                    value={newHearing}
                    onChange={(e) => setNewHearing(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Case Stage
                </label>
                <input
                  type="text"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  placeholder="e.g. Evidence / Arguments / Notice Return"
                  className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hearing Notes / To-Do
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Documents to bring, lawyer instructions..."
                  className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ink-deep hover:bg-ink-navy text-white rounded text-xs font-semibold"
                >
                  Save to Diary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
