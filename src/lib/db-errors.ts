/**
 * Shared DB error types — kept separate to avoid circular imports
 * between supabase client and repository helpers.
 */

export class DatabaseError extends Error {
  readonly code = "DATABASE_UNAVAILABLE" as const;
  readonly cause?: unknown;
  readonly status = 503 as const;
  readonly retryable = true;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.cause = cause;
  }
}

/** Non-transient PostgREST / Postgres failures (schema, constraints, RLS). */
export class DbOperationError extends Error {
  readonly code = "DB_OPERATION_FAILED" as const;
  readonly cause?: unknown;
  readonly status = 500 as const;
  readonly retryable = false;
  readonly hint?: string;

  constructor(message: string, cause?: unknown, hint?: string) {
    super(message);
    this.name = "DbOperationError";
    this.cause = cause;
    this.hint = hint;
  }
}

/** Unique constraint / duplicate resource. */
export class DbConflictError extends Error {
  readonly code = "CONFLICT" as const;
  readonly cause?: unknown;
  readonly status = 409 as const;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "DbConflictError";
    this.cause = cause;
  }
}

export const CLIENT_UNAVAILABLE_MESSAGE =
  "Database temporarily unavailable. Please try again shortly.";

export const DB_OPERATION_FAILED_MESSAGE =
  "Database request failed. Please try again or contact support.";

export const SCHEMA_OUTDATED_MESSAGE =
  "Database schema is outdated. Run the latest Supabase SQL migrations (users: 004–009/013; cards: 004, 006, 010–012/014), then retry.";

export const RLS_OR_KEY_MESSAGE =
  "Database rejected the write. Ensure SUPABASE_SERVICE_ROLE_KEY is set on the server (anon key cannot insert when RLS is enabled).";
