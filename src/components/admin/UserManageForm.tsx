"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  DEFAULT_USER_LIMITS,
  type IUserFeatures,
  type IUserLimits,
} from "@/types/platform.types";
import { FeaturePermissionChecklist } from "@/components/admin/FeaturePermissionChecklist";
import { resolveFeatures } from "@/types/platform.types";
import { defaultCustomDomainFeatureForPlan } from "@/lib/custom-domain-access";
import { PLAN_LIMITS } from "@/lib/constants";

type SubInfo = {
  plan?: string;
  endDate?: string;
  isActive?: boolean;
  paymentStatus?: string;
} | null;

export function UserManageForm({
  userId,
  initial,
}: {
  userId: string;
  initial: {
    name: string;
    email: string;
    isActive: boolean;
    features?: IUserFeatures;
    limits?: IUserLimits;
    subscription?: SubInfo;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [isActive, setIsActive] = useState(initial.isActive);
  const [features, setFeatures] = useState<IUserFeatures>(() =>
    resolveFeatures(initial.features),
  );
  const [limits, setLimits] = useState<IUserLimits>({
    ...DEFAULT_USER_LIMITS,
    ...initial.limits,
  });
  const [plan, setPlan] = useState(initial.subscription?.plan || "basic");
  const [endDate, setEndDate] = useState(() => {
    if (!initial.subscription?.endDate) return "";
    const d = new Date(initial.subscription.endDate);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  });
  const [renewDays, setRenewDays] = useState(365);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await apiClient(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          isActive,
          features,
          limits,
          plan,
          endDate: endDate
            ? new Date(`${endDate}T23:59:59`).toISOString()
            : undefined,
        }),
      });
      setMessage("User updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function extendDays() {
    setSaving(true);
    setError("");
    try {
      await apiClient(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ renewDays: Number(renewDays), isActive: true }),
      });
      setMessage(`Extended by ${renewDays} days.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Renew failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Account</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={initial.email} disabled />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Account active
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg font-bold">
          Subscription & validity
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              value={plan}
              onChange={(e) => {
                const next = e.target.value;
                setPlan(next);
                setFeatures((f) => ({
                  ...f,
                  customDomain: defaultCustomDomainFeatureForPlan(next),
                }));
                const maxCards =
                  PLAN_LIMITS[next as keyof typeof PLAN_LIMITS]?.maxCards;
                if (maxCards) {
                  setLimits((l) => ({ ...l, maxCards }));
                }
              }}
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Expiry date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1.5">
            <Label>Extend by days</Label>
            <Input
              type="number"
              min={1}
              max={3650}
              value={renewDays}
              onChange={(e) => setRenewDays(Number(e.target.value))}
              className="w-32"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => void extendDays()}
          >
            Extend now
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Status:{" "}
          {initial.subscription?.paymentStatus || "—"} · Active:{" "}
          {initial.subscription?.isActive ? "Yes" : "No"}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <FeaturePermissionChecklist value={features} onChange={setFeatures} />
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Limits</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["maxCards", "Max cards"],
              ["maxServices", "Max services"],
              ["maxGalleryImages", "Max gallery images"],
              ["maxGalleryVideos", "Max gallery videos"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
                type="number"
                min={0}
                value={limits[key]}
                onChange={(e) =>
                  setLimits((l) => ({
                    ...l,
                    [key]: Number(e.target.value),
                  }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={saving}
        className="bg-teal-700 hover:bg-teal-800"
      >
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
