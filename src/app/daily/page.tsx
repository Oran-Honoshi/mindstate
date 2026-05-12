"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar, ChevronRight, Check, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { GameIcon } from "@/components/icons/GameIcons";
import { GameSnapshot } from "@/components/ui/GameSnapshots";
import { useAuthStore } from "@/store/authStore";
import {
  DAILY_GAMES, getTodaysFeaturedGame, getDailyDate,
  isDailyCompleted, formatTimeUntilReset, getDailyStageNumber,
  type GameSlug,
} from "@/lib/games/dailyChallenge";
import { getStreak } from "@/lib/supabase/streaks";

const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";

const GAME_NAMES: Record<string, string> = {
  tango:"Tango", memory:"Memory", queens:"Queens", sudoku:"Mini Sudoku",
  zip:"Zip", minesweeper:"Minesweeper", flow:"Flow", nonogram:"Nonogram",
  bridges:"Bridges", "pattern-match":"Pattern Match", "2048-pro":"2048 Pro",
  kakuro:"Kakuro", "gravity-sort":"Gravity Sort", "hex-merge":"Hex Merge",
  "logic-path":"Logic Path", lightup:"Light Up", patches:"Patches",
  "word-sling":"Word Sling", hearts:"Hearts", solitaire:"Solitaire",
};

const GAME_COLORS: Record<string, { from: string; to: string }> = {
  tango:          { from:"#4F6EF7", to:"#9C6BE8" },
  memory:         { from:"#059669", to:"#3B82F6" },
  queens:         { from:"#D97706", to:"#EF4444" },
  sudoku:         { from:"#DC2626", to:"#B91C1C" },
  zip:            { from:"#0D9488", to:"#0891B2" },
  minesweeper:    { from:"#991B1B", to:"#DC2626" },
  flow:           { from:"#15803D", to:"#0D9488" },
  nonogram:       { from:"#BE185D", to:"#7C3AED" },
  bridges:        { from:"#B45309", to:"#D97706" },
  "pattern-match":{ from:"#7C3AED", to:"#4F6EF7" },
  kakuro:         { from:"#1D4ED8", to:"#0891B2" },
  "gravity-sort": { from:"#C2410C", to:"#D97706" },
  "logic-path":   { from:"#0891B2", to:"#0D9488" },
  lightup:        { from:"#CA8A04", to:"#D97706" },
  "word-sling":   { from:"#047857", to:"#0D9488" },
};

export default function DailyPage() {
  const { user, profile } = useAuthStore();
  const [countdown, setCountdown] = useState("00:00:00");
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const todayFeatured = getTodaysFeaturedGame();
  const today = getDailyDate();

  useEffect(() => {
    // Countdown timer
    const iv = setInterval(() => setCountdown(formatTimeUntilReset()), 1000);
    setCountdown(formatTimeUntilReset());
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!user) return;
    // Check which dailies are completed
    const done = new Set<string>();
    DAILY_GAMES.forEach(game => {
      if (isDailyCompleted(game, user.id)) done.add(game);
    });
    setCompletedToday(done);
    // Load streak
    getStreak(user.id).then(data => {
      if (data) setStreak(data.current_streak ?? 0);
    });
  }, [user]);

  const completedCount = completedToday.size;
  const totalGames = DAILY_GAMES.length;
  const featuredCompleted = completedToday.has(todayFeatured);
  const gc = GAME_COLORS[todayFeatured] ?? { from:"#4F6EF7", to:"#9C6BE8" };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar/>
      <main style={{ maxWidth:760, margin:"0 auto", padding:"76px 20px 60px" }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <Calendar size={18} color="#4F6EF7"/>
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text4)" }}>
              Daily Challenge · {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            </p>
          </div>
          <h1 style={{ fontSize:36, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:6 }}>
            Today's Challenges
          </h1>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <p style={{ fontSize:14, color:"var(--text3)" }}>
              {completedCount}/{totalGames} completed today
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20,
              background:"rgba(245,158,11,0.1)", border:"0.5px solid rgba(245,158,11,0.2)" }}>
              <Flame size={13} color="#F59E0B" fill="#F59E0B"/>
              <span style={{ fontSize:12, fontWeight:700, color:"#B45309" }}>{streak} day streak</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <Clock size={12} color="var(--text4)"/>
              <span style={{ fontSize:12, color:"var(--text4)", fontFamily:"monospace" }}>Resets in {countdown}</span>
            </div>
          </div>
        </motion.div>

        {/* Progress bar */}
        <div style={{ background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"20px 24px", marginBottom:24, boxShadow:"var(--shadow-sm)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <p style={{ fontSize:13, fontWeight:600, color:"var(--text2)" }}>Daily Progress</p>
            <p style={{ fontSize:13, fontWeight:700, color:"#4F6EF7" }}>{Math.round((completedCount/totalGames)*100)}%</p>
          </div>
          <div style={{ height:8, background:"var(--bg3)", borderRadius:4, overflow:"hidden" }}>
            <motion.div
              animate={{ width:`${(completedCount/totalGames)*100}%` }}
              transition={{ duration:0.8, ease:"easeOut" }}
              style={{ height:"100%", borderRadius:4, background:ACCENT }}/>
          </div>
          <p style={{ fontSize:11, color:"var(--text4)", marginTop:8 }}>
            Daily challenges don't cost plays — free for everyone, every day
          </p>
        </div>

        {/* Featured game — big card */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:600, color:"var(--text4)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>
            Featured Today
          </p>
          <Link href={`/games/${todayFeatured}?daily=1`} style={{ display:"block", textDecoration:"none" }}>
            <div style={{
              borderRadius:24, overflow:"hidden", position:"relative",
              background:`linear-gradient(135deg,${gc.from},${gc.to})`,
              padding:"28px 28px", boxShadow:"0 16px 48px rgba(79,110,247,0.2)",
              cursor:"pointer", transition:"transform 0.2s",
            }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="translateY(-3px)"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="translateY(0)"}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.7)", letterSpacing:"0.15em", textTransform:"uppercase" }}>Game of the Day</span>
                    {featuredCompleted && (
                      <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, fontWeight:700, color:"#22C55E", background:"rgba(255,255,255,0.15)", padding:"2px 8px", borderRadius:10 }}>
                        <Check size={10}/> Done
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize:32, fontWeight:700, color:"white", fontFamily:"Georgia,serif", marginBottom:6 }}>
                    {GAME_NAMES[todayFeatured]}
                  </h2>
                  <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", marginBottom:20 }}>
                    Stage {getDailyStageNumber(todayFeatured)} · Same for all players today
                  </p>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"11px 22px", borderRadius:14, background:"white", color:gc.from, fontSize:14, fontWeight:700 }}>
                    {featuredCompleted ? "Play Again" : "Play Now"} <ChevronRight size={14}/>
                  </div>
                </div>
                <div style={{ opacity:0.25, transform:"scale(1.8) rotate(-10deg)" }}>
                  <div style={{transform:"scale(0.85)",transformOrigin:"center"}}><GameSnapshot slug={todayFeatured}/></div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* All daily games grid */}
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, fontWeight:600, color:"var(--text4)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14 }}>
            All Daily Challenges
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {DAILY_GAMES.map((game, i) => {
              const done = completedToday.has(game);
              const gc2 = GAME_COLORS[game] ?? { from:"#4F6EF7", to:"#9C6BE8" };
              const isFeatured = game === todayFeatured;
              return (
                <motion.div key={game}
                  initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.06 + i * 0.03 }}>
                  <Link href={`/games/${game}?daily=1`} style={{ display:"block", textDecoration:"none" }}>
                    <div style={{
                      background:"var(--surface)", borderRadius:18,
                      border:`0.5px solid ${isFeatured?"rgba(79,110,247,0.3)":"var(--border)"}`,
                      padding:"16px", boxShadow:"var(--shadow-sm)",
                      cursor:"pointer", transition:"all 0.2s",
                      opacity: done ? 0.7 : 1,
                    }}
                    onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="translateY(-2px)";el.style.boxShadow="var(--shadow-md)";}}
                    onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="translateY(0)";el.style.boxShadow="var(--shadow-sm)";}}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                        <div style={{ width:52, height:52, borderRadius:12,
                          background:"var(--bg2)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          overflow:"hidden" }}>
                          <div style={{ transform:"scale(0.55)", transformOrigin:"center" }}>
                            <GameSnapshot slug={game}/>
                          </div>
                        </div>
                        {done ? (
                          <div style={{ width:22, height:22, borderRadius:"50%", background:"#F0FDF4", border:"1.5px solid #86EFAC", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Check size={12} color="#22C55E"/>
                          </div>
                        ) : (
                          <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:8,
                            background:`${gc2.from}15`, color:gc2.from }}>
                            Free
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize:13, fontWeight:700, color:"var(--text1)", marginBottom:2 }}>{GAME_NAMES[game]}</p>
                      <p style={{ fontSize:11, color:"var(--text4)" }}>Stage {getDailyStageNumber(game)}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Streak tracker */}
        {user && (
          <div style={{ background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"20px 24px", boxShadow:"var(--shadow-sm)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <Flame size={16} color="#F59E0B" fill="#F59E0B"/>
              <p style={{ fontSize:14, fontWeight:700, color:"var(--text1)" }}>Your Streak</p>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {Array.from({ length: 7 }, (_, i) => {
                const filled = i < (streak % 7 || (streak > 0 && streak % 7 === 0 ? 7 : 0));
                return (
                  <div key={i} style={{ flex:1, height:8, borderRadius:4,
                    background: filled ? "linear-gradient(90deg,#F97316,#F59E0B)" : "var(--bg3)",
                    minWidth:20, transition:"background 0.3s" }}/>
                );
              })}
            </div>
            <p style={{ fontSize:11, color:"var(--text4)", marginTop:8 }}>
              {streak % 7 === 0 && streak > 0
                ? " Perfect week! +10 bonus plays awarded!"
                : `${7 - (streak % 7)} more days for +10 bonus plays`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
