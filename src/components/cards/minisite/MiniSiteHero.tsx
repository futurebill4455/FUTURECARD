"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { HolographicAvatar } from "@/components/cards/HolographicAvatar";
import { VerifiedBadge } from "@/components/cards/VerifiedBadge";
import { TypewriterName } from "@/components/cards/minisite/TypewriterName";
import { PremiumMotionButton } from "@/components/cards/minisite/PremiumMotionButton";
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

  const displayName = card.companyName || "Your Name";
  const [nameReady, setNameReady] = useState(false);
  const onNameDone = useCallback(() => setNameReady(true), []);

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
          whileHover={{ scale: 1.02 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 shadow-[0_0_0_1px_rgba(34,211,238,0.08)] backdrop-blur-md transition hover:border-cyan-300/30 hover:shadow-[0_0_28px_rgba(34,211,238,0.18)]"
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

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 160, damping: 18 }}
          className="relative mx-auto mt-8 flex justify-center"
        >
          <HolographicAvatar
            src={card.profileImage}
            alt={card.companyName || "Profile"}
            fallbackLetter={(card.companyName || "?").slice(0, 1)}
            accent={accent}
            soft={soft}
            size={132}
            showStatus
          />
        </motion.div>

        <h1
          className="mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl md:text-[2.75rem]"
        >
          <span className="sr-only">{displayName}</span>
          <TypewriterName
            text={displayName}
            className="font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl md:text-[2.75rem]"
            onComplete={onNameDone}
          />
          {card.isVerified ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.6, y: 4 }}
              animate={
                nameReady
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 0.6, y: 4 }
              }
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              className="inline-flex"
            >
              <VerifiedBadge size="lg" className="relative top-px" />
            </motion.span>
          ) : null}
        </h1>

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
          {ctas
            .filter((c) => c.enabled)
            .slice(0, 4)
            .map((cta, i) => (
              <motion.div
                key={cta.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 + i * 0.06 }}
              >
                <PremiumMotionButton
                  accent={accent}
                  onClick={() => onCta(cta.id)}
                  className="w-full py-3.5 text-[10px] sm:text-[11px]"
                >
                  {cta.label}
                </PremiumMotionButton>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}

/** Kept for any external imports that still reference HeroCta styling */
export function HeroCta({
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <PremiumMotionButton
        accent={accent}
        onClick={onClick}
        className={cn("w-full py-3.5 text-[10px] sm:text-[11px]")}
      >
        {label}
      </PremiumMotionButton>
    </motion.div>
  );
}
