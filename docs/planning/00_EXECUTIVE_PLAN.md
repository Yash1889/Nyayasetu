# NYAYASETU — EXECUTIVE TECHNICAL PLAN (REVISED)
**Document Identifier:** `docs/planning/00_EXECUTIVE_PLAN.md`  
**Project:** NyayaSetu (AI-Assisted Pre-Litigation Legal Information & Triage Platform)  
**Academic Basis:** “NyayaSetu: A Risk-Aware Retrieval-Augmented Framework for Evidence-Grounded Legal Information and Pre-Litigation Triage” (Dubey, Gupta, Singh, Vibhuti, & Dubey, 2026)  
**Author / Lead Architect:** Principal Software Architect & Applied ML Engineer  
**Status:** PROPOSED PLANNING ARCHITECTURE — REVISED VERSION  
**Revision Date:** October 28, 2026 (Local Time: 05:51 IST)  

---

## 1. Executive Summary & Core Identity

**NyayaSetu** ("Bridge to Justice") is designed as an evidence-grounded, risk-aware pre-litigation legal information and civic triage platform for Indian citizens. It bridges the critical divide between an informal, distressed layperson query and formal legal pathways before formal court litigation begins.

### 1.1 What NyayaSetu Is
- A **pre-litigation civic intelligence tool** that helps citizens comprehend their legal situation, rights, and remedies in plain language.
- A **risk-aware triage system** that separates legal context classification from urgency assessment, routing emergencies directly to verified human safety services.
- A **hybrid retrieval-augmented legal information engine** that enforces strict evidence-sufficiency checks and provides verifiable statutory citations.
- A **civic rights hub** providing practical procedural guides, Section 12 preliminary legal-aid eligibility assessments, and pre-litigation preparation checklists.

### 1.2 What NyayaSetu Is NOT (Strict Non-Negotiable Boundaries)
- **Not a Lawyer:** It does not provide legal representation, advocate-client privilege, legal strategy, or personalized legal advice.
- **Not a Court or Police Station:** It cannot register formal First Information Reports (FIRs), grant injunctions, issue summons, or accept pleadings.
- **Not a Predictive Adjudication Tool:** It **strictly does not predict court win/loss percentages**, judge-specific outcomes, or calculate personal liability probabilities. Prior research attempting XGBoost-based case outcome prediction (e.g. Srivastava et al., 2026) operates on retrospective appellate judgments and is fundamentally unsuitable and deceptive for citizen pre-litigation triage.
- **Not an Unconstrained Chatbot:** It does not rely on an LLM to remember statutory section numbers or emergency telephone numbers from memory.

---

## 2. Core Architectural Thesis (Derived from Research Paper)

The core technical contribution established by Dubey et al. (2026) is the principle of **Interpretation and Routing Before Generation**:

```
[User Query q] 
       │
       ▼
[Normalization & Preprocessing]
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
[Context Classification c]              [Risk Assessment r]
(Consumer, Property, Cyber,              (Normal, High Risk,
 Personal Safety, Family, etc.)          Emergency, Uncertain)
       │                                         │
       └────────────────────┬────────────────────┘
                            ▼
                    [Routing Policy]
       ┌────────────────────┼────────────────────┬────────────────────┐
       ▼                    ▼                    ▼                    ▼
   [Normal]            [High Risk]          [Emergency]          [Uncertain]
       │                    │                    │                    │
[Hybrid Retrieval]   [Cautious Policy:     [Deterministic       [Clarification /
(BM25 + Dense)        Evidence & Safety]    Safety Response:     Abstention Gate]
       │                    │               112 / 181 / 1090*]        │
[Evidence Gate]             │               (Bypass LLM Gen)          │
       │                    │               *State-bound              │
[Grounded LLM Gen]          │                                         │
       │                    │                                         │
[Output Validation] ◄───────┘                                         │
       │                                                              │
       └────────────────────┬─────────────────────────────────────────┘
                            ▼
                    [Final Output to User]
```

### Key Pillars of the System
1. **Urgency-First Routing:** When physical violence, domestic assault, or imminent personal harm is detected, the generative RAG pipeline is **bypassed**. The user receives deterministic, pre-reviewed safety protocols, verified hotlines, and quick-exit options.
2. **Decoupled Context vs. Risk:** A query regarding domestic violence law can be purely informational (e.g., academic query on PWDVA 2005), whereas a brief message ("he is outside banging on the door") is an immediate emergency without mentioning a single legal term.
3. **Evidence Sufficiency Gate:** Before generating an answer, retrieved statutory material is evaluated against relevance and currency thresholds. If the evidence is insufficient or ambiguous, the system **abstains or asks targeted follow-up questions** rather than guessing.
4. **Claim-to-Source Traceability:** Every statutory claim made in generated text must trace directly to a verified, citable provision in the primary legal database (with Act title, year, section number, and official gazette link).

---

## 3. Product Scope & Module Recommendations

### 3.1 Recommended MVP Modules (Phase 1)
| Module | Description | Implementation Strategy |
| :--- | :--- | :--- |
| **1. AI Legal Assistant** | Conversational interface grounded in primary Indian legislation. Produces plain-language explanations with statutory citations. | Hybrid retrieval (BM25 + small multilingual dense embeddings) + Evidence Gate + Provider-agnostic generation API. |
| **2. Risk-Aware Triage Engine** | Dual-pipeline query classification: legal subject domain + 4-tier risk routing (Normal, High-Risk, Emergency, Uncertain). | Fast Rule-Based Deterministic Safety Policy + Scikit-learn TF-IDF baseline classifier. Asymmetric cost optimization. |
| **3. Women Safety & Emergency Hub** | Dedicated high-priority portal for gender-based violence, domestic abuse, and harassment. | Instant deterministic interface. Verified national (112, 181) and state police helplines (1090 UP, 1091 Delhi). Quick-Exit mechanism. Zero LLM dependency. |
| **4. Legal Knowledge Hub (Bare Acts)** | Searchable, readable bare acts repository with provision-level permalinks and IPC-to-BNS transition mapping. | Curated seed corpus (BNS, BNSS, BSA, Consumer Protection 2019, IT Act 2000, PWDVA 2005, RTI 2005). Section-by-section reader inspired by IndiaCode. |
| **5. NALSA & Free Legal-Aid Finder** | Step-by-step preliminary eligibility calculator for free legal services under Section 12 of the Legal Services Authorities Act, 1987. | Deterministic rule wizard + verified DLSA/SLSA official contact directory + deep-link to official NALSA LSAMS portal. |
| **6. Educational Outcome Simulator** | Educational dispute scenario explorer. Breaks down procedural stages, evidence requirements, and lawyer discussion points. | Curated procedural flowcharts (e.g. Consumer Commission process, Section 138 NI Act cheque bounce). **Zero statistical win/loss predictions.** |
| **7. Legitimate Case Tracker** | Personal hearing diary and official eCourts CNR link generator. | Secure client-side/authenticated case diary. Smart deep-linking to `services.ecourts.gov.in`. Clearly labelled synthetic demonstration mode. |
| **8. Pre-Litigation Checklists** | Actionable preparation checklists for filing consumer grievances, cyber complaints (1930), and RTI requests. | Structured JSON templates mapped to statutory timelines (e.g., limitation periods, statutory notice periods). |

### 3.2 Modules and Features Postponed (Phase 2 & Beyond)
- **Commercial Lawyer Marketplace:** *POSTPONED (High Risk).* Scraping or listing private lawyers violates Bar Council of India (BCI) advertising rules (Rule 36). Focus exclusively on verified government legal aid (NALSA/DLSA).
- **Automated eCourts CAPTCHA Scraping:** *REJECTED.* Bypassing government CAPTCHAs violates terms of service and risks IP blocking. NyayaSetu implements honest citizen deep-linking instead.
- **Predictive Case Outcome Classifiers:** *REJECTED.* Retrospective appellate judgments represent extreme outliers and have zero validity for citizen pre-litigation triage.
- **Broad Education Telemetry (DIKSHA / UDISE+):** *REJECTED.* Telemetry datasets contain zero legal rights. Only the Right to Education (RTE) Act 2009 is retained in the Knowledge Hub.

---

## 4. Hardware Constraints & Environmental Reality

A physical diagnostic of the host environment was performed on October 28, 2026:

| Resource | Verified Measurement & Method | Engineering Implication |
| :--- | :--- | :--- |
| **CPU** | AMD Ryzen 5 5600H (6 Cores / 12 Threads) via `lscpu` [Measured] | Capable CPU for parallel lexical search, Scikit-learn inference, and fast tokenization. |
| **RAM** | **7.2 GiB Total** (3.4 GiB Used, **3.7 GiB Available**, 4.5 GiB Swap) via `free -h` [Measured] | **Strictly constrained memory.** Loading a 7B or 13B LLM locally is completely impossible. Embedding models must be <500 MB. |
| **GPU / VRAM** | Integrated AMD Radeon Vega Graphics (Shared RAM). **No NVIDIA GPU, no CUDA, no discrete VRAM.** via `lspci`, `nvidia-smi` [Measured] | All local ML inference must run on CPU (or ONNX Runtime CPU). PyTorch CUDA is unavailable. |
| **Disk Storage** | **273 GB Total, 245 GB Used, ONLY 15 GB Free (95% full!)** via `df -h .` [Measured] | **Extreme disk constraint.** Downloading raw legal corpora (e.g. 50+ GB Open India Law) will crash the system. Corpora must be strictly curated seed sets (<25 MB). |
| **Python** | Python 3.14.7 via `python3 --version` [Measured] | Bleeding-edge Python version; dependencies will run via standard wheels or ONNX Runtime. |
| **Node.js** | Node.js v24.19.0, npm 12.0.2 via `node -v` [Measured] | Modern, stable runtime for Next.js 15 App Router. |

**Hardware Profile Verdict:** NyayaSetu must be engineered strictly on **Profile 1 (CPU-Only / Memory-Constrained Environment)**:
- ML models: Scikit-learn Linear models (<50 MB RAM [Untested Est.]) + MiniLM ONNX (<400 MB RAM [Untested Est.]) running on CPU.
- Generative LLM: Decoupled provider-agnostic external API (Gemini 2.5 Flash / 1.5 Flash via `google-genai` SDK) with strict API key protection.

---

## 5. Major Risks & Realistic Mitigations

1. **Hallucinated Statutory Citations:**
   - *Risk:* An LLM cites non-existent sections (e.g. "Section 498B of IPC").
   - *Mitigation:* Evidence Gate verifies citations against actual stored primary source IDs. Unmatched citations trigger rejection or regeneration. Retrieval from primary law grounds the model, but does not eliminate hallucinations.
2. **Missed Emergency in Domestic Violence / Abuse:**
   - *Risk:* An automated filter misses an urgent cry for help.
   - *Mitigation:* While zero false negatives cannot be theoretically guaranteed by an automated model, the system applies asymmetric cost weighting (penalizing missed emergencies 100x over false alarms) and provides a permanent, prominent emergency safety button across all pages.
3. **Repealed Law (IPC vs BNS Transition Nuance):**
   - *Risk:* Treating July 1, 2024 as a simplistic binary switch without considering Section 358 BNS and Section 531 BNSS savings clauses (which mandate that prior offences and ongoing proceedings continue under IPC/CrPC).
   - *Mitigation:* Incident date is collected and evaluated alongside statutory savings clauses, presenting BNS as primary law while explicitly noting transitional procedural rules.
4. **Limits of Privacy & Quick-Exit:**
   - *Risk:* User mistakenly believes Quick-Exit erases device spyware or ISP logs.
   - *Mitigation:* UI explicitly states that Quick-Exit clears local DOM and sessionStorage, but cannot erase Wi-Fi router logs or device spyware.
5. **Local Hardware Resource Exhaustion:**
   - *Risk:* Downloading multi-gigabyte corpora crashes the machine due to 15 GB free disk.
   - *Mitigation:* Curated seed corpus restricted to <25 MB JSON.

---

## 6. Open Decisions Requiring User Approval

1. **Approval of Hardware Profile 1:** Local CPU execution (TF-IDF + MiniLM ONNX) paired with remote Gemini API.
2. **Approval of Core Seed Statute Scope:** 10 core Central Acts for MVP knowledge base.
3. **Approval of Ethical eCourts Strategy:** Honest manual CNR diary + authorized deep-linking, rejecting CAPTCHA scrapers.
4. **Airtable Schema Confirmation:** Proceeding with the data-minimized Case Profile schema unless user provides a CSV export.
5. **Approval of Frontend Aesthetic:** Authoritative legal design system (Imperial Navy, Court Table Green, Seal Wax Burgundy, Legal Parchment).
