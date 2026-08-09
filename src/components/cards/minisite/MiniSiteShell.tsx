"use client";

import { useMemo, useState } from "react";
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
import { absoluteUrl, cn } from "@/lib/utils";
import { MiniSiteNav } from "./MiniSiteNav";
import { MiniSiteHero } from "./MiniSiteHero";
import { MiniSiteIdentityCard } from "./MiniSiteIdentityCard";
import { MiniSiteServices } from "./MiniSiteServices";
import { MiniSiteStats } from "./MiniSiteStats";
import { MiniSiteWhyChoose } from "./MiniSiteWhyChoose";
import { MiniSiteTestimonials } from "./MiniSiteTestimonials";
import { MiniSiteQrTerminal } from "./MiniSiteQrTerminal";
import { MiniSiteFeatures } from "./MiniSiteFeatures";
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
import { PLATFORM_BRAND } from "@/lib/service-categories";

export function MiniSiteShell(props: {
  card: ICard;
  analytics?: IAnalyticsSummary;
  platformSettings?: IPlatformSettings;
  features?: IUserFeatures;
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
}: {
  card: ICard;
  analytics?: IAnalyticsSummary;
  platformSettings?: IPlatformSettings;
  features?: IUserFeatures;
}) {
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
        "relative min-h-screen overflow-x-hidden pb-24 md:pb-10",
        isLight ? "minisite-light text-slate-900" : "bg-[#020617] text-slate-50",
      )}
      style={cssVars}
    >
      {!isLight ? (
        <ImmersiveBackground
          mode={ambientMode}
          video={ambientVideo}
          images={ambientImages}
          accent={accent}
          intensity={0.78}
        />
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
          onCall={card.phone ? openCall : undefined}
          onWhatsApp={
            card.whatsappNumber || card.phone ? openWhatsApp : undefined
          }
          onQr={() => {
            void trackEvent("action", "qr_code");
            setQrOpen(true);
          }}
        />

        {(card.aboutUs?.trim() || card.gstNumber || card.businessCategory) && (
          <section
            id="profile-about"
            className="mx-auto max-w-2xl scroll-mt-24 px-4 py-6 sm:px-6"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/55">
                Profile
              </p>
              <h2 className="mt-1 font-display text-xl font-bold">About</h2>
              {card.businessCategory || card.businessType ? (
                <p className="mt-2 text-sm text-cyan-100/65">
                  {[card.businessCategory, card.businessType]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {card.gstNumber ? (
                <p className="mt-2 font-mono text-xs text-slate-400">
                  GST: <span className="text-slate-200">{card.gstNumber}</span>
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

        <MiniSiteStats accent={accent} />

        <MiniSiteServices
          card={card}
          accent={accent}
          onSelect={(svc) => {
            setSelectedService(svc);
            void trackEvent("action", `service_view_${svc.id}`);
          }}
        />

        <MiniSiteWhyChoose accent={accent} />

        {(card.galleryImages?.length || card.galleryVideos?.length) ? (
          <section id="portfolio" className="scroll-mt-24 px-4 py-10 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
                Portfolio
              </p>
              <h2 className="mt-2 text-center font-display text-2xl font-bold">
                Work & media
              </h2>
              <div className="mt-6 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-6">
                <ImageGallery images={card.galleryImages} accent={accent} />
                <VideoGallery videos={card.galleryVideos} accent={accent} />
              </div>
            </div>
          </section>
        ) : (
          <div id="portfolio" className="h-0 scroll-mt-24" aria-hidden />
        )}

        <MiniSiteTestimonials accent={accent} />

        <MiniSiteQrTerminal
          card={card}
          accent={accent}
          onSave={() => handleCta("save")}
          onShare={() => void onShare()}
        />

        <MiniSiteFeatures accent={accent} />

        <section id="connect" className="scroll-mt-24 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
              Connect with me
            </p>
            <h2 className="mt-2 text-center font-display text-2xl font-bold sm:text-3xl">
              One tap to reach out
            </h2>
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
          </div>
        </section>

        <MiniSiteFinalCta
          accent={accent}
          name={card.companyName || ""}
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

        <footer className="border-t border-white/5 px-4 py-8 text-center">
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
