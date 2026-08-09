import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { findUserById } from "@/lib/db/users";
import { PageHeader } from "@/components/shared/Navbar";
import { CardBuilderForm } from "@/components/forms/CardBuilderForm";
import { resolveFeatures } from "@/types/platform.types";

export default async function CreateCardPage() {
  const session = await getServerSession(authOptions);
  await dbConnect();
  const user = await findUserById(session!.user.id);
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
