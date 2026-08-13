"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { FutureShieldLiveCard } from "@/components/landing/future-shield/FutureShieldLiveCard";
import {
  MiniUserScroller,
  type LookZone,
  type ScrollerGesture,
} from "@/components/landing/MiniUserScroller";

/** ~34s loop: slow explore, pause at bottom, ease back to top. */
const CYCLE_MS = 34000;
const RESUME_MS = 6500;
const RETURN_START_MS = 28500;

type Key = { t: number; p: number; g: ScrollerGesture };

const KEYS: Key[] = [
  { t: 0, p: 0, g: "idle" },
  { t: 2000, p: 0, g: "idle" },
  { t: 2700, p: 0, g: "reach" },
  { t: 4600, p: 0.13, g: "swipe" },
  { t: 6300, p: 0.13, g: "read" },
  { t: 6900, p: 0.13, g: "reach" },
  { t: 8800, p: 0.28, g: "swipe" },
  { t: 10600, p: 0.28, g: "read" },
  { t: 11200, p: 0.28, g: "reach" },
  { t: 12800, p: 0.42, g: "swipe" },
  { t: 14300, p: 0.42, g: "read" },
  { t: 14900, p: 0.42, g: "reach" },
  { t: 17000, p: 0.58, g: "swipe" },
  { t: 19100, p: 0.58, g: "read" },
  { t: 19700, p: 0.58, g: "reach" },
  { t: 21200, p: 0.72, g: "swipe" },
  { t: 22900, p: 0.72, g: "read" },
  { t: 23500, p: 0.72, g: "reach" },
  { t: 25200, p: 0.88, g: "swipe" },
  { t: 26000, p: 1, g: "swipe" },
  { t: 28500, p: 1, g: "idle" },
  { t: 33500, p: 0, g: "idle" },
  { t: 34000, p: 0, g: "idle" },
];

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function sampleAt(ms: number): { p: number; g: ScrollerGesture } {
  const x = ((ms % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
  for (let i = 0; i < KEYS.length - 1; i += 1) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (x >= a.t && x <= b.t) {
      const u = b.t === a.t ? 1 : (x - a.t) / (b.t - a.t);
      const e = easeInOutCubic(u);
      return { p: a.p + (b.p - a.p) * e, g: u < 0.08 ? a.g : b.g };
    }
  }
  return { p: 0, g: "idle" };
}

function lookFromProgress(p: number): LookZone {
  if (p < 0.18) return "top";
  if (p < 0.45) return "mid";
  if (p < 0.68) return "gallery";
  return "low";
}

function elapsedForProgress(pTarget: number) {
  const clamped = Math.min(1, Math.max(0, pTarget));
  for (let i = 0; i < KEYS.length - 1; i += 1) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (a.t >= RETURN_START_MS) break;
    const lo = Math.min(a.p, b.p);
    const hi = Math.max(a.p, b.p);
    if (clamped >= lo - 0.001 && clamped <= hi + 0.001 && hi !== lo) {
      const u = (clamped - a.p) / (b.p - a.p);
      return a.t + Math.max(0, Math.min(1, u)) * (b.t - a.t);
    }
  }
  return 0;
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

  const [gesture, setGesture] = useState<ScrollerGesture>("idle");
  const [look, setLook] = useState<LookZone>("top");
  const [swipeKey, setSwipeKey] = useState(0);
  const [userPaused, setUserPaused] = useState(false);

  const pauseAuto = useCallback(() => {
    pausedRef.current = true;
    setUserPaused(true);
    setGesture("idle");
    lastGesture.current = "idle";
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      const el = scrollerRef.current;
      if (el) {
        const max = Math.max(1, el.scrollHeight - el.clientHeight);
        elapsedRef.current = elapsedForProgress(el.scrollTop / max);
      }
      pausedRef.current = false;
      setUserPaused(false);
      lastScrollWrite.current = -1;
    }, RESUME_MS);
  }, []);

  useEffect(() => {
    if (reduce) return undefined;

    let raf = 0;
    const tick = (ts: number) => {
      if (lastTs.current == null) lastTs.current = ts;
      const dt = Math.min(40, ts - lastTs.current);
      lastTs.current = ts;

      if (!pausedRef.current) {
        elapsedRef.current += dt;
        const { p, g } = sampleAt(elapsedRef.current);
        const el = scrollerRef.current;
        if (el) {
          const max = Math.max(0, el.scrollHeight - el.clientHeight);
          const next = p * max;
          if (Math.abs(next - lastScrollWrite.current) > 0.4) {
            el.scrollTop = next;
            lastScrollWrite.current = next;
          }
        }

        const zone = lookFromProgress(p);
        setLook((prev) => (prev === zone ? prev : zone));

        if (g !== lastGesture.current) {
          lastGesture.current = g;
          setGesture(g);
          if (g === "swipe") setSwipeKey((n) => n + 1);
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
    <div className="relative mx-auto w-[90%] max-w-[420px] min-w-0 md:max-w-[380px] lg:w-full lg:max-w-none">
      <div
        className={`relative origin-center [transform-style:preserve-3d] ${
          reduce || userPaused ? "" : "animate-hero-float"
        }`}
      >
        <div className="pointer-events-none absolute -inset-5 rounded-[2.2rem] bg-gradient-to-br from-cyan-400/22 via-teal-400/10 to-violet-500/16 blur-3xl" />

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
            className="fs-preview-scroll h-[min(64vh,540px)] overflow-x-hidden overflow-y-auto sm:h-[min(66vh,560px)] md:h-[500px] lg:h-[min(70vh,620px)]"
            aria-label="Future Shield digital card preview"
          >
            <FutureShieldLiveCard />
          </div>
        </div>
      </div>

      <MiniUserScroller
        gesture={reduce || userPaused ? "idle" : gesture}
        look={reduce ? "top" : look}
        swipeKey={swipeKey}
        reduced={Boolean(reduce) || userPaused}
      />
    </div>
  );
}
