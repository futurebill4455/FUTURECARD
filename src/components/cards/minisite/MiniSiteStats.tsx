"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { DEFAULT_MINISITE_STATS, type MiniSiteStat } from "@/data/minisite-defaults";

function AnimatedNumber({
  value,
  suffix = "",
  display,
}: {
  value: number;
  suffix?: string;
  display?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const [text, setText] = useState(display || `0${suffix}`);

  useEffect(() => {
    if (display) {
      setText(display);
      return;
    }
    if (!inView) return;
    if (reduce) {
      setText(`${value}${suffix}`);
      return;
    }
    motionVal.set(0);
    motionVal.set(value);
    const unsub = spring.on("change", (v) => {
      setText(`${Math.round(v)}${suffix}`);
    });
    return () => unsub();
  }, [inView, value, suffix, display, motionVal, spring, reduce]);

  return (
    <span ref={ref} className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
      {text}
    </span>
  );
}

export function MiniSiteStats({
  accent,
  stats = DEFAULT_MINISITE_STATS,
}: {
  accent: string;
  stats?: MiniSiteStat[];
}) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center backdrop-blur-xl"
            style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)` }}
          >
            <div style={{ color: accent }}>
              <AnimatedNumber
                value={s.value}
                suffix={s.suffix}
                display={s.display}
              />
            </div>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
