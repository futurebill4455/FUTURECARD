import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { getCardAnalyticsSummary } from "@/lib/analytics-tracker";
import { CardPreview } from "@/components/cards/CardPreview";
import { PageHeader } from "@/components/shared/Navbar";
import type { ICard } from "@/types/card.types";

type Props = { params: Promise<{ cardId: string }> };

export default async function PreviewCardPage({ params }: Props) {
  const { cardId } = await params;
  const session = await getServerSession(authOptions);
  await dbConnect();

  const card = await Card.findOne({ _id: cardId, userId: session!.user.id });
  if (!card) notFound();

  const analytics = await getCardAnalyticsSummary(cardId, card.createdAt);
  const data = JSON.parse(JSON.stringify(card)) as ICard;

  return (
    <div>
      <PageHeader title="Preview" description="How your public card looks." />
      <CardPreview card={data} analytics={analytics} />
    </div>
  );
}
