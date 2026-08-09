import { getSupabaseAdmin } from "@/lib/supabase";
import { throwDbError } from "@/lib/db";
import {
  mapUser,
  type UserRow,
  DEFAULT_USER_FEATURES,
  DEFAULT_USER_LIMITS,
} from "@/lib/db/mappers";
import type { IUser } from "@/types/user.types";
import type { IUserFeatures, IUserLimits } from "@/types/platform.types";

function sb() {
  return getSupabaseAdmin();
}

export async function findUserByEmail(
  email: string,
  opts?: { includePassword?: boolean },
): Promise<IUser | null> {
  const { data, error } = await sb()
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) throwDbError(error, "findUserByEmail");
  if (!data) return null;
  return mapUser(data as UserRow, opts);
}

export async function findUserById(
  id: string,
  opts?: { includePassword?: boolean },
): Promise<IUser | null> {
  const { data, error } = await sb()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwDbError(error, "findUserById");
  if (!data) return null;
  return mapUser(data as UserRow, opts);
}

export async function listUsers(): Promise<IUser[]> {
  const { data, error } = await sb()
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throwDbError(error, "listUsers");
  return (data as UserRow[]).map((row) => mapUser(row));
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  features?: IUserFeatures;
  limits?: IUserLimits;
}): Promise<IUser> {
  const { data, error } = await sb()
    .from("users")
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      password: input.password,
      role: input.role ?? "user",
      features: input.features ?? DEFAULT_USER_FEATURES,
      limits: input.limits ?? DEFAULT_USER_LIMITS,
      is_active: true,
    })
    .select("*")
    .single();
  if (error) throwDbError(error, "createUser");
  return mapUser(data as UserRow);
}

export async function updateUser(
  id: string,
  patch: {
    name?: string;
    email?: string;
    role?: "user" | "admin";
    isActive?: boolean;
    features?: IUserFeatures;
    limits?: IUserLimits;
    password?: string;
    avatar?: string;
  },
): Promise<IUser | null> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email !== undefined) row.email = patch.email.toLowerCase();
  if (patch.role !== undefined) row.role = patch.role;
  if (patch.isActive !== undefined) row.is_active = patch.isActive;
  if (patch.features !== undefined) row.features = patch.features;
  if (patch.limits !== undefined) row.limits = patch.limits;
  if (patch.password !== undefined) row.password = patch.password;
  if (patch.avatar !== undefined) row.avatar = patch.avatar;

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
}

export async function countUsers(): Promise<number> {
  const { count, error } = await sb()
    .from("users")
    .select("*", { count: "exact", head: true });
  if (error) throwDbError(error, "countUsers");
  return count ?? 0;
}

export async function countUsersByRole(
  role: "user" | "admin",
): Promise<number> {
  const { count, error } = await sb()
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", role);
  if (error) throwDbError(error, "countUsersByRole");
  return count ?? 0;
}
