import { LandingPage } from "@/components/landing/LandingPage";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function HomePage() {
  const settings = await getPlatformSettings().catch(() => null);
  return (
    <LandingPage
      ambientMode={settings?.ambientMode || "gradient"}
      ambientVideo={settings?.ambientVideo}
      ambientImages={settings?.ambientImages}
    />
  );
}
