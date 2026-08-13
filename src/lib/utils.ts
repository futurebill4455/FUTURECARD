import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Resolve the public site origin for absolute links / QR codes.
 * Prefer the browser origin on the client so production / Vercel / custom
 * domains never bake in localhost from a missing env var.
 */
export function getPublicOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, "");
    // Guard against odd sandboxed origins, but keep real http(s) hosts.
    if (/^https?:\/\//i.test(origin)) return origin;
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_PLATFORM_HOST ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (fromEnv) {
    return normalizeBaseUrl(fromEnv);
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "") {
  const base = getPublicOrigin();
  const suffix = path
    ? path.startsWith("/")
      ? path
      : `/${path}`
    : "";
  return `${base}${suffix}`;
}
