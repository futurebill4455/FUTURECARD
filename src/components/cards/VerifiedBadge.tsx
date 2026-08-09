"use client";

import { cn } from "@/lib/utils";

/**
 * Meta / Instagram–style verified tick.
 * Sized in fixed px so it stays proportionate beside large display names.
 */
export function VerifiedBadge({
  className,
  title = "Verified",
  size = "md",
}: {
  className?: string;
  title?: string;
  /** sm ≈ 14px (Meta profile), md ≈ 16px, lg ≈ 18px */
  size?: "sm" | "md" | "lg";
}) {
  const px = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center align-middle leading-none",
        className,
      )}
      title={title}
      aria-label={title}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 24 24"
        width={px}
        height={px}
        className="block"
        aria-hidden="true"
      >
        {/* Meta/IG–like filled circle */}
        <circle cx="12" cy="12" r="12" fill="#0095F6" />
        <path
          d="M10.05 16.55 6.4 12.9l1.35-1.35 2.3 2.3 5.35-5.35 1.35 1.35-6.7 6.7Z"
          fill="#fff"
        />
      </svg>
    </span>
  );
}
