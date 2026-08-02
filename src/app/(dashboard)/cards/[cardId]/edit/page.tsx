import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { User } from "@/models/User";
import { PageHeader } from "@/components/shared/Navbar";
import { CardBuilderForm } from "@/components/forms/CardBuilderForm";
import { resolveFeatures } from "@/types/platform.types";
import type { ICard } from "@/types/card.types";

type Props = { params: Promise<{ cardId: string }> };

export default async function EditCardPage({ params }: Props) {
  const { cardId } = await params;
  const session = await getServerSession(authOptions);
  await dbConnect();

  const card = await Card.findOne({ _id: cardId, userId: session!.user.id });
  if (!card) notFound();

  const userDoc = await User.findById(session!.user.id).select("features").lean();
  const user =
    userDoc && !Array.isArray(userDoc)
      ? (userDoc as unknown as { features?: Record<string, boolean> })
      : null;
  const features = resolveFeatures(user?.features);

  const initial = JSON.parse(JSON.stringify(card)) as ICard;

  return (
    <div>
      <PageHeader
        title="Edit card"
        description={`Public URL: /${card.username}`}
      />
      <CardBuilderForm mode="edit" initial={initial} features={features} />
    </div>
  );
}
