import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { findCardById, updateCardFields } from "@/lib/db/cards";
import { requireAdmin } from "@/lib/session";
import {
  CARD_PROFILE_TYPES,
  PROFILE_TYPE_SECTION_PRESETS,
  resolveCardProfileType,
} from "@/types/card-profile.types";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ cardId: string }> };

const adminCardProfileSchema = z.object({
  profileType: z.enum(CARD_PROFILE_TYPES),
  /** When true (default), apply section visibility preset for this type */
  applySectionPreset: z.boolean().optional().default(true),
});

/** Super Admin: set card profile / template type */
export async function PATCH(req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      const { cardId } = await params;
      const body = await req.json();
      const validated = adminCardProfileSchema.parse(body);
      const profileType = resolveCardProfileType(validated.profileType);

      await dbConnect();
      const existing = await findCardById(cardId);
      if (!existing) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      const fields: Record<string, unknown> = {
        profile_type: profileType,
      };
      if (validated.applySectionPreset !== false) {
        fields.features_enabled = PROFILE_TYPE_SECTION_PRESETS[profileType];
      }

      const card = await updateCardFields(cardId, fields);
      return NextResponse.json({
        data: card,
        message: `Profile type set to ${profileType}`,
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

export async function GET(_req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    const { cardId } = await params;
    await dbConnect();
    const card = await findCardById(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json({ data: card });
  });
}
