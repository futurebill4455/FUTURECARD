"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Ananya Mehta",
    role: "Boutique Owner, Jaipur",
    quote:
      "Our WhatsApp inquiries doubled in a week. Customers love tapping Pay Now and browsing the gallery from one link.",
    accent: "from-rose-400/20 to-teal-400/10",
  },
  {
    name: "Rahul Krishnan",
    role: "Wholesale Distributor, Kochi",
    quote:
      "FutureCard replaced printed cards and a messy Google Site. Verified badge and GST on the profile look completely professional.",
    accent: "from-teal-400/25 to-amber-400/10",
  },
  {
    name: "Priya Shah",
    role: "Interior Studio, Ahmedabad",
    quote:
      "Custom domain approval was smooth. Clients now open studio.priyashah.com and book appointments without asking for our number.",
    accent: "from-amber-400/20 to-emerald-400/15",
  },
  {
    name: "Vikram Patel",
    role: "Auto Spare Hub, Surat",
    quote:
      "UPI QR on the card closed deals on the shop floor. The animated card preview sold us before we even signed up.",
    accent: "from-sky-400/20 to-teal-400/15",
  },
];

export function LandingTestimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % reviews.length);
    }, 5600);
    return () => window.clearInterval(id);
  }, []);

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

  const review = reviews[index]!;

  return (
    <section id="stories" className="relative scroll-mt-20 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Stories
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Voices that slide into view
          </h2>
        </motion.div>

        <div className="relative mt-12">
          {/* Side peek cards */}
          <div className="pointer-events-none absolute inset-y-8 left-0 hidden w-16 rounded-3xl bg-gradient-to-r from-[#f3f8f6] to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-y-8 right-0 hidden w-16 rounded-3xl bg-gradient-to-l from-[#f3f8f6] to-transparent lg:block" />

          <div className="relative mx-auto max-w-3xl overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.article
                key={review.name}
                custom={direction}
                initial={{ opacity: 0, x: direction * 100, scale: 0.9, rotateY: direction * 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: direction * -100, scale: 0.9, rotateY: direction * -12, filter: "blur(6px)" }}
                transition={{ type: "spring", stiffness: 100, damping: 16 }}
                className={`relative overflow-hidden rounded-[2rem] border border-teal-900/8 bg-gradient-to-br ${review.accent} from-white/95 p-8 shadow-[0_30px_80px_-40px_rgba(15,80,70,0.45)] backdrop-blur-md sm:p-12`}
              >
                <Quote className="absolute right-8 top-8 h-14 w-14 text-teal-700/10" />
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
                <p className="font-display text-xl font-semibold leading-relaxed text-zinc-800 sm:text-2xl">
                  “{review.quote}”
                </p>
                <footer className="mt-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800 font-display text-sm font-bold text-white">
                    {review.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      {review.name}
                    </p>
                    <p className="text-sm text-zinc-500">{review.role}</p>
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
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-900/10 bg-white/80 text-teal-800 shadow-sm transition hover:scale-105 hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show review ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-8 bg-teal-700" : "w-2 bg-teal-700/25"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Next review"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-900/10 bg-white/80 text-teal-800 shadow-sm transition hover:scale-105 hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
