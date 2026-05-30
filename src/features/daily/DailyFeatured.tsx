"use client";
import Link from "next/link";
import { ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { GAME_NAMES } from "@/features/daily/constants";
import { getDailyStageInfo } from "@/lib/games/dailyChallenge";

const DIFF_STYLES = {
  easy:   { color: "#15803D", bg: "rgba(34,197,94,0.1)"  },
  medium: { color: "#B45309", bg: "rgba(245,158,11,0.1)" },
  hard:   { color: "#DC2626", bg: "rgba(239,68,68,0.1)"  },
};

interface Props {
  slug: string;
  isCompleted: boolean;
}

export function DailyFeatured({ slug, isCompleted }: Props) {
  const gameName = GAME_NAMES[slug] ?? slug;
  const { stage, difficulty } = getDailyStageInfo(slug);
  const diff = DIFF_STYLES[difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
      style={{ marginBottom: 24 }}
    >
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>
        FEATURED TODAY
      </p>
      <Link href={`/games/${slug}?daily=1`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{
          padding: "24px", borderRadius: 12,
          background: "var(--color-surface)",
          border: "1px solid var(--color-accent-primary)",
          boxShadow: "0 0 28px rgba(0,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                color: diff.color, background: diff.bg,
                padding: "2px 7px", borderRadius: 3, fontFamily: "var(--font-mono)" }}>
                {difficulty.toUpperCase()}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-secondary)",
                fontFamily: "var(--font-mono)" }}>STAGE {stage}</span>
              {isCompleted && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9,
                  fontWeight: 700, color: "#22C55E", fontFamily: "var(--font-mono)" }}>
                  <Check size={9} /> DONE
                </span>
              )}
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text-primary)",
              letterSpacing: "-0.01em", marginBottom: 16, lineHeight: 1.1 }}>
              {gameName}
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: 8, background: "var(--color-accent-primary)",
              color: "#000", fontSize: 13, fontWeight: 700 }}>
              {isCompleted ? "Play Again" : "Play Now"} <ChevronRight size={13} />
            </div>
          </div>
          <ChevronRight size={20} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
        </div>
      </Link>
    </motion.div>
  );
}
