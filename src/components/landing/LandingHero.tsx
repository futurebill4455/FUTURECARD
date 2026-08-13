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
import { Sparkles } from "lucide-react";
import { TypewriterHeadline } from "@/components/landing/TypewriterHeadline";
import { VerifiedByBrand } from "@/components/shared/VerifiedByBrand";
import { KineticWords } from "@/components/landing/motion";
import { FutureShieldCardPreview } from "@/components/landing/FutureShieldCardPreview";
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
      className="relative min-h-[100svh] overflow-x-clip overflow-y-hidden pt-8 sm:pt-4"
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
        className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:pb-20 lg:pt-32"
      >
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-8">
          <motion.div style={{ y: yCopy }} className="relative z-10 min-w-0">
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

          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ ...springSoft, delay: 0.4 }}
            style={{ y: yCard, scale: scaleStage }}
            className="relative mx-auto w-full min-w-0 max-w-full overflow-x-clip [perspective:1400px] max-md:[perspective:none]"
          >
            <FutureShieldCardPreview />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}