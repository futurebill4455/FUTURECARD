"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";
import { apiClient, ApiError } from "@/lib/api-client";
import type { IPlatformSettings } from "@/types/platform.types";
import { MediaUpload } from "@/components/forms/ImageUpload";

export function PlatformSettingsForm({
  initial,
}: {
  initial: IPlatformSettings;
}) {
  const router = useRouter();
  const [form, setForm] = useState<IPlatformSettings>({
    ...initial,
    ambientMode: initial.ambientMode || "gradient",
    ambientVideo: initial.ambientVideo || "",
    ambientImages: initial.ambientImages || [],
  });
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

  const images = form.ambientImages || [];

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-5 rounded-2xl border border-white/10 glass p-6 shadow-panel"
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
      </div>
      <div className="space-y-1.5">
        <Label>Company website URL</Label>
        <Input
          type="url"
          value={form.companyWebsiteUrl}
          onChange={(e) =>
            setForm({ ...form, companyWebsiteUrl: e.target.value })
          }
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
      </div>

      <section className="space-y-3 rounded-2xl border border-teal-400/20 bg-teal-400/5 p-4">
        <h3 className="font-display text-lg font-bold text-teal-100">
          Immersive shell background
        </h3>
        <p className="text-xs text-muted-foreground">
          Full-page stage for landing, dashboards, admin, and public cards. Run{" "}
          <code className="text-teal-300">002_ambient_background.sql</code> in
          Supabase once. Dark neon media works best. Each card’s own cover /
          slideshow stays inside the card header only.
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["gradient", "Neon gradient"],
              ["video", "Looping video"],
              ["slideshow", "3-image slideshow"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, ambientMode: value })}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                form.ambientMode === value
                  ? "border-teal-400/50 bg-teal-400/20 text-teal-100"
                  : "border-white/10 text-muted-foreground hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {form.ambientMode === "video" ? (
          <div className="space-y-2">
            <Label>Background video URL</Label>
            <MediaUpload
              label="Ambient video"
              kind="video"
              value={form.ambientVideo || ""}
              onChange={(url) => setForm({ ...form, ambientVideo: url })}
              maxSeconds={30}
            />
            <Input
              value={form.ambientVideo || ""}
              onChange={(e) =>
                setForm({ ...form, ambientVideo: e.target.value })
              }
              placeholder="https://…/ambient.mp4"
            />
          </div>
        ) : null}

        {form.ambientMode === "slideshow" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Provide exactly 3 dark cinematic images for cross-fade.
            </p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1.5">
                <Label>Slide {i + 1}</Label>
                <MediaUpload
                  label={`Ambient slide ${i + 1}`}
                  value={images[i] || ""}
                  onChange={(url) => {
                    const next = [...images];
                    next[i] = url;
                    setForm({
                      ...form,
                      ambientImages: next.filter(Boolean).slice(0, 3),
                    });
                  }}
                />
                <Input
                  value={images[i] || ""}
                  onChange={(e) => {
                    const next = [...images];
                    next[i] = e.target.value;
                    setForm({
                      ...form,
                      ambientImages: next,
                    });
                  }}
                  placeholder="https://…/slide.jpg"
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>

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
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save branding settings"}
      </Button>
    </form>
  );
}
