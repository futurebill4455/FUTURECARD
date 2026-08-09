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

export function LandingPage({
  ambientMode = "gradient",
  ambientVideo,
  ambientImages,
}: {
  ambientMode?: AmbientMode;
  ambientVideo?: string;
  ambientImages?: string[];
}) {
  return (
    <div className="landing-page relative min-h-screen overflow-x-hidden text-teal-50">
      <ImmersiveBackground
        mode={ambientMode}
        video={ambientVideo}
        images={ambientImages}
        intensity={0.55}
      />
      <div className="relative z-[1]">
        <LandingNav />
        <main>
          <LandingHero />
          <LandingFeatures />
          <LandingPricing />
          <LandingTestimonials />
          <LandingCtaBand />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
