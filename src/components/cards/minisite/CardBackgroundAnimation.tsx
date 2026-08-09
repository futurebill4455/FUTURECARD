"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  FALLBACK_BACKGROUND_ANIMATION_SLUG,
  type BackgroundAnimationSlug,
} from "@/types/background-animation.types";

function Particles({ accent }: { accent: string }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: 2 + (i % 4),
        delay: (i % 8) * 0.35,
        duration: 5 + (i % 6),
      })),
    [],
  );

  return (
    <>
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            backgroundColor: accent,
            boxShadow: `0 0 10px ${accent}`,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.2, 0.85, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

function Waves({ accent }: { accent: string }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-60"
      viewBox="0 0 800 600"
      preserveAspectRatio="none"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          fill="none"
          stroke={accent}
          strokeWidth={1.5 - i * 0.25}
          opacity={0.35 - i * 0.06}
          d={`M0 ${220 + i * 40} C160 ${160 + i * 30} 320 ${280 + i * 20} 480 ${210 + i * 35} C640 ${140 + i * 40} 720 ${230 + i * 25} 800 ${200 + i * 30}`}
          animate={{
            d: [
              `M0 ${220 + i * 40} C160 ${160 + i * 30} 320 ${280 + i * 20} 480 ${210 + i * 35} C640 ${140 + i * 40} 720 ${230 + i * 25} 800 ${200 + i * 30}`,
              `M0 ${240 + i * 40} C160 ${200 + i * 30} 320 ${160 + i * 20} 480 ${250 + i * 35} C640 ${180 + i * 40} 720 ${210 + i * 25} 800 ${230 + i * 30}`,
              `M0 ${220 + i * 40} C160 ${160 + i * 30} 320 ${280 + i * 20} 480 ${210 + i * 35} C640 ${140 + i * 40} 720 ${230 + i * 25} 800 ${200 + i * 30}`,
            ],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

function Geometric({ accent }: { accent: string }) {
  return (
    <>
      <motion.div
        className="absolute left-[8%] top-[18%] h-24 w-24 rounded-2xl border"
        style={{ borderColor: `${accent}66` }}
        animate={{ rotate: [12, 28, 12], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[12%] top-[28%] h-16 w-16 rounded-full border"
        style={{ borderColor: `${accent}55` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[22%] left-[22%] h-0 w-0 border-l-[28px] border-r-[28px] border-b-[48px] border-l-transparent border-r-transparent"
        style={{ borderBottomColor: `${accent}44` }}
        animate={{ rotate: [0, 18, 0], x: [0, 10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[18%] right-[18%] h-20 w-20 rounded-xl border"
        style={{ borderColor: `${accent}50` }}
        animate={{ rotate: [-10, -26, -10] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

/**
 * Card-level background animation layer for the public mini-site.
 * Renders on top of the dark base / platform ambient.
 */
export function CardBackgroundAnimation({
  slug,
  accent = "#22d3ee",
  className,
}: {
  slug?: string | null;
  accent?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const design = (slug ||
    FALLBACK_BACKGROUND_ANIMATION_SLUG) as BackgroundAnimationSlug | string;

  if (design === "design_d_none" || reduceMotion) {
    return (
      <div
        className={cn("pointer-events-none absolute inset-0", className)}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[#020617]/40" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 45% at 50% -5%, ${accent}22, transparent 55%)`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#020617]/35" />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${accent}28, transparent 55%)`,
        }}
      />
      {design === "design_a_particles" ? <Particles accent={accent} /> : null}
      {design === "design_b_waves" ? <Waves accent={accent} /> : null}
      {design === "design_c_geometric" ? <Geometric accent={accent} /> : null}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(2,6,23,0.55)_100%)]" />
    </div>
  );
}
