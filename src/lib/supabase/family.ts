import { createClient } from "./client";

export async function createFamilyGroup(name: string, userId: string, memberLimit: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("family_groups")
    .insert({ admin_id: userId, name, member_limit: memberLimit })
    .select()
    .single();
  if (error) throw error;
  // Auto-join as admin
  await supabase.from("family_members").insert({ group_id: data.id, user_id: userId });
  return data;
}

export async function joinFamilyGroup(inviteCode: string, userId: string) {
  const supabase = createClient();
  const { data: group, error } = await supabase
    .from("family_groups")
    .select("*, family_members(count)")
    .eq("invite_code", inviteCode.trim().toLowerCase())
    .single();
  if (error || !group) throw new Error("Invalid invite code");
  const memberCount = group.family_members?.[0]?.count ?? 0;
  if (memberCount >= group.member_limit) throw new Error("This group is full");
  const { error: joinError } = await supabase
    .from("family_members")
    .insert({ group_id: group.id, user_id: userId });
  if (joinError) throw new Error("Already a member or error joining");
  return group;
}

export async function getUserFamilyGroup(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("family_members")
    .select("group_id, family_groups(id, name, admin_id, member_limit, invite_code)")
    .eq("user_id", userId)
    .limit(1)
    .single();
  return data?.family_groups ?? null;
}

export async function getFamilyMembers(groupId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("family_members")
    .select("user_id, joined_at, profiles(username, avatar_url, subscription_status)")
    .eq("group_id", groupId);
  return data ?? [];
}

export async function getFamilyLeaderboard(groupId: string, gameSlug?: string) {
  const supabase = createClient();
  const members = await getFamilyMembers(groupId);
  const memberIds = members.map((m: any) => m.user_id);
  if (!memberIds.length) return [];

  let query = supabase
    .from("scores")
    .select("user_id, xp_earned, game_slug, stage_number, completed_at")
    .in("user_id", memberIds);
  if (gameSlug && gameSlug !== "all") query = query.eq("game_slug", gameSlug);

  const { data: scores } = await query;
  if (!scores) return [];

  const map = new Map<string, { total_xp: number; games: Set<string>; best_stage: number }>();
  scores.forEach((s: any) => {
    const e = map.get(s.user_id) ?? { total_xp: 0, games: new Set(), best_stage: 0 };
    e.total_xp += s.xp_earned;
    e.games.add(s.game_slug);
    if (s.xp_earned > e.best_stage) e.best_stage = s.xp_earned;
    map.set(s.user_id, e);
  });

  const profMap = new Map(members.map((m: any) => [m.user_id, (m.profiles as any)?.username ?? "Member"]));

  return Array.from(map.entries())
    .map(([uid, d]) => ({
      user_id: uid,
      username: profMap.get(uid) ?? "Member",
      total_xp: d.total_xp,
      games_played: d.games.size,
      best_stage_xp: d.best_stage,
    }))
    .sort((a, b) => b.total_xp - a.total_xp)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export async function leaveFamilyGroup(groupId: string, userId: string) {
  const supabase = createClient();
  await supabase.from("family_members")
    .delete().eq("group_id", groupId).eq("user_id", userId);
}

export async function deleteFamilyGroup(groupId: string) {
  const supabase = createClient();
  await supabase.from("family_members").delete().eq("group_id", groupId);
  await supabase.from("family_groups").delete().eq("id", groupId);
}
