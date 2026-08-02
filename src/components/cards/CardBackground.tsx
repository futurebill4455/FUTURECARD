"use client";

import { useEffect, useState } from "react";
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
  const slides =
    images?.filter(Boolean) ??
    (fallbackCover ? [fallbackCover] : []);
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
    }, 4200);
    return () => window.clearInterval(id);
  }, [mode, slides.length]);

  return (
    <div
      className={cn(
        "relative h-44 overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900",
        className,
      )}
    >
      {mode === "video" && video ? (
        <video
          key={video}
          src={video}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : null}

      {mode === "slideshow"
        ? slides.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${i}`}
              src={src}
              alt=""
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out",
                i === index ? "opacity-100" : "opacity-0",
              )}
            />
          ))
        : null}

      {mode === "none" ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%),linear-gradient(135deg,#0f766e,#134e4a)]" />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

      {mode === "slideshow" && slides.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/50",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
