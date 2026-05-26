"use client";

import type { ReactNode } from "react";
import { GameTopBar } from "./GameTopBar";
import { GameProgressStrip } from "./GameProgressStrip";
import { GameToolbar } from "./GameToolbar";

interface GameShellProps {
  slug: string;
  gameName: string;
  stageNumber: number;
  xp: number;
  maxXp: number;
  elapsedSeconds: number;
  hintsRemaining: number;
  onUndo: () => void;
  onHint: () => void;
  onCheck: () => void;
  children: ReactNode;
}

export function GameShell({
  slug,
  gameName,
  stageNumber,
  xp,
  maxXp,
  elapsedSeconds,
  hintsRemaining,
  onUndo,
  onHint,
  onCheck,
  children,
}: GameShellProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      background: "var(--color-bg)",
      overflow: "hidden",
    }}>
      {/* Zone 1 — top bar */}
      <GameTopBar
        slug={slug}
        gameName={gameName}
        stageNumber={stageNumber}
        xp={xp}
      />

      {/* Zone 2 — XP bar + time/hints strip */}
      <GameProgressStrip
        xp={xp}
        maxXp={maxXp}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={hintsRemaining}
      />

      {/* Zone 3 — scrollable game board */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}>
        {children}
      </div>

      {/* Zone 4 — toolbar */}
      <GameToolbar
        onUndo={onUndo}
        onHint={onHint}
        onCheck={onCheck}
        hintsRemaining={hintsRemaining}
      />
    </div>
  );
}