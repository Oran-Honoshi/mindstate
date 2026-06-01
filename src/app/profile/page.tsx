"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Target, Star, LogIn, Flame, Crown } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { useAuthStore } from "@/store/authStore";
import { getUserScores } from "@/lib/supabase/scores";
import { getStreak } from "@/lib/supabase/streaks";
import type { Score } from "@/lib/supabase/types";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";
import { ProfileHeader } from "@/features/profile/ProfileHeader";
import { ProfileActivity } from "@/features/profile/ProfileActivity";
import { MasterySection } from "@/features/profile/MasterySection";

const ACHIEVEMENTS = [
  { id:"first_win",  icon:"🎯", name:"First Victory",    desc:"Complete your first stage",      check:(s:Score[])=>s.length>=1 },
  { id:"ten_stages", icon:"🎯", name:"Ten Stages",        desc:"Complete 10 stages",             check:(s:Score[])=>s.length>=10 },
  { id:"five_games", icon:"🎮", name:"Multidisciplinary", desc:"Play 5 different games",         check:(s:Score[])=>new Set(s.map(x=>x.game_slug)).size>=5 },
  { id:"all_games",  icon:"🌟", name:"Completionist",     desc:"Play all 20 games",              check:(s:Score[])=>new Set(s.map(x=>x.game_slug)).size>=20 },
  { id:"perfect_xp", icon:"💎", name:"Perfect Score",     desc:"Earn 1000 XP on any stage",    check:(s:Score[])=>s.some(x=>x.xp_earned>=1000) },
  { id:"speed",      icon:"⚡", name:"Speed Demon",       desc:"Complete a stage in under 30s", check:(s:Score[])=>s.some(x=>x.time_taken<=30) },
  { id:"hundred",    icon:"💯", name:"Century Club",      desc:"Complete 100 stages total",      check:(s:Score[])=>s.length>=100 },
  { id:"top_scorer", icon:"🥇", name:"High Achiever",    desc:"Accumulate 10,000 total XP",    check:(s:Score[])=>s.reduce((t,x)=>t+x.xp_earned,0)>=10000 },
];

export default function ProfilePage() {
  const { user, profile } = useAuthStore();
  const [scores, setScores]     = useState<Score[]>([]);
  const [streakData, setStreak] = useState<{ current_streak:number; longest_streak:number } | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tokens, setTokens]     = useState(FREE_DAILY_TOKENS);
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([getUserScores(user.id), getStreak(user.id)]).then(([s, streak]) => {
      setScores(s ?? []);
      if (streak) setStreak({ current_streak: streak.current_streak ?? 0, longest_streak: streak.longest_streak ?? 0 });
      setTokens(getTokensRemaining(user.id));
      setLoading(false);
    });
  }, [user]);

  if (!user) return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)" }}>
      <Navbar />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", gap:20, textAlign:"center", padding:24 }}>
        <LogIn size={32} color="var(--color-accent-primary)" />
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:"var(--color-text-primary)", marginBottom:6 }}>Sign in to view your profile</h2>
          <p style={{ fontSize:14, color:"var(--color-text-secondary)" }}>Track your progress, scores, and streaks.</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href="/auth/signin" style={{ padding:"10px 20px", borderRadius:8, border:"1px solid var(--color-border)", color:"var(--color-text-secondary)", fontWeight:600, fontSize:13, textDecoration:"none" }}>Sign In</Link>
          <Link href="/auth/signup" style={{ padding:"10px 20px", borderRadius:8, background:"var(--color-accent-primary)", color:"#000", fontWeight:700, fontSize:13, textDecoration:"none" }}>Create Account</Link>
        </div>
      </div>
    </div>
  );

  const totalXP = scores.reduce((s, sc) => s + sc.xp_earned, 0);
  const bestScore = scores.reduce((b, s) => s.xp_earned > b ? s.xp_earned : b, 0);
  const uniqueGames = new Set(scores.map(s => s.game_slug)).size;
  const currentStreak = streakData?.current_streak ?? 0;
  const longestStreak = streakData?.longest_streak ?? 0;
  const earned = ACHIEVEMENTS.filter(a => a.check(scores));

  return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)" }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"76px 20px 60px" }}>

        <ProfileHeader user={user} username={profile?.username} isPro={isPro}
          currentStreak={currentStreak} tokens={tokens} />

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
          {[
            { icon: Zap,    label:"Total XP",      value: totalXP.toLocaleString(),   color:"var(--color-accent-primary)" },
            { icon: Target, label:"Stages Played",  value: scores.length.toString(),   color:"var(--color-accent-primary)" },
            { icon: Trophy, label:"Best Score",     value: bestScore.toString(),        color:"#F59E0B" },
            { icon: Star,   label:"Games Tried",    value: `${uniqueGames}/20`,         color:"#22C55E" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
              className="ms-card" style={{ padding:"16px 18px" }}>
              <p style={{ fontSize:22, fontWeight:700, fontFamily:"var(--font-mono)", color, marginBottom:3 }}>{value}</p>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Icon size={11} color="var(--color-text-secondary)" />
                <p style={{ fontSize:10, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Streak */}
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="ms-card" style={{ padding:"18px 20px", marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Flame size={15} color="#F59E0B" fill="#F59E0B" />
              <span style={{ fontSize:13, fontWeight:700, color:"var(--color-text-primary)" }}>Streak</span>
            </div>
            <div style={{ display:"flex", gap:20 }}>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:22, fontWeight:700, fontFamily:"var(--font-mono)", color:"var(--color-text-primary)" }}>{currentStreak}</p>
                <p style={{ fontSize:9, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.06em" }}>CURRENT</p>
              </div>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:22, fontWeight:700, fontFamily:"var(--font-mono)", color:"var(--color-text-primary)" }}>{longestStreak}</p>
                <p style={{ fontSize:9, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.06em" }}>BEST</p>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:5, marginBottom:8 }}>
            {Array.from({ length:7 }, (_, i) => (
              <div key={i} style={{ flex:1, height:5, borderRadius:3,
                background: currentStreak > 0 && i < (currentStreak % 7 || 7)
                  ? "var(--color-accent-secondary)" : "var(--color-surface-2)" }} />
            ))}
          </div>
          <p style={{ fontSize:10, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>
            {currentStreak % 7 === 0 && currentStreak > 0
              ? "7-DAY COMPLETE · +10 BONUS PLAYS"
              : `${7 - (currentStreak % 7 || 7)} MORE DAYS FOR +10 PLAYS`}
          </p>
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="ms-card" style={{ padding:"18px 20px", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Crown size={14} color="#F59E0B" />
              <span style={{ fontSize:13, fontWeight:700, color:"var(--color-text-primary)" }}>Achievements</span>
            </div>
            <span style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--color-text-secondary)" }}>{earned.length}/{ACHIEVEMENTS.length}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
            {ACHIEVEMENTS.map(a => {
              const done = a.check(scores);
              return (
                <div key={a.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:8,
                  background: done ? "rgba(0,255,255,0.04)" : "var(--color-surface-2)",
                  border:`1px solid ${done ? "rgba(0,255,255,0.15)" : "var(--color-border)"}`,
                  opacity: done ? 1 : 0.45 }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{a.icon}</span>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"var(--color-text-primary)", marginBottom:1 }}>{a.name}</p>
                    <p style={{ fontSize:9, color:"var(--color-text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <MasterySection />

        <ProfileActivity scores={scores} totalXP={totalXP} loading={loading} />

        {!isPro && (
          <div style={{ padding:"18px 20px", borderRadius:10, border:"1px solid var(--color-accent-primary)",
            background:"rgba(0,255,255,0.03)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"var(--color-text-primary)", marginBottom:3 }}>Unlock Unlimited Plays</p>
              <p style={{ fontSize:11, color:"var(--color-text-secondary)" }}>All 2,400 stages · Family Leaderboards · $2/mo.</p>
            </div>
            <Link href="/pricing" style={{ padding:"9px 18px", borderRadius:8, background:"var(--color-accent-primary)",
              color:"#000", fontWeight:700, fontSize:12, textDecoration:"none", flexShrink:0 }}>
              Upgrade
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
