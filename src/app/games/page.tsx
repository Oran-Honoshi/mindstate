"use client";
import Link from "next/link";
import { Flame, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { GamesNav } from "@/features/games/GamesNav";
import { GamesHubCatalog } from "@/features/games/GamesHubCatalog";
import { HeroMemory } from "@/features/games/HeroMemory";
import { GAMES } from "@/features/games/GameGrid";
import { useAuthStore } from "@/store/authStore";
import { getTodaysFeaturedGame } from "@/lib/games/dailyChallenge";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function GamesHubPage() {
  const { user, profile, loading } = useAuthStore();
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;
  const streak = profile?.current_streak ?? 0;
  const dailyGame = getTodaysFeaturedGame();
  const dailyName = GAMES.find(g => g.slug === dailyGame)?.name ?? dailyGame;
  const dailyDesc = GAMES.find(g => g.slug === dailyGame)?.desc ?? "";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: 56 }}>
      <GamesNav />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)", paddingTop: 56 }}>
      <GamesNav />

      {user ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {/* Greeting */}
          <section style={{ padding: "28px 24px 0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 6, textTransform: "uppercase" }}>
              {todayLabel()}
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 14, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              {greetingWord()}, {profile?.username ?? "there"}.
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {streak > 0 && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 6, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }}>
                  <Flame size={12} color="#F59E0B" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
                    {streak} DAY STREAK
                  </span>
                </div>
              )}
              {!isPro && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 6, background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.18)" }}>
                  <Zap size={12} color="var(--color-accent-primary)" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)" }}>FREE PLAN</span>
                </div>
              )}
            </div>
          </section>

          {/* Daily challenge banner */}
          <section style={{ padding: "20px 24px 0" }}>
            <Link href={`/games/${dailyGame}?daily=1`} style={{ display: "block", textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 20px", borderRadius: 12,
                background: "var(--color-accent-primary)",
                border: "none",
              }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(0,0,0,0.55)", fontFamily: "var(--font-mono)", marginBottom: 5, textTransform: "uppercase" }}>
                    Today&apos;s Challenge
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#000", letterSpacing: "-0.01em", marginBottom: 2 }}>
                    {dailyName}
                  </p>
                  {dailyDesc && (
                    <p style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", fontWeight: 500 }}>{dailyDesc}</p>
                  )}
                </div>
                <ChevronRight size={22} color="rgba(0,0,0,0.6)" strokeWidth={2.5} />
              </div>
            </Link>
          </section>

          <GamesHubCatalog isPro={isPro} />
        </motion.div>
      ) : (
        <>
          <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "72px 24px 64px", textAlign: "center" }}>
            <h1 style={{ fontWeight: 800, fontSize: 42, color: "var(--color-text-primary)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: 0 }}>
              SHARPER EVERY DAY.
            </h1>
            <p style={{ fontSize: 17, color: "var(--color-text-secondary)", margin: 0, maxWidth: 440, lineHeight: 1.6 }}>
              24 precision logic games. 100 algorithmic stages each.
            </p>
            <HeroMemory />
            <Link href="/auth/signup" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "13px 28px", borderRadius: 8, background: "var(--color-accent-primary)", color: "#000", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              Start Training Free <ChevronRight size={15} />
            </Link>
          </section>
          <GamesHubCatalog isPro={false} />
          <section style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px 56px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
              Individual $2/mo · Family 3 at $5/mo · Family 7 at $10/mo
            </p>
            <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 8, border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
              See Plans <ChevronRight size={13} />
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
