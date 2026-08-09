import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { findCardById } from "@/lib/db/cards";
import { requireSession } from "@/lib/session";
import {
  getCardAnalyticsSummary,
  trackEvent,
} from "@/lib/analytics-tracker";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ cardId: string }> };

const trackSchema = z.object({
  eventType: z.enum(["view", "click", "action", "share", "save_contact"]),
  eventDetail: z.string().max(120).optional(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    const { cardId } = await params;
    await dbConnect();

    const card = await findCardById(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (
      session!.user.role !== "admin" &&
      card.userId !== session!.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const summary = await getCardAnalyticsSummary(cardId, card.createdAt);
    return NextResponse.json({ data: summary });
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    try {
      const { cardId } = await params;
      const body = await req.json();
      const validated = trackSchema.parse(body);

      await dbConnect();
      const card = await findCardById(cardId);
      if (!card || !card.isActive) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      await trackEvent({
        cardId,
        eventType: validated.eventType,
        eventDetail: validated.eventDetail,
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
        referrer: req.headers.get("referer") ?? undefined,
      });

      return NextResponse.json({ success: true });
    } catch (err) {
      return toApiError(err);
    }
  });
}
