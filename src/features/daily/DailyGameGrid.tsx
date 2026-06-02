"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { GAME_NAMES } from "@/features/daily/constants";
import { getDailyStageInfo } from "@/lib/games/dailyChallenge";
import type { GameSlug } from "@/lib/games/dailyChallenge";

const DIFF_STYLES = {
  easy:   { color: "#15803D", bg: "rgba(34,197,94,0.08)"  },
  medium: { color: "#B45309", bg: "rgba(245,158,11,0.08)" },
  hard:   { color: "#DC2626", bg: "rgba(239,68,68,0.08)"  },
};

interface Props {
  games: GameSlug[];
  completedToday: Set<string>;
  featuredSlug: string;
}

export function DailyGameGrid({ games, completedToday, featuredSlug }: Props) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 12 }}>
        ALL DAILY CHALLENGES
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {games.map((game, i) => {
          const done = completedToday.has(game);
          const isFeatured = game === featuredSlug;
          const { stage, difficulty } = getDailyStageInfo(game);
          const diff = DIFF_STYLES[difficulty];
          return (
            <motion.div key={game}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.025, duration: 0.3 }}>
              <Link href={`/games/${game}?daily=1&from=daily`} style={{ display: "block", textDecoration: "none" }}>
                <div style={{
                  padding: "14px",
                  borderRadius: 10,
                  background: done ? "rgba(34,197,94,0.04)" : "var(--color-surface)",
                  border: done
                    ? "1px solid rgba(34,197,94,0.25)"
                    : isFeatured
                    ? "1px solid rgba(0,255,255,0.3)"
                    : "1px solid var(--color-border)",
                  transition: "border-color 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.25 }}>
                      {GAME_NAMES[game] ?? game}
                    </span>
                    {done && <Check size={13} color="#22C55E" style={{ flexShrink: 0 }} />}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                      color: diff.color, background: diff.bg,
                      padding: "2px 6px", borderRadius: 3, fontFamily: "var(--font-mono)" }}>
                      {difficulty.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                      S{stage}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
