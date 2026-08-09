"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";
import { apiClient, ApiError } from "@/lib/api-client";
import type { IPlatformSettings } from "@/types/platform.types";

export function PlatformSettingsForm({
  initial,
}: {
  initial: IPlatformSettings;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await apiClient("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setMessage("Settings saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-4 rounded-2xl border bg-card p-5"
    >
      <div className="space-y-1.5">
        <Label>Brand / company name</Label>
        <Input
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          placeholder="FutureCard"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Footer tagline</Label>
        <Input
          value={form.footerTagline}
          onChange={(e) => setForm({ ...form, footerTagline: e.target.value })}
          placeholder="Create your own digital visiting card"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Super Admin WhatsApp number</Label>
        <Input
          value={form.adminWhatsappNumber}
          onChange={(e) =>
            setForm({ ...form, adminWhatsappNumber: e.target.value })
          }
          placeholder="+91 98765 43210"
        />
        <p className="text-xs text-muted-foreground">
          Used by “Need This Digital Card? Contact Us” on every public card.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label>Company website URL</Label>
        <Input
          type="url"
          value={form.companyWebsiteUrl}
          onChange={(e) =>
            setForm({ ...form, companyWebsiteUrl: e.target.value })
          }
          placeholder="https://youragency.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Platform CNAME target</Label>
        <Input
          value={form.platformCnameTarget}
          onChange={(e) =>
            setForm({ ...form, platformCnameTarget: e.target.value })
          }
          placeholder="app.futurecard.pro"
        />
        <p className="text-xs text-muted-foreground">
          Clients create a CNAME from their custom domain to this hostname. Also
          set PLATFORM_HOSTS / NEXT_PUBLIC_PLATFORM_HOST so middleware treats it
          as the main app (not a tenant domain).
        </p>
      </div>
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
       
      >
        {saving ? "Saving…" : "Save branding settings"}
      </Button>
    </form>
  );
}
