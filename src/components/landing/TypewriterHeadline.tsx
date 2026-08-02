"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
  "stunning digital visiting card",
  "verified brand presence",
  "shareable business identity",
];

/** Cycles typewriter phrases with a gradient fill on the typed text */
export function TypewriterHeadline({
  prefix = "Create your",
  suffix = "in minutes",
}: {
  prefix?: string;
  suffix?: string;
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = PHRASES[phraseIndex] ?? "";
    const speed = deleting ? 28 : 48;

    if (!deleting && display === full) {
      const hold = window.setTimeout(() => setDeleting(true), 1800);
      return () => window.clearTimeout(hold);
    }

    if (deleting && display === "") {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
      return;
    }

    const id = window.setTimeout(() => {
      setDisplay((prev) =>
        deleting ? full.slice(0, prev.length - 1) : full.slice(0, prev.length + 1),
      );
    }, speed);

    return () => window.clearTimeout(id);
  }, [display, deleting, phraseIndex]);

  return (
    <h1 className="mt-4 max-w-xl font-display text-3xl font-bold leading-[1.15] tracking-tight text-zinc-800 sm:text-4xl md:text-[2.75rem]">
      {prefix}{" "}
      <span className="relative inline bg-gradient-to-r from-teal-700 via-emerald-500 to-amber-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift">
        {display}
        <motion.span
          aria-hidden
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
          className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.12em] bg-teal-700 align-baseline"
        />
      </span>{" "}
      <AnimatePresence mode="wait">
        <motion.span
          key={suffix}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-800"
        >
          {suffix}
        </motion.span>
      </AnimatePresence>
    </h1>
  );
}
