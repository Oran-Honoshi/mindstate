"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GameIcon } from "@/components/icons/GameIcons";
import type { Score } from "@/lib/supabase/types";

const GAME_NAMES: Record<string, string> = {
  tango:"Tango", memory:"Memory", queens:"Queens", sudoku:"Mini Sudoku",
  zip:"Zip", minesweeper:"Minesweeper", flow:"Flow", nonogram:"Nonogram",
  bridges:"Bridges", "pattern-match":"Pattern Match", "2048-pro":"2048 Pro",
  kakuro:"Kakuro", "gravity-sort":"Gravity Sort", "hex-merge":"Hex Merge",
  "logic-path":"Logic Path", lightup:"Light Up", patches:"Patches",
  "word-sling":"Word Sling", hearts:"Hearts", solitaire:"Solitaire",
};

interface Props {
  scores: Score[];
  totalXP: number;
  loading: boolean;
}

export function ProfileActivity({ scores, totalXP, loading }: Props) {
  const byGame = Object.entries(
    scores.reduce((acc, s) => {
      if (!acc[s.game_slug]) acc[s.game_slug] = { count: 0, totalXP: 0, best: 0 };
      acc[s.game_slug].count++;
      acc[s.game_slug].totalXP += s.xp_earned;
      acc[s.game_slug].best = Math.max(acc[s.game_slug].best, s.xp_earned);
      return acc;
    }, {} as Record<string, { count: number; totalXP: number; best: number }>)
  ).sort((a, b) => b[1].totalXP - a[1].totalXP).slice(0, 8);

  const recentScores = scores.slice(0, 8);

  return (
    <>
      {/* By game */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="ms-card" style={{ padding: "18px 20px", marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 14 }}>BY GAME</p>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: 40, borderRadius: 6, background: "var(--color-surface-2)" }} />)}
          </div>
        ) : byGame.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 10 }}>No games played yet.</p>
            <Link href="/games" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-accent-primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Start playing <ArrowRight size={13} />
            </Link>
          </div>
        ) : byGame.map(([slug, data]) => (
          <Link key={slug} href={`/games/${slug}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "0.5px solid var(--color-border)", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <GameIcon slug={slug} size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{GAME_NAMES[slug] ?? slug}</p>
                <p style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-accent-primary)" }}>{data.totalXP.toLocaleString()}</p>
              </div>
              <div style={{ height: 2, background: "var(--color-surface-2)", borderRadius: 1 }}>
                <div style={{ height: 2, borderRadius: 1, background: "rgba(0,255,255,0.5)", width: `${Math.min((data.totalXP / Math.max(totalXP, 1)) * 100, 100)}%` }} />
              </div>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent activity */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="ms-card" style={{ padding: "18px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 14 }}>RECENT</p>
        {recentScores.length === 0
          ? <p style={{ color: "var(--color-text-secondary)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>No activity yet.</p>
          : recentScores.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "0.5px solid var(--color-border)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <GameIcon slug={s.game_slug} size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {GAME_NAMES[s.game_slug] ?? s.game_slug} · Stage {s.stage_number}
                </p>
                <p style={{ fontSize: 10, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {s.difficulty} · {new Date(s.completed_at).toLocaleDateString()}
                </p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-accent-primary)", flexShrink: 0 }}>{s.xp_earned}</p>
            </div>
          ))
        }
      </motion.div>
    </>
  );
}
