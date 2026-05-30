"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Map, Share2, Check } from "lucide-react";
import { triggerConfetti } from "@/components/effects/Confetti";
import { GAMES } from "@/features/games/GameGrid";

function getMedal(xp: number) {
  if (xp > 800) return { emoji: "🥇", label: "Gold",   color: "#F59E0B" };
  if (xp > 500) return { emoji: "🥈", label: "Silver", color: "#9CA3AF" };
  return             { emoji: "🥉", label: "Bronze", color: "#B45309" };
}

function StageCompleteContent() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [copied, setCopied] = useState(false);

  const slug    = params.slug  as string;
  const stageN  = parseInt(params.stage as string, 10);
  const xp      = parseInt(searchParams.get("xp")    ?? "0", 10);
  const time    = searchParams.get("time")   ?? "—";
  const hints   = parseInt(searchParams.get("hints") ?? "0", 10);

  const gameName = GAMES.find(g => g.slug === slug)?.name ?? slug;
  const medal    = getMedal(xp);

  useEffect(() => {
    const t = setTimeout(triggerConfetti, 120);
    return () => clearTimeout(t);
  }, []);

  function handleShare() {
    const url = `${window.location.origin}/games/${slug}?seed=${stageN}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}
    >
      {/* Medal */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 18 }}
        style={{ fontSize: 72, marginBottom: 20 }}
      >
        {medal.emoji}
      </motion.div>

      {/* Game + stage label */}
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>
        {gameName} · Stage {stageN}
      </p>

      {/* XP */}
      <motion.p
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 220 }}
        style={{ fontSize: 96, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-accent-primary)", lineHeight: 1, margin: "0 0 6px" }}
      >
        {xp}
      </motion.p>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 32 }}>
        XP Earned
      </p>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 32, marginBottom: 40 }}>
        {[
          { label: "Time",  value: time },
          { label: "Hints", value: String(hints) },
          { label: "Medal", value: medal.label, color: medal.color },
        ].map(s => (
          <div key={s.label}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: s.color ?? "var(--color-text-primary)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 320 }}>
        <button
          onClick={() => router.push(`/games/${slug}?stage=${stageN + 1}`)}
          style={{ padding: "14px 24px", borderRadius: 14, border: "none", background: "var(--color-accent-primary)", color: "var(--color-on-accent)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-sans)" }}
        >
          Next Stage <ChevronRight size={16} />
        </button>

        <button
          onClick={() => router.push(`/stages/${slug}`)}
          style={{ padding: "14px 24px", borderRadius: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-sans)" }}
        >
          <Map size={16} /> Back to Map
        </button>

        <button
          onClick={handleShare}
          style={{ padding: "14px 24px", borderRadius: 14, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-sans)" }}
        >
          {copied ? <><Check size={16} /> Copied!</> : <><Share2 size={16} /> Share Challenge</>}
        </button>
      </div>
    </motion.div>
  );
}

export default function StageCompletePage() {
  return (
    <Suspense>
      <StageCompleteContent />
    </Suspense>
  );
}
