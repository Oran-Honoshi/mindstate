"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GAMES } from "@/features/games/GameGrid";
import { BoardPreview } from "@/components/ui/BoardPreview";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import { GameIcon } from "@/components/icons/GameIcons";
import { getCompletedStages } from "@/lib/games/stageProgress";

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

function DiffPill({ d }: { d: "easy" | "medium" | "hard" }) {
  const s = DIFF_STYLE[d];
  return (
    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      padding: "2px 5px", borderRadius: 3, fontFamily: "var(--font-mono)" }}>
      {d}
    </span>
  );
}

interface TileProps { game: typeof GAMES[0]; isPro: boolean; index: number }

function GameTile({ game, isPro, index }: TileProps) {
  const [completed, setCompleted] = useState(0);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const isLocked = !game.free && !isPro;
  const isDone = completed >= 100;
  const pct = Math.min(100, completed);

  useEffect(() => {
    setCompleted(getCompletedStages(game.slug).size);
  }, [game.slug]);

  function handleClick() {
    if (isLocked) { router.push("/pricing"); return; }
    router.push(`/games/${game.slug}`);
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.025 }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${game.name}${isLocked ? " — Pro required" : ""}, ${completed} of 100 stages complete`}
      style={{
        display: "flex", flexDirection: "column", gap: 0,
        padding: "12px 12px 11px", borderRadius: 10, textAlign: "left",
        width: "100%", cursor: "pointer", minHeight: 120,
        background: "var(--color-surface)",
        border: isDone || (hovered && !isLocked)
          ? "1px solid var(--color-accent-primary)"
          : "1px solid var(--color-border)",
        boxShadow: hovered && !isLocked ? "0 0 0 1px var(--color-accent-primary), 0 4px 20px rgba(0,255,255,0.1)" : "none",
        opacity: isLocked ? 0.65 : 1,
        transition: "border-color 0.15s, box-shadow 0.15s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* BoardPreview — right 55% texture */}
      <div style={{
        position: "absolute", top: 0, right: -4, bottom: 0,
        width: "55%", display: "flex", alignItems: "center", justifyContent: "center",
        opacity: hovered && !isLocked ? 0.7 : 0.4,
        pointerEvents: "none",
        transition: "opacity 0.2s",
        transform: "scale(1.15)",
        transformOrigin: "center right",
      }}>
        <BoardPreview game={game.slug} size={13} gap={2} />
      </div>

      {isLocked && (
        <span style={{
          position: "absolute", top: 9, right: 9, zIndex: 2,
          fontSize: 8, fontWeight: 800, letterSpacing: "0.1em",
          color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)",
          background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.25)",
          padding: "2px 6px", borderRadius: 3,
        }}>PRO</span>
      )}

      {/* Icon tile */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "12px 0 6px 12px", position: "relative", zIndex: 1 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: DIFF_ICON_BG[game.difficulty],
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <GameIcon slug={game.slug} size={32} />
        </div>
      </div>

      {/* Bottom: name + diff + mastery */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 5, padding: "0 10px 10px" }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {game.name}
        </span>
        <DiffPill d={game.difficulty} />
        {!isLocked && <MasteryBadge slug={game.slug} size={22} />}
      </div>
    </motion.button>
  );
}

interface GamesHubCatalogProps { isPro: boolean }

export function GamesHubCatalog({ isPro }: GamesHubCatalogProps) {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)", letterSpacing: "0.01em" }}>
          All Games
        </p>
        <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
          {GAMES.length} TITLES
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {GAMES.map((game, i) => (
          <GameTile key={game.slug} game={game} isPro={isPro} index={i} />
        ))}
      </div>
    </section>
  );
}
