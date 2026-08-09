"use client";

import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingCtaBand } from "@/components/landing/LandingCtaBand";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function LandingPage() {
  return (
    <div className="landing-page relative min-h-screen overflow-x-hidden text-teal-50">
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-40" />
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
