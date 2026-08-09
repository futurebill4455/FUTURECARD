"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
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
import { HolographicAvatar } from "./HolographicAvatar";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 shadow-2xl",
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
      </div>

      <div
        className="relative z-10 px-4 pb-7 pt-0"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        {/* Holographic profile core */}
        <div className="relative z-20 -mt-16 flex justify-center">
          <HolographicAvatar
            src={card.profileImage}
            alt={card.companyName}
            fallbackLetter={card.companyName.slice(0, 1)}
            accent={theme.buttonColor}
            soft={soft}
            size={116}
          />
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
          <section className="mt-6 rounded-2xl bg-black/[0.04] p-4 shadow-inner ring-1 ring-black/5 backdrop-blur-sm">
            <h2 className="font-display text-lg font-bold">Live pulse</h2>
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

        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="mt-5 w-full rounded-xl border border-black/10 bg-white/60 py-3 text-sm font-semibold text-foreground/80 shadow-sm backdrop-blur-sm transition hover:bg-white/80"
          onClick={() => {
            void trackEvent("share");
            onShare?.();
          }}
        >
          Share this card
        </motion.button>

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
    </motion.div>
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
    <div className="rounded-xl bg-white/80 px-2 py-3 text-center shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
      <div className="font-display text-lg font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-black/45">
        {label}
      </div>
    </div>
  );
}
