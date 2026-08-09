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
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error("[admin/layout] getServerSession failed:", err);
    redirect("/login");
  }
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const settings = await getPlatformSettings();

  return (
    <AdminSidebar
      ambientMode={settings.ambientMode || "gradient"}
      ambientVideo={settings.ambientVideo}
      ambientImages={settings.ambientImages}
    >
      {children}
    </AdminSidebar>
  );
}
