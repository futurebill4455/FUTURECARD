import { DEFAULT_PLATFORM_SETTINGS } from "@/types/platform.types";

export type CustomDomainStatus = "none" | "pending" | "verified" | "failed";

/** Strip protocol, path, port, and www. prefix; lowercase. */
export function normalizeHostname(input: string): string {
  let value = input.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "");
  value = value.split("/")[0] ?? "";
  value = value.split(":")[0] ?? "";
  if (value.startsWith("www.")) value = value.slice(4);
  return value;
}

/**
 * Hosts that serve the SaaS app (landing, auth, dashboard) — NOT tenant card sites.
 * Anything else is treated as a mapped custom domain for a public card.
 */
export function getPlatformHosts(): Set<string> {
  const hosts = new Set<string>([
    "localhost",
    "127.0.0.1",
    // Primary production apex (Vercel custom domain for this product)
    "futurecard.online",
    "www.futurecard.online",
    "app.futurecard.pro",
  ]);

  const fromEnv = [
    process.env.PLATFORM_HOSTS,
    process.env.NEXT_PUBLIC_PLATFORM_HOST,
    process.env.NEXT_PUBLIC_PLATFORM_CNAME_TARGET,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    // Vercel automatically sets the production domain for the project
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]
    .filter(Boolean)
    .join(",");

  for (const part of fromEnv.split(",")) {
    const host = normalizeHostname(part);
    if (host) hosts.add(host);
  }

  return hosts;
}

export function isPlatformHost(hostHeader: string | null): boolean {
  if (!hostHeader) return true;
  const host = normalizeHostname(hostHeader);
  const withPort = hostHeader.toLowerCase().split("/")[0] ?? "";
  const platforms = getPlatformHosts();

  if (platforms.has(host) || platforms.has(withPort)) return true;

  // Preview / production deployments must never be treated as tenant custom domains
  // (otherwise `/` rewrites to `/domain/...` and 404s when no card matches).
  if (host.endsWith(".vercel.app")) return true;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl && host === normalizeHostname(vercelUrl)) return true;

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl && host === normalizeHostname(productionUrl)) return true;

  return false;
}

/**
 * App routes that should never be rewritten to /domain/[host], even on an
 * unknown host (covers misconfigured PLATFORM_HOSTS on a Vercel custom domain).
 */
export function isPlatformAppPath(pathname: string): boolean {
  if (pathname === "/") return false; // root stays host-sensitive (card vs landing)
  const prefixes = [
    "/api",
    "/login",
    "/register",
    "/pending-approval",
    "/dashboard",
    "/cards",
    "/analytics",
    "/settings",
    "/admin",
    "/c/",
    "/uploads",
    "/domain/",
  ];
  return prefixes.some(
    (p) => pathname === p.replace(/\/$/, "") || pathname.startsWith(p),
  );
}

export function getDefaultCnameTarget(): string {
  return (
    process.env.NEXT_PUBLIC_PLATFORM_CNAME_TARGET ||
    process.env.NEXT_PUBLIC_PLATFORM_HOST ||
    DEFAULT_PLATFORM_SETTINGS.platformCnameTarget
  );
}
