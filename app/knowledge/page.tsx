"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Scale, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from "lucide-react";
import { LegalProvision } from "@/lib/types";
import { StatutoryDrawer } from "@/components/StatutoryDrawer";
import seedProvisionsData from "@/data/seed_provisions.json";

const provisions: LegalProvision[] = seedProvisionsData as LegalProvision[];

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAct, setSelectedAct] = useState("ALL");
  const [bailableFilter, setBailableFilter] = useState("ALL");
  const [selectedProvision, setSelectedProvision] = useState<LegalProvision | null>(null);

  // Collect distinct Acts
  const availableActs = useMemo(() => {
    const set = new Set(provisions.map(p => p.act_short));
    return ["ALL", ...Array.from(set).sort()];
  }, []);

  const filteredProvisions = useMemo(() => {
    return provisions.filter(p => {
      if (selectedAct !== "ALL" && p.act_short !== selectedAct) {
        return false;
      }
      if (bailableFilter === "BAILABLE" && p.legal_attributes.is_bailable !== true) {
        return false;
      }
      if (bailableFilter === "NON_BAILABLE" && p.legal_attributes.is_bailable !== false) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${p.act_title} ${p.act_short} Section ${p.section_number} ${p.section_heading} ${p.plain_summary} ${p.verbatim_text} ${p.transition_mapping?.historical_section || ""}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [searchQuery, selectedAct, bailableFilter]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-paper-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-legal-green" />
            <span>Curated Primary Legislation Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink-deep">
            Legal Knowledge Hub & Statute Browser
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse and inspect primary central statutes, criminal transitions (IPC/CrPC to BNS/BNSS), and civic summaries with source provenance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 font-semibold shadow-2xs">
            {filteredProvisions.length} of {provisions.length} Provisions
          </span>
          <span className="px-3 py-1 bg-ink-deep text-white rounded font-semibold shadow-2xs">
            10 Central Acts
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-paper-border rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by section, keyword (e.g. bail, warranty, cheque, deposit, electronic evidence)..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-ink-deep focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Act Filter */}
            <select
              value={selectedAct}
              onChange={(e) => setSelectedAct(e.target.value)}
              className="p-2 border border-slate-300 rounded text-xs bg-white text-slate-800 font-medium"
            >
              {availableActs.map(act => (
                <option key={act} value={act}>
                  {act === "ALL" ? "All 10 Central Acts" : act}
                </option>
              ))}
            </select>

            {/* Bailable Filter */}
            <select
              value={bailableFilter}
              onChange={(e) => setBailableFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded text-xs bg-white text-slate-800 font-medium"
            >
              <option value="ALL">All Bail Classes</option>
              <option value="BAILABLE">Bailable Only</option>
              <option value="NON_BAILABLE">Non-Bailable Only</option>
            </select>

            {(searchQuery || selectedAct !== "ALL" || bailableFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedAct("ALL");
                  setBailableFilter("ALL");
                }}
                className="p-2 text-slate-500 hover:text-ink-deep border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Provisions Grid */}
      {filteredProvisions.length === 0 ? (
        <div className="p-12 text-center bg-white border border-paper-border rounded-lg space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching statutory provisions found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or resetting the Act filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProvisions.map((provision) => (
            <div
              key={provision.provision_id}
              onClick={() => setSelectedProvision(provision)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedProvision(provision);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Inspect Section ${provision.section_number}: ${provision.section_heading}`}
              className="bg-white border border-paper-border rounded-lg p-5 shadow-xs hover:border-legal-green hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-legal-green"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    {provision.act_short} &bull; §{provision.section_number}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {provision.act_year}
                  </span>
                </div>

                <h3 className="text-sm font-serif font-bold text-ink-deep group-hover:text-legal-green transition-colors leading-snug">
                  {provision.section_heading}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {provision.plain_summary}
                </p>

                {provision.transition_mapping && provision.transition_mapping.historical_section !== "None" && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                    <span className="font-semibold text-amber-900 block">Historical Reference:</span>
                    <span>{provision.transition_mapping.historical_act} ({provision.transition_mapping.historical_section})</span>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                  {provision.legal_attributes.is_bailable !== null && (
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${
                      provision.legal_attributes.is_bailable ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}>
                      {provision.legal_attributes.is_bailable ? "Bailable" : "Non-Bailable"}
                    </span>
                  )}
                  {provision.legal_attributes.is_cognizable !== null && (
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${
                      provision.legal_attributes.is_cognizable ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {provision.legal_attributes.is_cognizable ? "Cognizable" : "Non-Cognizable"}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-legal-green group-hover:underline inline-flex items-center gap-1 transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inspect Full Text</span>
                </span>
                <a
                  href={provision.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
                  title="Official Gazette / India Code Link"
                  aria-label="Open source link on India Code"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statutory Drawer */}
      <StatutoryDrawer
        provision={selectedProvision}
        onClose={() => setSelectedProvision(null)}
      />
    </div>
  );
}
