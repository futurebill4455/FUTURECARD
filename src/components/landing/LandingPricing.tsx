"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "Starter",
    blurb: "Try the platform with one live card.",
    monthly: 0,
    yearly: 0,
    features: [
      "1 digital card",
      "Core action buttons",
      "Public share link",
      "Basic branding",
    ],
  },
  {
    id: "basic",
    name: "Growth",
    blurb: "For growing shops and freelancers.",
    monthly: 299,
    yearly: 2499,
    features: [
      "Up to 3 cards",
      "Services & galleries",
      "UPI Pay Now",
      "Analytics insights",
    ],
  },
  {
    id: "premium",
    name: "Business",
    blurb: "Full suite with domains & admin power.",
    monthly: 599,
    yearly: 4999,
    popular: true,
    features: [
      "Up to 10 cards",
      "Custom domain mapping",
      "Verified badge ready",
      "Priority feature access",
    ],
  },
];

export function LandingPricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative scroll-mt-20 px-4 py-24 sm:px-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-700/20 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Plans that glow as you grow
          </h2>
          <p className="mt-3 text-zinc-600">
            Start free. Upgrade when you need more cards, domains, and control.
          </p>

          <LayoutGroup>
            <div className="relative mt-8 inline-flex items-center gap-1 rounded-2xl border border-teal-900/10 bg-white/70 p-1.5 backdrop-blur-md">
              {(
                [
                  { key: false, label: "Monthly" },
                  { key: true, label: "Yearly" },
                ] as const
              ).map((opt) => (
                <button
                  key={String(opt.key)}
                  type="button"
                  onClick={() => setYearly(opt.key)}
                  className={cn(
                    "relative rounded-xl px-5 py-2 text-sm font-bold transition",
                    yearly === opt.key
                      ? "text-white"
                      : "text-zinc-600 hover:text-zinc-900",
                  )}
                >
                  {yearly === opt.key ? (
                    <motion.span
                      layoutId="pricing-toggle-pill"
                      className="absolute inset-0 rounded-xl bg-teal-800 shadow-[0_0_24px_-4px_rgba(15,118,110,0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  ) : null}
                  <span className="relative z-10">
                    {opt.label}
                    {opt.key ? (
                      <span
                        className={cn(
                          "ml-1.5 text-[10px] font-extrabold uppercase tracking-wide",
                          yearly ? "text-amber-300" : "text-amber-600",
                        )}
                      >
                        Save
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.035,
                y: -6,
                transition: { type: "spring", stiffness: 320, damping: 22 },
              }}
              className={cn(
                "relative overflow-hidden rounded-3xl border p-6 backdrop-blur-md",
                plan.popular
                  ? "border-teal-400/50 bg-gradient-to-b from-teal-900 to-teal-950 text-white shadow-[0_0_50px_-12px_rgba(45,212,191,0.55)]"
                  : "border-teal-900/8 bg-white/75 shadow-[0_20px_50px_-30px_rgba(15,80,70,0.3)] hover:border-teal-500/30 hover:shadow-[0_0_40px_-16px_rgba(15,118,110,0.45)]",
              )}
            >
              {plan.popular ? (
                <motion.div
                  animate={{ boxShadow: ["0 0 0 0 rgba(251,191,36,0.4)", "0 0 20px 2px rgba(251,191,36,0.55)", "0 0 0 0 rgba(251,191,36,0.4)"] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  className="absolute right-4 top-4 rounded-xl bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-950"
                >
                  Popular
                </motion.div>
              ) : null}

              <h3
                className={cn(
                  "font-display text-2xl font-bold",
                  plan.popular ? "text-white" : "text-zinc-900",
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  "mt-1 text-sm",
                  plan.popular ? "text-teal-100/80" : "text-zinc-500",
                )}
              >
                {plan.blurb}
              </p>

              <div className="mt-6 flex items-end gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${plan.id}-${yearly}`}
                    initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                    transition={{ duration: 0.28 }}
                    className="font-display text-4xl font-extrabold"
                  >
                    ₹{yearly ? plan.yearly : plan.monthly}
                  </motion.span>
                </AnimatePresence>
                <span
                  className={cn(
                    "mb-1 text-sm font-medium",
                    plan.popular ? "text-teal-200/70" : "text-zinc-400",
                  )}
                >
                  /{yearly ? "year" : "mo"}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        plan.popular ? "text-amber-300" : "text-teal-700",
                      )}
                    />
                    <span
                      className={
                        plan.popular ? "text-teal-50/90" : "text-zinc-600"
                      }
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={cn(
                  "mt-8 block rounded-2xl py-3 text-center text-sm font-bold transition hover:scale-[1.02]",
                  plan.popular
                    ? "bg-white text-teal-900 hover:bg-teal-50"
                    : "bg-teal-800 text-white hover:bg-teal-900",
                )}
              >
                {plan.monthly === 0 ? "Start free" : "Choose plan"}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
