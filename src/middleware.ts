import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  isPlatformAppPath,
  isPlatformHost,
  normalizeHostname,
} from "@/lib/custom-domain";
import { getAuthSecret } from "@/lib/auth-secret";

const STATIC_EXT =
  /\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|map|txt|xml|woff2?|ttf|eot)$/i;

const STATIC_PATHS = new Set([
  "/favicon.ico",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/site.webmanifest",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostHeader = req.headers.get("host");

  // Never rewrite asset / well-known requests (avoids custom-domain 404 noise)
  if (
    STATIC_PATHS.has(pathname) ||
    STATIC_EXT.test(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/bg-previews")
  ) {
    return NextResponse.next();
  }

  if (!isPlatformHost(hostHeader)) {
    if (pathname.startsWith("/api") || pathname.startsWith("/uploads")) {
      return NextResponse.next();
    }

    // Auth + dashboard routes must keep working on Vercel-attached domains
    // even if PLATFORM_HOSTS env is incomplete.
    if (isPlatformAppPath(pathname)) {
      return NextResponse.next();
    }

    const host = normalizeHostname(hostHeader || "");
    if (!host) return NextResponse.next();

    // Tenant custom domains: serve the mapped public card
    const url = req.nextUrl.clone();
    url.pathname = `/domain/${encodeURIComponent(host)}`;
    url.search = "";
    return NextResponse.rewrite(url);
  }

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/cards") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin");

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: getAuthSecret(),
  });

  if (!token) {
    try {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    } catch {
      return NextResponse.redirect(new URL("/login", "https://futurecard.online"));
    }
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    try {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      return NextResponse.redirect(new URL("/dashboard", "https://futurecard.online"));
    }
  }

  // Unapproved user sessions cannot use the dashboard (admins always allowed)
  if (
    token.role !== "admin" &&
    token.isApproved === false &&
    !pathname.startsWith("/pending-approval")
  ) {
    try {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    } catch {
      return NextResponse.redirect(
        new URL("/pending-approval", "https://futurecard.online"),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|apple-touch-icon.png|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|map|txt|xml|woff2?|ttf|eot)$).*)",
  ],
};
