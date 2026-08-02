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

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const yCard = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yChips = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const yCopy = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.7], [1, 0.35]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const glowBg = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(ellipse 70% 55% at ${Number(x) * 100}% ${Number(y) * 100}%, rgba(15,118,110,0.38), transparent 58%)`,
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
      className="relative min-h-[100svh] overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: orbY, background: glowBg }}
          className="absolute inset-0"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-24 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.28),transparent_65%)] blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.32),transparent_65%)] blur-2xl"
        />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,118,110,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,0.07) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            maskImage:
              "radial-gradient(ellipse 75% 65% at 50% 35%, black, transparent)",
          }}
        />
      </div>

      <motion.div
        style={{ opacity: opacityHero }}
        className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 lg:pb-20 lg:pt-28"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <motion.div
            style={{ y: yCopy }}
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-2xl border border-teal-800/10 bg-white/50 px-3 py-1.5 text-xs font-bold text-teal-800 backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Digital identity, reimagined
            </motion.div>

            <motion.p
              variants={item}
              className="mt-5 font-display text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl"
            >
              Future<span className="text-teal-700">Card</span>
            </motion.p>

            <motion.div variants={item}>
              <TypewriterHeadline />
            </motion.div>

            <motion.p
              variants={item}
              className="mt-5 max-w-lg text-base leading-relaxed text-zinc-600 sm:text-lg"
            >
              One link for Call, WhatsApp, UPI Pay, galleries, and verified
              branding — built for modern Indian businesses.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="group relative overflow-hidden rounded-2xl bg-teal-800 px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_-10px_rgba(15,118,110,0.7)] transition hover:scale-[1.02] hover:bg-teal-900"
              >
                <span className="relative z-10">Get Started Free</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-full" />
              </Link>
              <Link
                href="/dhanya_enterprises"
                className="rounded-2xl border border-teal-800/15 bg-white/55 px-6 py-3.5 text-sm font-bold text-teal-900 shadow-sm backdrop-blur-md transition hover:scale-[1.02] hover:border-teal-700/35 hover:bg-white"
              >
                View Live Demo
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative mx-auto w-full max-w-[380px] [perspective:1200px] lg:max-w-none">
            <motion.div
              style={{ y: yCard }}
              className="relative z-10 mx-auto w-[280px] sm:w-[310px]"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <TiltCard maxTilt={12} className="will-change-transform">
                  <CardMockup />
                </TiltCard>
              </motion.div>
            </motion.div>

            <motion.div
              style={{ y: yChips }}
              className="pointer-events-none absolute inset-0 z-20"
            >
              <FloatingChip
                className="absolute -left-2 top-14 hidden sm:block lg:-left-8"
                delay={0}
                icon={Phone}
                label="Call"
                color="bg-sky-100/90 text-sky-800"
              />
              <FloatingChip
                className="absolute -right-1 top-24 sm:-right-6 lg:right-0"
                delay={0.4}
                icon={MessageCircle}
                label="WhatsApp"
                color="bg-emerald-100/90 text-emerald-800"
              />
              <FloatingChip
                className="absolute bottom-28 -left-6 sm:-left-10"
                delay={0.8}
                icon={IndianRupee}
                label="Pay Now"
                color="bg-amber-100/90 text-amber-900"
              />
              <FloatingChip
                className="absolute bottom-8 -right-3 sm:right-2"
                delay={1.1}
                icon={Images}
                label="Gallery"
                color="bg-rose-100/90 text-rose-800"
              />
            </motion.div>
          </div>
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
}: {
  icon: typeof Phone;
  label: string;
  color: string;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -8, 0],
      }}
      transition={{
        opacity: { delay: 0.5 + delay, duration: 0.4 },
        scale: { delay: 0.5 + delay, duration: 0.4 },
        y: {
          delay: 0.8 + delay,
          duration: 4 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className={className}
    >
      <div
        className={`flex items-center gap-2 rounded-2xl border border-white/80 px-3 py-2 text-xs font-bold shadow-[0_12px_30px_-8px_rgba(15,80,70,0.35)] backdrop-blur-md ${color}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
    </motion.div>
  );
}

function CardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-[2.5rem] bg-gradient-to-br from-teal-400/35 via-emerald-300/15 to-amber-400/30 blur-3xl" />
      <div className="landing-glow-border relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/85 shadow-[0_40px_90px_-24px_rgba(15,80,70,0.55)] backdrop-blur-xl">
        <div className="relative h-36 bg-gradient-to-br from-teal-900 via-teal-700 to-emerald-600">
          <motion.div
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.35),transparent_50%)]"
          />
        </div>
        <div className="relative -mt-12 px-5 pb-6 text-center">
          <div className="mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-[1.4rem] border-4 border-white bg-gradient-to-br from-teal-50 to-teal-100 shadow-lg">
            <span className="font-display text-2xl font-extrabold text-teal-800">
              DE
            </span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <h2 className="font-display text-xl font-bold text-zinc-900">
              Dhanya Enterprises
            </h2>
            <BadgeCheck className="h-5 w-5 fill-sky-500 text-white" />
          </div>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            Wholesale & Retail · GST Ready
          </p>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {[
              { l: "Call", c: "bg-sky-50 text-sky-800" },
              { l: "Chat", c: "bg-emerald-50 text-emerald-800" },
              { l: "Pay", c: "bg-amber-50 text-amber-900" },
              { l: "Save", c: "bg-rose-50 text-rose-800" },
            ].map((b, i) => (
              <motion.div
                key={b.l}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                whileHover={{ scale: 1.06 }}
                className={`cursor-default rounded-xl py-2.5 text-[10px] font-bold ${b.c}`}
              >
                {b.l}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "72%", "68%", "72%"] }}
              transition={{ duration: 3.2, delay: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Live engagement
          </p>
        </div>
      </div>
    </div>
  );
}
