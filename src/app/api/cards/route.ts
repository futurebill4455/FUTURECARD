import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { User } from "@/models/User";
import { requireSession } from "@/lib/session";
import { cardSchema } from "@/lib/validations";
import { RESERVED_USERNAMES, PLAN_LIMITS } from "@/lib/constants";
import { getUserAccessStatus } from "@/lib/subscription-access";
import { DEFAULT_USER_LIMITS } from "@/types/platform.types";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  await dbConnect();
  const cards = await Card.find({ userId: session!.user.id }).sort({
    createdAt: -1,
  });

  return NextResponse.json({ data: cards });
}

export async function POST(req: NextRequest) {
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

    const user = await User.findById(session!.user.id).select("limits");
    const maxCards =
      user?.limits?.maxCards ??
      PLAN_LIMITS[(access.plan as keyof typeof PLAN_LIMITS) || "free"]
        ?.maxCards ??
      DEFAULT_USER_LIMITS.maxCards;

    const count = await Card.countDocuments({ userId: session!.user.id });
    if (count >= maxCards) {
      return NextResponse.json(
        { error: `Plan limit reached (${maxCards} cards)` },
        { status: 403 },
      );
    }

    const exists = await Card.findOne({ username: validated.username });
    if (exists) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }

    const card = await Card.create({
      userId: session!.user.id,
      ...validated,
      username: validated.username.toLowerCase(),
    });

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
