import { dbConnect } from "@/lib/db";
import { countUsersByRole } from "@/lib/db/users";
import { countCards } from "@/lib/db/cards";
import {
  countActiveSubscriptions,
  countExpiredSubscriptions,
} from "@/lib/db/subscriptions";
import { PageHeader, StatCard } from "@/components/shared/Navbar";
import { expireDueSubscriptions } from "@/lib/subscription-access";
import { ExpireSweepButton } from "@/components/admin/UserActions";

export default async function AdminDashboardPage() {
  await dbConnect();
  await expireDueSubscriptions();

  const [users, cards, activeSubs, expired] = await Promise.all([
    countUsersByRole("user"),
    countCards(),
    countActiveSubscriptions(),
    countExpiredSubscriptions(),
  ]);

  return (
    <div>
      <PageHeader
        title="Admin dashboard"
        description="Platform overview for FutureCard."
        actions={<ExpireSweepButton />}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={users} />
        <StatCard label="Cards" value={cards} />
        <StatCard label="Active subs" value={activeSubs} />
        <StatCard label="Expired" value={expired} />
      </div>
    </div>
  );
}
