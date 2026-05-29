// src/lib/games/tokenEngine.ts
// ─── Token engine — controls free daily play limits ───────────────────────────

import { createBrowserClient } from "@supabase/ssr";

const TOKEN_KEY = "me_tokens"; // localStorage key
const RESET_KEY = "me_tokens_reset";

// ── LAUNCH CONFIG ────────────────────────────────────────────────────────────
export const FREE_DAILY_TOKENS = 5; // Free users get 5 plays per day
const TOKEN_RESET_HOURS = 24;       // Reset every 24 hours

// ── Supabase (lazy singleton) ─────────────────────────────────────────────────
let _sb: ReturnType<typeof createBrowserClient> | null = null;
function sb() {
  if (_sb) return _sb;
  _sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _sb;
}

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

// ── Supabase sync helpers ─────────────────────────────────────────────────────

async function pushToSupabase(userId: string, remaining: number): Promise<void> {
  try {
    await sb()
      .from("profiles")
      .update({
        tokens_remaining: remaining,
        tokens_reset_at: new Date(getLastReset(userId) || Date.now()).toISOString(),
      })
      .eq("id", userId);
  } catch {}
}

/**
 * Reads the authoritative token count from Supabase and syncs to localStorage.
 * Call this once after the user logs in to prevent localStorage-clearing exploits.
 */
export async function syncTokensFromSupabase(userId: string): Promise<void> {
  try {
    const { data } = await sb()
      .from("profiles")
      .select("tokens_remaining, tokens_reset_at")
      .eq("id", userId)
      .single();
    if (!data) return;
    const resetAt = new Date(data.tokens_reset_at as string).getTime();
    const hoursSinceReset = (Date.now() - resetAt) / (1000 * 60 * 60);
    // Only apply DB value if the DB reset window is still current
    if (hoursSinceReset < TOKEN_RESET_HOURS) {
      setTokens(userId, data.tokens_remaining as number);
      setLastReset(userId, resetAt);
    }
  } catch {}
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
    void pushToSupabase(userId, FREE_DAILY_TOKENS);
    return FREE_DAILY_TOKENS;
  }

  return Math.max(0, getStoredTokens(userId));
}

/**
 * Attempts to consume 1 token.
 * Returns true if token was consumed, false if no tokens left.
 * Syncs the new count to Supabase (fire-and-forget).
 */
export function consumeToken(userId: string): boolean {
  const remaining = getTokensRemaining(userId);
  if (remaining <= 0) return false;
  const newCount = remaining - 1;
  setTokens(userId, newCount);
  void pushToSupabase(userId, newCount);
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
  void pushToSupabase(userId, newCount);
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
 * Returns seconds until next token reset.
 */
export function secondsUntilReset(userId: string): number {
  return Math.ceil(msUntilReset(userId) / 1000);
}

/**
 * Formats reset countdown as "Xh Ym" or "Xm Ys".
 */
export function formatResetTime(userId: string): string {
  const ms = msUntilReset(userId);
  if (ms <= 0) return "now";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatCountdown(userId: string): string {
  return formatResetTime(userId);
}
