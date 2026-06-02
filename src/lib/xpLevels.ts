export interface LevelInfo {
  name: string;        // rank name (backward compat alias for rankName)
  tier: number;        // rank tier index 0–8 (backward compat)
  color: string;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
  levelNumber: number; // NEW — numeric level (1, 2, 3 ...)
  rankName: string;    // NEW — "Spark" | "Ember" | "Adept" | "Tactician" | "Sharp" | "Expert" | "Master" | "Grandmaster" | "Legend"
}

// [minLevel, rankName, color]
const RANK_TIERS: Array<[number, string, string]> = [
  [1,  "Spark",       "#2FE6E0"],
  [3,  "Ember",       "#2FE6E0"],
  [5,  "Adept",       "#2FE6E0"],
  [7,  "Tactician",   "#2FE6E0"],
  [9,  "Sharp",       "#2FE6E0"],
  [12, "Expert",      "#8E7CFF"],
  [18, "Master",      "#8E7CFF"],
  [26, "Grandmaster", "#FFC24B"],
  [41, "Legend",      "#FFC24B"],
];

// Cumulative XP needed to reach level n (1-indexed)
// Level 1: 0 XP, Level 2: 200 XP, Level n (n≥2): 200 + (n-2)*300
function startOfLevel(n: number): number {
  return n <= 1 ? 0 : 200 + (n - 2) * 300;
}

function getLevelNumber(totalXP: number): number {
  if (totalXP < 200) return 1;
  return Math.floor((totalXP - 200) / 300) + 2;
}

function getRankInfo(level: number): { name: string; color: string; tier: number } {
  let result = { name: RANK_TIERS[0][1] as string, color: RANK_TIERS[0][2] as string, tier: 0 };
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (level >= (RANK_TIERS[i][0] as number)) {
      result = { name: RANK_TIERS[i][1] as string, color: RANK_TIERS[i][2] as string, tier: i };
    }
  }
  return result;
}

export function getLevelInfo(totalXP: number): LevelInfo {
  const levelNumber = getLevelNumber(totalXP);
  const rank = getRankInfo(levelNumber);
  const levelStartXP = startOfLevel(levelNumber);
  const levelEndXP = startOfLevel(levelNumber + 1);
  const xpNeededForLevel = levelEndXP - levelStartXP;
  const currentXP = totalXP - levelStartXP;
  return {
    name: rank.name,
    tier: rank.tier,
    color: rank.color,
    currentXP,
    nextLevelXP: xpNeededForLevel,
    progress: Math.min(1, Math.max(0, currentXP / xpNeededForLevel)),
    levelNumber,
    rankName: rank.name,
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
