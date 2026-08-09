import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { findSubscriptionByUserId } from "@/lib/db/subscriptions";
import { listCardsByUser } from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { PageHeader } from "@/components/shared/Navbar";
import {
  Card as UiCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomDomainSettings } from "@/components/dashboard/CustomDomainSettings";
import { getPlatformSettings } from "@/lib/platform-settings";
import {
  canRequestCustomDomain,
  isCustomDomainLive,
  normalizeDomainStatus,
} from "@/lib/custom-domain-access";
import { resolveFeatures } from "@/types/platform.types";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  await dbConnect();
  const [sub, cards, settings, userDoc] = await Promise.all([
    findSubscriptionByUserId(session!.user.id),
    listCardsByUser(session!.user.id),
    getPlatformSettings(),
    findUserById(session!.user.id),
  ]);

  const features = resolveFeatures(userDoc?.features ?? null);
  const privilege = canRequestCustomDomain(features, sub?.plan ?? "free");

  const domainCards = cards.map((c) => ({
    _id: c._id,
    username: c.username,
    companyName: c.companyName,
    customDomain: c.customDomain || "",
    customDomainStatus: normalizeDomainStatus(c.customDomainStatus),
    customDomainActive: isCustomDomainLive({
      customDomain: c.customDomain,
      customDomainStatus: c.customDomainStatus,
      customDomainActive: c.customDomainActive,
    }),
  }));

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Account, subscription, and custom domain requests."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <UiCard>
          <CardHeader>
            <CardTitle className="text-xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              {session!.user.name}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {session!.user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span>{" "}
              {session!.user.role}
            </p>
          </CardContent>
        </UiCard>
        <UiCard>
          <CardHeader>
            <CardTitle className="text-xl">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm capitalize">
            <p>
              <span className="text-muted-foreground">Plan:</span>{" "}
              {sub?.plan ?? "free"}
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span>{" "}
              {sub?.paymentStatus ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Valid until:</span>{" "}
              {sub?.endDate
                ? new Date(sub.endDate).toLocaleDateString()
                : "—"}
            </p>
          </CardContent>
        </UiCard>
      </div>

      <UiCard className="mt-4">
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
