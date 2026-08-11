import { getSupabaseAdmin } from "@/lib/supabase";
import { throwDbError, withDbRetry } from "@/lib/db";
import {
  mapUser,
  type UserRow,
  DEFAULT_USER_FEATURES,
  DEFAULT_USER_LIMITS,
} from "@/lib/db/mappers";
import type { IUser } from "@/types/user.types";
import type { IUserFeatures, IUserLimits } from "@/types/platform.types";
import type { ICardSections } from "@/types/card-sections.types";
import { DEFAULT_CARD_SECTIONS } from "@/types/card-sections.types";

function sb() {
  return getSupabaseAdmin();
}

export async function findUserByEmail(
  email: string,
  opts?: { includePassword?: boolean },
): Promise<IUser | null> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();
      if (error) throwDbError(error, "findUserByEmail");
      if (!data) return null;
      return mapUser(data as UserRow, opts);
    },
    { context: "findUserByEmail" },
  );
}

export async function findUserById(
  id: string,
  opts?: { includePassword?: boolean },
): Promise<IUser | null> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throwDbError(error, "findUserById");
      if (!data) return null;
      return mapUser(data as UserRow, opts);
    },
    { context: "findUserById" },
  );
}

export async function listUsers(): Promise<IUser[]> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throwDbError(error, "listUsers");
      return (data as UserRow[]).map((row) => mapUser(row));
    },
    { context: "listUsers" },
  );
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "user" | "admin";
  features?: IUserFeatures;
  cardSections?: ICardSections;
  maxCardsLimit?: number;
  limits?: IUserLimits;
  /** Defaults: admin → true; user → false unless explicitly set */
  isApproved?: boolean;
}): Promise<IUser> {
  const role = input.role ?? "user";
  const isApproved =
    role === "admin"
      ? true
      : input.isApproved !== undefined
        ? Boolean(input.isApproved)
        : false;

  const maxCardsLimit = Math.min(
    50,
    Math.max(1, Math.floor(input.maxCardsLimit ?? input.limits?.maxCards ?? 1)),
  );
  const limits: IUserLimits = {
    ...(input.limits ?? DEFAULT_USER_LIMITS),
    maxCards: maxCardsLimit,
  };

  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("users")
        .insert({
          name: input.name,
          email: input.email.toLowerCase(),
          password: input.password,
          phone: input.phone?.trim() || null,
          role,
          features: input.features ?? DEFAULT_USER_FEATURES,
          card_sections: input.cardSections ?? DEFAULT_CARD_SECTIONS,
          max_cards_limit: maxCardsLimit,
          limits,
          is_active: true,
          is_approved: isApproved,
        })
        .select("*")
        .single();
      if (error) throwDbError(error, "createUser");
      return mapUser(data as UserRow);
    },
    { context: "createUser" },
  );
}

export async function updateUser(
  id: string,
  patch: {
    name?: string;
    email?: string;
    phone?: string;
    role?: "user" | "admin";
    isActive?: boolean;
    isApproved?: boolean;
    features?: IUserFeatures;
    cardSections?: ICardSections;
    maxCardsLimit?: number;
    limits?: IUserLimits;
    password?: string;
    avatar?: string;
  },
): Promise<IUser | null> {
  return withDbRetry(
    async () => {
      const row: Record<string, unknown> = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.email !== undefined) row.email = patch.email.toLowerCase();
      if (patch.phone !== undefined) row.phone = patch.phone.trim() || null;
      if (patch.role !== undefined) row.role = patch.role;
      if (patch.isActive !== undefined) row.is_active = patch.isActive;
      if (patch.isApproved !== undefined) row.is_approved = patch.isApproved;
      if (patch.features !== undefined) row.features = patch.features;
      if (patch.cardSections !== undefined) row.card_sections = patch.cardSections;
      if (patch.password !== undefined) row.password = patch.password;
      if (patch.avatar !== undefined) row.avatar = patch.avatar;

      if (patch.maxCardsLimit !== undefined || patch.limits !== undefined) {
        let baseLimits: IUserLimits = { ...DEFAULT_USER_LIMITS };
        if (patch.limits) {
          baseLimits = { ...DEFAULT_USER_LIMITS, ...patch.limits };
        } else {
          const { data: cur } = await sb()
            .from("users")
            .select("limits, max_cards_limit")
            .eq("id", id)
            .maybeSingle();
          const curLimits = (cur?.limits || {}) as Partial<IUserLimits>;
          baseLimits = {
            ...DEFAULT_USER_LIMITS,
            ...curLimits,
            maxCards: resolveMaxCardsFromRow(cur),
          };
        }

        const maxCardsLimit =
          patch.maxCardsLimit !== undefined
            ? Math.min(50, Math.max(1, Math.floor(patch.maxCardsLimit)))
            : Math.min(50, Math.max(1, Math.floor(baseLimits.maxCards)));

        row.max_cards_limit = maxCardsLimit;
        row.limits = { ...baseLimits, maxCards: maxCardsLimit };
      }

      const { data, error } = await sb()
        .from("users")
        .update(row)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) {
        if ((error as { code?: string }).code === "23505") {
          throw Object.assign(new Error("Email already in use"), {
            code: "CONFLICT",
          });
        }
        throwDbError(error, "updateUser");
      }
      if (!data) return null;
      return mapUser(data as UserRow);
    },
    { context: "updateUser" },
  );
}

function resolveMaxCardsFromRow(cur: {
  max_cards_limit?: number | null;
  limits?: Record<string, number> | null;
} | null): number {
  if (
    typeof cur?.max_cards_limit === "number" &&
    Number.isFinite(cur.max_cards_limit) &&
    cur.max_cards_limit >= 1
  ) {
    return Math.min(50, Math.floor(cur.max_cards_limit));
  }
  const fromJson = cur?.limits?.maxCards;
  if (typeof fromJson === "number" && Number.isFinite(fromJson) && fromJson >= 1) {
    return Math.min(50, Math.floor(fromJson));
  }
  return 1;
}

export async function countUsers(): Promise<number> {
  return withDbRetry(
    async () => {
      const { count, error } = await sb()
        .from("users")
        .select("*", { count: "exact", head: true });
      if (error) throwDbError(error, "countUsers");
      return count ?? 0;
    },
    { context: "countUsers" },
  );
}

export async function countUsersByRole(
  role: "user" | "admin",
): Promise<number> {
  return withDbRetry(
    async () => {
      const { count, error } = await sb()
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", role);
      if (error) throwDbError(error, "countUsersByRole");
      return count ?? 0;
    },
    { context: "countUsersByRole" },
  );
}

/** Hard-delete user (cascades cards + subscription via FK) */
export async function deleteUser(id: string): Promise<boolean> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("users")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();
      if (error) throwDbError(error, "deleteUser");
      return Boolean(data);
    },
    { context: "deleteUser" },
  );
}

/**
 * Permanently remove a user account:
 * 1) purge uploaded media (Storage + local uploads)
 * 2) delete the users row (cards/subscriptions/analytics cascade via FK)
 *
 * Auth is NextAuth + bcrypt in `public.users` (no Supabase Auth user to remove).
 */
export async function permanentlyDeleteUser(id: string): Promise<{
  deleted: boolean;
  storageRemoved: number;
}> {
  const { removeUserMedia } = await import("@/lib/storage");
  const media = await removeUserMedia(id);
  const deleted = await deleteUser(id);
  return { deleted, storageRemoved: media.storageRemoved };
}
