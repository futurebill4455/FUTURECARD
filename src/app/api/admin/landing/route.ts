import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "@/lib/platform-settings";
import { landingCmsUpdateSchema } from "@/lib/validations";
import { resolveLandingCms } from "@/types/landing-cms.types";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;
    const settings = await getPlatformSettings();
    return NextResponse.json({
      data: resolveLandingCms(settings.landingCms),
    });
  });
}

export async function PUT(req: NextRequest) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      const body = await req.json();
      const validated = landingCmsUpdateSchema.parse(body);
      const landingCms = resolveLandingCms(validated.landingCms);
      const data = await updatePlatformSettings({ landingCms });
      return NextResponse.json({
        data: resolveLandingCms(data.landingCms),
        message: "Landing page content saved",
      });
    } catch (err) {
      return toApiError(err);
    }
  });
}
