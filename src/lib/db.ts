import mongoose from "mongoose";

/**
 * Resilient MongoDB connection for Next.js App Router (Vercel serverless).
 *
 * - Reuses one connection via globalThis across warm invocations
 * - Forces IPv4 (common fix for MongooseServerSelectionError on Vercel)
 * - Sanitizes MONGODB_URI (quotes / whitespace from env paste)
 * - Clears cache on failure so the next request can retry
 * - Never crashes the process — throws DatabaseError for callers to map to 503
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

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};
global.mongooseCache = cached;

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

const CLIENT_UNAVAILABLE_MESSAGE =
  "Database temporarily unavailable. Please try again shortly.";

const ATLAS_HINT =
  "Verify Atlas Network Access allows 0.0.0.0/0, cluster is not paused, " +
  "MONGODB_URI is mongodb+srv://… with a DB name (e.g. /futurecard), " +
  "password is URL-encoded, and the env var has no wrapping quotes.";

export function sanitizeMongoUri(raw: string): string {
  let uri = raw.trim();

  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  uri = uri.replace(/\s+/g, "");

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    console.error(
      '[db] MONGODB_URI must start with "mongodb://" or "mongodb+srv://".',
    );
    throw new DatabaseError(CLIENT_UNAVAILABLE_MESSAGE);
  }

  try {
    const parsed = new URL(uri);
    if (!parsed.pathname || parsed.pathname === "/") {
      parsed.pathname = "/futurecard";
      uri = parsed.toString();
    }
  } catch {
    // Keep sanitized string if URL parser rejects a legacy host format
  }

  return uri;
}

function getMongoUri(): string {
  const raw = process.env.MONGODB_URI;
  if (!raw?.trim()) {
    console.error(
      "[db] MONGODB_URI is not set. Add it in Vercel → Project Settings → Environment Variables (Production + Preview).",
    );
    throw new DatabaseError(CLIENT_UNAVAILABLE_MESSAGE);
  }
  return sanitizeMongoUri(raw);
}

function redactUri(uri: string): string {
  return uri.replace(/\/\/([^:@/]+):([^@/]+)@/, "//$1:***@");
}

/** Detect MongooseServerSelectionError and related connectivity failures. */
export function isSelectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = (err as { name?: string }).name || "";
  const message = String((err as { message?: string }).message || "");
  const reason = String(
    (err as { reason?: { message?: string } }).reason?.message || "",
  );
  const haystack = `${name} ${message} ${reason}`;
  return (
    name === "MongoServerSelectionError" ||
    name === "MongooseServerSelectionError" ||
    haystack.includes("Server selection timed out") ||
    haystack.includes("Could not connect") ||
    haystack.includes("ECONNREFUSED") ||
    haystack.includes("ENOTFOUND") ||
    haystack.includes("querySrv") ||
    haystack.includes("ReplicaSetNoPrimary") ||
    haystack.includes("getaddrinfo")
  );
}

async function resetConnectionState() {
  cached.conn = null;
  cached.promise = null;
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
    }
  } catch {
    // ignore close errors during reset
  }
}

function toDatabaseError(err: unknown): DatabaseError {
  if (err instanceof DatabaseError) return err;

  const base =
    err instanceof Error ? err.message : "Unknown database connection error";
  const detail = isSelectionError(err)
    ? `MongoDB server selection failed: ${base}. ${ATLAS_HINT}`
    : `MongoDB connection failed: ${base}. ${ATLAS_HINT}`;

  console.error(`[db] ${detail}`);
  // Client-facing message stays short; full detail is logged above
  return new DatabaseError(CLIENT_UNAVAILABLE_MESSAGE, err);
}

/**
 * Returns a connected mongoose instance. Safe to call on every request.
 * On failure throws DatabaseError — never an unhandled driver crash.
 */
export async function dbConnect(): Promise<typeof mongoose> {
  try {
    if (cached.conn) {
      const state = cached.conn.connection.readyState;
      // 1 = connected
      if (state === 1) return cached.conn;
      // 2 = connecting — wait on in-flight promise
      if (state === 2 && cached.promise) {
        return await cached.promise;
      }
      await resetConnectionState();
    }

    if (!cached.promise) {
      const uri = getMongoUri();
      const isSrv = uri.startsWith("mongodb+srv://");

      cached.promise = mongoose
        .connect(uri, {
          bufferCommands: false,
          maxPoolSize: 5,
          minPoolSize: 0,
          maxIdleTimeMS: 10_000,
          // Fail fast enough to return 503 before typical serverless limits
          serverSelectionTimeoutMS: 8_000,
          connectTimeoutMS: 10_000,
          socketTimeoutMS: 45_000,
          heartbeatFrequencyMS: 10_000,
          retryWrites: true,
          // Critical on Vercel: Node often prefers IPv6; Atlas SRV can fail selection
          family: 4,
          autoSelectFamily: false,
          ...(isSrv ? { tls: true } : {}),
        })
        .then((m) => {
          if (process.env.NODE_ENV !== "production") {
            console.info(`[db] connected → ${redactUri(uri)}`);
          }
          return m;
        })
        .catch(async (err) => {
          await resetConnectionState();
          throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    await resetConnectionState();
    throw toDatabaseError(err);
  }
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
