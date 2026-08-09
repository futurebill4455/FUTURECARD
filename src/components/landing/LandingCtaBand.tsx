"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  DEFAULT_LANDING_CMS,
  type ILandingCtaContent,
} from "@/types/landing-cms.types";

export function LandingCtaBand({
  content = DEFAULT_LANDING_CMS.cta,
}: {
  content?: ILandingCtaContent;
}) {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        whileHover={{ scale: 1.01 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-teal-400/25 bg-gradient-to-br from-teal-800 via-teal-900 to-[#0b1f1c] px-8 py-14 text-center shadow-[0_0_60px_-20px_rgba(45,212,191,0.45)] sm:px-12"
      >
        <motion.div
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-amber-400/25 blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.25, 0.5, 0.25], x: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-emerald-400/25 blur-3xl"
        />
        <h2 className="relative font-display text-3xl font-extrabold text-teal-50 sm:text-4xl">
          {content.title}
        </h2>
        <p className="relative mx-auto mt-3 max-w-lg text-teal-100">
          {content.subtitle}
        </p>
        <Link
          href={content.buttonHref || "/register"}
          className="relative mt-8 inline-flex items-center gap-2 rounded-2xl bg-teal-50 px-6 py-3.5 text-sm font-bold text-teal-950 transition hover:scale-105 hover:bg-white"
        >
          {content.buttonLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}
