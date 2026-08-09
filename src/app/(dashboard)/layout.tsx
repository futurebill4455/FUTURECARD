import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const settings = await getPlatformSettings().catch(() => null);

  return (
    <DashboardShell
      isAdmin={session.user.role === "admin"}
      ambientMode={settings?.ambientMode || "gradient"}
      ambientVideo={settings?.ambientVideo}
      ambientImages={settings?.ambientImages}
    >
      {children}
    </DashboardShell>
  );
}
