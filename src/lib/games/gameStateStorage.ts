// Mid-game state persistence
// Saves game state to localStorage so players can resume after leaving

const PREFIX = "mindstate-state-";

export function saveGameState(gameSlug: string, state: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${PREFIX}${gameSlug}`, JSON.stringify({
      ...state,
      savedAt: Date.now(),
    }));
  } catch {}
}

export function loadGameState(gameSlug: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${gameSlug}`);
    if (!raw) return null;
    const state = JSON.parse(raw);
    // Discard saves older than 7 days
    if (Date.now() - (state.savedAt ?? 0) > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`${PREFIX}${gameSlug}`);
      return null;
    }
    return state;
  } catch { return null; }
}

export function clearGameState(gameSlug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${PREFIX}${gameSlug}`);
}
