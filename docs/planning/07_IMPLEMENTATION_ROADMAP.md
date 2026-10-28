# NYAYASETU — 12-PHASE IMPLEMENTATION ROADMAP (REVISED)
**Document Identifier:** `docs/planning/07_IMPLEMENTATION_ROADMAP.md`  
**Project:** NyayaSetu (AI-Assisted Pre-Litigation Legal Information & Triage Platform)  
**Author / Lead Architect:** Principal Software Architect & Engineering Lead  
**Status:** PROPOSED EXECUTION SCHEDULE — REVISED VERSION  
**Revision Date:** October 28, 2026 (Local Time: 05:53 IST)  

---

## 1. Roadmap Architecture & Execution Principles

This roadmap translates the research framework of Dubey et al. (2026) into a disciplined, 12-phase engineering plan. Each phase defines:
- **Dependencies & Prerequisites:** What must be verified before work begins.
- **Concrete Deliverables:** Exact files, schemas, and components created.
- **Acceptance Criteria:** Quantifiable criteria that must pass before advancing.
- **Verification Commands:** Automated scripts to prove functionality.

```mermaid
flowchart LR
    P01["P1: Repo & Tooling"] --> P02["P2: Schema Validation"]
    P02 --> P03["P3: Seed Corpus Ingest"]
    P03 --> P04["P4: Search & Provenance"]
    P04 --> P05["P5: Classifier Baseline"]
    P05 --> P06["P6: Risk & Safety Route"]
    P06 --> P07["P7: Hybrid Retrieval"]
    P07 --> P08["P8: Grounded Assistant"]
    P08 --> P09["P9: Safety & Legal Aid"]
    P09 --> P10["P10: Civic Modules"]
    P10 --> P11["P11: ML & Profiling"]
    P11 --> P12["P12: Audit & Polish"]
```

---

## 2. Phase-by-Phase Execution Plan

---

### Phase 1: Repository Foundations & Developer Tooling
- **Objective:** Establish the development environment, package management, linters, type checking, and test runners.
- **Prerequisites:** User approval of Executive Plan.
- **Deliverables:**
  - Initialize Next.js 15 App Router project with TypeScript 5, Tailwind CSS v4, Lucide React, and Radix UI primitives.
  - Setup Python 3.14 virtual environment (`venv/`) for ML inference and data ingestion scripts.
  - Configure ESLint, Prettier, and Vitest / Playwright test runners.
  - Git repository structure with branch protections and `.env.example`.
- **Acceptance Criteria:**
  - `npm run build` succeeds without type errors or lint warnings.
  - `pytest` executes successfully in Python virtual environment.
- **Verification Step:** Run `npm run test` and `python3 -m unittest discover`.

---

### Phase 2: Data-Source & Schema Validation
- **Objective:** Define and test the PostgreSQL database schema, migrations, and provenance structures.
- **Prerequisites:** Phase 1 complete; PostgreSQL 16 + `pgvector` container or instance running.
- **Deliverables:**
  - PostgreSQL migration scripts (`statutes`, `provisions`, `legal_aid_centers`, `civic_guides`, `user_cases`).
  - Row-Level Security (RLS) policies for user data isolation.
  - TypeScript database client and Zod validation schemas for all entities.
- **Acceptance Criteria:**
  - Database schema deploys cleanly.
  - RLS multi-tenant test passes: User A cannot read User B's case records.
- **Verification Step:** Automated test executing migration up/down and RLS permission checks.

---

### Phase 3: Small Legal Corpus Ingestion (Seed Corpus)
- **Objective:** Ingest, parse, validate, and hash the 10 Core Central Acts (<25 MB total) into PostgreSQL.
- **Prerequisites:** Phase 2 complete; verified Gazette / IndiaCode text files.
- **Deliverables:**
  - Python ingestion script `scripts/ingest_statutes.py`.
  - Normalization of sections, headings, chapters, penalties, and bailable flags.
  - Ingestion of BNS 2023, BNSS 2023, BSA 2023, Consumer Protection 2019, IT Act 2000, PWDVA 2005, TPA 1882, NI Act 1881, LSAA 1987, RTI 2005.
  - SHA-256 cryptographic provenance hash generated for every provision.
- **Acceptance Criteria:**
  - All 10 Acts successfully ingested with 100% valid cross-reference links.
  - Total disk usage for ingested data strictly <30 MB.
- **Verification Step:** `python3 scripts/verify_provenance.py` validates all SHA-256 hashes against source files.

---

### Phase 4: Lexical Search & Source Provenance Viewer
- **Objective:** Build the PostgreSQL Full-Text Search (FTS) index and the section-by-section statutory reader interface.
- **Prerequisites:** Phase 3 complete.
- **Deliverables:**
  - GIN search index on `provisions.search_tsv`.
  - Next.js Route `/knowledge` and `/knowledge/[actId]/[sectionId]`.
  - IPC-to-BNS side-by-side transition converter component.
  - Source Citation Drawer with official Gazette links and provenance metadata.
- **Acceptance Criteria:**
  - Lexical search for statutory terms returns exact provisions in <25 ms [Proposed Target].
  - IPC-BNS converter accurately maps Section 302 IPC to Section 103 BNS.
- **Verification Step:** Automated search query integration tests.

---

### Phase 5: Legal-Context Classification Baseline
- **Objective:** Implement the Scikit-learn TF-IDF + LinearSVC baseline for legal domain classification ($c$).
- **Prerequisites:** Phase 4 complete; curated training seed queries across 7 domains.
- **Deliverables:**
  - Python training and evaluation script `ml/train_context_classifier.py`.
  - Serialized model pipeline (`tfidf_vectorizer.joblib`, `linear_svc.joblib`) with total size <35 MB.
  - Fast inference wrapper running on CPU.
- **Acceptance Criteria:**
  - Macro-F1 $> 85\%$ across the 7 legal domains on held-out validation queries [Proposed Target].
  - Peak memory consumption $< 50$ MB RAM [Untested Est.].
- **Verification Step:** `python3 ml/eval_classifier.py` outputs classification report and confusion matrix.

---

### Phase 6: Risk-Aware Deterministic Routing Engine
- **Objective:** Implement the dual-gate urgency assessment engine (Table II policy) separating context from emergency risk.
- **Prerequisites:** Phase 5 complete.
- **Deliverables:**
  - TypeScript & Python routing engine `engine/risk_router.py`.
  - Deterministic emergency safety rules covering physical danger, domestic violence, harassment, and self-harm.
  - 4-Tier Route Orchestrator: `NORMAL`, `HIGH_RISK`, `EMERGENCY`, `UNCERTAIN`.
- **Acceptance Criteria:**
  - **Emergency False Negative Rate < 0.5%** on 300 curated boundary test queries [Proposed Target].
  - Rule evaluation latency $< 5.0$ ms [Untested Est.].
- **Verification Step:** Automated test executing 300 test queries (including tricky boundary cases like academic DV questions vs active assault).

---

### Phase 7: Hybrid Retrieval & Evidence Sufficiency Gate
- **Objective:** Implement dense semantic vector search via `pgvector` and the hybrid score fusion formula: $S_{hybrid} = \alpha \hat{S}_{BM25} + (1 - \alpha) \hat{S}_{dense}$.
- **Prerequisites:** Phase 6 complete; `paraphrase-multilingual-MiniLM-L12-v2` ONNX model.
- **Deliverables:**
  - Provision embeddings generated and indexed in `pgvector`.
  - Hybrid ranker combining normalized FTS and vector cosine scores.
  - The **Evidence Sufficiency Gate**: checks relevance threshold, statutory savings clauses (Section 358 BNS / 531 BNSS), and jurisdiction.
  - Abstention and clarification trigger logic.
- **Acceptance Criteria:**
  - Hybrid retrieval Recall@5 $> 70\%$ on informal queries [Proposed Target].
  - Evidence Gate successfully flags insufficient and outdated legal queries without generating spurious answers.
- **Verification Step:** Retrieval evaluation benchmark script.

---

### Phase 8: Grounded Legal Assistant Interface & API
- **Objective:** Build the conversational legal assistant UI with the 5-part sourced answer structure and Gemini 2.5 Flash SDK integration.
- **Prerequisites:** Phase 7 complete; configured `GEMINI_API_KEY`.
- **Deliverables:**
  - Decoupled `LegalGeneratorInterface` and Gemini 2.5 Flash integration.
  - Next.js route `/assistant` featuring the split-pane layout (Chat on left, Live Source Drawer on right).
  - Output Verification Gate checking citation validity and eliminating outcome predictions.
- **Acceptance Criteria:**
  - 100% of generated statutory citations match verified database provisions [Proposed Target].
  - Zero predictive statements (*"You will win"*) generated.
- **Verification Step:** End-to-end browser test running sample queries and verifying source drawer rendering.

---

### Phase 9: Women Safety & Legal-Aid Pathways
- **Objective:** Build the dedicated Women Safety Hub and the NALSA Section 12 Free Legal Aid Calculator.
- **Prerequisites:** Phase 8 complete; verified DLSA directory and helpline data.
- **Deliverables:**
  - Next.js route `/safety` with Quick-Exit mechanism, verified emergency numbers (112, 181, 1090 for UP, 1091 for Delhi), and localized shelter guide.
  - Next.js route `/legal-aid` with 3-question Section 12 eligibility calculator and DLSA finder.
  - Direct deep-links to official NALSA LSAMS online filing portal with preliminary guidance disclaimer.
- **Acceptance Criteria:**
  - Pressing `Esc` or clicking Quick-Exit redirects immediately to Google.
  - Section 12 calculator accurately identifies eligibility according to statutory thresholds.
- **Verification Step:** Playwright test verifying Quick-Exit and eligibility logic.

---

### Phase 10: Secondary Civic Modules (Simulator, Tracker, Checklists)
- **Objective:** Deliver the Educational Dispute Outcome Simulator, Legitimate Case Tracker, and Pre-Litigation Checklists.
- **Prerequisites:** Phase 9 complete.
- **Deliverables:**
  - `/simulator`: Interactive procedural dispute flowcharts (Consumer dispute, Cheque bounce) with lawyer discussion questions.
  - `/tracker`: Secure personal case hearing diary + 16-character CNR eCourts deep-link generator + demonstration lifecycle mode.
  - `/checklists`: Downloadable pre-litigation checklists (evidence preservation, consumer dispute notice draft).
- **Acceptance Criteria:**
  - Outcome simulator displays zero win/loss probabilities.
  - Case tracker links directly to `services.ecourts.gov.in` without unauthorized scraping.
- **Verification Step:** User workflow test across all three civic modules.

---

### Phase 11: Machine Learning Evaluation & Hardware Profiling
- **Objective:** Conduct multi-tier evaluation on frozen benchmark splits and measure host CPU/memory consumption.
- **Prerequisites:** All software and ML pipelines operational.
- **Deliverables:**
  - Benchmark evaluation script running against ILSIC-Lay informal queries (`10.18653/v1/2026.findings-eacl.354`).
  - Comprehensive ML Evaluation Report recording Precision, Recall, F1, MRR@10, and Emergency FNR.
  - System resource profiling logs (RAM usage, CPU latency, disk space).
- **Acceptance Criteria:**
  - Total RAM usage remains strictly $< 1.2$ GB for ML services [Proposed Target].
  - Zero claims of external published scores as NyayaSetu's own scores.
- **Verification Step:** `python3 ml/benchmark_evaluation.py` producing `docs/evaluation/EVALUATION_REPORT.md`.

---

### Phase 12: Security Hardening, Accessibility Audit, & Deployment Readiness
- **Objective:** Final end-to-end security audit, WCAG 2.1 AA accessibility audit, responsive visual polish, and production deployment configuration.
- **Prerequisites:** Phase 11 complete.
- **Deliverables:**
  - Automated Playwright screenshots captured at 1280px (desktop) and 375px (mobile) across all core routes.
  - Verified Anonymity limits documented; server log masking verified.
  - Production Dockerfile and environment configuration.
- **Acceptance Criteria:**
  - 100% WCAG 2.1 AA compliance (zero automated axe accessibility violations).
  - Production build deploys cleanly and passes all security checks.
- **Verification Step:** Run `npm run test:a11y` and `npm run test:e2e`.
