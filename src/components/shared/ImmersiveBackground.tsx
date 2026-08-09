"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type AmbientMode = "gradient" | "video" | "slideshow";

export type AmbientConfig = {
  mode?: AmbientMode;
  video?: string;
  images?: string[];
  accent?: string;
};

/**
 * Full-viewport futuristic stage: neon gradient, looping video, or
 * cross-fading dark slideshow (exactly 3 images recommended).
 */
export function ImmersiveBackground({
  mode = "gradient",
  video,
  images = [],
  accent = "#2dd4bf",
  className,
  intensity = 0.55,
}: AmbientConfig & {
  className?: string;
  intensity?: number;
}) {
  const slides = (images || []).filter(Boolean).slice(0, 3);
  const [index, setIndex] = useState(0);

  const resolved: AmbientMode =
    mode === "video" && video
      ? "video"
      : mode === "slideshow" && slides.length > 0
        ? "slideshow"
        : "gradient";

  useEffect(() => {
    if (resolved !== "slideshow" || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [resolved, slides.length]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {resolved === "video" && video ? (
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

      {resolved === "slideshow" ? (
        <AnimatePresence mode="sync">
          {slides.map((src, i) =>
            i === index ? (
              <motion.img
                key={`${src}-${i}-${index}`}
                src={src}
                alt=""
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null,
          )}
        </AnimatePresence>
      ) : null}

      {resolved === "gradient" ? (
        <>
          <div className="absolute inset-0 bg-[#020617]" />
          <motion.div
            className="absolute -left-1/4 top-0 h-[70%] w-[70%] rounded-full blur-3xl"
            style={{ backgroundColor: `${accent}33` }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-1/4 bottom-0 h-[65%] w-[65%] rounded-full blur-3xl"
            style={{ backgroundColor: "#38bdf833" }}
            animate={{ x: [0, -50, 0], y: [0, -25, 0], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="ambient-grid absolute inset-0 opacity-50" />
        </>
      ) : null}

      {/* Dark + neon cinematic grade */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(2,6,23,${0.35 + intensity * 0.25}) 0%, rgba(2,6,23,${0.55 + intensity * 0.3}) 55%, rgba(2,6,23,${0.75 + intensity * 0.2}) 100%),
            radial-gradient(ellipse 80% 50% at 50% -10%, ${accent}40, transparent 55%)
          `,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(2,6,23,0.65)_100%)]" />
    </div>
  );
}
