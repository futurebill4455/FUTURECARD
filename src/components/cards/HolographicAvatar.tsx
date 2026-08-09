"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  showStatus = false,
}: {
  src?: string;
  alt: string;
  fallbackLetter: string;
  accent?: string;
  soft?: string;
  className?: string;
  size?: number;
  showStatus?: boolean;
}) {
  const outer = size + 44;
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });
  const glowX = useTransform(sx, [0, 1], ["25%", "75%"]);
  const glowY = useTransform(sy, [0, 1], ["25%", "75%"]);

  function onMove(e: React.MouseEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: outer, height: outer }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-16 w-16 rounded-full blur-2xl"
        style={{
          left: glowX,
          top: glowY,
          x: "-50%",
          y: "-50%",
          backgroundColor: `${accent}55`,
        }}
      />

      {/* Soft particle dots */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute h-1 w-1 rounded-full"
          style={{
            backgroundColor: accent,
            boxShadow: `0 0 8px ${accent}`,
            left: `${18 + i * 14}%`,
            top: `${12 + ((i * 17) % 60)}%`,
          }}
          animate={{
            y: [0, -6 - i, 0],
            opacity: [0.2, 0.85, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

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

      {showStatus ? (
        <span className="absolute bottom-2 right-3 z-[2] inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-slate-950/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.35)] backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Available
        </span>
      ) : null}
    </div>
  );
}
