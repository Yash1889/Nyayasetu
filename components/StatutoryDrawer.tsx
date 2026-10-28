"use client";

import React from "react";
import { LegalProvision } from "@/lib/types";
import { X, ExternalLink, BookOpen, Scale, History, ShieldAlert } from "lucide-react";

interface StatutoryDrawerProps {
  provision: LegalProvision | null;
  onClose: () => void;
}

export function StatutoryDrawer({ provision, onClose }: StatutoryDrawerProps) {
  // Handle Escape key and body scroll locking for instant responsiveness
  React.useEffect(() => {
    if (!provision) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [provision, onClose]);

  if (!provision) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-100"
      onClick={(e) => {
        // Close immediately when clicking the background overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div 
        className="w-full max-w-2xl bg-paper-warm h-full shadow-2xl flex flex-col border-l border-paper-border overflow-y-auto animate-in slide-in-from-right duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="p-5 bg-ink-deep text-white flex items-start justify-between border-b border-ink-navy sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {provision.act_short}
              </span>
              <span className="text-xs text-slate-300">
                Chapter: {provision.chapter}
              </span>
            </div>
            <h2 id="drawer-title" className="text-lg font-serif font-bold tracking-tight text-white">
              Section {provision.section_number}: {provision.section_heading}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {provision.act_title} ({provision.act_year})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Statutory Plain Summary */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-md">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs tracking-wider uppercase mb-1">
              <BookOpen className="w-4 h-4 text-legal-gold" />
              <span>Civic Plain-Language Explanation</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">
              {provision.plain_summary}
            </p>
          </div>

          {/* Verbatim Legal Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-deep flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-ink-muted" />
                <span>Verbatim Statutory Text (Gazette of India)</span>
              </h3>
              <a
                href={provision.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-legal-green hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>India Code Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-4 bg-white border border-paper-border rounded font-statute text-sm text-slate-900 leading-relaxed whitespace-pre-line shadow-xs">
              {provision.verbatim_text}
            </div>
          </div>

          {/* Criminal Law Transition & Savings Mapping */}
          {provision.transition_mapping && provision.transition_mapping.historical_section !== "None" && (
            <div className="p-4 bg-slate-100/80 border border-slate-300 rounded-md">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs tracking-wider uppercase mb-2">
                <History className="w-4 h-4 text-slate-700" />
                <span>Criminal Law Transition & Historical Reference</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                <div>
                  <span className="text-slate-500 block">Historical Provision:</span>
                  <span className="font-semibold text-slate-900">
                    {provision.transition_mapping.historical_act} ({provision.transition_mapping.historical_section})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Statutory Reform Nature:</span>
                  <span className="font-semibold text-slate-900">
                    {provision.transition_mapping.nature_of_change}
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
                <ShieldAlert className="w-3.5 h-3.5 inline text-amber-600 mr-1" />
                <strong>Savings Clause Rule:</strong> Under Section 358 of BNS 2023 / Section 531 of BNSS 2023, if the alleged offence occurred <em>before July 1, 2024</em>, the trial and investigation proceed under the historical IPC / CrPC provisions.
              </div>
            </div>
          )}

          {/* Procedural Classification Table */}
          {provision.legal_attributes && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-deep mb-2">
                Procedural Attributes & Jurisdiction
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white border border-paper-border rounded">
                  <span className="text-slate-500 block text-[10px] uppercase">Cognizable</span>
                  <span className={`font-bold ${provision.legal_attributes.is_cognizable ? "text-red-700" : "text-slate-700"}`}>
                    {provision.legal_attributes.is_cognizable === null ? "N/A" : provision.legal_attributes.is_cognizable ? "Yes (Arrest w/o warrant)" : "No (Non-Cognizable)"}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-paper-border rounded">
                  <span className="text-slate-500 block text-[10px] uppercase">Bailable</span>
                  <span className={`font-bold ${provision.legal_attributes.is_bailable === false ? "text-red-700" : "text-emerald-700"}`}>
                    {provision.legal_attributes.is_bailable === null ? "N/A" : provision.legal_attributes.is_bailable ? "Bailable (As of right)" : "Non-Bailable"}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-paper-border rounded">
                  <span className="text-slate-500 block text-[10px] uppercase">Compoundable</span>
                  <span className="font-bold text-slate-800">
                    {provision.legal_attributes.is_compoundable === null ? "N/A" : provision.legal_attributes.is_compoundable ? "Yes (Compromise permitted)" : "No"}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-paper-border rounded">
                  <span className="text-slate-500 block text-[10px] uppercase">Triable By</span>
                  <span className="font-bold text-slate-800 text-[11px]">
                    {provision.legal_attributes.triable_by || "Civil / Not Applicable"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-paper-muted border-t border-paper-border flex justify-between items-center text-xs text-slate-500">
          <span>Source: India Code Legislative Repository</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-ink-deep hover:bg-ink-navy text-white font-medium rounded transition-colors"
          >
            Close Provision
          </button>
        </div>
      </div>
    </div>
  );
}
