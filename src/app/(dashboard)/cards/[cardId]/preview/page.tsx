import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { findCardByIdForUser } from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { getCardAnalyticsSummary } from "@/lib/analytics-tracker";
import { PublicCardClient } from "@/components/cards/PublicCardClient";
import { getPlatformSettings } from "@/lib/platform-settings";
import { applyFeaturesToCard } from "@/lib/feature-permissions";
import { resolveFeatures } from "@/types/platform.types";
import Link from "next/link";

type Props = { params: Promise<{ cardId: string }> };

export const dynamic = "force-dynamic";

export default async function PreviewCardPage({ params }: Props) {
  const { cardId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  await dbConnect();

  const card = await findCardByIdForUser(cardId, session.user.id);
  if (!card) notFound();

  const [analytics, settings, userDoc] = await Promise.all([
    getCardAnalyticsSummary(cardId, card.createdAt),
    getPlatformSettings(),
    findUserById(session.user.id),
  ]);

  const features = resolveFeatures(userDoc?.features);
  const data = applyFeaturesToCard(card, features);

  return (
    <div className="relative -mx-4 -mb-8 md:-mx-8">
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-2.5 backdrop-blur-xl">
        <p className="text-xs font-semibold text-cyan-100/80">
          Live mini-site preview
        </p>
        <Link
          href={`/cards/${cardId}/edit`}
          className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-white/5"
        >
          ← Back to editor
        </Link>
      </div>
      <PublicCardClient
        card={data}
        analytics={features.analytics ? analytics : undefined}
        platformSettings={settings}
        features={features}
      />
    </div>
  );
}
