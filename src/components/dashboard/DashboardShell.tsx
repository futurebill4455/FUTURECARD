"use client";

import dynamic from "next/dynamic";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AmbientMode } from "@/components/shared/ImmersiveBackground";

/** Client-only ambient — avoids Framer/video SSR crashes on Vercel */
const ImmersiveBackground = dynamic(
  () =>
    import("@/components/shared/ImmersiveBackground").then(
      (m) => m.ImmersiveBackground,
    ),
  { ssr: false },
);

const userLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/cards", label: "Cards" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Profile & Settings" },
];

export function DashboardShell({
  children,
  isAdmin = false,
  ambientMode = "gradient",
  ambientVideo,
  ambientImages,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
  ambientMode?: AmbientMode;
  ambientVideo?: string;
  ambientImages?: string[];
}) {
  const { data } = useSession();
  const pathname = usePathname();
  const showAdminPanel = isAdmin === true;

  return (
    <div className="relative min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <div className="pointer-events-none absolute inset-0 bg-[#020617]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
      >
        <ImmersiveBackground
          mode={ambientMode || "gradient"}
          video={ambientVideo || ""}
          images={Array.isArray(ambientImages) ? ambientImages : []}
          intensity={0.82}
        />
      </div>

      <aside className="relative z-[1] border-b border-white/5 glass-soft md:border-b-0 md:border-r md:border-white/5">
        <div className="flex items-center justify-between px-4 py-5 md:block">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight"
          >
            Future<span className="text-gradient">Card</span>
          </Link>
          <button
            type="button"
            className="text-sm text-muted-foreground transition hover:text-teal-300 md:mt-6 md:block"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3 md:pb-6">
          {userLinks.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/dashboard" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative block rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition",
                  active
                    ? "border border-teal-400/25 bg-teal-400/10 text-teal-100 shadow-glow"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          {showAdminPanel ? (
            <Link
              href="/admin/dashboard"
              className="mt-1 rounded-xl border border-teal-400/20 px-3 py-2.5 text-sm font-medium text-teal-200 transition hover:bg-teal-400/10"
            >
              Admin panel
            </Link>
          ) : null}
        </nav>
        <p className="hidden truncate px-4 pb-5 font-mono text-[11px] text-muted-foreground md:block">
          {data?.user?.email || "\u00a0"}
        </p>
      </aside>
      <main className="relative z-[1] px-4 py-6 md:px-8 md:py-8">
        <div key={pathname} className="animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
