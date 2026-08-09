import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getPlatformSettings } from "@/lib/platform-settings";
import { DEFAULT_PLATFORM_SETTINGS } from "@/types/platform.types";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error("[dashboard/layout] getServerSession failed:", err);
    redirect("/login");
  }
  if (!session?.user?.id) redirect("/login");

  let ambientMode = DEFAULT_PLATFORM_SETTINGS.ambientMode || "gradient";
  let ambientVideo = DEFAULT_PLATFORM_SETTINGS.ambientVideo || "";
  let ambientImages = DEFAULT_PLATFORM_SETTINGS.ambientImages || [];

  try {
    const settings = await getPlatformSettings();
    ambientMode = settings.ambientMode || "gradient";
    ambientVideo = settings.ambientVideo || "";
    ambientImages = Array.isArray(settings.ambientImages)
      ? settings.ambientImages
      : [];
  } catch (err) {
    console.error("[dashboard/layout] ambient settings failed:", err);
  }

  return (
    <DashboardShell
      isAdmin={session.user.role === "admin"}
      ambientMode={ambientMode}
      ambientVideo={ambientVideo}
      ambientImages={ambientImages}
    >
      {children}
    </DashboardShell>
  );
}
