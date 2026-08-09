import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { findCardByIdForUser } from "@/lib/db/cards";
import { getCardAnalyticsSummary } from "@/lib/analytics-tracker";
import { CardPreview } from "@/components/cards/CardPreview";
import { PageHeader } from "@/components/shared/Navbar";

type Props = { params: Promise<{ cardId: string }> };

export default async function PreviewCardPage({ params }: Props) {
  const { cardId } = await params;
  const session = await getServerSession(authOptions);
  await dbConnect();

  const card = await findCardByIdForUser(cardId, session!.user.id);
  if (!card) notFound();

  const analytics = await getCardAnalyticsSummary(cardId, card.createdAt);

  return (
    <div>
      <PageHeader title="Preview" description="How your public card looks." />
      <CardPreview card={card} analytics={analytics} />
    </div>
  );
}
