"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Package,
  QrCode,
  Images,
  Globe2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KineticWords, burstIn } from "@/components/landing/motion";
import {
  DEFAULT_LANDING_CMS,
  type ILandingFeaturesContent,
  type LandingFeatureIconKey,
} from "@/types/landing-cms.types";

const ICON_MAP: Record<LandingFeatureIconKey, LucideIcon> = {
  badge: BadgeCheck,
  package: Package,
  qr: QrCode,
  images: Images,
  globe: Globe2,
  shield: ShieldCheck,
};

const STYLE_CYCLE = [
  {
    glow: "group-hover:shadow-[0_0_0_1px_rgba(14,165,233,0.4),0_24px_70px_-18px_rgba(14,165,233,0.5)]",
    accent: "from-sky-400/25 via-transparent to-teal-400/15",
    iconBg: "bg-sky-600",
    from: "left" as const,
  },
  {
    glow: "group-hover:shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_24px_70px_-18px_rgba(16,185,129,0.5)]",
    accent: "from-emerald-400/25 to-teal-400/10",
    iconBg: "bg-emerald-700",
    from: "up" as const,
  },
  {
    glow: "group-hover:shadow-[0_0_0_1px_rgba(245,158,11,0.45),0_24px_70px_-18px_rgba(245,158,11,0.5)]",
    accent: "from-amber-400/30 to-orange-400/10",
    iconBg: "bg-amber-600",
    from: "right" as const,
  },
  {
    glow: "group-hover:shadow-[0_0_0_1px_rgba(244,63,94,0.35),0_24px_70px_-18px_rgba(244,63,94,0.45)]",
    accent: "from-rose-400/25 to-teal-400/10",
    iconBg: "bg-rose-600",
    from: "left" as const,
  },
  {
    glow: "group-hover:shadow-[0_0_0_1px_rgba(20,184,166,0.45),0_24px_70px_-18px_rgba(20,184,166,0.5)]",
    accent: "from-teal-400/30 to-cyan-400/10",
    iconBg: "bg-teal-700",
    from: "up" as const,
  },
  {
    glow: "group-hover:shadow-[0_0_0_1px_rgba(15,118,110,0.45),0_28px_80px_-20px_rgba(15,118,110,0.55)]",
    accent: "from-teal-500/25 to-zinc-400/5",
    iconBg: "bg-teal-900",
    from: "right" as const,
  },
];

export function LandingFeatures({
  content = DEFAULT_LANDING_CMS.features,
}: {
  content?: ILandingFeaturesContent;
}) {
  return (
    <section id="features" className="relative scroll-mt-24 px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={burstIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-teal-50 sm:text-4xl">
            <KineticWords text={content.title} />
          </h2>
          <p className="mt-3 text-teal-100/70">
            <KineticWords text={content.subtitle} delay={0.15} />
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {content.items.map((f, i) => {
            const Icon = ICON_MAP[f.icon] || BadgeCheck;
            const style = STYLE_CYCLE[i % STYLE_CYCLE.length]!;
            const x = style.from === "left" ? -70 : style.from === "right" ? 70 : 0;
            const y = style.from === "up" ? 70 : 20;
            return (
              <motion.article
                key={f.id}
                initial={{
                  opacity: 0,
                  x,
                  y,
                  scale: 0.82,
                  rotate: style.from === "left" ? -5 : style.from === "right" ? 5 : 3,
                  filter: "blur(8px)",
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotate: 0,
                  filter: "blur(0px)",
                }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  type: "spring",
                  stiffness: 95,
                  damping: 13,
                  delay: i * 0.05,
                }}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 280, damping: 18 },
                }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-teal-400/15 bg-white/5 p-6 backdrop-blur-md transition-shadow duration-300",
                  style.glow,
                  f.wide ? "md:col-span-2 md:min-h-[230px]" : "md:col-span-1",
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 transition duration-500 group-hover:opacity-100",
                    style.accent,
                  )}
                />
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -left-1/2 top-0 h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[feature-shine_1.1s_ease]" />
                </div>

                <div className="relative flex h-full flex-col">
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0], scale: 1.12 }}
                    transition={{ duration: 0.45 }}
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg",
                      style.iconBg,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="mt-5 font-display text-xl font-bold text-teal-50">
                    {f.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-teal-100/65">
                    {f.description}
                  </p>
                  <div className="mt-4 h-px w-12 origin-left scale-x-0 bg-gradient-to-r from-teal-400 to-amber-400 transition duration-300 group-hover:scale-x-100" />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
