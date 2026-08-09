"use client";

import { useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api-client";
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
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient<{
          data: IBackgroundAnimation[];
          message?: string;
        }>("/api/background-animations");
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setOptions(list);
        if (res.message) setNotice(res.message);
        if (!value && list.length) {
          const def = list.find((d) => d.isDefault) || list[0];
          if (def) onChange(def.slug);
        }
        if (!list.length) {
          setError(
            "No active background designs found. Ask Super Admin to activate designs under Manage Backgrounds, or run migration 012_background_animations_rls.sql.",
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load background designs.",
          );
        }
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

  if (error && !options.length) {
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
    <div className="space-y-3">
      {notice ? (
        <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
          {notice}
        </p>
      ) : null}
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
    </div>
  );
}
