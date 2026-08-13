"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/misc";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  CARD_PROFILE_TYPE_OPTIONS,
  resolveCardProfileType,
  type CardProfileType,
} from "@/types/card-profile.types";
import { cardPublicUrl } from "@/lib/app-url";
import type { ICard } from "@/types/card.types";

export function AdminUserCardsPanel({ cards }: { cards: ICard[] }) {
  if (!cards.length) {
    return (
      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Cards & template type</h2>
        <p className="text-sm text-muted-foreground">
          This user has no cards yet.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5">
      <div>
        <h2 className="font-display text-lg font-bold">Cards & template type</h2>
        <p className="text-xs text-muted-foreground">
          Choose Individual, Business, or Shop for each card. Saving applies the
          matching public layout and section preset. Users cannot change this.
        </p>
      </div>
      <div className="space-y-3">
        {cards.map((card) => (
          <AdminCardProfileRow key={card._id} card={card} />
        ))}
      </div>
    </section>
  );
}

function AdminCardProfileRow({ card }: { card: ICard }) {
  const router = useRouter();
  const [profileType, setProfileType] = useState<CardProfileType>(() =>
    resolveCardProfileType(card.profileType),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await apiClient(`/api/admin/cards/${card._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          profileType,
          applySectionPreset: true,
        }),
      });
      setMessage("Saved — public layout + section preset updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{card.companyName || "Untitled"}</p>
          <p className="text-xs text-muted-foreground">
            {cardPublicUrl(card.username)}
            {card.isActive ? (
              <span className="ml-2 text-teal-300">· Live</span>
            ) : (
              <span className="ml-2 text-amber-300">· Draft</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={cardPublicUrl(card.username)} target="_blank">
              Open public
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label>Card template type</Label>
          <select
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            value={profileType}
            onChange={(e) =>
              setProfileType(resolveCardProfileType(e.target.value))
            }
          >
            {CARD_PROFILE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            {
              CARD_PROFILE_TYPE_OPTIONS.find((o) => o.value === profileType)
                ?.description
            }
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : "Save type"}
        </Button>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      ) : null}
      {message ? (
        <p className="mt-2 text-xs text-emerald-400">{message}</p>
      ) : null}
    </div>
  );
}
