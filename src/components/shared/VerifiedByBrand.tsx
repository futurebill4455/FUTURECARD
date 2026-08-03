"use client";

import { VerifiedBadge } from "@/components/cards/VerifiedBadge";
import { cn } from "@/lib/utils";

export const PLATFORM_VERIFY_BRAND = "Future Shield";

/** Prominent platform verification mark — tick + brand name */
export function VerifiedByBrand({
  className,
  size = "md",
  dark = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}) {
  const sizes = {
    sm: "text-[11px] gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2 sm:text-lg",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-display font-extrabold tracking-tight",
        sizes[size],
        dark ? "text-white" : "text-zinc-900",
        className,
      )}
    >
      <span className={cn(dark ? "text-teal-100/80" : "text-zinc-500", "font-sans font-semibold")}>
        Verified by
      </span>
      <span className={dark ? "text-white" : "bg-gradient-to-r from-teal-800 to-emerald-600 bg-clip-text text-transparent"}>
        {PLATFORM_VERIFY_BRAND}
      </span>
      <VerifiedBadge
        title={`Verified by ${PLATFORM_VERIFY_BRAND}`}
        className={size === "lg" ? "scale-110" : size === "sm" ? "scale-90" : undefined}
      />
    </div>
  );
}
