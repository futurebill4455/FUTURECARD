import { dbConnect } from "@/lib/db";
import {
  getAnalyticsSummary,
  insertAnalyticsEvent,
} from "@/lib/db/analytics";
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
  await insertAnalyticsEvent(params);
}

export async function getCardAnalyticsSummary(
  cardId: string,
  createdAt: Date | string,
): Promise<IAnalyticsSummary> {
  await dbConnect();
  return getAnalyticsSummary(cardId, createdAt);
}
