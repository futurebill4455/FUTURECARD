/**
 * Safe public origin for metadata, QR codes, and NextAuth.
 * Never throws — invalid env values fall back to the production domain.
 */

export const DEFAULT_APP_ORIGIN = "https://futurecard.online";

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/** Parse a URL without throwing. Returns null if the value is not a valid absolute http(s) URL. */
export function safeParseUrl(raw: string | undefined | null): URL | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidates = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? [trimmed]
    : [`https://${trimmed.replace(/^\/+/, "")}`];

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      if (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        parsed.hostname
      ) {
        return parsed;
      }
    } catch {
      /* try next candidate */
    }
  }

  return null;
}

/**
 * Absolute origin (no trailing slash) used at build time and runtime.
 * Client: window.location.origin. Server/build: env vars, then production default.
 */
export function getAppOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    const fromWindow = safeParseUrl(window.location.origin);
    if (fromWindow) return fromWindow.origin;
  }

  const fromEnv = firstNonEmpty(
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_PLATFORM_HOST,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  );

  return (safeParseUrl(fromEnv) ?? new URL(DEFAULT_APP_ORIGIN)).origin;
}

export function getAppBaseUrl(): URL {
  return safeParseUrl(getAppOrigin()) ?? new URL(DEFAULT_APP_ORIGIN);
}

export function absoluteAppUrl(path = ""): string {
  const origin = getAppOrigin();
  if (!path) return origin;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  try {
    return new URL(suffix, `${origin}/`).toString();
  } catch {
    return `${origin}${suffix}`;
  }
}

// Patch env before next-auth / metadata resolvers run (e.g. /_not-found prerender).
if (typeof process !== "undefined" && process.env) {
  if (!safeParseUrl(process.env.NEXTAUTH_URL)) {
    process.env.NEXTAUTH_URL = DEFAULT_APP_ORIGIN;
  }
  if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    process.env.NEXT_PUBLIC_APP_URL = DEFAULT_APP_ORIGIN;
  }
}
