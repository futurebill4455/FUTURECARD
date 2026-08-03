import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { Card } from "@/models/Card";
import { requireAdmin } from "@/lib/session";
import { adminUpdateUserSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/lib/constants";
import { resolveFeatures } from "@/types/platform.types";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    const { userId } = await params;
    await dbConnect();
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const subscription = await Subscription.findOne({ userId });
    return NextResponse.json({
      data: {
        ...user.toObject(),
        _id: user._id.toString(),
        subscription,
      },
    });
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    const { userId } = await params;

    try {
      const body = await req.json();
      const validated = adminUpdateUserSchema.parse(body);

      await dbConnect();
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (validated.name) user.name = validated.name;
      if (validated.role) user.role = validated.role;
      if (validated.isActive !== undefined) user.isActive = validated.isActive;
      if (validated.features) {
        user.features = {
          ...resolveFeatures(user.features as never),
          ...validated.features,
        };
      }
      if (validated.limits) {
        user.limits = { ...user.limits, ...validated.limits };
      }
      await user.save();

      if (!user.isActive) {
        await Card.updateMany({ userId }, { $set: { isActive: false } });
      }

      let sub = await Subscription.findOne({ userId });
      if (
        !sub &&
        (validated.plan || validated.renewDays || validated.endDate)
      ) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        sub = await Subscription.create({
          userId,
          plan: validated.plan ?? "basic",
          startDate,
          endDate,
          isActive: true,
          paymentStatus: "paid",
        });
      }

      if (sub) {
        if (validated.plan) sub.plan = validated.plan;
        if (validated.paymentStatus)
          sub.paymentStatus = validated.paymentStatus;

        if (validated.endDate) {
          const parsed = new Date(validated.endDate);
          if (!Number.isNaN(parsed.getTime())) {
            sub.endDate = parsed;
            sub.isActive = parsed > new Date();
            sub.paymentStatus = sub.isActive ? "paid" : "expired";
          }
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

        if (validated.renewYears) {
          const base =
            sub.endDate && sub.endDate > new Date()
              ? new Date(sub.endDate)
              : new Date();
          const planKey = (sub.plan || "basic") as keyof typeof PLAN_LIMITS;
          base.setDate(
            base.getDate() + PLAN_LIMITS[planKey].days * validated.renewYears,
          );
          sub.endDate = base;
          sub.isActive = true;
          sub.paymentStatus = "paid";
        }

        await sub.save();

        if (!sub.isActive) {
          await Card.updateMany({ userId }, { $set: { isActive: false } });
        }
      }

      const fresh = await User.findById(userId).select("-password");
      const subscription = await Subscription.findOne({ userId });

      return NextResponse.json({
        data: {
          ...fresh!.toObject(),
          _id: fresh!._id.toString(),
          subscription,
        },
        message: "User updated",
      });
    } catch (err) {
      return toApiError(err);
    }
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    const { userId } = await params;
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true },
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Card.updateMany({ userId }, { $set: { isActive: false } });
    await Subscription.findOneAndUpdate(
      { userId },
      { isActive: false, paymentStatus: "cancelled" },
    );

    return NextResponse.json({ data: user, message: "User deactivated" });
  });
}
