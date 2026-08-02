import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { PageHeader } from "@/components/shared/Navbar";
import { CardBuilderForm } from "@/components/forms/CardBuilderForm";
import { resolveFeatures } from "@/types/platform.types";

export default async function CreateCardPage() {
  const session = await getServerSession(authOptions);
  await dbConnect();
  const userDoc = await User.findById(session!.user.id).select("features").lean();
  const user =
    userDoc && !Array.isArray(userDoc)
      ? (userDoc as unknown as { features?: Record<string, boolean> })
      : null;
  const features = resolveFeatures(user?.features);

  return (
    <div>
      <PageHeader
        title="Create card"
        description="Fill in your business details. You can edit anytime."
      />
      <CardBuilderForm mode="create" features={features} />
    </div>
  );
}
