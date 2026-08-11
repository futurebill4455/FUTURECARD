import { NextResponse } from "next/server";
import { dbHealthCheck } from "@/lib/db";
import { resolveSupabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public health endpoint — confirms Supabase env + a lightweight query.
 * Does not expose secrets or raw driver errors beyond a short message.
 */
export async function GET() {
  let configured = false;
  try {
    resolveSupabaseConfig();
    configured = true;
  } catch {
    configured = false;
  }

  const health = configured
    ? await dbHealthCheck()
    : { ok: false, message: "Supabase env vars missing" };

  const status = health.ok ? 200 : 503;
  return NextResponse.json(
    {
      ok: health.ok,
      configured,
      database: health.ok ? "up" : "down",
      message: health.ok ? "ok" : health.message.slice(0, 160),
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(health.ok ? {} : { "Retry-After": "30" }),
      },
    },
  );
}
