import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { PageHeader } from "@/components/shared/Navbar";
import { UserManageForm } from "@/components/admin/UserManageForm";
import { Button } from "@/components/ui/button";
import type { IUserFeatures, IUserLimits } from "@/types/platform.types";

type Props = { params: Promise<{ userId: string }> };

export default async function AdminUserEditPage({ params }: Props) {
  const { userId } = await params;
  await dbConnect();
  const userDoc = await User.findById(userId).select("-password").lean();
  if (!userDoc || Array.isArray(userDoc)) notFound();

  const user = userDoc as unknown as {
    name: string;
    email: string;
    isActive: boolean;
    features?: IUserFeatures;
    limits?: IUserLimits;
  };

  const subDoc = await Subscription.findOne({ userId }).lean();
  const sub = subDoc && !Array.isArray(subDoc)
    ? (subDoc as unknown as {
        plan: string;
        endDate?: Date;
        isActive: boolean;
        paymentStatus: string;
      })
    : null;

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
