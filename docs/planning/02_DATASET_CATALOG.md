# NYAYASETU — DATASET CATALOGUE & SOURCE PROVENANCE REPORT (REVISED)
**Document Identifier:** `docs/planning/02_DATASET_CATALOG.md`  
**Project:** NyayaSetu (AI-Assisted Pre-Litigation Legal Information & Triage Platform)  
**Author / Lead Data Engineer:** Principal Applied ML Engineer & Legal-Tech Data Specialist  
**Status:** AUDITED PLANNING SPECIFICATION — REVISED VERSION  
**Revision Date:** October 28, 2026 (Local Time: 05:48 IST)  

---

## 1. Overview and Selection Methodology

A responsible legal-AI system for Indian citizens cannot be built on uncurated generic dumps or unverified web scrapers. In accordance with the principles set forth in Dubey et al. (2026):
1. **Task Boundary Preservation:** A dataset curated for court judgment prediction (e.g. ILDC) cannot be used as training data for citizen pre-litigation triage.
2. **Statutory Currency & Provenance:** Legal data must distinguish between current law (e.g. BNS 2023) and repealed law (e.g. IPC 1860), factoring in the statutory repeal and savings provisions (Section 358 BNS, Section 531 BNSS).
3. **Rigorous Licence Verification:** Public availability on the internet does not imply permission for bulk downloading, adaptation, or commercial reuse. Licences are explicitly categorized as **Verified**, **Unresolved / Restricted**, or **Prohibited**.
4. **Hardware-Aware Curation:** Given the measured host hardware constraints (**15 GB free disk, 7.2 GB RAM, 3.7 GB available**), multi-gigabyte raw corpora are strictly excluded from local ingestion. Instead, a high-precision, curated **Seed Corpus (<25 MB)** of primary central acts, official procedural guides, and verified support directories is prioritized for the MVP.

---

## 2. Comparative Evaluation Matrix of Candidate Datasets

The table below provides a rigorous comparison across 14 candidate sources and benchmarks against the 13 required evaluation criteria. All licence classifications and tasks are strictly checked against official publisher records.

| Dataset / Source Name | Publisher & Official Source URL | Intended Task | Candidate NyayaSetu Feature | Data Type & Format | Language Coverage | Licence Status & Terms | Ground-Truth Labels? | Proposed ML / Retrieval Use | Hardware Requirement (RAM / Disk) | Download / API Access Method | Priority Category | Core Rationale (Why Recommended or Rejected) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. NyayaSetu Core Seed Legislation Corpus** | Official India Code / Legislative Dept (`legislative.gov.in`, `indiacode.nic.in`) | Primary statutory reference & bare acts publication | Legal Knowledge Hub & Grounded Assistant Retrieval | Verbatim statutory text, structured JSON / Markdown with provision metadata | English & Hindi (Official Gazette) | **Verified Public Sector Data** (National Data Sharing and Accessibility Policy - NDSAP; Central Govt) | Yes (Statutory provisions, headings, punishments) | Primary Knowledge Corpus for BM25 and Vector Search | <50 MB RAM, <20 MB Disk (Untested engineering estimate) | Direct manual curation from official Gazette / IndiaCode | **MVP (Core)** | **Essential foundation.** Contains current applicable law (BNS, BNSS, BSA, Consumer Protection, IT Act, etc.). Primary statutory ground truth. |
| **2. ILSIC / ILSIC-Lay Benchmark** | EACL 2026 Findings (Paul, Dogra, Goyal, & Ghosh; `https://aclanthology.org/2026.findings-eacl.354/`) | Statute identification from informal layperson queries | Query Context Classifier & Retrieval Evaluation | 8,127 query-statute pairs (6,465 train, 826 val, 836 test) across 567 statutes; JSON | English (Indian citizen phrasing) | **Verified Research License** (ACL Anthology Open Access; Academic Attribution) | Yes (Gold-standard statute ID annotations) | **Evaluation Benchmark** for testing retrieval Recall@k and F1 on informal queries | <200 MB RAM, <50 MB Disk (Untested engineering estimate) | Downloadable via official ACL Anthology repository | **Evaluation Only (MVP)** | **Critical benchmark.** The only peer-reviewed corpus reflecting informal Indian citizen queries rather than formal court facts. Used strictly for evaluation, not training. *(Note: Corrected publication from previous typo citing arXiv:2602.23371, which is Goel et al.).* |
| **3. IndicLegalQA** | NIT Srinagar (Mishra & Veningston, Mendeley Data, 2024; `https://data.mendeley.com/datasets/gf8n8cnmvc`) | Legal question answering on Indian Supreme Court cases | Evidence gate testing & legal reasoning evaluation | 10,000 QA pairs across 1,256 Supreme Court judgments; JSON | English | **Verified CC BY 4.0** (Open Access with attribution) | Yes (Annotated QA pairs with source case names) | Evaluation of Grounded Generation and Claim Verification | <300 MB RAM, <35 MB Disk (Untested engineering estimate) | Direct download via Mendeley Data API | **Evaluation Only (Phase 2)** | High quality QA pairs from apex court. However, reflects judicial appellate reasoning rather than pre-litigation triage. Excellent for evaluation, not for primary retrieval. |
| **4. LegalBench-RAG & LegalBench** | ZeroEntropy & Stanford (Pipitone & Houir Alami, 2024; Guha et al., 2023; `https://arxiv.org/abs/2408.10343`) | Character-level precise retrieval evaluation in legal contracts | Evaluation of Retrieval Precision and Evidence Sufficiency | 6,858 query-answer pairs with exact character span annotations; JSON | English (predominantly US Common Law) | **Verified CC BY 4.0** (Open Access) | Yes (Exact text offset spans) | Evaluation framework methodology for Evidence Gate | <400 MB RAM, <120 MB Disk (Untested engineering estimate) | Downloadable via Hugging Face / GitHub | **Methodology / Eval Reference** | While jurisdiction is US, its character-level precision metric methodology is adopted to test our Indian Evidence Gate against unsupported spans. |
| **5. RAGTruth** | ParticleMedia (Niu et al., ACL 2024; `https://aclanthology.org/2024.acl-long.585/`) | Hallucination detection at word and case level in RAG | Output Response Validation & Hallucination Checking | ~18,000 annotated LLM responses with word-level contradiction labels | English | **Verified MIT License** (Permissive open source) | Yes (Contradiction & unsupported claim tags) | Training and validating the Output Validation Gate | <500 MB RAM, <80 MB Disk (Untested engineering estimate) | Downloadable via GitHub (`ParticleMedia/RAGTruth`) | **Evaluation Only (Phase 2)** | Gold standard for evaluating whether an LLM generation faithfully reflects its retrieved context. Essential for tuning response checking. |
| **6. NALSA Legal Aid Directory & Sec 12 Rules** | National Legal Services Authority (`https://nalsa.gov.in`, `https://scourtapp.nic.in`) | Free legal services provision & state directory | Lawyer & Legal-Aid Discovery Module | Structured tabular directory of 672+ DLSAs, SLSAs, and Section 12 criteria | English, Hindi, Regional | **Verified Official Public Information** (Ministry of Law & Justice, Govt of India) | Yes (Official contact numbers, office addresses, income caps) | Deterministic lookup database & Eligibility Calculator | <10 MB RAM, <5 MB Disk (Untested engineering estimate) | Compiled from official NALSA published reports | **MVP (Core)** | **Mandatory.** The only lawful, ethical path for citizen legal-aid referral. Bypasses private lawyer fabrication completely. |
| **7. Official National & State Helplines Directory** | MHA, MWCD, DoT (`112.gov.in`, `cybercrime.gov.in`, `uppolice.gov.in`) | Emergency citizen response & trauma intervention | Women Safety & Emergency Safety Route | Verified registry: Emergency (112), Women (181, state police lines), Cyber (1930), Child (1098), Legal (15100) | Pan-India & State-specific | **Verified Official Government Emergency Directives** | Deterministic emergency mappings | Instant deterministic routing table | <1 MB RAM, <1 MB Disk | Manual verification against Ministry gazettes & portals | **MVP (Critical Safety)** | **Non-negotiable.** Zero reliance on LLM generation for emergency numbers. Hardcoded, audited, and verified directly from official notifications. (See Section 3 for strict geographic breakdown). |
| **8. Nyaaya Legal Explainers & Guides** | Vidhi Centre for Legal Policy / Nyaaya (`https://nyaaya.org/`) | Plain-language citizen legal literacy & procedural guides | Pre-litigation checklists & Plain-Language Knowledge Base | Structured procedural guides, FAQs, sample notice templates | English, Hindi, Kannada | **UNRESOLVED / RESTRICTED:** Terms state content is on CC BY-NC-SA 2.5 IN, but explicitly clause: *"you are not allowed to download or modify it. This may be done only with written consent from us."* | N/A (Procedural guides, not ML labels) | Procedural reference only; **NO automated bulk downloading or ingestion** | <50 MB RAM, <15 MB Disk | Requires explicit written consent from Vidhi/Nyaaya for reuse | **POSTPONED / RESTRICTED (Written Consent Required)** | **Do NOT ingest without written consent.** Alternative: NyayaSetu authors its own original plain-language summaries directly from primary statutes and official ministry guidelines. |
| **9. Vaquill Open India Law Corpus** | Vaquill AI (`https://huggingface.co/datasets/vaquill/open-india-law`) | Large-scale primary legal research (Central/State Acts + Judgments) | Broad statutory search & future case law retrieval | Millions of judgments and statutory sections; Parquet | English | **Verified CC BY 4.0** (Open Access with attribution) | Provision metadata only | Selective extraction of central statutory Parquet files | **>64 GB RAM & >150 GB Disk for full corpus** | Hugging Face Datasets API | **REJECTED for Bulk Ingestion; MVP Selective Extraction Only** | Full corpus would exhaust the host's 15 GB free disk and crash the system. **Strict rule:** Only specific Central Act Parquet files (<30 MB) may be extracted. |
| **10. IL-TUR Benchmark** | IIT Kanpur & IIT Kharagpur (Joshi et al., ACL 2024; `https://aclanthology.org/2024.acl-long.618/`) | Indian legal text understanding (RRL, CJPE, PCR, LQA, SI) | Multi-task Indian legal benchmarking | Structured JSON splits across 5 legal reasoning tasks | English | **Verified ACL Open Access** (Academic attribution) | Yes (Rhetorical roles, court judgment outcomes) | Comparative benchmarking of underlying legal models | >8 GB RAM, >5 GB Disk | Downloadable via GitHub / ACL | **Phase 2 (Optional Reference)** | High academic value, but primary tasks (Rhetorical Role Labeling, Supreme Court judgment prediction) are irrelevant to pre-litigation citizen triage. |
| **11. ILDC for CJPE** | IIT Kharagpur (Malik et al., ACL 2021; `https://aclanthology.org/2021.acl-long.313/`) | Court Judgment Prediction with Explanation | Explaining judicial reasoning | 35,000+ Supreme Court cases with judgment binary labels | English | **Verified Research License** (Academic use) | Yes (Court judgment decisions: Accepted/Dismissed) | Background study on judicial decision phrasing | >12 GB RAM, >8 GB Disk | Downloadable via GitHub | **REJECTED for Citizen MVP** | **Unsuitable task.** Predicting whether a Supreme Court appeal is accepted or dismissed has zero validity for an informal layperson consumer or tenancy dispute. |
| **12. DIKSHA Public Platform Telemetry** | Ministry of Education, NCERT (`https://diksha.gov.in/data/datasets/`) | National digital education usage monitoring | Education-related feature analysis | Telemetry CSVs: QR code scans, course completions, textbook hits | Multilingual | **Verified Open Government Data** (`data.gov.in`) | Telemetry statistics only | None | >4 GB RAM, >2 GB Disk | `data.gov.in` download | **REJECTED** | **Completely irrelevant.** DIKSHA datasets contain portal usage telemetry (e.g. how many times a physics QR code was scanned). Contains no legal statutes or rights. |
| **13. UDISE+ School Statistics** | Ministry of Education (`https://udiseplus.gov.in`) | School infrastructure & educational management statistics | School database query | Tabular CSVs: student enrollment, toilets, electricity, teacher count | English / Hindi | **Verified Open Government Data** (`data.gov.in`) | School management metrics | None | >6 GB RAM, >3 GB Disk | `data.gov.in` download | **REJECTED** | **Completely irrelevant.** Macro infrastructure metrics (school electricity, girl toilets count) do not inform citizen legal rights. Only the Right to Education (RTE) Act 2009 is retained in Core Seed. |
| **14. Kaggle Consumer Grievances / Telecom Complaints** | Kaggle Open Datasets | Complaint classification & sentiment analysis | Query Intent & Legal Domain Classifier Training | Tabular customer complaints with company labels; CSV | English | **Various / Inferred Open** (CC0 / Public Domain depending on specific upload) | Category labels | Training TF-IDF domain classifier baseline | <100 MB RAM, <50 MB Disk (Untested engineering estimate) | Kaggle API / Direct CSV | **MVP (Classifier Seed Only)** | Useful as an empirical source of informal citizen complaint phrasing to train the non-legal vocabulary of the domain classifier. Verification step: Inspect specific upload licence prior to training. |

---

## 3. Verified Emergency & Support Helplines Registry

The table below replaces unverified emergency listings with officially verified records, detailing geographic applicability, operating ministry, official source, verification date, and maintenance protocol.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        VERIFIED EMERGENCY & CITIZEN SUPPORT DIRECTORY                                  │
├────────┬────────────────────────────────┬───────────────┬──────────────────────┬───────────────────────┤
│ Number │ Official Service Identity      │ Geographic    │ Operating Authority  │ Verification Source   │
│        │ & Primary Purpose              │ Applicability │ & Operational Scope  │ & Date Checked        │
├────────┼────────────────────────────────┼───────────────┼──────────────────────┼───────────────────────┤
│ **112**│ Emergency Response Support     │ **All-India** │ Ministry of Home     │ Official ERSS Portal  │
│        │ System (ERSS): Police, Fire,   │ (28 States,   │ Affairs (MHA)        │ `https://112.gov.in/` │
│        │ Health (Ambulance), Disaster   │ 8 UTs)        │ Integrated dispatch  │ Checked: Oct 28, 2026 │
├────────┼────────────────────────────────┼───────────────┼──────────────────────┼───────────────────────┤
│ **181**│ Women Helpline (WHL) Scheme:   │ **35 States   │ Ministry of Women &  │ MWCD Mission Shakti   │
│        │ 24/7 emergency & crisis        │ & UTs**       │ Child Development    │ Guidelines & Reports  │
│        │ response, counseling, referral │ (Check local  │ Integrated with One  │ `https://wcd.nic.in/` │
│        │ to One Stop Centres (OSCs)     │ telecom)      │ Stop Centres (OSCs)  │ Checked: Oct 28, 2026 │
├────────┼────────────────────────────────┼───────────────┼──────────────────────┼───────────────────────┤
│ **1930**│ National Cyber Financial       │ **All-India** │ Indian Cyber Crime   │ Cyber Crime Portal    │
│        │ Fraud Helpline (Citizen Fraud  │ (Nationwide   │ Coordination Centre  │ `cybercrime.gov.in`   │
│        │ Reporting & Management System) │ banking link) │ (I4C), MHA           │ Checked: Oct 28, 2026 │
├────────┼────────────────────────────────┼───────────────┼──────────────────────┼───────────────────────┤
│**15100**│ National Legal Aid Helpline:  │ **All-India** │ National Legal       │ NALSA Official Portal │
│        │ Free legal aid counseling,     │ (24/7         │ Services Authority,  │ `https://nalsa.gov.in`│
│        │ DLSA/SLSA referral             │ toll-free)    │ Min of Law & Justice │ Checked: Oct 28, 2026 │
├────────┼────────────────────────────────┼───────────────┼──────────────────────┼───────────────────────┤
│ **1090**│ **Women Power Line (WPL)**:   │ **UTTAR       │ Uttar Pradesh Police │ UP Police Portal      │
│        │ Stalking, phone harassment,    │ PRADESH ONLY**│ Dedicated state cell │ `https://uppolice.gov`│
│        │ cyber harassment of women      │ (State-bound) │ (Do NOT call outside)│ Checked: Oct 28, 2026 │
├────────┼────────────────────────────────┼───────────────┼──────────────────────┼───────────────────────┤
│ **1091**│ Police Women Helpline          │ **State-by-   │ Respective State     │ State Police Gazettes │
│        │ (Dedicated police response cell│ **State**     │ Police (Delhi, TN,   │ (e.g. Delhi Police)   │
│        │ for crimes against women)      │ (Selected)    │ Haryana, Karnataka)  │ Checked: Oct 28, 2026 │
├────────┼────────────────────────────────┼───────────────┼──────────────────────┼───────────────────────┤
│ **1098**│ Childline (Emergency care &    │ **All-India** │ MWCD / Integrated to │ Childline 1098 Portal │
│        │ protection for children)       │ (Nationwide)  │ 112 ERSS pan-India   │ Checked: Oct 28, 2026 │
└────────┴────────────────────────────────┴───────────────┴──────────────────────┴───────────────────────┘
```

### 3.1 Verification & Maintenance Protocol
1. **Zero LLM Dependency:** The emergency path strictly renders verified static records from a structured JSON table (`data/emergency_contacts.json`). An LLM is never prompted or allowed to output contact numbers from parametric memory.
2. **State-Level Routing Logic:**
   - If a citizen has selected or detected state as `Uttar Pradesh`, `1090` (Women Power Line) is displayed with an explicit badge: `[State Service: UP Police]`.
   - If a citizen is in `Delhi`, `1091` (Delhi Police Women Helpline) is displayed with `[State Service: Delhi Police]`.
   - For all users (or when state is unknown/anonymous), `112` (National Police/Emergency) and `181` (National Women Helpline) are prominently displayed as the universal primary fallbacks.
3. **Quarterly Audit Procedure:** The contact database includes a `last_verified_date` and an automated HTTP / directory verification script that runs quarterly against official Ministry websites (`112.gov.in`, `wcd.nic.in`, `cybercrime.gov.in`, `nalsa.gov.in`).

---

## 4. Recheck of Legal Corpora & Provenance Boundaries

### 4.1 Nyaaya Terms of Use Contradiction & Resolution
- **Observed Legal Clause:** Nyaaya’s Terms of Use (`https://nyaaya.org/terms-of-use/`) contains two conflicting paragraphs:
  - Paragraph 1: Content is distributed under a Creative Commons License (`CC BY-NC-SA 2.5 IN`).
  - Paragraph 2: *"We grant you the license to access and make personal use of this website. However, you are not allowed to download or modify it. This may be done only with written consent from us."*
- **Engineering Resolution:**
  - In adherence to strict IP compliance, NyayaSetu **will not scrape, bulk download, or bundle Nyaaya content**.
  - **Self-Authored Alternative:** NyayaSetu will author its own plain-language procedural guides based directly on primary statutory sources and official Ministry procedural rules (e.g., Consumer Protection Consumer Disputes Redressal Commission Rules 2020; National Cyber Crime Reporting Portal user manuals; NALSA Free Legal Services Regulations).

### 4.2 The 10 Core Central Acts Seed Selection (Unchanged Core Focus)
The MVP will ingest primary law text exclusively from the Official Gazette of India (`https://egazette.gov.in/`) and India Code (`https://www.indiacode.nic.in/`):
1. **Bharatiya Nyaya Sanhita, 2023 (BNS 2023)** & IPC 1860 Transition Mapping
2. **Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS 2023)** & CrPC 1973 Transition Mapping
3. **Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)** & IEA 1872 Transition Mapping
4. **Consumer Protection Act, 2019** & E-Commerce Consumer Rules 2020
5. **Information Technology Act, 2000** (Sections 43A, 66C, 66D, 67, 72)
6. **Protection of Women from Domestic Violence Act, 2005 (PWDVA)** & 2006 Rules
7. **Transfer of Property Act, 1882** (Tenancy and lease provisions) & Model Tenancy Guidelines
8. **Negotiable Instruments Act, 1881** (Sections 138–142, Cheque Bounce)
9. **Legal Services Authorities Act, 1987** (Section 12 Legal Aid Entitlements)
10. **Right to Information Act, 2005 (RTI Act)** & 2012 Rules

Total seed corpus size on disk: **~18 MB JSON / Markdown**, well within the 15 GB available disk space.
