export const FREE_DAILY_TOKENS = 5;

export interface TokenState {
  tokens: number;
  resetDate: string;
  isPro: boolean;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function getTokenState(userId: string): TokenState {
  if (typeof window === "undefined") return { tokens: FREE_DAILY_TOKENS, resetDate: todayStr(), isPro: false };
  const key = `mindstate-tokens-${userId}`;
  const raw = localStorage.getItem(key);
  const today = todayStr();
  if (!raw) {
    const state = { tokens: FREE_DAILY_TOKENS, resetDate: today, isPro: false };
    localStorage.setItem(key, JSON.stringify(state));
    return state;
  }
  const state: TokenState = JSON.parse(raw);
  if (state.resetDate !== today) {
    const fresh = { ...state, tokens: FREE_DAILY_TOKENS, resetDate: today };
    localStorage.setItem(key, JSON.stringify(fresh));
    return fresh;
  }
  return state;
}

export function consumeToken(userId: string): boolean {
  const state = getTokenState(userId);
  if (state.isPro) return true;
  if (state.tokens <= 0) return false;
  const updated = { ...state, tokens: state.tokens - 1 };
  localStorage.setItem(`mindstate-tokens-${userId}`, JSON.stringify(updated));
  return true;
}

export function getTokensRemaining(userId: string): number {
  const state = getTokenState(userId);
  if (state.isPro) return 999;
  return Math.max(0, state.tokens);
}

export function secondsUntilReset(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
