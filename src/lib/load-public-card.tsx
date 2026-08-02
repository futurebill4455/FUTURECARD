import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { User } from "@/models/User";
import {
  getCardAnalyticsSummary,
  trackEvent,
} from "@/lib/analytics-tracker";
import { PublicCardClient } from "@/components/cards/PublicCardClient";
import { ExpiredCardNotice } from "@/components/cards/CardPromoFooter";
import { getPlatformSettings } from "@/lib/platform-settings";
import { isCardPubliclyAccessible } from "@/lib/subscription-access";
import { applyFeaturesToCard } from "@/lib/feature-permissions";
import { resolveFeatures } from "@/types/platform.types";
import type { ICard } from "@/types/card.types";
import type { CardDocument } from "@/models/Card";
import { isCustomDomainLive } from "@/lib/custom-domain-access";

async function renderCardFromDoc(card: CardDocument) {
  const accessible = await isCardPubliclyAccessible(card);
  const settings = await getPlatformSettings();

  if (!accessible) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <ExpiredCardNotice companyName={card.companyName} />
      </div>
    );
  }

  if (!card.isActive) notFound();

  await trackEvent({
    cardId: card._id.toString(),
    eventType: "view",
  });

  const analytics = await getCardAnalyticsSummary(
    card._id.toString(),
    card.createdAt,
  );
  analytics.totalViews += 1;

  const ownerDoc = await User.findById(card.userId).select("features").lean();
  const owner =
    ownerDoc && !Array.isArray(ownerDoc)
      ? (ownerDoc as unknown as { features?: Record<string, boolean> })
      : null;
  const features = resolveFeatures(owner?.features);
  const data = applyFeaturesToCard(
    JSON.parse(JSON.stringify(card)) as ICard,
    features,
  );

  return (
    <PublicCardClient
      card={data}
      analytics={features.analytics ? analytics : undefined}
      platformSettings={settings}
      features={features}
    />
  );
}

export async function renderPublicCardByUsername(username: string) {
  await dbConnect();
  const card = await Card.findOne({ username: username.toLowerCase() });
  if (!card) notFound();
  return renderCardFromDoc(card);
}

export async function renderPublicCardByCustomDomain(host: string) {
  await dbConnect();
  const card = await Card.findOne({ customDomain: host.toLowerCase() });
  if (!card) notFound();

  if (!isCustomDomainLive(card)) {
    const status = card.customDomainStatus || "pending";
    const title =
      status === "rejected"
        ? "Domain request rejected"
        : status === "approved"
          ? "Domain approved — not active yet"
          : "Domain pending Super Admin approval";
    const detail =
      status === "rejected"
        ? "This custom domain request was rejected. Contact support or submit a new request from the dashboard."
        : status === "approved"
          ? "Super Admin approved this domain, but it has not been activated yet. Mapping will start once it is toggled Active."
          : "This domain is linked to a card but is waiting for Super Admin approval and activation.";

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
          <h1 className="font-display text-xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{host}</span> —{" "}
            {detail}
          </p>
        </div>
      </div>
    );
  }

  return renderCardFromDoc(card);
}
