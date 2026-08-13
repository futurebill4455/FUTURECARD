import { PageHeader } from "@/components/shared/Navbar";
import { LandingCmsForm } from "@/components/admin/LandingCmsForm";
import { getPlatformSettings } from "@/lib/platform-settings";
import { resolveLandingCms } from "@/types/landing-cms.types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminLandingCmsPage() {
  const settings = await getPlatformSettings();
  const cms = resolveLandingCms(settings.landingCms);

  return (
    <div>
      <PageHeader
        title="Landing page CMS"
        description="Edit hero, features, pricing, testimonials, CTA, and footer without shipping code."
      />
      <LandingCmsForm initial={cms} />
    </div>
  );
}
