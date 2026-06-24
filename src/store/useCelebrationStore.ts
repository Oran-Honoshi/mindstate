import { create } from "zustand";

export type CelebrationEvent =
  | { type: "levelUp"; level: number; title: string; totalXP: number }
  | { type: "century"; gameSlug: string; gameName: string; totalTime: number; bestXP: number; totalHints: number }
  | { type: "streak"; days: number; history: boolean[] };

interface CelebrationStore {
  queue: CelebrationEvent[];
  triggerLevelUp(level: number, title: string, totalXP: number): void;
  triggerCentury(gameSlug: string, gameName: string, totalTime: number, bestXP: number, hints: number): void;
  triggerStreak(days: number, history: boolean[]): void;
  dismiss(): void;
}

export const useCelebrationStore = create<CelebrationStore>((set) => ({
  queue: [],

  triggerLevelUp(level, title, totalXP) {
    set(s => ({ queue: [...s.queue, { type: "levelUp", level, title, totalXP }] }));
  },
  triggerCentury(gameSlug, gameName, totalTime, bestXP, hints) {
    set(s => ({ queue: [...s.queue, { type: "century", gameSlug, gameName, totalTime, bestXP, totalHints: hints }] }));
  },
  triggerStreak(days, history) {
    set(s => ({ queue: [...s.queue, { type: "streak", days, history }] }));
  },
  dismiss() {
    set(s => ({ queue: s.queue.slice(1) }));
  },
}));

export function useCelebrations() {
  const { queue, triggerLevelUp, triggerCentury, triggerStreak } = useCelebrationStore();
  return { celebrationQueue: queue, triggerLevelUp, triggerCentury, triggerStreak };
}
