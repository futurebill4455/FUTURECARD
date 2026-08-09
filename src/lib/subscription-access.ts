import {
  createSubscription,
  findDueSubscriptions,
  findSubscriptionByUserId,
  markSubscriptionsExpired,
  updateSubscription,
} from "@/lib/db/subscriptions";
import { deactivateCardsByUser, deactivateCardsByUserIds } from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { dbConnect } from "@/lib/db";
import type { ISubscription } from "@/types/subscription.types";

export type AccessStatus = "ok" | "expired" | "inactive" | "missing";

/**
 * Mark subscriptions past endDate as expired and deactivate their cards.
 * Safe to call on every public card view / admin load (idempotent).
 */
export async function expireDueSubscriptions(limit = 200) {
  await dbConnect();
  const due = await findDueSubscriptions(limit);
  if (!due.length) return { expired: 0 };

  await markSubscriptionsExpired(due.map((s) => s.id));
  await deactivateCardsByUserIds(due.map((s) => s.userId));

  return { expired: due.length };
}

export async function getUserAccessStatus(userId: string): Promise<{
  status: AccessStatus;
  endDate?: Date;
  plan?: string;
}> {
  await dbConnect();
  await expireDueSubscriptions();

  const user = await findUserById(userId);
  if (!user) return { status: "missing" };
  if (user.role === "admin") return { status: "ok" };
  if (!user.isActive) return { status: "inactive" };

  const sub = await findSubscriptionByUserId(userId);
  if (!sub) return { status: "missing" };

  const now = new Date();
  const endDate = new Date(sub.endDate);
  if (!sub.isActive || sub.paymentStatus === "expired" || endDate < now) {
    if (sub.isActive || sub.paymentStatus !== "expired") {
      await updateSubscription(sub._id, {
        isActive: false,
        paymentStatus: "expired",
      });
      await deactivateCardsByUser(userId);
    }
    return { status: "expired", endDate, plan: sub.plan };
  }

  return { status: "ok", endDate, plan: sub.plan };
}

/** True if the card owner's subscription allows public viewing */
export async function isCardPubliclyAccessible(card: {
  userId: string;
  isActive?: boolean;
}) {
  if (card.isActive === false) return false;
  const access = await getUserAccessStatus(card.userId);
  return access.status === "ok";
}

/**
 * Admin toggle: set subscription active/inactive in Supabase `subscriptions`.
 * Subscribe → is_active=true, payment_status=paid (extend end if past).
 * Unsubscribe → is_active=false, payment_status=cancelled + deactivate cards.
 */
export async function setUserSubscribed(
  userId: string,
  subscribed: boolean,
): Promise<ISubscription> {
  await dbConnect();

  const user = await findUserById(userId);
  if (!user) {
    throw Object.assign(new Error("User not found"), { code: "NOT_FOUND" });
  }
  if (user.role === "admin") {
    throw Object.assign(
      new Error("Cannot toggle subscription for admin accounts"),
      { code: "FORBIDDEN" },
    );
  }

  let sub = await findSubscriptionByUserId(userId);
  const now = new Date();

  if (subscribed) {
    const end =
      sub?.endDate && new Date(sub.endDate) > now
        ? new Date(sub.endDate)
        : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    if (!sub) {
      sub = await createSubscription({
        userId,
        plan: "basic",
        startDate: now,
        endDate: end,
        isActive: true,
        paymentStatus: "paid",
      });
    } else {
      sub =
        (await updateSubscription(sub._id, {
          isActive: true,
          paymentStatus: "paid",
          endDate: end,
        })) ?? sub;
    }
    return sub;
  }

  // Unsubscribe
  if (!sub) {
    sub = await createSubscription({
      userId,
      plan: "free",
      startDate: now,
      endDate: now,
      isActive: false,
      paymentStatus: "cancelled",
    });
  } else {
    sub =
      (await updateSubscription(sub._id, {
        isActive: false,
        paymentStatus: "cancelled",
      })) ?? sub;
  }

  await deactivateCardsByUser(userId);
  return sub;
}
