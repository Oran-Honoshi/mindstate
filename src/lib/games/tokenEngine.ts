// src/lib/games/tokenEngine.ts
// ─── Token engine — controls free daily play limits ───────────────────────────

const TOKEN_KEY = "me_tokens"; // localStorage key
const RESET_KEY = "me_tokens_reset";

// ── LAUNCH CONFIG ────────────────────────────────────────────────────────────
export const FREE_DAILY_TOKENS = 5; // Free users get 5 plays per day
const TOKEN_RESET_HOURS = 24;       // Reset every 24 hours

// ── Core helpers ─────────────────────────────────────────────────────────────

function storageKey(userId: string, suffix: string) {
  return `${TOKEN_KEY}_${userId}_${suffix}`;
}

function getStoredTokens(userId: string): number {
  if (typeof window === "undefined") return FREE_DAILY_TOKENS;
  const raw = localStorage.getItem(storageKey(userId, "count"));
  return raw !== null ? parseInt(raw, 10) : FREE_DAILY_TOKENS;
}

function getLastReset(userId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(storageKey(userId, "reset"));
  return raw ? parseInt(raw, 10) : 0;
}

function setTokens(userId: string, count: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId, "count"), String(count));
}

function setLastReset(userId: string, ts: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId, "reset"), String(ts));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the number of tokens remaining for today.
 * Automatically resets if 24h have passed since last reset.
 */
export function getTokensRemaining(userId: string): number {
  const now = Date.now();
  const lastReset = getLastReset(userId);
  const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

  if (lastReset === 0 || hoursSinceReset >= TOKEN_RESET_HOURS) {
    setTokens(userId, FREE_DAILY_TOKENS);
    setLastReset(userId, now);
    return FREE_DAILY_TOKENS;
  }

  return Math.max(0, getStoredTokens(userId));
}

/**
 * Attempts to consume 1 token.
 * Returns true if token was consumed, false if no tokens left.
 */
export function consumeToken(userId: string): boolean {
  const remaining = getTokensRemaining(userId);
  if (remaining <= 0) return false;
  setTokens(userId, remaining - 1);
  return true;
}

/**
 * Adds bonus tokens (e.g. weekly streak reward).
 * Capped at FREE_DAILY_TOKENS * 3 to prevent abuse.
 */
export function addBonusTokens(userId: string, amount: number) {
  const current = getTokensRemaining(userId);
  const newCount = Math.min(current + amount, FREE_DAILY_TOKENS * 3);
  setTokens(userId, newCount);
}

/**
 * Returns ms until next token reset.
 */
export function msUntilReset(userId: string): number {
  const lastReset = getLastReset(userId);
  if (lastReset === 0) return 0;
  const resetAt = lastReset + TOKEN_RESET_HOURS * 60 * 60 * 1000;
  return Math.max(0, resetAt - Date.now());
}

/**
 * Formats the time until reset as "Xh Ym".
 */
export function formatResetTime(userId: string): string {
  const ms = msUntilReset(userId);
  if (ms <= 0) return "now";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}