"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { IBackgroundAnimation } from "@/types/background-animation.types";
import { cn } from "@/lib/utils";

export function BackgroundAnimationPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (slug: string) => void;
}) {
  const [options, setOptions] = useState<IBackgroundAnimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient<{ data: IBackgroundAnimation[] }>(
          "/api/background-animations",
        );
        if (cancelled) return;
        setOptions(res.data || []);
        if (!value) {
          const def =
            res.data.find((d) => d.isDefault) || res.data[0];
          if (def) onChange(def.slug);
        }
      } catch {
        if (!cancelled) setError("Could not load background designs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // intentionally omit onChange/value to avoid re-fetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <p className="text-xs text-muted-foreground">Loading backgrounds…</p>
    );
  }

  if (error) {
    return <p className="text-xs text-red-400">{error}</p>;
  }

  if (!options.length) {
    return (
      <p className="text-xs text-muted-foreground">
        No active background designs yet. Ask Super Admin to activate designs
        under Manage Backgrounds.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = value === opt.slug;
        return (
          <button
            key={opt._id}
            type="button"
            onClick={() => onChange(opt.slug)}
            className={cn(
              "overflow-hidden rounded-xl border text-left transition",
              selected
                ? "border-teal-400/50 ring-2 ring-teal-400/30"
                : "border-white/10 hover:border-teal-400/25",
            )}
          >
            <div className="aspect-[16/9] bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={opt.thumbnailUrl || "/bg-previews/none.svg"}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{opt.name}</span>
                <span className="flex items-center gap-1.5">
                  {opt.animationType === "slideshow" ? (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-violet-300/90">
                      Photos
                    </span>
                  ) : null}
                  {opt.isDefault ? (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-teal-300/80">
                      Default
                    </span>
                  ) : null}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                {opt.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
