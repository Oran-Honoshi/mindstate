"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BoardPreview } from "@/components/ui/BoardPreview";
import { GameIcon } from "@/components/icons/GameIcons";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import type { GAMES } from "@/features/games/GameGrid";

const DIFF_STYLE = {
  easy:   { color: "var(--color-accent-secondary)", bg: "rgba(57,255,20,0.08)",   border: "rgba(57,255,20,0.25)"  },
  medium: { color: "var(--color-accent-primary)",   bg: "rgba(0,255,255,0.08)",   border: "rgba(0,255,255,0.25)"  },
  hard:   { color: "#F59E0B",                        bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
};

const DIFF_ICON_BG = {
  easy:   "rgba(84,208,106,0.15)",
  medium: "rgba(245,166,35,0.15)",
  hard:   "rgba(255,92,102,0.15)",
};

export function DiffPill({ d }: { d: "easy" | "medium" | "hard" }) {
  const s = DIFF_STYLE[d];
  return (
    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      padding: "2px 5px", borderRadius: 3, fontFamily: "var(--font-mono)", flexShrink: 0 }}>
      {d}
    </span>
  );
}

export function GameCard({ game, i }: { game: typeof GAMES[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (i % 4) * 0.05 }}
      onClick={() => router.push(`/games/${game.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer", minHeight: 140, borderRadius: 10,
        background: "var(--color-surface)", position: "relative", overflow: "hidden",
        border: hovered ? "1px solid var(--color-accent-primary)" : "1px solid var(--color-border)",
        boxShadow: hovered ? "0 0 0 1px var(--color-accent-primary), 0 4px 20px rgba(0,255,255,0.1)" : "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* BoardPreview — right 55% background texture */}
      <div style={{
        position: "absolute", top: 0, right: -8, bottom: 0, width: "55%",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: hovered ? 0.7 : 0.4,
        transition: "opacity 0.2s ease",
        pointerEvents: "none",
        transform: "scale(1.3)", transformOrigin: "center right",
      }}>
        <BoardPreview game={game.slug} size={14} gap={2} />
      </div>

      {/* Icon tile — top-left */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "14px 0 8px 14px", position: "relative", zIndex: 1 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 14,
          background: DIFF_ICON_BG[game.difficulty],
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <GameIcon slug={game.slug} size={36} />
        </div>
      </div>

      {/* Bottom: name + diff pill + mastery */}
      <div style={{ padding: "0 12px 12px", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {game.name}
        </p>
        <DiffPill d={game.difficulty} />
        <MasteryBadge slug={game.slug} size={22} />
      </div>
    </motion.div>
  );
}
