import { getSupabaseAdmin } from "@/lib/supabase";
import { throwDbError } from "@/lib/db";
import { mapCard, cardPayloadToRow, type CardRow } from "@/lib/db/mappers";
import type { ICard } from "@/types/card.types";

function sb() {
  return getSupabaseAdmin();
}

export async function listCardsByUser(userId: string): Promise<ICard[]> {
  const { data, error } = await sb()
    .from("cards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throwDbError(error, "listCardsByUser");
  return (data as CardRow[]).map(mapCard);
}

export async function findCardById(id: string): Promise<ICard | null> {
  const { data, error } = await sb()
    .from("cards")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwDbError(error, "findCardById");
  if (!data) return null;
  return mapCard(data as CardRow);
}

export async function findCardByIdForUser(
  id: string,
  userId: string,
): Promise<ICard | null> {
  const { data, error } = await sb()
    .from("cards")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throwDbError(error, "findCardByIdForUser");
  if (!data) return null;
  return mapCard(data as CardRow);
}

export async function findCardByUsername(
  username: string,
): Promise<ICard | null> {
  const { data, error } = await sb()
    .from("cards")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (error) throwDbError(error, "findCardByUsername");
  if (!data) return null;
  return mapCard(data as CardRow);
}

export async function findCardByCustomDomain(
  host: string,
): Promise<ICard | null> {
  const { data, error } = await sb()
    .from("cards")
    .select("*")
    .eq("custom_domain", host.toLowerCase())
    .maybeSingle();
  if (error) throwDbError(error, "findCardByCustomDomain");
  if (!data) return null;
  return mapCard(data as CardRow);
}

export async function countCardsByUser(userId: string): Promise<number> {
  const { count, error } = await sb()
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throwDbError(error, "countCardsByUser");
  return count ?? 0;
}

export async function createCard(
  userId: string,
  payload: Record<string, unknown>,
): Promise<ICard> {
  const row = cardPayloadToRow(payload, { user_id: userId });
  const { data, error } = await sb()
    .from("cards")
    .insert(row)
    .select("*")
    .single();
  if (error) {
    if ((error as { code?: string }).code === "23505") {
      throw Object.assign(new Error("Username already taken"), {
        code: "CONFLICT",
      });
    }
    throwDbError(error, "createCard");
  }
  return mapCard(data as CardRow);
}

export async function updateCard(
  id: string,
  payload: Record<string, unknown>,
  opts?: { userId?: string },
): Promise<ICard | null> {
  const row = cardPayloadToRow(payload);
  let q = sb().from("cards").update(row).eq("id", id);
  if (opts?.userId) q = q.eq("user_id", opts.userId);
  const { data, error } = await q.select("*").maybeSingle();
  if (error) throwDbError(error, "updateCard");
  if (!data) return null;
  return mapCard(data as CardRow);
}

export async function updateCardFields(
  id: string,
  fields: Record<string, unknown>,
  opts?: { userId?: string },
): Promise<ICard | null> {
  let q = sb().from("cards").update(fields).eq("id", id);
  if (opts?.userId) q = q.eq("user_id", opts.userId);
  const { data, error } = await q.select("*").maybeSingle();
  if (error) throwDbError(error, "updateCardFields");
  if (!data) return null;
  return mapCard(data as CardRow);
}

export async function deleteCard(
  id: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await sb()
    .from("cards")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
  if (error) throwDbError(error, "deleteCard");
  return Boolean(data);
}

export async function deactivateCardsByUser(userId: string): Promise<void> {
  const { error } = await sb()
    .from("cards")
    .update({ is_active: false })
    .eq("user_id", userId);
  if (error) throwDbError(error, "deactivateCardsByUser");
}

export async function deactivateCardsByUserIds(userIds: string[]): Promise<void> {
  if (!userIds.length) return;
  const { error } = await sb()
    .from("cards")
    .update({ is_active: false })
    .in("user_id", userIds);
  if (error) throwDbError(error, "deactivateCardsByUserIds");
}

export async function listCardsWithCustomDomains(): Promise<ICard[]> {
  const { data, error } = await sb()
    .from("cards")
    .select("*")
    .not("custom_domain", "is", null)
    .neq("custom_domain", "")
    .order("custom_domain_requested_at", { ascending: false });
  if (error) throwDbError(error, "listCardsWithCustomDomains");
  return (data as CardRow[]).map(mapCard);
}

export async function findCardByDomainExcluding(
  domain: string,
  excludeId: string,
): Promise<ICard | null> {
  const { data, error } = await sb()
    .from("cards")
    .select("*")
    .eq("custom_domain", domain)
    .neq("id", excludeId)
    .maybeSingle();
  if (error) throwDbError(error, "findCardByDomainExcluding");
  if (!data) return null;
  return mapCard(data as CardRow);
}

export async function clearCustomDomain(
  id: string,
  opts?: { userId?: string },
): Promise<ICard | null> {
  return updateCardFields(
    id,
    {
      custom_domain: null,
      custom_domain_status: "none",
      custom_domain_active: false,
      custom_domain_requested_at: null,
      custom_domain_reviewed_at: null,
    },
    opts,
  );
}

export async function countCards(): Promise<number> {
  const { count, error } = await sb()
    .from("cards")
    .select("*", { count: "exact", head: true });
  if (error) throwDbError(error, "countCards");
  return count ?? 0;
}

export async function countActiveCards(): Promise<number> {
  const { count, error } = await sb()
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) throwDbError(error, "countActiveCards");
  return count ?? 0;
}
