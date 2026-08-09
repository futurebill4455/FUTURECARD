"use client";

import {
  CARD_SECTION_CHECKLIST,
  resolveCardSections,
  type CardSectionKey,
  type ICardSections,
} from "@/types/card-sections.types";
import { cn } from "@/lib/utils";

/** Super Admin master grants for public mini-site sections */
export function CardSectionsChecklist({
  value,
  onChange,
  className,
  title = "Features Management",
  description = "Control which mini-site sections this user’s cards may show. Disabled sections are locked for the user and hidden on their public card.",
}: {
  value: ICardSections;
  onChange: (next: ICardSections) => void;
  className?: string;
  title?: string;
  description?: string;
}) {
  const sections = resolveCardSections(value);

  function toggle(key: CardSectionKey, enabled: boolean) {
    onChange({ ...sections, [key]: enabled });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-2">
        {CARD_SECTION_CHECKLIST.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={sections[item.key]}
              onChange={(e) => toggle(item.key, e.target.checked)}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-[11px] text-muted-foreground">
                {item.description}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                sections[item.key]
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-100 text-zinc-500",
              )}
            >
              {sections[item.key] ? "On" : "Off"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/**
 * User-level section toggles. Switches for admin-disabled sections are locked Off.
 */
export function CardSectionToggles({
  adminSections,
  value,
  onChange,
  className,
}: {
  adminSections: ICardSections;
  value: ICardSections;
  onChange: (next: ICardSections) => void;
  className?: string;
}) {
  const admin = resolveCardSections(adminSections);
  const prefs = resolveCardSections(value);

  function toggle(key: CardSectionKey, enabled: boolean) {
    if (!admin[key]) return;
    onChange({ ...prefs, [key]: enabled });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-sm font-semibold">Public page sections</p>
        <p className="text-xs text-muted-foreground">
          Show or hide mini-site sections on this card. Locked items were
          disabled by your Super Admin and cannot be turned on.
        </p>
      </div>
      <div className="space-y-2">
        {CARD_SECTION_CHECKLIST.map((item) => {
          const allowed = admin[item.key];
          const on = Boolean(allowed && prefs[item.key]);
          return (
            <div
              key={item.key}
              className={cn(
                "flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5",
                allowed
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-amber-500/20 bg-amber-500/5 opacity-80",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  {allowed
                    ? item.description
                    : "Disabled by Super Admin — contact them to unlock."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                disabled={!allowed}
                onClick={() => toggle(item.key, !prefs[item.key])}
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full transition",
                  on ? "bg-sky-500" : "bg-zinc-300",
                  !allowed && "cursor-not-allowed opacity-60",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
                    on ? "left-5" : "left-0.5",
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
