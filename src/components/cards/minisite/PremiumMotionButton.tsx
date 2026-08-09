"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Shared luxurious micro-interaction button for the mini-site */
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
  const base =
    "group relative overflow-hidden rounded-2xl px-3 py-3 text-[11px] font-extrabold uppercase tracking-wide transition-[box-shadow,border-color] duration-300 disabled:pointer-events-none disabled:opacity-40";

  const variants: Record<"primary" | "ghost" | "outline" | "success", string> = {
    primary: "border border-transparent text-slate-950",
    ghost:
      "border border-white/12 bg-white/[0.04] text-slate-100 hover:border-white/25",
    outline:
      "border border-white/15 bg-white/[0.05] text-slate-100 hover:border-cyan-300/35",
    success:
      "border border-emerald-400/35 bg-emerald-400/10 text-emerald-50 hover:border-emerald-300/55",
  };

  const primaryStyle =
    variant === "primary" && accent
      ? {
          background: `linear-gradient(145deg, ${accent}, ${accent}cc)`,
          boxShadow: `0 10px 28px ${accent}40`,
          ...style,
        }
      : style;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={isDisabled ? undefined : { y: -3, scale: 1.035 }}
      whileTap={isDisabled ? undefined : { scale: 0.965 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={cn(base, variants[variant], className)}
      style={primaryStyle}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition duration-500 group-hover:translate-x-full group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 30% 15%, rgba(255,255,255,0.4), transparent 55%)",
        }}
      />
      {accent && variant === "primary" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition duration-300 group-hover:opacity-100"
          style={{ boxShadow: `0 0 0 1px ${accent}88, 0 0 28px ${accent}55` }}
        />
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[0_0_24px_rgba(34,211,238,0.25)] ring-1 ring-inset ring-cyan-300/30 transition duration-300 group-hover:opacity-100"
        />
      )}
      <span className="relative z-[1]">{children}</span>
    </motion.button>
  );
}
