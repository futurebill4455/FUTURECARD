/**
 * Shared DB error type — kept separate to avoid circular imports
 * between supabase client and repository helpers.
 */

export class DatabaseError extends Error {
  readonly code = "DATABASE_UNAVAILABLE" as const;
  readonly cause?: unknown;
  readonly status = 503 as const;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.cause = cause;
  }
}

export const CLIENT_UNAVAILABLE_MESSAGE =
  "Database temporarily unavailable. Please try again shortly.";
