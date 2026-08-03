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

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define MONGODB_URI in the environment (e.g. Vercel project settings or .env.local).",
    );
  }
  return uri;
}

/**
 * Connect lazily so importing this module during `next build` does not throw
 * when env vars are missing or the DB is unreachable.
 */
export async function dbConnect() {
  if (cached.conn) {
    if (cached.conn.connection.readyState === 1) return cached.conn;
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const uri = getMongoUri();
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
