import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { findCardByIdForUser } from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { PageHeader } from "@/components/shared/Navbar";
import { CardBuilderForm } from "@/components/forms/CardBuilderForm";
import { resolveFeatures } from "@/types/platform.types";
import { resolveCardSections } from "@/types/card-sections.types";

type Props = { params: Promise<{ cardId: string }> };

export default async function EditCardPage({ params }: Props) {
  const { cardId } = await params;
  const session = await getServerSession(authOptions);
  await dbConnect();

  const card = await findCardByIdForUser(cardId, session!.user.id);
  if (!card) notFound();

  const user = await findUserById(session!.user.id);
  const features = resolveFeatures(user?.features);
  const cardSections = resolveCardSections(user?.cardSections);

  return (
    <div>
      <PageHeader
        title="Edit card"
        description={`Public URL: /${card.username}`}
      />
      <CardBuilderForm
        mode="edit"
        initial={card}
        features={features}
        cardSections={cardSections}
      />
    </div>
  );
}
