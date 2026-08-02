"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const userLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/cards", label: "Cards" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b bg-card md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Link href="/" className="font-display text-xl font-extrabold">
            Future<span className="text-teal-700">Card</span>
          </Link>
          <button
            className="text-sm text-muted-foreground md:mt-6 md:block"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3">
          {userLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap",
                pathname.startsWith(l.href)
                  ? "bg-teal-700 text-white"
                  : "hover:bg-muted",
              )}
            >
              {l.label}
            </Link>
          ))}
          {data?.user?.role === "admin" ? (
            <Link
              href="/admin/dashboard"
              className="rounded-xl px-3 py-2 text-sm font-medium text-teal-800 hover:bg-muted"
            >
              Admin panel
            </Link>
          ) : null}
        </nav>
        <p className="hidden px-4 pb-4 text-xs text-muted-foreground md:block">
          {data?.user?.email}
        </p>
      </aside>
      <main className="px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
