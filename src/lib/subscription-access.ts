import { dbConnect } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { Card } from "@/models/Card";
import { User } from "@/models/User";
import type { Types } from "mongoose";

export type AccessStatus = "ok" | "expired" | "inactive" | "missing";

/**
 * Mark subscriptions past endDate as expired and deactivate their cards.
 * Safe to call on every public card view / admin load (idempotent).
 */
export async function expireDueSubscriptions(limit = 200) {
  await dbConnect();
  const now = new Date();

  const due = await Subscription.find({
    endDate: { $lt: now },
    $or: [
      { isActive: true },
      { paymentStatus: { $ne: "expired" } },
    ],
  })
    .limit(limit)
    .select("_id userId");

  if (!due.length) return { expired: 0 };

  const ids = due.map((s) => s._id);
  const userIds = due.map((s) => s.userId);

  await Subscription.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive: false, paymentStatus: "expired" } },
  );

  await Card.updateMany(
    { userId: { $in: userIds } },
    { $set: { isActive: false } },
  );

  return { expired: due.length };
}

export async function getUserAccessStatus(
  userId: string | Types.ObjectId,
): Promise<{
  status: AccessStatus;
  endDate?: Date;
  plan?: string;
}> {
  await dbConnect();
  await expireDueSubscriptions();

  const user = await User.findById(userId).select("isActive role");
  if (!user) return { status: "missing" };
  if (user.role === "admin") return { status: "ok" };
  if (!user.isActive) return { status: "inactive" };

  const sub = await Subscription.findOne({ userId });
  if (!sub) return { status: "missing" };

  const now = new Date();
  if (!sub.isActive || sub.paymentStatus === "expired" || sub.endDate < now) {
    if (sub.isActive || sub.paymentStatus !== "expired") {
      sub.isActive = false;
      sub.paymentStatus = "expired";
      await sub.save();
      await Card.updateMany(
        { userId },
        { $set: { isActive: false } },
      );
    }
    return { status: "expired", endDate: sub.endDate, plan: sub.plan };
  }

  return { status: "ok", endDate: sub.endDate, plan: sub.plan };
}

/** True if the card owner's subscription allows public viewing */
export async function isCardPubliclyAccessible(card: {
  userId: Types.ObjectId | string;
  isActive?: boolean;
}) {
  if (card.isActive === false) return false;
  const access = await getUserAccessStatus(card.userId);
  return access.status === "ok";
}
