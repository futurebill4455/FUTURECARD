import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { requireSession } from "@/lib/session";
import {
  getCardAnalyticsSummary,
  trackEvent,
} from "@/lib/analytics-tracker";

type Params = { params: Promise<{ cardId: string }> };

const trackSchema = z.object({
  eventType: z.enum(["view", "click", "action", "share", "save_contact"]),
  eventDetail: z.string().max(120).optional(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { cardId } = await params;
  await dbConnect();

  const card = await Card.findById(cardId);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (
    session!.user.role !== "admin" &&
    card.userId.toString() !== session!.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const summary = await getCardAnalyticsSummary(cardId, card.createdAt);
  return NextResponse.json({ data: summary });
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { cardId } = await params;
    const body = await req.json();
    const validated = trackSchema.parse(body);

    await dbConnect();
    const card = await Card.findById(cardId);
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
