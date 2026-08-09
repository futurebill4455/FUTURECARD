"use client";

import { cn } from "@/lib/utils";

/**
 * Authentic Meta / Instagram–style verified badge
 * (scalloped blue mark + white check — Meta Verified proportions).
 */
export function VerifiedBadge({
  className,
  title = "Verified",
  size = "md",
}: {
  className?: string;
  title?: string;
  /** sm ≈ 16px, md ≈ 20px (beside name), lg ≈ 24px */
  size?: "sm" | "md" | "lg";
}) {
  const px = size === "sm" ? 16 : size === "lg" ? 24 : 20;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center align-middle leading-none",
        className,
      )}
      title={title}
      aria-label={title}
      style={{ width: px, height: px }}
    >
      {/* Soft Meta-blue glow behind mark */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[-18%] rounded-full opacity-70 blur-[3px]"
        style={{ background: "rgba(0, 149, 246, 0.45)" }}
      />
      <svg
        viewBox="0 0 40 40"
        width={px}
        height={px}
        className="relative block drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
        aria-hidden="true"
      >
        {/* Meta geometric verified mark */}
        <path
          fill="#0095F6"
          d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.137-5.6h5.907v-6.088L40 25.359 36.905 20 40 14.641l-5.598-3.137V5.15H28.5L25.358 0l-5.36 3.094Z"
        />
        <path
          fill="#fff"
          d="m16.284 27.766-7.349-7.35 2.04-2.04 5.309 5.308 11.123-11.124 2.04 2.04-13.163 13.166Z"
        />
      </svg>
    </span>
  );
}
