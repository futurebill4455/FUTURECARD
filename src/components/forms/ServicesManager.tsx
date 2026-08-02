"use client";

import { useState } from "react";
import type { IServiceItem } from "@/types/card.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/misc";
import { MediaUpload } from "@/components/forms/ImageUpload";

function newService(): IServiceItem {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `svc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    price: "",
    description: "",
    image: "",
  };
}

export function ServicesManager({
  services,
  onChange,
}: {
  services: IServiceItem[];
  onChange: (services: IServiceItem[]) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(
    services[0]?.id ?? null,
  );

  function update(id: string, patch: Partial<IServiceItem>) {
    onChange(services.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function add() {
    if (services.length >= 10) return;
    const item = newService();
    onChange([...services, item]);
    setExpanded(item.id);
  }

  function remove(id: string) {
    onChange(services.filter((s) => s.id !== id));
    if (expanded === id) setExpanded(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Add up to 10 services or products. Shown on the public card under View
          Service.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={services.length >= 10}
          onClick={add}
        >
          Add service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No services yet. Click “Add service” to create your first offer.
        </div>
      ) : null}

      <div className="space-y-2">
        {services.map((svc, idx) => {
          const open = expanded === svc.id;
          return (
            <div
              key={svc.id}
              className="overflow-hidden rounded-xl border bg-muted/20"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
                onClick={() => setExpanded(open ? null : svc.id)}
              >
                <div>
                  <div className="text-sm font-semibold">
                    {svc.title || `Service ${idx + 1}`}
                  </div>
                  {svc.price ? (
                    <div className="text-xs text-muted-foreground">
                      {svc.price}
                    </div>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {open ? "▴" : "▾"}
                </span>
              </button>

              {open ? (
                <div className="space-y-3 border-t px-3 py-3">
                  <MediaUpload
                    label="Service image"
                    kind="image"
                    value={svc.image}
                    onChange={(image) => update(svc.id, { image })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Title / name</Label>
                      <Input
                        required
                        value={svc.title}
                        onChange={(e) =>
                          update(svc.id, { title: e.target.value })
                        }
                        placeholder="Premium Consultation"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Price / value</Label>
                      <Input
                        value={svc.price}
                        onChange={(e) =>
                          update(svc.id, { price: e.target.value })
                        }
                        placeholder="₹999 / Starting at $49"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea
                      value={svc.description}
                      onChange={(e) =>
                        update(svc.id, { description: e.target.value })
                      }
                      placeholder="What is included, deliverables, duration…"
                      maxLength={1000}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => remove(svc.id)}
                  >
                    Remove service
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {services.length}/10 services
      </p>
    </div>
  );
}
