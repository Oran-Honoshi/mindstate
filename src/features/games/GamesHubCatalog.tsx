"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { GAMES } from "@/features/games/GameGrid";
import { getCompletedStages } from "@/lib/games/stageProgress";

interface TileProps {
  game: typeof GAMES[0];
  isPro: boolean;
}

function GameTile({ game, isPro }: TileProps) {
  const [completed, setCompleted] = useState(0);
  const router = useRouter();
  const isLocked = !game.free && !isPro;

  useEffect(() => {
    setCompleted(getCompletedStages(game.slug).size);
  }, [game.slug]);

  function handleClick() {
    if (isLocked) { router.push("/pricing"); return; }
    const onboarded = typeof window !== "undefined" && localStorage.getItem("onboarded") === "1";
    router.push(onboarded ? `/games/${game.slug}` : `/onboard?next=/games/${game.slug}`);
  }

  const pct = Math.min(100, (completed / 100) * 100);

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex", flexDirection: "column", gap: 8, padding: "14px 12px",
        borderRadius: 12, border: "1px solid var(--color-border)",
        background: "var(--color-surface)", cursor: "pointer",
        textAlign: "left", width: "100%",
        opacity: isLocked ? 0.7 : 1, position: "relative",
      }}
    >
      {isLocked && (
        <Lock
          size={12}
          color="var(--color-text-secondary)"
          style={{ position: "absolute", top: 10, right: 10 }}
        />
      )}
      <span style={{
        fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)",
        fontFamily: "var(--font-sans)", lineHeight: 1.3,
      }}>
        {game.name}
      </span>
      <div style={{ width: "100%", height: 3, background: "var(--color-surface-2)", borderRadius: 2 }}>
        <div style={{
          height: 3, borderRadius: 2, width: `${pct}%`,
          background: "var(--color-accent-primary)", transition: "width 0.4s ease",
        }} />
      </div>
      <span style={{ fontSize: 10, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
        {completed}/100
      </span>
    </button>
  );
}

interface GamesHubCatalogProps {
  isPro: boolean;
}

export function GamesHubCatalog({ isPro }: GamesHubCatalogProps) {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
      <p style={{
        fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
        color: "var(--color-text-primary)", marginBottom: 14,
      }}>
        All Games
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {GAMES.map(game => (
          <GameTile key={game.slug} game={game} isPro={isPro} />
        ))}
      </div>
    </section>
  );
}
