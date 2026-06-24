"use client";
import { useState, useEffect, useRef } from "react";
import { addAndGetTotalXP, getLevelInfo } from "@/lib/xpLevels";
import { useCelebrationStore } from "@/store/useCelebrationStore";

interface CelebrationState {
  showToast: boolean;
  showCard: boolean;
}

const STREAK_MILESTONES = new Set([7, 14, 30, 60, 100]);

export function useCompleteCelebrations(xp: number, stage: number, gameSlug?: string, gameName?: string) {
  const [state, setState] = useState<CelebrationState>({ showToast: false, showCard: false });
  const initialized = useRef(false);
  const { triggerLevelUp, triggerCentury, triggerStreak } = useCelebrationStore();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const { prev, next } = addAndGetTotalXP(xp);
    const prevLevel = getLevelInfo(prev);
    const nextLevel = getLevelInfo(next);
    const levelCrossed = nextLevel.levelNumber > prevLevel.levelNumber;

    if (stage === 100 && gameSlug && gameName) {
      triggerCentury(gameSlug, gameName, 0, xp, 0);
    } else if (levelCrossed) {
      triggerLevelUp(nextLevel.levelNumber, nextLevel.rankName, next);
    }

    // Check streak milestone (read from localStorage)
    const streak = parseInt(localStorage.getItem("ms_streak") ?? "0", 10);
    if (STREAK_MILESTONES.has(streak)) {
      const history = Array.from({ length: 28 }, (_, i) => i < streak && i < 28);
      triggerStreak(streak, history);
    }

    setState({
      showCard: !levelCrossed && stage !== 100 && stage % 10 === 0,
      showToast: true,
    });
  }, [xp, stage, gameSlug, gameName, triggerLevelUp, triggerCentury, triggerStreak]);

  const dismiss = (key: keyof CelebrationState) =>
    setState(s => ({ ...s, [key]: false }));

  return { state, dismiss };
}
