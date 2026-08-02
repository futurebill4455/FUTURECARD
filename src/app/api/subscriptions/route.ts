import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { User } from "@/models/User";
import { requireAdmin, requireSession } from "@/lib/session";
import { subscriptionUpdateSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/lib/constants";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  await dbConnect();

  if (session!.user.role === "admin") {
    const subs = await Subscription.find()
      .populate("userId", "name email role isActive")
      .sort({ endDate: 1 });
    return NextResponse.json({ data: subs });
  }

  const sub = await Subscription.findOne({ userId: session!.user.id });
  return NextResponse.json({ data: sub });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = subscriptionUpdateSchema.parse(body);

    await dbConnect();
    const user = await User.findById(validated.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let sub = await Subscription.findOne({ userId: validated.userId });
    if (!sub) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      sub = await Subscription.create({
        userId: validated.userId,
        plan: validated.plan ?? "basic",
        startDate,
        endDate,
        isActive: true,
        paymentStatus: "paid",
      });
    }

    if (validated.plan) sub.plan = validated.plan;
    if (validated.paymentStatus) sub.paymentStatus = validated.paymentStatus;
    if (validated.isActive !== undefined) sub.isActive = validated.isActive;
    if (validated.amount !== undefined) sub.amount = validated.amount;

    if (validated.renewYears) {
      const base =
        sub.endDate && sub.endDate > new Date() ? new Date(sub.endDate) : new Date();
      const planKey = sub.plan as keyof typeof PLAN_LIMITS;
      const days = PLAN_LIMITS[planKey].days * validated.renewYears;
      base.setDate(base.getDate() + days);
      sub.endDate = base;
      sub.isActive = true;
      sub.paymentStatus = "paid";
    }

    if (validated.renewDays) {
      const base =
        sub.endDate && sub.endDate > new Date()
          ? new Date(sub.endDate)
          : new Date();
      base.setDate(base.getDate() + validated.renewDays);
      sub.endDate = base;
      sub.isActive = true;
      sub.paymentStatus = "paid";
    }

    if (validated.endDate) {
      const parsed = new Date(validated.endDate);
      if (!Number.isNaN(parsed.getTime())) {
        sub.endDate = parsed;
        sub.isActive = parsed > new Date();
        sub.paymentStatus = sub.isActive ? "paid" : "expired";
      }
    }

    await sub.save();
    return NextResponse.json({ data: sub, message: "Subscription updated" });
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
