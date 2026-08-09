import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import {
  deleteCard,
  findCardByIdForUser,
  updateCard,
} from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { requireSession } from "@/lib/session";
import { cardSchema } from "@/lib/validations";
import { mergeFeaturesEnabledRespectingAdmin } from "@/types/card-sections.types";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ cardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    const { cardId } = await params;
    await dbConnect();
    const card = await findCardByIdForUser(cardId, session!.user.id);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json({ data: card });
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    try {
      const { cardId } = await params;
      const body = await req.json();
      const validated = cardSchema.parse(body);

      await dbConnect();
      const existing = await findCardByIdForUser(cardId, session!.user.id);
      if (!existing) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      const payload = { ...(validated as unknown as Record<string, unknown>) };
      // Super Admin only — never allow user PUT to change profile type
      delete payload.profileType;
      delete payload.profile_type;
      if (validated.featuresEnabled) {
        const owner = await findUserById(session!.user.id);
        payload.featuresEnabled = mergeFeaturesEnabledRespectingAdmin(
          owner?.cardSections,
          existing.featuresEnabled,
          validated.featuresEnabled,
        );
      }

      const card = await updateCard(cardId, payload, {
        userId: session!.user.id,
      });

      if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      return NextResponse.json({ data: card, message: "Card updated" });
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

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    const { cardId } = await params;
    await dbConnect();
    const ok = await deleteCard(cardId, session!.user.id);

    if (!ok) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Card deleted" });
  });
}
