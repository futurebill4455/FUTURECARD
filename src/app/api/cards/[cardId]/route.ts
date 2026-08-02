import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { requireSession } from "@/lib/session";
import { cardSchema } from "@/lib/validations";

type Params = { params: Promise<{ cardId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { cardId } = await params;
  await dbConnect();
  const card = await Card.findOne({ _id: cardId, userId: session!.user.id });
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }
  return NextResponse.json({ data: card });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { cardId } = await params;
    const body = await req.json();
    const validated = cardSchema.parse(body);

    await dbConnect();
    const card = await Card.findOneAndUpdate(
      { _id: cardId, userId: session!.user.id },
      {
        ...validated,
        username: validated.username.toLowerCase(),
      },
      { new: true },
    );

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { cardId } = await params;
  await dbConnect();
  const card = await Card.findOneAndDelete({
    _id: cardId,
    userId: session!.user.id,
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Card deleted" });
}
