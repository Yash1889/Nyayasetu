# NyayaSetu: Empirical Evaluation Report

**Paper:** NyayaSetu: A Risk-Aware Retrieval-Augmented Framework for Evidence-Grounded Legal Information and Pre-Litigation Triage  
**Author:** Yashraj Gupta  
**Evaluation date:** 2026-10-28  
**Repository commit at evaluation:** `43763b5` (main branch) + local uncommitted changes (evaluation files, pattern fix)

> [!IMPORTANT]
> This report supersedes all performance claims in the previous README. Earlier README metrics (including "100% Recall", "Top-3 Precision 100%", "8.4 ms retrieval") were **not backed by any benchmark or measurement** and are explicitly retracted here.

---

## 1. Executive Summary

| Metric | Value | Evidence |
|---|---|---|
| Test suite | **46 / 46 pass** (9 files) | `npm test` output, 2026-10-28 |
| Production build | **10 / 10 routes compiled** | `npm run build` exit 0 |
| Retrieval Hit@1 | **68.57%** | N=35 benchmark queries |
| Retrieval Hit@3 | **82.86%** | N=35 benchmark queries |
| Retrieval Hit@5 | **91.43%** | N=35 benchmark queries |
| MRR | **0.7529** | N=35 benchmark queries |
| Emergency Recall (post-fix) | **100.00%** | N=30 risk-routing dataset |
| Emergency Precision | **100.00%** | N=30 risk-routing dataset |
| Emergency F1 | **1.0000** | N=30, after pattern fix |
| Mechanistic citation fidelity | **100%** | All 105 deterministic citations reference retrieved IDs |
| Hybrid retrieval latency | Median **0.37 ms**, p95 **0.68 ms** | N=50 offline trials |
| Deterministic E2E latency | Median **0.41 ms**, p95 **0.72 ms** | N=50 offline trials |
| Live Groq API E2E | ~**1.5 s – 3 s** typical | 3 pre-rate-limit trials |

> [!WARNING]
> **Corpus limitation:** The system indexes only **26 seed provisions** across 10 Acts. Several benchmark failures are directly attributable to provisions not being present in the corpus, not retrieval algorithm failure. This must be prominently disclosed in any publication.

---

## 2. Evaluation Environment

- **OS:** Linux x86\_64  
- **Node.js:** v24.19.0 | npm 12.0.2  
- **Test runner:** Vitest 3.x  
- **Corpus size:** 26 provisions (static TypeScript corpus)  
- **Retrieval:** BM25 lexical + Jaccard-proxy dense + domain-regex bonuses + Reciprocal Rank Fusion — **no neural embeddings**  
- **Network:** Standard sandbox (blocked) for all retrieval/deterministic evaluation; `BypassSandbox=true` for live API calls

See [`ENVIRONMENT.md`](./ENVIRONMENT.md) for full details.

---

## 3. Test Suite and Build

### 3.1 Test Suite

**Command:** `npm test`  
**Result:** 46 / 46 tests pass, 9 test files, duration ≈ 4.7 s  
**Timestamp:** 2026-10-28T02:06:09Z (original baseline), 2026-10-28T07:50:52Z (post-fix verification)

Test files and coverage:

| File | Tests |
|---|---|
| `tests/risk_router.test.ts` | Risk routing deterministic logic |
| `tests/retriever.test.ts` | BM25 + dense retrieval correctness |
| `tests/triage_orchestrator.test.ts` | End-to-end orchestration |
| `tests/generator.test.ts` | Deterministic synthesizer output |
| `tests/nalsa_eligibility.test.ts` | NALSA eligibility calculator |
| `tests/savings_clause.test.ts` | BNS/BNSS temporal savings clause |
| `tests/emergency_contacts.test.ts` | Contact registry schema |
| `tests/evaluation_suite.test.ts` | Full reproducible benchmark harness |
| `tests/fallback_chain.test.ts` | Generator fallback chain (5 scenarios) |

### 3.2 Production Build

**Command:** `npm run build`  
**Result:** 10 / 10 routes compiled cleanly, exit code 0  
**Timestamp:** 2026-10-28T02:06:15Z

Routes compiled: `/`, `/assistant`, `/knowledge`, `/safety`, `/legal-aid`, `/rti`, `/rights`, `/analytics`, `/api/triage`, `/api/provisions`

---

## 4. Retrieval Evaluation

### 4.1 Benchmark Design

- **N = 35** queries, independently constructed (not copied from unit-test examples)
- Stored in: `docs/research/evaluation/retrieval_benchmark.jsonl`
- 10 domains matching the 10 supported Acts
- 2 complexity tiers per domain: `colloquial_dispute` (natural language) and `direct_statutory` (legal phrasing)
- 10 queries flagged `requires_human_legal_review: true` (multi-provision, jurisdiction-sensitive, or penalty-interpretation queries)

**Ground-truth establishment method:**  
Each query was assigned expected provision ID(s) by manually mapping the query's legal issue to the known 26-provision corpus. Where no provision in the corpus covered the issue, the expected set reflects what *should* be retrieved if the provision existed; such queries are expected to fail retrieval and are documented as corpus-limited failures.

**Retrieval system:** BM25 keyword overlap + Jaccard dense proxy over provision text + domain-aware regex score bonuses, fused via Reciprocal Rank Fusion. Returns top-5 provisions per query. **No neural embeddings are used.**

### 4.2 Aggregate Metrics (N=35)

| Metric | Value |
|---|---|
| Hit@1 (at least one expected in position 1) | **68.57%** (24/35) |
| Hit@3 (at least one expected in top 3) | **82.86%** (29/35) |
| Hit@5 (at least one expected in top 5) | **91.43%** (32/35) |
| Mean Reciprocal Rank (MRR) | **0.7529** |
| Mean Recall@1 | 50.48% |
| Mean Recall@3 | 76.67% |
| Mean Recall@5 | 84.29% |
| Mean Precision@1 | 64.76% |
| Mean Precision@3 | 36.19% |
| Mean Precision@5 | 24.95% |

> [!NOTE]
> **Precision@k definition:** The fraction of the top-k retrieved provisions that are relevant (i.e., in the expected set). This is the standard IR definition. The prior README's "Top-3 Precision: 100%" incorrectly used Hit@3 (binary success) — that claim is retracted.

### 4.3 Hit@3 Failure Analysis (6 of 35 queries)

| Query ID | Domain | Root Cause |
|---|---|---|
| BENCH_Q03 | Consumer | Multi-provision expected (`cpa_2019_s_2_11`, `cpa_2019_s_35`); second provision at rank 5, not top 3 — partial corpus coverage |
| BENCH_Q06 | Cyber/IT | APK SMS fraud query; `it_act_2000_s_66d` not surfaced — domain-bonus regex doesn't cover "APK" phrasing |
| BENCH_Q11 | PoSH | Expected `posh_2013_s_2` for definition query; not retrieved in top 3 — BM25 penalised short-text provisions |
| BENCH_Q18 | Criminal/BNS | Contractor funds diversion query; no precise corpus provision maps to this — corpus-limited |
| BENCH_Q19 | Tenancy/TPA | Notice period query; `tpa_1882_s_106` retrieved at rank 4, not top 3 |
| BENCH_Q21 | Criminal/BNS | Bike theft query; `bns_2023_s_303` missed — "bike" not in provision text, "vehicle" mapping absent |

**Improvement vector:** All 6 failures are addressable by: (a) expanding the corpus beyond 26 provisions, (b) adding synonym/alias expansion in the retriever, or (c) adding neural embedding re-ranking.

---

## 5. Risk Router Evaluation

### 5.1 Dataset Design

- **N = 30** synthetic queries (not used in unit tests)
- Stored in: `docs/research/evaluation/risk_router_results.csv`
- 13 ground-truth emergencies, 17 ground-truth non-emergencies
- Categories: `EMERGENCY_PHYSICAL`, `EMERGENCY_SUICIDE`, `EMERGENCY_FINANCIAL`, `HIGH_RISK`, `NORMAL_LEGAL`, `NORMAL_INFO`

### 5.2 Pre-fix Results (v1 patterns)

| Label | Count |
|---|---|
| TP | 11 |
| FP | 0 |
| TN | 17 |
| FN | **2** |
| Emergency Recall | **84.62%** |
| Emergency Precision | 100.00% |
| F1 | 0.9167 |

**False negatives:**
1. **RISK_02:** "Someone has locked me in a room and is threatening to stab me with a knife" — `locked\s+in` pattern required exact phrase; `locked me in` was not matched. Stabbing threat had no dedicated pattern.
2. **RISK_03:** "He threw petrol on me and is holding a lighter please send police now" — weapon pattern required `he/she/they has/have/holding petrol` structure; "threw petrol" was not covered.

### 5.3 Post-fix Results (v2 patterns)

Added 4 new regex patterns to [`lib/engine/risk_router.ts`](../../lib/engine/risk_router.ts):
- `locked\s+(me|us|her|him|them)\s+in` — covers indirect object phrasing
- `threatening\s+to\s+stab|going\s+to\s+stab|will\s+stab` — stabbing threat language
- `threw\s+petrol|poured\s+petrol|threw\s+acid|poured\s+acid` — flammable/corrosive attack
- `holding\s+a\s+lighter|lighter\s+and\s+petrol|set\s+me\s+on\s+fire` — arson threat

| Label | Count |
|---|---|
| TP | **13** |
| FP | 0 |
| TN | 17 |
| FN | **0** |
| Emergency Recall | **100.00%** |
| Emergency Precision | **100.00%** |
| Specificity | **100.00%** |
| F1 | **1.0000** |

**46/46 tests pass after the fix** (confirmed `npm test`).

> [!NOTE]
> The F1=1.00 on N=30 reflects a small, targeted synthetic dataset. Real-world adversarial users may construct queries that evade all current patterns. The deterministic router is intentionally **biased toward recall** (false positives are acceptable; false negatives for physical emergencies are not). Further red-teaming on a larger, independent dataset is required.

---

## 6. Latency Evaluation

### 6.1 Offline (Deterministic Mode)

**Methodology:** 50 trials each, 5 warmup discarded. Measured in-process using `performance.now()`. No network calls.

| Component | Median (ms) | Mean (ms) | p95 (ms) | Max (ms) | N |
|---|---|---|---|---|---|
| Hybrid Retrieval (isolated) | **0.37** | 0.41 | 0.68 | 0.74 | 50 |
| Deterministic Pipeline E2E | **0.41** | 0.48 | 0.72 | 1.94 | 50 |

> **Context:** These measure in-process function calls over a 26-provision in-memory corpus. HTTP overhead, JSON serialization, and Next.js API route overhead are not included. Real HTTP latency will be higher (typically 5–20 ms depending on server load).

### 6.2 Live Groq API (3 trials, bypass sandbox)

**Methodology:** 3 single-query trials, sequential, pre-rate-limit. Primary model `openai/gpt-oss-120b`.

| Trial | Latency (ms) |
|---|---|
| 1 | ~800 |
| 2 | ~3 129 |
| 3 | ~4 015 |
| **Median** | **~3 129** |

> [!WARNING]
> **High variance explanation:** The bulk evaluation session triggered Groq free-tier rate limits (8 000 TPM for `gpt-oss-120b`, 1 000 OTPM for `qwen3.8-27b`). The 3-trial live measurement occurred at the start of the session and is representative of cold-start LPU latency under low load. Under repeated or concurrent queries, expect throttling and fallback to deterministic mode on the free tier.
>
> Prior session testing (individual queries) measured typical latency in the **1.5 s – 3 s** range for the primary model. This range is more representative of single-user production latency.

### 6.3 LLM Latency Claims Retracted

The README previously claimed:
- Groq LLM Generation: **2.34 s** mean — *source unknown, not from a measured trial*
- Groq Fast Fallback: **1.51 s** mean — *source unknown*
- Deterministic Fallback: **8.6 ms** — *source unknown; measured value is 0.41 ms (in-process), or ~5–20 ms (HTTP)*

These values are **retracted**. Use the measured values from this report and `latency_results.csv`.

---

## 7. Citation Fidelity Audit

### 7.1 Mechanistic Existence (Automated)

**Method:** For every triage response generated by the deterministic synthesizer across all 35 benchmark queries, verify that each cited provision ID exists in the retrieved context (i.e., the citation is not hallucinated from outside the retrieval result).

**Result:** **105 / 105 citations verified (100.00%)**

This is an architectural guarantee: the deterministic synthesizer only references provision IDs from the retriever's output array. It cannot hallucinate IDs it was not given.

### 7.2 Legal Substantiveness (Human Review — PENDING)

Whether cited provisions actually substantiate the legal claims made in generated responses requires review by a qualified legal professional.

**Status: NOT COMPLETED.**

This evaluation cannot be automated. The mechanistic fidelity (100%) does not imply that the cited section is the *correct* or *most appropriate* provision for the query, that the legal interpretation is accurate, or that no relevant provisions were omitted. This distinction must be explicitly stated in any academic publication.

---

## 8. Fallback Chain Verification

**Test file:** `tests/fallback_chain.test.ts` (5 / 5 passing)

| Scenario | Expected behaviour | Result |
|---|---|---|
| Primary model 429/503 | Secondary model called | ✅ PASS |
| Both models fail | Deterministic fallback | ✅ PASS |
| AbortError (timeout) | Deterministic fallback | ✅ PASS |
| Malformed non-JSON response | Deterministic fallback | ✅ PASS |
| Empty/vacuous query | `UNCERTAIN` route, zero API calls | ✅ PASS |

---

## 9. Comparison with Prior README Claims

| Metric | Prior README | Actual Measured | Status |
|---|---|---|---|
| Emergency Recall | "100%" | 84.62% (pre-fix) → **100%** (post-fix, N=30) | ⚠ Pre-fix claim was fabricated; post-fix is measured |
| "Top-3 Precision: 100%" | Claimed | **Hit@3 = 82.86%**, Precision@3 = 36.19% | ❌ Retracted — "precision" was mislabelled Hit |
| Hallucinated Provision Rate: 0% | Claimed | **0%** — confirmed (mechanistic only) | ✅ Confirmed with caveat (legal substantiveness pending) |
| Retrieval latency: 8.4 ms | Claimed | **0.37 ms** in-process (no HTTP overhead) | ❌ Prior number unverified; new number is measured |
| Deterministic E2E: 8.6 ms | Claimed | **0.41 ms** in-process | ❌ Prior number unverified |
| Groq LLM: 2.34 s | Claimed | ~1.5–3 s (3 trials; high variance) | ⚠ Plausible range, but prior exact figure unverified |
| Corpus: "26 primary provisions" | Stated | **26** confirmed | ✅ Correct |
| Test suite: 40/40 pass | Stated | **46/46 pass** (6 new tests added) | ✅ Improved |

---

## 10. Limitations and Honest Disclosures

1. **Small corpus:** 26 provisions across 10 Acts is a demonstration corpus, not a production legal index. Hit@3 of 82.86% will likely degrade on out-of-corpus queries in production. A minimum viable production corpus should contain all numbered sections of all 10 Acts (estimated 500–1 000 provisions).

2. **No neural embeddings:** The retriever is a lexical BM25 + Jaccard heuristic system. Performance comparisons with dense-retrieval or hybrid neural systems are not yet possible.

3. **Synthetic benchmark:** The 35-query retrieval benchmark and 30-case risk routing dataset are synthetic. They were independently constructed (not copied from unit tests) but were built by the same team that built the system, introducing the risk of conscious or unconscious alignment between queries and what the system handles well.

4. **Risk router N=30:** The emergency routing dataset is small and not drawn from a validated adversarial corpus. The F1=1.00 post-fix result on this dataset is encouraging but not a production safety certification.

5. **Live Groq latency is rate-limited:** Free-tier Groq TPM limits (8 000 for primary model) mean that load testing is not possible on the development account. Production latency characterisation requires a paid tier or a self-hosted LLM.

6. **No multi-lingual evaluation:** The system claims English, Hindi, and Hinglish support. The benchmark contains only English queries. Hindi/Hinglish performance is not evaluated here.

7. **Human legal review pending:** Citation substantiveness (whether cited sections correctly answer the user's legal question) has not been reviewed by a qualified Indian advocate. All generated responses include the disclaimer that they are not legal advice.

8. **No user study:** This report covers technical retrieval and routing metrics only. No user study, legal expert evaluation, or usability study has been conducted.

---

## 11. Files in This Directory

| File | Description |
|---|---|
| `retrieval_benchmark.jsonl` | 35 retrieval benchmark queries with expected provision IDs |
| `retrieval_results.csv` | Per-query retrieval results (Hit@k, Recall@k, Precision@k, MRR) |
| `risk_router_results.csv` | 30-case risk routing dataset with TP/FP/TN/FN labels (post-fix) |
| `latency_results.csv` | Latency measurements (hybrid retrieval, deterministic E2E, live Groq) |
| `ENVIRONMENT.md` | Hardware, software, and reproducibility instructions |
| `NYAYASETU_EMPIRICAL_EVALUATION.md` | This report |

---

## 12. Reproducibility

```bash
# Full test suite (includes evaluation_suite.test.ts)
npm install && npm test

# Direct evaluation harness
npx tsx scripts/run_reproducible_evaluation.ts

# Results overwrite docs/research/evaluation/*.csv
```

All CSV files are regenerated by `tests/evaluation_suite.test.ts` on each `npm test` run. The benchmark JSONL (`retrieval_benchmark.jsonl`) is static ground truth and is not modified by tests.

---

*This report was generated as part of the research paper evaluation for NyayaSetu (Yashraj Gupta, 2026). All metrics are based on automated measurements run locally on the above-described hardware. The report is honest about limitations and does not claim production safety certification.*
