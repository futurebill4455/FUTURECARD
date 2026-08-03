"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/** Word-by-word kinetic reveal */
export function KineticWords({
  text,
  className,
  as: Tag = "span",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <Tag className={cn("inline", className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", rotate: 6, opacity: 0 }}
            whileInView={{ y: "0%", rotate: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: delay + i * 0.045,
              type: "spring",
              stiffness: 160,
              damping: 16,
              mass: 0.7,
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export const burstIn: Variants = {
  hidden: { opacity: 0, scale: 0.72, y: 48, filter: "blur(10px)" },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 110, damping: 14, mass: 0.85 },
  },
};

export const slideBurst = (from: "left" | "right" | "up" = "up"): Variants => ({
  hidden: {
    opacity: 0,
    x: from === "left" ? -80 : from === "right" ? 80 : 0,
    y: from === "up" ? 64 : 0,
    rotate: from === "left" ? -4 : from === "right" ? 4 : 2,
    scale: 0.92,
  },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 14 },
  },
});
