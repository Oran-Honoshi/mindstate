"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { GAMES } from "@/features/games/GameGrid";
import { getCompletedStages } from "@/lib/games/stageProgress";

interface TileProps {
  game: typeof GAMES[0];
  isPro: boolean;
  index: number;
}

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
    const onboarded = typeof window !== "undefined" && localStorage.getItem("onboarded") === "1";
    router.push(onboarded ? `/games/${game.slug}` : `/onboard?next=/games/${game.slug}`);
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
        display: "flex", flexDirection: "column", gap: 10,
        padding: "14px 14px 12px", borderRadius: 10, textAlign: "left",
        width: "100%", minHeight: 88, cursor: "pointer",
        background: isDone
          ? "rgba(0,255,255,0.06)"
          : isLocked ? "var(--color-surface)" : "var(--color-surface)",
        border: isDone
          ? "1px solid rgba(0,255,255,0.3)"
          : hovered && !isLocked
          ? "1px solid rgba(255,255,255,0.22)"
          : "1px solid var(--color-border)",
        opacity: isLocked ? 0.65 : 1,
        transition: "border-color 0.15s, background 0.15s",
        position: "relative",
      }}
    >
      {/* Pro badge */}
      {isLocked && (
        <span style={{
          position: "absolute", top: 9, right: 9,
          fontSize: 8, fontWeight: 800, letterSpacing: "0.1em",
          color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)",
          background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.25)",
          padding: "2px 6px", borderRadius: 3,
        }}>PRO</span>
      )}

      {/* Done badge */}
      {isDone && (
        <span style={{ position: "absolute", top: 9, right: 9 }}>
          <Check size={13} color="var(--color-accent-primary)" strokeWidth={2.5} />
        </span>
      )}

      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.25, paddingRight: isLocked || isDone ? 28 : 0 }}>
        {game.name}
      </span>

      <div style={{ width: "100%", height: 4, background: "var(--color-surface-2)", borderRadius: 2, overflow: "hidden" }}>
        {pct > 0 && (
          <div style={{
            height: "100%", borderRadius: 2, width: `${pct}%`,
            background: isDone ? "var(--color-accent-primary)" : "rgba(0,255,255,0.55)",
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          }} />
        )}
      </div>

      <span style={{ fontSize: 10, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
        {isDone ? "COMPLETE" : `${completed} / 100`}
      </span>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {GAMES.map((game, i) => (
          <GameTile key={game.slug} game={game} isPro={isPro} index={i} />
        ))}
      </div>
    </section>
  );
}
