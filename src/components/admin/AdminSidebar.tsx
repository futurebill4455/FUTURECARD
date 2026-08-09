"use client";

import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/domains", label: "Domain Requests" },
  { href: "/admin/settings", label: "Platform" },
  { href: "/admin/profile", label: "My Profile" },
];

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();

  return (
    <div className="relative min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-50" />
      <aside className="relative z-[1] border-b border-white/5 glass-soft md:border-b-0 md:border-r md:border-white/5">
        <div className="px-4 py-5">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight"
          >
            Future<span className="text-gradient">Card</span>
          </Link>
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-300/80">
            Super Admin
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3 md:pb-6">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/admin/dashboard" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition",
                  active
                    ? "text-teal-100"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="admin-nav-pill"
                    className="absolute inset-0 -z-10 rounded-xl border border-teal-400/25 bg-teal-400/10 shadow-glow"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            User dashboard
          </Link>
        </nav>
        <div className="hidden px-4 pb-5 md:block">
          <p className="truncate text-xs text-muted-foreground">
            {data?.user?.email}
          </p>
          <button
            className="mt-2 text-sm text-muted-foreground transition hover:text-teal-300"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="relative z-[1] px-4 py-6 md:px-8 md:py-8">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
