import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { findUserById } from "@/lib/db/users";
import {
  createSubscription,
  findSubscriptionByUserId,
  listSubscriptions,
  updateSubscription,
} from "@/lib/db/subscriptions";
import { requireAdmin, requireSession } from "@/lib/session";
import { subscriptionUpdateSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/lib/constants";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    await dbConnect();

    if (session!.user.role === "admin") {
      const subs = await listSubscriptions();
      // Enrich with user info for admin table
      const enriched = await Promise.all(
        subs.map(async (s) => {
          const user = await findUserById(s.userId);
          return {
            ...s,
            userId: user
              ? {
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  isActive: user.isActive,
                }
              : s.userId,
          };
        }),
      );
      return NextResponse.json({ data: enriched });
    }

    const sub = await findSubscriptionByUserId(session!.user.id);
    return NextResponse.json({ data: sub });
  });
}

export async function PATCH(req: NextRequest) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      const body = await req.json();
      const validated = subscriptionUpdateSchema.parse(body);

      await dbConnect();
      const user = await findUserById(validated.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      let sub = await findSubscriptionByUserId(validated.userId);
      if (!sub) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        sub = await createSubscription({
          userId: validated.userId,
          plan: validated.plan ?? "basic",
          startDate,
          endDate,
          isActive: true,
          paymentStatus: "paid",
        });
      }

      const patch: Parameters<typeof updateSubscription>[1] = {};
      if (validated.plan) patch.plan = validated.plan;
      if (validated.paymentStatus) patch.paymentStatus = validated.paymentStatus;
      if (validated.isActive !== undefined) patch.isActive = validated.isActive;
      if (validated.amount !== undefined) patch.amount = validated.amount;

      if (validated.renewYears) {
        const base =
          sub.endDate && new Date(sub.endDate) > new Date()
            ? new Date(sub.endDate)
            : new Date();
        const planKey = sub.plan as keyof typeof PLAN_LIMITS;
        const days = PLAN_LIMITS[planKey].days * validated.renewYears;
        base.setDate(base.getDate() + days);
        patch.endDate = base;
        patch.isActive = true;
        patch.paymentStatus = "paid";
      }

      if (validated.renewDays) {
        const base =
          sub.endDate && new Date(sub.endDate) > new Date()
            ? new Date(sub.endDate)
            : new Date();
        base.setDate(base.getDate() + validated.renewDays);
        patch.endDate = base;
        patch.isActive = true;
        patch.paymentStatus = "paid";
      }

      if (validated.endDate) {
        const parsed = new Date(validated.endDate);
        if (!Number.isNaN(parsed.getTime())) {
          patch.endDate = parsed;
          patch.isActive = parsed > new Date();
          patch.paymentStatus = patch.isActive ? "paid" : "expired";
        }
      }

      const updated = await updateSubscription(sub._id, patch);
      return NextResponse.json({
        data: updated,
        message: "Subscription updated",
      });
    } catch (err) {
      return toApiError(err);
    }
  });
}
