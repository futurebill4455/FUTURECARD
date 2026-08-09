import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { listUsers } from "@/lib/db/users";
import { listSubscriptions } from "@/lib/db/subscriptions";
import { PageHeader } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { DeactivateUserButton, RenewButton } from "@/components/admin/UserActions";

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
        description="Create accounts and manage client access."
        actions={
          <Button asChild>
            <Link href="/admin/users/create">Create user</Link>
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Expires</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const id = u._id;
              const sub = subMap[id];
              return (
                <tr key={id} className="border-t">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3 capitalize">{sub?.plan ?? "—"}</td>
                  <td className="px-4 py-3">
                    {sub?.endDate
                      ? new Date(sub.endDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/admin/users/${id}`}>Manage</Link>
                      </Button>
                      <RenewButton userId={id} />
                      <DeactivateUserButton userId={id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
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
