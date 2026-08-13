import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/platform-settings";
import { resolveLandingCms } from "@/types/landing-cms.types";
import { withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

/** Public landing CMS (pricing, hero, etc.) — always live from the database. */
export async function GET() {
  return withApiHandler(async () => {
    const settings = await getPlatformSettings();
    return NextResponse.json(
      { data: resolveLandingCms(settings.landingCms) },
      { headers: NO_STORE },
    );
  });
}
