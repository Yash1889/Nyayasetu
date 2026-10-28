import { describe, it, expect } from "vitest";
import { runFullEvaluation } from "../scripts/run_reproducible_evaluation";

describe("NyayaSetu Empirical Evaluation Suite", () => {
  it("executes full reproducible benchmark and generates all CSV artifacts", async () => {
    const results = await runFullEvaluation();

    // Verify benchmark executed across all 35 queries
    expect(results.retrieval.totalQ).toBe(35);
    expect(results.retrieval.meanHitAt3).toBeGreaterThan(0.70);
    expect(results.retrieval.meanMRR).toBeGreaterThan(0.60);

    // Verify risk router evaluated on at least 30 synthetic test cases
    expect(results.risk.totalCases).toBeGreaterThanOrEqual(30);

    // Verify citation fidelity
    expect(results.citations.mechanisticCitationPrecision).toBe(1.0);

    // Verify latency stats were recorded
    expect(results.latency.retrievalStats.n).toBe(50);
    expect(results.latency.deterministicStats.n).toBe(50);
  }, 60000); // 60s timeout for multi-trial benchmark
});
