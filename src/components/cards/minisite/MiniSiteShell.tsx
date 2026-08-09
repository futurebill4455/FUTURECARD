"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ICard, IServiceItem } from "@/types/card.types";
import type { IAnalyticsSummary } from "@/types/analytics.types";
import type { IPlatformSettings, IUserFeatures } from "@/types/platform.types";
import { DEFAULT_PRIMARY_CTAS } from "@/types/card.types";
import {
  normalizePrimaryCtas,
  resolveActionButtons,
} from "@/lib/action-buttons";
import { downloadVCard, generateVCard } from "@/lib/vcard-generator";
import { resolveTheme, tintColor } from "@/lib/theme";
import { absoluteUrl } from "@/lib/utils";
import { MiniSiteNav } from "./MiniSiteNav";
import { MiniSiteHero } from "./MiniSiteHero";
import { MiniSiteIdentityCard } from "./MiniSiteIdentityCard";
import { MiniSiteServices } from "./MiniSiteServices";
import { ActionIconGrid } from "@/components/cards/ActionIconGrid";
import { BusinessHoursBadge } from "@/components/cards/BusinessHoursBadge";
import { ImageGallery } from "@/components/cards/ImageGallery";
import { VideoGallery } from "@/components/cards/VideoGallery";
import {
  ServiceDetailModal,
} from "@/components/cards/ServicesSection";
import { hasPaymentDetails, PayNowModal } from "@/components/cards/PayNowModal";
import { CardPromoFooter } from "@/components/cards/CardPromoFooter";
import { CompactAboutUs } from "@/components/cards/CompanyDetails";
import { ImmersiveBackground } from "@/components/shared/ImmersiveBackground";
import { PLATFORM_BRAND } from "@/lib/service-categories";

export function MiniSiteShell({
  card,
  analytics,
  platformSettings,
  features,
}: {
  card: ICard;
  analytics?: IAnalyticsSummary;
  platformSettings?: IPlatformSettings;
  features?: IUserFeatures;
}) {
  const theme = resolveTheme(card);
  const accent = theme.buttonColor || "#22d3ee";
  const soft = tintColor(accent, 0.88);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<IServiceItem | null>(
    null,
  );
  const [payOpen, setPayOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const ambientMode = platformSettings?.ambientMode || "gradient";
  const ambientVideo = platformSettings?.ambientVideo || "";
  const ambientImages = platformSettings?.ambientImages || [];

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
    if (navigator.share) {
      await navigator.share({
        title: card.companyName,
        text: card.jobTitle,
        url,
      });
      return;
    }
    await navigator.clipboard.writeText(url);
    window.alert("Link copied");
  }

  function handleCta(id: string) {
    void trackEvent("action", `cta_${id}`);
    if (id === "save") {
      downloadVCard(card.username, generateVCard(card));
      void trackEvent("save_contact");
      return;
    }
    if (id === "services") {
      const list = card.services?.filter((s) => s.title.trim()) ?? [];
      if (!list.length) {
        window.alert("No services have been added yet.");
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
        window.alert(
          "Book Appointment link is not set. Add it under Buttons & Links → Book Now.",
        );
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (id === "pay") {
      if (!hasPaymentDetails(card.paymentInfo)) {
        window.alert(
          "Payment details have not been set up yet. Please add a QR code or UPI ID in the dashboard.",
        );
        return;
      }
      setPayOpen(true);
    }
  }

  const publicUrl = absoluteUrl(`/c/${card.username}`);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020617] pb-24 text-slate-50 md:pb-10">
      <ImmersiveBackground
        mode={ambientMode}
        video={ambientVideo}
        images={ambientImages}
        accent={accent}
        intensity={0.78}
      />

      <MiniSiteNav />

      <div className="relative z-[1]">
        <MiniSiteHero
          card={card}
          accent={accent}
          soft={soft}
          ctas={ctas}
          onCta={handleCta}
        />

        <MiniSiteIdentityCard
          card={card}
          accent={accent}
          onSave={() => handleCta("save")}
          onShare={() => void onShare()}
          onCall={
            card.phone
              ? () => {
                  void trackEvent("action", "call");
                  window.location.href = `tel:${card.phone}`;
                }
              : undefined
          }
          onWhatsApp={
            card.whatsappNumber || card.phone
              ? () => {
                  void trackEvent("action", "whatsapp");
                  const n = (card.whatsappNumber || card.phone || "").replace(
                    /\D/g,
                    "",
                  );
                  window.open(`https://wa.me/${n}`, "_blank");
                }
              : undefined
          }
          onQr={() => {
            void trackEvent("action", "qr_code");
            setQrOpen(true);
          }}
        />

        {/* About / profile deep dive */}
        {(card.aboutUs?.trim() || card.gstNumber || card.businessCategory) && (
          <section className="mx-auto max-w-2xl scroll-mt-24 px-4 py-6 sm:px-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/55">
                Profile
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-50">
                About
              </h2>
              {card.businessCategory || card.businessType ? (
                <p className="mt-2 text-sm text-cyan-100/65">
                  {[card.businessCategory, card.businessType]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {card.gstNumber ? (
                <p className="mt-2 font-mono text-xs text-slate-400">
                  GST:{" "}
                  <span className="text-slate-200">{card.gstNumber}</span>
                </p>
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
        )}

        <div ref={servicesRef}>
          <MiniSiteServices
            card={card}
            accent={accent}
            onSelect={(svc) => {
              setSelectedService(svc);
              void trackEvent("action", `service_view_${svc.id}`);
            }}
          />
        </div>

        {/* Portfolio */}
        {(card.galleryImages?.length || card.galleryVideos?.length) ? (
          <section id="portfolio" className="scroll-mt-24 px-4 py-10 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
                Portfolio
              </p>
              <h2 className="mt-2 text-center font-display text-2xl font-bold text-slate-50">
                Work & media
              </h2>
              <div className="mt-6 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-6">
                <ImageGallery
                  images={card.galleryImages}
                  accent={accent}
                />
                <VideoGallery videos={card.galleryVideos} accent={accent} />
              </div>
            </div>
          </section>
        ) : (
          <div id="portfolio" className="h-0 scroll-mt-24" aria-hidden />
        )}

        {/* Reviews placeholder — deep-links into Connect Review action when present */}
        <section id="reviews" className="scroll-mt-24 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-xl sm:p-8">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
              Social proof
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-50">
              Reviews & trust
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              Trusted professionals build lasting relationships. Leave a review
              or open public ratings linked to this profile.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className="text-lg text-cyan-300/80"
                  aria-hidden
                >
                  ★
                </span>
              ))}
            </div>
            <button
              type="button"
              className="mt-6 inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-400/20"
              onClick={() => {
                const review = resolveActionButtons(card).find(
                  (b) => b.key === "review" && b.enabled && b.value?.trim(),
                );
                if (review?.value) {
                  void trackEvent("action", "review");
                  window.open(review.value, "_blank", "noopener,noreferrer");
                  return;
                }
                document
                  .getElementById("connect")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Open reviews
            </button>
          </div>
        </section>

        {/* Connect */}
        <section id="connect" className="scroll-mt-24 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
              Connect with me
            </p>
            <h2 className="mt-2 text-center font-display text-2xl font-bold text-slate-50 sm:text-3xl">
              One tap to reach out
            </h2>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate-400">
              Premium glass actions for call, WhatsApp, social, bank, QR, and more.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-panel backdrop-blur-xl sm:p-7">
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
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {(
                  [
                    ["Views", analytics.totalViews],
                    ["Clicks", analytics.totalClicks],
                    ["Actions", analytics.totalActions],
                    ["Days", analytics.daysLive],
                    ["Engage", `${analytics.engagementRate}%`],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-3 text-center backdrop-blur-md"
                  >
                    <div
                      className="font-mono text-lg font-semibold"
                      style={{ color: accent }}
                    >
                      {value}
                    </div>
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-8">
              {platformSettings ? (
                <CardPromoFooter
                  settings={platformSettings}
                  accent={accent}
                  onTrack={() => void trackEvent("click", "referral_whatsapp")}
                />
              ) : (
                <p className="text-center text-xs text-slate-500">
                  Verified by {PLATFORM_BRAND}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

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
