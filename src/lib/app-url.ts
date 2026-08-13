/**
 * Safe public origin for metadata, QR codes, and shared card links.
 * Never throws — invalid env values fall back to the production domain.
 * Vercel deployment hosts (*.vercel.app) are never used for public card URLs.
 */

export const DEFAULT_APP_ORIGIN = "https://futurecard.online";

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

export function isVercelDeploymentHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  return host === "vercel.app" || host.endsWith(".vercel.app");
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

function originIfCanonical(raw: string | undefined | null): string | null {
  const parsed = safeParseUrl(raw);
  if (!parsed) return null;
  if (isVercelDeploymentHost(parsed.hostname)) return null;
  if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
    return null;
  }
  return parsed.origin;
}

/**
 * Canonical production origin for public card links, QR codes, and share URLs.
 * Ignores the current Vercel deployment host.
 */
export function getCanonicalPublicOrigin(): string {
  return (
    originIfCanonical(process.env.NEXT_PUBLIC_APP_URL) ||
    originIfCanonical(process.env.NEXT_PUBLIC_PLATFORM_HOST) ||
    DEFAULT_APP_ORIGIN
  );
}

/**
 * App origin for metadata / auth fallbacks.
 * Prefers the canonical production domain over window.location / VERCEL_URL
 * so preview deployments do not leak *.vercel.app into shared links.
 */
export function getAppOrigin(): string {
  const canonical = getCanonicalPublicOrigin();
  if (canonical) return canonical;

  if (typeof window !== "undefined" && window.location?.origin) {
    const fromWindow = originIfCanonical(window.location.origin);
    if (fromWindow) return fromWindow;
  }

  return DEFAULT_APP_ORIGIN;
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

/** Canonical public mini-site URL: https://futurecard.online/c/{username} */
export function cardPublicUrl(username: string): string {
  const slug = username.trim().toLowerCase().replace(/^\/+/, "");
  return absoluteAppUrl(`/c/${slug}`);
}

// Patch NEXTAUTH_URL only. Never assign to NEXT_PUBLIC_* — Next inlines those
// as string literals, which turns `process.env.NEXT_PUBLIC_APP_URL = …` into
// `"https://futurecard.online" = …` and crashes `/_not-found` on Vercel.
if (typeof process !== "undefined" && process.env) {
  if (!safeParseUrl(process.env.NEXTAUTH_URL)) {
    process.env["NEXTAUTH_URL"] = DEFAULT_APP_ORIGIN;
  }
}
