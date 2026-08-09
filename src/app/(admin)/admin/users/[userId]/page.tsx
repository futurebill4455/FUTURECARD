import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { findUserById } from "@/lib/db/users";
import { findSubscriptionByUserId } from "@/lib/db/subscriptions";
import { PageHeader } from "@/components/shared/Navbar";
import { UserManageForm } from "@/components/admin/UserManageForm";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ userId: string }> };

export default async function AdminUserEditPage({ params }: Props) {
  const { userId } = await params;
  await dbConnect();
  const user = await findUserById(userId);
  if (!user) notFound();

  const sub = await findSubscriptionByUserId(userId);

  return (
    <div>
      <PageHeader
        title={user.name}
        description="Permissions, limits, and subscription validity."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/users">Back to users</Link>
          </Button>
        }
      />
      <UserManageForm
        userId={userId}
        initial={{
          name: user.name,
          email: user.email,
          isActive: Boolean(user.isActive),
          features: user.features,
          limits: user.limits,
          subscription: sub
            ? {
                plan: sub.plan,
                endDate: sub.endDate
                  ? new Date(sub.endDate).toISOString()
                  : undefined,
                isActive: sub.isActive,
                paymentStatus: sub.paymentStatus,
              }
            : null,
        }}
      />
    </div>
  );
}
