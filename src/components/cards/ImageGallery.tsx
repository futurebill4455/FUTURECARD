"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const INITIAL_COUNT = 4;
const LOAD_STEP = 4;

export function ImageGallery({
  images,
  accent,
  className,
}: {
  images?: string[];
  accent: string;
  className?: string;
}) {
  const list = useMemo(
    () => (images ?? []).filter(Boolean),
    [images],
  );
  const [visible, setVisible] = useState(INITIAL_COUNT);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const shown = list.slice(0, visible);
  const hasMore = visible < list.length;

  if (!list.length) return null;

  return (
    <section className={cn("rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">Image Gallery</h2>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: accent }}
        >
          {list.length} photos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {shown.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setLightbox(i)}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-black/5 bg-muted/30 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setVisible((v) => Math.min(v + LOAD_STEP, list.length))}
          className="mt-4 w-full rounded-xl border border-dashed py-2.5 text-sm font-semibold transition hover:bg-muted/40"
          style={{ color: accent, borderColor: `${accent}55` }}
        >
          Load More Images ({list.length - visible} left)
        </button>
      ) : null}

      {lightbox !== null ? (
        <MediaLightbox
          kind="image"
          src={list[lightbox]}
          onClose={() => setLightbox(null)}
          onPrev={
            lightbox > 0 ? () => setLightbox((i) => (i === null ? i : i - 1)) : undefined
          }
          onNext={
            lightbox < list.length - 1
              ? () => setLightbox((i) => (i === null ? i : i + 1))
              : undefined
          }
        />
      ) : null}
    </section>
  );
}

export function MediaLightbox({
  kind,
  src,
  embedUrl,
  onClose,
  onPrev,
  onNext,
}: {
  kind: "image" | "video";
  src: string;
  embedUrl?: string | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white"
        onClick={onClose}
      >
        Close
      </button>
      {onPrev ? (
        <button
          type="button"
          className="absolute left-3 z-10 rounded-full bg-white/15 px-3 py-2 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          ‹
        </button>
      ) : null}
      {onNext ? (
        <button
          type="button"
          className="absolute right-3 z-10 rounded-full bg-white/15 px-3 py-2 text-white sm:right-16"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          ›
        </button>
      ) : null}

      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="max-h-[90vh] w-full object-contain"
          />
        ) : embedUrl ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title="Video"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            src={src}
            className="max-h-[90vh] w-full"
            controls
            autoPlay
            playsInline
          />
        )}
      </div>
    </div>
  );
}
