"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BackgroundMediaType } from "@/types/card.types";
import { cn } from "@/lib/utils";

export function CardBackground({
  mediaType,
  images,
  video,
  fallbackCover,
  className,
}: {
  mediaType?: BackgroundMediaType;
  images?: string[];
  video?: string;
  fallbackCover?: string;
  className?: string;
}) {
  const slides = (images?.filter(Boolean) ?? (fallbackCover ? [fallbackCover] : [])).slice(
    0,
    3,
  );
  const [index, setIndex] = useState(0);

  const mode =
    mediaType === "video" && video
      ? "video"
      : mediaType === "slideshow" && slides.length > 0
        ? "slideshow"
        : slides.length > 0
          ? "slideshow"
          : video
            ? "video"
            : "none";

  useEffect(() => {
    if (mode !== "slideshow" || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4800);
    return () => window.clearInterval(id);
  }, [mode, slides.length]);

  return (
    <div
      className={cn(
        "relative h-48 overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 sm:h-52",
        className,
      )}
    >
      {mode === "video" && video ? (
        <video
          key={video}
          src={video}
          className="absolute inset-0 h-full w-full scale-105 object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : null}

      {mode === "slideshow" ? (
        <AnimatePresence mode="sync">
          {slides.map((src, i) =>
            i === index ? (
              <motion.img
                key={`${src}-${index}`}
                src={src}
                alt=""
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null,
          )}
        </AnimatePresence>
      ) : null}

      {mode === "none" ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.35),transparent_45%),linear-gradient(135deg,#042f2e,#020617)]" />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-teal-950/20" />
      <div className="absolute inset-0 ambient-grid opacity-30" />

      {mode === "slideshow" && slides.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-5 bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                  : "w-1.5 bg-white/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
