"use client";
import Link from "next/link";
import { Flame, ChevronRight, Crown, X, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/nav/AppHeader";
import { GamesHubCatalog } from "@/features/games/GamesHubCatalog";
import { GAMES } from "@/features/games/GameGrid";
import { useAuthStore } from "@/store/authStore";
import { getTodaysFeaturedGame, getDailyStageInfo } from "@/lib/games/dailyChallenge";
import { getTotalXP, getLevelInfo } from "@/lib/xpLevels";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function VerifyBanner() {
  const [visible, setVisible] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verify") === "1" && !sessionStorage.getItem("verify-dismissed")) {
      setVisible(true);
    }
  }, [searchParams]);

  function dismiss() {
    sessionStorage.setItem("verify-dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 20px", background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)" }}>
      <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
        Check your email to verify your account.
      </span>
      <button onClick={dismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", padding: 4 }}>
        <X size={15} />
      </button>
    </div>
  );
}

function GuestProgressModal() {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user
      && localStorage.getItem("guest_played_once") === "1"
      && localStorage.getItem("guest_modal_dismissed") !== "1") {
      setOpen(true);
    }
  }, [user]);

  function dismiss() {
    localStorage.setItem("guest_modal_dismissed", "1");
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 9000 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: "32px 28px", maxWidth: 360, width: "100%", textAlign: "center" }}>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 10, lineHeight: 1.2 }}>
          Want to keep your progress?
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
          Sign up free to save your scores, appear on leaderboards, and never lose your streak.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => router.push("/auth/signup")}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "var(--color-accent-primary)", color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Sign Up Free
          </button>
          <button onClick={dismiss}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Keep Playing as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function GamesHubPage() {
  const { user, profile, loading } = useAuthStore();
  const router = useRouter();
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;
  const streak = profile?.current_streak ?? 0;
  const dailyGame = getTodaysFeaturedGame();
  const dailyName = GAMES.find(g => g.slug === dailyGame)?.name ?? dailyGame;
  const dailyStage = getDailyStageInfo(dailyGame).stage;
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => { setTotalXP(getTotalXP()); }, []);

  const levelInfo = getLevelInfo(totalXP);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: 56 }}>
      <AppHeader />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)", paddingTop: 56 }}>
      <AppHeader />
      <Suspense><VerifyBanner /></Suspense>
      <GuestProgressModal />

      {user ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {/* Dashboard header */}
          <section style={{ padding: "28px 24px 0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 6, textTransform: "uppercase" }}>
              {todayLabel()}
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              {greetingWord()}, {profile?.username ?? "there"}.
            </h1>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 6, textTransform: "uppercase" }}>Streak</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Flame size={14} color={streak > 0 ? "#F59E0B" : "var(--color-text-secondary)"} />
                  <span style={{ fontSize: 22, fontWeight: 800, color: streak > 0 ? "#F59E0B" : "var(--color-text-secondary)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                    {streak}
                  </span>
                  <span style={{ fontSize: 9, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>DAYS</span>
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 16, background: "var(--color-surface)", border: "1px solid var(--color-border)", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Crown size={16} color="var(--color-gold)" />
                  <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", textTransform: "uppercase", margin: 0 }}>LEVEL</p>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)", marginTop: 8 }}>
                  {levelInfo.name}
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "var(--color-surface-2)", overflow: "hidden", marginTop: 7 }}>
                  <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, var(--color-accent-primary), var(--color-gold))", width: `${levelInfo.progress * 100}%` }} />
                </div>
              </div>
            </div>
          </section>

          {/* Daily challenge */}
          <section style={{ padding: "16px 24px 0" }}>
            <div
              onClick={() => router.push(`/games/${dailyGame}?daily=1&from=daily`)}
              style={{
                borderRadius: 16, padding: 16, cursor: "pointer",
                background: "linear-gradient(120deg, var(--color-accent-primary), color-mix(in srgb, var(--color-accent-primary) 80%, transparent))",
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.15em",
                  color: "var(--color-on-accent)", opacity: 0.8, textTransform: "uppercase",
                }}>
                  TODAY&apos;S CHALLENGE · STAGE {dailyStage}
                </div>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
                  color: "var(--color-on-accent)", marginTop: 4,
                }}>
                  {dailyName}
                </div>
              </div>
              <div style={{
                background: "var(--color-on-accent)", color: "var(--color-accent-primary)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                padding: "9px 14px", borderRadius: 10,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <Play size={13} fill="var(--color-accent-primary)" color="var(--color-accent-primary)" />
                Play
              </div>
            </div>
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
