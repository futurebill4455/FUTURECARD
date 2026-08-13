"use client";

import { useState } from "react";
import { FUTURE_SHIELD_CARD } from "@/data/future-shield-card";

export type ScrollerGesture = "idle" | "reach" | "swipe" | "read";
export type LookZone = "top" | "mid" | "gallery" | "low";

/**
 * Compact professional browsing hint — sits in the card’s bottom-right
 * corner, never captures taps, and stays inside the phone frame.
 */
export function MiniUserScroller({
  gesture,
  look,
  swipeKey,
  reduced = false,
}: {
  gesture: ScrollerGesture;
  look: LookZone;
  swipeKey: number;
  reduced?: boolean;
}) {
  const [photoOk, setPhotoOk] = useState(true);
  const hint =
    !reduced && (gesture === "swipe" || gesture === "reach")
      ? "animate-fs-hint-swipe"
      : reduced
        ? undefined
        : "animate-fs-hint-idle";

  const lookNudge =
    look === "low" ? "translate-y-0.5" : look === "top" ? "-translate-y-0.5" : "";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-2.5 right-2.5 z-20 flex flex-col items-center gap-1 sm:bottom-3 sm:right-3"
    >
      <div
        key={swipeKey}
        className={`flex flex-col items-center text-cyan-200/80 ${hint ?? ""}`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none">
          <path
            d="M12 18V6M12 6l-4 4M12 6l4 4"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        className={`relative h-11 w-11 overflow-hidden rounded-full border border-cyan-300/45 bg-slate-950 shadow-[0_8px_18px_rgba(0,0,0,0.45)] sm:h-12 sm:w-12 md:h-14 md:w-14 ${lookNudge} ${
          reduced ? "" : "animate-fs-hint-idle"
        }`}
      >
        {photoOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={FUTURE_SHIELD_CARD.profileImage}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setPhotoOk(false)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-cyan-100">
            F
          </span>
        )}
        {!reduced ? (
          <span className="absolute inset-0 rounded-full ring-2 ring-cyan-300/25 animate-fs-hint-pulse" />
        ) : null}
      </div>
    </div>
  );
}
