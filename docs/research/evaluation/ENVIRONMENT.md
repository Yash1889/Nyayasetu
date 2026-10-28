# NyayaSetu Evaluation Environment Metadata

**Generated:** 2026-10-28  
**Evaluator:** Automated harness (`scripts/run_reproducible_evaluation.ts`) + manual verification  
**Author:** Yashraj Gupta

---

## Hardware

| Property | Value |
|---|---|
| OS | Linux x86\_64 (Ubuntu-based) |
| CPU | Host CPU (x86\_64) |
| RAM | Host RAM (evaluation is in-process, memory-bound) |
| GPU | None used — all inference is CPU-bound |
| Network | **Sandboxed (blocked)** for retrieval/deterministic evaluation; `BypassSandbox=true` required for live Groq API calls |

---

## Software

| Component | Version |
|---|---|
| Node.js | v24.19.0 |
| npm | 12.0.2 |
| TypeScript | 5.x (via `tsx` runner) |
| Vitest | 3.x (test runner) |
| Next.js | 15.x (application framework) |
| React | 19.x |

---

## Corpus

| Property | Value |
|---|---|
| Seed provisions | **26** (manually curated, covering all 10 Acts) |
| Acts covered | BNS 2023, BNSS 2023, NI Act 1881, CPC 1908, CPA 2019, PoSH 2013, IT Act 2000, TPA 1882, RTI Act 2005, PCMA 1929 |
| Provision source | Static TypeScript corpus (`lib/data/provisions.ts`) |
| Retrieval mechanism | BM25 lexical (keyword overlap) + Jaccard-similarity dense proxy + domain-aware regex bonuses + Reciprocal Rank Fusion |
| Embeddings | **None** — dense scoring uses Jaccard token overlap, not neural embeddings |

> **Important:** The retrieval system does NOT use neural embeddings or vector databases. All scoring is lexical/heuristic. This must be clearly stated in any academic comparison.

---

## LLM Configuration

| Property | Value |
|---|---|
| Provider | Groq API (configurable via `LLM_PROVIDER` env var) |
| Primary model | `openai/gpt-oss-120b` (via Groq LPU) |
| Secondary model | `qwen/qwen3.8-27b` (via Groq LPU) |
| Temperature | 0.1 |
| Max tokens | 1024 |
| Timeout | 20 000 ms |
| Fallback | Deterministic offline synthesizer (zero API dependency) |

All **retrieval and risk-routing evaluation** was conducted **offline** (deterministic mode, no API calls). Live Groq API calls were made in a separate bypass-sandbox session for latency measurement and citation fidelity spot-checks (3 queries). See `latency_results.csv` for measured API latency.

---

## Rate Limit Disclosure

During the batch citation-fidelity audit session (bypass sandbox), 35 concurrent-ish Groq API calls exhausted the free-tier TPM quota:
- `openai/gpt-oss-120b`: 8 000 TPM limit → hit 429 after ~6–8 queries
- `qwen/qwen3.8-27b`: 1 000 OTPM limit → hit 429 after ~2–3 queries
- All 429 responses correctly triggered deterministic fallback (confirmed by test logs)

The 3 successful live Groq calls in `latency_results.csv` represent pre-rate-limit measurements and are representative of **single-query production latency** at low load.

---

## Evaluation Dates

| Activity | Date (UTC) |
|---|---|
| Benchmark construction | 2026-10-28 |
| Offline retrieval evaluation | 2026-10-28 |
| Risk router evaluation (pre-fix) | 2026-10-28 |
| Risk router pattern fix | 2026-10-28 |
| Risk router evaluation (post-fix) | 2026-10-28 |
| Latency measurement (offline) | 2026-10-28 |
| Live Groq latency (3 trials, bypass) | 2026-10-28 |
| Test suite final run | 2026-10-28 |

---

## Reproducibility Instructions

```bash
# Install dependencies
npm install

# Run full test suite (includes evaluation_suite.test.ts)
npm test

# Run production build
npm run build

# Run evaluation harness directly (requires tsx)
npx tsx scripts/run_reproducible_evaluation.ts

# Results are written to docs/research/evaluation/
```

For live Groq API calls, set `GROQ_API_KEY` in `.env.local` and run with network access.
