"use client";
import { Suspense, useEffect } from "react";
import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Map, Share2, Check } from "lucide-react";
import { triggerConfetti } from "@/components/effects/Confetti";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { AchievementCard } from "@/components/ui/AchievementCard";
import { GAMES } from "@/features/games/GameGrid";
import { ToastCelebration } from "@/components/celebrations/ToastCelebration";
import { CardCelebration } from "@/components/celebrations/CardCelebration";
import { LevelUpOverlay } from "@/components/celebrations/LevelUpOverlay";
import { CenturyOverlay } from "@/components/celebrations/CenturyOverlay";
import { useCompleteCelebrations } from "./useCompleteCelebrations";
import { useAuthStore } from "@/store/authStore";

function parseTimeSecs(t: string): number {
  if (t === "—") return Infinity;
  const parts = t.split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function getMedal(xp: number) {
  if (xp > 800) return { symbol: "★", label: "GOLD",   color: "#F59E0B" };
  if (xp > 500) return { symbol: "◆", label: "SILVER", color: "#9CA3AF" };
  return             { symbol: "◉", label: "BRONZE", color: "#B45309" };
}

function StageCompleteContent() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [copied, setCopied] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const { user } = useAuthStore();

  const slug   = params.slug  as string;
  const stageN = parseInt(params.stage as string, 10);
  const xp     = parseInt(searchParams.get("xp") ?? "0", 10);
  const time   = searchParams.get("time") ?? "—";
  const hints  = parseInt(searchParams.get("hints") ?? "0", 10);

  const gameName = GAMES.find(g => g.slug === slug)?.name ?? slug;
  const medal = getMedal(xp);
  const { state: cel, dismiss } = useCompleteCelebrations(xp, stageN);

  useEffect(() => {
    const t = setTimeout(triggerConfetti, 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (parseTimeSecs(time) < 30 && hints === 0 && xp > 900 && user) {
      const key = `mindstate_achievements_${user.id}`;
      const earned: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (!earned.includes("speed_demon")) {
        localStorage.setItem(key, JSON.stringify([...earned, "speed_demon"]));
        const timer = setTimeout(() => setShowAchievement(true), 1800);
        return () => clearTimeout(timer);
      }
    }
  }, [time, hints, xp, user]);

  function handleShare() {
    navigator.clipboard
      .writeText(`${window.location.origin}/games/${slug}?seed=${stageN}`)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch(() => {});
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "16px 18px 22px" }}>

      {/* Game · Stage label */}
      <motion.p
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 28 }}
      >
        {gameName} · Stage {stageN}
      </motion.p>

      {/* Medal ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 20 }}
        style={{
          width: 84, height: 84, borderRadius: "50%",
          border: `2px solid ${medal.color}`,
          background: `${medal.color}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, color: medal.color, marginBottom: 28,
          boxShadow: `0 0 28px ${medal.color}30, 0 0 56px ${medal.color}10`,
        }}
      >
        {medal.symbol}
      </motion.div>

      {/* Sparky mood */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 22 }}
        style={{ marginBottom: 12 }}
      >
        <SparkyImg
          mood={xp > 800 ? "celebrate" : xp > 500 ? "happy" : "idle"}
          size={80}
        />
      </motion.div>

      {/* XP number with ambient glow */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 18 }}
        style={{ position: "relative", textAlign: "center", marginBottom: 6 }}
      >
        <div style={{ position: "absolute", inset: -40,
          background: "radial-gradient(circle, rgba(0,255,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none" }} />
        <p style={{ fontSize: 96, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--color-accent-primary)", lineHeight: 1, position: "relative" }}>
          {xp}
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}
        style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 36 }}
      >
        XP EARNED
      </motion.p>

      {/* Stats — individual cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
        style={{ display: "flex", gap: 8, marginBottom: 36, width: "100%", maxWidth: 320 }}
      >
        {[
          { label: "TIME",  value: time },
          { label: "HINTS", value: String(hints) },
          { label: "MEDAL", value: medal.label, color: medal.color },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1, padding: "14px 0", textAlign: "center",
            background: "var(--color-surface)", border: "1px solid var(--color-border)",
            borderRadius: 13,
          }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>
              {s.label}
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: s.color ?? "var(--color-text-primary)", margin: 0 }}>
              {s.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
        style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 320 }}
      >
        <button onClick={() => router.push(`/games/${slug}?stage=${stageN + 1}`)}
          style={{ padding: "14px 24px", borderRadius: 13, border: "none", background: "var(--color-accent-primary)",
            color: "#000", fontWeight: 700, fontSize: 14.5, fontFamily: "var(--font-display)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Next Stage <ChevronRight size={16} />
        </button>
        <button onClick={() => router.push(`/stages/${slug}`)}
          style={{ padding: "14px 24px", borderRadius: 13, border: "1px solid var(--color-border)",
            background: "var(--color-surface)", color: "var(--color-text-primary)", fontWeight: 700,
            fontSize: 14.5, fontFamily: "var(--font-display)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Map size={16} /> Back to Map
        </button>
        <button onClick={handleShare}
          style={{ padding: "12px 24px", borderRadius: 13, border: "1px solid var(--color-border)",
            background: "transparent", color: "var(--color-text-secondary)", fontWeight: 700,
            fontSize: 14.5, fontFamily: "var(--font-display)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {copied ? <><Check size={15} /> Copied!</> : <><Share2 size={15} /> Share Challenge</>}
        </button>
      </motion.div>

      <AnimatePresence>
        {cel.showToast && <ToastCelebration key="toast" xpEarned={xp} onDismiss={() => dismiss("showToast")} />}
        {cel.showCard && (
          <CardCelebration key="card"
            title={stageN % 10 === 0 ? `Stage ${stageN} Milestone!` : "Achievement!"}
            description={stageN % 10 === 0 ? `You've cleared ${stageN} stages in ${gameName}. Keep pushing!` : "A new achievement unlocked."}
            onDismiss={() => dismiss("showCard")} />
        )}
        {cel.levelUp && <LevelUpOverlay key="levelup" levelName={cel.levelUp.name} levelColor={cel.levelUp.color} onDismiss={() => dismiss("levelUp")} />}
        {cel.showCentury && <CenturyOverlay key="century" gameName={gameName} onDismiss={() => dismiss("showCentury")} />}
        {showAchievement && (
          <AchievementCard key="speed-demon"
            title="Speed Demon"
            description="Under 30 seconds, no hints, over 900 XP. Lightning fast."
            imageSrc="/badges/speed.png"
            sparkyMood="celebrate"
            onDismiss={() => setShowAchievement(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StageCompletePage() {
  return (
    <Suspense>
      <StageCompleteContent />
    </Suspense>
  );
}
