"use client";

import { motion } from "framer-motion";
import { CardPreview } from "@/components/cards/CardPreview";
import type { ICard } from "@/types/card.types";
import type { IAnalyticsSummary } from "@/types/analytics.types";
import type { IPlatformSettings, IUserFeatures } from "@/types/platform.types";
import { absoluteUrl } from "@/lib/utils";
import { resolveTheme } from "@/lib/theme";

export function PublicCardClient({
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

  async function onShare() {
    const url = absoluteUrl(`/c/${card.username}`);
    if (navigator.share) {
      await navigator.share({
        title: card.companyName,
        text: card.jobTitle,
        url,
      });
      return;
    }
    await navigator.clipboard.writeText(url);
    alert("Link copied");
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-8 sm:px-4 sm:py-12">
      {/* Immersive ambient stage */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, ${theme.buttonColor}33, transparent 55%),
            radial-gradient(ellipse 60% 40% at 10% 80%, ${theme.headerColor}22, transparent 50%),
            linear-gradient(180deg, #020617 0%, #041018 50%, #020617 100%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-40" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: `${theme.buttonColor}28` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[1] mx-auto max-w-md"
      >
        <div className="mb-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-200/60">
            Digital identity
          </p>
        </div>
        <div className="glow-border relative rounded-[2rem] p-[1px] fx-pulse-glow">
          <div className="overflow-hidden rounded-[1.95rem] shadow-glow-lg">
            <CardPreview
              card={card}
              analytics={analytics}
              track
              onShare={() => void onShare()}
              platformSettings={platformSettings}
              features={features}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
