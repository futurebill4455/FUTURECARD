"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  style?: MotionStyle;
};

/** 3D tilt that follows the pointer — high-end SaaS product feel */
export function TiltCard({
  children,
  className,
  maxTilt = 10,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const spring = { stiffness: 180, damping: 18, mass: 0.4 };
  const rx = useSpring(
    useTransform(my, [-0.5, 0.5], [maxTilt, -maxTilt]),
    spring,
  );
  const ry = useSpring(
    useTransform(mx, [-0.5, 0.5], [-maxTilt, maxTilt]),
    spring,
  );
  const glareX = useSpring(useTransform(mx, [-0.5, 0.5], [20, 80]), spring);
  const glareY = useSpring(useTransform(my, [-0.5, 0.5], [15, 85]), spring);
  const glareBg = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.55), transparent 55%)`,
  );

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d",
        perspective: 1000,
        ...style,
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(20px)" }} className="relative">
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40 mix-blend-soft-light"
          style={{ background: glareBg }}
        />
      </div>
    </motion.div>
  );
}
