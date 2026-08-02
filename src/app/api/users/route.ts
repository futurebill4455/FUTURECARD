import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { requireAdmin } from "@/lib/session";
import { createUserSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/lib/constants";
import { DEFAULT_USER_LIMITS } from "@/types/platform.types";
import { featuresForNewUser } from "@/lib/custom-domain-access";
import { expireDueSubscriptions } from "@/lib/subscription-access";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await dbConnect();
  await expireDueSubscriptions();

  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  const subs = await Subscription.find().lean();
  const subMap = Object.fromEntries(
    subs.map((s) => [s.userId.toString(), s]),
  );

  const data = users.map((u) => {
    const id = String(u._id);
    return {
      ...u,
      _id: id,
      subscription: subMap[id] ?? null,
    };
  });

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = createUserSchema.parse(body);

    await dbConnect();
    const exists = await User.findOne({ email: validated.email.toLowerCase() });
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const password = await bcrypt.hash(validated.password, 12);
    const planLimits = PLAN_LIMITS[validated.plan];

    const user = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      password,
      role: validated.role,
      features: featuresForNewUser(validated.plan, validated.features),
      limits: {
        ...DEFAULT_USER_LIMITS,
        maxCards: planLimits.maxCards,
      },
    });

    const startDate = new Date();
    const endDate = new Date(startDate);
    const days =
      validated.customDays ?? planLimits.days * validated.years;
    endDate.setDate(endDate.getDate() + days);

    await Subscription.create({
      userId: user._id,
      plan: validated.plan,
      startDate,
      endDate,
      isActive: true,
      paymentStatus: "paid",
      amount:
        validated.plan === "free"
          ? 0
          : validated.plan === "basic"
            ? 999
            : 2499,
    });

    const safe = user.toObject();
    delete (safe as { password?: string }).password;

    return NextResponse.json(
      { data: safe, message: "User created" },
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
