"use client";

import React, { useEffect, useState } from "react";
import { AlertOctagon, ExternalLink } from "lucide-react";

export function QuickExit() {
  const [showNotice, setShowNotice] = useState(false);

  const handleExit = () => {
    // Replace current history entry and redirect immediately to innocuous site
    window.location.replace("https://www.google.com");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleExit}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-medium text-xs sm:text-sm rounded border border-red-900 shadow-sm transition-colors focus:ring-2 focus:ring-red-400"
        title="Instantly exit this website and replace browser tab with Google (Shortcut: Esc)"
      >
        <AlertOctagon className="w-4 h-4 text-red-200" />
        <span>Quick Exit</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-red-900/60 rounded border border-red-400/40 text-red-100 ml-1">
          Esc
        </kbd>
      </button>

      <button
        onClick={() => setShowNotice(!showNotice)}
        className="text-[11px] text-slate-500 hover:text-slate-800 underline ml-2 hidden md:inline"
        title="View browser privacy limitations"
      >
        Limits
      </button>

      {showNotice && (
        <div className="absolute right-0 top-10 z-50 w-80 p-3 bg-white rounded shadow-lg border border-slate-300 text-xs text-slate-700">
          <p className="font-semibold text-red-800 mb-1">Safety & Privacy Notice:</p>
          <p className="mb-2">
            Quick-Exit immediately replaces this webpage with Google. However, it <strong>cannot</strong> delete your browser search history or ISP / Wi-Fi logs.
          </p>
          <p className="text-slate-600">
            If your device or network is monitored, please browse using a private/incognito window or use a trusted public device.
          </p>
          <button
            onClick={() => setShowNotice(false)}
            className="mt-2 text-[11px] font-semibold text-slate-800 hover:underline block text-right"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
