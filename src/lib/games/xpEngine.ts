export interface XPState {
  maxXP: number;
  hintsUsed: number;
  maxHints: number;
  startTime: number;
  decayDuration: number;
}

export interface XPSnapshot {
  currentXP: number;
  hintPenalty: number;
  timePenalty: number;
  hintsRemaining: number;
  percentRemaining: number;
  isDecayed: boolean;
}

export const DIFFICULTY_CONFIG = {
  easy:   { maxXP: 1000, decayDuration: 300 },
  medium: { maxXP: 1000, decayDuration: 180 },
  hard:   { maxXP: 1000, decayDuration: 120 },
} as const;

export type Difficulty = keyof typeof DIFFICULTY_CONFIG;

export function createXPState(difficulty: Difficulty): XPState {
  const config = DIFFICULTY_CONFIG[difficulty];
  return { maxXP: config.maxXP, hintsUsed: 0, maxHints: 3, startTime: Date.now(), decayDuration: config.decayDuration };
}

export function calculateXP(state: XPState, now = Date.now()): XPSnapshot {
  const { maxXP, hintsUsed, maxHints, startTime, decayDuration } = state;
  const elapsed = (now - startTime) / 1000;
  const hintPenalty = Math.min(hintsUsed * (maxXP * 0.25), maxXP);
  const maxAfterHints = maxXP - hintPenalty;
  const timePenalty = Math.min((elapsed / decayDuration) * maxAfterHints, maxAfterHints);
  const currentXP = Math.max(0, Math.round(maxAfterHints - timePenalty));
  return {
    currentXP,
    hintPenalty,
    timePenalty,
    hintsRemaining: maxHints - hintsUsed,
    percentRemaining: maxXP > 0 ? currentXP / maxXP : 0,
    isDecayed: currentXP === 0,
  };
}

export function useHint(state: XPState): XPState {
  if (state.hintsUsed >= state.maxHints) return state;
  return { ...state, hintsUsed: state.hintsUsed + 1 };
}

export function finalizeXP(state: XPState, completedAt = Date.now()): number {
  return calculateXP(state, completedAt).currentXP;
}

export function formatElapsed(startTime: number, now = Date.now()): string {
  const seconds = Math.floor((now - startTime) / 1000);
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function xpColor(percentRemaining: number): string {
  if (percentRemaining > 0.6) return "#39FF14";
  if (percentRemaining > 0.3) return "#FFD700";
  return "#FF4444";
}
