# NYAYASETU — UI/UX DESIGN SYSTEM & INTERFACE SPECIFICATION (REVISED)
**Document Identifier:** `docs/planning/05_UI_UX_PLAN.md`  
**Project:** NyayaSetu (AI-Assisted Pre-Litigation Legal Information & Triage Platform)  
**Author / Lead UI/UX Designer:** Principal UI/UX Designer & Accessibility Specialist  
**Status:** AUDITED DESIGN SPECIFICATION — REVISED VERSION  
**Revision Date:** October 28, 2026 (Local Time: 05:50 IST)  

---

## 1. Visual Identity & Brand Philosophy: "The Colors of the Law"

NyayaSetu’s interface is designed to evoke the quiet dignity, solemnity, and institutional credibility of an esteemed constitutional institution or apex court portal. 

It explicitly rejects all generic "AI chatbot" aesthetics — no glowing neon cyan borders, no floating glassmorphism orbs, no pulsating purple gradients, and no tech-marketing hype.

### 1.1 Authentic Legal & Judicial Color Palette
The color system is derived from the centuries-old visual traditions of Indian and common-law jurisprudence:
- **Imperial Seal Navy / Oxford Blue (`#0C1E3C` / `#0A192F`):** Symbolic of constitutional authority, bar council robes, and judicial crests. Acts as the primary anchor for headers, primary typography, and institutional navigation.
- **Judicial Crimson / Seal-Wax Burgundy (`#7F1D1D` / `#881337`):** Symbolic of sovereign seals, judicial bench leather, gazette stamps, and high-priority legal warnings. Used for emergency calls-to-action and official alerts.
- **Legal Court Green (`#064E3B` / `#047857`):** Symbolic of the traditional green baize cloth covering Indian courtroom advocate tables and district court registry ledgers. Used for positive verification tags and statutory remedies.
- **Legal Parchment / Judicial Alabaster (`#FBFBF8` / `#F5F3EF`):** Symbolic of traditional Indian non-judicial stamp paper and court bond paper. Replaces harsh #FFFFFF with a warm, glare-free reading plane for reading statutes.
- **Antique Dharma Gold / Gilt Brass (`#92400E` / `#B45309`):** Representative of the Ashoka Pillar / Dharma Chakra / Scales of Justice. Used sparingly for official citable badges and verified shields.
- **Muted Slate Rule (`#334155` / `#CBD5E1`):** Structural borders and dividers providing clean, disciplined spatial structure.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DESIGN TOKEN PALETTE                            │
├───────────────────┬──────────────┬─────────────────────────────────────┤
│ Token Name        │ Hex Code     │ Semantic Purpose                    │
├───────────────────┼──────────────┼─────────────────────────────────────┤
│ `--ink-deep`      │ `#0C1E3C`    │ Imperial Seal Navy (Primary text)   │
│ `--ink-muted`     │ `#475569`    │ Slate Grey (Secondary copy)         │
│ `--paper-base`    │ `#FFFFFF`    │ Pure White (Card containers)        │
│ `--paper-warm`    │ `#FBFBF8`    │ Legal Parchment (Page background)   │
│ `--paper-border`  │ `#E2E8F0`    │ Slate Divider Line                  │
│ `--legal-green`   │ `#064E3B`    │ Court Table Green (Remedies & tags) │
│ `--legal-crimson` │ `#881337`    │ Seal Burgundy (Emergency alerts)    │
│ `--dharma-gold`   │ `#B45309`    │ Antique Brass (Official badges)     │
│ `--warning-amber` │ `#D97706`    │ Cautionary Advice / Fact Gaps       │
└───────────────────┴──────────────┴─────────────────────────────────────┘
```

---

## 2. Typography Scale & Layout System

### 2.1 Typographic Hierarchy
- **Headings & Institutional Titles:** `Source Serif 4` (Google Fonts / Self-hosted woff2). Replicates the classical typography of the All India Reporter (AIR), Supreme Court Reports (SCR), and Parliamentary Gazettes.
- **Body & Interactive Controls:** `Inter` (Variable). Modern geometric clarity ensuring maximum readability across mobile screens and low-resolution displays.
- **Statutory Sections, CNR Numbers & Code:** `JetBrains Mono`. Monospaced precision for statutory section identifiers (e.g. `BNS §103(1)`), 16-character CNR numbers, and date ranges.

```css
/* Typography Scale */
--text-xs:   0.75rem / 1.00rem; /* 12px - Footnotes & Gazette Dates */
--text-sm:   0.875rem / 1.25rem; /* 14px - Metadata, Labels, Chips */
--text-base: 1.00rem / 1.60rem; /* 16px - Primary Reading Body */
--text-lg:   1.125rem / 1.75rem; /* 18px - Sub-section Headings */
--text-xl:   1.25rem / 1.75rem; /* 20px - Card Titles */
--text-2xl:  1.50rem / 2.00rem; /* 24px - Section Titles */
--text-3xl:  1.875rem / 2.25rem; /* 30px - Page Titles */
--text-4xl:  2.25rem / 2.50rem; /* 36px - Main Civic Gateway Banner */
```

---

## 3. Core Component Library Specification

### 3.1 The Persistent Quick-Exit Banner (Realistic Privacy Protection)
- **Visual Position:** High-contrast bar on `/safety` and `/triage` routes.
- **Button Styling:** Judicial Crimson background (`#881337`) with white bold text: `[ESC] Quick Exit to Google`.
- **Realistic Functional Behavior:**
  1. Instantly redirects active browser window to `https://www.google.com`.
  2. Replaces history state via `window.location.replace()`.
  3. Purges all in-memory client `sessionStorage`.
- **Honest Boundary Notice:** The interface includes a subtle notice explaining what Quick-Exit **cannot do**:  
  *"Quick Exit clears this tab, but cannot erase Wi-Fi router logs, ISP records, or surveillance software on your device."*

### 3.2 Sourced Legal Answer Card (5-Part Presentation)
Every grounded answer is structured into 5 clear, un-conflated segments:
1. **Plain-Language Summary:** 2-3 sentence overview explaining citizen rights in plain language.
2. **Authoritative Statutory Grounding:** Clickable citation pills (e.g. `[BNS 2023, s. 316]`) with verified database IDs.
3. **Actionable Pre-Litigation Steps:** Chronological, step-by-step procedural guidance.
4. **Uncertainty & Fact Gaps:** Clear amber warning highlighting unprovided facts (e.g., transaction date, jurisdiction).
5. **Next Legal Route:** Verified referral to the appropriate DLSA clinic or official grievance portal (e.g. e-Daakhil).

### 3.3 The Statutory Source Drawer
- An accessible slide-over drawer triggered by clicking any citation tag.
- Displays:
  - Act Title, Act Year, Section Number, Section Heading.
  - Verbatim legislative text as published in the Official Gazette.
  - Transitional note (e.g. *"Corresponds to IPC Section 420; penalty revised"*).
  - Bailable / Cognizable status badges.
  - Direct outbound link to official `indiacode.nic.in` gazette record.

---

## 4. Route Architecture & Screen Specifications

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NYAYASETU ROUTE DIRECTORY                       │
├─────────────────────┬──────────────────────────────────────────────────┤
│ Route Path          │ Screen Name & Primary Purpose                    │
├─────────────────────┼──────────────────────────────────────────────────┤
│ `/`                 │ Civic Landing & Unified Triage Gateway           │
│ `/assistant`        │ Evidence-Grounded Legal Assistant (Split-Screen) │
│ `/triage`           │ Structured Multi-Step Legal Risk & Needs Intake  │
│ `/safety`           │ Women Safety, Domestic Abuse & Emergency Portal  │
│ `/knowledge`        │ Bare Acts Repository & IPC-to-BNS Comparator     │
│ `/legal-aid`        │ NALSA Section 12 Calculator & DLSA Directory     │
│ `/simulator`        │ Educational Dispute Flowchart & Outcome Explorer │
│ `/tracker`          │ Personal Case Hearing Diary & eCourts CNR Linker │
│ `/checklists`       │ Pre-Litigation Guides & Notice Draft Templates   │
│ `/privacy`          │ Privacy Policy, Data Minimization & Audit Logs   │
└─────────────────────┴──────────────────────────────────────────────────┘
```

### Detailed Screen Blueprints

#### Screen 1: Homepage & Triage Gateway (`/`)
- **Visual Aesthetic:** Impeccably clean, authoritative legal styling (Imperial Seal Navy headers, Legal Parchment background, crisp typography).
- **Core Action:** Large, centered input field asking: *"Describe your legal dispute or question in plain language..."*
- **Immediate Example Scenarios:** `[Landlord kept my security deposit]`, `[Online transaction fraud]`, `[Received cheque bounce notice]`, `[Physical threat / harassment]`.
- **Three Core Gateway Portals:**
  1. **Emergency & Safety Route (Seal Burgundy):** Instant bypass for active threats and domestic violence.
  2. **Grounded Legal Assistant (Court Green):** Plain-language sourced statutory analysis.
  3. **Free Legal-Aid Check (Oxford Blue):** Preliminary Section 12 eligibility calculation.

#### Screen 2: Grounded Legal Assistant (`/assistant`)
- **Layout:** Split-screen interface (60% Conversational Workspace, 40% Live Statutory Drawer).
- **Date Selector:** Clear incident date picker prompting user for the date of occurrence to enforce Section 358 BNS / Section 531 BNSS transitional rules.

#### Screen 3: Women Safety & Emergency Portal (`/safety`)
- **Zero Chat Requirement:** All emergency information is displayed statically on page load.
- **Geographically Accurate Numbers:**
  - **112:** Universal Emergency Response Support System (All-India).
  - **181:** Women Helpline (35 States & UTs, integrated with One Stop Centres).
  - **State-Specific Card:** If the citizen selects **Uttar Pradesh**, `1090` (Women Power Line) is rendered with a clear badge: `[State Service: UP Police]`. If **Delhi**, `1091` is shown. Universal fallback numbers remain prominent.

#### Screen 4: Legal Knowledge Hub & Bare Acts (`/knowledge`)
- Section-by-section bare acts reader with permanent permalinks.
- Side-by-side IPC $\leftrightarrow$ BNS, CrPC $\leftrightarrow$ BNSS, and IEA $\leftrightarrow$ BSA transition converter.

#### Screen 5: NALSA Free Legal-Aid Finder (`/legal-aid`)
- **3-Step Eligibility Wizard:** Evaluates Section 12 criteria (Women, Children, SC/ST, Industrial Worker, Disabled, Custody, Income ceiling).
- **Preliminary Guidance Disclaimer:** Explicitly notes:  
  *"This assessment provides preliminary guidance based on statutory criteria. Final formal assignment of an advocate is determined by the Member Secretary of your District Legal Services Authority (DLSA) upon application submission."*

#### Screen 6: Legitimate Case Tracker (`/tracker`)
- **CNR Form:** 16-character validation that generates a pre-filled direct link to `https://services.ecourts.gov.in/ecourtindia_v6/casestatus/`.
- **Demonstration Mode:** Clearly labeled banner: `[DEMO MODE: Synthetic Civil Suit Lifecycle]`.

---

## 5. Accessibility & Responsive Standards (WCAG 2.1 AA)

1. **High Contrast:** Every text/background pairing exceeds WCAG 2.1 AA (4.5:1) and AAA (7:1 for headings).
2. **Keyboard Navigation:** Full keyboard navigation with visible focus rings (`outline: 2px solid #064E3B; outline-offset: 2px`). `Esc` key mapped to Quick Exit.
3. **Screen Reader Optimization:** Structured ARIA roles, live regions for state transitions, and descriptive button labels.
4. **Touch Target Size:** Minimum 48px $\times$ 48px for all mobile interactive controls.
