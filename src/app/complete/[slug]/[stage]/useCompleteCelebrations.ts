"use client";
import { useState, useEffect, useRef } from "react";
import { addAndGetTotalXP, getLevelInfo } from "@/lib/xpLevels";

interface CelebrationState {
  showToast: boolean;
  showCard: boolean;
  levelUp: {
    levelNumber: number;
    rankName: string;
    color: string;
    currentXP: number;
    nextLevelXP: number;
  } | null;
  showCentury: boolean;
}

export function useCompleteCelebrations(xp: number, stage: number) {
  const [state, setState] = useState<CelebrationState>({
    showToast: false,
    showCard: false,
    levelUp: null,
    showCentury: false,
  });
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const { prev, next } = addAndGetTotalXP(xp);
    const prevLevel = getLevelInfo(prev);
    const nextLevel = getLevelInfo(next);
    const levelCrossed = nextLevel.levelNumber > prevLevel.levelNumber;

    setState({
      showCentury: stage === 100,
      levelUp: levelCrossed
        ? {
            levelNumber: nextLevel.levelNumber,
            rankName: nextLevel.rankName,
            color: nextLevel.color,
            currentXP: nextLevel.currentXP,
            nextLevelXP: nextLevel.nextLevelXP,
          }
        : null,
      showCard: !levelCrossed && stage !== 100 && stage % 10 === 0,
      showToast: true,
    });
  }, [xp, stage]);

  const dismiss = (key: keyof CelebrationState) =>
    setState(s => ({ ...s, [key]: key === "levelUp" ? null : false }));

  return { state, dismiss };
}
