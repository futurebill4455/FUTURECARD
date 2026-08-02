import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isPlatformHost, normalizeHostname } from "@/lib/custom-domain";

const STATIC_EXT =
  /\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|map|txt|xml|woff2?|ttf|eot)$/i;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostHeader = req.headers.get("host");

  // Custom domain → rewrite to /domain/[host] (public card under client's hostname)
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
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
