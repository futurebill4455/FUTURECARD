import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "@/lib/platform-settings";
import { platformSettingsSchema } from "@/lib/validations";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const data = await getPlatformSettings();
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = platformSettingsSchema.parse(body);
    const data = await updatePlatformSettings(validated);
    return NextResponse.json({ data, message: "Settings saved" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
