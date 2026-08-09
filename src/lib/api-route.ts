import { NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseError, isSelectionError } from "@/lib/db";

/**
 * Map thrown errors to stable JSON responses so serverless functions
 * never crash unhandled on Supabase / network failures.
 */
export function toApiError(err: unknown, fallback = "Internal server error") {
  if (err instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: err.errors },
      { status: 400 },
    );
  }

  if (isDatabaseError(err) || isSelectionError(err)) {
    console.error("[api] database unavailable", err);

    // Always a clean client payload — never leak driver / Atlas internals
    return NextResponse.json(
      {
        error: "Database temporarily unavailable. Please try again shortly.",
        code: "DATABASE_UNAVAILABLE",
      },
      {
        status: 503,
        headers: {
          "Retry-After": "30",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  console.error("[api]", err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

/** Wrap an API handler so DB / unexpected errors become JSON responses. */
export async function withApiHandler(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    return toApiError(err);
  }
}
