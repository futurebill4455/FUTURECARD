"use client";

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
    <div className={cn("grid gap-2", cols)}>
      {items.slice(0, 4).map((cta) => {
        const className = cn(
          "rounded-xl px-2 py-3 text-center text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md transition active:scale-[0.98] sm:text-[11px]",
        );

        const inApp =
          cta.id === "services" ||
          cta.id === "pay" ||
          cta.id === "save" ||
          cta.id === "book" ||
          !cta.url;

        if (inApp) {
          return (
            <button
              key={cta.id}
              type="button"
              className={className}
              style={{ backgroundColor: buttonColor }}
              onClick={() => onAction?.(cta.id)}
            >
              {cta.label}
            </button>
          );
        }

        return (
          <a
            key={cta.id}
            href={cta.url}
            target={cta.url.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className={className}
            style={{ backgroundColor: buttonColor }}
            onClick={() => onAction?.(cta.id)}
          >
            {cta.label}
          </a>
        );
      })}
    </div>
  );
}
