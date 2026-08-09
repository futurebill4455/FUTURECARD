"use client";

import { motion } from "framer-motion";
import {
  DEFAULT_SMART_FEATURES,
  type MiniSiteFeature,
} from "@/data/minisite-defaults";

export function MiniSiteFeatures({
  accent,
  items = DEFAULT_SMART_FEATURES,
}: {
  accent: string;
  items?: MiniSiteFeature[];
}) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
          Platform
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold text-slate-50 sm:text-3xl">
          Smart features
        </h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.28) }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
            >
              <div
                className="mb-3 h-1 w-8 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${accent}, transparent)`,
                }}
              />
              <h3 className="font-display text-sm font-bold text-slate-50">
                {f.title}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
