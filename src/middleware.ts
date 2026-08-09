import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isPlatformHost, normalizeHostname } from "@/lib/custom-domain";
import { getAuthSecret } from "@/lib/auth-secret";

const STATIC_EXT =
  /\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|map|txt|xml|woff2?|ttf|eot)$/i;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostHeader = req.headers.get("host");

  if (!isPlatformHost(hostHeader)) {
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/uploads") ||
      STATIC_EXT.test(pathname)
    ) {
      return NextResponse.next();
    }

    const host = normalizeHostname(hostHeader || "");
    if (!host) return NextResponse.next();

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
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unapproved user sessions cannot use the dashboard (admins always allowed)
  if (
    token.role !== "admin" &&
    token.isApproved === false &&
    !pathname.startsWith("/pending-approval")
  ) {
    return NextResponse.redirect(new URL("/pending-approval", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
