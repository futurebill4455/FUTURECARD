"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MediaLightbox } from "./ImageGallery";

function youtubeId(url: string) {
  const m =
    url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
    ) || url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  return m?.[1] ?? null;
}

function isDirectVideo(url: string) {
  return (
    url.startsWith("/uploads/") ||
    /\.(mp4|webm|mov)(\?|$)/i.test(url)
  );
}

function thumbFor(url: string) {
  const id = youtubeId(url);
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return null;
}

function embedFor(url: string) {
  const id = youtubeId(url);
  if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  return null;
}

export function VideoGallery({
  videos,
  accent,
  className,
}: {
  videos?: string[];
  accent: string;
  className?: string;
}) {
  const list = videos?.filter(Boolean) ?? [];
  const [active, setActive] = useState<number | null>(null);

  if (!list.length) return null;

  return (
    <section
      className={cn(
        "rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">Video Gallery</h2>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: accent }}
        >
          {list.length} shorts
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {list.map((url, i) => {
          const thumb = thumbFor(url);
          const direct = isDirectVideo(url);

          return (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className="group relative aspect-[9/14] overflow-hidden rounded-2xl border border-black/5 bg-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {direct ? (
                <video
                  src={url}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-xs text-white/70">
                  Short video
                </div>
              )}

              <span className="absolute left-2 top-2 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow">
                Short
              </span>

              <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/25">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white shadow-lg ring-2 ring-white/40"
                  style={{ backgroundColor: accent }}
                >
                  ▶
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {active !== null ? (
        <MediaLightbox
          kind="video"
          src={list[active]}
          embedUrl={embedFor(list[active])}
          onClose={() => setActive(null)}
          onPrev={
            active > 0
              ? () => setActive((i) => (i === null ? i : i - 1))
              : undefined
          }
          onNext={
            active < list.length - 1
              ? () => setActive((i) => (i === null ? i : i + 1))
              : undefined
          }
        />
      ) : null}
    </section>
  );
}
