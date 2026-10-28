# NYAYASETU — REFERENCE PRODUCT AUDIT & REA TOOLING REPORT (REVISED)
**Document Identifier:** `docs/planning/01_REFERENCE_AUDIT.md`  
**Project:** NyayaSetu (AI-Assisted Pre-Litigation Legal Information & Triage Platform)  
**Author / Lead Auditor:** Principal Software Architect, UI/UX Designer & Security Reviewer  
**Status:** AUDITED PLANNING REPORT — REVISED VERSION  
**Revision Date:** October 28, 2026 (Local Time: 05:51 IST)  

---

## 1. REA Tooling Environment Audit

### 1.1 Available Tooling Inspection
Before conducting reference product investigations, an audit of the current agent environment was performed to identify active MCP tools and reverse-engineering capabilities:
- **Active MCP Servers:**
  - `data-agent-kit-plugin_dak-notebook` (Jupyter notebook interaction tools)
  - `data-agent-kit-plugin_dak-viz` (Visualization tools)
  - `gemini-api_gemini-api-docs` (Official Gemini API documentation retrieval)
  - `science_biomolecular_structure_viewer_mcp` (3D Mol* molecular viewer)
- **REA Skill Status:**
  - The skill file `/home/yashraj/.agents/skills/reverse-engineer-anything/SKILL.md` is present on the filesystem.
  - However, the **REA MCP server is not registered in this runtime session**, and specialized native browser-instrumentation tools (such as Chrome DevTools MCP or automated Playwright screenshotting daemon) are not active.
- **Identified Tooling Limitations & Non-Intrusive Fallback Protocol:**
  - *Limitation:* Interactive browser DOM tracing, automated headless browser clicks, and graphical screenshot capture are unavailable in this environment.
  - *Authorized Non-Intrusive Fallback:* 
    1. HTTP-based DOM and markdown retrieval via `read_url_content` (standards-compliant, read-only).
    2. Deep structure and schema extraction using Python-based regex parsers for embedded metadata (`window.initData`, `<script type="application/ld+json">`, OpenGraph tags, and HTML navigation trees).
    3. Direct inspection of official government endpoints, HTTP headers, robots.txt, and public API limits via terminal diagnostics (`curl`).
    4. Strict adherence to ethical research boundaries: no bypass of access controls, no CAPTCHA solving, no authenticated session token harvesting, and no downloading of copyrighted proprietary material.

---

## 2. Reference Product Audits

---

### Reference A: Nyaaya (India’s Laws Explained)
- **Primary URL:** `https://nyaaya.org/`
- **Associated Subdomains:** `https://hindi.nyaaya.org/`, `https://kannada.nyaaya.org/`
- **Audited Pages:**
  - Homepage (`/`)
  - Legal Explainers Hub (`/legal-explainers/`)
  - Terms of Use and Disclaimer (`/terms-of-use/`)
  - Thematic sections: *Family & Marriage*, *Money & Property*, *Crimes & Violence*, *Police & Courts*, *Citizen Rights & Constitution*
  - Resources Hub (`/resources/`): *Step-by-step Guides*, *Sample Forms & Templates*, *Statewise Information*

#### Key Observations & Information Architecture (IA)
1. **Thematic Grouping (9 Core Themes):**
   - Nyaaya divides the Indian legal landscape into 9 citizen-friendly themes: *Family & Marriage*, *Money & Property*, *Crimes & Violence*, *Police & Courts*, *Labour & Employment*, *Health & Environment*, *Citizen Rights & Constitution*, *Government & Elections*, and *Media & IP*.
   - *Mental Model:* Organizes content by practical citizen dispute (e.g. "Rent & Eviction", "Cheque Bounce") rather than formal statutory titles.
2. **The SARAL Framework (Simple, Actionable, Reliable, Accessible Legal Information):**
   - Explainers follow a consistent sequence: (1) What does the law say? (2) Who does it apply to? (3) What are your rights? (4) What immediate remedies are available? (5) Step-by-step complaint procedure.

#### Critical Intellectual Property & Licence Audit (Nyaaya Terms of Use)
- **Observed Legal Clause:** Nyaaya’s official Terms of Use (`https://nyaaya.org/terms-of-use/`) contains two internally conflicting clauses:
  - Clause 1: *"Content published on this website ... is available for distribution on a Creative Commons License (CC BY-NC-SA 2.5 IN)..."*
  - Clause 2: *"We grant you the license to access and make personal use of this website. However, you are not allowed to download or modify it. This may be done only with written consent from us."*
- **Audit Conclusion & Engineering Decision:**
  - Because Clause 2 explicitly forbids downloading or modifying content without written consent, **bulk automated scraping, downloading, or programmatic ingestion of Nyaaya’s text cannot be assumed to be authorized**.
  - **Resolution for NyayaSetu:** NyayaSetu will treat Nyaaya purely as a structural conceptual reference. **NyayaSetu will author its own original plain-language summaries and procedural guides**, directly grounded in the primary statutes and official ministry guidelines (e.g., Consumer Protection Rules 2020, NCDRC guidelines, National Cyber Crime portal workflows).

---

### Reference B: IndiaCode by eCourtsIndia
- **Primary URL:** `https://indiacode.ecourtsindia.com/`
- **Audited Pages:**
  - Homepage (`/`)
  - Central Acts Directory (`/acts/`)
  - Criminal Law Transition Portal (`/ipc-to-bns/`, `/bns/`, `/bnss/`, `/bsa/`)
  - Section-level permalink structure (e.g., `/bns/section/103/`)

#### Key Observations & Information Architecture (IA)
1. **"Every Act. Every Section. One Page Each":**
   - 911 Central Acts and 9,175 State Acts (2,72,623 sections) published with permanent, canonical, citable URLs.
2. **Old Law and New Law Side-by-Side (Criminal Transition):**
   - Direct transitional mapping between:
     - Indian Penal Code (IPC 1860) $\leftrightarrow$ Bharatiya Nyaya Sanhita (BNS 2023)
     - Code of Criminal Procedure (CrPC 1973) $\leftrightarrow$ Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)
     - Indian Evidence Act (IEA 1872) $\leftrightarrow$ Bharatiya Sakshya Adhiniyam (BSA 2023)
   - Crucial for Indian legal disputes: Section 358 BNS and Section 531 BNSS provide that offences committed prior to July 1, 2024 continue under IPC/CrPC, while offences committed on or after July 1, 2024 fall under BNS/BNSS.
3. **Disciplined Typographic Hierarchy:**
   - Body font: `Source Serif 4` (high legibility, judicial authority).
   - UI elements: `Inter` (clean geometric sans-serif).
   - Legal codes, section numbers, citations: `JetBrains Mono`.

#### Patterns Adopted for NyayaSetu
- Permanent, citable URLs for every statutory section.
- Side-by-side IPC $\leftrightarrow$ BNS interactive transition converter.
- Inclusion of legislative provenance metadata (Act year, number, commencement date, gazette URL).

---

### Reference C: Official eCourts Services (eCommittee, Supreme Court of India)
- **Primary URL:** `https://services.ecourts.gov.in/ecourtindia_v6/casestatus/`
- **Audited Features:**
  - Case Status Search by: CNR Number, Party Name, Case Number, Filing Number, Advocate Name, FIR Number, Act Type.
  - Dynamic image CAPTCHA (5-6 alphanumeric characters) gating every single lookup query.
  - Short-lived session cookies and IP rate limiting.

#### Ethical Integration Strategy
- **Strict Compliance:** NyayaSetu **will NOT** implement headless scrapers, OCR-based CAPTCHA breaking, or proxy rotation to harvest eCourts data. Doing so violates government portal terms and IT Act guidelines.
- **Planned Workflow:**
  1. **Personal Case Diary (Manual Entry):** Citizens can securely record their 16-character CNR number, case title, court name, advocate name, and next hearing date in a private local/authenticated tracker.
  2. **Smart Official Deep-Link Generator:** NyayaSetu validates the 16-character CNR format and generates a pre-formatted link directly directing the citizen to the official eCourts CNR lookup interface.
  3. **Demonstration & Educational Mode:** A clearly labelled synthetic case tracker that visualizes the standard lifecycle of an Indian civil/criminal dispute for educational literacy.

---

### Reference D: NALSA (National Legal Services Authority)
- **Primary URL:** `https://nalsa.gov.in/`
- **Associated Services:**
  - National Legal Aid Helpline: **15100** (`https://nalsa15100.in/`)
  - Legal Services Application Management System (LSAMS): `https://scourtapp.nic.in/lsams/`
  - Hierarchy: SCLSC $\rightarrow$ SLSA $\rightarrow$ DLSA $\rightarrow$ TLSC.

#### Key Statutory & Operational Findings
1. **Section 12 of the Legal Services Authorities Act, 1987 (Eligibility for Free Legal Aid):**
   - Free legal services are a statutory entitlement in India for:
     - (a) A member of a Scheduled Caste (SC) or Scheduled Tribe (ST);
     - (b) A victim of trafficking in human beings or *begar*;
     - (c) A woman or a child;
     - (d) A person with disability;
     - (e) A person under circumstances of underserved want (mass disaster, ethnic violence, flood, earthquake, industrial disaster);
     - (f) An industrial workman;
     - (g) In custody (including protective custody or psychiatric hospital);
     - (h) A person having an annual income less than the ceiling prescribed by the respective State Government.
2. **Preliminary Guidance vs Formal Determination:**
   - NyayaSetu's Section 12 wizard provides **preliminary statutory guidance only**. The final formal determination and assignment of an advocate rests with the Member Secretary of the DLSA/SLSA upon application review.

---

## 3. Investigation of Provided Airtable Reference

- **Provided Target URL:** `https://airtable.com/appukFbwYnTMxuibS/shrTPD31EfaMsa1af/tbl8gZbwbTpWilNmi`

### 3.1 Technical Audit & Findings
1. **Access Gating & Platform Behavior:**
   - Inspection via automated HTTP request reveals standard Airtable SPA bootstrap markup containing CSRF tokens and client tracking (`window.initData`), but the underlying table records and column schema are fetched asynchronously via Airtable's internal endpoint:  
     `GET /v0.3/view/shrTPD31EfaMsa1af/readSharedViewData`.
   - Direct API request to `readSharedViewData` returns:  
     `Request to GET /v0.3/view/shrTPD31EfaMsa1af/readSharedViewData on airtable.com not allowed by policy`.
   - The endpoint requires interactive browser execution with session credentials or is subject to network policy restrictions in the sandbox environment.
2. **Honesty Principle (Strict Compliance with User Instructions):**
   - The raw schema and records of this specific Airtable base could not be directly extracted due to Airtable's client-side policy restrictions.
   - **Input Requested from User:** Please provide a CSV export, screenshot, or column listing of this Airtable base to verify exact field names.

### 3.2 Provisional Case Profile Schema (Data-Minimized Design)

| Field Name | Type | Sensitivity | Classification | Rationale & Retention Policy |
| :--- | :--- | :--- | :--- | :--- |
| `profile_id` | UUID | Internal | System Key | Non-identifying unique key. |
| `legal_category` | Enum | Low | Derived | `Consumer`, `Property_Tenancy`, `Cyber_Financial`, `Personal_Safety`, `Family`, `Labour`, `Other`. |
| `incident_date` | Date / Range | Medium | Required | **Crucial for Section 358 BNS / 531 BNSS savings clauses** and statutory limitation periods. |
| `jurisdiction_state` | Enum (Indian States) | Medium | Required | Identifies State Amendments (e.g. Rent Control, Police Rules, DLSA income ceiling). |
| `urgency_level` | Enum | Critical | Derived | `Routine_Informational`, `High_Risk`, `Emergency_Immediate`, `Uncertain`. |
| `dispute_summary` | Text | Sensitive | User Input | Plain-language description of problem. Redacted of PII before indexing. |
| `monetary_value` | Decimal (INR) | Medium | Optional | Determines pecuniary jurisdiction (e.g. District vs. State Consumer Commission). |
| `adverse_party_type` | Enum | Low | Optional | `Individual`, `Private_Company`, `Bank/Financial_Institution`, `Government_Authority`, `Landlord/Tenant`. |
| `has_police_complaint` | Boolean | Medium | Optional | Distinguishes pre-FIR vs. post-FIR triage. |
| `relief_sought` | Enum | Low | Optional | `Refund`, `Injunction`, `Safety_Protection`, `Damages`, `Clarification`. |

#### Data Minimization & Privacy Reality
- **Forbidden Fields:** Full Aadhaar number, PAN card, bank account numbers, passwords/OTPs, exact home addresses, names of minor victims, or allegations against named private individuals.
- **Anonymous Mode Reality:** In-memory `sessionStorage` execution only. Server logs sanitize query strings. The UI truthfully notes that local anonymous mode cannot erase ISP/network-level monitoring.
