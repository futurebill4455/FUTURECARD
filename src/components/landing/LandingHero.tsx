"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import {
  Phone,
  MessageCircle,
  IndianRupee,
  Images,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { TiltCard } from "@/components/landing/TiltCard";
import { TypewriterHeadline } from "@/components/landing/TypewriterHeadline";
import { VerifiedByBrand } from "@/components/shared/VerifiedByBrand";
import { KineticWords } from "@/components/landing/motion";
import {
  DEFAULT_LANDING_CMS,
  type ILandingHeroContent,
} from "@/types/landing-cms.types";

const springSoft = { type: "spring" as const, stiffness: 90, damping: 14 };

export function LandingHero({
  content = DEFAULT_LANDING_CMS.hero,
}: {
  content?: ILandingHeroContent;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const yCard = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const yCopy = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const scaleStage = useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.75], [1, 0.25]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 18 });
  const glowBg = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(ellipse 75% 55% at ${Number(x) * 100}% ${Number(y) * 100}%, rgba(15,118,110,0.42), transparent 58%)`,
  );

  function onMouseMove(e: React.MouseEvent) {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top) / r.height);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="relative min-h-[100svh] overflow-hidden pt-8 sm:pt-4"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div style={{ y: orbY, background: glowBg }} className="absolute inset-0" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-24 top-8 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),transparent_65%)] blur-2xl"
        />
        <motion.div
          animate={{ scale: [1.15, 1, 1.15], x: [0, 40, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.35),transparent_65%)] blur-2xl"
        />
        {/* Shockwave rings on load */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0.5 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="absolute left-1/2 top-[42%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-500/40"
        />
        <motion.div
          initial={{ scale: 0.2, opacity: 0.35 }}
          animate={{ scale: 3.2, opacity: 0 }}
          transition={{ duration: 2, delay: 0.15, ease: "easeOut" }}
          className="absolute left-1/2 top-[42%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/30"
        />
      </div>

      <motion.div
        style={{ opacity: opacityHero }}
        className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:pb-20 lg:pt-32"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <motion.div style={{ y: yCopy }} className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ ...springSoft, delay: 0.15 }}
              className="mb-4"
            >
              <VerifiedByBrand
                size="md"
                className="rounded-2xl border border-teal-400/20 bg-white/5 px-3 py-1.5 shadow-sm backdrop-blur-md"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springSoft, delay: 0.25 }}
              className="inline-flex items-center gap-2 rounded-2xl border border-teal-400/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-teal-100 backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              {content.badge}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...springSoft, delay: 0.35 }}
              className="mt-5 font-display text-4xl font-extrabold tracking-tight text-teal-50 sm:text-5xl md:text-6xl"
            >
              {content.brandLine.endsWith("Card") ? (
                <>
                  {content.brandLine.slice(0, -4)}
                  <span className="text-teal-300">Card</span>
                </>
              ) : (
                content.brandLine
              )}
            </motion.p>

            <div className="mt-4">
              <TypewriterHeadline
                prefix={content.typewriterPrefix}
                suffix={content.typewriterSuffix}
                phrases={content.typewriterPhrases}
              />
            </div>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-teal-100/70 sm:text-lg">
              <KineticWords text={content.subtitle} delay={0.55} />
            </p>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springSoft, delay: 0.85 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href={content.primaryCtaHref || "/register"}
                className="group relative overflow-hidden rounded-2xl bg-teal-400 px-6 py-3.5 text-sm font-bold text-teal-950 shadow-[0_12px_40px_-10px_rgba(45,212,191,0.55)] transition hover:scale-[1.03] hover:bg-teal-300"
              >
                <span className="relative z-10">{content.primaryCtaLabel}</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-full" />
              </Link>
              <Link
                href={content.secondaryCtaHref || "/register"}
                className="rounded-2xl border border-teal-400/30 bg-white/5 px-6 py-3.5 text-sm font-bold text-teal-50 shadow-sm backdrop-blur-md transition hover:scale-[1.03] hover:border-teal-300/50 hover:bg-white/10"
              >
                {content.secondaryCtaLabel}
              </Link>
            </motion.div>
          </motion.div>

          {/* Explosive assemble stage */}
          <motion.div
            style={{ y: yCard, scale: scaleStage }}
            className="relative mx-auto w-full max-w-[400px] [perspective:1400px]"
          >
            <ExplodingCardMockup />
            <FloatingChip
              className="absolute -left-2 top-16 z-30 hidden sm:block lg:-left-10"
              delay={1.35}
              icon={Phone}
              label="Call"
              color="bg-sky-100/95 text-sky-800"
              from={{ x: -80, y: -40 }}
            />
            <FloatingChip
              className="absolute -right-2 top-28 z-30 sm:-right-8"
              delay={1.45}
              icon={MessageCircle}
              label="WhatsApp"
              color="bg-emerald-100/95 text-emerald-800"
              from={{ x: 90, y: -30 }}
            />
            <FloatingChip
              className="absolute bottom-28 -left-6 z-30 sm:-left-12"
              delay={1.55}
              icon={IndianRupee}
              label="Pay Now"
              color="bg-amber-100/95 text-amber-900"
              from={{ x: -70, y: 60 }}
            />
            <FloatingChip
              className="absolute bottom-6 -right-2 z-30 sm:right-0"
              delay={1.65}
              icon={Images}
              label="Gallery"
              color="bg-rose-100/95 text-rose-800"
              from={{ x: 70, y: 50 }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function FloatingChip({
  icon: Icon,
  label,
  color,
  className,
  delay,
  from,
}: {
  icon: typeof Phone;
  label: string;
  color: string;
  className?: string;
  delay: number;
  from: { x: number; y: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3, x: from.x, y: from.y, rotate: -18 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: 0,
        y: [0, -10, 0],
        rotate: 0,
      }}
      transition={{
        opacity: { delay, duration: 0.35 },
        scale: { delay, type: "spring", stiffness: 200, damping: 12 },
        x: { delay, type: "spring", stiffness: 120, damping: 14 },
        rotate: { delay, type: "spring", stiffness: 100, damping: 12 },
        y: {
          delay: delay + 0.4,
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      whileHover={{ scale: 1.12, rotate: 3 }}
      className={className}
    >
      <div
        className={`flex items-center gap-2 rounded-2xl border border-white/80 px-3 py-2 text-xs font-bold shadow-[0_14px_34px_-10px_rgba(15,80,70,0.4)] backdrop-blur-md ${color}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
    </motion.div>
  );
}

/** Card pieces explode inward and assemble — commercial product reveal */
function ExplodingCardMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="absolute -inset-12 rounded-[3rem] bg-gradient-to-br from-teal-400/40 via-emerald-300/15 to-amber-400/35 blur-3xl"
      />

      <TiltCard maxTilt={14} className="relative z-10 will-change-transform">
        <div className="landing-glow-border relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/90 shadow-[0_40px_100px_-24px_rgba(15,80,70,0.6)] backdrop-blur-xl">
          {/* Cover — flies from top */}
          <motion.div
            initial={{ y: -220, opacity: 0, rotateX: -40, scale: 1.2 }}
            animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 12, delay: 0.35 }}
            className="relative h-36 origin-top bg-gradient-to-br from-teal-950 via-teal-700 to-emerald-600"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 4.5, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.4),transparent_50%)]"
            />
          </motion.div>

          <div className="relative -mt-12 px-5 pb-6 text-center">
            {/* Avatar — shoots from bottom */}
            <motion.div
              initial={{ y: 180, scale: 0, rotate: -40 }}
              animate={{ y: 0, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.55 }}
              className="mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-[1.4rem] border-4 border-white bg-gradient-to-br from-teal-50 to-teal-100 shadow-lg"
            >
              <span className="font-display text-2xl font-extrabold text-teal-800">
                FS
              </span>
            </motion.div>

            {/* Name + Future Shield verify — assemble from sides */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.85 }}
              className="mt-3"
            >
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="font-display text-xl font-bold text-zinc-900">
                  Future Shield
                </h2>
                <BadgeCheck className="h-5 w-5 fill-sky-500 text-white" />
              </div>
              <div className="mt-2 flex justify-center">
                <VerifiedByBrand size="sm" />
              </div>
            </motion.div>

            {/* Action tiles — explode from corners */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              {[
                { l: "Call", c: "bg-sky-50 text-sky-800", x: -40, y: 40 },
                { l: "Chat", c: "bg-emerald-50 text-emerald-800", x: -10, y: 50 },
                { l: "Pay", c: "bg-amber-50 text-amber-900", x: 10, y: 50 },
                { l: "Save", c: "bg-rose-50 text-rose-800", x: 40, y: 40 },
              ].map((b, i) => (
                <motion.div
                  key={b.l}
                  initial={{ opacity: 0, x: b.x, y: b.y, scale: 0.4, rotate: i % 2 ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 160,
                    damping: 12,
                    delay: 1.05 + i * 0.07,
                  }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className={`cursor-default rounded-xl py-2.5 text-[10px] font-bold ${b.c}`}
                >
                  {b.l}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.4, type: "spring", stiffness: 80, damping: 14 }}
              className="mt-4 origin-left"
            >
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "78%" }}
                  transition={{ delay: 1.55, duration: 1.1, ease: "easeOut" }}
                />
              </div>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Live engagement
              </p>
            </motion.div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
