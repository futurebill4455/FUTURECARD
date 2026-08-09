"use client";

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
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b bg-card md:border-b-0 md:border-r">
        <div className="px-4 py-4">
          <Link href="/" className="font-display text-xl font-extrabold">
            Future<span className="text-teal-700">Card</span>
          </Link>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-800">
            Super Admin
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap",
                pathname === l.href ||
                  (l.href !== "/admin/dashboard" && pathname.startsWith(l.href))
                  ? "bg-teal-700 text-white"
                  : "hover:bg-muted",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            User dashboard
          </Link>
        </nav>
        <div className="hidden px-4 pb-4 md:block">
          <p className="text-xs text-muted-foreground">{data?.user?.email}</p>
          <button
            className="mt-2 text-sm text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
