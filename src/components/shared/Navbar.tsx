"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { VerifiedByBrand } from "@/components/shared/VerifiedByBrand";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-col justify-center">
          <Link
            href="/"
            className="font-display text-xl font-bold leading-none tracking-tight"
          >
            Future<span className="text-gradient">Card</span>
          </Link>
          <VerifiedByBrand size="sm" className="mt-0.5 hidden sm:inline-flex" />
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 px-3 py-2 font-semibold text-slate-950 shadow-glow transition hover:brightness-110"
          >
            Get started
          </Link>
        </nav>
      </div>
      <span className="sr-only">{APP_NAME}</span>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} FutureCard. Digital visiting cards, elevated.
    </footer>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 flex flex-wrap items-end justify-between gap-3"
    >
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35 }}
      className="glass glow-border relative overflow-hidden rounded-2xl p-4 shadow-panel"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-teal-400/10 blur-2xl" />
      <div className="relative z-[1] text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-200/70">
        {label}
      </div>
      <div className="relative z-[1] mt-2 font-mono text-3xl font-semibold tracking-tight text-gradient">
        {value}
      </div>
    </motion.div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass glow-border relative rounded-2xl border-dashed border-teal-400/20 p-10 text-center">
      <h3 className="font-display text-xl font-bold">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-teal-400/20 border-t-teal-400" />
    </div>
  );
}
