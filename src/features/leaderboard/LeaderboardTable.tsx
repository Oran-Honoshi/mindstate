"use client";
import { motion } from "framer-motion";
import { Trophy, Users, ArrowRight, Crown } from "lucide-react";
import Link from "next/link";
import { GameIcon } from "@/components/icons/GameIcons";
import type { LeaderboardEntry } from "@/lib/supabase/leaderboard";

type FamilyEntry = { user_id: string; username: string; total_xp: number; games_played: number; best_stage_xp: number; rank: number };

function RankCell({ rank }: { rank: number }) {
  const MEDAL_COLORS: Record<number, string> = { 1: "#F59E0B", 2: "#9CA3AF", 3: "#B45309" };
  const color = MEDAL_COLORS[rank];
  return (
    <div style={{ width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
      border: `1px solid ${color ? `${color}50` : "var(--color-border)"}`,
      background: color ? `${color}10` : "var(--color-surface-2)" }}>
      {rank <= 3
        ? <Crown size={13} color={color} />
        : <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>{rank}</span>}
    </div>
  );
}

function PlayerAvatar({ initial, index }: { initial: string; index: number }) {
  const accents = ["var(--color-accent-primary)", "var(--color-accent-secondary)", "#F59E0B", "#9CA3AF"];
  const color = accents[index % accents.length];
  return (
    <div style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, color, fontFamily: "var(--font-mono)", flexShrink: 0 }}>
      {initial.toUpperCase()}
    </div>
  );
}

const COL = "48px 1fr 90px 90px";
const HEADER = ["#", "Player", "XP", "Stages"];

function TableHeader() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: COL, padding: "11px 20px",
      borderBottom: "1px solid var(--color-border)" }}>
      {HEADER.map((h, i) => (
        <p key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", textAlign: i > 1 ? "center" : "left" }}>
          {h}
        </p>
      ))}
    </div>
  );
}

interface GlobalProps { entries: LeaderboardEntry[]; currentUserId?: string; selectedGame: string }
interface FamilyProps { entries: FamilyEntry[]; currentUserId?: string; selectedGame: string }

export function GlobalLeaderboard({ entries, currentUserId, selectedGame }: GlobalProps) {
  if (entries.length === 0) return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <Trophy size={36} color="var(--color-border)" style={{ margin: "0 auto 14px", display: "block" }} />
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 4 }}>No scores yet</p>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16 }}>Be the first to complete a stage!</p>
      <Link href="/games" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px",
        borderRadius: 8, background: "var(--color-accent-primary)", color: "#000", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
        Play Now <ArrowRight size={13} />
      </Link>
    </div>
  );
  return (
    <div>
      <TableHeader />
      {entries.map((entry, i) => (
        <motion.div key={entry.user_id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
          style={{ display: "grid", gridTemplateColumns: COL, alignItems: "center", padding: "13px 20px",
            borderBottom: "0.5px solid var(--color-border)",
            background: entry.is_current_user ? "rgba(0,255,255,0.04)" : "transparent" }}>
          <RankCell rank={entry.rank} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PlayerAvatar initial={entry.avatar_initial} index={i} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
              {entry.username}
              {entry.is_current_user && <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--color-accent-primary)", marginLeft: 8, letterSpacing: "0.06em" }}>YOU</span>}
            </p>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-accent-primary)", textAlign: "center" }}>{entry.total_xp.toLocaleString()}</p>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", fontFamily: "var(--font-mono)" }}>{entry.games_played}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function FamilyLeaderboard({ entries, currentUserId, selectedGame }: FamilyProps) {
  if (entries.length === 0) return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <Trophy size={36} color="var(--color-border)" style={{ margin: "0 auto 14px", display: "block" }} />
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)" }}>No family scores yet</p>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>Be the first in your family to complete a stage!</p>
    </div>
  );
  return (
    <div>
      <TableHeader />
      {entries.map((entry, i) => (
        <motion.div key={entry.user_id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
          style={{ display: "grid", gridTemplateColumns: COL, alignItems: "center", padding: "13px 20px",
            borderBottom: "0.5px solid var(--color-border)",
            background: entry.user_id === currentUserId ? "rgba(0,255,255,0.04)" : "transparent" }}>
          <RankCell rank={entry.rank} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PlayerAvatar initial={entry.username[0] ?? "?"} index={i} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
              {entry.username}
              {entry.user_id === currentUserId && <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--color-accent-primary)", marginLeft: 8, letterSpacing: "0.06em" }}>YOU</span>}
            </p>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-accent-primary)", textAlign: "center" }}>{entry.total_xp.toLocaleString()}</p>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", fontFamily: "var(--font-mono)" }}>{entry.games_played}</p>
        </motion.div>
      ))}
    </div>
  );
}

interface EmptyFamilyProps { isSignedIn: boolean; hasFamilyGroup: boolean }
export function FamilyEmptyState({ isSignedIn, hasFamilyGroup }: EmptyFamilyProps) {
  if (!isSignedIn) return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <Users size={36} color="var(--color-border)" style={{ margin: "0 auto 14px", display: "block" }} />
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 14 }}>Sign in to see your family leaderboard</p>
      <Link href="/auth/signin" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px",
        borderRadius: 8, background: "var(--color-accent-primary)", color: "#000", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
        Sign In <ArrowRight size={13} />
      </Link>
    </div>
  );
  if (!hasFamilyGroup) return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <Users size={36} color="var(--color-border)" style={{ margin: "0 auto 14px", display: "block" }} />
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>No family group yet</p>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16, maxWidth: 300, margin: "0 auto 16px" }}>
        Create or join a family group to compete with your family.
      </p>
      <Link href="/family" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px",
        borderRadius: 8, background: "var(--color-accent-primary)", color: "#000", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
        Set Up Family <ArrowRight size={13} />
      </Link>
    </div>
  );
  return null;
}
