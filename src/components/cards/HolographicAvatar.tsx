"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Multi-layer holographic energy rings around the profile avatar.
 */
export function HolographicAvatar({
  src,
  alt,
  fallbackLetter,
  accent = "#2dd4bf",
  soft,
  className,
  size = 116,
}: {
  src?: string;
  alt: string;
  fallbackLetter: string;
  accent?: string;
  soft?: string;
  className?: string;
  size?: number;
}) {
  const outer = size + 40;

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: outer, height: outer }}
    >
      <motion.div
        className="absolute inset-0 rounded-full opacity-90"
        style={{
          background: `conic-gradient(from 90deg, transparent, ${accent}, transparent 40%, ${accent}aa, transparent 75%, ${accent})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute inset-[3px] rounded-full bg-slate-950"
        style={{ boxShadow: `inset 0 0 20px ${accent}22` }}
      />

      <motion.div
        className="absolute rounded-full border border-dashed"
        style={{
          inset: 10,
          borderColor: `${accent}66`,
          boxShadow: `0 0 28px ${accent}40`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          inset: 18,
          background: `radial-gradient(circle, ${accent}40 0%, transparent 68%)`,
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.95, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
        className="relative z-[1] overflow-hidden rounded-full border-[3px] border-white/90"
        style={{
          width: size,
          height: size,
          backgroundColor: soft || accent,
          boxShadow: `0 0 0 1px ${accent}88, 0 0 36px ${accent}66, 0 14px 40px rgba(0,0,0,0.5)`,
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            {fallbackLetter}
          </div>
        )}
      </motion.div>
    </div>
  );
}
