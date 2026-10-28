import { NextResponse } from "next/server";
import { runTriagePipeline } from "@/lib/engine/triage_orchestrator";
import { TriageQuery } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body.query !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload. 'query' string is required." },
        { status: 400 }
      );
    }

    const triageQuery: TriageQuery = {
      query: body.query.slice(0, 4000), // Protect against memory DOS
      incident_date: typeof body.incident_date === "string" ? body.incident_date : undefined,
      state_jurisdiction: typeof body.state_jurisdiction === "string" ? body.state_jurisdiction : undefined,
      is_anonymous: Boolean(body.is_anonymous)
    };

    const result = await runTriagePipeline(triageQuery);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("Triage API error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred during triage processing.",
        route: "UNCERTAIN",
        evidence_status: "INSUFFICIENT",
        latency_ms: 0,
        provider_used: "Error Boundary Fallback"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { resolveProviderConfig } = await import("@/lib/server/provider_config");
  const cfg = resolveProviderConfig();
  return NextResponse.json({
    service: "NyayaSetu Legal Triage Engine",
    status: "healthy",
    version: "1.0.0-phase1",
    provider: cfg.provider,
    model: cfg.model,
    provider_configured: cfg.isConfigured,
    corpus_size: 18
  });
}
