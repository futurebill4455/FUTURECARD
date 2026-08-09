import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { listUsers } from "@/lib/db/users";
import { listSubscriptions } from "@/lib/db/subscriptions";
import { PageHeader } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import {
  DeactivateUserButton,
  DeleteUserButton,
  RenewButton,
} from "@/components/admin/UserActions";
import { SubscriptionToggle } from "@/components/admin/SubscriptionToggle";
import { MaxCardsLimitCell } from "@/components/admin/MaxCardsLimitCell";
import { UserApprovalActions } from "@/components/admin/UserApprovalActions";
import { resolveMaxCardsLimit } from "@/types/platform.types";

function isLiveSub(sub?: {
  isActive?: boolean;
  paymentStatus?: string;
  endDate?: string;
} | null) {
  if (!sub?.isActive) return false;
  if (
    sub.paymentStatus === "expired" ||
    sub.paymentStatus === "cancelled"
  ) {
    return false;
  }
  if (sub.endDate && new Date(sub.endDate) <= new Date()) return false;
  return true;
}

export default async function AdminUsersPage() {
  await dbConnect();
  const [allUsers, subs] = await Promise.all([
    listUsers(),
    listSubscriptions(),
  ]);
  const users = allUsers.filter((u) => u.role === "user");
  const subMap = Object.fromEntries(subs.map((s) => [s.userId, s]));

  return (
    <div>
      <PageHeader
        title="Users"
        description="Create accounts and manage client access & subscriptions."
        actions={
          <Button asChild>
            <Link href="/admin/users/create">Create user</Link>
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-card/80 shadow-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Account</th>
              <th className="px-4 py-3 font-semibold">Approval</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Max cards</th>
              <th className="px-4 py-3 font-semibold">Expires</th>
              <th className="px-4 py-3 font-semibold">Subscription</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const id = u._id;
              const sub = subMap[id];
              const live = isLiveSub(sub);
              const approved = Boolean(u.isApproved);
              return (
                <tr
                  key={id}
                  className={`border-t border-white/5 ${
                    !approved ? "bg-amber-500/[0.04]" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.isActive ? (
                      <span className="text-teal-300">Active</span>
                    ) : (
                      <span className="text-red-300">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <UserApprovalActions
                      userId={id}
                      isApproved={approved}
                    />
                  </td>
                  <td className="px-4 py-3 capitalize">{sub?.plan ?? "—"}</td>
                  <td className="px-4 py-3">
                    <MaxCardsLimitCell
                      userId={id}
                      initial={resolveMaxCardsLimit(u)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {sub?.endDate
                      ? new Date(sub.endDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <SubscriptionToggle
                      userId={id}
                      initialSubscribed={live}
                      isActive={sub?.isActive}
                      paymentStatus={sub?.paymentStatus}
                      endDate={sub?.endDate}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/admin/users/${id}`}>Manage</Link>
                      </Button>
                      <RenewButton userId={id} />
                      <DeactivateUserButton userId={id} />
                      <DeleteUserButton userId={id} userName={u.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No users yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
