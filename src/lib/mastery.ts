export type MasteryTier = "bronze" | "silver" | "gold" | "diamond" | null;

export const MASTERY_THRESHOLDS = {
  bronze:  10,
  silver:  30,
  gold:    60,
  diamond: 100,
} as const;

export function getMasteryTier(completedStages: number): MasteryTier {
  if (completedStages >= 100) return "diamond";
  if (completedStages >= 60)  return "gold";
  if (completedStages >= 30)  return "silver";
  if (completedStages >= 10)  return "bronze";
  return null;
}

export function getMasteryColor(tier: MasteryTier): string {
  switch (tier) {
    case "bronze":  return "#CD7F32";
    case "silver":  return "#C0C0C0";
    case "gold":    return "#FFC24B";
    case "diamond": return "#8E7CFF";
    default:        return "transparent";
  }
}
