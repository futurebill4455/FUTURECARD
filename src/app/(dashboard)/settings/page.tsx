import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { Card } from "@/models/Card";
import { User } from "@/models/User";
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
    Subscription.findOne({ userId: session!.user.id }),
    Card.find({ userId: session!.user.id })
      .select(
        "username companyName customDomain customDomainStatus customDomainActive",
      )
      .sort({ updatedAt: -1 })
      .lean(),
    getPlatformSettings(),
    User.findById(session!.user.id).select("features").lean(),
  ]);

  const features = resolveFeatures(
    userDoc && !Array.isArray(userDoc)
      ? (userDoc as { features?: Record<string, boolean> }).features
      : null,
  );
  const privilege = canRequestCustomDomain(features, sub?.plan ?? "free");

  const domainCards = cards.map((c) => ({
    _id: String(c._id),
    username: c.username as string,
    companyName: c.companyName as string,
    customDomain: (c.customDomain as string | undefined) || "",
    customDomainStatus: normalizeDomainStatus(
      c.customDomainStatus as string | undefined,
    ),
    customDomainActive: isCustomDomainLive({
      customDomain: c.customDomain as string | undefined,
      customDomainStatus: c.customDomainStatus as string | undefined,
      customDomainActive: c.customDomainActive as boolean | undefined,
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
