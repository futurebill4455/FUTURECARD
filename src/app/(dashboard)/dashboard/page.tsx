import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { listCardsByUser } from "@/lib/db/cards";
import { findSubscriptionByUserId } from "@/lib/db/subscriptions";
import { findUserById } from "@/lib/db/users";
import { PageHeader, StatCard } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card as UiCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomDomainSettings } from "@/components/dashboard/CustomDomainSettings";
import { getPlatformSettings } from "@/lib/platform-settings";
import { canRequestCustomDomain } from "@/lib/custom-domain-access";
import { resolveFeatures } from "@/types/platform.types";
import {
  isCustomDomainLive,
  normalizeDomainStatus,
} from "@/lib/custom-domain-access";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  await dbConnect();

  const [cards, sub, settings, userDoc] = await Promise.all([
    listCardsByUser(session!.user.id),
    findSubscriptionByUserId(session!.user.id),
    getPlatformSettings(),
    findUserById(session!.user.id),
  ]);

  const features = resolveFeatures(userDoc?.features ?? null);
  const privilege = canRequestCustomDomain(features, sub?.plan ?? "free");

  const recent = cards.slice(0, 5);
  const domainCards = cards.map((c) => ({
    _id: c._id,
    username: c.username,
    companyName: c.companyName,
    customDomain: c.customDomain || "",
    customDomainStatus: normalizeDomainStatus(c.customDomainStatus),
    customDomainActive: isCustomDomainLive(c),
  }));

  return (
    <div>
      <PageHeader
        title={`Hello, ${session!.user.name?.split(" ")[0] || "there"}`}
        description="Manage your digital visiting cards and subscription."
        actions={
          <Button asChild className="bg-teal-700 hover:bg-teal-800">
            <Link href="/cards/create">New card</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cards" value={cards.length} />
        <StatCard label="Plan" value={sub?.plan ?? "free"} />
        <StatCard
          label="Status"
          value={sub?.isActive ? "Active" : "Inactive"}
        />
        <StatCard
          label="Expires"
          value={
            sub?.endDate
              ? new Date(sub.endDate).toLocaleDateString()
              : "—"
          }
        />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Recent cards</h2>
        <div className="mt-3 space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cards yet.{" "}
              <Link href="/cards/create" className="text-teal-800 underline">
                Create your first card
              </Link>
            </p>
          ) : (
            recent.map((c) => (
              <Link
                key={c._id}
                href={`/cards/${c._id}/edit`}
                className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:bg-muted/40"
              >
                <div>
                  <div className="font-semibold">{c.companyName}</div>
                  <div className="text-xs text-muted-foreground">
                    /{c.username}
                    {c.customDomain ? (
                      <span className="ml-2 text-teal-800">
                        · {c.customDomain}
                        {isCustomDomainLive(c) ? " (live)" : " (pending)"}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  {c.isActive ? "Live" : "Draft"}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      <UiCard className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Custom Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomDomainSettings
            cards={domainCards}
            platformCnameTarget={settings.platformCnameTarget}
            allowed={privilege.allowed}
            lockReason={privilege.reason}
          />
        </CardContent>
      </UiCard>
    </div>
  );
}
