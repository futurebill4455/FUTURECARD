"use client";

import { motion } from "framer-motion";
import type { IPrimaryCta } from "@/types/card.types";
import { cn } from "@/lib/utils";

export function PrimaryCtaRow({
  ctas,
  buttonColor,
  onAction,
}: {
  ctas?: IPrimaryCta[];
  buttonColor: string;
  onAction?: (id: string) => void;
}) {
  const items = (ctas || []).filter((c) => c.enabled);
  if (!items.length) return null;

  const cols =
    items.length >= 4
      ? "grid-cols-2 sm:grid-cols-4"
      : items.length === 3
        ? "grid-cols-3"
        : "grid-cols-2";

  return (
    <div className={cn("grid gap-2.5", cols)}>
      {items.slice(0, 4).map((cta, i) => {
        const className = cn(
          "rounded-xl px-2 py-3.5 text-center text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg transition sm:text-[11px]",
        );

        const inApp =
          cta.id === "services" ||
          cta.id === "pay" ||
          cta.id === "save" ||
          cta.id === "book" ||
          !cta.url;

        const style = {
          background: `linear-gradient(145deg, ${buttonColor}, ${buttonColor}cc)`,
          boxShadow: `0 8px 24px ${buttonColor}55`,
        };

        if (inApp) {
          return (
            <motion.button
              key={cta.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={className}
              style={style}
              onClick={() => onAction?.(cta.id)}
            >
              {cta.label}
            </motion.button>
          );
        }

        return (
          <motion.a
            key={cta.id}
            href={cta.url}
            target={cta.url.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={className}
            style={style}
            onClick={() => onAction?.(cta.id)}
          >
            {cta.label}
          </motion.a>
        );
      })}
    </div>
  );
}
