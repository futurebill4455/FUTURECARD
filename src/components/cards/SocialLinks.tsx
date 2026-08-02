"use client";

import type { ISocialLinks } from "@/types/card.types";
import { cn } from "@/lib/utils";

const SOCIALS: Array<{ key: keyof ISocialLinks; label: string }> = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "X / Twitter" },
  { key: "other", label: "Other" },
];

export function SocialLinks({
  links,
  className,
  onClick,
}: {
  links?: ISocialLinks;
  className?: string;
  onClick?: (key: string) => void;
}) {
  const items = SOCIALS.filter((s) => links?.[s.key]);
  if (!items.length) return null;

  return (
    <section className={className}>
      <h2 className="font-display text-lg font-bold">Social Media</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((s) => (
          <a
            key={s.key}
            href={links?.[s.key]}
            target="_blank"
            rel="noreferrer"
            onClick={() => onClick?.(s.key)}
            className={cn(
              "rounded-xl border px-3 py-3 text-center text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-md",
            )}
          >
            {s.label}
          </a>
        ))}
      </div>
    </section>
  );
}
