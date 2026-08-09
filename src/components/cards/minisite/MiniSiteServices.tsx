"use client";

import { motion } from "framer-motion";
import type { ICard, IServiceItem } from "@/types/card.types";
import { matchServiceCategory } from "@/lib/service-categories";
import { cn } from "@/lib/utils";

export function MiniSiteServices({
  card,
  accent,
  onSelect,
  eyebrow = "Capabilities",
  title = "Services & solutions",
  subtitle = "A flexible catalog across insurance, finance, travel, technology, and more — tailored to this profile.",
}: {
  card: ICard;
  accent: string;
  onSelect: (service: IServiceItem) => void;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  const services = card.services?.filter((s) => s.title.trim()) ?? [];
  if (!services.length) return null;

  return (
    <section id="services" className="scroll-mt-24 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold text-slate-50 sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-400">
          {subtitle}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-h-[9.5rem]">
          {services.map((svc, i) => {
            const cat = matchServiceCategory(svc.title);
            return (
              <motion.button
                key={svc.id}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  boxShadow: `0 18px 40px rgba(0,0,0,0.35), 0 0 0 1px ${accent}55, 0 0 28px ${accent}33`,
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(svc)}
                className={cn(
                  "group relative flex h-full min-h-[9.5rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left shadow-panel backdrop-blur-xl transition-[border-color] duration-300 hover:border-cyan-300/35",
                )}
                style={{
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-40 blur-2xl transition group-hover:opacity-70"
                  style={{ backgroundColor: cat.accent }}
                />
                  <div className="relative flex h-full min-h-0 flex-1 items-start gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 text-lg font-bold text-white shadow-inner"
                      style={{
                        background: `linear-gradient(145deg, ${cat.accent}99, ${accent}55)`,
                        boxShadow: `0 0 20px ${cat.accent}33`,
                      }}
                    >
                      {(svc.title || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                      <span
                        className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-100/70"
                      >
                        {cat.short}
                      </span>
                      <h3 className="mt-1.5 font-display text-base font-bold text-slate-50">
                        {svc.title}
                      </h3>
                      {svc.price ? (
                        <p
                          className="mt-0.5 font-mono text-sm font-semibold"
                          style={{ color: cat.accent }}
                        >
                          {svc.price}
                        </p>
                      ) : null}
                      {svc.description ? (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                          {svc.description}
                        </p>
                      ) : null}
                      <span
                        className="mt-auto inline-flex items-center gap-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-cyan-200/80 transition group-hover:gap-2"
                      >
                        View details
                        <span aria-hidden>→</span>
                      </span>
                    </div>
                  </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
