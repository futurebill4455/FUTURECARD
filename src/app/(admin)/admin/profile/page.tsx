import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { findUserById } from "@/lib/db/users";
import { PageHeader } from "@/components/shared/Navbar";
import {
  Card as UiCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileSettingsForm } from "@/components/shared/ProfileSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  await dbConnect();
  const user = await findUserById(session.user.id);
  if (!user) redirect("/login");

  return (
    <div>
      <PageHeader
        title="My profile"
        description="Update your display name, email, and password."
      />
      <UiCard className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm
            initial={{
              name: user.name,
              email: user.email,
            }}
          />
        </CardContent>
      </UiCard>
    </div>
  );
}
