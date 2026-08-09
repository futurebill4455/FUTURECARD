"use client";

import { MiniSiteShell } from "@/components/cards/minisite/MiniSiteShell";
import type { ICard } from "@/types/card.types";
import type { IAnalyticsSummary } from "@/types/analytics.types";
import type { IPlatformSettings, IUserFeatures } from "@/types/platform.types";

/**
 * Public digital identity — premium Future Shield mini-website experience.
 * Dashboard card preview continues to use CardPreview (compact).
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
  return (
    <MiniSiteShell
      card={card}
      analytics={analytics}
      platformSettings={platformSettings}
      features={features}
    />
  );
}
