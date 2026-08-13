"use client";

import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingCtaBand } from "@/components/landing/LandingCtaBand";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  ImmersiveBackground,
  type AmbientMode,
} from "@/components/shared/ImmersiveBackground";
import {
  DEFAULT_LANDING_CMS,
  resolveLandingCms,
  type ILandingCms,
} from "@/types/landing-cms.types";

export function LandingPage({
  ambientMode = "gradient",
  ambientVideo,
  ambientImages,
  cms,
  adminWhatsapp,
  companyName,
}: {
  ambientMode?: AmbientMode;
  ambientVideo?: string;
  ambientImages?: string[];
  cms?: ILandingCms | null;
  adminWhatsapp?: string;
  companyName?: string;
}) {
  const content = resolveLandingCms(cms || DEFAULT_LANDING_CMS);

  return (
    <div className="landing-page relative min-h-screen overflow-x-clip text-teal-50">
      <ImmersiveBackground
        mode={ambientMode}
        video={ambientVideo}
        images={ambientImages}
        intensity={0.55}
      />
      <div className="relative z-[1]">
        <LandingNav />
        <main>
          <LandingHero content={content.hero} />
          <LandingFeatures content={content.features} />
          <LandingPricing content={content.pricing} />
          <LandingTestimonials content={content.testimonials} />
          <LandingCtaBand content={content.cta} />
        </main>
        <LandingFooter
          content={content.footer}
          adminWhatsapp={adminWhatsapp}
          companyName={companyName}
        />
      </div>
    </div>
  );
}
