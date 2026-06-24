"use client";
import { useCelebrationStore } from "@/store/useCelebrationStore";
import { LevelUpOverlay } from "./LevelUpOverlay";
import { CenturyClubOverlay } from "./CenturyClubOverlay";
import { StreakMilestoneOverlay } from "./StreakMilestoneOverlay";

export { useCelebrations } from "@/store/useCelebrationStore";

export function CelebrationManager() {
  const { queue, dismiss } = useCelebrationStore();
  const current = queue[0];

  if (!current) return null;

  if (current.type === "levelUp") {
    return (
      <LevelUpOverlay
        isOpen
        onDismiss={dismiss}
        newLevel={current.level}
        newLevelTitle={current.title}
        totalXP={current.totalXP}
      />
    );
  }

  if (current.type === "century") {
    return (
      <CenturyClubOverlay
        isOpen
        onDismiss={dismiss}
        gameSlug={current.gameSlug}
        gameName={current.gameName}
        totalTimeSeconds={current.totalTime}
        bestXP={current.bestXP}
        totalHintsUsed={current.totalHints}
      />
    );
  }

  if (current.type === "streak") {
    return (
      <StreakMilestoneOverlay
        isOpen
        onDismiss={dismiss}
        streakDays={current.days}
        streakHistory={current.history}
      />
    );
  }

  return null;
}
