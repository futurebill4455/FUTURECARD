"use client";

import type { IPlatformSettings } from "@/types/platform.types";
import { VerifiedByBrand } from "@/components/shared/VerifiedByBrand";

export function CardPromoFooter({
  settings,
  accent,
  onTrack,
}: {
  settings: IPlatformSettings;
  accent?: string;
  onTrack?: () => void;
}) {
  const phone = (settings.adminWhatsappNumber || "").replace(/\D/g, "");
  const brand = settings.companyName || "Future Shield";
  const message = encodeURIComponent(
    `Hello ${brand}!\n\nI saw a digital visiting card and I am interested in getting one for my business.\nPlease share pricing and how to get started.`,
  );
  const waUrl = phone
    ? `https://wa.me/${phone}?text=${message}`
    : undefined;
  const website = settings.companyWebsiteUrl?.trim();

  return (
    <footer className="mx-auto w-full max-w-md rounded-lg bg-white/95 px-2.5 py-1.5 text-center shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <VerifiedByBrand size="sm" dark={false} />
        {settings.footerTagline ? (
          <span className="hidden text-[9px] leading-none text-zinc-500 sm:inline">
            · {settings.footerTagline}
          </span>
        ) : null}
      </div>

      <div className="mt-1.5 flex gap-1.5">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onTrack}
            className="inline-flex min-h-0 flex-1 items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold leading-tight tracking-tight text-white shadow-sm transition active:scale-[0.98]"
            style={{ backgroundColor: accent || "#0F766E" }}
          >
            Need This Digital Card?
          </a>
        ) : (
          <span className="flex-1 text-[10px] font-semibold text-zinc-500">
            Contact link not configured
          </span>
        )}
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-0 flex-1 items-center justify-center rounded-md border border-zinc-200 px-2 py-1 text-[10px] font-semibold leading-tight tracking-tight text-zinc-700 transition hover:bg-zinc-50"
          >
            Visit our website
          </a>
        ) : null}
      </div>
    </footer>
  );
}

export function ExpiredCardNotice({
  companyName,
}: {
  companyName?: string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 text-center shadow-lg">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
        Subscription expired
      </p>
      <h1 className="mt-2 font-display text-2xl font-extrabold">
        {companyName || "This digital card"} is unavailable
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The owner&apos;s plan has expired. Please contact the platform admin to
        renew and restore public access.
      </p>
    </div>
  );
}
