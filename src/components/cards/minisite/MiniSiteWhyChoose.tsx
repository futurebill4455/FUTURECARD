"use client";

import { motion } from "framer-motion";
import { DEFAULT_WHY_CHOOSE, type MiniSiteWhyItem } from "@/data/minisite-defaults";

export function MiniSiteWhyChoose({
  accent,
  items = DEFAULT_WHY_CHOOSE,
  eyebrow = "Trust",
  title = "Why choose me",
  subtitle,
}: {
  accent: string;
  items?: MiniSiteWhyItem[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold text-slate-50 sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-400">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.25) }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 text-sm font-bold text-slate-950"
                style={{
                  background: `linear-gradient(145deg, ${accent}, ${accent}99)`,
                  boxShadow: `0 0 18px ${accent}33`,
                }}
                aria-hidden
              >
                ✓
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-slate-50">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
