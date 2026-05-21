// src/lib/games/stageProgress.ts
// Stage progress persistence — saves last reached stage + completed set per game.
// localStorage is the source of truth for speed; Supabase sync is handled separately
// in the Supabase-aware layer (see stageProgress.supabase.ts if you add cross-device sync).

const PREFIX = "mindstate-stage-";

// ─── Basic reads ──────────────────────────────────────────────────────────────

export function getLastStage(gameSlug: string): number {
  if (typeof window === "undefined") return 1;
  return parseInt(localStorage.getItem(`${PREFIX}${gameSlug}`) ?? "1");
}

export function saveLastStage(gameSlug: string, stage: number): void {
  if (typeof window === "undefined") return;
  const current = getLastStage(gameSlug);
  // Only advance — never go backwards
  if (stage > current) {
    localStorage.setItem(`${PREFIX}${gameSlug}`, String(stage));
  }
}

export function getCompletedStages(gameSlug: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(`${PREFIX}${gameSlug}-completed`);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

// ─── Stage completion ─────────────────────────────────────────────────────────

export function markStageCompleted(gameSlug: string, stage: number): void {
  if (typeof window === "undefined") return;
  const completed = getCompletedStages(gameSlug);
  completed.add(stage);
  localStorage.setItem(
    `${PREFIX}${gameSlug}-completed`,
    JSON.stringify([...completed])
  );
  saveLastStage(gameSlug, stage + 1); // next stage becomes current
}

export function isStageCompleted(gameSlug: string, stage: number): boolean {
  return getCompletedStages(gameSlug).has(stage);
}

// ─── Smart routing ────────────────────────────────────────────────────────────

/**
 * Returns the lowest stage number ≤ totalStages that has NOT been completed.
 * If every stage is done, returns totalStages (so the user can replay the last one).
 *
 * Used by CompletionPopup's "Go to Latest" button so that after finishing a
 * skipped stage the player is sent to the next gap rather than stage+1.
 */
export function getNextUncompletedStage(
  gameSlug: string,
  totalStages: number
): number {
  const completed = getCompletedStages(gameSlug);
  for (let s = 1; s <= totalStages; s++) {
    if (!completed.has(s)) return s;
  }
  // All stages complete — return last stage so they can replay
  return totalStages;
}

/**
 * True when every stage from 1 → totalStages is in the completed set.
 * Used to decide whether to show the GameCompleteModal.
 */
export function isGameFullyCompleted(
  gameSlug: string,
  totalStages: number
): boolean {
  const completed = getCompletedStages(gameSlug);
  for (let s = 1; s <= totalStages; s++) {
    if (!completed.has(s)) return false;
  }
  return completed.size > 0; // guard against empty set on totalStages=0
}

/**
 * Returns true the FIRST time isGameFullyCompleted flips to true for this slug.
 * Stores a flag in localStorage so the celebration only ever fires once.
 */
export function shouldShowGameCompleteModal(
  gameSlug: string,
  totalStages: number
): boolean {
  if (typeof window === "undefined") return false;
  const key = `me_game_complete_${gameSlug}`;
  if (localStorage.getItem(key)) return false; // already celebrated
  if (!isGameFullyCompleted(gameSlug, totalStages)) return false;
  localStorage.setItem(key, "1");
  return true;
}

/**
 * Alias kept for StageMap compatibility.
 */
export { getCompletedStages as getAllCompletedStages };

// ─── Supabase-aware remote API (used by game pages after auth) ────────────────
// These are thin wrappers that call the Supabase client when a user is logged in,
// falling back to localStorage for guests.

import { createBrowserClient } from "@supabase/ssr";

let _sb: ReturnType<typeof createBrowserClient> | null = null;
function sb() {
  if (_sb) return _sb;
  _sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _sb;
}

/**
 * Authoritative read from Supabase. Falls back to localStorage if logged out or
 * request fails. Always updates the local cache on success.
 */
export async function getLastStageRemote(gameSlug: string): Promise<number> {
  const client = sb();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return getLastStage(gameSlug);

  const { data, error } = await client
    .from("stage_progress")
    .select("last_stage")
    .eq("user_id", user.id)
    .eq("game_id", gameSlug)
    .maybeSingle();

  if (error || !data) return getLastStage(gameSlug);

  const remote = data.last_stage as number;
  // Mirror into localStorage so synchronous reads are accurate
  saveLastStage(gameSlug, remote);
  return remote;
}