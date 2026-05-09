"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Target, Star, ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { useAuthStore } from "@/store/authStore";
import { getUserScores } from "@/lib/supabase/scores";
import { GameIcon } from "@/components/icons/GameIcons";
import type { Score } from "@/lib/supabase/types";

const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";
const GAME_NAMES: Record<string,string> = {
  tango:"Tango", memory:"Memory", queens:"Queens",
  sudoku:"Mini Sudoku", zip:"Zip", minesweeper:"Minesweeper",
};

export default function ProfilePage() {
  const { user, profile } = useAuthStore();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) getUserScores(user.id).then(s => { setScores(s); setLoading(false); });
    else setLoading(false);
  }, [user]);

  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB" }}>
      <Navbar/>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", gap:20, textAlign:"center", padding:24 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <LogIn size={28} color="#4F6EF7"/>
        </div>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:6 }}>Sign in to view your profile</h2>
          <p style={{ fontSize:14, color:"#64748B" }}>Track your progress, scores, and streaks.</p>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <Link href="/auth/signin" style={{ padding:"11px 22px", borderRadius:14, border:"1.5px solid #E2E8F0", color:"#374151", fontWeight:600, fontSize:13, textDecoration:"none" }}>Sign In</Link>
          <Link href="/auth/signup" style={{ padding:"11px 22px", borderRadius:14, background:ACCENT, color:"white", fontWeight:700, fontSize:13, textDecoration:"none" }}>Create Account</Link>
        </div>
      </div>
    </div>
  );

  const totalXP = scores.reduce((s,sc)=>s+sc.xp_earned,0);
  const bestScore = scores.reduce((b,s)=>s.xp_earned>b?s.xp_earned:b,0);
  const uniqueGames = new Set(scores.map(s=>s.game_slug)).size;
  const recent = scores.slice(0,10);
  const byGame = Object.entries(
    scores.reduce((acc,s)=>{
      if(!acc[s.game_slug]) acc[s.game_slug]={count:0,totalXP:0,best:0};
      acc[s.game_slug].count++; acc[s.game_slug].totalXP+=s.xp_earned;
      acc[s.game_slug].best=Math.max(acc[s.game_slug].best,s.xp_earned);
      return acc;
    },{} as Record<string,{count:number;totalXP:number;best:number}>)
  ).sort((a,b)=>b[1].totalXP-a[1].totalXP);

  return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB" }}>
      <Navbar/>
      <main style={{ maxWidth:720, margin:"0 auto", padding:"76px 16px 60px" }}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28, marginTop:12 }}>
          <div style={{ width:60, height:60, borderRadius:18, background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:700, color:"white", fontFamily:"Georgia,serif", boxShadow:"0 8px 24px rgba(79,110,247,0.3)" }}>
            {(profile?.username ?? user.email ?? "U")[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:2 }}>
              {profile?.username ?? "Player"}
            </h1>
            <p style={{ fontSize:12, color:"#94A3B8" }}>{user.email}</p>
            <span style={{ display:"inline-block", marginTop:4, fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:10,
              background: profile?.subscription_status==="free" ? "#F1F5F9" : "#EEF2FF",
              color: profile?.subscription_status==="free" ? "#64748B" : "#4F6EF7" }}>
              {profile?.subscription_status==="free" ? "Free Plan" : "Pro Subscriber"}
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:20 }}>
          {[
            { icon:Zap,    label:"Total XP",    value:totalXP.toLocaleString(), color:"#4F6EF7" },
            { icon:Target, label:"Games Played", value:scores.length.toString(), color:"#9C6BE8" },
            { icon:Trophy, label:"Best Score",   value:bestScore.toString(),     color:"#F59E0B" },
            { icon:Star,   label:"Games Tried",  value:`${uniqueGames}/6`,       color:"#22C55E" },
          ].map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
              style={{ background:"white", borderRadius:18, border:"0.5px solid rgba(0,0,0,0.07)", padding:"16px 18px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ width:32, height:32, borderRadius:10, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                <s.icon size={16} color={s.color}/>
              </div>
              <p style={{ fontSize:22, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:2 }}>{s.value}</p>
              <p style={{ fontSize:11, color:"#94A3B8" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* By game */}
        <div style={{ background:"white", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.07)", padding:20, marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:16 }}>By Game</h2>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[1,2,3].map(i=><div key={i} style={{ height:48, borderRadius:12, background:"#F8F7F5", animation:"pulse 1.5s infinite" }}/>)}
            </div>
          ) : byGame.length===0 ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <p style={{ color:"#94A3B8", fontSize:13, marginBottom:12 }}>No games played yet.</p>
              <Link href="/games" style={{ fontSize:13, fontWeight:600, color:"#4F6EF7", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4 }}>
                Start playing <ArrowRight size={13}/>
              </Link>
            </div>
          ) : byGame.map(([slug,data])=>(
            <Link key={slug} href={`/games/${slug}`} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"0.5px solid #FAFAF9", textDecoration:"none" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"#F8F7F5", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <GameIcon slug={slug} size={22}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"#1C1917" }}>{GAME_NAMES[slug]??slug}</p>
                  <p style={{ fontSize:12, fontWeight:700, color:"#4F6EF7" }}>{data.totalXP.toLocaleString()} XP</p>
                </div>
                <div style={{ height:3, background:"#F1EDE8", borderRadius:2 }}>
                  <div style={{ height:3, borderRadius:2, background:ACCENT, width:`${Math.min((data.totalXP/Math.max(totalXP,1))*100,100)}%` }}/>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent activity */}
        <div style={{ background:"white", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.07)", padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:16 }}>Recent Activity</h2>
          {recent.length===0 ? (
            <p style={{ color:"#94A3B8", fontSize:13, textAlign:"center", padding:"16px 0" }}>No activity yet.</p>
          ) : recent.map(s=>(
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"0.5px solid #FAFAF9" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"#F8F7F5", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <GameIcon slug={s.game_slug} size={22}/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"#1C1917" }}>{GAME_NAMES[s.game_slug]??s.game_slug} · Stage {s.stage_number}</p>
                <p style={{ fontSize:11, color:"#94A3B8", textTransform:"capitalize" }}>{s.difficulty}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#4F6EF7" }}>{s.xp_earned} XP</p>
                <p style={{ fontSize:11, color:"#94A3B8" }}>{new Date(s.completed_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {profile?.subscription_status==="free" && (
          <motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
            style={{ marginTop:20, borderRadius:20, padding:"20px 24px", background:ACCENT, color:"white", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:15, fontWeight:700, marginBottom:3 }}>Unlock All 20 Games</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>1,000 stages each · Infinite Mode · Family Leaderboards — $2/mo.</p>
            </div>
            <Link href="/pricing" style={{ padding:"10px 20px", borderRadius:14, background:"white", color:"#4F6EF7", fontWeight:700, fontSize:13, textDecoration:"none", flexShrink:0 }}>
              Upgrade
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
