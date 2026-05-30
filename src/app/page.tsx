"use client";
import React, { useEffect } from "react";
import { FAQSchema, OrganizationSchema, WebAppSchema, HowToSchema } from "@/app/seo-schema";
import { createClient } from "@/lib/supabase/client";
import { GamesNav } from "@/features/games/GamesNav";
import { GameHero } from "@/features/games/GameHero";
import { GameGrid } from "@/features/games/GameGrid";
import { PricingSection } from "@/features/games/PricingSection";

export default function LandingPage() {
  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) localStorage.setItem("onboarded", "1");
    }
    check();
  }, []);

  // Paddle script loader
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).Paddle) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Paddle.Setup({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <div className="home-page" style={{ minHeight: "100vh", color: "var(--color-text-primary)" }}>
      <GamesNav/>
      <FAQSchema/>
      <OrganizationSchema/>
      <WebAppSchema/>
      <HowToSchema/>
      <GameHero/>
      <GameGrid/>
      <PricingSection/>
    </div>
  );
}
