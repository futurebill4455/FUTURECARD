import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { listBackgroundAnimations } from "@/lib/db/background-animations";
import { requireSession } from "@/lib/session";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Active background designs available to card owners */
export async function GET() {
  return withApiHandler(async () => {
    const { error } = await requireSession();
    if (error) return error;

    try {
      await dbConnect();
      const data = await listBackgroundAnimations({ activeOnly: true });
      return NextResponse.json({
        data,
        message:
          data.some((d) => d._id.startsWith("builtin-"))
            ? "Using built-in catalog. Apply supabase/migrations/012_background_animations_rls.sql in Supabase for live admin control."
            : undefined,
      });
    } catch (err) {
      return toApiError(err);
    }
  });
}
