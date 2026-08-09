import { dbConnect } from "@/lib/db";
import { listSubscriptions } from "@/lib/db/subscriptions";
import { listUsers } from "@/lib/db/users";
import { PageHeader } from "@/components/shared/Navbar";
import { RenewButton } from "@/components/admin/UserActions";

export default async function AdminSubscriptionsPage() {
  await dbConnect();
  const [subs, users] = await Promise.all([
    listSubscriptions(),
    listUsers(),
  ]);
  const userMap = new Map(users.map((u) => [u._id, u]));

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Yearly plans, validity, and renewal status."
      />
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Start</th>
              <th className="px-4 py-3 font-semibold">End</th>
              <th className="px-4 py-3 font-semibold">Active</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => {
              const user = userMap.get(s.userId);
              return (
                <tr key={s._id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{user?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {user?.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{s.plan}</td>
                  <td className="px-4 py-3 capitalize">{s.paymentStatus}</td>
                  <td className="px-4 py-3">
                    {new Date(s.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(s.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{s.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <RenewButton userId={s.userId} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
