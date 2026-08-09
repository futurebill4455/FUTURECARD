"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/misc";
import { DEFAULT_BUSINESS_HOURS } from "@/lib/constants";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  BackgroundImagesUpload,
  MediaUpload,
  VideoGalleryUpload,
} from "@/components/forms/ImageUpload";
import { ThemeCustomizer } from "@/components/forms/ThemeCustomizer";
import { ServicesManager } from "@/components/forms/ServicesManager";
import { PaymentDetailsForm } from "@/components/forms/PaymentDetailsForm";
import { ButtonsManager } from "@/components/forms/ButtonsManager";
import { BankDetailsForm } from "@/components/cards/BankDetailsModal";
import { CardPreview } from "@/components/cards/CardPreview";
import type {
  BackgroundMediaType,
  ICard,
  IActionButton,
  IBankDetails,
  IBusinessHour,
  IExtraLinks,
  IPaymentInfo,
  IPrimaryCta,
  IServiceItem,
  ISocialLinks,
  IThemeColors,
} from "@/types/card.types";
import {
  DEFAULT_BANK_DETAILS,
  DEFAULT_PAYMENT_INFO,
  DEFAULT_THEME,
} from "@/types/card.types";
import {
  normalizePrimaryCtas,
  resolveActionButtons,
  syncFieldsFromActionButtons,
} from "@/lib/action-buttons";
import { FeatureLock } from "@/components/admin/FeaturePermissionChecklist";
import { CardSectionToggles } from "@/components/admin/CardSectionsChecklist";
import { BackgroundAnimationPicker } from "@/components/forms/BackgroundAnimationPicker";
import {
  resolveFeatures,
  type IUserFeatures,
} from "@/types/platform.types";
import {
  DEFAULT_CARD_SECTIONS,
  resolveCardSections,
  type ICardSections,
} from "@/types/card-sections.types";

type Mode = "create" | "edit";

export function CardBuilderForm({
  mode,
  initial,
  features: rawFeatures,
  cardSections: rawCardSections,
}: {
  mode: Mode;
  initial?: ICard;
  features?: IUserFeatures | null;
  /** Super Admin mini-site section grants for this account */
  cardSections?: ICardSections | null;
}) {
  const features = resolveFeatures(rawFeatures);
  const adminSections = resolveCardSections(rawCardSections);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [featuresEnabled, setFeaturesEnabled] = useState<ICardSections>(() =>
    resolveCardSections(initial?.featuresEnabled ?? DEFAULT_CARD_SECTIONS),
  );
  const [backgroundAnimationSlug, setBackgroundAnimationSlug] = useState(
    initial?.backgroundAnimationSlug || "",
  );
  const [form, setForm] = useState({
    username: initial?.username ?? "",
    companyName: initial?.companyName ?? "",
    jobTitle: initial?.jobTitle ?? "",
    businessType: initial?.businessType ?? "",
    businessCategory: initial?.businessCategory ?? "",
    aboutUs: initial?.aboutUs ?? "",
    gstNumber: initial?.gstNumber ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    whatsappNumber: initial?.whatsappNumber ?? "",
    website: initial?.website ?? "",
    profileImage: initial?.profileImage ?? "",
    coverImage: initial?.coverImage ?? "",
    address: initial?.location?.address ?? "",
    googleMapsUrl: initial?.location?.googleMapsUrl ?? "",
    isVerified: initial?.isVerified ?? false,
    isActive: initial?.isActive ?? true,
  });
  const [theme, setTheme] = useState<IThemeColors>(
    initial?.theme ?? DEFAULT_THEME,
  );
  const [ctas, setCtas] = useState<IPrimaryCta[]>(() =>
    normalizePrimaryCtas(initial?.primaryCtas),
  );
  const [extra, setExtra] = useState<IExtraLinks>(initial?.extraLinks ?? {});
  const [actionButtons, setActionButtons] = useState<IActionButton[]>(() =>
    resolveActionButtons(initial),
  );
  const [gallery, setGallery] = useState<string[]>(
    initial?.galleryImages ?? [],
  );
  const [galleryVideos, setGalleryVideos] = useState<string[]>(
    initial?.galleryVideos ?? [],
  );
  const [services, setServices] = useState<IServiceItem[]>(
    initial?.services ?? [],
  );
  const [paymentInfo, setPaymentInfo] = useState<IPaymentInfo>(
    initial?.paymentInfo ?? DEFAULT_PAYMENT_INFO,
  );
  const [bankDetails, setBankDetails] = useState<IBankDetails>(
    initial?.bankDetails ?? DEFAULT_BANK_DETAILS,
  );
  const [mediaType, setMediaType] = useState<BackgroundMediaType>(
    initial?.backgroundMediaType ??
      (initial?.backgroundVideo
        ? "video"
        : initial?.backgroundImages?.length
          ? "slideshow"
          : initial?.coverImage
            ? "slideshow"
            : "none"),
  );
  const [bgImages, setBgImages] = useState<string[]>(
    initial?.backgroundImages?.length
      ? initial.backgroundImages
      : initial?.coverImage
        ? [initial.coverImage]
        : [],
  );
  const [bgVideo, setBgVideo] = useState(initial?.backgroundVideo ?? "");
  const [socials, setSocials] = useState<ISocialLinks>(
    initial?.socialLinks ?? {},
  );
  const [hours, setHours] = useState<IBusinessHour[]>(
    initial?.businessHours?.length
      ? initial.businessHours
      : DEFAULT_BUSINESS_HOURS,
  );

  const previewCard: ICard = {
    _id: initial?._id ?? "preview",
    userId: initial?.userId ?? "",
    username: form.username || "preview",
    companyName: form.companyName || "Your Business",
    jobTitle: form.jobTitle || "Tagline",
    businessType: form.businessType,
    businessCategory: form.businessCategory,
    aboutUs: form.aboutUs,
    gstNumber: form.gstNumber,
    email: form.email,
    phone: form.phone,
    whatsappNumber: form.whatsappNumber,
    website: form.website,
    profileImage: form.profileImage,
    coverImage: form.coverImage,
    backgroundMediaType: mediaType,
    backgroundImages: bgImages,
    backgroundVideo: bgVideo,
    socialLinks: socials,
    location: {
      address: form.address,
      googleMapsUrl: form.googleMapsUrl,
    },
    businessHours: hours,
    theme,
    primaryCtas: ctas,
    extraLinks: extra,
    galleryImages: gallery,
    galleryVideos,
    services,
    paymentInfo,
    bankDetails,
    actionButtons,
    isVerified: form.isVerified,
    isActive: form.isActive,
    template: "classic",
    featuresEnabled,
    backgroundAnimationSlug: backgroundAnimationSlug || undefined,
    createdAt: initial?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (mediaType === "slideshow" && bgImages.length > 0 && bgImages.length < 3) {
      setError("Please upload 3 background photos for the cinematic slideshow.");
      setSaving(false);
      return;
    }
    if (mediaType === "video" && !bgVideo) {
      setError("Please upload a background video (max 15 seconds).");
      setSaving(false);
      return;
    }

    try {
      const synced = syncFieldsFromActionButtons(actionButtons);
      const payload = {
        username: form.username.toLowerCase(),
        companyName: form.companyName,
        jobTitle: form.jobTitle,
        businessType: form.businessType,
        businessCategory: form.businessCategory,
        aboutUs: form.aboutUs,
        gstNumber: form.gstNumber,
        email: synced.email,
        phone: synced.phone,
        whatsappNumber: synced.whatsappNumber,
        website: synced.website,
        profileImage: form.profileImage,
        coverImage: bgImages[0] || form.coverImage || "",
        backgroundMediaType: mediaType,
        backgroundImages: mediaType === "slideshow" ? bgImages : [],
        backgroundVideo: mediaType === "video" ? bgVideo : "",
        socialLinks: synced.socialLinks,
        location: {
          address: form.address,
          googleMapsUrl: synced.googleMapsUrl || form.googleMapsUrl,
        },
        businessHours: hours,
        theme,
        primaryCtas: ctas,
        extraLinks: synced.extraLinks,
        galleryImages: gallery,
        galleryVideos: galleryVideos.filter(Boolean).slice(0, 12),
        services: services
          .filter((s) => s.title.trim())
          .slice(0, 10)
          .map((s) => ({
            id: s.id,
            title: s.title.trim(),
            price: s.price || "",
            description: s.description || "",
            image: s.image || "",
          })),
        paymentInfo: {
          qrCodeImage: paymentInfo.qrCodeImage || "",
          upiId: (paymentInfo.upiId || "").trim(),
          upiMobile: (paymentInfo.upiMobile || "").trim(),
        },
        bankDetails: {
          accountName: (bankDetails.accountName || "").trim(),
          accountNumber: (bankDetails.accountNumber || "").trim(),
          ifscCode: (bankDetails.ifscCode || "").trim(),
          bankName: (bankDetails.bankName || "").trim(),
          branch: (bankDetails.branch || "").trim(),
        },
        actionButtons: actionButtons.map((b) => ({
          key: b.key,
          enabled: b.enabled,
          value: b.value || "",
        })),
        isVerified: form.isVerified,
        isActive: form.isActive,
        featuresEnabled,
        backgroundAnimationSlug: backgroundAnimationSlug || undefined,
      };

      if (mode === "create") {
        const res = await apiClient<{ data: ICard }>("/api/cards", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push(`/cards/${res.data._id}/edit`);
      } else if (initial) {
        await apiClient(`/api/cards/${initial._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={onSubmit} className="space-y-6">
        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Section title="Public page sections">
          <CardSectionToggles
            adminSections={adminSections}
            value={featuresEnabled}
            onChange={setFeaturesEnabled}
          />
        </Section>

        <Section title="Background animation">
          <p className="mb-3 text-xs text-muted-foreground">
            Choose a mini-site background animation from designs activated by
            Super Admin.
          </p>
          <BackgroundAnimationPicker
            value={backgroundAnimationSlug}
            onChange={setBackgroundAnimationSlug}
          />
        </Section>

        <Section title="Theme colors">
          <p className="text-xs text-muted-foreground">
            Customize background, header, and button colors for your public card.
          </p>
          <FeatureLock enabled={features.customTheme}>
            <ThemeCustomizer theme={theme} onChange={setTheme} />
          </FeatureLock>
        </Section>

        <Section title="Identity">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Username (vanity URL)">
              <Input
                required
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="acme_corp"
                disabled={mode === "edit"}
              />
            </Field>
            <Field label="Company name">
              <Input
                required
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </Field>
            <Field label="Tagline / slogan">
              <Input
                required
                value={form.jobTitle}
                onChange={(e) => set("jobTitle", e.target.value)}
              />
            </Field>
            <Field label="Business type">
              <Input
                placeholder="e.g. Wholesale & Retail"
                value={form.businessType}
                onChange={(e) => set("businessType", e.target.value)}
              />
            </Field>
            <Field label="Category">
              <Input
                placeholder="e.g. Trading & Distribution"
                value={form.businessCategory}
                onChange={(e) => set("businessCategory", e.target.value)}
              />
            </Field>
            <Field label="GST number">
              <Input
                value={form.gstNumber}
                onChange={(e) => set("gstNumber", e.target.value)}
              />
            </Field>
          </div>
          <Field label="About us">
            <Textarea
              maxLength={1500}
              rows={5}
              placeholder="A short, professional overview of what your company does…"
              value={form.aboutUs}
              onChange={(e) => set("aboutUs", e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {form.aboutUs.length}/1500 characters
            </p>
          </Field>
          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Verified blue tick</p>
              <p className="text-xs text-muted-foreground">
                Show a verified badge next to your business name on the public
                card.
              </p>
            </div>
            {features.verifiedBadge ? (
              <label className="inline-flex cursor-pointer items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {form.isVerified ? "On" : "Off"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isVerified}
                  onClick={() => set("isVerified", !form.isVerified)}
                  className={`relative h-7 w-12 rounded-full transition ${
                    form.isVerified ? "bg-sky-500" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                      form.isVerified ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
            ) : (
              <p className="text-xs font-semibold text-amber-800">
                Feature disabled by Administrator
              </p>
            )}
          </div>
        </Section>

        <Section title="Profile & background media">
          <MediaUpload
            label="Profile picture"
            kind="image"
            value={form.profileImage}
            onChange={(url) => set("profileImage", url)}
            hint="Square photos look best."
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">Background style</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  ["none", "Solid gradient"],
                  ["slideshow", "Photo slideshow"],
                  ["video", "Short video"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMediaType(value)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                    mediaType === value
                      ? "border-teal-400/50 bg-teal-400/15 text-teal-100 shadow-glow"
                      : "border-white/10 text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {mediaType === "slideshow" ? (
            <BackgroundImagesUpload images={bgImages} onChange={setBgImages} />
          ) : null}
          {mediaType === "video" ? (
            <MediaUpload
              label="Background video"
              kind="video"
              value={bgVideo}
              onChange={setBgVideo}
              hint="MP4/WebM, maximum 15 seconds."
            />
          ) : null}
        </Section>

        <Section title="Primary CTA buttons">
          <p className="text-xs text-muted-foreground">
            Top quick actions: <strong>Save Contact</strong>,{" "}
            <strong>View Service</strong>, <strong>Book Appointment</strong>,{" "}
            <strong>Pay Now (UPI)</strong>. Book Appointment uses the Book Now
            link from Buttons & Links.
          </p>
          <div className="space-y-3">
            {ctas.map((cta, idx) => (
              <div
                key={cta.id}
                className="grid gap-2 rounded-xl bg-muted/40 p-3 sm:grid-cols-[1fr_1.4fr_auto]"
              >
                <Input
                  value={cta.label}
                  onChange={(e) =>
                    setCtas((rows) =>
                      rows.map((r, i) =>
                        i === idx ? { ...r, label: e.target.value } : r,
                      ),
                    )
                  }
                />
                {cta.id === "services" ||
                cta.id === "pay" ||
                cta.id === "save" ||
                cta.id === "book" ? (
                  <div className="flex items-center rounded-md border border-dashed px-3 text-xs text-muted-foreground">
                    {cta.id === "pay"
                      ? "Opens UPI payment modal"
                      : cta.id === "services"
                        ? "Opens in-card catalog"
                        : cta.id === "save"
                          ? "Downloads vCard"
                          : "Uses Book Now link"}
                  </div>
                ) : (
                  <Input
                    placeholder="https://..."
                    value={cta.url}
                    onChange={(e) =>
                      setCtas((rows) =>
                        rows.map((r, i) =>
                          i === idx ? { ...r, url: e.target.value } : r,
                        ),
                      )
                    }
                  />
                )}
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={cta.enabled}
                    onChange={(e) =>
                      setCtas((rows) =>
                        rows.map((r, i) =>
                          i === idx ? { ...r, enabled: e.target.checked } : r,
                        ),
                      )
                    }
                  />
                  Show
                </label>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons & Links Management">
          <ButtonsManager
            buttons={actionButtons}
            features={features}
            onChange={(next) => {
              setActionButtons(next);
              const synced = syncFieldsFromActionButtons(next);
              set("phone", synced.phone);
              set("whatsappNumber", synced.whatsappNumber);
              set("email", synced.email);
              set("website", synced.website);
              set("googleMapsUrl", synced.googleMapsUrl);
              setSocials((s) => ({ ...s, ...synced.socialLinks }));
              setExtra(synced.extraLinks);
            }}
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Street address (display text)">
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="MG Road, Bengaluru…"
              />
            </Field>
            <p className="self-end text-xs text-muted-foreground md:pb-2">
              Maps link for the Address button is managed above. This text is
              shown in company details when set.
            </p>
          </div>
        </Section>

        <Section title="Pay Now / UPI details">
          <FeatureLock enabled={features.payment}>
            <PaymentDetailsForm value={paymentInfo} onChange={setPaymentInfo} />
          </FeatureLock>
        </Section>

        <Section title="Bank account details">
          <FeatureLock enabled={features.bankAndBrochures}>
            <BankDetailsForm value={bankDetails} onChange={setBankDetails} />
          </FeatureLock>
        </Section>

        <Section title="Services / Products">
          <FeatureLock enabled={features.services}>
            <ServicesManager services={services} onChange={setServices} />
          </FeatureLock>
        </Section>

        <Section title="Image gallery">
          <FeatureLock enabled={features.gallery}>
            <BackgroundImagesUpload
              images={gallery}
              onChange={setGallery}
              max={24}
              minHint={0}
              title="Image Gallery"
              hint="Upload photos for a clean 2-column gallery on the public card. Visitors can load more and open a lightbox."
            />
          </FeatureLock>
        </Section>

        <Section title="Video gallery">
          <FeatureLock enabled={features.gallery}>
            <VideoGalleryUpload
              videos={galleryVideos}
              onChange={setGalleryVideos}
              max={12}
            />
          </FeatureLock>
        </Section>

        <Section title="Business hours">
          <div className="space-y-2">
            {hours.map((row, idx) => (
              <div
                key={row.day}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-xl bg-muted/50 p-2 text-sm"
              >
                <span className="font-medium">{row.day}</span>
                <Input
                  type="time"
                  className="h-9"
                  disabled={!row.isOpen}
                  value={row.openTime}
                  onChange={(e) =>
                    setHours((h) =>
                      h.map((x, i) =>
                        i === idx ? { ...x, openTime: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Input
                  type="time"
                  className="h-9"
                  disabled={!row.isOpen}
                  value={row.closeTime}
                  onChange={(e) =>
                    setHours((h) =>
                      h.map((x, i) =>
                        i === idx ? { ...x, closeTime: e.target.value } : x,
                      ),
                    )
                  }
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={row.isOpen}
                    onChange={(e) =>
                      setHours((h) =>
                        h.map((x, i) =>
                          i === idx ? { ...x, isOpen: e.target.checked } : x,
                        ),
                      )
                    }
                  />
                  Open
                </label>
              </div>
            ))}
          </div>
        </Section>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
          />
          Published (publicly visible)
        </label>

        <Button
          type="submit"
          disabled={saving}
          className="text-white"
          style={{ backgroundColor: theme.buttonColor }}
        >
          {saving
            ? "Saving…"
            : mode === "create"
              ? "Create card"
              : "Save changes"}
        </Button>
      </form>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="mb-3 font-display text-xl font-bold">Live preview</h2>
        <CardPreview card={previewCard} track={false} features={features} />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
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
      <Label className="capitalize">{label}</Label>
      {children}
    </div>
  );
}
