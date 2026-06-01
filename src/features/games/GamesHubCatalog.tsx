"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GAMES } from "@/features/games/GameGrid";
import { BoardPreview } from "@/components/ui/BoardPreview";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import { getCompletedStages } from "@/lib/games/stageProgress";

const DIFF_STYLE = {
  easy:   { color: "var(--color-accent-secondary)", bg: "rgba(57,255,20,0.08)",   border: "rgba(57,255,20,0.25)"  },
  medium: { color: "var(--color-accent-primary)",   bg: "rgba(0,255,255,0.08)",   border: "rgba(0,255,255,0.25)"  },
  hard:   { color: "#F59E0B",                        bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
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
        border: isDone
          ? "1px solid rgba(0,255,255,0.3)"
          : hovered && !isLocked
          ? "1px solid rgba(255,255,255,0.22)"
          : "1px solid var(--color-border)",
        opacity: isLocked ? 0.65 : 1,
        transition: "border-color 0.15s, background 0.15s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Snapshot as faint background preview */}
      <div style={{
        position: "absolute", top: 0, right: -4, bottom: 0,
        width: "52%", display: "flex", alignItems: "center", justifyContent: "center",
        opacity: hovered && !isLocked ? 0.45 : 0.28,
        pointerEvents: "none",
        transition: "opacity 0.2s",
        transform: "scale(1.15)",
        transformOrigin: "center right",
      }}>
        <BoardPreview game={game.slug} size={13} gap={2} />
      </div>

      {isLocked && (
        <span style={{
          position: "absolute", top: 9, right: 9,
          fontSize: 8, fontWeight: 800, letterSpacing: "0.1em",
          color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)",
          background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.25)",
          padding: "2px 6px", borderRadius: 3,
        }}>PRO</span>
      )}
      {!isLocked && (
        <div style={{ position: "absolute", top: 7, right: 7 }}>
          <MasteryBadge slug={game.slug} size={28} />
        </div>
      )}

      {/* Name + difficulty */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 6, flex: 1, paddingRight: isLocked || isDone ? 28 : 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {game.name}
        </span>
        <DiffPill d={game.difficulty} />
      </div>

      {/* Progress bar */}
      {pct > 0 && (
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 3, marginTop: 10 }}>
          <div style={{ width: "60%", height: 3, background: "var(--color-surface-2)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2, width: `${pct}%`,
              background: isDone ? "var(--color-accent-primary)" : "rgba(0,255,255,0.55)",
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <span style={{ fontSize: 9, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
            {isDone ? "COMPLETE" : `${completed} / 100`}
          </span>
        </div>
      )}
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
