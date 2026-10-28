import React from "react";
import Link from "next/link";
import { Scale, ExternalLink, ShieldCheck, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ink-deep text-slate-300 border-t border-slate-800 text-xs mt-16">
      {/* Disclaimer Banner */}
      <div className="bg-legal-crimson/90 text-white py-3 px-4 sm:px-6 lg:px-8 border-b border-red-950">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <Scale className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            <strong>Statutory Legal Disclaimer:</strong> NyayaSetu is an AI-assisted legal information and pre-litigation triage platform designed for civic legal literacy. It does <strong>not</strong> provide formal legal representation, advocate counseling, police reporting, or court outcome guarantees. All citations correspond directly to official statutes in the Gazette of India and India Code. For actionable litigation representation, visit your nearest District Legal Services Authority (DLSA) or consult a licensed advocate.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-legal-gold" />
              <span className="text-base font-serif font-bold text-white tracking-wide">
                NyayaSetu
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A Risk-Aware Retrieval-Augmented Framework for Evidence-Grounded Legal Information and Pre-Litigation Triage. Built upon public statutes and judicial jurisprudence.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Data-Minimized & Privacy-Preserving</span>
            </div>
          </div>

          {/* Column 2: Official Government Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-legal-gold" />
              <span>Official Legal Portals</span>
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="https://www.indiacode.nic.in/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors inline-flex items-center gap-1">
                  <span>India Code Digital Repository</span>
                </a>
              </li>
              <li>
                <a href="https://egazette.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors inline-flex items-center gap-1">
                  <span>The Gazette of India</span>
                </a>
              </li>
              <li>
                <a href="https://nalsa.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors inline-flex items-center gap-1">
                  <span>National Legal Services Authority (NALSA)</span>
                </a>
              </li>
              <li>
                <a href="https://services.ecourts.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors inline-flex items-center gap-1">
                  <span>eCourts Services Portal</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Helplines & Dispute Redressal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Verified Public Helplines
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <span className="text-white font-medium">112:</span> Universal Emergency Response (ERSS)
              </li>
              <li>
                <span className="text-white font-medium">181:</span> National Women Helpline (35 States/UTs)
              </li>
              <li>
                <span className="text-white font-medium">1930:</span> National Cyber Financial Fraud
              </li>
              <li>
                <span className="text-white font-medium">15100:</span> NALSA Free Legal Aid Helpline
              </li>
              <li>
                <span className="text-white font-medium">1090:</span> Women Power Line (UP Police Only)
              </li>
            </ul>
          </div>

          {/* Column 4: Criminal Law Transitional Rule */}
          <div className="p-3 bg-slate-800/60 rounded border border-slate-700/80 text-[11px] space-y-2">
            <h4 className="font-semibold text-amber-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>July 1, 2024 Criminal Law Cutoff</span>
            </h4>
            <p className="text-slate-400 leading-normal">
              Bharatiya Nyaya Sanhita (BNS 2023) and Bharatiya Nagarik Suraksha Sanhita (BNSS 2023) govern offences on or after July 1, 2024. Under Section 358 BNS and Section 531 BNSS savings clauses, earlier offences proceed under IPC 1860 / CrPC 1973.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-[11px] gap-2">
          <p>&copy; {new Date().getFullYear()} NyayaSetu Research Initiative. Public Interest Legal Technology.</p>
          <div className="flex gap-4">
            <Link href="/safety" className="hover:text-slate-300">Safety Policy</Link>
            <Link href="/legal-aid" className="hover:text-slate-300">Legal Aid Pathways</Link>
            <Link href="/assistant" className="hover:text-slate-300">Triage Engine</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
