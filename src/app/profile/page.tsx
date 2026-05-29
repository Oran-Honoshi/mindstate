"use client";

import React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Target, Star, ArrowRight, LogIn, Flame, Calendar, Crown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { useAuthStore } from "@/store/authStore";
import { getUserScores } from "@/lib/supabase/scores";
import { getStreak } from "@/lib/supabase/streaks";
import { GameIcon } from "@/components/icons/GameIcons";
import type { Score } from "@/lib/supabase/types";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";

const ACCENT = "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))";
const GAME_NAMES: Record<string,string> = {
  tango:"Tango", memory:"Memory", queens:"Queens",
  sudoku:"Mini Sudoku", zip:"Zip", minesweeper:"Minesweeper",
  flow:"Flow", nonogram:"Nonogram", bridges:"Bridges",
  "pattern-match":"Pattern Match", "2048-pro":"2048 Pro",
  kakuro:"Kakuro", "gravity-sort":"Gravity Sort", "hex-merge":"Hex Merge",
  "logic-path":"Logic Path", lightup:"Light Up", patches:"Patches",
  "word-sling":"Word Sling", hearts:"Hearts", solitaire:"Solitaire",
};

const ACHIEVEMENTS = [
  { id:"first_win",    icon:"", name:"First Victory",      desc:"Complete your first stage",          check:(s:Score[])=>s.length>=1 },
  { id:"ten_stages",   icon:"🎯", name:"Ten Stages",         desc:"Complete 10 stages",                 check:(s:Score[])=>s.length>=10 },
  { id:"five_games",   icon:"🎮", name:"Multidisciplinary",  desc:"Play 5 different games",             check:(s:Score[])=>new Set(s.map(x=>x.game_slug)).size>=5 },
  { id:"all_games",    icon:"🌟", name:"Completionist",      desc:"Play all 20 games",                  check:(s:Score[])=>new Set(s.map(x=>x.game_slug)).size>=20 },
  { id:"perfect_xp",  icon:"💎", name:"Perfect Score",      desc:"Earn 1000 XP on any stage",         check:(s:Score[])=>s.some(x=>x.xp_earned>=1000) },
  { id:"speed_demon",  icon:"", name:"Speed Demon",        desc:"Complete a stage in under 30s",      check:(s:Score[])=>s.some(x=>x.time_taken<=30) },
  { id:"hundred",      icon:"💯", name:"Century Club",       desc:"Complete 100 stages total",          check:(s:Score[])=>s.length>=100 },
  { id:"top_scorer",   icon:"🥇", name:"High Achiever",     desc:"Accumulate 10,000 total XP",         check:(s:Score[])=>s.reduce((t,x)=>t+x.xp_earned,0)>=10000 },
];

function StatCard({ icon:Icon, label, value, color }: { icon:React.ComponentType<{ size?: number; color?: string }>; label:string; value:string; color:string }) {
  return (
    <div className="ms-card" style={{ padding:"16px 18px" }}>
      <div style={{ width:32, height:32, borderRadius:10, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
        <Icon size={16} color={color}/>
      </div>
      <p style={{ fontSize:22, fontWeight:700, color:"var(--color-text-primary)", fontFamily:"var(--font-sans)", marginBottom:2 }}>{value}</p>
      <p style={{ fontSize:11, color:"var(--color-text-secondary)" }}>{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile } = useAuthStore();
  const [scores, setScores] = useState<Score[]>([]);
  const [streakData, setStreakData] = useState<{ current_streak:number; longest_streak:number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      getUserScores(user.id),
      getStreak(user.id),
    ]).then(([s, streak]) => {
      setScores(s ?? []);
      if (streak) setStreakData({ current_streak: streak.current_streak ?? 0, longest_streak: streak.longest_streak ?? 0 });
      setTokens(getTokensRemaining(user.id));
      setLoading(false);
    });
  }, [user]);

  if (!user) return (
    <div className="profile-page" style={{ minHeight:"100vh", background:"var(--color-bg)" }}>
      <Navbar/>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", gap:20, textAlign:"center", padding:24 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(79,110,247,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <LogIn size={28} color="var(--color-accent-primary)"/>
        </div>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, color:"var(--color-text-primary)", fontFamily:"var(--font-sans)", marginBottom:6 }}>Sign in to view your profile</h2>
          <p style={{ fontSize:14, color:"var(--color-text-secondary)" }}>Track your progress, scores, and streaks.</p>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <Link href="/auth/signin" style={{ padding:"11px 22px", borderRadius:14, border:"1.5px solid var(--color-border)", color:"var(--color-text-secondary)", fontWeight:600, fontSize:13, textDecoration:"none" }}>Sign In</Link>
          <Link href="/auth/signup" style={{ padding:"11px 22px", borderRadius:14, background:ACCENT, color:"white", fontWeight:700, fontSize:13, textDecoration:"none" }}>Create Account</Link>
        </div>
      </div>
    </div>
  );

  const totalXP = scores.reduce((s,sc)=>s+sc.xp_earned,0);
  const bestScore = scores.reduce((b,s)=>s.xp_earned>b?s.xp_earned:b,0);
  const uniqueGames = new Set(scores.map(s=>s.game_slug)).size;
  const byGame = Object.entries(
    scores.reduce((acc,s)=>{
      if(!acc[s.game_slug]) acc[s.game_slug]={count:0,totalXP:0,best:0};
      acc[s.game_slug].count++;
      acc[s.game_slug].totalXP+=s.xp_earned;
      acc[s.game_slug].best=Math.max(acc[s.game_slug].best,s.xp_earned);
      return acc;
    },{} as Record<string,{count:number;totalXP:number;best:number}>)
  ).sort((a,b)=>b[1].totalXP-a[1].totalXP);

  const earned = ACHIEVEMENTS.filter(a=>a.check(scores));
  const currentStreak = streakData?.current_streak ?? 0;
  const longestStreak = streakData?.longest_streak ?? 0;

  return (
    <div className="profile-page" style={{ minHeight:"100vh", background:"var(--color-bg)" }}>
      <Navbar/>
      <main style={{ maxWidth:760, margin:"0 auto", padding:"76px 20px 60px" }}>

        {/* Profile header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28, marginTop:12, flexWrap:"wrap" }}>
          <div style={{ width:72, height:72, borderRadius:22, background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:700, color:"white", fontFamily:"var(--font-sans)", boxShadow:"0 8px 24px rgba(79,110,247,0.3)", flexShrink:0 }}>
            {(profile?.username ?? user.email ?? "U")[0].toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
              <h1 style={{ fontSize:24, fontWeight:700, color:"var(--color-text-primary)", fontFamily:"var(--font-sans)" }}>
                {profile?.username ?? "Player"}
              </h1>
              {currentStreak >= 3 && (
                <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:"rgba(245,158,11,0.1)", border:"0.5px solid rgba(245,158,11,0.3)" }}>
                  <Flame size={13} color="#F59E0B" fill="#F59E0B"/>
                  <span style={{ fontSize:12, fontWeight:700, color:"#B45309" }}>{currentStreak} day streak</span>
                </div>
              )}
            </div>
            <p style={{ fontSize:12, color:"var(--color-text-secondary)", marginBottom:8 }}>{user.email}</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:10,
                background: isPro ? "rgba(79,110,247,0.12)" : "var(--color-surface-2)",
                color: isPro ? "var(--color-accent-primary)" : "var(--color-text-secondary)" }}>
                {isPro ? " Pro Subscriber" : "Free Plan"}
              </span>
              {!isPro && (
                <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:10, background:"rgba(79,110,247,0.08)", color:"var(--color-accent-primary)" }}>
                  <Zap size={9} style={{ display:"inline", marginRight:3 }}/>{tokens}/{FREE_DAILY_TOKENS} plays today
                </span>
              )}
            </div>
          </div>
          <Link href="/daily" style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", borderRadius:14, background:ACCENT, color:"white", textDecoration:"none", fontSize:13, fontWeight:700, flexShrink:0 }}>
            <Calendar size={14}/> Daily Challenges
          </Link>
        </motion.div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:20 }}>
          <StatCard icon={Zap}      label="Total XP"       value={totalXP.toLocaleString()} color="var(--color-accent-primary)"/>
          <StatCard icon={Target}   label="Stages Played"  value={scores.length.toString()}  color="var(--color-accent-primary)"/>
          <StatCard icon={Trophy}   label="Best Score"     value={bestScore.toString()}       color="#F59E0B"/>
          <StatCard icon={Star}     label="Games Tried"    value={`${uniqueGames}/20`}        color="#22C55E"/>
        </div>

        {/* Streak card */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="ms-card" style={{ padding:"20px 24px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Flame size={18} color="#F59E0B" fill="#F59E0B"/>
              <h2 style={{ fontSize:15, fontWeight:700, color:"var(--color-text-primary)" }}>Streak</h2>
            </div>
            <div style={{ display:"flex", gap:20 }}>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:24, fontWeight:700, color:"var(--color-text-primary)", fontFamily:"var(--font-sans)" }}>{currentStreak}</p>
                <p style={{ fontSize:10, color:"var(--color-text-secondary)" }}>Current</p>
              </div>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:24, fontWeight:700, color:"var(--color-text-primary)", fontFamily:"var(--font-sans)" }}>{longestStreak}</p>
                <p style={{ fontSize:10, color:"var(--color-text-secondary)" }}>Best</p>
              </div>
            </div>
          </div>
          {/* 7-day streak progress */}
          <div style={{ display:"flex", gap:6 }}>
            {Array.from({length:7},(_,i)=>{
              const filled = currentStreak > 0 && i < (currentStreak%7||7);
              return(
                <div key={i} style={{ flex:1, height:8, borderRadius:4,
                  background:filled?"linear-gradient(90deg,#F97316,#F59E0B)":"var(--color-surface-2)",
                  transition:"background 0.3s" }}/>
              );
            })}
          </div>
          <p style={{ fontSize:11, color:"var(--color-text-secondary)", marginTop:8 }}>
            {currentStreak%7===0&&currentStreak>0
              ? " 7-day streak! +10 bonus plays awarded!"
              : `${7-(currentStreak%7||7)} more days for +10 bonus plays`}
          </p>
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
          className="ms-card" style={{ padding:"20px 24px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <Crown size={16} color="#F59E0B"/>
            <h2 style={{ fontSize:15, fontWeight:700, color:"var(--color-text-primary)" }}>Achievements</h2>
            <span style={{ fontSize:11, color:"var(--color-text-secondary)", marginLeft:"auto" }}>{earned.length}/{ACHIEVEMENTS.length} earned</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
            {ACHIEVEMENTS.map(a=>{
              const done = a.check(scores);
              return(
                <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:14,
                  background:done?"rgba(79,110,247,0.06)":"var(--color-surface-2)",
                  border:`0.5px solid ${done?"rgba(79,110,247,0.2)":"var(--color-border)"}`,
                  opacity:done?1:0.5 }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{a.icon}</span>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"var(--color-text-primary)", marginBottom:1 }}>{a.name}</p>
                    <p style={{ fontSize:10, color:"var(--color-text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* By game */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }}
          className="ms-card" style={{ padding:"20px 24px", marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:"var(--color-text-primary)", marginBottom:16 }}>By Game</h2>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[1,2,3].map(i=><div key={i} style={{ height:48, borderRadius:12, background:"var(--color-surface-2)" }}/>)}
            </div>
          ) : byGame.length===0 ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <p style={{ color:"var(--color-text-secondary)", fontSize:13, marginBottom:12 }}>No games played yet.</p>
              <Link href="/games" style={{ fontSize:13, fontWeight:600, color:"var(--color-accent-primary)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4 }}>
                Start playing <ArrowRight size={13}/>
              </Link>
            </div>
          ) : byGame.map(([slug,data])=>(
            <Link key={slug} href={`/games/${slug}`} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"0.5px solid var(--color-border)", textDecoration:"none" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"var(--color-surface-2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <GameIcon slug={slug} size={22}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"var(--color-text-primary)" }}>{GAME_NAMES[slug]??slug}</p>
                  <p style={{ fontSize:12, fontWeight:700, color:"var(--color-accent-primary)" }}>{data.totalXP.toLocaleString()} XP</p>
                </div>
                <div style={{ height:3, background:"var(--color-surface-2)", borderRadius:2 }}>
                  <div style={{ height:3, borderRadius:2, background:ACCENT, width:`${Math.min((data.totalXP/Math.max(totalXP,1))*100,100)}%` }}/>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Recent */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="ms-card" style={{ padding:"20px 24px", marginBottom:20 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:"var(--color-text-primary)", marginBottom:16 }}>Recent Activity</h2>
          {scores.slice(0,8).map(s=>(
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"0.5px solid var(--color-border)" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"var(--color-surface-2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <GameIcon slug={s.game_slug} size={20}/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"var(--color-text-primary)" }}>{GAME_NAMES[s.game_slug]??s.game_slug} · Stage {s.stage_number}</p>
                <p style={{ fontSize:11, color:"var(--color-text-secondary)", textTransform:"capitalize" }}>{s.difficulty} · {new Date(s.completed_at).toLocaleDateString()}</p>
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:"var(--color-accent-primary)", flexShrink:0 }}>{s.xp_earned} XP</p>
            </div>
          ))}
          {scores.length===0&&<p style={{ color:"var(--color-text-secondary)", fontSize:13, textAlign:"center", padding:"16px 0" }}>No activity yet.</p>}
        </motion.div>

        {!isPro && (
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
            style={{ borderRadius:20, padding:"20px 24px", background:ACCENT, color:"white", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:15, fontWeight:700, marginBottom:3 }}>Unlock Unlimited Plays</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>1,000 stages each · Infinite Mode · Family Leaderboards — $2/mo.</p>
            </div>
            <Link href="/pricing" style={{ padding:"10px 20px", borderRadius:14, background:"white", color:"var(--color-accent-primary)", fontWeight:700, fontSize:13, textDecoration:"none", flexShrink:0 }}>
              Upgrade
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
