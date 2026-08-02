"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Package,
  QrCode,
  Images,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Verified Badges",
    description:
      "Instagram-style blue ticks and custom brand colors that build instant trust.",
    icon: BadgeCheck,
    className: "md:col-span-2 md:min-h-[220px]",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(14,165,233,0.35),0_20px_60px_-20px_rgba(14,165,233,0.45)]",
    accent: "from-sky-400/20 via-transparent to-teal-400/10",
    iconBg: "bg-sky-600",
  },
  {
    title: "WhatsApp Inquiry",
    description:
      "Product catalogs with one-tap Inquiry Now straight into WhatsApp chats.",
    icon: Package,
    className: "md:col-span-1",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_20px_60px_-20px_rgba(16,185,129,0.45)]",
    accent: "from-emerald-400/20 to-teal-400/10",
    iconBg: "bg-emerald-700",
  },
  {
    title: "UPI Pay Now",
    description:
      "QR + UPI ID + mobile in a polished payment modal customers actually use.",
    icon: QrCode,
    className: "md:col-span-1",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(245,158,11,0.4),0_20px_60px_-20px_rgba(245,158,11,0.45)]",
    accent: "from-amber-400/25 to-orange-400/10",
    iconBg: "bg-amber-600",
  },
  {
    title: "Galleries",
    description:
      "Image grids and short videos with lightbox — show work, not just words.",
    icon: Images,
    className: "md:col-span-1",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(244,63,94,0.3),0_20px_60px_-20px_rgba(244,63,94,0.4)]",
    accent: "from-rose-400/20 to-teal-400/10",
    iconBg: "bg-rose-600",
  },
  {
    title: "Custom Domains",
    description:
      "card.yourbrand.com with Super Admin approval and live activation control.",
    icon: Globe2,
    className: "md:col-span-1",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(20,184,166,0.4),0_20px_60px_-20px_rgba(20,184,166,0.45)]",
    accent: "from-teal-400/25 to-cyan-400/10",
    iconBg: "bg-teal-700",
  },
  {
    title: "Super Admin Controls",
    description:
      "Permissions, subscriptions, expiry sweeps, and domain requests — one cockpit.",
    icon: ShieldCheck,
    className: "md:col-span-2",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(15,118,110,0.4),0_24px_70px_-24px_rgba(15,118,110,0.5)]",
    accent: "from-teal-500/20 to-zinc-400/5",
    iconBg: "bg-teal-900",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative scroll-mt-20 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Platform
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Interactive power, beautifully packed
          </h2>
          <p className="mt-3 text-zinc-600">
            Hover each tile — micro-interactions that mirror how your card feels
            in the wild.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 36, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -8, scale: 1.015 }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-teal-900/8 bg-white/65 p-6 backdrop-blur-md transition-shadow duration-300",
                  f.glow,
                  f.className,
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 transition duration-500 group-hover:opacity-100",
                    f.accent,
                  )}
                />
                {/* animated border glow sweep */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -left-1/2 top-0 h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[feature-shine_1.1s_ease]" />
                </div>

                <div className="relative flex h-full flex-col">
                  <motion.div
                    whileHover={{ rotate: [-2, 4, 0], scale: 1.08 }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg",
                      f.iconBg,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="mt-5 font-display text-xl font-bold text-zinc-900">
                    {f.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
                    {f.description}
                  </p>
                  <div className="mt-4 h-px w-12 origin-left scale-x-0 bg-gradient-to-r from-teal-600 to-amber-500 transition duration-300 group-hover:scale-x-100" />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
