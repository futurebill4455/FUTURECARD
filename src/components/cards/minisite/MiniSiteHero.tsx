"use client";

import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { HolographicAvatar } from "@/components/cards/HolographicAvatar";
import { VerifiedBadge } from "@/components/cards/VerifiedBadge";
import { PLATFORM_BRAND, PLATFORM_TAGLINE } from "@/lib/service-categories";
import type { ICard, IPrimaryCta } from "@/types/card.types";
import { cn } from "@/lib/utils";

export function MiniSiteHero({
  card,
  accent,
  soft,
  ctas,
  onCta,
}: {
  card: ICard;
  accent: string;
  soft: string;
  ctas: IPrimaryCta[];
  onCta: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const glowX = useTransform(sx, [0, 1], ["20%", "80%"]);
  const glowY = useTransform(sy, [0, 1], ["15%", "70%"]);

  const title =
    card.jobTitle?.trim() ||
    card.businessCategory?.trim() ||
    card.businessType?.trim() ||
    "Digital Professional";
  const intro =
    card.aboutUs?.trim() ||
    "Smart solutions for protection, growth and a better future.";

  function onMove(e: MouseEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }

  return (
    <section
      id="home"
      ref={wrapRef}
      onMouseMove={onMove}
      className="relative scroll-mt-24 overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pb-14 sm:pt-24"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl"
        style={{
          left: glowX,
          top: glowY,
          x: "-50%",
          y: "-50%",
          background: `radial-gradient(circle, ${accent}33, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-md"
        >
          <span className="font-display text-xs font-bold tracking-[0.18em] text-cyan-50/90 uppercase">
            {PLATFORM_BRAND}
          </span>
          <span className="h-1 w-1 rounded-full bg-cyan-400/50" />
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-200/70">
            Verified Profile
            <VerifiedBadge size="sm" />
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200/40"
        >
          {PLATFORM_TAGLINE}
        </motion.p>

        <div className="relative mx-auto mt-8 flex justify-center">
          <HolographicAvatar
            src={card.profileImage}
            alt={card.companyName || "Profile"}
            fallbackLetter={(card.companyName || "?").slice(0, 1)}
            accent={accent}
            soft={soft}
            size={132}
            showStatus
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl md:text-[2.75rem]"
        >
          <span className="text-balance">{card.companyName || "Your Name"}</span>
          {card.isVerified ? (
            <VerifiedBadge size="md" className="relative top-px" />
          ) : null}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-2 text-sm font-medium text-cyan-100/70 sm:text-base"
        >
          {title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300/75 sm:text-[15px]"
        >
          “{intro.length > 160 ? `${intro.slice(0, 157)}…` : intro}”
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-2.5 sm:grid-cols-4"
        >
          {ctas.filter((c) => c.enabled).slice(0, 4).map((cta, i) => (
            <HeroCta
              key={cta.id}
              label={cta.label}
              accent={accent}
              delay={0.05 * i}
              onClick={() => onCta(cta.id)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HeroCta({
  label,
  accent,
  delay,
  onClick,
}: {
  label: string;
  accent: string;
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/15 px-2 py-3.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-950 shadow-lg sm:text-[11px]",
      )}
      style={{
        background: `linear-gradient(145deg, ${accent}, ${accent}cc)`,
        boxShadow: `0 10px 28px ${accent}40`,
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.45), transparent 55%)",
        }}
      />
      <span className="relative z-[1]">{label}</span>
    </motion.button>
  );
}
