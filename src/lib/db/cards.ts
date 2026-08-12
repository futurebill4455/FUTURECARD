import { getSupabaseAdmin } from "@/lib/supabase";
import {
  DbConflictError,
  mutateWithSchemaFallback,
  throwDbError,
  withDbRetry,
} from "@/lib/db";
import { mapCard, cardPayloadToRow, type CardRow } from "@/lib/db/mappers";
import type { ICard } from "@/types/card.types";

/** Columns added by later migrations — strip + retry if schema is behind. */
const OPTIONAL_CARD_COLUMNS = [
  "profile_type",
  "features_enabled",
  "background_animation_slug",
  "background_slideshow_images",
  "stats",
] as const;

const FK_OPTIONAL_CARD_COLUMNS = ["background_animation_slug"] as const;

function sb() {
  return getSupabaseAdmin();
}

export async function listCardsByUser(userId: string): Promise<ICard[]> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("cards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throwDbError(error, "listCardsByUser");
      return (data ?? []).map((row) => mapCard(row as CardRow));
    },
    { context: "listCardsByUser" },
  );
}

export async function findCardById(id: string): Promise<ICard | null> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("cards")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throwDbError(error, "findCardById");
      if (!data) return null;
      return mapCard(data as CardRow);
    },
    { context: "findCardById" },
  );
}

export async function findCardByIdForUser(
  id: string,
  userId: string,
): Promise<ICard | null> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("cards")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throwDbError(error, "findCardByIdForUser");
      if (!data) return null;
      return mapCard(data as CardRow);
    },
    { context: "findCardByIdForUser" },
  );
}

export async function findCardByUsername(
  username: string,
): Promise<ICard | null> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("cards")
        .select("*")
        .eq("username", username.toLowerCase())
        .maybeSingle();
      if (error) throwDbError(error, "findCardByUsername");
      if (!data) return null;
      return mapCard(data as CardRow);
    },
    { context: "findCardByUsername" },
  );
}

export async function findCardByCustomDomain(
  host: string,
): Promise<ICard | null> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("cards")
        .select("*")
        .eq("custom_domain", host.toLowerCase())
        .maybeSingle();
      if (error) throwDbError(error, "findCardByCustomDomain");
      if (!data) return null;
      return mapCard(data as CardRow);
    },
    { context: "findCardByCustomDomain" },
  );
}

export async function countCardsByUser(userId: string): Promise<number> {
  return withDbRetry(
    async () => {
      const { count, error } = await sb()
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (error) throwDbError(error, "countCardsByUser");
      return count ?? 0;
    },
    { context: "countCardsByUser" },
  );
}

export async function createCard(
  userId: string,
  payload: Record<string, unknown>,
): Promise<ICard> {
  const row = cardPayloadToRow(payload, { user_id: userId });
  return withDbRetry(
    async () => {
      try {
        const data = await mutateWithSchemaFallback(
          {
            context: "createCard",
            optionalColumns: OPTIONAL_CARD_COLUMNS,
            fkOptionalColumns: FK_OPTIONAL_CARD_COLUMNS,
            run: async (nextRow) => {
              const result = await sb()
                .from("cards")
                .insert(nextRow)
                .select("*")
                .single();
              return { data: result.data, error: result.error };
            },
          },
          row,
        );
        return mapCard(data as CardRow);
      } catch (err) {
        if (err instanceof DbConflictError) {
          throw new DbConflictError("Username already taken", err.cause);
        }
        throw err;
      }
    },
    { context: "createCard" },
  );
}

export async function updateCard(
  id: string,
  payload: Record<string, unknown>,
  opts?: { userId?: string },
): Promise<ICard | null> {
  const row = cardPayloadToRow(payload);
  return withDbRetry(
    async () => {
      const data = await mutateWithSchemaFallback(
        {
          context: "updateCard",
          optionalColumns: OPTIONAL_CARD_COLUMNS,
          fkOptionalColumns: FK_OPTIONAL_CARD_COLUMNS,
          run: async (nextRow) => {
            let q = sb().from("cards").update(nextRow).eq("id", id);
            if (opts?.userId) q = q.eq("user_id", opts.userId);
            const result = await q.select("*").maybeSingle();
            return { data: result.data, error: result.error };
          },
        },
        row,
      );
      if (!data) return null;
      return mapCard(data as CardRow);
    },
    { context: "updateCard" },
  );
}

export async function updateCardFields(
  id: string,
  fields: Record<string, unknown>,
  opts?: { userId?: string },
): Promise<ICard | null> {
  return withDbRetry(
    async () => {
      const data = await mutateWithSchemaFallback(
        {
          context: "updateCardFields",
          optionalColumns: OPTIONAL_CARD_COLUMNS,
          fkOptionalColumns: FK_OPTIONAL_CARD_COLUMNS,
          run: async (nextRow) => {
            let q = sb().from("cards").update(nextRow).eq("id", id);
            if (opts?.userId) q = q.eq("user_id", opts.userId);
            const result = await q.select("*").maybeSingle();
            return { data: result.data, error: result.error };
          },
        },
        { ...fields },
      );
      if (!data) return null;
      return mapCard(data as CardRow);
    },
    { context: "updateCardFields" },
  );
}

export async function deleteCard(
  id: string,
  userId: string,
): Promise<boolean> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("cards")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();
      if (error) throwDbError(error, "deleteCard");
      return Boolean(data);
    },
    { context: "deleteCard" },
  );
}

export async function deactivateCardsByUser(userId: string): Promise<void> {
  return withDbRetry(
    async () => {
      const { error } = await sb()
        .from("cards")
        .update({ is_active: false })
        .eq("user_id", userId);
      if (error) throwDbError(error, "deactivateCardsByUser");
    },
    { context: "deactivateCardsByUser" },
  );
}

export async function deactivateCardsByUserIds(userIds: string[]): Promise<void> {
  if (!userIds.length) return;
  return withDbRetry(
    async () => {
      const { error } = await sb()
        .from("cards")
        .update({ is_active: false })
        .in("user_id", userIds);
      if (error) throwDbError(error, "deactivateCardsByUserIds");
    },
    { context: "deactivateCardsByUserIds" },
  );
}

export async function listCardsWithCustomDomains(): Promise<ICard[]> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("cards")
        .select("*")
        .not("custom_domain", "is", null)
        .neq("custom_domain", "")
        .order("custom_domain_requested_at", { ascending: false });
      if (error) throwDbError(error, "listCardsWithCustomDomains");
      return (data as CardRow[]).map(mapCard);
    },
    { context: "listCardsWithCustomDomains" },
  );
}

export async function findCardByDomainExcluding(
  domain: string,
  excludeId: string,
): Promise<ICard | null> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("cards")
        .select("*")
        .eq("custom_domain", domain)
        .neq("id", excludeId)
        .maybeSingle();
      if (error) throwDbError(error, "findCardByDomainExcluding");
      if (!data) return null;
      return mapCard(data as CardRow);
    },
    { context: "findCardByDomainExcluding" },
  );
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
  return withDbRetry(
    async () => {
      const { count, error } = await sb()
        .from("cards")
        .select("*", { count: "exact", head: true });
      if (error) throwDbError(error, "countCards");
      return count ?? 0;
    },
    { context: "countCards" },
  );
}

export async function countActiveCards(): Promise<number> {
  return withDbRetry(
    async () => {
      const { count, error } = await sb()
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      if (error) throwDbError(error, "countActiveCards");
      return count ?? 0;
    },
    { context: "countActiveCards" },
  );
}
