"use client";

import { useRef, useState } from "react";
import type { ICard, IServiceItem } from "@/types/card.types";
import type { IAnalyticsSummary } from "@/types/analytics.types";
import { CardBackground } from "./CardBackground";
import { PrimaryCtaRow } from "./PrimaryCtaRow";
import { ActionIconGrid } from "./ActionIconGrid";
import { BusinessHoursBadge } from "./BusinessHoursBadge";
import { ImageGallery } from "./ImageGallery";
import { VideoGallery } from "./VideoGallery";
import {
  ServiceDetailModal,
  ServicesSection,
} from "./ServicesSection";
import { hasPaymentDetails, PayNowModal } from "./PayNowModal";
import { CardHeaderIdentity } from "./CompanyDetails";
import { CardPromoFooter } from "./CardPromoFooter";
import { resolveTheme, themeStyleVars, tintColor } from "@/lib/theme";
import { DEFAULT_PRIMARY_CTAS } from "@/types/card.types";
import {
  normalizePrimaryCtas,
  resolveActionButtons,
} from "@/lib/action-buttons";
import { downloadVCard, generateVCard } from "@/lib/vcard-generator";
import { cn } from "@/lib/utils";
import type { IPlatformSettings, IUserFeatures } from "@/types/platform.types";

interface CardPreviewProps {
  card: ICard;
  analytics?: IAnalyticsSummary;
  className?: string;
  track?: boolean;
  onShare?: () => void;
  platformSettings?: IPlatformSettings;
  features?: IUserFeatures;
}

export function CardPreview({
  card,
  analytics,
  className,
  track = false,
  onShare,
  platformSettings,
  features,
}: CardPreviewProps) {
  const theme = resolveTheme(card);
  const soft = tintColor(theme.buttonColor, 0.88);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<IServiceItem | null>(
    null,
  );
  const [payOpen, setPayOpen] = useState(false);

  const ctas = normalizePrimaryCtas(
    card.primaryCtas?.length ? card.primaryCtas : DEFAULT_PRIMARY_CTAS,
  )
    .filter((cta) => {
      if (cta.id === "pay" && features && !features.payment) return false;
      if (cta.id === "services" && features && !features.services) return false;
      return true;
    })
    .map((cta) => {
    if (
      cta.id === "services" ||
      cta.id === "pay" ||
      cta.id === "save"
    ) {
      return { ...cta, url: "" };
    }
    if (cta.id === "book") {
      const book =
        resolveActionButtons(card).find((b) => b.key === "bookNow")?.value ||
        card.extraLinks?.bookNow ||
        cta.url ||
        "";
      return { ...cta, url: book };
    }
    return cta;
  });

  async function trackEvent(eventType: string, eventDetail?: string) {
    if (!track) return;
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
      servicesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-black/5 shadow-xl",
        className,
      )}
      style={themeStyleVars(theme)}
    >
      <div className="relative" style={{ backgroundColor: theme.headerColor }}>
        <CardBackground
          mediaType={card.backgroundMediaType}
          images={card.backgroundImages}
          video={card.backgroundVideo}
          fallbackCover={card.coverImage}
          className="!rounded-none h-48 sm:h-52"
        />
      </div>

      <div
        className="relative z-10 px-4 pb-6 pt-0"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        {/* Profile logo overlapping cover */}
        <div className="relative z-20 -mt-14 flex justify-center">
          <div
            className="h-[7.25rem] w-[7.25rem] overflow-hidden rounded-full border-[5px] border-white bg-white shadow-[0_10px_28px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
            style={{ backgroundColor: soft }}
          >
            {card.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.profileImage}
                alt={card.companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-white"
                style={{ backgroundColor: theme.buttonColor }}
              >
                {card.companyName.slice(0, 1)}
              </div>
            )}
          </div>
        </div>

        <CardHeaderIdentity
          card={card}
          accent={theme.buttonColor}
          className="mt-3"
        />

        <div className="mt-5 animate-fade-up-delay">
          <PrimaryCtaRow
            ctas={ctas}
            buttonColor={theme.buttonColor}
            onAction={handleCta}
          />
        </div>

        <div className="mt-6">
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

        <div className="mt-5">
          <BusinessHoursBadge
            hours={card.businessHours}
            accent={theme.buttonColor}
          />
        </div>

        <div ref={servicesRef}>
          <ServicesSection
            card={card}
            accent={theme.buttonColor}
            className="mt-6"
            onSelect={(svc) => {
              setSelectedService(svc);
              void trackEvent("action", `service_view_${svc.id}`);
            }}
          />
        </div>

        <ImageGallery
          images={card.galleryImages}
          accent={theme.buttonColor}
          className="mt-6"
        />

        <VideoGallery
          videos={card.galleryVideos}
          accent={theme.buttonColor}
          className="mt-6"
        />

        {analytics ? (
          <section className="mt-6 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
            <h2 className="font-display text-lg font-bold">Analytics</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Stat
                label="Views"
                value={analytics.totalViews}
                color={theme.buttonColor}
              />
              <Stat
                label="Clicks"
                value={analytics.totalClicks}
                color={theme.buttonColor}
              />
              <Stat
                label="Actions"
                value={analytics.totalActions}
                color={theme.buttonColor}
              />
              <Stat
                label="Days"
                value={analytics.daysLive}
                color={theme.buttonColor}
              />
              <Stat
                label="Engage"
                value={`${analytics.engagementRate}%`}
                color={theme.buttonColor}
              />
            </div>
          </section>
        ) : null}

        <button
          type="button"
          className="mt-5 w-full rounded-xl border border-dashed bg-white/50 py-3 text-sm font-semibold text-muted-foreground"
          onClick={() => {
            void trackEvent("share");
            onShare?.();
          }}
        >
          Share this card
        </button>

        {platformSettings ? (
          <CardPromoFooter
            settings={platformSettings}
            accent={theme.buttonColor}
            onTrack={() => void trackEvent("click", "referral_whatsapp")}
          />
        ) : (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Verified by Future Shield
          </p>
        )}
      </div>

      {selectedService ? (
        <ServiceDetailModal
          card={card}
          service={selectedService}
          accent={theme.buttonColor}
          onClose={() => setSelectedService(null)}
          onInquiry={() =>
            void trackEvent("action", `service_inquiry_${selectedService.id}`)
          }
        />
      ) : null}

      {payOpen ? (
        <PayNowModal
          card={card}
          accent={theme.buttonColor}
          onClose={() => setPayOpen(false)}
        />
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white px-2 py-3 text-center ring-1 ring-black/5">
      <div className="font-display text-lg font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
