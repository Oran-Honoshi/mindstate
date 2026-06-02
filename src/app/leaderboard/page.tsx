"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/nav/AppHeader";
import { GameIcon } from "@/components/icons/GameIcons";
import { useAuthStore } from "@/store/authStore";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/supabase/leaderboard";
import { getUserFamilyGroup, getFamilyLeaderboard } from "@/lib/supabase/family";
import { GlobalLeaderboard, FamilyLeaderboard, FamilyEmptyState } from "@/features/leaderboard/LeaderboardTable";
import { SparkyImg } from "@/components/ui/SparkyImg";

const GAMES = [
  { slug:"all", name:"All Games" }, { slug:"tango", name:"Tango" },
  { slug:"memory", name:"Memory" }, { slug:"queens", name:"Queens" },
  { slug:"sudoku", name:"Mini Sudoku" }, { slug:"zip", name:"Zip" },
  { slug:"minesweeper", name:"Minesweeper" },
];

type FamilyEntry = { user_id: string; username: string; total_xp: number; games_played: number; best_stage_xp: number; rank: number };

export default function LeaderboardPage() {
  const { user, profile } = useAuthStore();
  const [tab, setTab]               = useState<"global"|"family">("global");
  const [selectedGame, setGame]     = useState("all");
  const [globalEntries, setGlobal]  = useState<LeaderboardEntry[]>([]);
  const [familyEntries, setFamily]  = useState<FamilyEntry[]>([]);
  const [familyGroupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        if (tab === "family" && user) {
          const group = await getUserFamilyGroup(user.id);
          if (!group) { setGroupId(null); setFamily([]); }
          else {
            const g = (Array.isArray(group) ? group[0] : group) as { id: string };
            setGroupId(g.id);
            setFamily(await getFamilyLeaderboard(g.id, selectedGame));
          }
        } else {
          const entries = await fetchLeaderboard(selectedGame, "all", user?.id);
          setGlobal(entries);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [selectedGame, tab, user]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <AppHeader />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "76px 16px 48px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--color-text-primary)",
            letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: 0 }}>Leaderboard</h1>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)", marginTop: 6 }}>
            Your figure and level by your name
          </div>
        </motion.div>

        {/* Global / Family tabs */}
        <div style={{ display: "flex", gap: 3, marginBottom: 18, background: "var(--color-surface-2)", padding: 3, borderRadius: 11 }}>
          {[{ key:"global", label:"Global" }, { key:"family", label:"Family" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as "global"|"family")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: tab === t.key ? "var(--color-surface-2)" : "transparent",
                color: tab === t.key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                transition: "all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Game filter chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 5, overflowX: "auto", flex: 1 }}>
            {GAMES.map(g => (
              <button key={g.slug} onClick={() => setGame(g.slug)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 6,
                  border: "1px solid", cursor: "pointer", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                  background: selectedGame === g.slug ? "var(--color-accent-primary)" : "var(--color-surface)",
                  borderColor: selectedGame === g.slug ? "var(--color-accent-primary)" : "var(--color-border)",
                  color: selectedGame === g.slug ? "var(--color-on-accent)" : "var(--color-text-secondary)",
                  transition: "all 0.12s" }}>
                {g.slug !== "all" && <GameIcon slug={g.slug} size={14} />}
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="ms-card" style={{ overflow: "hidden", padding: 0 }}>
          {loading ? (
            <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ height: 52, borderRadius: 6, background: "var(--color-surface-2)" }} />)}
            </div>
          ) : tab === "family" ? (
            (user && familyGroupId)
              ? <FamilyLeaderboard entries={familyEntries} currentUserId={user.id} selectedGame={selectedGame} />
              : <FamilyEmptyState isSignedIn={!!user} hasFamilyGroup={!!familyGroupId} />
          ) : globalEntries.length === 0 ? (
            <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <SparkyImg mood="resting" size={76} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", textAlign: "center", margin: 0 }}>
                No scores yet. Be the first!
              </p>
            </div>
          ) : (
            <GlobalLeaderboard entries={globalEntries} currentUserId={user?.id} selectedGame={selectedGame} />
          )}
        </div>

        {!user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ marginTop: 20, padding: "18px 20px", borderRadius: 10,
              border: "1px solid var(--color-border)", background: "var(--color-surface)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 3 }}>Join the competition</p>
              <p style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Create a free account to appear on the leaderboard.</p>
            </div>
            <Link href="/auth/signup" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px",
              borderRadius: 8, background: "var(--color-accent-primary)", color: "#000",
              fontWeight: 700, fontSize: 12, textDecoration: "none", flexShrink: 0 }}>
              Sign Up Free <ArrowRight size={13} />
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
