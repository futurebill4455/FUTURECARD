"use client";

import { motion } from "framer-motion";
import { PremiumMotionButton } from "@/components/cards/minisite/PremiumMotionButton";

export function MiniSiteFinalCta({
  accent,
  name,
  onConnect,
  onWhatsApp,
  onCall,
  hasWhatsApp,
  hasCall,
  title,
  subtitle,
  connectLabel = "Let’s Connect",
}: {
  accent: string;
  name: string;
  onConnect: () => void;
  onWhatsApp?: () => void;
  onCall?: () => void;
  hasWhatsApp?: boolean;
  hasCall?: boolean;
  title?: string;
  subtitle?: string;
  connectLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: `${accent}28` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-cyan-300/70"
          style={{
            left: `${12 + i * 14}%`,
            top: `${20 + ((i * 23) % 55)}%`,
            boxShadow: "0 0 10px rgba(34,211,238,0.7)",
          }}
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{
            duration: 4 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.25,
          }}
        />
      ))}

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
          Next step
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          {title || "Let’s build your secure tomorrow"}
        </h2>
        <p className="mt-3 text-sm text-slate-400 sm:text-base">
          {subtitle ||
            `I’m just a message or call away${name ? ` — ${name}` : ""}.`}
        </p>

        <div className="mx-auto mt-8 grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-3 sm:max-w-xl [&>*]:min-h-[3.25rem]">
          <PremiumMotionButton
            accent={accent}
            onClick={onConnect}
            className="flex h-full min-h-[3.25rem] w-full items-center justify-center px-4 py-3.5"
          >
            {connectLabel}
          </PremiumMotionButton>
          {hasWhatsApp ? (
            <PremiumMotionButton
              variant="success"
              onClick={onWhatsApp}
              className="flex h-full min-h-[3.25rem] w-full items-center justify-center px-4 py-3.5"
            >
              WhatsApp
            </PremiumMotionButton>
          ) : null}
          {hasCall ? (
            <PremiumMotionButton
              variant="outline"
              onClick={onCall}
              className="flex h-full min-h-[3.25rem] w-full items-center justify-center px-4 py-3.5"
            >
              Call Now
            </PremiumMotionButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
