"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";
import { apiClient, ApiError } from "@/lib/api-client";
import { FeaturePermissionChecklist } from "@/components/admin/FeaturePermissionChecklist";
import {
  DEFAULT_USER_FEATURES,
  type IUserFeatures,
} from "@/types/platform.types";
import { defaultCustomDomainFeatureForPlan } from "@/lib/custom-domain-access";

export default function CreateUserPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<IUserFeatures>({
    ...DEFAULT_USER_FEATURES,
    customDomain: defaultCustomDomainFeatureForPlan("basic"),
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    plan: "basic",
    years: 1,
    customDays: "" as number | "",
  });

  function setPlan(plan: string) {
    setForm((f) => ({ ...f, plan }));
    setFeatures((prev) => ({
      ...prev,
      customDomain: defaultCustomDomainFeatureForPlan(plan),
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiClient("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          plan: form.plan,
          role: "user",
          years: Number(form.years),
          features,
          ...(form.customDays
            ? { customDays: Number(form.customDays) }
            : {}),
        }),
      });
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Create user"
        description="Assign login, subscription validity, and feature permissions."
      />
      <form
        onSubmit={onSubmit}
        className="max-w-2xl space-y-4 rounded-2xl border bg-card p-5"
      >
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email (login)</Label>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Temporary password</Label>
          <Input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              value={form.plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="free">Free</option>
              <option value="basic">Basic (yearly)</option>
              <option value="premium">Premium (yearly)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Years</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.years}
              onChange={(e) =>
                setForm({ ...form, years: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Or custom days</Label>
            <Input
              type="number"
              min={1}
              max={3650}
              placeholder="e.g. 90"
              value={form.customDays}
              onChange={(e) =>
                setForm({
                  ...form,
                  customDays: e.target.value ? Number(e.target.value) : "",
                })
              }
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          If custom days is set, it overrides years × plan duration.
        </p>

        <div className="rounded-xl border bg-muted/20 p-4">
          <FeaturePermissionChecklist
            value={features}
            onChange={setFeatures}
          />
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={loading}
          className="bg-teal-700 hover:bg-teal-800"
        >
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
