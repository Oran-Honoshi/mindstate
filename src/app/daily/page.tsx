"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Clock } from "lucide-react";
import { Navbar } from "@/components/nav/Navbar";
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <Navbar />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "76px 20px 60px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
            {todayLabel()}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text-primary)",
            letterSpacing: "-0.01em", marginBottom: 12, lineHeight: 1.1 }}>
            Daily Challenges
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {streak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                borderRadius: 6, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <Flame size={12} color="#F59E0B" fill="#F59E0B" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
                  {streak} DAY STREAK
                </span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={11} color="var(--color-text-secondary)" />
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                {countdown}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
              {completedCount} / {DAILY_GAMES.length} TODAY
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)",
              color: pct === 100 ? "var(--color-accent-primary)" : "var(--color-text-secondary)" }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 3, background: "var(--color-surface-2)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 2, background: "var(--color-accent-primary)", opacity: 0.7 }}
            />
          </div>
        </motion.div>

        <DailyFeatured slug={todayFeatured} isCompleted={completedToday.has(todayFeatured)} />
        <DailyGameGrid games={DAILY_GAMES} completedToday={completedToday} featuredSlug={todayFeatured} />

        {/* Streak tracker */}
        {user && streak > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ padding: "18px 20px", borderRadius: 10, border: "1px solid var(--color-border)",
              background: "var(--color-surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>7-DAY PROGRESS</span>
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                {streak % 7 === 0 && streak > 0 ? "+10 PLAYS EARNED" : `${7 - (streak % 7)} MORE`}
              </span>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 3,
                  background: i < (streak % 7 || (streak > 0 && streak % 7 === 0 ? 7 : 0))
                    ? "var(--color-accent-secondary)" : "var(--color-surface-2)" }} />
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
