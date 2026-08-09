import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import {
  countCardsByUser,
  createCard,
  findCardByUsername,
  listCardsByUser,
} from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { requireSession } from "@/lib/session";
import { cardSchema } from "@/lib/validations";
import { RESERVED_USERNAMES } from "@/lib/constants";
import { getUserAccessStatus } from "@/lib/subscription-access";
import {
  CARD_LIMIT_REACHED_MESSAGE,
  DEFAULT_USER_LIMITS,
  resolveMaxCardsLimit,
} from "@/types/platform.types";
import { toApiError, withApiHandler } from "@/lib/api-route";
import { mergeFeaturesEnabledRespectingAdmin } from "@/types/card-sections.types";
import { assertActiveBackgroundAnimationSlug } from "@/lib/background-animation-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    await dbConnect();
    const cards = await listCardsByUser(session!.user.id);
    return NextResponse.json({ data: cards });
  });
}

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    try {
      const body = await req.json();
      const validated = cardSchema.parse(body);

      if (RESERVED_USERNAMES.has(validated.username.toLowerCase())) {
        return NextResponse.json(
          { error: "Username is reserved" },
          { status: 400 },
        );
      }

      await dbConnect();

      const access = await getUserAccessStatus(session!.user.id);
      if (access.status === "expired") {
        return NextResponse.json(
          { error: "Subscription expired. Contact admin to renew." },
          { status: 403 },
        );
      }

      const user = await findUserById(session!.user.id);
      const maxCards = resolveMaxCardsLimit(user) || DEFAULT_USER_LIMITS.maxCards;

      const count = await countCardsByUser(session!.user.id);
      if (count >= maxCards) {
        return NextResponse.json(
          { error: CARD_LIMIT_REACHED_MESSAGE },
          { status: 403 },
        );
      }

      const exists = await findCardByUsername(validated.username);
      if (exists) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 },
        );
      }

      const payload = { ...(validated as unknown as Record<string, unknown>) };
      delete payload.profileType;
      delete payload.profile_type;
      // New cards start as business until Super Admin assigns a template
      payload.profileType = "business";
      if (validated.featuresEnabled) {
        payload.featuresEnabled = mergeFeaturesEnabledRespectingAdmin(
          user?.cardSections,
          null,
          validated.featuresEnabled,
        );
      }

      const bg = await assertActiveBackgroundAnimationSlug(
        validated.backgroundAnimationSlug,
      );
      if (!bg.ok) {
        return NextResponse.json({ error: bg.error }, { status: 400 });
      }
      payload.backgroundAnimationSlug = bg.slug;

      const card = await createCard(session!.user.id, payload);

      return NextResponse.json(
        { data: card, message: "Card created successfully" },
        { status: 201 },
      );
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
