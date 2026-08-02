"use client";

import type { IActionButton } from "@/types/card.types";
import { ACTION_BUTTON_META } from "@/lib/action-buttons";
import { isActionAllowed } from "@/lib/feature-permissions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { IUserFeatures } from "@/types/platform.types";
import { resolveFeatures } from "@/types/platform.types";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition",
        checked ? "bg-emerald-500" : "bg-zinc-300",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
          checked ? "left-5" : "left-0.5",
        )}
      />
    </button>
  );
}

export function ButtonsManager({
  buttons,
  onChange,
  features: rawFeatures,
}: {
  buttons: IActionButton[];
  onChange: (next: IActionButton[]) => void;
  features?: IUserFeatures | null;
}) {
  const features = resolveFeatures(rawFeatures);

  function patch(key: string, update: Partial<IActionButton>) {
    onChange(buttons.map((b) => (b.key === key ? { ...b, ...update } : b)));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Toggle each action on or off for the public card. Update the phone,
        email, or URL used by that button. Disabled buttons are hidden from
        visitors.
      </p>

      <div className="space-y-2">
        {ACTION_BUTTON_META.map((meta) => {
          const allowed = isActionAllowed(meta.key, features);
          const row = buttons.find((b) => b.key === meta.key) || {
            key: meta.key,
            enabled: meta.valueKind === "none",
            value: "",
          };

          if (!allowed) {
            return (
              <div
                key={meta.key}
                className="rounded-xl border border-amber-200 bg-amber-50/80 p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold opacity-40"
                    style={{ backgroundColor: meta.softBg, color: meta.softFg }}
                  >
                    {meta.label.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <p className="text-[11px] font-medium text-amber-900">
                      Feature disabled by Administrator
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={meta.key}
              className="rounded-xl border bg-white/70 p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: meta.softBg, color: meta.softFg }}
                >
                  {meta.label.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {row.enabled ? "On" : "Off"}
                      </span>
                      <Toggle
                        checked={row.enabled}
                        onChange={(enabled) => patch(meta.key, { enabled })}
                      />
                    </div>
                  </div>
                  {meta.hint ? (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {meta.hint}
                    </p>
                  ) : null}
                </div>
              </div>

              {meta.valueKind !== "none" && meta.valueKind !== "modal" ? (
                <div className="mt-2.5">
                  <Input
                    type={
                      meta.valueKind === "email"
                        ? "email"
                        : meta.valueKind === "url"
                          ? "url"
                          : "text"
                    }
                    placeholder={meta.placeholder}
                    value={row.value}
                    disabled={!row.enabled}
                    onChange={(e) =>
                      patch(meta.key, { value: e.target.value })
                    }
                    className={cn(!row.enabled && "opacity-50")}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {buttons.filter((b) => b.enabled && isActionAllowed(b.key, features)).length}{" "}
        / {ACTION_BUTTON_META.length} buttons available
      </p>
    </div>
  );
}
