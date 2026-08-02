import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { User } from "@/models/User";
import { PageHeader } from "@/components/shared/Navbar";
import { AdminDomainsTable } from "@/components/admin/AdminDomainsTable";
import { getPlatformSettings } from "@/lib/platform-settings";
import {
  isCustomDomainLive,
  normalizeDomainStatus,
} from "@/lib/custom-domain-access";

export default async function AdminDomainsPage() {
  await dbConnect();
  const [cards, settings] = await Promise.all([
    Card.find({
      customDomain: { $exists: true, $nin: [null, ""] },
    })
      .select(
        "username companyName customDomain customDomainStatus customDomainActive customDomainRequestedAt customDomainReviewedAt userId updatedAt",
      )
      .sort({ customDomainRequestedAt: -1, updatedAt: -1 })
      .lean(),
    getPlatformSettings(),
  ]);

  const userIds = [...new Set(cards.map((c) => String(c.userId)))];
  const users = await User.find({ _id: { $in: userIds } })
    .select("name email features")
    .lean();
  const userMap = new Map(
    users.map((u) => [
      String(u._id),
      {
        name: u.name as string,
        email: u.email as string,
        customDomainFeature: Boolean(
          (u as { features?: { customDomain?: boolean } }).features
            ?.customDomain,
        ),
      },
    ]),
  );

  const rows = cards.map((c) => {
    const status = normalizeDomainStatus(c.customDomainStatus as string);
    const live = isCustomDomainLive({
      customDomain: c.customDomain as string | undefined,
      customDomainStatus: c.customDomainStatus as string | undefined,
      customDomainActive: c.customDomainActive as boolean | undefined,
    });
    return {
      _id: String(c._id),
      username: c.username as string,
      companyName: c.companyName as string,
      customDomain: c.customDomain as string | undefined,
      customDomainStatus: status,
      customDomainActive: live || Boolean(c.customDomainActive),
      customDomainRequestedAt: c.customDomainRequestedAt
        ? new Date(c.customDomainRequestedAt as Date).toISOString()
        : undefined,
      customDomainReviewedAt: c.customDomainReviewedAt
        ? new Date(c.customDomainReviewedAt as Date).toISOString()
        : undefined,
      isLive: live,
      owner: userMap.get(String(c.userId)) ?? null,
    };
  });

  const pendingCount = rows.filter(
    (r) => r.customDomainStatus === "pending",
  ).length;

  return (
    <div>
      <PageHeader
        title="Custom Domain Requests"
        description={
          pendingCount
            ? `${pendingCount} pending request${pendingCount === 1 ? "" : "s"} awaiting review. Approve, then toggle Active to enable mapping.`
            : "Review, approve, reject, and activate client custom domains."
        }
      />
      <AdminDomainsTable
        initial={rows}
        platformCnameTarget={settings.platformCnameTarget}
      />
    </div>
  );
}
