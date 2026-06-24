import { Suspense } from "react";
import type { Metadata } from "next";
import { LandingNav } from "@/features/landing/LandingNav";
import { HeroSection } from "@/features/landing/HeroSection";
import { StatsStrip } from "@/features/landing/StatsStrip";
import { FeaturesSection } from "@/features/landing/FeaturesSection";
import { GamesSection } from "@/features/landing/GamesSection";
import { TestimonialsSection } from "@/features/landing/TestimonialsSection";
import { LandingPricingSection } from "@/features/landing/LandingPricingSection";
import { LandingFAQ } from "@/features/landing/LandingFAQ";
import { LandingFooter } from "@/features/landing/LandingFooter";
import { AuthGuard } from "@/features/landing/AuthGuard";

export const metadata: Metadata = {
  title: "Mind Element — Train Your Mind Every Day",
  description: "24 logic and memory games with daily challenges, family leaderboards, and XP progression. Start free.",
  openGraph: {
    title: "Mind Element",
    description: "Sharper every day.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Suspense>
        <AuthGuard />
      </Suspense>
      <LandingNav />
      <main style={{ paddingTop: 56 }}>
        <HeroSection />
        <StatsStrip />
        <FeaturesSection />
        <GamesSection />
        <TestimonialsSection />
        <LandingPricingSection />
        <LandingFAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
