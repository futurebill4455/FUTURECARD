import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Analytics } from "@/models/Analytics";
import type {
  AnalyticsEventType,
  IAnalyticsSummary,
} from "@/types/analytics.types";

export async function trackEvent(params: {
  cardId: string;
  eventType: AnalyticsEventType;
  eventDetail?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}) {
  await dbConnect();
  await Analytics.create(params);
}

export async function getCardAnalyticsSummary(
  cardId: string,
  createdAt: Date,
): Promise<IAnalyticsSummary> {
  await dbConnect();

  const grouped = await Analytics.aggregate([
    { $match: { cardId: new mongoose.Types.ObjectId(cardId) } },
    { $group: { _id: "$eventType", count: { $sum: 1 } } },
  ]);

  const map = Object.fromEntries(grouped.map((g) => [g._id, g.count as number]));
  const totalViews = map.view ?? 0;
  const totalClicks = map.click ?? 0;
  const totalActions = map.action ?? 0;
  const totalShares = map.share ?? 0;
  const totalSaveContacts = map.save_contact ?? 0;
  const daysLive = Math.max(
    1,
    Math.ceil((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000)),
  );
  const engagementRate =
    totalViews > 0
      ? Math.round(((totalActions + totalClicks) / totalViews) * 1000) / 10
      : 0;

  return {
    totalViews,
    totalClicks,
    totalActions,
    totalShares,
    totalSaveContacts,
    daysLive,
    engagementRate,
  };
}
