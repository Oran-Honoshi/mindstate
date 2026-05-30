export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  lang_pref: string;
  is_silent_mode: boolean;
  subscription_status: "free" | "individual" | "family_s" | "family_l";
  created_at: string;
  current_streak?: number | null;
  longest_streak?: number | null;
  last_played_date?: string | null;
}

export interface Score {
  id: string;
  user_id: string;
  game_slug: string;
  stage_number: number;
  difficulty: string;
  xp_earned: number;
  time_taken: number;
  hints_used: number;
  completed_at: string;
}

export interface FamilyGroup {
  id: string;
  admin_id: string;
  name: string;
  member_limit: number;
  invite_code: string;
  created_at: string;
}
