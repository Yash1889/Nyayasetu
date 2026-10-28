# NYAYASETU — SYSTEM ARCHITECTURE & ENGINEERING STACK (REVISED)
**Document Identifier:** `docs/planning/04_SYSTEM_ARCHITECTURE.md`  
**Project:** NyayaSetu (AI-Assisted Pre-Litigation Legal Information & Triage Platform)  
**Author / Lead Architect:** Principal Software Architect & Systems Engineer  
**Status:** AUDITED SYSTEM ARCHITECTURE SPECIFICATION — REVISED VERSION  
**Revision Date:** October 28, 2026 (Local Time: 05:54 IST)  

---

## 1. Architectural Philosophy & Principles

NyayaSetu is architected for **modularity, low-resource deployment, uncompromising citizen privacy, and zero-downtime safety availability**.

### Core Engineering Principles
1. **Separation of Safety and Intelligence:** Emergency safety routes must never share critical failure modes with LLM inference. If the network drops or an API key expires, the emergency portal, helplines, and procedural checklists continue to function seamlessly.
2. **Stateless Core with Ephemeral Anonymity:** The platform guarantees genuine anonymity. Sessions operate in-memory or client-side by default; database records are written only when an authenticated user explicitly saves a case or checklist.
3. **Single Transactional Engine with Unified Search:** Rather than maintaining a brittle polyglot stack (e.g., PostgreSQL + Pinecone + Redis + Elasticsearch), NyayaSetu consolidates primary data, vector embeddings, relational metadata, and full-text search into **PostgreSQL 16 with `pgvector` and GIN indexing**.
4. **Clean Decoupled Service Boundaries:** The Next.js frontend interacts with the backend service layer via strongly typed TypeScript contracts, enabling independent testing and seamless containerization.

---

## 2. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Browser / Mobile Web)"]
        UI["Next.js 15 UI (React 19 / Tailwind CSS v4)"]
        SafeNav["Quick-Exit Engine & Local Storage Controller"]
        AnonSession["Ephemeral Client Session (sessionStorage)"]
    end

    subgraph Gateway ["Application Gateway & Orchestrator (Next.js App Router)"]
        AuthRoute["Auth & Session Handler (Supabase Auth / Anonymous Guard)"]
        TriageRoute["/api/triage (Route Orchestrator)"]
        SearchRoute["/api/search (Statute & Guide Query)"]
        TrackRoute["/api/cases (Case Diary & CNR Deep-Link)"]
    end

    subgraph SafetyAndML ["NyayaSetu Core Intelligence Layer"]
        SafetyEngine["Deterministic Emergency Router (Regex / Rule Policy)"]
        Classifier["Context Classifier (TF-IDF + LinearSVC Baseline)"]
        HybridRetriever["Hybrid Retrieval Fusion (BM25 + pgvector <=> Cosine)"]
        EvidenceGate["Evidence Sufficiency & Currency Checker"]
        GeneratorSDK["Decoupled LLM Generator (Gemini 2.5 Flash via SDK)"]
        OutputValidator["Output Verification & Anti-Hallucination Gate"]
    end

    subgraph DataStore ["Persistence & Knowledge Store (PostgreSQL 16)"]
        StatuteTable["Primary Statutes & Provisions (BNS, BNSS, BSA, etc.)"]
        VectorIdx["pgvector HNSW / IVFFlat Index"]
        FullTextIdx["GIN Full-Text Search (tsvector)"]
        LegalAidTable["NALSA DLSA Directory (670+ Centers)"]
        UserCaseTable["User Saved Cases & Notes (Encrypted RLS)"]
    end

    subgraph ExternalServices ["External Authoritative Services"]
        OfficialECourts["Official eCourts Portal (services.ecourts.gov.in)"]
        OfficialNALSA["NALSA LSAMS Portal (scourtapp.nic.in)"]
        NationalHelplines["Emergency Infrastructure (112, 181, 1930, 15100, 1090* [*UP])"]
    end

    %% Client Interactions
    UI <--> AnonSession
    UI <--> SafeNav
    UI -->|HTTPS / JSON| TriageRoute
    UI -->|HTTPS / JSON| SearchRoute
    UI -->|HTTPS / JSON| TrackRoute

    %% Orchestration Flows
    TriageRoute --> SafetyEngine
    SafetyEngine -->|Emergency Detected (Bypass ML)| SafeNav
    SafetyEngine -->|Non-Emergency| Classifier
    Classifier --> HybridRetriever
    HybridRetriever --> VectorIdx
    HybridRetriever --> FullTextIdx
    HybridRetriever --> EvidenceGate
    EvidenceGate -->|Evidence Insufficient| TriageRoute
    EvidenceGate -->|Evidence OK| GeneratorSDK
    GeneratorSDK --> OutputValidator
    OutputValidator --> TriageRoute

    %% External Links
    TrackRoute -.->|Direct Citizen Deep-Link| OfficialECourts
    SearchRoute -.->|Official Citation Link| StatuteTable
    UI -.->|Direct Dial| NationalHelplines
    UI -.->|Verified Referral Link| OfficialNALSA
```

---

## 3. Technology Stack Specification

| Component | Selected Technology | Version / Specification | Rationale & Trade-offs |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router)** | 15.x / React 19 | Server-Side Rendering (SSR) for fast first-contentful paint on mobile devices; built-in Route Handlers for API consolidation. |
| **Styling & Design System** | **Tailwind CSS v4** | 4.x | High-performance CSS engine with zero runtime overhead; disciplined tokenized legal design system. |
| **Component Primitives** | **Radix UI Primitives** | Unstyled / Accessible | Full WAI-ARIA compliance, keyboard accessibility, accessible modals, and drawers. |
| **Icons & Visual Assets** | **Lucide React** | Latest | Crisp, authoritative legal-civic iconography without heavy assets. |
| **Primary Database** | **PostgreSQL** | 16.x | ACID compliance, JSONB document storage, robust Row-Level Security (RLS). |
| **Vector Indexing** | **`pgvector`** | 0.7.x | Embeddings stored directly alongside provisions. Cosine distance queries (`<=>`) with IVFFlat / HNSW indexing. |
| **Lexical Search Engine** | **PostgreSQL FTS (`tsvector`)** | Native GIN Index | BM25-equivalent ranking using `ts_rank_cd` with English dictionary and custom legal stopword filters. |
| **ML Inference (Local)** | **Python 3.14 + Scikit-learn + ONNX Runtime** | ONNX Runtime 1.19+ | Lightweight CPU execution (<400 MB RAM total est.). Runs classification and MiniLM embeddings in milliseconds. |
| **External LLM Generation** | **Google Gemini 2.5 Flash** | `google-genai` SDK | Low per-token pricing, strict structured JSON outputs, zero compute load on host machine. |
| **Testing Suite** | **Vitest / Jest + Playwright** | Modern | Fast unit tests for routing rules and end-to-end browser tests for safety flows and accessibility. |

---

## 4. Database Schema Proposal (PostgreSQL DDL)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. PRIMARY STATUTES REGISTRY
CREATE TABLE statutes (
    statute_id VARCHAR(64) PRIMARY KEY, -- e.g. 'bns_2023', 'cpa_2019'
    title VARCHAR(255) NOT NULL,
    short_title VARCHAR(100) NOT NULL,
    act_year INTEGER NOT NULL,
    act_number VARCHAR(50),
    jurisdiction VARCHAR(50) DEFAULT 'Central', -- 'Central' or State Name
    commencement_date DATE,
    official_gazette_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    repealed_act_id VARCHAR(64) REFERENCES statutes(statute_id),
    savings_clause_section VARCHAR(50), -- e.g. 'Section 358' for BNS, 'Section 531' for BNSS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. STATUTORY PROVISIONS & PASSAGES (Search & Embeddings)
CREATE TABLE provisions (
    provision_id VARCHAR(100) PRIMARY KEY, -- e.g. 'bns_2023_s_103'
    statute_id VARCHAR(64) NOT NULL REFERENCES statutes(statute_id) ON DELETE CASCADE,
    chapter_number VARCHAR(20),
    chapter_title VARCHAR(255),
    section_number VARCHAR(50) NOT NULL,
    section_heading VARCHAR(255) NOT NULL,
    verbatim_text TEXT NOT NULL,
    plain_summary TEXT, -- Verified legal plain-language summary
    
    -- Criminal / Procedural Attributes
    is_cognizable BOOLEAN,
    is_bailable BOOLEAN,
    is_compoundable BOOLEAN,
    punishment_description TEXT,
    triable_by VARCHAR(100),
    
    -- IPC-BNS Historical Mapping
    transition_note TEXT,
    historical_reference VARCHAR(100), -- e.g. 'IPC Section 302'
    
    -- Search Representations
    search_tsv TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(section_heading, '') || ' ' || coalesce(verbatim_text, '') || ' ' || coalesce(plain_summary, ''))
    ) STORED,
    embedding vector(384), -- 384-dim vector for MiniLM / BGE-small
    
    source_url TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provisions_tsv ON provisions USING GIN (search_tsv);
CREATE INDEX idx_provisions_embedding ON provisions USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_provisions_statute ON provisions (statute_id, section_number);

-- 3. NALSA & FREE LEGAL AID DIRECTORY
CREATE TABLE legal_aid_centers (
    center_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    authority_type VARCHAR(50) NOT NULL, -- 'SLSA', 'DLSA', 'TLSC', 'High Court Committee'
    office_name VARCHAR(255) NOT NULL,
    physical_address TEXT NOT NULL,
    pin_code VARCHAR(10),
    helpline_phone VARCHAR(50) NOT NULL,
    official_email VARCHAR(100),
    portal_url TEXT DEFAULT 'https://nalsa.gov.in',
    is_active BOOLEAN DEFAULT TRUE,
    last_verified_date DATE NOT NULL
);

CREATE INDEX idx_legal_aid_geo ON legal_aid_centers (state, district);

-- 4. PRACTICAL CIVIC GUIDES & CHECKLISTS (Original Content)
CREATE TABLE civic_guides (
    guide_id VARCHAR(64) PRIMARY KEY, -- e.g. 'consumer_notice_filing'
    category VARCHAR(50) NOT NULL, -- 'Consumer', 'Cyber', 'Tenancy', 'Safety'
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    prerequisites_json JSONB NOT NULL, -- Required documents
    steps_json JSONB NOT NULL, -- Array of sequential actionable steps
    statutory_citations JSONB NOT NULL, -- Array of provision_ids
    sample_template TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. OPTIONAL USER CASE TRACKER (Authenticated & Encrypted Only)
CREATE TABLE user_cases (
    case_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References auth.users
    title VARCHAR(255) NOT NULL,
    cnr_number VARCHAR(16), -- 16-character eCourts CNR
    case_category VARCHAR(50) NOT NULL,
    court_name VARCHAR(255),
    advocate_name VARCHAR(255),
    current_stage VARCHAR(100), -- 'Filing', 'Notice', 'Evidence', 'Arguments'
    next_hearing_date DATE,
    personal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row-Level Security (RLS) Policy for User Cases
ALTER TABLE user_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_cases_owner_policy ON user_cases
    FOR ALL
    USING (auth.uid() = user_id);
```

---

## 5. API Boundary Specification

### 5.1 POST `/api/triage/analyze`
- **Request Body:**
  ```json
  {
    "query": "My landlord locked my flat and took my security deposit yesterday.",
    "incident_date": "2026-10-27",
    "state_jurisdiction": "Delhi",
    "is_anonymous": true
  }
  ```
- **Response Format (Normal / Grounded Path):**
  ```json
  {
    "route": "NORMAL",
    "assessed_context": "Property_Tenancy",
    "evidence_status": "SUFFICIENT",
    "plain_summary": "Under Indian law, a landlord cannot forcefully dispossess a tenant without following due legal process...",
    "legal_analysis": "The Transfer of Property Act, 1882 protects legal possession...",
    "statutory_citations": [
      {
        "provision_id": "tpa_1882_s_108",
        "act_title": "Transfer of Property Act, 1882",
        "section": "108(B)",
        "heading": "Rights and liabilities of lessor and lessee",
        "source_url": "https://indiacode.nic.in/..."
      }
    ],
    "actionable_next_steps": [
      "Gather rental agreement and bank receipts of deposit.",
      "Send a formal written notice demanding access within 48 hours.",
      "If locked forcefully, approach local police station to report wrongful restraint."
    ],
    "uncertainty_notes": "State-specific Delhi Rent Control Act provisions may alter pecuniary thresholds.",
    "professional_referral": {
      "type": "DLSA",
      "authority": "South Delhi District Legal Services Authority",
      "helpline": "15100"
    }
  }
  ```
- **Response Format (Emergency Path):**
  ```json
  {
    "route": "EMERGENCY",
    "safety_alert": "IMMEDIATE PHYSICAL DANGER DETECTED",
    "immediate_guidance": "Please reach a safe location immediately. Do not attempt to negotiate.",
    "verified_emergency_helplines": [
      {"name": "National Emergency Service (ERSS)", "number": "112", "scope": "All-India"},
      {"name": "Women Helpline (WHL)", "number": "181", "scope": "35 States & UTs"},
      {"name": "Cyber Financial Fraud Helpline", "number": "1930", "scope": "All-India"},
      {"name": "National Legal Aid Helpline", "number": "15100", "scope": "All-India"},
      {"name": "Women Power Line (UP Police)", "number": "1090", "scope": "Uttar Pradesh Only"}
    ],
    "quick_exit_url": "https://google.com"
  }
  ```

### 5.2 POST `/api/legal-aid/eligibility`
- **Output:**
  ```json
  {
    "is_eligible_preliminary": true,
    "entitlement_clause": "Section 12(c) - Women and Children",
    "disclaimer": "This assessment provides preliminary statutory guidance. Final formal assignment of an advocate is determined by the Member Secretary of your District Legal Services Authority (DLSA) upon application review.",
    "application_portal_url": "https://scourtapp.nic.in/lsams/nologin/applicationFiling.action"
  }
  ```
