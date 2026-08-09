"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/misc";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  DEFAULT_LANDING_CMS,
  resolveLandingCms,
  type ILandingCms,
  type LandingFeatureIconKey,
} from "@/types/landing-cms.types";

const SECTIONS = [
  "hero",
  "features",
  "pricing",
  "testimonials",
  "cta",
  "footer",
] as const;

type SectionId = (typeof SECTIONS)[number];

const ICON_OPTIONS: { value: LandingFeatureIconKey; label: string }[] = [
  { value: "badge", label: "Verified badge" },
  { value: "package", label: "Package / inquiry" },
  { value: "qr", label: "QR / Pay" },
  { value: "images", label: "Gallery" },
  { value: "globe", label: "Domain / globe" },
  { value: "shield", label: "Shield / admin" },
];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function LandingCmsForm({ initial }: { initial?: ILandingCms | null }) {
  const router = useRouter();
  const [tab, setTab] = useState<SectionId>("hero");
  const [cms, setCms] = useState<ILandingCms>(() =>
    resolveLandingCms(initial || DEFAULT_LANDING_CMS),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await apiClient<{ data: ILandingCms }>("/api/admin/landing", {
        method: "PUT",
        body: JSON.stringify({ landingCms: cms }),
      });
      setCms(resolveLandingCms(res.data));
      setMessage("Landing page content saved. Public homepage will use it immediately.");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              tab === id
                ? "border border-teal-400/30 bg-teal-400/15 text-teal-100"
                : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      {tab === "hero" ? (
        <section className="space-y-3 rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Hero</h2>
          <Field label="Badge">
            <Input
              value={cms.hero.badge}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  hero: { ...c.hero, badge: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Brand line">
            <Input
              value={cms.hero.brandLine}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  hero: { ...c.hero, brandLine: e.target.value },
                }))
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Typewriter prefix">
              <Input
                value={cms.hero.typewriterPrefix}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    hero: { ...c.hero, typewriterPrefix: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Typewriter suffix">
              <Input
                value={cms.hero.typewriterSuffix}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    hero: { ...c.hero, typewriterSuffix: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
          <Field label="Typewriter phrases (one per line)">
            <Textarea
              rows={4}
              value={cms.hero.typewriterPhrases.join("\n")}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  hero: {
                    ...c.hero,
                    typewriterPhrases: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                }))
              }
            />
          </Field>
          <Field label="Subtitle">
            <Textarea
              rows={3}
              value={cms.hero.subtitle}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  hero: { ...c.hero, subtitle: e.target.value },
                }))
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary CTA label">
              <Input
                value={cms.hero.primaryCtaLabel}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    hero: { ...c.hero, primaryCtaLabel: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Primary CTA link">
              <Input
                value={cms.hero.primaryCtaHref}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    hero: { ...c.hero, primaryCtaHref: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Secondary CTA label">
              <Input
                value={cms.hero.secondaryCtaLabel}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    hero: { ...c.hero, secondaryCtaLabel: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Secondary CTA link">
              <Input
                value={cms.hero.secondaryCtaHref}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    hero: { ...c.hero, secondaryCtaHref: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
        </section>
      ) : null}

      {tab === "features" ? (
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Features</h2>
          <Field label="Eyebrow">
            <Input
              value={cms.features.eyebrow}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  features: { ...c.features, eyebrow: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Title">
            <Input
              value={cms.features.title}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  features: { ...c.features, title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Subtitle">
            <Textarea
              rows={2}
              value={cms.features.subtitle}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  features: { ...c.features, subtitle: e.target.value },
                }))
              }
            />
          </Field>

          {cms.features.items.map((item, idx) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Feature {idx + 1}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  disabled={cms.features.items.length <= 1}
                  onClick={() =>
                    setCms((c) => ({
                      ...c,
                      features: {
                        ...c.features,
                        items: c.features.items.filter((x) => x.id !== item.id),
                      },
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
              <Input
                placeholder="Title"
                value={item.title}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    features: {
                      ...c.features,
                      items: c.features.items.map((x) =>
                        x.id === item.id ? { ...x, title: e.target.value } : x,
                      ),
                    },
                  }))
                }
              />
              <Textarea
                rows={2}
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    features: {
                      ...c.features,
                      items: c.features.items.map((x) =>
                        x.id === item.id
                          ? { ...x, description: e.target.value }
                          : x,
                      ),
                    },
                  }))
                }
              />
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                  value={item.icon}
                  onChange={(e) =>
                    setCms((c) => ({
                      ...c,
                      features: {
                        ...c.features,
                        items: c.features.items.map((x) =>
                          x.id === item.id
                            ? {
                                ...x,
                                icon: e.target.value as LandingFeatureIconKey,
                              }
                            : x,
                        ),
                      },
                    }))
                  }
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(item.wide)}
                    onChange={(e) =>
                      setCms((c) => ({
                        ...c,
                        features: {
                          ...c.features,
                          items: c.features.items.map((x) =>
                            x.id === item.id
                              ? { ...x, wide: e.target.checked }
                              : x,
                          ),
                        },
                      }))
                    }
                  />
                  Wide tile
                </label>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCms((c) => ({
                ...c,
                features: {
                  ...c.features,
                  items: [
                    ...c.features.items,
                    {
                      id: uid("f"),
                      title: "New feature",
                      description: "Describe this feature",
                      icon: "badge",
                    },
                  ],
                },
              }))
            }
          >
            Add feature
          </Button>
        </section>
      ) : null}

      {tab === "pricing" ? (
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Pricing</h2>
          <Field label="Eyebrow">
            <Input
              value={cms.pricing.eyebrow}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  pricing: { ...c.pricing, eyebrow: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Title">
            <Input
              value={cms.pricing.title}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  pricing: { ...c.pricing, title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Subtitle">
            <Textarea
              rows={2}
              value={cms.pricing.subtitle}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  pricing: { ...c.pricing, subtitle: e.target.value },
                }))
              }
            />
          </Field>

          {cms.pricing.plans.map((plan) => (
            <div
              key={plan.id}
              className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{plan.name || "Plan"}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  disabled={cms.pricing.plans.length <= 1}
                  onClick={() =>
                    setCms((c) => ({
                      ...c,
                      pricing: {
                        ...c.pricing,
                        plans: c.pricing.plans.filter((p) => p.id !== plan.id),
                      },
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Name"
                  value={plan.name}
                  onChange={(e) =>
                    setCms((c) => ({
                      ...c,
                      pricing: {
                        ...c.pricing,
                        plans: c.pricing.plans.map((p) =>
                          p.id === plan.id ? { ...p, name: e.target.value } : p,
                        ),
                      },
                    }))
                  }
                />
                <Input
                  placeholder="Blurb"
                  value={plan.blurb}
                  onChange={(e) =>
                    setCms((c) => ({
                      ...c,
                      pricing: {
                        ...c.pricing,
                        plans: c.pricing.plans.map((p) =>
                          p.id === plan.id ? { ...p, blurb: e.target.value } : p,
                        ),
                      },
                    }))
                  }
                />
                <Field label="Monthly ₹">
                  <Input
                    type="number"
                    min={0}
                    value={plan.monthly}
                    onChange={(e) =>
                      setCms((c) => ({
                        ...c,
                        pricing: {
                          ...c.pricing,
                          plans: c.pricing.plans.map((p) =>
                            p.id === plan.id
                              ? { ...p, monthly: Number(e.target.value) || 0 }
                              : p,
                          ),
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Yearly ₹">
                  <Input
                    type="number"
                    min={0}
                    value={plan.yearly}
                    onChange={(e) =>
                      setCms((c) => ({
                        ...c,
                        pricing: {
                          ...c.pricing,
                          plans: c.pricing.plans.map((p) =>
                            p.id === plan.id
                              ? { ...p, yearly: Number(e.target.value) || 0 }
                              : p,
                          ),
                        },
                      }))
                    }
                  />
                </Field>
                <Input
                  placeholder="CTA label"
                  value={plan.ctaLabel}
                  onChange={(e) =>
                    setCms((c) => ({
                      ...c,
                      pricing: {
                        ...c.pricing,
                        plans: c.pricing.plans.map((p) =>
                          p.id === plan.id
                            ? { ...p, ctaLabel: e.target.value }
                            : p,
                        ),
                      },
                    }))
                  }
                />
                <Input
                  placeholder="CTA link"
                  value={plan.ctaHref}
                  onChange={(e) =>
                    setCms((c) => ({
                      ...c,
                      pricing: {
                        ...c.pricing,
                        plans: c.pricing.plans.map((p) =>
                          p.id === plan.id
                            ? { ...p, ctaHref: e.target.value }
                            : p,
                        ),
                      },
                    }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(plan.popular)}
                  onChange={(e) =>
                    setCms((c) => ({
                      ...c,
                      pricing: {
                        ...c.pricing,
                        plans: c.pricing.plans.map((p) =>
                          p.id === plan.id
                            ? { ...p, popular: e.target.checked }
                            : p,
                        ),
                      },
                    }))
                  }
                />
                Mark as popular
              </label>
              <Field label="Features (one per line)">
                <Textarea
                  rows={4}
                  value={plan.features.join("\n")}
                  onChange={(e) =>
                    setCms((c) => ({
                      ...c,
                      pricing: {
                        ...c.pricing,
                        plans: c.pricing.plans.map((p) =>
                          p.id === plan.id
                            ? {
                                ...p,
                                features: e.target.value
                                  .split("\n")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              }
                            : p,
                        ),
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCms((c) => ({
                ...c,
                pricing: {
                  ...c.pricing,
                  plans: [
                    ...c.pricing.plans,
                    {
                      id: uid("plan"),
                      name: "New plan",
                      blurb: "Short description",
                      monthly: 0,
                      yearly: 0,
                      features: ["Feature one"],
                      ctaLabel: "Choose plan",
                      ctaHref: "/register",
                    },
                  ],
                },
              }))
            }
          >
            Add plan
          </Button>
        </section>
      ) : null}

      {tab === "testimonials" ? (
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Testimonials</h2>
          <Field label="Eyebrow">
            <Input
              value={cms.testimonials.eyebrow}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  testimonials: { ...c.testimonials, eyebrow: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Title">
            <Input
              value={cms.testimonials.title}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  testimonials: { ...c.testimonials, title: e.target.value },
                }))
              }
            />
          </Field>
          {cms.testimonials.items.map((item) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex justify-between">
                <p className="text-sm font-semibold">{item.name || "Review"}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  disabled={cms.testimonials.items.length <= 1}
                  onClick={() =>
                    setCms((c) => ({
                      ...c,
                      testimonials: {
                        ...c.testimonials,
                        items: c.testimonials.items.filter(
                          (x) => x.id !== item.id,
                        ),
                      },
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
              <Input
                placeholder="Name"
                value={item.name}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    testimonials: {
                      ...c.testimonials,
                      items: c.testimonials.items.map((x) =>
                        x.id === item.id ? { ...x, name: e.target.value } : x,
                      ),
                    },
                  }))
                }
              />
              <Input
                placeholder="Role"
                value={item.role}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    testimonials: {
                      ...c.testimonials,
                      items: c.testimonials.items.map((x) =>
                        x.id === item.id ? { ...x, role: e.target.value } : x,
                      ),
                    },
                  }))
                }
              />
              <Textarea
                rows={3}
                placeholder="Quote"
                value={item.quote}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    testimonials: {
                      ...c.testimonials,
                      items: c.testimonials.items.map((x) =>
                        x.id === item.id ? { ...x, quote: e.target.value } : x,
                      ),
                    },
                  }))
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCms((c) => ({
                ...c,
                testimonials: {
                  ...c.testimonials,
                  items: [
                    ...c.testimonials.items,
                    {
                      id: uid("t"),
                      name: "Customer name",
                      role: "Role, City",
                      quote: "Share a short success story.",
                    },
                  ],
                },
              }))
            }
          >
            Add testimonial
          </Button>
        </section>
      ) : null}

      {tab === "cta" ? (
        <section className="space-y-3 rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Bottom CTA band</h2>
          <Field label="Title">
            <Input
              value={cms.cta.title}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  cta: { ...c.cta, title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Subtitle">
            <Textarea
              rows={2}
              value={cms.cta.subtitle}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  cta: { ...c.cta, subtitle: e.target.value },
                }))
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Button label">
              <Input
                value={cms.cta.buttonLabel}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    cta: { ...c.cta, buttonLabel: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Button link">
              <Input
                value={cms.cta.buttonHref}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    cta: { ...c.cta, buttonHref: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
        </section>
      ) : null}

      {tab === "footer" ? (
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Footer</h2>
          <Field label="Brand subline">
            <Input
              value={cms.footer.brandSubline}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  footer: { ...c.footer, brandSubline: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={3}
              value={cms.footer.description}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  footer: { ...c.footer, description: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Copyright note">
            <Input
              value={cms.footer.copyrightNote}
              onChange={(e) =>
                setCms((c) => ({
                  ...c,
                  footer: { ...c.footer, copyrightNote: e.target.value },
                }))
              }
            />
          </Field>

          {cms.footer.columns.map((col, colIdx) => (
            <div
              key={`${col.title}-${colIdx}`}
              className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <Input
                placeholder="Column title"
                value={col.title}
                onChange={(e) =>
                  setCms((c) => ({
                    ...c,
                    footer: {
                      ...c.footer,
                      columns: c.footer.columns.map((x, i) =>
                        i === colIdx ? { ...x, title: e.target.value } : x,
                      ),
                    },
                  }))
                }
              />
              <Field label="Links (label|href per line)">
                <Textarea
                  rows={4}
                  value={col.links
                    .map((l) => `${l.label}|${l.href}`)
                    .join("\n")}
                  onChange={(e) =>
                    setCms((c) => ({
                      ...c,
                      footer: {
                        ...c.footer,
                        columns: c.footer.columns.map((x, i) =>
                          i === colIdx
                            ? {
                                ...x,
                                links: e.target.value
                                  .split("\n")
                                  .map((line) => line.trim())
                                  .filter(Boolean)
                                  .map((line) => {
                                    const [label, href] = line.split("|");
                                    return {
                                      label: (label || "Link").trim(),
                                      href: (href || "#").trim(),
                                    };
                                  }),
                              }
                            : x,
                        ),
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ))}
        </section>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save landing page"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
