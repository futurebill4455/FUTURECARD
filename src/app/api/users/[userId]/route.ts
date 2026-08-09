import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { findUserById, updateUser } from "@/lib/db/users";
import {
  createSubscription,
  findSubscriptionByUserId,
  updateSubscription,
} from "@/lib/db/subscriptions";
import { deactivateCardsByUser } from "@/lib/db/cards";
import { requireAdmin } from "@/lib/session";
import { adminUpdateUserSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/lib/constants";
import { resolveFeatures } from "@/types/platform.types";
import { resolveCardSections } from "@/types/card-sections.types";
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
    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const subscription = await findSubscriptionByUserId(userId);
    return NextResponse.json({
      data: {
        ...user,
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
      const user = await findUserById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const patch: Parameters<typeof updateUser>[1] = {};
      if (validated.name) patch.name = validated.name;
      if (validated.role) patch.role = validated.role;
      if (validated.isActive !== undefined) patch.isActive = validated.isActive;
      if (validated.features) {
        patch.features = {
          ...resolveFeatures(user.features),
          ...validated.features,
        };
      }
      if (validated.cardSections) {
        patch.cardSections = {
          ...resolveCardSections(user.cardSections),
          ...validated.cardSections,
        };
      }
      if (validated.limits) {
        patch.limits = { ...user.limits!, ...validated.limits };
      }

      const updated = await updateUser(userId, patch);
      if (!updated) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (updated.isActive === false) {
        await deactivateCardsByUser(userId);
      }

      let sub = await findSubscriptionByUserId(userId);
      if (
        !sub &&
        (validated.plan || validated.renewDays || validated.endDate)
      ) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        sub = await createSubscription({
          userId,
          plan: validated.plan ?? "basic",
          startDate,
          endDate,
          isActive: true,
          paymentStatus: "paid",
        });
      }

      if (sub) {
        const subPatch: Parameters<typeof updateSubscription>[1] = {};
        if (validated.plan) subPatch.plan = validated.plan;
        if (validated.paymentStatus)
          subPatch.paymentStatus = validated.paymentStatus;

        if (validated.endDate) {
          const parsed = new Date(validated.endDate);
          if (!Number.isNaN(parsed.getTime())) {
            subPatch.endDate = parsed;
            subPatch.isActive = parsed > new Date();
            subPatch.paymentStatus = subPatch.isActive ? "paid" : "expired";
          }
        }

        if (validated.renewDays) {
          const base =
            sub.endDate && new Date(sub.endDate) > new Date()
              ? new Date(sub.endDate)
              : new Date();
          base.setDate(base.getDate() + validated.renewDays);
          subPatch.endDate = base;
          subPatch.isActive = true;
          subPatch.paymentStatus = "paid";
        }

        if (validated.renewYears) {
          const base =
            sub.endDate && new Date(sub.endDate) > new Date()
              ? new Date(sub.endDate)
              : new Date();
          const planKey = (sub.plan || "basic") as keyof typeof PLAN_LIMITS;
          base.setDate(
            base.getDate() + PLAN_LIMITS[planKey].days * validated.renewYears,
          );
          subPatch.endDate = base;
          subPatch.isActive = true;
          subPatch.paymentStatus = "paid";
        }

        sub = (await updateSubscription(sub._id, subPatch)) ?? sub;

        if (!sub.isActive) {
          await deactivateCardsByUser(userId);
        }
      }

      const fresh = await findUserById(userId);
      const subscription = await findSubscriptionByUserId(userId);

      return NextResponse.json({
        data: {
          ...fresh!,
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
    const user = await updateUser(userId, { isActive: false });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await deactivateCardsByUser(userId);
    const sub = await findSubscriptionByUserId(userId);
    if (sub) {
      await updateSubscription(sub._id, {
        isActive: false,
        paymentStatus: "cancelled",
      });
    }

    return NextResponse.json({ data: user, message: "User deactivated" });
  });
}
