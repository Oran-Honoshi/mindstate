"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, Zap, Crown, Users, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { GameIcon } from "@/components/icons/GameIcons";

const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";

const GAMES = [
  { slug:"all",          name:"All Games"   },
  { slug:"tango",        name:"Tango"       },
  { slug:"memory",       name:"Memory"      },
  { slug:"queens",       name:"Queens"      },
  { slug:"sudoku",       name:"Mini Sudoku" },
  { slug:"zip",          name:"Zip"         },
  { slug:"minesweeper",  name:"Minesweeper" },
];

const PERIODS = [
  { key:"all",   label:"All Time" },
  { key:"week",  label:"This Week" },
  { key:"today", label:"Today"    },
];

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  total_xp: number;
  games_played: number;
  best_game: string;
  avatar_initial: string;
  is_current_user: boolean;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#FDE68A,#F59E0B)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(245,158,11,0.35)" }}>
      <Crown size={15} color="white"/>
    </div>
  );
  if (rank === 2) return (
    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#CBD5E1,#94A3B8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Medal size={15} color="white"/>
    </div>
  );
  if (rank === 3) return (
    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#FED7AA,#C2410C)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Medal size={15} color="white"/>
    </div>
  );
  return (
    <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--bg2)", display:"flex", alignItems:"center", justifyContent:"center", border:"0.5px solid var(--border2)" }}>
      <span style={{ fontSize:12, fontWeight:700, color:"var(--text4)" }}>{rank}</span>
    </div>
  );
}

function Avatar({ initial, index }: { initial: string; index: number }) {
  const colors = ["linear-gradient(135deg,#4F6EF7,#7C4FD4)","linear-gradient(135deg,#7C9E87,#4A7C59)","linear-gradient(135deg,#C4785A,#A0522D)","linear-gradient(135deg,#4DB6AC,#0D9488)","linear-gradient(135deg,#E87070,#C04040)"];
  return (
    <div style={{ width:36, height:36, borderRadius:"50%", background:colors[index%colors.length], display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"white", flexShrink:0 }}>
      {initial.toUpperCase()}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user, profile } = useAuthStore();
  const [tab, setTab] = useState<"global"|"family">("global");
  const [selectedGame, setSelectedGame] = useState("all");
  const [period, setPeriod] = useState("all");
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userXP, setUserXP] = useState<number>(0);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGame, period, tab, user]);

  async function fetchLeaderboard() {
    setLoading(true);
    const supabase = createClient();

    try {
      let query = supabase
        .from("scores")
        .select("user_id, xp_earned, game_slug, stage_number, completed_at");

      if (selectedGame !== "all") query = query.eq("game_slug", selectedGame);

      if (period === "today") {
        const today = new Date(); today.setHours(0,0,0,0);
        query = query.gte("completed_at", today.toISOString());
      } else if (period === "week") {
        const week = new Date(); week.setDate(week.getDate() - 7);
        query = query.gte("completed_at", week.toISOString());
      }

      const { data: scores } = await query;
      if (!scores) { setLoading(false); return; }

      const userMap = new Map<string, { total_xp:number; games:Set<string>; best_game:string; best_xp:number }>();
      scores.forEach(s => {
        const existing = userMap.get(s.user_id) ?? { total_xp:0, games:new Set(), best_game:s.game_slug, best_xp:0 };
        existing.total_xp += s.xp_earned;
        existing.games.add(s.game_slug);
        if (s.xp_earned > existing.best_xp) { existing.best_xp = s.xp_earned; existing.best_game = s.game_slug; }
        userMap.set(s.user_id, existing);
      });

      const userIds = Array.from(userMap.keys());
      if (!userIds.length) { setGlobalEntries([]); setLoading(false); return; }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      const profMap = new Map((profiles ?? []).map(p => [p.id, p.username ?? "Anonymous"]));

      const entries: LeaderboardEntry[] = Array.from(userMap.entries())
        .map(([uid, data]) => ({
          rank: 0,
          user_id: uid,
          username: profMap.get(uid) ?? "Anonymous",
          total_xp: data.total_xp,
          games_played: data.games.size,
          best_game: data.best_game,
          avatar_initial: (profMap.get(uid) ?? "A")[0],
          is_current_user: uid === user?.id,
        }))
        .sort((a,b) => b.total_xp - a.total_xp)
        .slice(0, 50)
        .map((e, i) => ({ ...e, rank: i+1 }));

      setGlobalEntries(entries);

      const myEntry = entries.find(e => e.is_current_user);
      if (myEntry) { setUserRank(myEntry.rank); setUserXP(myEntry.total_xp); }

    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="leaderboard-page" style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar/>
      <main style={{ maxWidth:760, margin:"0 auto", padding:"76px 16px 48px" }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text4)", marginBottom:8 }}>Rankings</p>
          <h1 style={{ fontSize:36, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:6 }}>
            Leaderboard
          </h1>
          <p style={{ fontSize:14, color:"var(--text3)" }}>See how you stack up against players worldwide.</p>
        </motion.div>

        {/* User's own rank card */}
        {user && userRank && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            style={{ background:ACCENT, borderRadius:20, padding:"18px 22px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", color:"white" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700 }}>
                {(profile?.username ?? "Y")[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize:12, opacity:0.75, marginBottom:2 }}>Your ranking</p>
                <p style={{ fontSize:18, fontWeight:700 }}>{profile?.username ?? "You"}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:24 }}>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:22, fontWeight:700 }}>#{userRank}</p>
                <p style={{ fontSize:10, opacity:0.7 }}>Global rank</p>
              </div>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:22, fontWeight:700 }}>{userXP.toLocaleString()}</p>
                <p style={{ fontSize:10, opacity:0.7 }}>Total XP</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:20, background:"var(--bg3)", padding:4, borderRadius:14 }}>
          {[
            { key:"global", label:"Global", icon:Globe },
            { key:"family", label:"Family", icon:Users },
          ].map(t => (
            <button key={t.key} onClick={()=>setTab(t.key as any)}
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                padding:"10px 16px", borderRadius:10, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
                background:tab===t.key?"var(--surface)":"transparent",
                color:tab===t.key?"var(--text1)":"var(--text4)",
                boxShadow:tab===t.key?"0 2px 8px rgba(0,0,0,0.12)":"none",
                transition:"all 0.2s",
              }}>
              <t.icon size={14}/> {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:6, overflowX:"auto", flex:1 }}>
            {GAMES.map(g => (
              <button key={g.slug} onClick={()=>setSelectedGame(g.slug)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:10,
                  border:"0.5px solid", cursor:"pointer", fontSize:12, fontWeight:500, whiteSpace:"nowrap",
                  background:selectedGame===g.slug?"var(--surface)":"transparent",
                  borderColor:selectedGame===g.slug?"rgba(79,110,247,0.3)":"var(--border2)",
                  color:selectedGame===g.slug?"#4F6EF7":"var(--text3)",
                  boxShadow:selectedGame===g.slug?"0 2px 6px rgba(79,110,247,0.12)":"none",
                }}>
                {g.slug!=="all"&&<GameIcon slug={g.slug} size={16}/>}
                {g.name}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:4, background:"var(--bg3)", padding:3, borderRadius:10 }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={()=>setPeriod(p.key)}
                style={{ padding:"6px 10px", borderRadius:8, border:"none", cursor:"pointer",
                  fontSize:11, fontWeight:600,
                  background:period===p.key?"var(--surface)":"transparent",
                  color:period===p.key?"var(--text1)":"var(--text4)",
                  transition:"all 0.15s",
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard list */}
        <div className="ms-card" style={{ overflow:"hidden", padding:0 }}>
          {loading ? (
            <div style={{ padding:"48px 24px", textAlign:"center" }}>
              <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                {[1,2,3,4,5].map(i=>(
                  <div key={i} style={{ height:60, width:680, maxWidth:"100%", background:"var(--bg2)", borderRadius:12 }}/>
                ))}
              </div>
            </div>
          ) : tab === "family" ? (
            <div style={{ padding:"48px 24px", textAlign:"center" }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(79,110,247,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <Users size={24} color="#4F6EF7"/>
              </div>
              <p style={{ fontSize:16, fontWeight:600, color:"var(--text1)", marginBottom:6 }}>Family Leaderboard</p>
              <p style={{ fontSize:13, color:"var(--text3)", marginBottom:20, maxWidth:320, margin:"0 auto 20px" }}>
                Create or join a family group to see how you rank against your family members.
              </p>
              <Link href="/settings" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, background:ACCENT, color:"white", textDecoration:"none", fontSize:13, fontWeight:600 }}>
                Set Up Family Group <ArrowRight size={14}/>
              </Link>
            </div>
          ) : globalEntries.length === 0 ? (
            <div style={{ padding:"48px 24px", textAlign:"center" }}>
              <Trophy size={40} color="var(--border2)" style={{ margin:"0 auto 16px", display:"block" }}/>
              <p style={{ fontSize:15, fontWeight:600, color:"var(--text4)", marginBottom:4 }}>No scores yet</p>
              <p style={{ fontSize:13, color:"var(--text4)" }}>Be the first to complete a stage!</p>
              <Link href="/games" style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:16, padding:"10px 20px", borderRadius:12, background:ACCENT, color:"white", textDecoration:"none", fontSize:13, fontWeight:600 }}>
                Play Now <ArrowRight size={14}/>
              </Link>
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div style={{ display:"grid", gridTemplateColumns:"48px 1fr 100px 80px 80px", gap:0, padding:"12px 20px", borderBottom:"0.5px solid var(--border)" }}>
                {["#","Player","Best Game","XP","Stages"].map((h,i)=>(
                  <p key={i} style={{ fontSize:10, fontWeight:700, color:"var(--text4)", letterSpacing:"0.1em", textTransform:"uppercase", textAlign:i>1?"center":"left" }}>{h}</p>
                ))}
              </div>
              {globalEntries.map((entry, i) => (
                <motion.div key={entry.user_id}
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:i*0.03 }}
                  style={{
                    display:"grid", gridTemplateColumns:"48px 1fr 100px 80px 80px",
                    alignItems:"center", padding:"14px 20px",
                    borderBottom:"0.5px solid var(--border)",
                    background:entry.is_current_user?"linear-gradient(90deg,rgba(79,110,247,0.06),transparent)":"transparent",
                  }}>
                  <RankBadge rank={entry.rank}/>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar initial={entry.avatar_initial} index={i}/>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:"var(--text1)" }}>
                        {entry.username}
                        {entry.is_current_user&&<span style={{ fontSize:10, color:"#4F6EF7", marginLeft:6, fontWeight:500 }}>you</span>}
                      </p>
                    </div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"center" }}>
                    <GameIcon slug={entry.best_game} size={22}/>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#4F6EF7" }}>{entry.total_xp.toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:13, fontWeight:500, color:"var(--text3)" }}>{entry.games_played}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* CTA for non-signed-in users */}
        {!user && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            style={{ marginTop:24, background:ACCENT, borderRadius:20, padding:"24px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:16, fontWeight:700, color:"white", marginBottom:4 }}>Join the competition</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)" }}>Create a free account to save your scores and appear on the leaderboard.</p>
            </div>
            <Link href="/auth/signup" style={{ padding:"11px 22px", borderRadius:14, background:"white", color:"#4F6EF7", fontWeight:700, fontSize:13, textDecoration:"none", flexShrink:0 }}>
              Sign Up Free
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
