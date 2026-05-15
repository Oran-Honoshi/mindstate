import { createClient } from "./client";
import type { Score } from "./types";

// Only saves if this is the user's FIRST completion of this stage.
// Subsequent retries don't overwrite — leaderboard reflects first attempt only.
export async function saveScore(score: Omit<Score, "id" | "completed_at">) {
  const supabase = createClient();

  // Check if a score already exists for this user/game/stage
  const { data: existing } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", score.user_id)
    .eq("game_slug", score.game_slug)
    .eq("stage_number", score.stage_number)
    .limit(1)
    .single();

  // Already played — don't overwrite
  if (existing) return { data: null, error: null };

  // First play — insert
  const { data, error } = await supabase
    .from("scores")
    .insert(score)
    .select()
    .single();
  return { data, error };
}

export async function getUserScores(userId: string): Promise<Score[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });
  return data ?? [];
}

export async function getBestScore(
  userId: string,
  gameSlug: string,
  stageNumber: number
): Promise<Score | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .eq("game_slug", gameSlug)
    .eq("stage_number", stageNumber)
    .order("xp_earned", { ascending: false })
    .limit(1)
    .single();
  return data ?? null;
}

// Leaderboard: sum of first-play XP per user (not total retries)
export async function getLeaderboard(gameSlug: string, limit = 20) {
  const supabase = createClient();
  const { data } = await supabase
    .from("scores")
    .select("*, profiles(username, avatar_url)")
    .eq("game_slug", gameSlug)
    .order("xp_earned", { ascending: false })
    .limit(limit);
  return data ?? [];
}

// Total XP for a user across all games (first plays only — enforced at insert)
export async function getUserTotalXP(userId: string): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("scores")
    .select("xp_earned")
    .eq("user_id", userId);
  return (data ?? []).reduce((sum, s) => sum + (s.xp_earned ?? 0), 0);
}

// Global leaderboard — total XP per user across all games
export async function getGlobalLeaderboard(limit = 20) {
  const supabase = createClient();
  const { data } = await supabase
    .from("scores")
    .select("user_id, xp_earned, profiles(username, avatar_url)");
  if (!data) return [];
  // Group by user and sum XP
  const totals = new Map<string, { username: string; avatar_url: string; xp: number }>();
  data.forEach((row: any) => {
    const uid = row.user_id;
    const existing = totals.get(uid);
    const xp = row.xp_earned ?? 0;
    const profile = row.profiles ?? {};
    if (existing) existing.xp += xp;
    else totals.set(uid, { username: profile.username ?? "Anonymous", avatar_url: profile.avatar_url ?? "", xp });
  });
  return [...totals.entries()]
    .map(([uid, v]) => ({ user_id: uid, ...v }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}
