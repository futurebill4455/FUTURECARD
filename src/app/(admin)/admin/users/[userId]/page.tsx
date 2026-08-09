import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { findUserById } from "@/lib/db/users";
import { listCardsByUser } from "@/lib/db/cards";
import { findSubscriptionByUserId } from "@/lib/db/subscriptions";
import { PageHeader } from "@/components/shared/Navbar";
import { UserManageForm } from "@/components/admin/UserManageForm";
import { AdminUserCardsPanel } from "@/components/admin/AdminUserCardsPanel";
import { UserApprovalActions } from "@/components/admin/UserApprovalActions";
import { DeleteUserButton } from "@/components/admin/UserActions";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ userId: string }> };

export default async function AdminUserEditPage({ params }: Props) {
  const { userId } = await params;
  await dbConnect();
  const user = await findUserById(userId);
  if (!user) notFound();

  const [sub, cards] = await Promise.all([
    findSubscriptionByUserId(userId),
    listCardsByUser(userId),
  ]);

  return (
    <div>
      <PageHeader
        title={user.name}
        description="Permissions, limits, card templates, and subscription."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {user.role === "user" ? (
              <DeleteUserButton
                userId={userId}
                userName={user.name}
                redirectTo="/admin/users"
              />
            ) : null}
            <Button asChild variant="outline">
              <Link href="/admin/users">Back to users</Link>
            </Button>
          </div>
        }
      />
      <div className="space-y-6">
        {user.role === "user" ? (
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Signup approval
                </h2>
                <p className="text-xs text-muted-foreground">
                  Self-registered accounts must be approved before they can
                  sign in.
                </p>
              </div>
              <UserApprovalActions
                userId={userId}
                isApproved={Boolean(user.isApproved)}
              />
            </div>
          </section>
        ) : null}
        <AdminUserCardsPanel cards={cards} />
        <UserManageForm
          userId={userId}
          initial={{
            name: user.name,
            email: user.email,
            isActive: Boolean(user.isActive),
            features: user.features,
            cardSections: user.cardSections,
            maxCardsLimit: user.maxCardsLimit,
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
    </div>
  );
}
