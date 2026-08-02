import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { getCardAnalyticsSummary } from "@/lib/analytics-tracker";
import { PageHeader, StatCard } from "@/components/shared/Navbar";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  await dbConnect();
  const cards = await Card.find({ userId: session!.user.id });

  const summaries = await Promise.all(
    cards.map(async (c) => ({
      card: c,
      stats: await getCardAnalyticsSummary(c._id.toString(), c.createdAt),
    })),
  );

  const totals = summaries.reduce(
    (acc, s) => ({
      views: acc.views + s.stats.totalViews,
      clicks: acc.clicks + s.stats.totalClicks,
      actions: acc.actions + s.stats.totalActions,
      shares: acc.shares + s.stats.totalShares,
    }),
    { views: 0, clicks: 0, actions: 0, shares: 0 },
  );

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Engagement across all your digital cards."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Views" value={totals.views} />
        <StatCard label="Clicks" value={totals.clicks} />
        <StatCard label="Actions" value={totals.actions} />
        <StatCard label="Shares" value={totals.shares} />
      </div>

      <div className="mt-8 space-y-3">
        {summaries.map(({ card, stats }) => (
          <div
            key={card._id.toString()}
            className="rounded-2xl border bg-card p-4"
          >
            <div className="font-semibold">{card.companyName}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
              <span>Views: {stats.totalViews}</span>
              <span>Clicks: {stats.totalClicks}</span>
              <span>Actions: {stats.totalActions}</span>
              <span>Days: {stats.daysLive}</span>
              <span>Engage: {stats.engagementRate}%</span>
            </div>
          </div>
        ))}
        {summaries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cards to analyze yet.</p>
        ) : null}
      </div>
    </div>
  );
}
