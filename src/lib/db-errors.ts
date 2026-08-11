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

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "DbOperationError";
    this.cause = cause;
  }
}

export const CLIENT_UNAVAILABLE_MESSAGE =
  "Database temporarily unavailable. Please try again shortly.";

export const DB_OPERATION_FAILED_MESSAGE =
  "Database request failed. Please try again or contact support.";
