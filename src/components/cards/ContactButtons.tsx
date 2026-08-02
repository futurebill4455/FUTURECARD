"use client";

import type { ICard } from "@/types/card.types";
import { cn } from "@/lib/utils";

const actions = [
  {
    key: "call",
    label: "Call",
    href: (c: ICard) => (c.phone ? `tel:${c.phone}` : undefined),
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    href: (c: ICard) =>
      c.whatsappNumber
        ? `https://wa.me/${c.whatsappNumber.replace(/\D/g, "")}`
        : undefined,
  },
  {
    key: "email",
    label: "Email",
    href: (c: ICard) => (c.email ? `mailto:${c.email}` : undefined),
  },
  {
    key: "website",
    label: "Website",
    href: (c: ICard) => c.website || undefined,
  },
  {
    key: "maps",
    label: "Maps",
    href: (c: ICard) => c.location?.googleMapsUrl || undefined,
  },
] as const;

export function ContactButtons({
  card,
  className,
  onAction,
}: {
  card: ICard;
  className?: string;
  onAction?: (detail: string) => void;
}) {
  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {actions.map((a) => {
        const href = a.href(card);
        const classNameBtn =
          "rounded-xl bg-teal-700 px-1 py-3 text-center text-[11px] font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-40";
        if (!href) {
          return (
            <button key={a.key} className={classNameBtn} disabled>
              {a.label}
            </button>
          );
        }
        return (
          <a
            key={a.key}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className={classNameBtn}
            onClick={() => onAction?.(`${a.key}_click`)}
          >
            {a.label}
          </a>
        );
      })}
    </div>
  );
}
