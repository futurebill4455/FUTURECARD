/**
 * Database connectivity helpers for Next.js on Vercel + Supabase.
 */

import {
  DatabaseError,
  DbConflictError,
  DbOperationError,
  CLIENT_UNAVAILABLE_MESSAGE,
  DB_OPERATION_FAILED_MESSAGE,
  RLS_OR_KEY_MESSAGE,
  SCHEMA_OUTDATED_MESSAGE,
} from "@/lib/db-errors";

export {
  DatabaseError,
  DbConflictError,
  DbOperationError,
  CLIENT_UNAVAILABLE_MESSAGE,
  DB_OPERATION_FAILED_MESSAGE,
  RLS_OR_KEY_MESSAGE,
  SCHEMA_OUTDATED_MESSAGE,
};

type PostgrestLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  name?: string;
};

function errParts(err: unknown): {
  message: string;
  code: string;
  details: string;
  hint: string;
  status: number | undefined;
} {
  if (!err || typeof err !== "object") {
    return {
      message: String(err),
      code: "",
      details: "",
      hint: "",
      status: undefined,
    };
  }
  const e = err as PostgrestLikeError;
  return {
    message: String(
      e.message ||
        (err as { error_description?: string }).error_description ||
        err,
    ),
    code: String(e.code || ""),
    details: String(e.details || ""),
    hint: String(e.hint || ""),
    status: typeof e.status === "number" ? e.status : undefined,
  };
}

/** PostgREST / Postgres missing-column or schema-cache errors. */
export function isMissingColumnError(err: unknown): boolean {
  const { message, code } = errParts(err);
  const lower = message.toLowerCase();
  return (
    code === "PGRST204" ||
    code === "42703" ||
    (lower.includes("could not find") && lower.includes("column")) ||
    lower.includes("schema cache") ||
    (lower.includes("column") && lower.includes("does not exist"))
  );
}

/** Extract column name from a PostgREST missing-column message. */
export function missingColumnName(err: unknown): string | null {
  const { message } = errParts(err);
  const quoted = message.match(/'([^']+)' column/i);
  if (quoted?.[1]) return quoted[1];
  const pg = message.match(/column\s+"([^"]+)"/i);
  if (pg?.[1]) return pg[1];
  const bare = message.match(/column\s+(\w+)/i);
  return bare?.[1] || null;
}

export function isRlsOrPermissionError(err: unknown): boolean {
  const { message, code, status } = errParts(err);
  const lower = message.toLowerCase();
  return (
    code === "42501" ||
    status === 401 ||
    status === 403 ||
    lower.includes("row-level security") ||
    lower.includes("permission denied") ||
    lower.includes("not authorized")
  );
}

/** Postgres foreign-key violation (e.g. background_animation_slug not seeded). */
export function isForeignKeyError(err: unknown): boolean {
  const { message, code } = errParts(err);
  return (
    code === "23503" ||
    message.toLowerCase().includes("foreign key") ||
    message.toLowerCase().includes("violates foreign key")
  );
}

/**
 * Insert/update with progressive fallback: drop missing optional columns
 * (and FK-only fields) then retry so partially migrated schemas still work.
 */
export async function mutateWithSchemaFallback<T>(
  opts: {
    context: string;
    optionalColumns: readonly string[];
    /** Columns to null/delete on FK violations (e.g. background_animation_slug) */
    fkOptionalColumns?: readonly string[];
    maxAttempts?: number;
    run: (
      row: Record<string, unknown>,
    ) => PromiseLike<{ data: T; error: unknown }>;
  },
  initialRow: Record<string, unknown>,
): Promise<T> {
  const row = { ...initialRow };
  const maxAttempts = opts.maxAttempts ?? 8;
  const fkCols = opts.fkOptionalColumns ?? [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data, error } = await opts.run(row);
    if (!error) return data as T;

    const code = String((error as { code?: string })?.code || "");
    if (code === "23505") {
      throw new DbConflictError("Resource already exists", error);
    }

    if (isForeignKeyError(error)) {
      const dropped = fkCols.filter((col) => col in row);
      if (dropped.length) {
        console.warn(
          `[db] ${opts.context}: FK violation — dropping ${dropped.join(", ")} and retrying. Seed background_animations / run migrations 010–012.`,
        );
        for (const col of dropped) delete row[col];
        continue;
      }
    }

    if (isMissingColumnError(error)) {
      const missing =
        missingColumnName(error) ||
        opts.optionalColumns.find((col) => col in row);
      if (missing && missing in row) {
        console.warn(
          `[db] ${opts.context}: dropping missing column "${missing}" and retrying. Run card migrations 004–012.`,
        );
        delete row[missing];
        continue;
      }
      // Drop first remaining optional column still present
      const next = opts.optionalColumns.find((col) => col in row);
      if (next) {
        console.warn(
          `[db] ${opts.context}: schema error — dropping "${next}" and retrying`,
        );
        delete row[next];
        continue;
      }
    }

    throwDbError(error, opts.context);
  }

  throwDbError(
    { message: `${opts.context} exhausted schema fallbacks` },
    opts.context,
  );
}

/** Network / cold-start / gateway style failures worth retrying. */
export function isTransientDbError(err: unknown): boolean {
  const { message, code, status } = errParts(err);
  const lower = message.toLowerCase();

  if (
    status === 429 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  if (
    code === "57014" ||
    code === "57P01" ||
    code === "57P02" ||
    code === "57P03" ||
    code === "08000" ||
    code === "08003" ||
    code === "08006" ||
    code === "40001" ||
    code === "40P01"
  ) {
    return true;
  }

  return (
    lower.includes("failed to fetch") ||
    lower.includes("fetch failed") ||
    lower.includes("econnrefused") ||
    lower.includes("econnreset") ||
    lower.includes("enotfound") ||
    lower.includes("etimedout") ||
    lower.includes("network") ||
    lower.includes("socket hang up") ||
    lower.includes("temporarily unavailable") ||
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("cloudflare") ||
    lower.includes("upstream") ||
    lower.includes("connection reset") ||
    lower.includes("server disconnected") ||
    lower.includes("aborted")
  );
}

/** @deprecated Prefer isTransientDbError — kept for call-site compatibility. */
export function isSelectionError(err: unknown): boolean {
  return isTransientDbError(err);
}

export function isDatabaseError(err: unknown): err is DatabaseError {
  return (
    err instanceof DatabaseError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { code?: string }).code === "DATABASE_UNAVAILABLE") ||
    isTransientDbError(err)
  );
}

export function isDbOperationError(err: unknown): err is DbOperationError {
  return (
    err instanceof DbOperationError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { code?: string }).code === "DB_OPERATION_FAILED")
  );
}

export function isDbConflictError(err: unknown): err is DbConflictError {
  return (
    err instanceof DbConflictError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { code?: string }).code === "CONFLICT")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a DB-backed async operation on transient failures.
 * Non-transient errors are thrown immediately (no burn-retries).
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  opts?: {
    context?: string;
    retries?: number;
    baseDelayMs?: number;
  },
): Promise<T> {
  const retries = opts?.retries ?? 3;
  const baseDelayMs = opts?.baseDelayMs ?? 200;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;

      if (err instanceof DatabaseError && !err.retryable) {
        throw err;
      }
      if (err instanceof DbOperationError || err instanceof DbConflictError) {
        throw err;
      }

      const retryable =
        err instanceof DatabaseError
          ? err.retryable
          : isTransientDbError(err);

      if (!retryable || attempt >= retries) {
        if (isTransientDbError(err) && !(err instanceof DatabaseError)) {
          console.error(
            `[db]${opts?.context ? ` ${opts.context}:` : ""} exhausted retries`,
            errParts(err).message,
            err,
          );
          const { resetSupabaseAdmin } = await import("@/lib/supabase");
          resetSupabaseAdmin();
          throw new DatabaseError(CLIENT_UNAVAILABLE_MESSAGE, err);
        }
        throw err;
      }

      console.warn(
        `[db]${opts?.context ? ` ${opts.context}:` : ""} transient failure (attempt ${attempt}/${retries})`,
        errParts(err).message,
      );
      if (attempt === 2) {
        const { resetSupabaseAdmin } = await import("@/lib/supabase");
        resetSupabaseAdmin();
      }
      await sleep(
        baseDelayMs * 2 ** (attempt - 1) + Math.floor(Math.random() * 100),
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new DatabaseError(CLIENT_UNAVAILABLE_MESSAGE, lastError);
}

/**
 * Map a Supabase/PostgREST error to DatabaseError (503), conflict (409),
 * or DbOperationError (500).
 */
export function throwDbError(err: unknown, context?: string): never {
  const { message, code, details, hint } = errParts(err);
  const detail = [message, code && `code=${code}`, details, hint]
    .filter(Boolean)
    .join(" | ");

  console.error(`[db]${context ? ` ${context}:` : ""}`, detail, err);

  if (code === "23505") {
    throw new DbConflictError("Resource already exists", err);
  }

  if (isTransientDbError(err)) {
    throw new DatabaseError(CLIENT_UNAVAILABLE_MESSAGE, err);
  }

  if (isMissingColumnError(err)) {
    throw new DbOperationError(
      SCHEMA_OUTDATED_MESSAGE,
      err,
      SCHEMA_OUTDATED_MESSAGE,
    );
  }

  if (isRlsOrPermissionError(err)) {
    throw new DbOperationError(RLS_OR_KEY_MESSAGE, err, RLS_OR_KEY_MESSAGE);
  }

  throw new DbOperationError(DB_OPERATION_FAILED_MESSAGE, err);
}

/**
 * Run a Supabase query builder with retry + classified error throwing.
 */
export async function dbQuery<T>(
  context: string,
  run: () => PromiseLike<{ data: T; error: unknown }>,
): Promise<T> {
  return withDbRetry(
    async () => {
      const { data, error } = await run();
      if (error) throwDbError(error, context);
      return data as T;
    },
    { context },
  );
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
    if (
      err instanceof DatabaseError ||
      err instanceof DbOperationError ||
      err instanceof DbConflictError
    ) {
      throw err;
    }
    throwDbError(err, "connect");
  }
}

/** Lightweight ping used by health checks / startup diagnostics. */
export async function dbHealthCheck(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const { error } = await withDbRetry(
      async () => {
        const { getSupabaseAdmin } = await import("@/lib/supabase");
        const result = await getSupabaseAdmin()
          .from("users")
          .select("id", { count: "exact", head: true });
        if (result.error) {
          if (isTransientDbError(result.error)) {
            throw result.error;
          }
          throwDbError(result.error, "health");
        }
        return result;
      },
      { context: "health", retries: 2 },
    );
    if (error) {
      return {
        ok: false,
        message: String((error as { message?: string }).message || error),
      };
    }
    return { ok: true, message: "ok" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}
