"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ICard, IServiceItem } from "@/types/card.types";
import type { IAnalyticsSummary } from "@/types/analytics.types";
import type { IPlatformSettings, IUserFeatures } from "@/types/platform.types";
import {
  DEFAULT_CARD_SECTIONS,
  resolveCardSections,
  type ICardSections,
} from "@/types/card-sections.types";
import {
  PROFILE_TYPE_COPY,
  resolveCardProfileType,
} from "@/types/card-profile.types";
import { DEFAULT_PRIMARY_CTAS, resolveCardStats } from "@/types/card.types";
import {
  normalizePrimaryCtas,
  resolveActionButtons,
} from "@/lib/action-buttons";
import { downloadVCard, generateVCard } from "@/lib/vcard-generator";
import { resolveTheme, tintColor } from "@/lib/theme";
import { absoluteUrl, cn } from "@/lib/utils";
import { MiniSiteNav } from "./MiniSiteNav";
import { MiniSiteHero } from "./MiniSiteHero";
import { MiniSiteIdentityCard } from "./MiniSiteIdentityCard";
import { MiniSiteServices } from "./MiniSiteServices";
import { MiniSiteStats } from "./MiniSiteStats";
import { MiniSiteWhyChoose } from "./MiniSiteWhyChoose";
import { MiniSiteTestimonials } from "./MiniSiteTestimonials";
import { MiniSiteQrTerminal } from "./MiniSiteQrTerminal";
import { MiniSiteFinalCta } from "./MiniSiteFinalCta";
import {
  MiniSiteThemeProvider,
  MiniSiteThemeToggle,
  useMiniSiteTheme,
} from "./MiniSiteTheme";
import { ActionIconGrid } from "@/components/cards/ActionIconGrid";
import { BusinessHoursBadge } from "@/components/cards/BusinessHoursBadge";
import { ImageGallery } from "@/components/cards/ImageGallery";
import { VideoGallery } from "@/components/cards/VideoGallery";
import { ServiceDetailModal } from "@/components/cards/ServicesSection";
import { hasPaymentDetails, PayNowModal } from "@/components/cards/PayNowModal";
import { CardPromoFooter } from "@/components/cards/CardPromoFooter";
import { CompactAboutUs } from "@/components/cards/CompanyDetails";
import { ImmersiveBackground } from "@/components/shared/ImmersiveBackground";
import { CardBackgroundAnimation } from "@/components/cards/minisite/CardBackgroundAnimation";
import { PLATFORM_BRAND } from "@/lib/service-categories";

export function MiniSiteShell(props: {
  card: ICard;
  analytics?: IAnalyticsSummary;
  platformSettings?: IPlatformSettings;
  features?: IUserFeatures;
  sections?: ICardSections;
}) {
  return (
    <MiniSiteThemeProvider>
      <MiniSiteShellInner {...props} />
    </MiniSiteThemeProvider>
  );
}

function MiniSiteShellInner({
  card,
  analytics,
  platformSettings,
  features,
  sections: rawSections,
}: {
  card: ICard;
  analytics?: IAnalyticsSummary;
  platformSettings?: IPlatformSettings;
  features?: IUserFeatures;
  sections?: ICardSections;
}) {
  const sections = resolveCardSections(rawSections ?? DEFAULT_CARD_SECTIONS);
  const profileType = resolveCardProfileType(card.profileType);
  const copy = PROFILE_TYPE_COPY[profileType];
  const { mode } = useMiniSiteTheme();
  const theme = resolveTheme(card);
  const accent = theme.buttonColor || "#22d3ee";
  const soft = tintColor(accent, 0.88);
  const [selectedService, setSelectedService] = useState<IServiceItem | null>(
    null,
  );
  const [payOpen, setPayOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [toast, setToast] = useState("");

  const ambientMode = platformSettings?.ambientMode || "gradient";
  const ambientVideo = platformSettings?.ambientVideo || "";
  const ambientImages = platformSettings?.ambientImages || [];
  const isLight = mode === "light";

  const ctas = useMemo(
    () =>
      normalizePrimaryCtas(
        card.primaryCtas?.length ? card.primaryCtas : DEFAULT_PRIMARY_CTAS,
      )
        .filter((cta) => {
          if (cta.id === "pay" && features && !features.payment) return false;
          if (cta.id === "services" && features && !features.services)
            return false;
          return true;
        })
        .map((cta) => {
          if (cta.id === "services" || cta.id === "pay" || cta.id === "save") {
            return { ...cta, url: "" };
          }
          if (cta.id === "book") {
            const book =
              resolveActionButtons(card).find((b) => b.key === "bookNow")
                ?.value ||
              card.extraLinks?.bookNow ||
              cta.url ||
              "";
            return { ...cta, url: book };
          }
          return cta;
        }),
    [card, features],
  );

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function trackEvent(eventType: string, eventDetail?: string) {
    try {
      await fetch(`/api/analytics/${card._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, eventDetail }),
      });
    } catch {
      /* ignore */
    }
  }

  async function onShare() {
    const url = absoluteUrl(`/c/${card.username}`);
    void trackEvent("share");
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
    void trackEvent("action", `cta_${id}`);
    if (id === "save") {
      downloadVCard(card.username, generateVCard(card));
      void trackEvent("save_contact");
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
      document
        .getElementById("services")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    void trackEvent("action", "whatsapp");
    window.open(`https://wa.me/${n}`, "_blank");
  }

  function openCall() {
    if (!card.phone) return;
    void trackEvent("action", "call");
    window.location.href = `tel:${card.phone}`;
  }

  const publicUrl = absoluteUrl(`/c/${card.username}`);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}`;

  const navIds = useMemo(() => {
    const ids = ["home"];
    if (sections.about || sections.identityCard) ids.push("profile");
    if (sections.services) ids.push("services");
    if (sections.portfolio) ids.push("portfolio");
    if (sections.reviews) ids.push("reviews");
    if (sections.connect || sections.finalCta) ids.push("connect");
    return ids;
  }, [sections]);

  const cssVars = {
    ["--ms-accent" as string]: accent,
    ["--ms-bg" as string]: isLight ? "#f4f8fb" : "#020617",
    ["--ms-surface" as string]: isLight
      ? "rgba(255,255,255,0.72)"
      : "rgba(255,255,255,0.03)",
    ["--ms-text" as string]: isLight ? "#0f172a" : "#f8fafc",
    ["--ms-muted" as string]: isLight ? "#64748b" : "#94a3b8",
  };

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col overflow-x-hidden pb-24 md:pb-10",
        isLight ? "minisite-light text-slate-900" : "bg-[#020617] text-slate-50",
      )}
      style={cssVars}
    >
      {!isLight ? (
        <>
          {/* Platform ambient (video / slideshow) under card animation */}
          {ambientMode === "video" || ambientMode === "slideshow" ? (
            <ImmersiveBackground
              mode={ambientMode}
              video={ambientVideo}
              images={ambientImages}
              accent={accent}
              intensity={0.78}
            />
          ) : null}
          <CardBackgroundAnimation
            slug={card.backgroundAnimationSlug}
            accent={accent}
            slideshowImages={card.backgroundSlideshowImages}
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,211,238,0.18), transparent 50%), linear-gradient(180deg,#eef7fb,#f8fafc 40%,#eef2f7)",
          }}
          aria-hidden
        />
      )}

      <div className="pointer-events-none fixed right-3 top-3 z-50 md:right-6 md:top-5">
        <div className="pointer-events-auto">
          <MiniSiteThemeToggle />
        </div>
      </div>

      <MiniSiteNav visibleIds={navIds} />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col gap-0 [&>section]:py-7 [&>section]:sm:py-8">
        <MiniSiteHero
          card={card}
          accent={accent}
          soft={soft}
          ctas={ctas}
          onCta={handleCta}
        />

        {sections.identityCard ? (
          <MiniSiteIdentityCard
            card={card}
            accent={accent}
            onSave={() => handleCta("save")}
            onShare={() => void onShare()}
            onCall={card.phone ? openCall : undefined}
            onWhatsApp={
              card.whatsappNumber || card.phone ? openWhatsApp : undefined
            }
            onQr={() => {
              void trackEvent("action", "qr_code");
              setQrOpen(true);
            }}
          />
        ) : null}

        {sections.about &&
        (card.aboutUs?.trim() ||
          card.gstNumber ||
          card.businessCategory ||
          (profileType === "shop" && card.businessHours?.length)) ? (
          <section
            id={sections.identityCard ? "profile-about" : "profile"}
            className="mx-auto w-full max-w-2xl scroll-mt-24 px-4 sm:px-6"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/55">
                {copy.aboutEyebrow}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold">
                {copy.aboutTitle}
              </h2>
              {card.businessCategory || card.businessType ? (
                <p className="mt-2 text-sm text-cyan-100/65">
                  {[card.businessCategory, card.businessType]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {profileType !== "individual" && card.gstNumber ? (
                <p className="mt-2 font-mono text-xs text-slate-400">
                  GST: <span className="text-slate-200">{card.gstNumber}</span>
                </p>
              ) : null}
              <CompactAboutUs
                aboutUs={card.aboutUs}
                accent={accent}
                className="mt-4 text-left [&_p]:text-slate-300/80"
              />
              <div
                className={cn(
                  "mt-4",
                  profileType === "shop" &&
                    "rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-3",
                )}
              >
                {profileType === "shop" ? (
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
                    Store timings
                  </p>
                ) : null}
                <BusinessHoursBadge hours={card.businessHours} accent={accent} />
              </div>
            </div>
          </section>
        ) : null}

        {sections.stats ? (
          <MiniSiteStats
            accent={accent}
            stats={resolveCardStats(card.stats)}
          />
        ) : null}

        {sections.services ? (
          <MiniSiteServices
            card={card}
            accent={accent}
            eyebrow={copy.servicesEyebrow}
            title={copy.servicesTitle}
            subtitle={copy.servicesSubtitle}
            onSelect={(svc) => {
              setSelectedService(svc);
              void trackEvent("action", `service_view_${svc.id}`);
            }}
          />
        ) : null}

        {sections.whyChoose ? (
          <MiniSiteWhyChoose
            accent={accent}
            title={copy.whyTitle}
            subtitle={copy.whySubtitle}
          />
        ) : null}

        {sections.portfolio &&
        (card.galleryImages?.length || card.galleryVideos?.length) ? (
          <section id="portfolio" className="scroll-mt-24 px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
                {copy.portfolioEyebrow}
              </p>
              <h2 className="mt-2 text-center font-display text-2xl font-bold">
                {copy.portfolioTitle}
              </h2>
              <div className="mt-6 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-6">
                <ImageGallery images={card.galleryImages} accent={accent} />
                <VideoGallery videos={card.galleryVideos} accent={accent} />
              </div>
            </div>
          </section>
        ) : null}

        {sections.reviews ? (
          <MiniSiteTestimonials
            accent={accent}
            eyebrow={copy.reviewsEyebrow}
            title={copy.reviewsTitle}
          />
        ) : null}

        {sections.qrTerminal ? (
          <MiniSiteQrTerminal
            card={card}
            accent={accent}
            onSave={() => handleCta("save")}
            onShare={() => void onShare()}
          />
        ) : null}

        {sections.connect ? (
          <section id="connect" className="scroll-mt-24 px-4 sm:px-6">
            <div className="relative mx-auto max-w-3xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-6 -top-8 bottom-0 -z-0 opacity-80"
                style={{
                  background: `
                    radial-gradient(ellipse 70% 45% at 15% 20%, rgba(56,189,248,0.14), transparent 55%),
                    radial-gradient(ellipse 60% 40% at 90% 10%, rgba(139,92,246,0.16), transparent 50%),
                    radial-gradient(ellipse 80% 35% at 50% 100%, rgba(99,102,241,0.12), transparent 60%)
                  `,
                }}
              />
              <p className="relative text-center font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-cyan-200/60 [text-shadow:0_0_12px_rgba(56,189,248,0.35)]">
                {copy.connectEyebrow}
              </p>
              <h2 className="relative mt-2 text-center font-display text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl [text-shadow:0_0_24px_rgba(125,211,252,0.25)]">
                {copy.connectTitle}
              </h2>
              <div className="ms-holo-stage relative mt-8 p-5 sm:p-7">
                <ActionIconGrid
                  card={card}
                  features={features}
                  onTrack={(detail) =>
                    void trackEvent(
                      detail === "save_contact" ? "save_contact" : "action",
                      detail,
                    )
                  }
                />
              </div>

              {analytics ? (
                <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {(
                    [
                      ["Views", analytics.totalViews, "#38bdf8"],
                      ["Clicks", analytics.totalClicks, "#22d3ee"],
                      ["Actions", analytics.totalActions, "#a78bfa"],
                      ["Days", analytics.daysLive, "#67e8f9"],
                      ["Engage", `${analytics.engagementRate}%`, accent],
                    ] as const
                  ).map(([label, value, neon], i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.04 * i }}
                      className="ms-holo-metric"
                      style={{ ["--ms-holo-neon" as string]: neon }}
                    >
                      <div className="ms-holo-metric-value">{value}</div>
                      <div className="ms-holo-metric-label">{label}</div>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {sections.finalCta ? (
          <MiniSiteFinalCta
            accent={accent}
            name={card.companyName || ""}
            title={copy.finalCtaTitle(card.companyName || "")}
            subtitle={copy.finalCtaSubtitle}
            connectLabel={copy.finalConnectLabel}
            onConnect={() =>
              document
                .getElementById("connect")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            onWhatsApp={
              card.whatsappNumber || card.phone ? openWhatsApp : undefined
            }
            onCall={card.phone ? openCall : undefined}
            hasWhatsApp={Boolean(card.whatsappNumber || card.phone)}
            hasCall={Boolean(card.phone)}
          />
        ) : null}

        <footer className="mt-auto border-t border-white/5 px-3 pb-2 pt-2 md:px-4 md:pb-2 md:pt-3">
          {platformSettings ? (
            <CardPromoFooter
              settings={platformSettings}
              accent={accent}
              onTrack={() => void trackEvent("click", "referral_whatsapp")}
            />
          ) : (
            <p className="text-xs text-slate-500">Verified by {PLATFORM_BRAND}</p>
          )}
        </footer>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-cyan-400/30 bg-slate-950/90 px-4 py-2 text-xs font-semibold text-cyan-50 shadow-glow backdrop-blur-xl md:bottom-6"
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
          onInquiry={() =>
            void trackEvent("action", `service_inquiry_${selectedService.id}`)
          }
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
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setQrOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xs rounded-3xl border border-cyan-400/25 bg-slate-950/95 p-6 text-center shadow-glow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-cyan-50">
              Scan to connect
            </h3>
            <p className="mt-1 break-all text-xs text-slate-400">{publicUrl}</p>
            <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt="QR code" className="h-48 w-48" />
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-slate-300"
              onClick={() => setQrOpen(false)}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}
