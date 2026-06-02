"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Trash2, Crown, Check, AlertCircle, Gift, ChevronRight, Trophy, Flame } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import {
  createFamilyGroup, getUserFamilyGroup, getFamilyMembers,
  leaveFamilyGroup, deleteFamilyGroup,
} from "@/lib/supabase/family";
import { useRealtimeGoals } from "@/hooks/useRealtimeGoals";
import { CelebrationToast } from "@/components/realtime/CelebrationToast";
import { SparkyImg } from "@/components/ui/SparkyImg";

type Member = {
  id: string; username: string; avatar_url: string | null;
  is_admin: boolean; joined_at: string;
};
type FamilyGroup = {
  id: string; admin_id: string; member_limit: number;
  invite_code: string; name?: string; created_at?: string;
};

export default function FamilyPage() {
  const supabase = createClient();
  const { user, profile } = useAuthStore();
  const [group, setGroup] = useState<FamilyGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // P1 — correct plan gate and member limit
  const isFamilyPlan = profile?.subscription_status === "family_s" || profile?.subscription_status === "family_l";
  const memberLimit = profile?.subscription_status === "family_l" ? 7 : 3;
  const isAdmin = group?.admin_id === user?.id;
  const inviteUrl = group ? `${typeof window !== "undefined" ? window.location.origin : "https://mindelement.app"}/join/${group.invite_code}` : "";

  // P4 — realtime celebrations
  const memberIds = members.map(m => m.id);
  const memberMap = Object.fromEntries(members.map(m => [m.id, m.username]));
  const { latestRecord, clearRecord } = useRealtimeGoals(memberIds, memberMap, user?.id);

  // P5 — use lib functions for data loading
  const loadGroup = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const groupData = await getUserFamilyGroup(user.id) as FamilyGroup | null;
      if (!groupData) { setLoading(false); return; }
      setGroup(groupData);
      const rows = await getFamilyMembers(groupData.id);
      setMembers(rows.map((m: any) => ({
        id: m.user_id,
        username: (m.profiles as any)?.username ?? "Unknown",
        avatar_url: (m.profiles as any)?.avatar_url ?? null,
        is_admin: m.user_id === groupData.admin_id,
        joined_at: m.joined_at,
      })));
    } catch {
      setError("Failed to load family group.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  // P5 — use lib for create
  async function createGroup() {
    if (!user) return;
    try {
      const name = `${profile?.username ?? "My"}'s Family`;
      await createFamilyGroup(name, user.id, memberLimit);
      loadGroup();
    } catch {
      setError("Failed to create group.");
    }
  }

  async function regenerateCode() {
    if (!group || !isAdmin) return;
    setRegenerating(true);
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await supabase.from("family_groups").update({ invite_code: code }).eq("id", group.id);
    await loadGroup();
    setRegenerating(false);
  }

  async function removeMember(memberId: string) {
    if (!group || !isAdmin || memberId === user?.id) return;
    setRemoving(memberId);
    await supabase.from("family_members").delete().eq("group_id", group.id).eq("user_id", memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
    setRemoving(null);
  }

  // P5 — use lib for leave
  async function leaveGroup() {
    if (!group || !user || isAdmin) return;
    await leaveFamilyGroup(group.id, user.id);
    setGroup(null); setMembers([]);
  }

  // P3 — delete group (admin only)
  async function handleDeleteGroup() {
    if (!group || !isAdmin) return;
    await deleteFamilyGroup(group.id);
    setGroup(null); setMembers([]); setShowDeleteConfirm(false);
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // suppress unused warning
  void regenerating;
  void removing;
  void Check;

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: 16 }}>
        <Users size={40} color="var(--color-text-secondary)" />
        <p style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text-secondary)" }}>Sign in to access Family</p>
        <Link href="/auth/signin" style={{ padding: "12px 24px", borderRadius: 14, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", color: "white", fontWeight: 700, textDecoration: "none" }}>
          Sign In
        </Link>
      </div>
    </div>
  );

  if (!isFamilyPlan) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 24, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Users size={32} color="white" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-sans)", marginBottom: 12 }}>Family Plans</h1>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 32 }}>
          Share Mind Element with up to 3 or 7 family members. Each member gets their own profile, scores, and streaks — plus a shared family leaderboard.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 20, padding: "24px 28px", textAlign: "center", minWidth: 180 }}>
            <p style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-sans)" }}>$5</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>/mo · 3 members</p>
            <Link href="/pricing" style={{ display: "block", padding: "10px", borderRadius: 12, background: "var(--color-surface-2)", color: "var(--color-text-secondary)", fontWeight: 700, fontSize: 13, textDecoration: "none", border: "1px solid var(--color-border)" }}>Upgrade</Link>
          </div>
          <div style={{ background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", borderRadius: 20, padding: "24px 28px", textAlign: "center", minWidth: 180 }}>
            <p style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-sans)", color: "white" }}>$10</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>/mo · 7 members</p>
            <Link href="/pricing" style={{ display: "block", padding: "10px", borderRadius: 12, background: "white", color: "var(--color-accent-primary)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Upgrade</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />

      {/* P4 — celebration toast */}
      <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 200, pointerEvents: "none" }}>
        <AnimatePresence>
          {latestRecord && (
            <CelebrationToast key={latestRecord.id} record={latestRecord} onDismiss={clearRecord} />
          )}
        </AnimatePresence>
      </div>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "var(--color-accent-primary)", textTransform: "uppercase", marginBottom: 16 }}>Family</p>
          <h1 style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-sans)", marginBottom: 32 }}>Family Group</h1>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)", fontSize: 13, color: "var(--color-error)", marginBottom: 24 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-secondary)" }}>Loading...</div>
          ) : !group ? (
            <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 24, padding: "48px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <SparkyImg mood="idle" size={80} />
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 0" }}>Start a family group</h2>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 12px", lineHeight: 1.7, maxWidth: 320 }}>
                Create your group and invite family with a link. Everyone gets their own profile and scores.
              </p>
              <button onClick={createGroup}
                style={{ padding: "13px 28px", borderRadius: 14, background: "var(--color-accent-primary)", color: "#000", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                Create Family Group
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>

              {/* Group hero card */}
              <div style={{
                background: "radial-gradient(120% 80% at 50% 0%, rgba(142,124,255,0.1), transparent), var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 16, padding: 18, marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background: "var(--color-surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Users size={22} color="var(--color-violet)" strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--color-text-primary)" }}>
                      {group.name ?? "Family Group"}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: "0.18em",
                      textTransform: "uppercase", color: "var(--color-text-faint)", marginTop: 3,
                    }}>
                      {members.length} of {group.member_limit} seats · Family plan
                    </div>
                  </div>
                </div>
              </div>

              {/* Family leaderboard */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 2px 12px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)" }}>Family leaderboard</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)" }}>This week</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                {[...members].sort((a, b) => b.is_admin ? 1 : -1).map((m, i) => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: 11, borderRadius: 16,
                    background: m.id === user?.id ? "rgba(47,230,224,0.06)" : "var(--color-surface)",
                    border: `1px solid ${m.id === user?.id ? "rgba(47,230,224,0.3)" : "var(--color-border)"}`,
                  }}>
                    <div style={{ width: 20, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--color-text-faint)", textAlign: "center" }}>
                      {i + 1}
                    </div>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                      background: "var(--color-accent-primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color: "var(--color-on-accent)",
                      fontFamily: "var(--font-display)",
                    }}>
                      {m.username[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>
                        {m.username}
                        {m.is_admin && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--color-gold)" }}>Admin</span>}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: m.id === user?.id ? "var(--color-accent-primary)" : "var(--color-text-faint)", marginTop: 2 }}>
                        {m.id === user?.id ? "You" : `Joined ${new Date(m.joined_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                      </div>
                    </div>
                    {isAdmin && !m.is_admin && (
                      <button onClick={() => removeMember(m.id)} disabled={removing === m.id} title="Remove member"
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 10, background: "transparent", border: "0.5px solid rgba(239,68,68,0.2)", color: "var(--color-error)", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: removing === m.id ? 0.5 : 1 }}>
                        <Trash2 size={12} />
                        {removing === m.id ? "Removing..." : "Remove"}
                      </button>
                    )}
                    {!isAdmin && m.id === user?.id && (
                      <button onClick={leaveGroup}
                        style={{ padding: "6px 12px", borderRadius: 10, background: "transparent", border: "0.5px solid var(--color-border)", color: "var(--color-text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Leave
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Invite section (admin only) */}
              {isAdmin && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)", marginBottom: 12 }}>Invite</div>
                  <div
                    onClick={copyInviteLink}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                      padding: 14, borderRadius: 16,
                      background: "var(--color-surface)",
                      border: `1px dashed var(--color-border)`,
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 11, background: "var(--color-surface-2)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Gift size={18} color="var(--color-accent-primary)" strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>
                        Invite {group.member_limit - members.length} more
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)", marginTop: 2 }}>
                        {copied ? "Copied!" : "Share a link · seats included in your plan"}
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--color-text-faint)" />
                  </div>
                </div>
              )}

              {/* Recent wins */}
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)", marginBottom: 12 }}>Recent wins</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {members.slice(0, 3).map((m, i) => {
                  const icons = [Crown, Trophy, Flame] as const;
                  const colors = ["var(--color-gold)", "var(--color-violet)", "#F59E0B"] as const;
                  const WinIcon = icons[i % 3];
                  return (
                    <div key={m.id} style={{
                      display: "flex", alignItems: "center", gap: 11, padding: 12, borderRadius: 16,
                      background: "var(--color-surface)", border: "1px solid var(--color-border)",
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, background: "var(--color-surface-2)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <WinIcon size={16} color={colors[i % 3]} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--color-text-primary)" }}>
                          {m.username} completed a stage
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)", marginTop: 2 }}>
                          Recently
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* P3 — admin delete group */}
              {isAdmin && (
                <div style={{ marginTop: 32 }}>
                  {!showDeleteConfirm ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                        Removing a member frees up their slot. Generate a new invite link to revoke the old one.
                      </p>
                      <button onClick={() => setShowDeleteConfirm(true)}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 10, background: "transparent", border: "0.5px solid rgba(239,68,68,0.2)", color: "var(--color-error)", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, marginLeft: 16 }}>
                        <Trash2 size={12} /> Delete Group
                      </button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: "rgba(239,68,68,0.06)", border: "0.5px solid rgba(239,68,68,0.25)", borderRadius: 16, padding: "18px 20px" }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-error)", marginBottom: 6 }}>Delete this group?</p>
                      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
                        This will remove all members and delete the group. This cannot be undone.
                      </p>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setShowDeleteConfirm(false)}
                          style={{ flex: 1, padding: "9px", borderRadius: 10, background: "var(--color-surface)", border: "0.5px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                          Cancel
                        </button>
                        <button onClick={handleDeleteGroup}
                          style={{ flex: 1, padding: "9px", borderRadius: 10, background: "var(--color-error)", border: "none", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          Yes, Delete Group
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
