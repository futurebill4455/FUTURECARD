import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import {
  listBackgroundAnimations,
  updateBackgroundAnimation,
} from "@/lib/db/background-animations";
import { requireAdmin } from "@/lib/session";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const patchSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(300).optional(),
  thumbnailUrl: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export async function GET() {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    await dbConnect();
    const data = await listBackgroundAnimations();
    return NextResponse.json({ data });
  });
}

export async function PATCH(req: NextRequest) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      const body = await req.json();
      const validated = patchSchema.parse(body);
      await dbConnect();
      const updated = await updateBackgroundAnimation(validated.id, {
        isActive: validated.isActive,
        isDefault: validated.isDefault,
        name: validated.name,
        description: validated.description,
        thumbnailUrl: validated.thumbnailUrl,
        sortOrder: validated.sortOrder,
      });
      if (!updated) {
        return NextResponse.json({ error: "Design not found" }, { status: 404 });
      }
      const data = await listBackgroundAnimations();
      return NextResponse.json({
        data,
        message: "Background animations updated",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: err.errors },
          { status: 400 },
        );
      }
      return toApiError(err);
    }
  });
}
