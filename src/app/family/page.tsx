// src/app/family/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Copy, RefreshCw, Trash2, Crown, Check, Link as LinkIcon, UserPlus, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";

type Member = {
  id: string;
  username: string;
  avatar_url: string | null;
  is_admin: boolean;
  joined_at: string;
};

type FamilyGroup = {
  id: string;
  admin_id: string;
  member_limit: number;
  invite_code: string;
  created_at: string;
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

  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;
  const isFamilyPlan = profile?.subscription_status === "family";
  const isAdmin = group?.admin_id === user?.id;
  const inviteUrl = group ? `${typeof window !== "undefined" ? window.location.origin : "https://mindelement.app"}/join/${group.invite_code}` : "";

  const loadGroup = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Check if user is in a family group (as admin or member)
      const { data: memberRow } = await supabase
        .from("family_members")
        .select("group_id")
        .eq("user_id", user.id)
        .single();

      if (!memberRow) { setLoading(false); return; }

      const { data: groupData } = await supabase
        .from("family_groups")
        .select("*")
        .eq("id", memberRow.group_id)
        .single();

      if (!groupData) { setLoading(false); return; }
      setGroup(groupData);

      // Load all members
      const { data: membersData } = await supabase
        .from("family_members")
        .select("user_id, joined_at, profiles(id, username, avatar_url)")
        .eq("group_id", groupData.id);

      if (membersData) {
        setMembers(membersData.map((m: any) => ({
          id: m.user_id,
          username: m.profiles?.username ?? "Unknown",
          avatar_url: m.profiles?.avatar_url ?? null,
          is_admin: m.user_id === groupData.admin_id,
          joined_at: m.joined_at,
        })));
      }
    } catch (e) {
      setError("Failed to load family group.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  async function createGroup() {
    if (!user) return;
    const limit = 3; // Set by Paddle webhook when creating group
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { data, error } = await supabase
      .from("family_groups")
      .insert({ admin_id: user.id, member_limit: limit, invite_code: code })
      .select()
      .single();
    if (error || !data) { setError("Failed to create group."); return; }
    // Add admin as first member
    await supabase.from("family_members").insert({ group_id: data.id, user_id: user.id });
    loadGroup();
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

  async function leaveGroup() {
    if (!group || !user || isAdmin) return;
    await supabase.from("family_members").delete().eq("group_id", group.id).eq("user_id", user.id);
    setGroup(null);
    setMembers([]);
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
          Share MindElement with up to 3 or 7 family members. Each member gets their own profile, scores, and streaks — plus a shared family leaderboard.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 20, padding: "24px 28px", textAlign: "center", minWidth: 180 }}>
            <p style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>$5</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>/mo · 3 members</p>
            <Link href="/pricing" style={{ display: "block", padding: "10px", borderRadius: 12, background: "var(--color-surface-2)", color: "var(--color-text-secondary)", fontWeight: 700, fontSize: 13, textDecoration: "none", border: "1px solid var(--color-border)" }}>
              Upgrade
            </Link>
          </div>
          <div style={{ background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", borderRadius: 20, padding: "24px 28px", textAlign: "center", minWidth: 180 }}>
            <p style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-sans)", color: "white" }}>$10</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>/mo · 7 members</p>
            <Link href="/pricing" style={{ display: "block", padding: "10px", borderRadius: 12, background: "white", color: "var(--color-accent-primary)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
              Upgrade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px 60px" }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "var(--cyan)", textTransform: "uppercase", marginBottom: 16 }}>Family</p>
          <h1 style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-sans)", marginBottom: 32 }}>Family Group</h1>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)", fontSize: 13, color: "var(--color-error)", marginBottom: 24 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-secondary)" }}>Loading...</div>
          ) : !group ? (
            /* No group yet — create one */
            <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 24, padding: "40px", textAlign: "center" }}>
              <UserPlus size={40} color="var(--color-text-secondary)" style={{ margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Create your family group</h2>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 24, lineHeight: 1.7 }}>
                You have a {"family"} family plan.
                Create your group and invite your family with a link.
              </p>
              <button onClick={createGroup}
                style={{ padding: "13px 28px", borderRadius: 14, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                Create Family Group
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Members count */}
              <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 20, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={20} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {members.length} / {group.member_limit} members
                    </p>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                      {group.member_limit - members.length} slot{group.member_limit - members.length !== 1 ? "s" : ""} remaining
                    </p>
                  </div>
                </div>
                {/* Slot indicators */}
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: group.member_limit }).map((_, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < members.length ? "var(--color-accent-primary)" : "var(--color-border)" }} />
                  ))}
                </div>
              </div>

              {/* Invite link — only show if slots available */}
              {isAdmin && (
                <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 20, padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <LinkIcon size={16} color="var(--color-text-secondary)" />
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)" }}>Invite Link</p>
                    {members.length >= group.member_limit && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "var(--color-error)" }}>Group Full</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ flex: 1, padding: "10px 14px", borderRadius: 12, background: "var(--color-surface-2)", border: "0.5px solid var(--color-border)", fontSize: 13, color: "var(--color-text-secondary)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {inviteUrl}
                    </div>
                    <button onClick={copyInviteLink}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, background: copied ? "#22C55E" : "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", border: "none", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s" }}>
                      {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Link</>}
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                      Share this link with family members. They'll need a MindElement account to join.
                    </p>
                    <button onClick={regenerateCode} disabled={regenerating}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 10, background: "transparent", border: "0.5px solid var(--color-border)", color: "var(--color-text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <RefreshCw size={12} className={regenerating ? "spin" : ""} />
                      {regenerating ? "Regenerating..." : "New Link"}
                    </button>
                  </div>
                </div>
              )}

              {/* Members list */}
              <div style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 20, overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "0.5px solid var(--color-border)" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)" }}>Members</p>
                </div>
                <AnimatePresence>
                  {members
                    .sort((a, b) => (b.is_admin ? 1 : 0) - (a.is_admin ? 1 : 0))
                    .map((member) => (
                    <motion.div key={member.id}
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "0.5px solid var(--color-border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>
                          {member.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{member.username}</p>
                            {member.is_admin && (
                              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 6, background: "rgba(245,158,11,0.12)", color: "#D97706" }}>
                                <Crown size={9} /> Admin
                              </span>
                            )}
                            {member.id === user?.id && !member.is_admin && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 6, background: "var(--color-surface-2)", color: "var(--color-text-secondary)" }}>You</span>
                            )}
                          </div>
                          <p style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                            Joined {new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      {/* Remove button — admin only, can't remove self */}
                      {isAdmin && !member.is_admin && (
                        <button onClick={() => removeMember(member.id)}
                          disabled={removing === member.id}
                          title="Remove member"
                          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 10, background: "transparent", border: "0.5px solid rgba(239,68,68,0.2)", color: "var(--color-error)", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: removing === member.id ? 0.5 : 1 }}>
                          <Trash2 size={12} />
                          {removing === member.id ? "Removing..." : "Remove"}
                        </button>
                      )}
                      {/* Leave button — non-admin members */}
                      {!isAdmin && member.id === user?.id && (
                        <button onClick={leaveGroup}
                          style={{ padding: "6px 12px", borderRadius: 10, background: "transparent", border: "0.5px solid var(--color-border)", color: "var(--color-text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          Leave
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Note for admin */}
              {isAdmin && (
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", lineHeight: 1.6 }}>
                  Removing a member frees up their slot. Generate a new invite link to revoke the old one.
                </p>
              )}

            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}