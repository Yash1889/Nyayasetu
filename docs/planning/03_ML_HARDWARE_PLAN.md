# NYAYASETU — MACHINE LEARNING & HARDWARE ARCHITECTURE PLAN (REVISED)
**Document Identifier:** `docs/planning/03_ML_HARDWARE_PLAN.md`  
**Project:** NyayaSetu (AI-Assisted Pre-Litigation Legal Information & Triage Platform)  
**Author / Lead ML Engineer:** Principal Applied ML Engineer & Systems Architect  
**Status:** AUDITED SPECIFICATION — REVISED VERSION  
**Revision Date:** October 28, 2026 (Local Time: 05:49 IST)  

---

## 1. Physical Hardware Audit (Empirically Verified Diagnostic Log)

A physical diagnostic of the execution host was conducted on October 28, 2026. Every metric is backed by its exact diagnostic command and execution log:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             GENUINELY OBSERVED HARDWARE DIAGNOSTICS                                │
├───────────────────┬─────────────────────────────────────────────────┬──────────────────────────────┤
│ Resource          │ Verified Fact & Output                          │ Method / Diagnostic Command  │
├───────────────────┼─────────────────────────────────────────────────┼──────────────────────────────┤
│ Operating System  │ Linux sandbox 7.1.5+kali-amd64 (x86_64)         │ `uname -a` (Oct 28, 2026)    │
│ CPU Architecture  │ AMD Ryzen 5 5600H with Radeon Graphics          │ `lscpu` (Oct 28, 2026)       │
│ Compute Topology  │ 6 Physical Cores, 12 Logical Threads            │ `lscpu` (Oct 28, 2026)       │
│ Total System RAM  │ 7.2 GiB (Used: 3.4 GiB, Available: ~3.7 GiB)    │ `free -h` (Oct 28, 2026)     │
│ Swap Space        │ 4.5 GiB (Used: 2.2 GiB, Available: 2.4 GiB)     │ `free -h` (Oct 28, 2026)     │
│ Graphics / GPU    │ AMD Cezanne [Radeon Vega Series] (rev c6)       │ `lspci` (Oct 28, 2026)       │
│ Discrete GPU/VRAM │ NONE. nvidia-smi: NOT FOUND. nvcc: NOT FOUND.   │ `nvidia-smi` (Oct 28, 2026)  │
│ Disk Storage      │ /dev/nvme0n1p4: 273 GB Total, 245 GB Used (95%) │ `df -h .` (Oct 28, 2026)     │
│ Free Disk Space   │ **ONLY 15 GB AVAILABLE FREE DISK SPACE**        │ `df -h .` (Oct 28, 2026)     │
│ Python Runtime    │ Python 3.14.7 (PyTorch not installed in system) │ `python3 --version`          │
│ JavaScript Runtime│ Node.js v24.19.0, npm 12.0.2                   │ `node -v && npm -v`          │
└───────────────────┴─────────────────────────────────────────────────┴──────────────────────────────┘
```

### Critical Hardware Realities
1. **Zero Discrete GPU / Zero CUDA [Verified Fact]:** Local deep learning requiring CUDA, TensorRT, or multi-gigabyte VRAM will fail to initialize. All local model execution must run on **CPU via ONNX Runtime / CPU-optimized PyTorch**.
2. **Constrained RAM Budget (<1.5 GB allocated to ML) [Verified Fact]:** System RAM is 7.2 GiB with only 3.7 GiB free. Running local 7B+ LLMs (even 4-bit quantized models requiring 4.5+ GB RAM) will induce extreme OS swap thrashing and crash the environment.
3. **Severe Disk Ceiling (15 GB Available) [Verified Fact]:** Downloading massive checkpoints or hundred-gigabyte corpora will exhaust disk space immediately. Total ML artifacts on disk must not exceed **1.0 GB**.

---

## 2. Performance Characteristic Classification Matrix

To maintain rigorous scientific and engineering integrity, all performance claims in this plan are strictly categorized according to the four standard epistemological states:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          PERFORMANCE CLAIM CLASSIFICATION LEGEND                                       │
├──────────────────────────────┬─────────────────────────────────────────────────────────────────────────┤
│ [Measured Result]            │ An empirical value directly measured and verified on the host system.   │
│ [Proposed Engineering Target]│ A design specification and acceptance threshold required for a phase.   │
│ [Untested Engineering Est.]  │ A mathematical or systems estimate based on published specs, pending run│
│ [External Published Result]  │ A score achieved by an external research team on a cited benchmark.     │
└──────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Classifier Baseline for Query Understanding

### 3.1 Legal-Domain Context Classifier ($c$)
The paper specifies that legal context $c$ must be estimated across broad domains: *Consumer Rights*, *Property & Tenancy*, *Cyber & Financial Fraud*, *Personal Safety & Violence*, *Family & Marriage*, *Labour & Employment*, and *Civil/Other*.

#### Baseline Architecture: TF-IDF + Linear Classifier
Rather than jumping prematurely to heavy deep learning, a robust, highly explainable baseline is implemented first:
- **Feature Extraction:** Word-level n-grams ($1, 2$) and Character-level n-grams ($3, 5$) using Scikit-learn `TfidfVectorizer` (sublinear TF scaling, max features = 15,000). Character n-grams are critical for capturing spelling variations and informal citizen terminology (e.g. "cheque bounce", "chk bonce", "landlod").
- **Classifier Model:** `LinearSVC` with Platt scaling (CalibratedClassifierCV) or `LogisticRegression(C=1.0, class_weight='balanced')`.
- **Memory Footprint:** `<45 MB RAM` **[Untested Engineering Estimate]**.
- **Inference Latency:** `<5 milliseconds on CPU` **[Untested Engineering Estimate]**.
- **Performance Target:** `Macro-F1 > 85%` across 7 domains **[Proposed Engineering Target]**.
- **Explainability:** Feature weights can be directly inspected via top coefficients, enabling transparent auditing of domain decisions.

#### Criteria for Transitioning to a Small Multilingual Neural Encoder
A neural encoder (e.g. `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, ~118 MB ONNX) will be evaluated if and only if:
1. The TF-IDF baseline achieves $<80\%$ macro-F1 on the cross-domain validation set.
2. The query set contains substantial code-mixed Hinglish (e.g. *"Mera landlord security deposit wapas nahi de raha hai"*) where character n-grams fail semantic generalization.
3. The neural model inference latency remains under 35 ms on CPU with memory consumption below 350 MB RAM **[Proposed Engineering Target]**.

---

## 4. Risk-Aware Routing Architecture

Dubey et al. (2026) state: *"Legal context and risk are distinct: a question about domestic-violence law is not automatically an emergency, while a short message reporting an immediate attack should not be treated as a routine information request."*

### 4.1 Dual-Gate Routing Logic

```
                         [User Query q]
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
       [Deterministic Rules Engine]     [Context Classifier]
       (Regex & Critical Lexicon)       (TF-IDF / Linear Model)
                 │                             │
                 ├─────────────────────────────┤
                 ▼                             ▼
         [Emergency Match?]            [Domain Label c]
         ├── YES ──► Route: EMERGENCY
         └── NO  ──┐
                   ▼
       [Temporal & Harm Analysis]
       (Imminence, Threat, Weapon)
                   │
                   ├── High Threat / Non-Immediate ──► Route: HIGH-RISK
                   ├── Ambiguous / Missing Facts   ──► Route: UNCERTAIN
                   └── Informational Query         ──► Route: NORMAL
```

### 4.2 Signal Definitions and Action Matrix (Table II Policy Implementation)

| Route | Trigger Signal Criteria | Operational Action | Generation Status |
| :--- | :--- | :--- | :--- |
| **1. Emergency** | Text indicates **ongoing or imminent danger** to physical safety, active domestic violence, physical restraint, weapon threat, or immediate self-harm. | **Bypasses LLM generation completely.** Displays deterministic, pre-reviewed safety protocols, verified national/state hotlines (112, 181, 1090), and activates Quick-Exit. | **LLM BYPASSED (Deterministic <5ms est.)** |
| **2. High-Risk** | Serious past harm or credible future threat reported, but **timing is not clearly immediate** (e.g., cyber extortion with 24-hr deadline, severe financial fraud, stalking). | Enforces a cautious response policy. Prioritizes evidence preservation (screenshots, transaction IDs), official complaint portals (1930 / cybercrime.gov.in), and legal protection orders. | **Restricted Prompting (Cautious Policy)** |
| **3. Uncertain** | Query is too vague, ambiguous, or lacks jurisdiction/incident timing (e.g., "they took my money", "is this legal?"). | The system **abstains from definitive legal assertions** and returns 2-3 targeted clarifying questions to establish jurisdiction, dates, and relationship. | **Clarification Protocol (Abstention Gate)** |
| **4. Normal** | Standard legal-information inquiry without threats of physical or immediate severe financial harm (e.g. "what is the limitation period for consumer complaint?"). | Executes full hybrid retrieval, verifies evidence sufficiency, and generates an evidence-grounded response citing primary statutes. | **Full Grounded RAG Pipeline** |

### 4.3 Deterministic Safety Policy & The Missed-Emergency Dilemma
- **Realistic Safety Position:** An automated NLP rule set or statistical classifier **cannot provide a theoretical guarantee of zero missed emergencies (0.00% FNR)**. Human language in trauma is heterogeneous, elliptical, and potentially metaphoric or adversarial.
- **Proposed Engineering Objective:** Minimize Emergency False Negatives as the primary optimization target. In evaluation, an **asymmetric cost matrix** penalizes missed emergencies 100x more heavily than false alarms.
- **Fail-Safe Fallback:** The user interface provides a persistent, prominent "Emergency Support" button on all pages so a citizen in danger is never stranded by an algorithmic misclassification.
```python
EMERGENCY_TRIGGERS = [
    # Active physical danger
    r"\b(beating|hitting|strangling|attacking|killing)\s+(me|us|her|him)\b",
    r"\b(locked\s+in|trapped|cannot\s+leave|held\s+hostage)\b",
    r"\b(he|she|they)\s+(has|have)\s+(a\s+knife|a\s+gun|weapon)\b",
    r"\b(in\s+danger|save\s+me|help\s+me\s+now|call\s+police)\b",
    # Self-harm / suicide
    r"\b(want\s+to\s+die|commit\s+suicide|end\s+my\s+life|kill\s+myself)\b",
    # Hindi / Hinglish urgent cues
    r"\b(mujhe\s+bachao|mar\s+raha\s+hai|jaan\s+ka\s+khatra|police\s+bulao)\b"
]
```

---

## 5. Hybrid Retrieval & Evidence Sufficiency Engine

### 5.1 Hybrid Scoring Formulation
For non-emergency requests, NyayaSetu combines lexical retrieval (for statutory terms, section numbers, exact legal concepts) and dense semantic retrieval (for informal layperson expressions).

Following Equation (1) of Dubey et al. (2026):
$$S_{hybrid}(q, d) = \alpha \hat{S}_{BM25}(q, d) + (1 - \alpha) \hat{S}_{dense}(q, d)$$

Where:
- $q$: User query string.
- $d$: Candidate legal provision or procedural passage.
- $\hat{S}_{BM25}(q, d) \in [0, 1]$: Min-Max normalized BM25 score from PostgreSQL full-text search.
- $\hat{S}_{dense}(q, d) \in [0, 1]$: Cosine similarity between query embedding and provision embedding.
- $\alpha \in [0, 1]$: Interpolation parameter. Initialized at $\alpha = 0.40$ **[Untested Engineering Estimate]** and calibrated on the validation set.

### 5.2 Dense Embedding Model Candidates

| Candidate Model | Dimensions | Model Size | RAM Usage | CPU Latency (Est.) | Licence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2** | 384 | 470 MB | ~380 MB [Est.] | ~28 ms (ONNX CPU) [Est.] | Apache 2.0 | **Primary Candidate (Multilingual MVP)** |
| **BAAI/bge-small-en-v1.5** | 384 | 133 MB | ~180 MB [Est.] | ~12 ms (ONNX CPU) [Est.] | MIT | **Alternative Candidate (English-only)** |
| `text-embedding-004` (Google Gemini) | 768 | Remote API | Negligible | ~120 ms (Network) [Est.] | Commercial API | **Alternative (Zero local compute)** |
| `BAAI/bge-m3` | 1024 | 2.2 GB | ~3.5 GB [Est.] | ~320 ms (CPU) [Est.] | MIT | **REJECTED (Exceeds available RAM)** |

### 5.3 Database & Search Stack Decision
- **Selected Engine:** **PostgreSQL 16 with `pgvector` and Full-Text Search (`tsvector`)**.
- **Rationale:** Consolidates structured legislation, vector embeddings, relational metadata, and full-text search into one ACID-compliant engine. Avoids running multiple database daemons on a machine with 3.7 GB available RAM.

### 5.4 The Evidence Sufficiency Gate
Before generating an answer, retrieved candidate provisions are evaluated:
1. **Relevance Threshold Check:** If $\max_d S_{hybrid}(q, d) < \tau_{evidence}$ (default $\tau = 0.48$ [Untested Engineering Estimate]), evidence is flagged as **Insufficient**.
2. **Statutory Currency & Transitional Nuance Check:** Enforces Section 358 BNS and Section 531 BNSS savings clauses. Incident date is collected to distinguish whether IPC/CrPC or BNS/BNSS applies, explicitly notifying the user of transitional interpretations.
3. **Jurisdiction Match Check:** Provisions must match the user's state jurisdiction if the issue falls under state-subject law (e.g. Police Act or Rent Control Act).
4. **Gate Action:** If any check fails, the system triggers the **Abstention / Clarification Route**, explaining specifically what statutory evidence is missing.

---

## 6. Grounded Generation & Output Verification Strategy

### 6.1 Provider-Independent Generation Interface
Generation is abstracted behind an interface so models can be configured or swapped without altering application code:

```python
class LegalGeneratorInterface(ABC):
    @abstractmethod
    async def generate_grounded_response(
        self,
        query: str,
        retrieved_passages: List[LegalPassage],
        context_domain: str,
        risk_level: str
    ) -> GroundedLegalResponse:
        pass
```

### 6.2 Primary Generation Provider: Google Gemini API (Configurable)
- **Primary Model Choice:** `gemini-2.5-flash` or `gemini-1.5-flash` via the official `google-genai` SDK.
- **Latency Expectation:** Target is sub-second generation, but exact latency depends on network round-trip and payload size. **No claims of guaranteed sub-500ms latency are made prior to live benchmarking.**
- **Cost & Quota:** Gemini Flash models offer low per-token pricing and structured output enforcement (`response_schema`), minimizing local compute overhead.

### 6.3 Output Verification (Post-Generation Gate)
- **Grounding Reality Check:** Retrieving primary legislation grounds the model, but **does NOT eliminate hallucination risk**. A model can still misinterpret a statute, hallucinate a non-existent sub-clause, or make unsupported leaps of logic.
- **Verification Controls:**
  1. **Citation Verification:** Generated citation tags must match exact primary keys in the database.
  2. **Span Matching:** Key statutory claims are cross-checked for character/token overlap with the retrieved passage.
  3. **Certainty Filter:** Regex rejects forbidden predictive assertions (*"You will win"*, *"The court will order"*).
  4. **Abstention on Gate Failure:** If verification fails, the system falls back to displaying the raw retrieved statutory passages and verified plain-language summaries.

---

## 7. Hardware Deployment Profiles

| Dimension | Profile 1: Host Measured (Recommended Target) | Profile 2: Modest GPU Workstation | Profile 3: Enterprise Cloud Server |
| :--- | :--- | :--- | :--- |
| **Target Hardware** | **AMD Ryzen 5 5600H, 7.2 GB RAM (3.7 GB free), 15 GB Free Disk, Integrated GPU [Measured]** | NVIDIA RTX 3060 / 4060 (8-12 GB VRAM), 16 GB RAM | NVIDIA A10G / L4 (24 GB VRAM), 32+ GB RAM |
| **Context Classifier** | TF-IDF + LinearSVC (<50 MB RAM, CPU) [Untested Est.] | DistilBERT / Legal-BERT (<500 MB VRAM) | Fine-tuned RoBERTa-Large (<1.5 GB VRAM) |
| **Dense Retriever** | `paraphrase-multilingual-MiniLM` (ONNX CPU, ~380 MB RAM) [Untested Est.] | `bge-base-en-v1.5` (GPU, ~1.5 GB VRAM) | `bge-m3` or ColBERT v2 (GPU, ~4 GB VRAM) |
| **Vector DB** | PostgreSQL 16 + `pgvector` on local NVMe | PostgreSQL + `pgvector` (HNSW indexing) | Dedicated Qdrant / Milvus Cluster |
| **Generative LLM** | **Remote API (Gemini 2.5 Flash via SDK)** | Local 4-bit Quantized Gemma-2 9B / Mistral 7B | Local Llama-3.3 70B (AWQ) or Gemini Enterprise |
| **Total RAM Budget** | **<1.2 GB RAM for ML services [Proposed Target]** | ~6 GB RAM | ~16 GB RAM |
| **Disk Storage** | **<800 MB total [Proposed Target]** | ~10 GB | ~50+ GB |
| **Total Query Latency** | **Target: P95 < 1,500 ms [Proposed Target]** | Target: P95 < 800 ms | Target: P95 < 400 ms |

---

## 8. Rigorous ML Evaluation Plan

Dubey et al. (2026) emphasize that performance must be evaluated at separate layers:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               MULTI-TIER EVALUATION PROTOCOL                                           │
├───────────────────┬───────────────────────────────┬────────────────────────────┬───────────────────────┤
│ Evaluation Tier   │ Evaluation Metric             │ Nature of Benchmark        │ Proposed Target       │
├───────────────────┼───────────────────────────────┼────────────────────────────┼───────────────────────┤
│ Tier 1: Emergency │ Emergency False Negative Rate │ 300 Curated Boundary Cases │ **Target: < 0.5%**    │
│ Safety Routing    │ Emergency False Positive Rate │ (Assault, Threats, Inform) │ Target: < 5.0%        │
├───────────────────┼───────────────────────────────┼────────────────────────────┼───────────────────────┤
│ Tier 2: Legal     │ Macro Precision, Recall, F1   │ Held-out test split of     │ Target: Macro-F1 > 85%│
│ Context Classif.  │ Confusion Matrix Balance      │ citizen complaint queries  │                       │
├───────────────────┼───────────────────────────────┼────────────────────────────┼───────────────────────┤
│ Tier 3: Hybrid    │ Recall@5, Recall@10           │ Frozen ILSIC-Lay Test Set  │ Target: Recall@5 > 70%│
│ Retrieval         │ Mean Reciprocal Rank (MRR@10) │ (Paul et al., EACL 2026)   │ Target: MRR@10 > 0.65 │
├───────────────────┼───────────────────────────────┼────────────────────────────┼───────────────────────┤
│ Tier 4: Evidence  │ Abstention Precision          │ Synthetic & Edge Cases     │ Target: Precision >90%│
│ Sufficiency Gate  │ Outdated Law Detection Rate   │ (Missing facts, pre-2024)  │ Target: Detection >98%│
├───────────────────┼───────────────────────────────┼────────────────────────────┼───────────────────────┤
│ Tier 5: Grounded  │ Citation Validity (% verified)│ RAGTruth-style claim audit │ Target: 100% valid DB │
│ Generation Check  │ Unsupported Claim Rate        │ across 100 generated cases │ Target: < 3.0%        │
├───────────────────┼───────────────────────────────┼────────────────────────────┼───────────────────────┤
│ Tier 6: System    │ End-to-End Latency (P95)      │ 50 Concurrent Test Runs on │ Target: < 1,500 ms    │
│ Performance       │ Peak System RAM Allocation    │ Local Host (Ryzen 5600H)   │ Target: < 1.2 GB RAM  │
└───────────────────┴───────────────────────────────┴────────────────────────────┴───────────────────────┘
```

*Note on Empirical Testing:* All future evaluation results will be published in a reproducible `EVALUATION_REPORT.md` with frozen data splits and random seeds. No prior external scores (such as ILSIC-Lay or SSRN preprints) will ever be claimed as NyayaSetu's measured performance.
