"use client";

import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ImmersiveBackground,
  type AmbientMode,
} from "@/components/shared/ImmersiveBackground";

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
  /** Server-verified admin flag — Admin Panel only when true */
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
      <ImmersiveBackground
        mode={ambientMode}
        video={ambientVideo}
        images={ambientImages}
        intensity={0.82}
      />
      <aside className="relative z-[1] border-b border-white/5 glass-soft md:border-b-0 md:border-r md:border-white/5">
        <div className="flex items-center justify-between px-4 py-5 md:block">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight"
          >
            Future<span className="text-gradient">Card</span>
          </Link>
          <button
            className="text-sm text-muted-foreground transition hover:text-teal-300 md:mt-6 md:block"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3 md:pb-6">
          {userLinks.map((l, i) => {
            const active =
              pathname === l.href ||
              (l.href !== "/dashboard" && pathname.startsWith(l.href));
            return (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <Link
                  href={l.href}
                  className={cn(
                    "relative block rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition",
                    active
                      ? "text-teal-100"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="user-nav-pill"
                      className="absolute inset-0 -z-10 rounded-xl border border-teal-400/25 bg-teal-400/10 shadow-glow"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  ) : null}
                  {l.label}
                </Link>
              </motion.div>
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
          {data?.user?.email}
        </p>
      </aside>
      <main className="relative z-[1] px-4 py-6 md:px-8 md:py-8">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
