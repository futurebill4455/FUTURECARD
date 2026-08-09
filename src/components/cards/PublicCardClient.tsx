"use client";

import { motion } from "framer-motion";
import { CardPreview } from "@/components/cards/CardPreview";
import { ImmersiveBackground } from "@/components/shared/ImmersiveBackground";
import type { ICard } from "@/types/card.types";
import type { IAnalyticsSummary } from "@/types/analytics.types";
import type { IPlatformSettings, IUserFeatures } from "@/types/platform.types";
import { absoluteUrl } from "@/lib/utils";
import { resolveTheme } from "@/lib/theme";

/**
 * Public card stage: platform ambient (admin video/slideshow/gradient)
 * fills the viewport; the card’s own media stays on the header cover only.
 */
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

  const ambientMode = platformSettings?.ambientMode || "gradient";
  const ambientVideo = platformSettings?.ambientVideo || "";
  const ambientImages = platformSettings?.ambientImages || [];

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
      <ImmersiveBackground
        mode={ambientMode}
        video={ambientVideo}
        images={ambientImages}
        accent={theme.buttonColor}
        intensity={0.72}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[1] mx-auto max-w-md"
      >
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-teal-200/55"
        >
          Digital identity
        </motion.p>
        <div className="glow-border relative rounded-[2rem] p-[1px] fx-pulse-glow">
          <div className="overflow-hidden rounded-[1.95rem] border border-white/10 shadow-glow-lg backdrop-blur-[2px]">
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
