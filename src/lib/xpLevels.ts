export interface LevelTier {
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
}

export const LEVELS: LevelTier[] = [
  { name: "Spark",       minXP: 0,     maxXP: 999,        color: "#2FE6E0" },
  { name: "Ember",       minXP: 1000,  maxXP: 2499,       color: "#2FE6E0" },
  { name: "Flare",       minXP: 2500,  maxXP: 4999,       color: "#2FE6E0" },
  { name: "Nova",        minXP: 5000,  maxXP: 9999,       color: "#2FE6E0" },
  { name: "Pulsar",      minXP: 10000, maxXP: 19999,      color: "#2FE6E0" },
  { name: "Quasar",      minXP: 20000, maxXP: 39999,      color: "#8E7CFF" },
  { name: "Grandmaster", minXP: 40000, maxXP: Infinity,   color: "#FFC24B" },
];

export interface LevelInfo {
  name: string;
  tier: number;
  color: string;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
}

export function getLevelInfo(totalXP: number): LevelInfo {
  const tier = Math.max(0, LEVELS.findIndex((l, i) =>
    totalXP >= l.minXP && (i === LEVELS.length - 1 || totalXP < LEVELS[i + 1].minXP)
  ));
  const level = LEVELS[tier];
  const next = LEVELS[tier + 1];
  const range = next ? next.minXP - level.minXP : 1;
  const currentXP = totalXP - level.minXP;
  return {
    name: level.name,
    tier,
    color: level.color,
    currentXP,
    nextLevelXP: range,
    progress: Math.min(1, Math.max(0, currentXP / range)),
  };
}

const XP_KEY = "ms_total_xp";

export function getTotalXP(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(XP_KEY) ?? "0", 10);
}

export function addAndGetTotalXP(earned: number): { prev: number; next: number } {
  const prev = getTotalXP();
  const next = prev + earned;
  localStorage.setItem(XP_KEY, String(next));
  return { prev, next };
}
