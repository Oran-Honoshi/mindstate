"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GAMES } from "@/features/games/GameGrid";
import { BoardPreview } from "@/components/ui/BoardPreview";
import { GameIcon } from "@/components/icons/GameIcons";
import { getCompletedStages } from "@/lib/games/stageProgress";

const HERO_GRADIENT = {
  easy:   "radial-gradient(circle at 70% 50%, rgba(57,255,20,0.18) 0%, var(--color-surface-2) 70%)",
  medium: "radial-gradient(circle at 70% 50%, rgba(47,230,224,0.18) 0%, var(--color-surface-2) 70%)",
  hard:   "radial-gradient(circle at 70% 50%, rgba(255,92,102,0.18) 0%, var(--color-surface-2) 70%)",
};

const DIFF_COLOR = {
  easy:   "var(--color-accent-secondary)",
  medium: "var(--color-accent-primary)",
  hard:   "var(--color-error)",
};

const DIFF_LABEL = {
  easy:   "Beginner",
  medium: "Intermediate",
  hard:   "Expert",
};

interface TileProps { game: typeof GAMES[0]; isPro: boolean; index: number }

function GameTile({ game, isPro, index }: TileProps) {
  const [completed, setCompleted] = useState(0);
  const router = useRouter();
  const isLocked = !game.free && !isPro;

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
      aria-label={`${game.name}${isLocked ? " — Pro required" : ""}, ${completed} of 100 stages complete`}
      style={{
        display: "flex", flexDirection: "column",
        borderRadius: 13, padding: 0, overflow: "hidden",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        opacity: isLocked ? 0.65 : 1,
        width: "100%", cursor: "pointer", textAlign: "left",
      }}
    >
      {/* Hero area */}
      <div style={{
        height: 84, overflow: "hidden", position: "relative",
        background: HERO_GRADIENT[game.difficulty],
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ transform: "scale(0.56)", transformOrigin: "center", pointerEvents: "none" }}>
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
      </div>

      {/* Icon overlap */}
      <div style={{ padding: "0 12px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          marginTop: -15, position: "relative", zIndex: 1,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <GameIcon slug={game.slug} size={20} />
        </div>
      </div>

      {/* Name + difficulty */}
      <div style={{ padding: "6px 12px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
          color: "var(--color-text-primary)", whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis", margin: 0,
        }}>
          {game.name}
        </p>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 7, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: DIFF_COLOR[game.difficulty], margin: 0,
        }}>
          {DIFF_LABEL[game.difficulty]}
        </p>
      </div>
    </motion.button>
  );
}

interface GamesHubCatalogProps { isPro: boolean }

export function GamesHubCatalog({ isPro }: GamesHubCatalogProps) {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 40px" }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-accent-primary)", margin: "0 0 4px" }}>THE COLLECTION</p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--color-text-primary)", margin: 0 }}>Pick a discipline</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {GAMES.map((game, i) => (
          <GameTile key={game.slug} game={game} isPro={isPro} index={i} />
        ))}
      </div>
    </section>
  );
}
