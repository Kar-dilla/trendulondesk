import { NextRequest, NextResponse } from "next/server";
import { runDiscovery } from "../../../../src/discovery/orchestrator";

interface RunDiscoveryRequestBody {
  query?: string;
  category?: string;
  region?: string;
  since?: string;
  limit?: number;
}

function isRunDiscoveryRequestBody(
  value: unknown
): value is RunDiscoveryRequestBody {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: RunDiscoveryRequestBody = {};

  const rawText = await request.text();
  if (rawText.trim().length > 0) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 }
      );
    }
    if (!isRunDiscoveryRequestBody(parsed)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }
    body = parsed;
  }

  try {
    const run = await runDiscovery({
      query: body.query,
      category: body.category,
      region: body.region,
      since: body.since,
      limit: body.limit,
    });

    return NextResponse.json({
      run_id: run.run_id,
      status: run.status,
      candidates_after_dedup: run.candidates_after_dedup,
      errors: run.errors,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unexpected error during discovery run",
      },
      { status: 500 }
    );
  }
}
