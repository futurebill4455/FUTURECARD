import { PageHeader } from "@/components/shared/Navbar";
import { PlatformSettingsForm } from "@/components/admin/PlatformSettingsForm";
import { getPlatformSettings } from "@/lib/platform-settings";
import { ExpireSweepButton } from "@/components/admin/UserActions";

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <div>
      <PageHeader
        title="Platform settings"
        description="Global branding, Super Admin WhatsApp, and expiry tools."
        actions={<ExpireSweepButton />}
      />
      <PlatformSettingsForm initial={settings} />
    </div>
  );
}
