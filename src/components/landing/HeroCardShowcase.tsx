"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Phone,
  MessageCircle,
  IndianRupee,
  Share2,
  Sparkles,
} from "lucide-react";
import { TiltCard } from "@/components/landing/TiltCard";
import { HolographicAvatar } from "@/components/cards/HolographicAvatar";

const ACCENT = "#22d3ee";
const QR_SRC =
  "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" +
  encodeURIComponent("https://futurecard.online/c/aria");

const SCENES = [
  {
    id: "hero",
    title: "Holographic identity",
    caption: "Avatar, verified name, and live status — just like the real card.",
  },
  {
    id: "identity",
    title: "Smart identity card",
    caption: "QR, Save, Share, Call, and WhatsApp in one glass panel.",
  },
  {
    id: "stats",
    title: "Live stats",
    caption: "Experience, clients, partners — numbers that sell.",
  },
  {
    id: "why",
    title: "Why choose you",
    caption: "Trust points visitors can scan in seconds.",
  },
  {
    id: "services",
    title: "Services catalog",
    caption: "Tap a service, send an enquiry, close the loop.",
  },
  {
    id: "pay",
    title: "Pay & connect",
    caption: "UPI, WhatsApp, and call — one tap from the card.",
  },
  {
    id: "qr",
    title: "Scan to connect",
    caption: "QR always points at your live futurecard.online link.",
  },
] as const;

const DWELL_MS = 3400;

export function HeroCardShowcase() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const scene = SCENES[index];

  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, DWELL_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused]);

  return (
    <div
      className="relative mx-auto w-full max-w-[440px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-cyan-400/25 via-teal-500/10 to-violet-500/20 blur-3xl sm:-inset-12" />

      <div className="relative flex items-end justify-center gap-0 sm:gap-1">
        <div className="relative z-10 w-[min(100%,280px)] sm:w-[300px] lg:w-[318px]">
          <TiltCard maxTilt={8} className="will-change-transform">
            <PhoneFrame>
              <motion.div
                animate={{ y: `${-index * 100}%` }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                }
                className="flex h-full flex-col"
              >
                <HeroScene />
                <IdentityScene />
                <StatsScene />
                <WhyScene />
                <ServicesScene />
                <PayScene />
                <QrScene />
              </motion.div>
              {!reduce ? <SwipeFinger key={index} /> : null}
            </PhoneFrame>
          </TiltCard>
        </div>

        <div className="relative z-20 -ml-8 hidden w-[7.25rem] shrink-0 self-end sm:block lg:-ml-4 lg:w-36">
          <div className="relative h-[380px] lg:h-[420px]">
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute left-1/2 top-6 z-10 hidden w-max -translate-x-1/2 rounded-2xl rounded-bl-sm border border-cyan-400/25 bg-slate-950/85 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-100 shadow-lg backdrop-blur-md lg:block"
            >
              {scene.title}
            </motion.div>
            <GuideCharacter sceneIndex={index} />
          </div>
        </div>

        {/* Mobile: character peeks from the right without crowding the phone */}
        <div className="pointer-events-none absolute -right-1 bottom-20 h-40 w-[5.5rem] sm:hidden">
          <GuideCharacter sceneIndex={index} compact />
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-col items-center gap-2 px-8 sm:px-16">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
          {scene.title}
        </p>
        <p className="max-w-[18rem] text-center text-xs leading-relaxed text-teal-100/65">
          {scene.caption}
        </p>
        <div className="mt-1 flex flex-wrap justify-center gap-1.5">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.title}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-cyan-300"
                  : "w-1.5 bg-white/25 hover:bg-white/45"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[2rem] bg-gradient-to-b from-white/25 via-white/10 to-white/10 p-[2px] shadow-[0_40px_90px_-28px_rgba(0,0,0,0.75)]">
      <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#050b12]">
        <div className="relative flex items-center justify-between px-5 pt-3">
          <span className="text-[10px] font-semibold tabular-nums text-slate-400">
            9:41
          </span>
          <div className="absolute left-1/2 top-2 h-5 w-[5.5rem] -translate-x-1/2 rounded-full bg-black" />
          <span className="text-[10px] font-semibold text-slate-400">5G</span>
        </div>
        <div className="relative h-[400px] overflow-hidden sm:h-[430px] lg:h-[448px]">
          <div className="pointer-events-none absolute inset-0 z-0 ambient-grid opacity-30" />
          <div className="relative z-[1] h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SwipeFinger() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, y: 72, x: 18 }}
      animate={{ opacity: [0, 0.9, 0], y: [72, 18, -8], x: [18, 10, 8] }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute bottom-8 right-6 z-20"
    >
      <div className="h-8 w-8 rounded-full border border-cyan-200/50 bg-cyan-300/20 shadow-[0_0_18px_rgba(34,211,238,0.45)] backdrop-blur-sm" />
    </motion.div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full shrink-0 flex-col px-3.5 py-3">
      {children}
    </div>
  );
}

function HeroScene() {
  return (
    <Screen>
      <div className="flex h-full flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
          <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-100">
            FutureCard
          </span>
          <span className="h-1 w-1 rounded-full bg-cyan-400/60" />
          <span className="text-[8px] font-semibold uppercase tracking-wider text-cyan-200/70">
            Verified
          </span>
        </div>
        <div className="mt-2">
          <HolographicAvatar
            alt="Aria Mehta"
            fallbackLetter="A"
            accent={ACCENT}
            size={72}
            showStatus
          />
        </div>
        <h3 className="-mt-1 flex items-center gap-1 font-display text-lg font-bold text-slate-50">
          Aria Mehta
          <BadgeCheck className="h-4 w-4 fill-sky-500 text-white" />
        </h3>
        <p className="text-[11px] text-cyan-100/65">Wealth advisor</p>
        <p className="mt-2 max-w-[14rem] text-[10px] leading-relaxed text-slate-400">
          Smart solutions for protection, growth and a better future.
        </p>
        <div className="mt-auto grid w-full grid-cols-2 gap-1.5 pb-1">
          <div className="rounded-xl bg-cyan-400 py-2 text-center text-[10px] font-bold text-slate-950">
            Save contact
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 py-2 text-center text-[10px] font-bold text-slate-100">
            Share card
          </div>
        </div>
      </div>
    </Screen>
  );
}

function IdentityScene() {
  return (
    <Screen>
      <p className="text-center font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-300/55">
        Smart digital identity
      </p>
      <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-[#07141c] to-slate-950 p-3.5 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]">
        <div className="pointer-events-none absolute inset-0 ambient-grid opacity-30" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-cyan-300/50">
              FutureCard
            </p>
            <h3 className="mt-0.5 flex items-center gap-1 font-display text-[15px] font-bold text-slate-50">
              Aria Mehta
              <BadgeCheck className="h-3.5 w-3.5 fill-sky-500 text-white" />
            </h3>
            <p className="text-[10px] text-cyan-100/60">Wealth advisor</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={QR_SRC} alt="" className="h-11 w-11 rounded" />
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-2 gap-1.5">
          <MiniField label="Phone" value="+91 98765 43210" />
          <MiniField label="Email" value="aria@future.card" />
        </div>
        <div className="relative mt-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-cyan-200">
            <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-300" />
            NFC Ready
          </span>
        </div>
        <div className="relative mt-3 grid grid-cols-5 gap-1">
          {["Save", "Share", "QR", "Call", "WA"].map((l, i) => (
            <div
              key={l}
              className={`rounded-lg py-2 text-center text-[8px] font-bold ${
                i === 0
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-200"
              }`}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function StatsScene() {
  const items = [
    { n: "12+", l: "Years" },
    { n: "500+", l: "Clients" },
    { n: "40+", l: "Partners" },
    { n: "24/7", l: "Support" },
  ];
  return (
    <Screen>
      <p className="text-center font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-300/55">
        Impact
      </p>
      <h3 className="mt-1 text-center font-display text-base font-bold text-slate-50">
        Stats that sell
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((s) => (
          <div
            key={s.l}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center backdrop-blur-xl"
          >
            <p className="font-mono text-xl font-semibold text-cyan-300">{s.n}</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              {s.l}
            </p>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function WhyScene() {
  const items = [
    { t: "Client first", d: "Advice that fits your life." },
    { t: "Transparent", d: "Clear options, no jargon." },
    { t: "Best plans", d: "Compared across partners." },
    { t: "Claim help", d: "Support when it matters." },
  ];
  return (
    <Screen>
      <p className="text-center font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-300/55">
        Trust
      </p>
      <h3 className="mt-1 text-center font-display text-base font-bold text-slate-50">
        Why choose us
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {items.map((item) => (
          <div
            key={item.t}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5"
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold text-slate-950"
              style={{ background: ACCENT }}
            >
              ✓
            </div>
            <p className="mt-1.5 text-[11px] font-bold text-slate-100">{item.t}</p>
            <p className="mt-0.5 text-[9px] leading-snug text-slate-400">{item.d}</p>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function ServicesScene() {
  const items = [
    { t: "Term cover", p: "From ₹499 / mo" },
    { t: "Health plan", p: "Family floater" },
    { t: "Wealth SIP", p: "Custom portfolio" },
  ];
  return (
    <Screen>
      <p className="text-center font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-300/55">
        Catalog
      </p>
      <h3 className="mt-1 text-center font-display text-base font-bold text-slate-50">
        Services
      </h3>
      <div className="mt-3 space-y-2">
        {items.map((s) => (
          <div
            key={s.t}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
          >
            <div>
              <p className="text-[13px] font-semibold text-slate-50">{s.t}</p>
              <p className="text-[10px] text-slate-400">{s.p}</p>
            </div>
            <Sparkles className="h-4 w-4 text-cyan-300" />
          </div>
        ))}
      </div>
    </Screen>
  );
}

function PayScene() {
  return (
    <Screen>
      <p className="text-center font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-300/55">
        Connect
      </p>
      <h3 className="mt-1 text-center font-display text-base font-bold text-slate-50">
        Pay & reach
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { Icon: Phone, l: "Call" },
          { Icon: MessageCircle, l: "WhatsApp" },
          { Icon: IndianRupee, l: "Pay UPI" },
          { Icon: Share2, l: "Share" },
        ].map(({ Icon, l }) => (
          <div
            key={l}
            className="flex flex-col items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 py-5"
          >
            <Icon className="h-5 w-5 text-cyan-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
              {l}
            </span>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function QrScene() {
  return (
    <Screen>
      <div className="flex h-full flex-col items-center justify-center rounded-[1.4rem] border border-cyan-400/25 bg-gradient-to-b from-slate-950 via-[#041018] to-slate-950 px-4 text-center">
        <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-300/70">
          Digital identity terminal
        </p>
        <h3 className="mt-1 font-display text-base font-bold text-slate-50">
          Scan to connect
        </h3>
        <div className="mt-4 rounded-[1.1rem] bg-gradient-to-br from-cyan-400/40 via-violet-400/20 to-transparent p-[2px]">
          <div className="rounded-[1rem] bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={QR_SRC} alt="" className="h-28 w-28 rounded-lg" />
          </div>
        </div>
        <p className="mt-3 break-all font-mono text-[9px] text-slate-500">
          futurecard.online/c/aria
        </p>
      </div>
    </Screen>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.04] px-2 py-1.5 text-left">
      <div className="text-[8px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="truncate text-[10px] text-slate-200">{value}</div>
    </div>
  );
}

/** Stylized person who swipes as the card scrolls. */
function GuideCharacter({
  sceneIndex,
  compact = false,
}: {
  sceneIndex: number;
  compact?: boolean;
}) {
  const swipe = sceneIndex % 2 === 0 ? 10 : -14;

  return (
    <motion.svg
      viewBox="0 0 140 300"
      className={compact ? "h-full w-full" : "h-full w-full drop-shadow-2xl"}
      aria-hidden
    >
      <motion.g
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="78" cy="286" rx="32" ry="8" fill="rgba(15,23,42,0.5)" />

        {/* legs */}
        <path
          d="M58 210 L52 278 L66 278 L70 214 Z"
          fill="#0f172a"
        />
        <path
          d="M86 210 L92 278 L106 278 L98 214 Z"
          fill="#0f172a"
        />
        <ellipse cx="58" cy="280" rx="12" ry="5" fill="#134e4a" />
        <ellipse cx="100" cy="280" rx="12" ry="5" fill="#134e4a" />

        {/* torso */}
        <path
          d="M52 148 C50 198 56 214 70 220 L96 220 C110 212 114 190 110 148 C96 140 66 140 52 148 Z"
          fill="#0f766e"
        />
        <path
          d="M58 150 C68 144 96 144 106 154 L102 198 C84 208 70 202 62 188 Z"
          fill="#14b8a6"
        />

        {/* rear arm */}
        <path
          d="M104 158 C122 168 128 198 118 228"
          fill="none"
          stroke="#f0c7a8"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* scrolling arm */}
        <motion.g
          animate={{ rotate: swipe }}
          transition={{ type: "spring", stiffness: 70, damping: 11 }}
          style={{ transformOrigin: "54px 160px" }}
        >
          <path
            d="M54 160 C28 172 12 198 18 226"
            fill="none"
            stroke="#f0c7a8"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx="16" cy="230" r="9" fill="#f0c7a8" />
          <circle cx="12" cy="236" r="4.5" fill="#e8b894" />
        </motion.g>

        {/* neck + head */}
        <rect x="72" y="118" width="14" height="16" rx="5" fill="#f3d0b5" />
        <circle cx="80" cy="102" r="30" fill="#f3d0b5" />
        <path
          d="M52 96 C56 62 104 58 110 98 C98 84 64 82 52 96"
          fill="#1e293b"
        />
        <path
          d="M58 78 Q80 68 100 82"
          fill="none"
          stroke="#334155"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse cx="70" cy="104" rx="3.4" ry="4" fill="#0f172a" />
        <ellipse cx="92" cy="104" rx="3.4" ry="4" fill="#0f172a" />
        <circle cx="71.2" cy="102.6" r="1" fill="#fff" />
        <circle cx="93.2" cy="102.6" r="1" fill="#fff" />
        <path
          d="M74 118 Q80 123 86 118"
          fill="none"
          stroke="#b45309"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </motion.g>
    </motion.svg>
  );
}
