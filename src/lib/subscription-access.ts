import {
  findDueSubscriptions,
  findSubscriptionByUserId,
  markSubscriptionsExpired,
  updateSubscription,
} from "@/lib/db/subscriptions";
import { deactivateCardsByUser, deactivateCardsByUserIds } from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { dbConnect } from "@/lib/db";

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
