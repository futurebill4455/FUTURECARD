import { getSupabaseAdmin } from "@/lib/supabase";
import { throwDbError } from "@/lib/db";
import { mapSubscription, type SubscriptionRow } from "@/lib/db/mappers";
import type { ISubscription } from "@/types/subscription.types";
import type { SubscriptionPlan, PaymentStatus } from "@/types/subscription.types";

function sb() {
  return getSupabaseAdmin();
}

export async function findSubscriptionByUserId(
  userId: string,
): Promise<ISubscription | null> {
  const { data, error } = await sb()
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throwDbError(error, "findSubscriptionByUserId");
  if (!data) return null;
  return mapSubscription(data as SubscriptionRow);
}

export async function listSubscriptions(): Promise<ISubscription[]> {
  const { data, error } = await sb()
    .from("subscriptions")
    .select("*")
    .order("end_date", { ascending: true });
  if (error) throwDbError(error, "listSubscriptions");
  return (data as SubscriptionRow[]).map(mapSubscription);
}

export async function createSubscription(input: {
  userId: string;
  plan: SubscriptionPlan;
  startDate: Date | string;
  endDate: Date | string;
  isActive?: boolean;
  paymentStatus?: PaymentStatus;
  amount?: number;
  autoRenew?: boolean;
}): Promise<ISubscription> {
  const { data, error } = await sb()
    .from("subscriptions")
    .insert({
      user_id: input.userId,
      plan: input.plan,
      start_date:
        typeof input.startDate === "string"
          ? input.startDate
          : input.startDate.toISOString(),
      end_date:
        typeof input.endDate === "string"
          ? input.endDate
          : input.endDate.toISOString(),
      is_active: input.isActive ?? true,
      payment_status: input.paymentStatus ?? "paid",
      amount: input.amount ?? null,
      auto_renew: input.autoRenew ?? false,
    })
    .select("*")
    .single();
  if (error) throwDbError(error, "createSubscription");
  return mapSubscription(data as SubscriptionRow);
}

export async function updateSubscription(
  id: string,
  patch: {
    plan?: SubscriptionPlan;
    endDate?: Date | string;
    startDate?: Date | string;
    isActive?: boolean;
    paymentStatus?: PaymentStatus;
    amount?: number;
    autoRenew?: boolean;
  },
): Promise<ISubscription | null> {
  const row: Record<string, unknown> = {};
  if (patch.plan !== undefined) row.plan = patch.plan;
  if (patch.isActive !== undefined) row.is_active = patch.isActive;
  if (patch.paymentStatus !== undefined)
    row.payment_status = patch.paymentStatus;
  if (patch.amount !== undefined) row.amount = patch.amount;
  if (patch.autoRenew !== undefined) row.auto_renew = patch.autoRenew;
  if (patch.endDate !== undefined) {
    row.end_date =
      typeof patch.endDate === "string"
        ? patch.endDate
        : patch.endDate.toISOString();
  }
  if (patch.startDate !== undefined) {
    row.start_date =
      typeof patch.startDate === "string"
        ? patch.startDate
        : patch.startDate.toISOString();
  }

  const { data, error } = await sb()
    .from("subscriptions")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throwDbError(error, "updateSubscription");
  if (!data) return null;
  return mapSubscription(data as SubscriptionRow);
}

export async function updateSubscriptionByUserId(
  userId: string,
  patch: Parameters<typeof updateSubscription>[1],
): Promise<ISubscription | null> {
  const existing = await findSubscriptionByUserId(userId);
  if (!existing) return null;
  return updateSubscription(existing._id, patch);
}

export async function findDueSubscriptions(limit = 200): Promise<
  Array<{ id: string; userId: string }>
> {
  const now = new Date().toISOString();
  const { data, error } = await sb()
    .from("subscriptions")
    .select("id, user_id, is_active, payment_status, end_date")
    .lt("end_date", now)
    .or("is_active.eq.true,payment_status.neq.expired")
    .limit(limit);
  if (error) throwDbError(error, "findDueSubscriptions");
  return (data || []).map((r) => ({
    id: r.id as string,
    userId: r.user_id as string,
  }));
}

export async function markSubscriptionsExpired(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await sb()
    .from("subscriptions")
    .update({ is_active: false, payment_status: "expired" })
    .in("id", ids);
  if (error) throwDbError(error, "markSubscriptionsExpired");
}

export async function countActiveSubscriptions(): Promise<number> {
  const { count, error } = await sb()
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) throwDbError(error, "countActiveSubscriptions");
  return count ?? 0;
}

export async function countExpiredSubscriptions(): Promise<number> {
  const { count, error } = await sb()
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "expired");
  if (error) throwDbError(error, "countExpiredSubscriptions");
  return count ?? 0;
}
