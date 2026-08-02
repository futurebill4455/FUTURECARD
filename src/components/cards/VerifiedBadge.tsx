"use client";

import { cn } from "@/lib/utils";

/** Instagram / Facebook style verified blue tick */
export function VerifiedBadge({
  className,
  title = "Verified business",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={cn("inline-flex shrink-0 align-middle", className)}
      title={title}
      aria-label={title}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[1.15em] w-[1.15em]"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="12" fill="#3897F0" />
        <path
          d="M10.1 16.35 6.55 12.8l1.4-1.4 2.15 2.15 5.05-5.05 1.4 1.4-6.45 6.45Z"
          fill="#fff"
        />
      </svg>
    </span>
  );
}
