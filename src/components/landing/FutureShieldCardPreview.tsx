"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { FutureShieldLiveCard } from "@/components/landing/future-shield/FutureShieldLiveCard";
import {
  MiniUserScroller,
  type LookZone,
  type ScrollerGesture,
} from "@/components/landing/MiniUserScroller";

/** Section tour — natural pauses, ~16s full cycle. */
const STOPS = [
  "fs-preview-profile",
  "fs-preview-stats",
  "fs-preview-services",
  "fs-preview-why",
  "fs-preview-gallery",
  "fs-preview-qr",
] as const;

const PAUSE_PROFILE_MS = 1700;
const PAUSE_READ_MS = 1450;
const PAUSE_QR_MS = 1600;
const SCROLL_MS = 900;
const RETURN_MS = 1100;
const RESUME_MS = 4000;

const LOOK_FOR_STOP: LookZone[] = [
  "top",
  "mid",
  "mid",
  "gallery",
  "gallery",
  "low",
];

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function sectionOffset(scroller: HTMLElement, id: string) {
  const el = scroller.querySelector<HTMLElement>(`#${id}`);
  if (!el) return 0;
  const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  const next =
    scroller.scrollTop +
    (el.getBoundingClientRect().top - scroller.getBoundingClientRect().top) -
    6;
  return Math.min(max, Math.max(0, next));
}

type Sample = { top: number; gesture: ScrollerGesture; look: LookZone };

function buildTour(scroller: HTMLElement) {
  const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  const tops = STOPS.map((id) => Math.min(max, sectionOffset(scroller, id)));
  tops[0] = 0;

  type Key = { t: number; top: number; g: ScrollerGesture; look: LookZone };
  const keys: Key[] = [];
  let t = 0;

  keys.push({ t, top: 0, g: "idle", look: "top" });
  t += PAUSE_PROFILE_MS;
  keys.push({ t, top: 0, g: "idle", look: "top" });

  for (let i = 1; i < tops.length; i += 1) {
    keys.push({ t, top: tops[i - 1]!, g: "reach", look: LOOK_FOR_STOP[i - 1]! });
    t += SCROLL_MS;
    keys.push({
      t,
      top: tops[i]!,
      g: "swipe",
      look: LOOK_FOR_STOP[i]!,
    });
    const hold = i === tops.length - 1 ? PAUSE_QR_MS : PAUSE_READ_MS;
    t += hold;
    keys.push({
      t,
      top: tops[i]!,
      g: "read",
      look: LOOK_FOR_STOP[i]!,
    });
  }

  keys.push({ t, top: tops[tops.length - 1]!, g: "idle", look: "low" });
  t += RETURN_MS;
  keys.push({ t, top: 0, g: "idle", look: "top" });

  const duration = t;

  function sample(ms: number): Sample {
    const x = ((ms % duration) + duration) % duration;
    for (let i = 0; i < keys.length - 1; i += 1) {
      const a = keys[i]!;
      const b = keys[i + 1]!;
      if (x >= a.t && x <= b.t) {
        const u = b.t === a.t ? 1 : (x - a.t) / (b.t - a.t);
        const e = easeInOutCubic(u);
        return {
          top: a.top + (b.top - a.top) * e,
          gesture: u < 0.12 ? a.g : b.g,
          look: u < 0.5 ? a.look : b.look,
        };
      }
    }
    return { top: 0, gesture: "idle", look: "top" };
  }

  function elapsedNear(scrollTop: number) {
    let bestT = 0;
    let best = Number.POSITIVE_INFINITY;
    for (const k of keys) {
      if (k.t >= duration - RETURN_MS) continue;
      const d = Math.abs(k.top - scrollTop);
      if (d < best) {
        best = d;
        bestT = k.t;
      }
    }
    return bestT;
  }

  return { duration, sample, elapsedNear };
}

export function FutureShieldCardPreview() {
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const lastTs = useRef<number | null>(null);
  const lastScrollWrite = useRef(-1);
  const lastGesture = useRef<ScrollerGesture>("idle");
  const ignoreScrollUntil = useRef(0);
  const tourRef = useRef<ReturnType<typeof buildTour> | null>(null);

  const [gesture, setGesture] = useState<ScrollerGesture>("idle");
  const [look, setLook] = useState<LookZone>("top");
  const [swipeKey, setSwipeKey] = useState(0);
  const [userPaused, setUserPaused] = useState(false);

  const rebuildTour = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    tourRef.current = buildTour(el);
  }, []);

  const pauseAuto = useCallback(() => {
    if (reduce) return;
    pausedRef.current = true;
    setUserPaused(true);
    setGesture("idle");
    lastGesture.current = "idle";
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      const el = scrollerRef.current;
      if (el && tourRef.current) {
        elapsedRef.current = tourRef.current.elapsedNear(el.scrollTop);
      }
      pausedRef.current = false;
      setUserPaused(false);
      lastScrollWrite.current = -1;
    }, RESUME_MS);
  }, [reduce]);

  const onUserScroll = useCallback(() => {
    if (performance.now() < ignoreScrollUntil.current) return;
    pauseAuto();
  }, [pauseAuto]);

  useEffect(() => {
    rebuildTour();
    const el = scrollerRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => rebuildTour());
    ro.observe(el);
    const inner = el.firstElementChild;
    if (inner) ro.observe(inner);
    el.addEventListener("load", rebuildTour, true);
    return () => {
      ro.disconnect();
      el.removeEventListener("load", rebuildTour, true);
    };
  }, [rebuildTour]);

  useEffect(() => {
    if (reduce) return undefined;

    let raf = 0;
    const tick = (ts: number) => {
      if (lastTs.current == null) lastTs.current = ts;
      const dt = Math.min(48, ts - lastTs.current);
      lastTs.current = ts;

      if (!pausedRef.current) {
        elapsedRef.current += dt;
        const el = scrollerRef.current;
        if (el) {
          if (!tourRef.current) tourRef.current = buildTour(el);
          const { top, gesture: g, look: zone } = tourRef.current.sample(
            elapsedRef.current,
          );
          if (Math.abs(top - lastScrollWrite.current) > 0.35) {
            ignoreScrollUntil.current = performance.now() + 64;
            el.scrollTop = top;
            lastScrollWrite.current = top;
          }
          setLook((prev) => (prev === zone ? prev : zone));
          if (g !== lastGesture.current) {
            lastGesture.current = g;
            setGesture(g);
            if (g === "swipe") setSwipeKey((n) => n + 1);
          }
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reduce]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  return (
    <div className="fs-preview-phone relative mx-auto min-w-0">
      <div
        className={`fs-preview-stage relative origin-center ${
          reduce || userPaused ? "" : "animate-hero-float"
        }`}
      >
        <div className="pointer-events-none absolute -inset-4 rounded-[2.2rem] bg-gradient-to-br from-cyan-400/22 via-teal-400/10 to-violet-500/16 blur-3xl max-md:inset-0 max-md:blur-2xl" />

        <div className="landing-glow-border relative overflow-hidden rounded-[1.65rem] border border-white/15 bg-[#020617] shadow-[0_28px_70px_-22px_rgba(0,0,0,0.78),0_0_0_1px_rgba(45,212,191,0.2)]">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-[10px] font-semibold tabular-nums text-slate-400">
              9:41
            </span>
            <div className="h-4 w-[4.75rem] rounded-full bg-black/80" aria-hidden />
            <span className="text-[10px] font-semibold text-slate-400">5G</span>
          </div>

          <div
            ref={scrollerRef}
            onWheel={pauseAuto}
            onPointerDown={pauseAuto}
            onTouchStart={pauseAuto}
            onScroll={onUserScroll}
            className="fs-preview-scroll"
            aria-label="Future Shield digital card preview"
          >
            <FutureShieldLiveCard />
          </div>

          <MiniUserScroller
            gesture={reduce || userPaused ? "idle" : gesture}
            look={reduce ? "top" : look}
            swipeKey={swipeKey}
            reduced={Boolean(reduce) || userPaused}
          />
        </div>
      </div>
    </div>
  );
}
