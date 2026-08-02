"use client";

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
    <div
      className="min-h-screen px-3 py-6 sm:px-4"
      style={{
        background: `radial-gradient(ellipse at top, ${theme.backgroundColor}, ${theme.backgroundColor} 40%, #ffffff)`,
      }}
    >
      <CardPreview
        card={card}
        analytics={analytics}
        track
        onShare={() => void onShare()}
        platformSettings={platformSettings}
        features={features}
      />
    </div>
  );
}
