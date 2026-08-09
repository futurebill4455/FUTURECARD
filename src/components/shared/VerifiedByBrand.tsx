"use client";

import { VerifiedBadge } from "@/components/cards/VerifiedBadge";
import { cn } from "@/lib/utils";

export const PLATFORM_VERIFY_BRAND = "Future Shield";

/** Prominent platform verification mark — tick + brand name */
export function VerifiedByBrand({
  className,
  size = "md",
  /** Force light-on-dark (default) or dark-on-light for light card surfaces */
  dark = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}) {
  const sizes = {
    sm: "text-[10px] gap-1",
    md: "text-xs gap-1",
    lg: "text-sm gap-1.5 sm:text-base",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-display font-extrabold tracking-tight",
        sizes[size],
        dark ? "text-teal-50" : "text-zinc-900",
        className,
      )}
    >
      <span
        className={cn(
          "font-sans font-semibold",
          dark ? "text-teal-200/70" : "text-zinc-500",
        )}
      >
        Verified by
      </span>
      <span
        className={
          dark
            ? "text-gradient"
            : "bg-gradient-to-r from-teal-800 to-emerald-600 bg-clip-text text-transparent"
        }
      >
        {PLATFORM_VERIFY_BRAND}
      </span>
      {/* Tick always immediately to the right of the brand name */}
      <VerifiedBadge
        size={size === "lg" ? "md" : "sm"}
        title={`Verified by ${PLATFORM_VERIFY_BRAND}`}
      />
    </div>
  );
}
