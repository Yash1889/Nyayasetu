import { describe, it, expect } from "vitest";
import { hybridRetrieve, getAllProvisions, getProvisionById } from "@/lib/engine/hybrid_retriever";

describe("HybridRetriever - BM25 Lexical + Dense Semantic Matching", () => {
  it("loads 26 seed provisions from curated primary statutes across all 10 Central Acts", () => {
    const all = getAllProvisions();
    expect(all.length).toBe(26);
  });

  it("retrieves Consumer Protection Act for product warranty failure", () => {
    const results = hybridRetrieve("refrigerator compressor failed and manufacturer refuses warranty service", 3);
    expect(results.length).toBeGreaterThan(0);
    const top = results[0];
    expect(top.provision.act_short).toBe("CPA 2019");
    expect(["2(11)", "35"]).toContain(top.provision.section_number);
    expect(top.hybrid_score).toBeGreaterThan(0.35);
  });

  it("retrieves Negotiable Instruments Act for bounced cheque query", () => {
    const results = hybridRetrieve("cheque of 50,000 rupees bounced due to insufficient funds in bank account", 3);
    expect(results.length).toBeGreaterThan(0);
    const top = results[0];
    expect(top.provision.act_short).toBe("NI Act 1881");
    expect(top.provision.section_number).toBe("138");
    expect(top.hybrid_score).toBeGreaterThan(0.40);
  });

  it("retrieves Transfer of Property Act / BNS for security deposit dispute", () => {
    const results = hybridRetrieve("landlord not returning 80000 security deposit after vacating flat", 3);
    expect(results.length).toBeGreaterThan(0);
    const topAct = results[0].provision.act_short;
    expect(["TPA 1882", "BNS 2023"]).toContain(topAct);
  });

  it("retrieves IT Act 2000 for phishing / unauthorized cyber fraud", () => {
    const results = hybridRetrieve("clicked phishing link and lost money through unauthorized digital fraud", 3);
    expect(results.length).toBeGreaterThan(0);
    const acts = results.map(r => r.provision.act_short);
    expect(acts.some(a => a === "IT Act 2000" || a === "BNS 2023")).toBe(true);
  });

  it("computes hybrid score strictly within [0.0, 1.0]", () => {
    const results = hybridRetrieve("general tenancy complaint", 5);
    for (const res of results) {
      expect(res.bm25_score).toBeGreaterThanOrEqual(0);
      expect(res.bm25_score).toBeLessThanOrEqual(1.0);
      expect(res.dense_score).toBeGreaterThanOrEqual(0);
      expect(res.dense_score).toBeLessThanOrEqual(1.0);
      expect(res.hybrid_score).toBeGreaterThanOrEqual(0);
      expect(res.hybrid_score).toBeLessThanOrEqual(1.0);
    }
  });

  it("finds a provision by its exact ID", () => {
    const prov = getProvisionById("BNS_2023_S318");
    expect(prov).toBeDefined();
    expect(prov?.act_short).toBe("BNS 2023");
    expect(prov?.section_number).toBe("318");
    expect(prov?.section_heading).toContain("Cheating");
  });
});
