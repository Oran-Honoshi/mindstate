"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { GameIcon } from "@/components/icons/GameIcons";
import { useAuthStore } from "@/store/authStore";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/supabase/leaderboard";
import { getUserFamilyGroup, getFamilyLeaderboard } from "@/lib/supabase/family";
import { GlobalLeaderboard, FamilyLeaderboard, FamilyEmptyState } from "@/features/leaderboard/LeaderboardTable";

const GAMES = [
  { slug:"all", name:"All Games" }, { slug:"tango", name:"Tango" },
  { slug:"memory", name:"Memory" }, { slug:"queens", name:"Queens" },
  { slug:"sudoku", name:"Mini Sudoku" }, { slug:"zip", name:"Zip" },
  { slug:"minesweeper", name:"Minesweeper" },
];
const PERIODS = [{ key:"all", label:"All Time" }, { key:"week", label:"This Week" }, { key:"today", label:"Today" }];

type FamilyEntry = { user_id: string; username: string; total_xp: number; games_played: number; best_stage_xp: number; rank: number };

export default function LeaderboardPage() {
  const { user, profile } = useAuthStore();
  const [tab, setTab]               = useState<"global"|"family">("global");
  const [selectedGame, setGame]     = useState("all");
  const [period, setPeriod]         = useState("all");
  const [globalEntries, setGlobal]  = useState<LeaderboardEntry[]>([]);
  const [familyEntries, setFamily]  = useState<FamilyEntry[]>([]);
  const [familyGroupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [userRank, setUserRank]     = useState<number | null>(null);
  const [userXP, setUserXP]         = useState(0);

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
          const entries = await fetchLeaderboard(selectedGame, period, user?.id);
          setGlobal(entries);
          const mine = entries.find(e => e.is_current_user);
          if (mine) { setUserRank(mine.rank); setUserXP(mine.total_xp); }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [selectedGame, period, tab, user]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <Navbar />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "76px 16px 48px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>RANKINGS</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text-primary)",
            letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: 6 }}>Leaderboard</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>See how you rank against players worldwide.</p>
        </motion.div>

        {/* Your rank strip */}
        {user && userRank && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ padding: "16px 20px", borderRadius: 10, marginBottom: 20,
              background: "var(--color-surface)", border: "1px solid var(--color-accent-primary)",
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
              {profile?.username ?? "You"}
            </p>
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-accent-primary)" }}>#{userRank}</p>
                <p style={{ fontSize: 9, letterSpacing: "0.08em", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>RANK</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-accent-primary)" }}>{userXP.toLocaleString()}</p>
                <p style={{ fontSize: 9, letterSpacing: "0.08em", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>XP</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Global / Family tabs */}
        <div style={{ display: "flex", gap: 3, marginBottom: 18, background: "var(--color-surface-2)", padding: 3, borderRadius: 10 }}>
          {[{ key:"global", label:"Global", Icon:Globe }, { key:"family", label:"Family", Icon:Users }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as "global"|"family")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: tab === t.key ? "var(--color-surface)" : "transparent",
                color: tab === t.key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                transition: "all 0.15s" }}>
              <t.Icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Game + period filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 5, overflowX: "auto", flex: 1 }}>
            {GAMES.map(g => (
              <button key={g.slug} onClick={() => setGame(g.slug)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 6,
                  border: "1px solid", cursor: "pointer", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                  background: selectedGame === g.slug ? "rgba(0,255,255,0.06)" : "transparent",
                  borderColor: selectedGame === g.slug ? "rgba(0,255,255,0.3)" : "var(--color-border)",
                  color: selectedGame === g.slug ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
                  transition: "all 0.12s" }}>
                {g.slug !== "all" && <GameIcon slug={g.slug} size={14} />}
                {g.name}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 3, background: "var(--color-surface-2)", padding: 3, borderRadius: 8 }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                style={{ padding: "5px 9px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600,
                  background: period === p.key ? "var(--color-surface)" : "transparent",
                  color: period === p.key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  fontFamily: "var(--font-mono)", letterSpacing: "0.04em", transition: "all 0.12s" }}>
                {p.label}
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
