"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiClient, ApiError } from "@/lib/api-client";
import type { IBackgroundAnimation } from "@/types/background-animation.types";
import { cn } from "@/lib/utils";

export function BackgroundAnimationsManager({
  initial,
}: {
  initial: IBackgroundAnimation[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function patch(
    id: string,
    body: { isActive?: boolean; isDefault?: boolean },
  ) {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      const res = await apiClient<{ data: IBackgroundAnimation[] }>(
        "/api/admin/background-animations",
        { method: "PATCH", body: JSON.stringify({ id, ...body }) },
      );
      setItems(res.data);
      setMessage("Saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Active designs appear in the card builder. One design is the global
        default for cards that have not chosen an animation yet.
      </p>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-teal-400/30 bg-teal-500/10 px-3 py-2 text-sm text-teal-200">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article
            key={item._id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-card/80 shadow-panel",
              item.isActive
                ? "border-teal-400/25"
                : "border-white/10 opacity-75",
            )}
          >
            <div className="relative aspect-[16/9] bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnailUrl || "/bg-previews/none.svg"}
                alt=""
                className="h-full w-full object-cover"
              />
              {item.isDefault ? (
                <span className="absolute left-2 top-2 rounded-full border border-teal-400/40 bg-teal-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-100">
                  Default
                </span>
              ) : null}
            </div>
            <div className="space-y-3 p-4">
              <div>
                <h3 className="font-display text-base font-bold">{item.name}</h3>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {item.slug}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={item.isActive ? "secondary" : "outline"}
                  disabled={busyId === item._id}
                  onClick={() =>
                    void patch(item._id, { isActive: !item.isActive })
                  }
                >
                  {item.isActive ? "Active" : "Inactive"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={item.isDefault ? "default" : "ghost"}
                  disabled={busyId === item._id || item.isDefault}
                  onClick={() => void patch(item._id, { isDefault: true })}
                >
                  {item.isDefault ? "Is default" : "Set default"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
