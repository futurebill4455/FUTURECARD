"use client";

import { useMemo, useState } from "react";
import type { ICard, IServiceItem } from "@/types/card.types";
import {
  DEFAULT_PRIMARY_CTAS,
  resolveCardStats,
  resolveWhyChooseItems,
} from "@/types/card.types";
import {
  PROFILE_TYPE_COPY,
  resolveCardProfileType,
} from "@/types/card-profile.types";
import { normalizePrimaryCtas, resolveActionButtons } from "@/lib/action-buttons";
import { downloadVCard, generateVCard } from "@/lib/vcard-generator";
import { resolveTheme, tintColor } from "@/lib/theme";
import type { IPlatformSettings } from "@/types/platform.types";
import { MiniSiteHero } from "@/components/cards/minisite/MiniSiteHero";
import { MiniSiteIdentityCard } from "@/components/cards/minisite/MiniSiteIdentityCard";
import { MiniSiteStats } from "@/components/cards/minisite/MiniSiteStats";
import { MiniSiteWhyChoose } from "@/components/cards/minisite/MiniSiteWhyChoose";
import { MiniSiteTestimonials } from "@/components/cards/minisite/MiniSiteTestimonials";
import { MiniSiteQrTerminal } from "@/components/cards/minisite/MiniSiteQrTerminal";
import { MiniSiteFinalCta } from "@/components/cards/minisite/MiniSiteFinalCta";
import { MiniSiteThemeProvider } from "@/components/cards/minisite/MiniSiteTheme";
import { ActionIconGrid } from "@/components/cards/ActionIconGrid";
import { BusinessHoursBadge } from "@/components/cards/BusinessHoursBadge";
import { ImageGallery } from "@/components/cards/ImageGallery";
import { ServiceDetailModal } from "@/components/cards/ServicesSection";
import { hasPaymentDetails, PayNowModal } from "@/components/cards/PayNowModal";
import { CompactAboutUs } from "@/components/cards/CompanyDetails";
import { CardPromoFooter } from "@/components/cards/CardPromoFooter";
import { matchServiceCategory } from "@/lib/service-categories";
import {
  FUTURE_SHIELD_ANALYTICS,
  FUTURE_SHIELD_CARD,
  FUTURE_SHIELD_FEATURES,
  FUTURE_SHIELD_PUBLIC_URL,
} from "@/data/future-shield-card";

function scrollPreviewSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const scroller = target.closest(".fs-preview-scroll");
  if (scroller instanceof HTMLElement) {
    const top =
      scroller.scrollTop +
      (target.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top) -
      8;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

const PREVIEW_SETTINGS: IPlatformSettings = {
  _id: "hero-preview",
  adminWhatsappNumber: "+91871492828",
  companyWebsiteUrl: "https://www.futurecard.online/",
  companyName: "Future Card",
  footerTagline: "Verified digital visiting cards by Future Card",
  platformCnameTarget: "app.futurecard.pro",
  ambientMode: "gradient",
  ambientVideo: "",
  ambientImages: [],
};

export function FutureShieldLiveCard() {
  return (
    <MiniSiteThemeProvider>
      <FutureShieldLiveCardInner />
    </MiniSiteThemeProvider>
  );
}

function FutureShieldLiveCardInner() {
  const card = FUTURE_SHIELD_CARD;
  const features = FUTURE_SHIELD_FEATURES;
  const analytics = FUTURE_SHIELD_ANALYTICS;
  const profileType = resolveCardProfileType(card.profileType);
  const copy = PROFILE_TYPE_COPY[profileType];
  const theme = resolveTheme(card);
  const accent = theme.buttonColor || "#2dd4bf";
  const soft = tintColor(accent, 0.88);

  const [selectedService, setSelectedService] = useState<IServiceItem | null>(
    null,
  );
  const [payOpen, setPayOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [toast, setToast] = useState("");

  const ctas = useMemo(
    () =>
      normalizePrimaryCtas(
        card.primaryCtas?.length ? card.primaryCtas : DEFAULT_PRIMARY_CTAS,
      ).map((cta) => {
        if (cta.id === "book") {
          return { ...cta, url: card.extraLinks?.bookNow || cta.url || "" };
        }
        return cta;
      }),
    [card],
  );

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function onShare() {
    const url = FUTURE_SHIELD_PUBLIC_URL;
    try {
      if (navigator.share) {
        await navigator.share({
          title: card.companyName,
          text: card.jobTitle,
          url,
        });
        showToast("Shared successfully");
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Share cancelled");
    }
  }

  function handleCta(id: string) {
    if (id === "save") {
      downloadVCard(card.username, generateVCard(card));
      showToast("Contact saved");
      return;
    }
    if (id === "services") {
      const list = card.services?.filter((s) => s.title.trim()) ?? [];
      if (!list.length) {
        showToast("No services added yet");
        return;
      }
      if (list.length === 1) {
        setSelectedService(list[0]);
        return;
      }
      scrollPreviewSection("fs-preview-services");
      return;
    }
    if (id === "book") {
      const url =
        resolveActionButtons(card).find((b) => b.key === "bookNow")?.value ||
        card.extraLinks?.bookNow ||
        "";
      if (!url) {
        showToast("Book link not configured");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (id === "pay") {
      if (!hasPaymentDetails(card.paymentInfo)) {
        showToast("Payment details not set up");
        return;
      }
      setPayOpen(true);
    }
  }

  function openWhatsApp() {
    const n = (card.whatsappNumber || card.phone || "").replace(/\D/g, "");
    if (!n) return;
    window.open(`https://wa.me/${n}`, "_blank", "noopener,noreferrer");
  }

  function openCall() {
    if (!card.phone) return;
    window.location.href = `tel:${card.phone}`;
  }

  return (
    <div
      className="relative min-w-0 overflow-x-hidden break-words bg-[#020617] text-slate-50"
      style={{ ["--ms-accent" as string]: accent }}
    >
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-30" />

      <div className="relative z-[1] -mt-12 min-w-0 pb-8 sm:-mt-14">
        <div id="fs-preview-profile">
          <FutureShieldProfile
            card={card}
            accent={accent}
            soft={soft}
            ctas={ctas}
            onCta={handleCta}
          />
        </div>
        <FutureShieldActions
          card={card}
          accent={accent}
          onSave={() => handleCta("save")}
          onShare={() => void onShare()}
          onCall={openCall}
          onWhatsApp={openWhatsApp}
          onQr={() => setQrOpen(true)}
        />
        <FutureShieldAbout card={card} accent={accent} copy={copy} />
        <div id="fs-preview-stats">
          <MiniSiteStats accent={accent} stats={resolveCardStats(card.stats)} />
        </div>
        <div id="fs-preview-services">
          <FutureShieldServices
            card={card}
            accent={accent}
            copy={copy}
            onSelect={setSelectedService}
          />
        </div>
        <div id="fs-preview-why">
          <FutureShieldWhyChooseUs
            accent={accent}
            items={resolveWhyChooseItems(card.whyChooseItems)}
            copy={copy}
          />
        </div>
        <div id="fs-preview-gallery">
          <FutureShieldGallery card={card} accent={accent} copy={copy} />
        </div>
        <FutureShieldTestimonials accent={accent} copy={copy} />
        <div id="fs-preview-qr">
          <FutureShieldQRCode
            card={card}
            accent={accent}
            onSave={() => handleCta("save")}
            onShare={() => void onShare()}
          />
          <FutureShieldContact
            card={card}
            features={features}
            analytics={analytics}
            accent={accent}
            copy={copy}
          />
        </div>
        <FutureShieldCTA
          accent={accent}
          copy={copy}
          name={card.companyName}
          onConnect={() => scrollPreviewSection("fs-preview-connect")}
          onWhatsApp={openWhatsApp}
          onCall={openCall}
        />
        <footer className="border-t border-white/5 px-3 py-3">
          <CardPromoFooter settings={PREVIEW_SETTINGS} accent={accent} />
        </footer>
      </div>

      {toast ? (
        <div
          role="status"
          className="sticky bottom-3 z-20 mx-auto w-fit rounded-full border border-cyan-400/30 bg-slate-950/90 px-4 py-2 text-xs font-semibold text-cyan-50"
        >
          {toast}
        </div>
      ) : null}

      {selectedService ? (
        <ServiceDetailModal
          card={card}
          service={selectedService}
          accent={accent}
          onClose={() => setSelectedService(null)}
        />
      ) : null}

      {payOpen ? (
        <PayNowModal
          card={card}
          accent={accent}
          onClose={() => setPayOpen(false)}
        />
      ) : null}

      {qrOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          onClick={() => setQrOpen(false)}
          aria-label="Close QR"
        >
          <div
            className="w-full max-w-xs rounded-3xl border border-cyan-400/25 bg-slate-950/95 p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-cyan-50">
              Scan to connect
            </h3>
            <p className="mt-1 break-all text-xs text-slate-400">
              {FUTURE_SHIELD_PUBLIC_URL}
            </p>
            <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(FUTURE_SHIELD_PUBLIC_URL)}`}
                alt="Future Shield QR code"
                width={192}
                height={192}
                className="mx-auto h-48 w-48 max-w-full object-contain"
              />
            </div>
            <button
              type="button"
              className="mt-5 min-h-11 w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-slate-300"
              onClick={() => setQrOpen(false)}
            >
              Close
            </button>
          </div>
        </button>
      ) : null}
    </div>
  );
}

export function FutureShieldProfile({
  card,
  accent,
  soft,
  ctas,
  onCta,
}: {
  card: ICard;
  accent: string;
  soft: string;
  ctas: { id: string; label: string; url: string; enabled: boolean }[];
  onCta: (id: string) => void;
}) {
  return (
    <MiniSiteHero
      card={card}
      accent={accent}
      soft={soft}
      ctas={ctas}
      onCta={onCta}
    />
  );
}

export function FutureShieldActions({
  card,
  accent,
  onSave,
  onShare,
  onCall,
  onWhatsApp,
  onQr,
}: {
  card: ICard;
  accent: string;
  onSave: () => void;
  onShare: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
  onQr: () => void;
}) {
  return (
    <MiniSiteIdentityCard
      card={card}
      accent={accent}
      onSave={onSave}
      onShare={onShare}
      onCall={onCall}
      onWhatsApp={onWhatsApp}
      onQr={onQr}
    />
  );
}

export function FutureShieldAbout({
  card,
  accent,
  copy,
}: {
  card: ICard;
  accent: string;
  copy: (typeof PROFILE_TYPE_COPY)["business"];
}) {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/55">
          {copy.aboutEyebrow}
        </p>
        <h2 className="mt-1 font-display text-xl font-bold">{copy.aboutTitle}</h2>
        {card.businessType ? (
          <p className="mt-2 text-sm text-cyan-100/65">{card.businessType}</p>
        ) : null}
        <CompactAboutUs
          aboutUs={card.aboutUs}
          accent={accent}
          className="mt-4 text-left [&_p]:text-slate-300/80"
        />
        <div className="mt-4">
          <BusinessHoursBadge hours={card.businessHours} accent={accent} />
        </div>
      </div>
    </section>
  );
}

export function FutureShieldServices({
  card,
  accent,
  copy,
  onSelect,
}: {
  card: ICard;
  accent: string;
  copy: (typeof PROFILE_TYPE_COPY)["business"];
  onSelect: (svc: IServiceItem) => void;
}) {
  const services = card.services?.filter((s) => s.title.trim()) ?? [];
  if (!services.length) return null;

  return (
    <section className="scroll-mt-24 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
          {copy.servicesEyebrow}
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold text-slate-50">
          {copy.servicesTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-400">
          {copy.servicesSubtitle}
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {services.map((svc) => {
            const cat = matchServiceCategory(svc.title);
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => onSelect(svc)}
                className="group relative flex min-h-[9.5rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left shadow-panel backdrop-blur-xl transition hover:border-cyan-300/35"
                style={{ ["--ms-accent" as string]: accent }}
              >
                <div className="relative flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-slate-900"
                    style={{ boxShadow: `0 0 20px ${cat.accent}33` }}
                  >
                    {svc.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={svc.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-white">
                        {(svc.title || "?").slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-100/70">
                      {cat.short}
                    </span>
                    <h3 className="mt-1.5 font-display text-base font-bold text-slate-50">
                      {svc.title}
                    </h3>
                    {svc.price ? (
                      <p
                        className="mt-0.5 font-mono text-sm font-semibold"
                        style={{ color: cat.accent }}
                      >
                        {svc.price}
                      </p>
                    ) : null}
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-cyan-200/80">
                      View details →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FutureShieldWhyChooseUs({
  accent,
  items,
  copy,
}: {
  accent: string;
  items: ReturnType<typeof resolveWhyChooseItems>;
  copy: (typeof PROFILE_TYPE_COPY)["business"];
}) {
  return (
    <MiniSiteWhyChoose
      accent={accent}
      items={items}
      title={copy.whyTitle}
      subtitle={copy.whySubtitle}
    />
  );
}

export function FutureShieldGallery({
  card,
  accent,
  copy,
}: {
  card: ICard;
  accent: string;
  copy: (typeof PROFILE_TYPE_COPY)["business"];
}) {
  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
          {copy.portfolioEyebrow}
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold">
          {copy.portfolioTitle}
        </h2>
        <div className="mt-6 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-6">
          <ImageGallery
            images={card.galleryImages}
            accent={accent}
            className="bg-white/90"
          />
        </div>
      </div>
    </section>
  );
}

export function FutureShieldTestimonials({
  accent,
  copy,
}: {
  accent: string;
  copy: (typeof PROFILE_TYPE_COPY)["business"];
}) {
  return (
    <MiniSiteTestimonials
      accent={accent}
      eyebrow={copy.reviewsEyebrow}
      title={copy.reviewsTitle}
    />
  );
}

export function FutureShieldQRCode({
  card,
  accent,
  onSave,
  onShare,
}: {
  card: ICard;
  accent: string;
  onSave: () => void;
  onShare: () => void;
}) {
  return (
    <MiniSiteQrTerminal
      card={card}
      accent={accent}
      onSave={onSave}
      onShare={onShare}
    />
  );
}

export function FutureShieldContact({
  card,
  features,
  analytics,
  accent,
  copy,
}: {
  card: ICard;
  features: typeof FUTURE_SHIELD_FEATURES;
  analytics: typeof FUTURE_SHIELD_ANALYTICS;
  accent: string;
  copy: (typeof PROFILE_TYPE_COPY)["business"];
}) {
  return (
    <section id="fs-preview-connect" className="px-4 py-8 sm:px-6">
      <div className="relative mx-auto max-w-3xl">
        <p className="relative text-center font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-cyan-200/60">
          {copy.connectEyebrow}
        </p>
        <h2 className="relative mt-2 text-center font-display text-2xl font-semibold tracking-tight text-slate-50">
          {copy.connectTitle}
        </h2>
        <div className="ms-holo-stage relative mt-8 p-5 sm:p-7">
          <ActionIconGrid card={card} features={features} />
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(
            [
              ["Views", analytics.totalViews, "#38bdf8"],
              ["Clicks", analytics.totalClicks, "#22d3ee"],
              ["Actions", analytics.totalActions, "#a78bfa"],
              ["Days", analytics.daysLive, "#67e8f9"],
              ["Engage", `${analytics.engagementRate}%`, accent],
            ] as const
          ).map(([label, value, neon]) => (
            <div
              key={label}
              className="ms-holo-metric"
              style={{ ["--ms-holo-neon" as string]: neon }}
            >
              <div className="ms-holo-metric-value">{value}</div>
              <div className="ms-holo-metric-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FutureShieldCTA({
  accent,
  copy,
  name,
  onConnect,
  onWhatsApp,
  onCall,
}: {
  accent: string;
  copy: (typeof PROFILE_TYPE_COPY)["business"];
  name: string;
  onConnect: () => void;
  onWhatsApp: () => void;
  onCall: () => void;
}) {
  return (
    <MiniSiteFinalCta
      accent={accent}
      name={name}
      title={copy.finalCtaTitle(name)}
      subtitle={copy.finalCtaSubtitle}
      connectLabel={copy.finalConnectLabel}
      onConnect={onConnect}
      onWhatsApp={onWhatsApp}
      onCall={onCall}
      hasWhatsApp
      hasCall
    />
  );
}

