"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { AppHeader } from "@/components/nav/AppHeader";
import { useAuthStore } from "@/store/authStore";
import {
  DAILY_GAMES, getTodaysFeaturedGame,
  isDailyCompleted, formatTimeUntilReset,
} from "@/lib/games/dailyChallenge";
import { getStreak } from "@/lib/supabase/streaks";
import { DailyFeatured } from "@/features/daily/DailyFeatured";
import { DailyGameGrid } from "@/features/daily/DailyGameGrid";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function DailyPage() {
  const { user } = useAuthStore();
  const [countdown, setCountdown]       = useState("00:00:00");
  const [completedToday, setCompleted]  = useState<Set<string>>(new Set());
  const [streak, setStreak]             = useState(0);
  const todayFeatured = getTodaysFeaturedGame();

  useEffect(() => {
    const iv = setInterval(() => setCountdown(formatTimeUntilReset()), 1000);
    setCountdown(formatTimeUntilReset());
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!user) return;
    const done = new Set<string>();
    DAILY_GAMES.forEach(game => { if (isDailyCompleted(game, user.id)) done.add(game); });
    setCompleted(done);
    getStreak(user.id).then(d => { if (d) setStreak(d.current_streak ?? 0); });
  }, [user]);

  const completedCount = completedToday.size;
  const pct = Math.round((completedCount / DAILY_GAMES.length) * 100);

  // streak is kept for internal use (fetchStreak above)
  void streak;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <AppHeader />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "76px 20px 60px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
            {todayLabel()}
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--color-text-primary)",
            letterSpacing: "-0.01em", marginBottom: 0, lineHeight: 1.1 }}>
            Daily Challenges
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <Clock size={13} color="var(--color-text-secondary)" strokeWidth={2} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-secondary)" }}>
              {countdown} left
            </span>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
            <span style={{ fontSize: 8.5, fontWeight: 400, letterSpacing: "0.1em",
              color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
              {completedCount} / {DAILY_GAMES.length} TODAY
            </span>
            <span style={{ fontSize: 8.5, fontWeight: 400, fontFamily: "var(--font-mono)",
              color: pct === 100 ? "var(--color-accent-primary)" : "var(--color-text-secondary)" }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 8, background: "var(--color-surface-2)", borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, var(--color-accent-primary), var(--color-gold))" }}
            />
          </div>
        </motion.div>

        <DailyFeatured slug={todayFeatured} isCompleted={completedToday.has(todayFeatured)} />
        <DailyGameGrid games={DAILY_GAMES} completedToday={completedToday} featuredSlug={todayFeatured} />

      </main>
    </div>
  );
}
