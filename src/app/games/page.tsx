"use client";
import Link from "next/link";
import { Flame, ChevronRight } from "lucide-react";
import { GamesNav } from "@/features/games/GamesNav";
import { GamesHubCatalog } from "@/features/games/GamesHubCatalog";
import { HeroMemory } from "@/features/games/HeroMemory";
import { GAMES } from "@/features/games/GameGrid";
import { useAuthStore } from "@/store/authStore";
import { getTodaysFeaturedGame } from "@/lib/games/dailyChallenge";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function GamesHubPage() {
  const { user, profile } = useAuthStore();
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;
  const streak = profile?.current_streak ?? 0;
  const dailyGame = getTodaysFeaturedGame();
  const dailyName = GAMES.find(g => g.slug === dailyGame)?.name ?? dailyGame;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)", paddingTop: 56 }}>
      <GamesNav />

      {user ? (
        <>
          {/* Greeting */}
          <section style={{ padding: "32px 24px 0" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
              Welcome back, {profile?.username ?? "there"}.
            </p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 14 }}>
              {todayLabel()}
            </p>
            {streak > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <Flame size={13} color="#F59E0B" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>Streak {streak} days</span>
              </div>
            )}
          </section>

          {/* Daily challenge banner */}
          <section style={{ padding: "20px 24px 0" }}>
            <Link
              href={`/games/${dailyGame}?daily=1`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px", borderRadius: 16, textDecoration: "none",
                background: "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
              }}
            >
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Today&apos;s Challenge
                </p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#000", fontFamily: "var(--font-sans)" }}>
                  {dailyName}
                </p>
              </div>
              <ChevronRight size={22} color="rgba(0,0,0,0.7)" />
            </Link>
          </section>

          <GamesHubCatalog isPro={isPro} />
        </>
      ) : (
        <>
          {/* Marketing hero */}
          <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "96px 24px 80px", textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 48, color: "var(--color-text-primary)", lineHeight: 1.1, margin: 0 }}>
              Sharper Every Day
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 18, color: "var(--color-text-secondary)", margin: 0, maxWidth: 520 }}>
              Six precision games. One daily practice.
            </p>
            <HeroMemory />
            <Link href="/auth/signup" style={{ padding: "14px 32px", borderRadius: "var(--radius)", background: "var(--color-accent-primary)", color: "var(--color-on-accent)", fontWeight: 700, fontSize: 16, textDecoration: "none", fontFamily: "var(--font-sans)" }}>
              Start Training
            </Link>
          </section>

          <GamesHubCatalog isPro={false} />

          {/* Pricing CTA */}
          <section style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 28, color: "var(--color-text-primary)", marginBottom: 12 }}>
              Simple Pricing
            </h2>
            <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginBottom: 24 }}>
              Individual $2/mo · Family 3 at $5/mo · Family 7 at $10/mo
            </p>
            <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px", borderRadius: "var(--radius)", background: "var(--color-accent-primary)", color: "var(--color-on-accent)", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "var(--font-sans)" }}>
              See Plans <ChevronRight size={14} />
            </Link>
          </section>

          <footer style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)", borderTop: "1px solid var(--color-border)", fontFamily: "var(--font-sans)", fontSize: 14 }}>
            Mind Element · Professional Brain Training
          </footer>
        </>
      )}
    </div>
  );
}
