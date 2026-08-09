import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getPlatformSettings } from "@/lib/platform-settings";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const settings = await getPlatformSettings().catch(() => null);

  return (
    <AdminSidebar
      ambientMode={settings?.ambientMode || "gradient"}
      ambientVideo={settings?.ambientVideo}
      ambientImages={settings?.ambientImages}
    >
      {children}
    </AdminSidebar>
  );
}
