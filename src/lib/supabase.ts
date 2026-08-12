import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "@/lib/db-errors";

/**
 * Server-side Supabase client (service role).
 * Bypasses RLS — used only in API routes / server components with NextAuth.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 *
 * Uses the project REST URL (https://xxx.supabase.co), not the Postgres
 * pooler hostname. Connection pooling for PostgREST is handled by Supabase;
 * this client adds fetch retries for transient edge / network failures.
 */

let admin: SupabaseClient | null = null;
let cachedUrl: string | null = null;
let cachedKey: string | null = null;

function firstEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function jwtRole(key: string): string | null {
  try {
    const parts = key.split(".");
    if (parts.length !== 3) return null;
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(json) as { role?: string };
    return payload.role || null;
  } catch {
    return null;
  }
}

export function resolveSupabaseConfig(): {
  url: string;
  key: string;
  keyKind: "service_role" | "anon" | "secret" | "unknown";
} {
  const url = firstEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const serviceKey = firstEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
  );
  const anonKey = firstEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  );
  const key = serviceKey || anonKey;

  if (!url || !key) {
    throw new DatabaseError(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in your environment.",
    );
  }

  if (/pooler\.supabase\.com/i.test(url) || /:6543|:5432/.test(url)) {
    throw new DatabaseError(
      "Invalid Supabase URL for the JS client. Use the Project URL (https://YOUR_PROJECT.supabase.co), not the Postgres pooler connection string.",
    );
  }

  let keyKind: "service_role" | "anon" | "secret" | "unknown" = "unknown";
  if (serviceKey?.startsWith("sb_secret_")) keyKind = "secret";
  else {
    const role = jwtRole(key);
    if (role === "service_role") keyKind = "service_role";
    else if (role === "anon") keyKind = "anon";
    else if (serviceKey) keyKind = "service_role";
    else if (anonKey) keyKind = "anon";
  }

  if (keyKind === "anon") {
    console.warn(
      "[supabase] Using anon key for server writes. Registration/inserts will fail if RLS is enabled. Set SUPABASE_SERVICE_ROLE_KEY on Vercel.",
    );
  }

  return { url: url.replace(/\/$/, ""), key, keyKind };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch with timeout + retries for transient gateway / network errors. */
async function supabaseFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const upstream = init?.signal;
      if (upstream) {
        if (upstream.aborted) controller.abort();
        else {
          upstream.addEventListener("abort", () => controller.abort(), {
            once: true,
          });
        }
      }

      const res = await fetch(input, { ...init, signal: controller.signal });
      const retryableStatus =
        res.status === 429 ||
        res.status === 502 ||
        res.status === 503 ||
        res.status === 504;

      if (retryableStatus && attempt < maxAttempts) {
        await res.arrayBuffer().catch(() => undefined);
        await sleep(200 * 2 ** (attempt - 1) + Math.floor(Math.random() * 100));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      const message = String((err as { message?: string })?.message || err);
      const retryable =
        message.includes("fetch failed") ||
        message.includes("Failed to fetch") ||
        message.includes("ECONNRESET") ||
        message.includes("ECONNREFUSED") ||
        message.includes("ETIMEDOUT") ||
        message.includes("ENOTFOUND") ||
        message.includes("network") ||
        message.includes("aborted") ||
        (err as { name?: string })?.name === "AbortError";

      if (!retryable || attempt >= maxAttempts) throw err;
      await sleep(200 * 2 ** (attempt - 1) + Math.floor(Math.random() * 100));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Supabase fetch failed");
}

export function resetSupabaseAdmin(): void {
  admin = null;
  cachedUrl = null;
  cachedKey = null;
}

export function getSupabaseAdmin(): SupabaseClient {
  const { url, key } = resolveSupabaseConfig();

  if (admin && cachedUrl === url && cachedKey === key) {
    return admin;
  }

  admin = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: supabaseFetch,
    },
  });
  cachedUrl = url;
  cachedKey = key;

  return admin;
}
