"use client";

import type { FeatureKey, IUserFeatures } from "@/types/platform.types";
import {
  ADMIN_FEATURE_CHECKLIST,
  DEFAULT_USER_FEATURES,
  FEATURE_LABELS,
  resolveFeatures,
} from "@/types/platform.types";
import { cn } from "@/lib/utils";

export function FeaturePermissionChecklist({
  value,
  onChange,
  showExtras = true,
  className,
}: {
  value: IUserFeatures;
  onChange: (next: IUserFeatures) => void;
  showExtras?: boolean;
  className?: string;
}) {
  const features = resolveFeatures(value);

  function toggle(key: FeatureKey, enabled: boolean) {
    onChange({ ...features, [key]: enabled });
  }

  const extras: FeatureKey[] = [
    "analytics",
    "customTheme",
    "verifiedBadge",
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-sm font-semibold">Feature permissions</p>
        <p className="text-xs text-muted-foreground">
          Enable or disable facilities for this client. Disabled items are
          locked on their dashboard and hidden on the public card. Premium
          plans default Custom Domain on; you can override per account.
        </p>
      </div>
      <div className="space-y-2">
        {ADMIN_FEATURE_CHECKLIST.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={features[item.key]}
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
                features[item.key]
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-100 text-zinc-500",
              )}
            >
              {features[item.key] ? "On" : "Off"}
            </span>
          </label>
        ))}
      </div>

      {showExtras ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {extras.map((key) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
            >
              <span>{FEATURE_LABELS[key]}</span>
              <input
                type="checkbox"
                checked={features[key]}
                onChange={(e) => toggle(key, e.target.checked)}
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function FeatureLock({
  enabled,
  title,
  children,
}: {
  enabled: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  if (enabled) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="pointer-events-none select-none opacity-40 blur-[0.5px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 p-4 backdrop-blur-[1px]">
        <div className="max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center shadow-sm">
          <p className="text-sm font-bold text-amber-900">
            {title || "Feature disabled by Administrator"}
          </p>
          <p className="mt-1 text-xs text-amber-800/80">
            Contact your Super Admin to unlock this section for your account.
          </p>
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_USER_FEATURES, resolveFeatures };
