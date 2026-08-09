"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import {
  DEFAULT_LANDING_CMS,
  type ILandingTestimonialsContent,
} from "@/types/landing-cms.types";

const ACCENTS = [
  "from-rose-400/20 to-teal-400/10",
  "from-teal-400/25 to-amber-400/10",
  "from-amber-400/20 to-emerald-400/15",
  "from-sky-400/20 to-teal-400/15",
];

export function LandingTestimonials({
  content = DEFAULT_LANDING_CMS.testimonials,
}: {
  content?: ILandingTestimonialsContent;
}) {
  const reviews = content.items;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!reviews.length) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % reviews.length);
    }, 5600);
    return () => window.clearInterval(id);
  }, [reviews.length]);

  function go(next: number) {
    setDirection(next > index || (index === reviews.length - 1 && next === 0) ? 1 : -1);
    setIndex(next);
  }

  function prev() {
    setDirection(-1);
    setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  }

  function next() {
    setDirection(1);
    setIndex((i) => (i + 1) % reviews.length);
  }

  if (!reviews.length) return null;
  const review = reviews[index]!;
  const accent = ACCENTS[index % ACCENTS.length]!;

  return (
    <section id="stories" className="relative scroll-mt-20 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-teal-50 sm:text-4xl">
            {content.title}
          </h2>
        </motion.div>

        <div className="relative mt-12">
          <div className="pointer-events-none absolute inset-y-8 left-0 hidden w-16 rounded-3xl bg-gradient-to-r from-background to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-y-8 right-0 hidden w-16 rounded-3xl bg-gradient-to-l from-background to-transparent lg:block" />

          <div className="relative mx-auto max-w-3xl overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.article
                key={review.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 100, scale: 0.9, rotateY: direction * 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: direction * -100, scale: 0.9, rotateY: direction * -12, filter: "blur(6px)" }}
                transition={{ type: "spring", stiffness: 100, damping: 16 }}
                className={`relative overflow-hidden rounded-[2rem] border border-teal-400/15 bg-gradient-to-br ${accent} from-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-12`}
              >
                <Quote className="absolute right-8 top-8 h-14 w-14 text-teal-200/10" />
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                    >
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </motion.span>
                  ))}
                </div>
                <p className="font-display text-xl font-semibold leading-relaxed text-teal-50 sm:text-2xl">
                  “{review.quote}”
                </p>
                <footer className="mt-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 font-display text-sm font-bold text-teal-950">
                    {review.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-teal-50">
                      {review.name}
                    </p>
                    <p className="text-sm text-teal-100/55">{review.role}</p>
                  </div>
                </footer>
              </motion.article>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous review"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-400/20 bg-white/5 text-teal-100 shadow-sm transition hover:scale-105 hover:border-teal-400/40 hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {reviews.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  aria-label={`Show review ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-8 bg-teal-300" : "w-2 bg-teal-400/25"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Next review"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-400/20 bg-white/5 text-teal-100 shadow-sm transition hover:scale-105 hover:border-teal-400/40 hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
