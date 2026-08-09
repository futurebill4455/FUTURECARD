import { getSupabaseAdmin } from "@/lib/supabase";
import { throwDbError } from "@/lib/db";
import type {
  AnalyticsEventType,
  IAnalyticsSummary,
} from "@/types/analytics.types";

function sb() {
  return getSupabaseAdmin();
}

export async function insertAnalyticsEvent(params: {
  cardId: string;
  eventType: AnalyticsEventType;
  eventDetail?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}): Promise<void> {
  const { error } = await sb().from("analytics").insert({
    card_id: params.cardId,
    event_type: params.eventType,
    event_detail: params.eventDetail ?? null,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
    referrer: params.referrer ?? null,
  });
  if (error) throwDbError(error, "insertAnalyticsEvent");
}

export async function getAnalyticsSummary(
  cardId: string,
  createdAt: Date | string,
): Promise<IAnalyticsSummary> {
  const { data, error } = await sb()
    .from("analytics")
    .select("event_type")
    .eq("card_id", cardId);
  if (error) throwDbError(error, "getAnalyticsSummary");

  const map: Record<string, number> = {};
  for (const row of data || []) {
    const t = row.event_type as string;
    map[t] = (map[t] || 0) + 1;
  }

  const totalViews = map.view ?? 0;
  const totalClicks = map.click ?? 0;
  const totalActions = map.action ?? 0;
  const totalShares = map.share ?? 0;
  const totalSaveContacts = map.save_contact ?? 0;
  const created =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const daysLive = Math.max(
    1,
    Math.ceil((Date.now() - created.getTime()) / (24 * 60 * 60 * 1000)),
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

export async function countAnalyticsEvents(): Promise<number> {
  const { count, error } = await sb()
    .from("analytics")
    .select("*", { count: "exact", head: true });
  if (error) throwDbError(error, "countAnalyticsEvents");
  return count ?? 0;
}
