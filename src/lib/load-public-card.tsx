import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import {
  findCardByCustomDomain,
  findCardByUsername,
} from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
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
import { isCustomDomainLive } from "@/lib/custom-domain-access";

async function renderCardFromDoc(card: ICard) {
  const accessible = await isCardPubliclyAccessible(card);
  const settings = await getPlatformSettings();

  if (!accessible) {
    return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <ExpiredCardNotice companyName={card.companyName} />
      </div>
    );
  }

  if (!card.isActive) notFound();

  await trackEvent({
    cardId: card._id,
    eventType: "view",
  });

  const analytics = await getCardAnalyticsSummary(card._id, card.createdAt);
  analytics.totalViews += 1;

  const owner = await findUserById(card.userId);
  const features = resolveFeatures(owner?.features);
  const data = applyFeaturesToCard(card, features);

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
  const card = await findCardByUsername(username);
  if (!card) notFound();
  return renderCardFromDoc(card);
}

export async function renderPublicCardByCustomDomain(host: string) {
  await dbConnect();
  const card = await findCardByCustomDomain(host);
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="glass glow-border max-w-md rounded-2xl p-6 text-center shadow-panel">
          <h1 className="font-display text-xl font-bold text-teal-50">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-teal-100/90">{host}</span> —{" "}
            {detail}
          </p>
        </div>
      </div>
    );
  }

  return renderCardFromDoc(card);
}
