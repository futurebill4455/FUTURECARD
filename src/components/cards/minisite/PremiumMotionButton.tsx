"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Mini-site action button — same API / sizing hooks as before.
 * Visual-only luminous glass treatment via `.ms-luminous-btn`.
 */
export function PremiumMotionButton({
  children,
  onClick,
  disabled,
  className,
  style,
  accent,
  variant = "primary",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  accent?: string;
  variant?: "primary" | "ghost" | "outline" | "success";
  type?: "button" | "submit";
}) {
  const isDisabled = Boolean(disabled || !onClick);

  const variantClass =
    variant === "ghost"
      ? "ms-luminous-btn--ghost"
      : variant === "outline"
        ? "ms-luminous-btn--outline"
        : variant === "success"
          ? "ms-luminous-btn--success"
          : undefined;

  const cssVars: CSSProperties =
    variant === "primary" && accent
      ? ({
          ["--ms-btn-accent" as string]: accent,
          ["--ms-btn-mid" as string]: accent,
          ...style,
        } as CSSProperties)
      : style || {};

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileTap={isDisabled ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className={cn(
        "ms-luminous-btn group relative overflow-hidden rounded-2xl px-3 py-3 text-[11px] font-extrabold uppercase tracking-wide disabled:pointer-events-none disabled:opacity-40",
        variantClass,
        className,
      )}
      style={cssVars}
    >
      {/* Soft inner bloom — light emitting from within */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-80 transition duration-300 group-hover:opacity-100"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 120%, color-mix(in srgb, var(--ms-btn-violet) 35%, transparent), transparent 60%),
            radial-gradient(circle at 30% 15%, rgba(255,255,255,0.28), transparent 42%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, var(--ms-btn-accent) 30%, transparent), transparent 50%)
          `,
        }}
      />
      {/* Top gloss reflection */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-0 h-[45%] rounded-t-[inherit] bg-gradient-to-b from-white/25 to-transparent opacity-70 transition duration-300 group-hover:opacity-90"
      />
      {/* Hover light sweep — subtle */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition duration-500 group-hover:translate-x-full group-hover:opacity-100"
      />
      <span className="relative z-[1] drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
        {children}
      </span>
    </motion.button>
  );
}
