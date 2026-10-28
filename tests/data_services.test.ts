import { describe, it, expect } from "vitest";
import seedProvisionsData from "@/data/seed_provisions.json";
import dlsaData from "@/data/dlsa_directory.json";
import pathwaysData from "@/data/procedural_pathways.json";
import { hybridRetrieve } from "@/lib/engine/hybrid_retriever";

describe("Data Services — Full Corpus & Directory Verification", () => {
  it("verifies all 26 statutory provisions have complete legal attributes and Gazette URLs", () => {
    expect(seedProvisionsData.length).toBe(26);

    for (const p of seedProvisionsData) {
      expect(p.provision_id).toBeDefined();
      expect(p.act_title).toBeDefined();
      expect(p.act_short).toBeDefined();
      expect(p.section_number).toBeDefined();
      expect(p.verbatim_text.length).toBeGreaterThan(20);
      expect(p.plain_summary.length).toBeGreaterThan(15);
      expect(p.source_url).toMatch(/^https?:\/\//);
      expect(p.legal_attributes).toBeDefined();
    }
  });

  it("verifies all 10 Central Acts are represented in the statutory corpus", () => {
    const acts = new Set(seedProvisionsData.map((p) => p.act_short));
    const requiredActs = [
      "BNS 2023",
      "BNSS 2023",
      "BSA 2023",
      "CPA 2019",
      "IT Act 2000",
      "LSAA 1987",
      "NI Act 1881",
      "PWDVA 2005",
      "RTI Act 2005",
      "TPA 1882"
    ];

    for (const req of requiredActs) {
      expect(acts.has(req)).toBe(true);
    }
  });

  it("retrieves BSA 2023 electronic evidence provisions for WhatsApp and email disputes", () => {
    const results = hybridRetrieve("admissibility of electronic record whatsapp messages email printout", 3);
    expect(results.length).toBeGreaterThan(0);
    const top = results[0];
    expect(top.provision.act_short).toBe("BSA 2023");
    expect(["61", "63"]).toContain(top.provision.section_number);
  });

  it("verifies verified DLSA directory records have real court complexes and official contact info", () => {
    expect(dlsaData.length).toBeGreaterThanOrEqual(10);

    for (const dlsa of dlsaData) {
      expect(dlsa.id).toBeDefined();
      expect(dlsa.state).toBeDefined();
      expect(dlsa.district).toBeDefined();
      expect(dlsa.court_complex.length).toBeGreaterThan(5);
      expect(dlsa.phone).toBeDefined();
      expect(dlsa.email).toContain("@");
      expect(dlsa.helpline).toBe("15100");
    }
  });

  it("verifies procedural pathways contain step ladders with evidence checklists", () => {
    expect(pathwaysData.length).toBeGreaterThanOrEqual(4);

    for (const pw of pathwaysData) {
      expect(pw.id).toBeDefined();
      expect(pw.title).toBeDefined();
      expect(pw.forum).toBeDefined();
      expect(pw.procedural_steps.length).toBeGreaterThanOrEqual(3);
      for (const step of pw.procedural_steps) {
        expect(step.title).toBeDefined();
        expect(step.statutory_deadline).toBeDefined();
        expect(step.evidence_required.length).toBeGreaterThan(0);
      }
    }
  });
});
