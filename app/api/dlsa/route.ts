import { NextResponse } from "next/server";
import dlsaData from "@/data/dlsa_directory.json";

export interface DLSARecord {
  id: string;
  state: string;
  district: string;
  authority_name: string;
  court_complex: string;
  office_address: string;
  phone: string;
  email: string;
  helpline: string;
  working_hours: string;
  services_offered: string[];
  official_url: string;
}

const dlsaDirectory: DLSARecord[] = dlsaData as DLSARecord[];

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateFilter = (searchParams.get("state") || "").trim();
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    let filtered = dlsaDirectory;

    if (stateFilter && stateFilter !== "All States & UTs") {
      filtered = filtered.filter(d => d.state.toLowerCase() === stateFilter.toLowerCase());
    }

    if (q) {
      filtered = filtered.filter(d => {
        const text = `${d.authority_name} ${d.district} ${d.state} ${d.court_complex} ${d.office_address} ${d.services_offered.join(" ")}`.toLowerCase();
        return text.includes(q);
      });
    }

    const availableStates = Array.from(new Set(dlsaDirectory.map(d => d.state))).sort();

    return NextResponse.json({
      total: filtered.length,
      available_states: ["All States & UTs", ...availableStates],
      results: filtered
    });
  } catch (error) {
    console.error("DLSA API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve DLSA directory data." },
      { status: 500 }
    );
  }
}
