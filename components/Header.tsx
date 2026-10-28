"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, ShieldCheck, HeartHandshake, PhoneCall } from "lucide-react";
import { QuickExit } from "./QuickExit";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "Gateway", href: "/" },
    { label: "Triage", href: "/assistant" },
    { label: "Knowledge Hub", href: "/knowledge" },
    { label: "Pathways & Checklist", href: "/checklist" },
    { label: "Case Tracker", href: "/case-tracker" },
    { label: "Women Safety", href: "/safety", icon: PhoneCall },
    { label: "Legal Aid", href: "/legal-aid", icon: HeartHandshake }
  ];

  return (
    <header className="sticky top-0 z-40 bg-ink-navy text-white border-b border-ink-deep shadow-md">
      {/* Top emergency & anonymous status bar */}
      <div className="bg-ink-deep border-b border-slate-800/80 px-4 py-1 text-[11px] flex justify-between items-center text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anonymous Session: No Client Tracking Cookies</span>
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            National Emergency: <strong className="text-white">112</strong> &bull; Women Helpline: <strong className="text-white">181</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <QuickExit />
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-legal-gold flex items-center justify-center text-ink-navy shadow-inner">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-serif font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  NyayaSetu
                </span>
                <span className="text-xs text-amber-400/90 font-medium">
                  न्यायसेतु
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">
                Evidence-Grounded Legal Triage & Information
              </p>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-amber-300 border border-slate-700 shadow-inner"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
