import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          deep: "#0C1E3C",     // Imperial Seal Navy (Primary text & headers)
          navy: "#0A192F",     // Deep Oxford Blue (Dark navigation surface)
          muted: "#475569",    // Slate Grey (Secondary metadata copy)
          light: "#64748B",    // Light Slate (Subtle labels)
        },
        paper: {
          base: "#FFFFFF",     // Pure White (Cards, active surfaces)
          warm: "#FBFBF8",     // Legal Parchment / Alabaster (Page canvas)
          muted: "#F5F3EF",    // Tinted Bond Paper (Secondary panels)
          border: "#E2E8F0",   // Slate Rule (Dividers & borders)
        },
        legal: {
          green: "#064E3B",    // Court Table Green (Remedies, validated badges)
          "green-light": "#047857",
          "green-subtle": "#F0FDF4",
          crimson: "#881337",  // Judicial Seal Burgundy (Emergency header & alerts)
          "crimson-bright": "#DC2626", // Emergency action buttons
          "crimson-subtle": "#FEF2F2",
          gold: "#B45309",     // Antique Dharma Gold / Gilt Brass (Scales of Justice)
          "gold-subtle": "#FFFBEB",
        },
        amber: {
          warning: "#D97706",  // Fact gap and uncertainty alert
          subtle: "#FEF3C7",
        },
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Menlo", "Monaco", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
