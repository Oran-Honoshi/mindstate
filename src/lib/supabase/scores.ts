import { createClient } from "./client";
import type { Score } from "./types";

export async function saveScore(score: Omit<Score, "id" | "completed_at">) {
  const supabase = createClient();
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
