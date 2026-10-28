# NYAYASETU — PLANNING REVISION CHANGE LOG
**Document Identifier:** `docs/planning/09_REVISION_CHANGELOG.md`  
**Project:** NyayaSetu (AI-Assisted Pre-Litigation Legal Information & Triage Platform)  
**Author:** Principal Software Architect & Lead Systems Engineer  
**Status:** COMPLETE AUDIT REVISION LOG  
**Date:** October 28, 2026 (Local Time: 05:55 IST)  

---

## 1. Summary of Planning Corrections Made

The planning documentation for NyayaSetu has undergone a critical review and rigorous correction across all 9 documents. The key corrections are summarized below:

### 1.1 Dataset & Citation Corrections
- **ILSIC Citation Corrected:** Fixed incorrect arXiv citation. Official publication is now properly cited as:  
  *Shounak Paul, Raghav Dogra, Pawan Goyal, and Saptarshi Ghosh, "ILSIC: Corpora for Identifying Indian Legal Statutes from Queries by Laymen", Findings of the Association for Computational Linguistics: EACL 2026, pages 6725–6746*, `https://aclanthology.org/2026.findings-eacl.354/`, DOI: `10.18653/v1/2026.findings-eacl.354`. (Separated from Goel et al., `arXiv:2602.23371`).
- **Nyaaya Reuse Status Clarified:** Audited official Nyaaya Terms of Use (`nyaaya.org/terms-of-use/`). Discovered direct internal contradiction between the CC BY-NC-SA 2.5 IN grant and the subsequent sentence: *"However, you are not allowed to download or modify it. This may be done only with written consent from us."* Marked permission as **Unresolved / Restricted**. NyayaSetu will **NOT bulk scrape or download Nyaaya content**; instead, NyayaSetu will author original plain-language summaries grounded in primary statutes and official ministry procedural manuals.
- **Licence Terms Verified:** Every candidate dataset now explicitly distinguishes between verified licences (e.g. CC BY 4.0, MIT, Public Domain / NDSAP), unresolved terms, and restricted tasks.

### 1.2 Emergency Contact & Geographic Scope Corrections
- **1090 Corrected to State-Bound:** Removed inaccurate claim that 1090 is a national helpline. Documented that **1090 is the Women Power Line (WPL) operated exclusively by the Uttar Pradesh Police**.
- **Universal vs State Police Numbers Distinguished:**
  - `112`: Universal Emergency Response Support System (ERSS), Ministry of Home Affairs (All-India, 28 States, 8 UTs).
  - `181`: Women Helpline (WHL) scheme, Ministry of Women & Child Development (operational across 35 States & UTs, integrated with One Stop Centres).
  - `1930`: National Cyber Financial Fraud Helpline, Indian Cyber Crime Coordination Centre (I4C), MHA (All-India).
  - `15100`: National Legal Aid Helpline, NALSA, Ministry of Law & Justice (All-India, 24/7 toll-free).
  - `1091`: Dedicated State Police Women Helplines (Delhi Police, Haryana, Tamil Nadu, Karnataka).
- **Zero LLM Dependency:** Verified emergency numbers are hardcoded constants stored in static JSON; an LLM is never allowed to generate contact numbers from memory.

### 1.3 Replacement of Impossible Guarantees with Realistic Engineering Targets
- Replaced *"zero false-negative tolerance"* with a realistic safety target: **Emergency False Negative Rate Target: < 0.5% with asymmetric cost weighting (penalizing missed emergencies 100x over false alarms)**, explicitly acknowledging that automated NLP filters cannot theoretically guarantee zero missed emergencies on unseen or adversarial paraphrases.
- Replaced *"zero hallucination risk"* with: **Retrieval from primary law grounds generated text, but does not eliminate hallucinations**. Enforces post-generation citation verification against stored database IDs.
- Replaced *"guaranteed sub-500ms latency"* and *"guaranteed RAM use"* with: **[Untested Engineering Estimates]** and **[Proposed Engineering Targets]**, subject to empirical benchmarking in Phase 11.
- All performance statements across all documents now carry standard epistemological tags: `[Measured Result]`, `[Proposed Engineering Target]`, `[Untested Engineering Estimate]`, or `[External Published Result]`.

### 1.4 Genuinely Observed Hardware Diagnostics
- Documented exact diagnostic commands, parameters, and execution dates:
  - `uname -a` (Oct 28, 2026): Linux sandbox 7.1.5+kali-amd64 x86_64
  - `lscpu` (Oct 28, 2026): AMD Ryzen 5 5600H (6 cores / 12 threads)
  - `free -h` (Oct 28, 2026): 7.2 GiB total RAM, 3.4 GiB used, ~3.7 GiB available, 4.5 GiB swap
  - `df -h .` (Oct 28, 2026): /dev/nvme0n1p4, 273 GB total, 245 GB used, 15 GB available (95% full)
  - `lspci` & `nvidia-smi` (Oct 28, 2026): AMD Cezanne integrated graphics, zero NVIDIA GPU, zero CUDA
- Hardware Profile 1 (CPU-first, <1.2 GB RAM for ML, <800 MB disk) established as the strict local execution ceiling.

### 1.5 Legal Accuracy & Truthful Privacy Nuance
- **Transitional Savings Clauses Added:** Acknowledged Section 358 BNS 2023 and Section 531 BNSS 2023 savings clauses, recognizing that offences committed prior to July 1, 2024 and ongoing proceedings continue under IPC 1860 and CrPC 1973. Rejected simplistic binary assumptions.
- **Preliminary NALSA Guidance Disclaimer:** Codified that the Section 12 calculator provides preliminary statutory guidance; formal assignment of an advocate is determined by the Member Secretary of DLSA/SLSA.
- **Truthful Limits of Anonymity & Quick-Exit:** Explicitly stated that while local session cookies and database writes are disabled, network-level logs (reverse proxies, Cloudflare, Wi-Fi router DNS, ISP monitoring) and device-level spyware cannot be erased by client-side code.

### 1.6 Authentic Legal Design Palette ("The Colors of the Law")
- Replaced generic SaaS styling with an authentic, authoritative judicial palette:
  - **Imperial Seal Navy (`#0C1E3C`)**
  - **Judicial Crimson / Seal Wax Burgundy (`#881337`)**
  - **Court Table Green (`#064E3B`)**
  - **Legal Parchment / Alabaster (`#FBFBF8`)**
  - **Antique Dharma Gold / Gilt Brass (`#B45309`)**
  - **Slate Rule (`#334155`)**
- Complete elimination of neon gradients, glow cards, floating glass orbs, and generic AI tropes.

---

## 2. What Remains Unverified

1. **Airtable Shared Base Schema (`tbl8gZbwbTpWilNmi`):** The internal records remain protected by Airtable's client-side policy. The Case Profile schema currently in the plan is a well-reasoned, data-minimized assumption until the user provides a CSV or screenshot.
2. **Local MiniLM ONNX Latency on Host Python 3.14:** The estimated ~28 ms CPU inference latency is an untested engineering estimate based on Ryzen 5 5600H benchmarks; it will be formally measured in Phase 7.
3. **Gemini 2.5 Flash Network Round-Trip:** The end-to-end P95 latency is an untested engineering estimate dependent on regional network routing to Google API endpoints; it will be benchmarked in Phase 8.

---

## 3. Decisions Requiring User Approval

Before proceeding to Phase 1 implementation, the following decisions require formal sign-off:
1. **Approval of Hardware Profile 1:** Local CPU execution (TF-IDF + MiniLM ONNX) paired with remote Gemini API for generation.
2. **Approval of Core Seed Statute Scope:** 10 core Central Acts (BNS, BNSS, BSA, Consumer Protection, IT Act, PWDVA, Transfer of Property, NI Act, LSAA, RTI) for the MVP knowledge base.
3. **Approval of Ethical eCourts Integration Strategy:** Manual CNR tracking and authorized deep-linking to `services.ecourts.gov.in`, strictly rejecting automated CAPTCHA scraping.
4. **Approval of the Authoritative Legal UI Palette:** Imperial Seal Navy (`#0C1E3C`), Judicial Crimson (`#881337`), Court Table Green (`#064E3B`), and Legal Parchment (`#FBFBF8`).
5. **Formal Authorization to Begin Phase 1:** Permission to initialize repository foundations (Next.js 15, TypeScript, Tailwind v4, Python virtual environment).
