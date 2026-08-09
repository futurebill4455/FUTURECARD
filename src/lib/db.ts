/**
 * Database connectivity helpers for Next.js on Vercel + Supabase.
 */

import {
  DatabaseError,
  CLIENT_UNAVAILABLE_MESSAGE,
} from "@/lib/db-errors";

export { DatabaseError, CLIENT_UNAVAILABLE_MESSAGE };

export function isSelectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const message = String((err as { message?: string }).message || "");
  const code = String((err as { code?: string }).code || "");
  return (
    code === "PGRST301" ||
    message.includes("Failed to fetch") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND") ||
    message.includes("fetch failed") ||
    message.includes("network")
  );
}

export function isDatabaseError(err: unknown): err is DatabaseError {
  return (
    err instanceof DatabaseError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { code?: string }).code === "DATABASE_UNAVAILABLE") ||
    isSelectionError(err)
  );
}

/** Throw DatabaseError from a Supabase/PostgREST error object. */
export function throwDbError(err: unknown, context?: string): never {
  const detail =
    err && typeof err === "object"
      ? String(
          (err as { message?: string }).message ||
            (err as { error_description?: string }).error_description ||
            err,
        )
      : String(err);

  console.error(`[db]${context ? ` ${context}:` : ""}`, detail, err);
  throw new DatabaseError(CLIENT_UNAVAILABLE_MESSAGE, err);
}

/**
 * Validates Supabase env and returns a ready admin client.
 * Safe to call on every request (client is cached).
 */
export async function dbConnect() {
  const { getSupabaseAdmin } = await import("@/lib/supabase");
  try {
    return getSupabaseAdmin();
  } catch (err) {
    if (err instanceof DatabaseError) throw err;
    throwDbError(err, "connect");
  }
}
