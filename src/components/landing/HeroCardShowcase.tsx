"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  IndianRupee,
  Share2,
  Sparkles,
} from "lucide-react";
import { TiltCard } from "@/components/landing/TiltCard";
import { HolographicAvatar } from "@/components/cards/HolographicAvatar";
import { VerifiedBadge } from "@/components/cards/VerifiedBadge";
import { TypewriterName } from "@/components/cards/minisite/TypewriterName";
import { PremiumMotionButton } from "@/components/cards/minisite/PremiumMotionButton";
import {
  PLATFORM_BRAND,
  PLATFORM_TAGLINE,
} from "@/lib/service-categories";
import {
  DEFAULT_CARD_STATS,
  DEFAULT_PRIMARY_CTAS,
  DEFAULT_WHY_CHOOSE_ITEMS,
} from "@/types/card.types";

const ACCENT = "#22d3ee";
const DEMO_URL = "https://futurecard.online/c/futureshield";
const QR_SRC =
  "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" +
  encodeURIComponent(DEMO_URL);

const SCENES = [
  {
    id: "hero",
    nav: "home",
    title: "Future Shield",
    caption: "Protect today, secure tomorrow — holographic identity, live.",
  },
  {
    id: "identity",
    nav: "profile",
    title: "Smart identity card",
    caption: "QR, Save, Share, Call, and WhatsApp in one glass panel.",
  },
  {
    id: "stats",
    nav: "profile",
    title: "Live stats",
    caption: "Years, clients, partners, and 24/7 support — at a glance.",
  },
  {
    id: "why",
    nav: "profile",
    title: "Why choose us",
    caption: "Trust points visitors can scan in seconds.",
  },
  {
    id: "services",
    nav: "services",
    title: "Services & solutions",
    caption: "A catalog clients can tap and enquire about.",
  },
  {
    id: "pay",
    nav: "contact",
    title: "Pay & connect",
    caption: "UPI, WhatsApp, and call — one tap from the card.",
  },
  {
    id: "qr",
    nav: "contact",
    title: "Scan to connect",
    caption: "QR always points at your live futurecard.online link.",
  },
] as const;

const DOCK = [
  { id: "home", label: "Home" },
  { id: "profile", label: "Profile" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
] as const;

const DWELL_MS = 3600;

function noop() {
  /* decorative preview */
}

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
      className="relative mx-auto w-full max-w-[520px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-cyan-400/25 via-teal-500/10 to-violet-500/20 blur-3xl sm:-inset-10" />

      <div className="relative flex items-end justify-center gap-0 sm:gap-1">
        <div className="relative z-10 w-[min(100%-3.25rem,248px)] sm:w-[min(100%-6.5rem,300px)] lg:w-[318px]">
          <TiltCard maxTilt={8} className="will-change-transform">
            <PhoneFrame nav={scene.nav} onNav={(id) => {
              const next = SCENES.findIndex((s) => s.nav === id);
              if (next >= 0) setIndex(next);
            }}>
              <motion.div
                animate={{ y: `${-index * 100}%` }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.95, ease: [0.22, 1, 0.36, 1] }
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

        <div className="relative z-20 -ml-2 w-[3.15rem] shrink-0 sm:-ml-3 sm:w-[6.5rem] lg:w-[7.75rem]">
          <div className="h-[220px] sm:h-[380px] lg:h-[430px]">
            <GuideCharacter sceneIndex={index} />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-col items-center gap-2 px-4 sm:px-12">
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

function PhoneFrame({
  children,
  nav,
  onNav,
}: {
  children: React.ReactNode;
  nav: string;
  onNav: (id: string) => void;
}) {
  return (
    <div className="relative rounded-[2rem] bg-gradient-to-b from-white/25 via-white/10 to-white/10 p-[2px] shadow-[0_40px_90px_-28px_rgba(0,0,0,0.75)]">
      <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#020617]">
        <div className="relative flex items-center justify-between px-5 pt-3">
          <span className="text-[10px] font-semibold tabular-nums text-slate-400">
            9:41
          </span>
          <div className="absolute left-1/2 top-2 h-5 w-[5.5rem] -translate-x-1/2 rounded-full bg-black" />
          <span className="text-[10px] font-semibold text-slate-400">5G</span>
        </div>
        <div className="relative h-[360px] overflow-hidden sm:h-[400px] lg:h-[428px]">
          <div className="pointer-events-none absolute inset-0 z-0 ambient-grid opacity-30" />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl"
          />
          <div className="relative z-[1] h-full">{children}</div>
        </div>
        <div className="border-t border-white/10 bg-slate-950/80 px-1.5 py-1.5">
          <div className="flex items-center justify-between">
            {DOCK.map((item) => {
              const active = item.id === nav;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNav(item.id)}
                  className={`relative flex min-h-9 flex-1 flex-col items-center justify-center rounded-xl py-1 text-[8px] font-semibold uppercase tracking-wider sm:text-[9px] ${
                    active ? "text-cyan-100" : "text-slate-500"
                  }`}
                >
                  {active ? (
                    <span className="absolute inset-0 rounded-xl bg-cyan-400/12" />
                  ) : null}
                  <span
                    className={`relative mb-0.5 h-1 w-1 rounded-full ${
                      active ? "bg-cyan-300 shadow-[0_0_8px_#22d3ee]" : "bg-transparent"
                    }`}
                  />
                  <span className="relative">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SwipeFinger() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, y: 64, x: 16 }}
      animate={{ opacity: [0, 0.9, 0], y: [64, 16, -6], x: [16, 10, 8] }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute bottom-16 right-6 z-20"
    >
      <div className="h-7 w-7 rounded-full border border-cyan-200/50 bg-cyan-300/20 shadow-[0_0_18px_rgba(34,211,238,0.45)] backdrop-blur-sm" />
    </motion.div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full shrink-0 flex-col px-3 py-2.5 sm:px-3.5 sm:py-3">
      {children}
    </div>
  );
}

function HeroScene() {
  return (
    <Screen>
      <div className="flex h-full flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]">
          <span className="font-display text-[8px] font-bold uppercase tracking-[0.16em] text-cyan-50/90 sm:text-[9px]">
            {PLATFORM_BRAND}
          </span>
          <span className="h-1 w-1 rounded-full bg-cyan-400/50" />
          <span className="inline-flex items-center gap-0.5 text-[7px] font-semibold uppercase tracking-wider text-cyan-200/70 sm:text-[8px]">
            Verified Profile
            <VerifiedBadge size="sm" />
          </span>
        </div>

        <p className="mt-1.5 font-mono text-[7px] uppercase tracking-[0.22em] text-cyan-200/45 sm:text-[8px]">
          {PLATFORM_TAGLINE}
        </p>

        <div className="mt-1">
          <HolographicAvatar
            alt={PLATFORM_BRAND}
            fallbackLetter="F"
            accent={ACCENT}
            size={56}
            showStatus
          />
        </div>

        <h3 className="-mt-2 inline-flex items-center justify-center gap-1 font-display text-[15px] font-bold tracking-tight text-slate-50 sm:-mt-1 sm:text-lg">
          <TypewriterName
            text={PLATFORM_BRAND}
            msPerChar={48}
            startDelay={200}
            className="font-display text-[15px] font-bold tracking-tight text-slate-50 sm:text-lg"
          />
          <VerifiedBadge size="md" className="relative top-px" />
        </h3>

        <p className="mt-0.5 text-[10px] font-medium text-cyan-100/70 sm:text-[11px]">
          Digital protection studio
        </p>
        <p className="mt-1.5 line-clamp-2 max-w-[15rem] text-[10px] leading-relaxed text-slate-300/75 sm:text-[11px]">
          “Smart solutions for protection, growth and a better future.”
        </p>

        <div className="mt-auto grid w-full grid-cols-2 gap-1.5 pb-0.5 sm:grid-cols-2">
          {DEFAULT_PRIMARY_CTAS.map((cta) => (
            <PremiumMotionButton
              key={cta.id}
              accent={ACCENT}
              onClick={noop}
              className="flex min-h-[2.15rem] w-full items-center justify-center px-1 py-2 text-[8px] sm:min-h-[2.4rem] sm:text-[9px]"
            >
              {cta.label}
            </PremiumMotionButton>
          ))}
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
      <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-[#07141c] to-slate-950 p-3 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]">
        <div className="pointer-events-none absolute inset-0 ambient-grid opacity-30" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-cyan-300/50">
              {PLATFORM_BRAND}
            </p>
            <h3 className="mt-0.5 inline-flex items-center gap-1 font-display text-[14px] font-bold text-slate-50">
              {PLATFORM_BRAND}
              <VerifiedBadge size="sm" />
            </h3>
            <p className="text-[10px] text-cyan-100/60">Protect today, secure tomorrow</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={QR_SRC} alt="" className="h-11 w-11 rounded" />
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-2 gap-1.5">
          <MiniField label="Phone" value="+91 90000 00000" />
          <MiniField label="Web" value="futurecard.online" />
        </div>
        <div className="relative mt-3">
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
  return (
    <Screen>
      <p className="text-center font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-300/55">
        Impact
      </p>
      <h3 className="mt-1 text-center font-display text-base font-bold text-slate-50">
        Stats that sell
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {DEFAULT_CARD_STATS.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-2.5 py-3.5 text-center backdrop-blur-xl"
          >
            <p className="font-mono text-lg font-semibold text-cyan-300 sm:text-xl">
              {s.display || `${s.value}${s.suffix || ""}`}
            </p>
            <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[9px]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function WhyScene() {
  return (
    <Screen>
      <p className="text-center font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-300/55">
        Trust
      </p>
      <h3 className="mt-1 text-center font-display text-base font-bold text-slate-50">
        Why choose us
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {DEFAULT_WHY_CHOOSE_ITEMS.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5"
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold text-slate-950"
              style={{ background: ACCENT }}
            >
              ✓
            </div>
            <p className="mt-1.5 text-[11px] font-bold leading-tight text-slate-100">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function ServicesScene() {
  const items = [
    { t: "Life cover", p: "Protect today" },
    { t: "Health plan", p: "Family first" },
    { t: "Wealth SIP", p: "Secure tomorrow" },
  ];
  return (
    <Screen>
      <p className="text-center font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-300/55">
        Capabilities
      </p>
      <h3 className="mt-1 text-center font-display text-base font-bold text-slate-50">
        Services & solutions
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
        Connect with us
      </p>
      <h3 className="mt-1 text-center font-display text-base font-bold text-slate-50">
        One tap to reach out
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
        <div className="mt-3 rounded-[1.1rem] bg-gradient-to-br from-cyan-400/40 via-violet-400/20 to-transparent p-[2px]">
          <div className="rounded-[1rem] bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={QR_SRC} alt="" className="h-24 w-24 rounded-lg sm:h-28 sm:w-28" />
          </div>
        </div>
        <p className="mt-2 break-all font-mono text-[8px] text-slate-500 sm:text-[9px]">
          futurecard.online/c/futureshield
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

/** Small guide who swipes as the Future Shield card scrolls. */
function GuideCharacter({ sceneIndex }: { sceneIndex: number }) {
  const swipe = sceneIndex % 2 === 0 ? 12 : -16;

  return (
    <motion.svg
      viewBox="0 0 140 300"
      className="h-full w-full drop-shadow-2xl"
      aria-hidden
    >
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="78" cy="288" rx="30" ry="7" fill="rgba(15,23,42,0.5)" />

        <path d="M58 214 L52 278 L66 278 L70 216 Z" fill="#0f172a" />
        <path d="M86 214 L92 278 L106 278 L98 216 Z" fill="#0f172a" />
        <ellipse cx="58" cy="280" rx="11" ry="4.5" fill="#134e4a" />
        <ellipse cx="100" cy="280" rx="11" ry="4.5" fill="#134e4a" />

        <path
          d="M52 150 C50 198 56 214 70 222 L96 222 C110 214 114 192 110 150 C96 142 66 142 52 150 Z"
          fill="#0f766e"
        />
        <path
          d="M58 152 C68 146 96 146 106 156 L102 200 C84 210 70 204 62 190 Z"
          fill="#14b8a6"
        />
        <circle cx="80" cy="176" r="11" fill="#083344" />
        <path
          d="M80 168 L84 176 L80 184 L76 176 Z"
          fill="#22d3ee"
        />

        <path
          d="M104 160 C122 170 128 200 118 230"
          fill="none"
          stroke="#f0c7a8"
          strokeWidth="11"
          strokeLinecap="round"
        />

        <motion.g
          animate={{ rotate: swipe }}
          transition={{ type: "spring", stiffness: 70, damping: 11 }}
          style={{ transformOrigin: "54px 162px" }}
        >
          <path
            d="M54 162 C26 174 10 200 16 228"
            fill="none"
            stroke="#f0c7a8"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx="14" cy="232" r="9" fill="#f0c7a8" />
          <circle cx="10" cy="238" r="4.2" fill="#e8b894" />
        </motion.g>

        <rect x="72" y="120" width="14" height="16" rx="5" fill="#f3d0b5" />
        <circle cx="80" cy="104" r="29" fill="#f3d0b5" />
        <path d="M52 98 C56 64 104 60 110 100 C98 86 64 84 52 98" fill="#1e293b" />
        <path
          d="M58 80 Q80 70 100 84"
          fill="none"
          stroke="#334155"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse cx="70" cy="106" rx="3.4" ry="4" fill="#0f172a" />
        <ellipse cx="92" cy="106" rx="3.4" ry="4" fill="#0f172a" />
        <circle cx="71.2" cy="104.6" r="1" fill="#fff" />
        <circle cx="93.2" cy="104.6" r="1" fill="#fff" />
        <path
          d="M74 120 Q80 125 86 120"
          fill="none"
          stroke="#b45309"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </motion.g>
    </motion.svg>
  );
}
