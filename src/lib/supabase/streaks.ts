import { createClient } from "./client";

export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  bonusAwarded: boolean;
}> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_played_date")
    .eq("id", userId)
    .single();

  if (!profile) return { currentStreak: 0, longestStreak: 0, bonusAwarded: false };

  const last = profile.last_played_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = profile.current_streak ?? 0;
  let bonusAwarded = false;

  if (last === today) {
    // Already played today — no change
    return {
      currentStreak: newStreak,
      longestStreak: profile.longest_streak ?? 0,
      bonusAwarded: false,
    };
  } else if (last === yesterdayStr) {
    // Consecutive day
    newStreak += 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, profile.longest_streak ?? 0);

  // Award +10 tokens on 7-day streak
  if (newStreak % 7 === 0) {
    bonusAwarded = true;
    // Store bonus in localStorage (token engine handles it)
    if (typeof window !== "undefined") {
      const key = `mindstate-tokens-${userId}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const state = JSON.parse(raw);
          state.tokens = (state.tokens ?? 0) + 10;
          localStorage.setItem(key, JSON.stringify(state));
        }
      } catch {}
    }
  }

  await supabase
    .from("profiles")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_played_date: today,
    })
    .eq("id", userId);

  return { currentStreak: newStreak, longestStreak: newLongest, bonusAwarded };
}

export async function getStreak(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_played_date")
    .eq("id", userId)
    .single();
  return data;
}
