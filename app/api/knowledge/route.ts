import { NextResponse } from "next/server";
import { LegalProvision } from "@/lib/types";
import seedProvisionsData from "@/data/seed_provisions.json";

const provisions: LegalProvision[] = seedProvisionsData as LegalProvision[];

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const actFilter = (searchParams.get("act") || "").trim();
    const bailableParam = searchParams.get("bailable");
    const cognizableParam = searchParams.get("cognizable");

    let filtered = provisions;

    if (actFilter) {
      filtered = filtered.filter(p => p.act_short.toLowerCase() === actFilter.toLowerCase());
    }

    if (bailableParam !== null && bailableParam !== "") {
      const isBailable = bailableParam === "true";
      filtered = filtered.filter(p => p.legal_attributes?.is_bailable === isBailable);
    }

    if (cognizableParam !== null && cognizableParam !== "") {
      const isCognizable = cognizableParam === "true";
      filtered = filtered.filter(p => p.legal_attributes?.is_cognizable === isCognizable);
    }

    if (q) {
      filtered = filtered.filter(p => {
        const hay = `${p.act_title} ${p.act_short} Section ${p.section_number} ${p.section_heading} ${p.plain_summary} ${p.verbatim_text} ${p.transition_mapping?.historical_section || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // Collect available distinct acts for filter dropdown
    const distinctActs = Array.from(new Set(provisions.map(p => p.act_short))).sort();

    return NextResponse.json({
      total: filtered.length,
      available_acts: distinctActs,
      results: filtered
    }, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch (error) {
    console.error("Knowledge API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve statutory knowledge records." },
      { status: 500 }
    );
  }
}
