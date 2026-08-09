"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "profile", label: "Profile" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "reviews", label: "Reviews" },
  { id: "connect", label: "Contact" },
] as const;

export function MiniSiteNav() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  }

  return (
    <>
      {/* Desktop floating glass dock */}
      <nav
        aria-label="Site"
        className="pointer-events-none fixed inset-x-0 top-4 z-40 hidden justify-center md:flex"
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/55 px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[11px] font-semibold tracking-wide transition",
                  isActive
                    ? "text-cyan-50"
                    : "text-slate-400 hover:text-slate-100",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="minisite-nav-pill"
                    className="absolute inset-0 rounded-full border border-cyan-400/30 bg-cyan-400/15 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-[1]">{s.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom dock */}
      <nav
        aria-label="Mobile"
        className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 md:hidden"
      >
        <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-0.5 rounded-[1.35rem] border border-white/10 bg-slate-950/70 px-1.5 py-1.5 shadow-[0_16px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                className={cn(
                  "relative flex min-h-11 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-1.5 text-[9px] font-semibold uppercase tracking-wider transition",
                  isActive ? "text-cyan-100" : "text-slate-500",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="minisite-mobile-pill"
                    className="absolute inset-0 rounded-2xl bg-cyan-400/12"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative mb-0.5 h-1 w-1 rounded-full",
                    isActive
                      ? "bg-cyan-300 shadow-[0_0_8px_#22d3ee]"
                      : "bg-transparent",
                  )}
                />
                <span className="relative max-w-[3.2rem] truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
