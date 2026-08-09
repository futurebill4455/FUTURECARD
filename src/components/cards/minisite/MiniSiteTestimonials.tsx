"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DEFAULT_TESTIMONIALS,
  type MiniSiteTestimonial,
} from "@/data/minisite-defaults";

export function MiniSiteTestimonials({
  accent,
  items = DEFAULT_TESTIMONIALS,
}: {
  accent: string;
  items?: MiniSiteTestimonial[];
}) {
  const [index, setIndex] = useState(0);
  const current = items[index] || items[0];

  function prev() {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }
  function next() {
    setIndex((i) => (i + 1) % items.length);
  }

  if (!current) return null;

  return (
    <section id="reviews" className="scroll-mt-24 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
          Social proof
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold text-slate-50 sm:text-3xl">
          Client voices
        </h2>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-panel backdrop-blur-2xl sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-slate-950"
                  style={{
                    background: `linear-gradient(145deg, ${accent}, ${accent}aa)`,
                  }}
                >
                  {current.initials}
                </div>
                <div>
                  <p className="font-display font-bold text-slate-50">
                    {current.name}
                  </p>
                  <p className="text-xs text-slate-400">{current.role}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5 text-cyan-300/90" aria-label={`${current.rating} stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < current.rating ? "opacity-100" : "opacity-25"}>
                    ★
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300/90 sm:text-[15px]">
                “{current.quote}”
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {items.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`Go to review ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                      : "w-1.5 bg-white/25"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <NavBtn label="Previous review" onClick={prev}>
                ←
              </NavBtn>
              <NavBtn label="Next review" onClick={next}>
                →
              </NavBtn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NavBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm text-slate-200 transition hover:bg-white/10"
    >
      {children}
    </button>
  );
}
