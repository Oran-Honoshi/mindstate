import { createClient } from "@/lib/supabase/client";

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  total_xp: number;
  games_played: number;
  best_game: string;
  avatar_initial: string;
  is_current_user: boolean;
}

export async function fetchLeaderboard(
  gameSlug: string,
  period: string,
  currentUserId?: string
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();

  let query = supabase
    .from("scores")
    .select("user_id, xp_earned, game_slug, stage_number, completed_at");

  if (gameSlug !== "all") query = query.eq("game_slug", gameSlug);

  if (period === "today") {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    query = query.gte("completed_at", today.toISOString());
  } else if (period === "week") {
    const week = new Date(); week.setDate(week.getDate() - 7);
    query = query.gte("completed_at", week.toISOString());
  }

  const { data: scores } = await query;
  if (!scores) return [];

  const userMap = new Map<string, { total_xp: number; games: Set<string>; best_game: string; best_xp: number }>();
  scores.forEach(s => {
    const existing = userMap.get(s.user_id) ?? { total_xp: 0, games: new Set<string>(), best_game: s.game_slug, best_xp: 0 };
    existing.total_xp += s.xp_earned;
    existing.games.add(s.game_slug);
    if (s.xp_earned > existing.best_xp) { existing.best_xp = s.xp_earned; existing.best_game = s.game_slug; }
    userMap.set(s.user_id, existing);
  });

  const userIds = Array.from(userMap.keys());
  if (!userIds.length) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", userIds);

  const profMap = new Map((profiles ?? []).map(p => [p.id, p.username ?? "Anonymous"]));

  return Array.from(userMap.entries())
    .map(([uid, data]) => ({
      rank: 0,
      user_id: uid,
      username: profMap.get(uid) ?? "Anonymous",
      total_xp: data.total_xp,
      games_played: data.games.size,
      best_game: data.best_game,
      avatar_initial: (profMap.get(uid) ?? "A")[0],
      is_current_user: uid === currentUserId,
    }))
    .sort((a, b) => b.total_xp - a.total_xp)
    .slice(0, 50)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}
