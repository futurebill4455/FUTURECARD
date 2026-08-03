import mongoose from "mongoose";

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

/**
 * Vercel env vars are often pasted with wrapping quotes or trailing spaces,
 * which break SRV lookup and cause MongooseServerSelectionError.
 */
export function sanitizeMongoUri(raw: string): string {
  let uri = raw.trim();
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  // Collapse accidental whitespace / newlines from multi-line dashboard paste
  uri = uri.replace(/\s+/g, "");

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(
      'MONGODB_URI must start with "mongodb://" or "mongodb+srv://".',
    );
  }

  // Ensure a database name exists in the path (Atlas strings sometimes omit it)
  try {
    const parsed = new URL(uri);
    if (!parsed.pathname || parsed.pathname === "/") {
      parsed.pathname = "/futurecard";
      uri = parsed.toString();
    }
  } catch {
    // URL() can fail on some legacy hosts; keep sanitized string as-is
  }

  return uri;
}

function getMongoUri() {
  const raw = process.env.MONGODB_URI;
  if (!raw) {
    throw new Error(
      "Please define MONGODB_URI in the environment (Vercel Project Settings → Environment Variables).",
    );
  }
  return sanitizeMongoUri(raw);
}

function redactUri(uri: string) {
  return uri.replace(/\/\/([^:@/]+):([^@/]+)@/, "//$1:***@");
}

/**
 * Connect lazily and cache across warm serverless invocations.
 * Tuned for MongoDB Atlas + Vercel (IPv4, short-lived functions).
 */
export async function dbConnect() {
  if (cached.conn) {
    // 1 = connected, 2 = connecting
    const state = cached.conn.connection.readyState;
    if (state === 1) return cached.conn;
    if (state === 2 && cached.promise) {
      cached.conn = await cached.promise;
      return cached.conn;
    }
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const uri = getMongoUri();
    const isSrv = uri.startsWith("mongodb+srv://");

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        // Serverless: keep pools small; reuse via global cache on warm starts
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 10_000,
        serverSelectionTimeoutMS: 15_000,
        connectTimeoutMS: 15_000,
        socketTimeoutMS: 45_000,
        // Atlas defaults; explicit for clarity on serverless
        retryWrites: true,
        // Force IPv4 — common fix for MongooseServerSelectionError on Vercel
        // when Node prefers IPv6 and Atlas SRV resolves poorly
        family: 4,
        ...(isSrv
          ? {
              // mongodb+srv uses TLS by default; keep TLS on for Atlas
              tls: true,
            }
          : {}),
      })
      .then((conn) => {
        if (process.env.NODE_ENV !== "production") {
          console.info(`[db] connected → ${redactUri(uri)}`);
        }
        return conn;
      })
      .catch((err) => {
        cached.promise = null;
        const hint =
          "Check: (1) MONGODB_URI uses mongodb+srv://… from Atlas Connect, " +
          "(2) password is URL-encoded if it has special characters, " +
          "(3) Network Access allows 0.0.0.0/0, " +
          "(4) cluster is not paused, " +
          "(5) env is set for Production + Preview on Vercel.";
        const message =
          err instanceof Error ? `${err.message} — ${hint}` : hint;
        console.error(`[db] connection failed for ${redactUri(uri)}:`, message);
        throw new Error(message);
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
