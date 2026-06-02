"use client";

import type { ReactNode } from "react";
import { GameTopBar } from "./GameTopBar";
import { GameProgressStrip } from "./GameProgressStrip";
import { GameToolbar } from "./GameToolbar";
import { useSettingsStore } from "@/store/settingsStore";
import type { Difficulty } from "@/lib/games/xpEngine";

interface GameShellProps {
  slug: string;
  gameName: string;
  stageNumber: number;
  difficulty: Difficulty;
  xp: number;
  maxXp: number;
  elapsedSeconds: number;
  hintsRemaining: number;
  onUndo: () => void;
  onHint: () => void;
  onCheck?: () => void;
  children: ReactNode;
}

export function GameShell({
  slug, gameName, stageNumber, difficulty,
  xp, maxXp, elapsedSeconds,
  hintsRemaining, onUndo, onHint, onCheck,
  children,
}: GameShellProps) {
  const { isPracticeMode, togglePracticeMode } = useSettingsStore();

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: "var(--color-bg)", overflow: "hidden",
    }}>
      <GameTopBar
        slug={slug} gameName={gameName}
        stageNumber={stageNumber} difficulty={difficulty}
        xp={xp} maxXp={maxXp} elapsedSeconds={elapsedSeconds}
      />

      <GameProgressStrip xp={xp} maxXp={maxXp} />

      <div style={{
        flex: 1, overflowY: "auto",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 16,
      }}>
        {children}

        {/* Practice mode toggle pill */}
        <div
          role="button"
          aria-pressed={isPracticeMode}
          onClick={togglePracticeMode}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            marginTop: 18, padding: "8px 14px", borderRadius: 20,
            background: isPracticeMode ? "rgba(142,124,255,0.12)" : "var(--color-surface)",
            border: `1px solid ${isPracticeMode ? "rgba(142,124,255,0.4)" : "var(--color-border)"}`,
            cursor: "pointer", userSelect: "none",
            transition: "background 0.2s, border-color 0.2s",
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 30, height: 17, borderRadius: 9, position: "relative",
            background: isPracticeMode ? "var(--color-violet)" : "var(--color-surface-2)",
            transition: "background 0.2s",
            flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", top: 2,
              left: isPracticeMode ? 15 : 2,
              width: 13, height: 13, borderRadius: 7,
              background: "#fff",
              transition: "left 0.2s",
            }} />
          </div>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 8.5,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: isPracticeMode ? "var(--color-violet)" : "var(--color-text-secondary)",
          }}>
            Practice Mode · Zero Pressure
          </span>
        </div>
      </div>

      <GameToolbar
        onUndo={onUndo} onHint={onHint}
        onCheck={onCheck} hintsRemaining={hintsRemaining}
      />
    </div>
  );
}
