"use client";

import { useMemo, useState } from "react";
import type { ICard } from "@/types/card.types";
import { VerifiedBadge } from "./VerifiedBadge";
import { VerifiedByBrand } from "@/components/shared/VerifiedByBrand";
import { cn } from "@/lib/utils";

const ABOUT_COLLAPSE_CHARS = 120;

function GstIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M7 9h10M7 13h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="16.5" cy="15.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Compact About Us with Read More / Show Less */
export function CompactAboutUs({
  aboutUs,
  accent,
  className,
}: {
  aboutUs?: string;
  accent: string;
  className?: string;
}) {
  const text = aboutUs?.trim() ?? "";
  const needsToggle = text.length > ABOUT_COLLAPSE_CHARS;
  const [expanded, setExpanded] = useState(false);

  const display = useMemo(() => {
    if (!needsToggle || expanded) return text;
    return `${text.slice(0, ABOUT_COLLAPSE_CHARS).trimEnd()}…`;
  }, [text, needsToggle, expanded]);

  if (!text) return null;

  return (
    <div className={cn("text-center", className)}>
      <p className="text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {display}
      </p>
      {needsToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-xs font-bold underline-offset-2 hover:underline"
          style={{ color: accent }}
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Reference header hierarchy:
 * Name + verified → Category badge → GST → Compact About
 */
export function CardHeaderIdentity({
  card,
  accent,
  className,
}: {
  card: ICard;
  accent: string;
  className?: string;
}) {
  const category =
    card.businessCategory?.trim() ||
    card.businessType?.trim() ||
    "";
  const gst = card.gstNumber?.trim() || "";
  const subtitle =
    !category && card.jobTitle?.trim() ? card.jobTitle.trim() : "";
  // When both type + category exist, keep type as a thin subtitle under the badge
  const typeLine =
    card.businessType?.trim() &&
    card.businessCategory?.trim() &&
    card.businessType.trim() !== card.businessCategory.trim()
      ? card.businessType.trim()
      : card.jobTitle?.trim() &&
          card.jobTitle.trim() !== category
        ? card.jobTitle.trim()
        : "";

  return (
    <div className={cn("text-center animate-fade-up", className)}>
      <h1 className="inline-flex max-w-[95%] flex-wrap items-center justify-center gap-1.5 font-display text-[1.65rem] font-extrabold leading-tight tracking-tight text-foreground">
        <span className="text-balance">{card.companyName}</span>
        {card.isVerified ? (
          <VerifiedBadge className="translate-y-[1px]" />
        ) : null}
      </h1>

      <div className="mt-2.5 flex justify-center">
        <VerifiedByBrand
          size="sm"
          className="rounded-full border border-teal-800/10 bg-white/80 px-3 py-1 shadow-sm backdrop-blur-sm"
        />
      </div>

      {category ? (
        <div className="mt-2.5 flex justify-center">
          <span
            className="inline-flex max-w-full items-center rounded-full px-3.5 py-1 text-xs font-bold tracking-wide text-white shadow-sm"
            style={{ backgroundColor: accent }}
          >
            <span className="truncate">{category}</span>
          </span>
        </div>
      ) : subtitle ? (
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          {subtitle}
        </p>
      ) : null}

      {typeLine ? (
        <p className="mt-1.5 text-xs font-medium text-muted-foreground">
          {typeLine}
        </p>
      ) : null}

      {gst ? (
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
          <GstIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
          <span className="font-medium tracking-wide">
            GST: <span className="font-semibold text-foreground/80">{gst}</span>
          </span>
        </div>
      ) : null}

      <CompactAboutUs
        aboutUs={card.aboutUs}
        accent={accent}
        className="mx-auto mt-3 max-w-[22rem] px-1"
      />
    </div>
  );
}

/** Kept for any secondary detail usage (location etc.) — not used in header */
export function CompanyDetailsBlock({
  card,
  className,
}: {
  card: ICard;
  className?: string;
}) {
  const address = card.location?.address?.trim();
  const website = card.website?.trim();
  if (!address && !website) return null;

  return (
    <div
      className={cn(
        "rounded-2xl bg-white/80 px-4 py-1 text-left shadow-sm ring-1 ring-black/5",
        className,
      )}
    >
      {address ? (
        <div className="border-b border-black/[0.06] py-2.5 last:border-b-0">
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Location
          </div>
          <div className="mt-0.5 text-sm font-semibold">{address}</div>
        </div>
      ) : null}
      {website ? (
        <div className="py-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Website
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold">{website}</div>
        </div>
      ) : null}
    </div>
  );
}

export function AboutUsSection({
  aboutUs,
  accent,
  className,
}: {
  aboutUs?: string;
  accent: string;
  className?: string;
}) {
  return (
    <CompactAboutUs aboutUs={aboutUs} accent={accent} className={className} />
  );
}
