"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Elegant character-by-character typewriter for the profile name.
 * Respects prefers-reduced-motion (shows full text immediately).
 */
export function TypewriterName({
  text,
  className,
  msPerChar = 52,
  startDelay = 280,
  onComplete,
}: {
  text: string;
  className?: string;
  msPerChar?: number;
  startDelay?: number;
  onComplete?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setCount(0);
    setDone(false);

    if (reduceMotion || !text) {
      setCount(text.length);
      setDone(true);
      onCompleteRef.current?.();
      return;
    }

    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startId = setTimeout(() => {
      intervalId = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) {
          clearInterval(intervalId);
          setDone(true);
          onCompleteRef.current?.();
        }
      }, msPerChar);
    }, startDelay);

    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, msPerChar, startDelay, reduceMotion]);

  const shown = text.slice(0, count);

  return (
    <span className={cn("inline-flex max-w-full items-baseline", className)}>
      <span className="text-balance whitespace-pre-wrap">{shown}</span>
      {!done ? (
        <motion.span
          aria-hidden
          className="ml-0.5 inline-block h-[0.85em] w-[2px] translate-y-[0.06em] rounded-sm bg-cyan-200/90"
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
    </span>
  );
}
