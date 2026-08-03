import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "@/lib/platform-settings";
import { platformSettingsSchema } from "@/lib/validations";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;
    const data = await getPlatformSettings();
    return NextResponse.json({ data });
  });
}

export async function PUT(req: NextRequest) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      const body = await req.json();
      const validated = platformSettingsSchema.parse(body);
      const data = await updatePlatformSettings(validated);
      return NextResponse.json({ data, message: "Settings saved" });
    } catch (err) {
      return toApiError(err);
    }
  });
}
