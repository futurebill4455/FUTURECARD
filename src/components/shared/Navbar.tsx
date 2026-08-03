import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { VerifiedByBrand } from "@/components/shared/VerifiedByBrand";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-col justify-center">
          <Link href="/" className="font-display text-xl font-extrabold leading-none">
            Future<span className="text-teal-700">Card</span>
          </Link>
          <VerifiedByBrand size="sm" className="mt-0.5 hidden sm:inline-flex" />
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/login" className="rounded-xl px-3 py-2 hover:bg-muted">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-teal-700 px-3 py-2 font-semibold text-white hover:bg-teal-800"
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
    <footer className="border-t py-8 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} FutureCard. Digital visiting cards made simple.
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
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
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
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
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <h3 className="font-display text-xl font-bold">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      Loading…
    </div>
  );
}
