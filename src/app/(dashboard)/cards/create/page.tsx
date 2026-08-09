import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { listCardsByUser } from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { getPlatformSettings } from "@/lib/platform-settings";
import { PageHeader } from "@/components/shared/Navbar";
import { CardBuilderForm } from "@/components/forms/CardBuilderForm";
import { CardLimitReachedPrompt } from "@/components/dashboard/CardUsageIndicator";
import { resolveFeatures, resolveMaxCardsLimit } from "@/types/platform.types";
import { resolveCardSections } from "@/types/card-sections.types";

export default async function CreateCardPage() {
  const session = await getServerSession(authOptions);
  await dbConnect();
  const [user, cards, settings] = await Promise.all([
    findUserById(session!.user.id),
    listCardsByUser(session!.user.id),
    getPlatformSettings(),
  ]);
  const features = resolveFeatures(user?.features);
  const cardSections = resolveCardSections(user?.cardSections);
  const maxCards = resolveMaxCardsLimit(user);
  const used = cards.length;

  if (used >= maxCards) {
    return (
      <div>
        <PageHeader
          title="Create card"
          description="Your account has reached its card limit."
        />
        <CardLimitReachedPrompt
          used={used}
          limit={maxCards}
          adminWhatsapp={settings.adminWhatsappNumber}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Create card"
        description={`Fill in your business details. Usage: ${used}/${maxCards} cards.`}
      />
      <CardBuilderForm
        mode="create"
        features={features}
        cardSections={cardSections}
      />
    </div>
  );
}
