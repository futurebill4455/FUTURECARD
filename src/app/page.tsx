import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { LandingPage } from "@/components/landing/LandingPage";
import { authOptions } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/platform-settings";
import { resolveLandingCms } from "@/types/landing-cms.types";

export const dynamic = "force-dynamic";

/**
 * Platform root (`/`) — always renders a landing page or redirects.
 * Guarantees the home route exists on Vercel (no 404).
 */
export default async function HomePage() {
  const session = await getServerSession(authOptions).catch(() => null);

  if (session?.user?.id) {
    if (session.user.role === "admin") {
      redirect("/admin/dashboard");
    }
    if (session.user.isApproved === false) {
      redirect("/pending-approval");
    }
    redirect("/dashboard");
  }

  const settings = await getPlatformSettings().catch(() => null);

  return (
    <LandingPage
      ambientMode={settings?.ambientMode || "gradient"}
      ambientVideo={settings?.ambientVideo}
      ambientImages={settings?.ambientImages}
      cms={resolveLandingCms(settings?.landingCms)}
      adminWhatsapp={settings?.adminWhatsappNumber}
      companyName={settings?.companyName}
    />
  );
}
