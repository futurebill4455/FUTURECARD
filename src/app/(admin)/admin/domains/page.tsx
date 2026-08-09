import { dbConnect } from "@/lib/db";
import { listCardsWithCustomDomains } from "@/lib/db/cards";
import { listUsers } from "@/lib/db/users";
import { PageHeader } from "@/components/shared/Navbar";
import { AdminDomainsTable } from "@/components/admin/AdminDomainsTable";
import { getPlatformSettings } from "@/lib/platform-settings";
import {
  isCustomDomainLive,
  normalizeDomainStatus,
} from "@/lib/custom-domain-access";
import { DEFAULT_PLATFORM_SETTINGS } from "@/types/platform.types";

export const dynamic = "force-dynamic";

export default async function AdminDomainsPage() {
  let rows: {
    _id: string;
    username: string;
    companyName: string;
    customDomain?: string;
    customDomainStatus: string;
    customDomainActive: boolean;
    customDomainRequestedAt?: string;
    customDomainReviewedAt?: string;
    isLive: boolean;
    owner: {
      name: string;
      email: string;
      customDomainFeature: boolean;
    } | null;
  }[] = [];
  let platformCnameTarget = DEFAULT_PLATFORM_SETTINGS.platformCnameTarget;

  try {
    await dbConnect();
    const [cards, settings] = await Promise.all([
      listCardsWithCustomDomains(),
      getPlatformSettings(),
    ]);

    platformCnameTarget = settings.platformCnameTarget;

    const userIds = new Set(cards.map((c) => c.userId));
    const users = await listUsers();
    const userMap = new Map(
      users
        .filter((u) => userIds.has(u._id))
        .map((u) => [
          u._id,
          {
            name: u.name,
            email: u.email,
            customDomainFeature: Boolean(u.features?.customDomain),
          },
        ]),
    );

    rows = cards.map((c) => {
      const status = normalizeDomainStatus(c.customDomainStatus);
      const live = isCustomDomainLive({
        customDomain: c.customDomain,
        customDomainStatus: c.customDomainStatus,
        customDomainActive: c.customDomainActive,
      });
      return {
        _id: c._id,
        username: c.username,
        companyName: c.companyName,
        customDomain: c.customDomain,
        customDomainStatus: status,
        customDomainActive: live || Boolean(c.customDomainActive),
        customDomainRequestedAt: c.customDomainRequestedAt
          ? new Date(c.customDomainRequestedAt).toISOString()
          : undefined,
        customDomainReviewedAt: c.customDomainReviewedAt
          ? new Date(c.customDomainReviewedAt).toISOString()
          : undefined,
        isLive: live,
        owner: userMap.get(c.userId) ?? null,
      };
    });
  } catch (err) {
    console.error("[admin/domains page]", err);
  }

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
        platformCnameTarget={platformCnameTarget}
      />
    </div>
  );
}
