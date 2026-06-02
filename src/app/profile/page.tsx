"use client";
import { useEffect, useState } from "react";
import { Flame, Crown, Zap, Grid, Target, Medal, Trophy, Star } from "lucide-react";
import { Users, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/nav/AppHeader";
import { useAuthStore } from "@/store/authStore";
import { getUserScores } from "@/lib/supabase/scores";
import { getStreak } from "@/lib/supabase/streaks";
import type { Score } from "@/lib/supabase/types";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { getLevelInfo } from "@/lib/xpLevels";

const ACHIEVEMENTS = [
  { id:"first_win",  Icon: Target,   name:"Speed Demon",       check:(s:Score[])=>s.some(x=>x.time_taken<=30) },
  { id:"streak30",   Icon: Flame,    name:"30-day streak",     check:(_s:Score[])=>false }, // placeholder
  { id:"ten_stages", Icon: Medal,    name:"Silver Queens",     check:(s:Score[])=>new Set(s.filter(x=>x.game_slug==="queens").map(()=>1)).size>=1 },
  { id:"hundred",    Icon: Trophy,   name:"Century",           check:(s:Score[])=>s.length>=100 },
  { id:"all_games",  Icon: Grid,     name:"Completionist",     check:(s:Score[])=>new Set(s.map(x=>x.game_slug)).size>=20 },
  { id:"perfect_xp", Icon: Star,     name:"Perfect",           check:(s:Score[])=>s.some(x=>x.xp_earned>=1000) },
];

export default function ProfilePage() {
  const router = useRouter();
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
      <AppHeader />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", gap:20, textAlign:"center", padding:24 }}>
        <SparkyImg mood="idle" size={88} />
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
  const uniqueGames = new Set(scores.map(s => s.game_slug)).size;
  const currentStreak = streakData?.current_streak ?? 0;
  const levelInfo = getLevelInfo(totalXP);
  const levelColor = levelInfo.color;

  // suppress unused warning
  void loading;
  void tokens;

  return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)" }}>
      <AppHeader />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"76px 20px 60px" }}>

        {/* Hero card */}
        <div style={{
          background: "radial-gradient(120% 80% at 50% 0%, rgba(47,230,224,0.14), transparent), var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16, padding: 18, marginBottom: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Avatar with level ring */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%", padding: 3, flexShrink: 0,
              background: `conic-gradient(${levelColor}, ${levelColor}88, ${levelColor})`,
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: "var(--color-bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)",
                color: "var(--color-accent-primary)",
              }}>
                {(profile?.username ?? user.email ?? "U")[0].toUpperCase()}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19,
                color: "var(--color-text-primary)",
              }}>
                {profile?.username ?? "Player"}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <Crown size={12} color="var(--color-gold)" strokeWidth={2} />
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: 12.5,
                  color: "var(--color-gold)", fontWeight: 600,
                }}>
                  Level {levelInfo.tier + 1} · {levelInfo.name}
                </span>
              </div>
              <div style={{ marginTop: 9, height: 6, background: "var(--color-surface-2)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  background: "linear-gradient(90deg, var(--color-accent-primary), var(--color-gold))",
                  width: `${levelInfo.progress * 100}%`,
                  transition: "width 0.4s ease",
                }} />
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "var(--color-text-faint)", marginTop: 5,
              }}>
                {levelInfo.currentXP.toLocaleString()} / {levelInfo.nextLevelXP.toLocaleString()} XP to Level {levelInfo.tier + 2}
              </div>
            </div>
          </div>
        </div>

        {/* 4-cell stat row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[
            { icon: <Zap size={16} color="var(--color-accent-primary)" />, label: "Total XP", value: totalXP > 999 ? `${(totalXP/1000).toFixed(1)}k` : String(totalXP) },
            { icon: <Grid size={16} color="var(--color-text-secondary)" />, label: "Stages", value: String(scores.length) },
            { icon: <Flame size={16} color="#F59E0B" />, label: "Streak", value: String(currentStreak) },
            { icon: <Target size={16} color="var(--color-text-secondary)" />, label: "Games", value: `${uniqueGames}/24` },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              flex: 1, background: "var(--color-surface)", border: "1px solid var(--color-border)",
              borderRadius: 13, padding: "13px 6px", textAlign: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 7 }}>{icon}</div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17,
                color: "var(--color-text-primary)",
              }}>{value}</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "var(--color-text-faint)", marginTop: 3,
              }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 2px 12px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)" }}>Quick links</div>
          <Link href="/settings" style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-accent-primary)", fontWeight: 600, textDecoration: "none" }}>Manage</Link>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[
            { href: "/family", icon: <Users size={20} color="var(--color-violet)" strokeWidth={2} />, label: "Family" },
            { href: "/pricing", icon: <Zap size={20} color="var(--color-gold)" fill="var(--color-gold)" strokeWidth={0} />, label: "Go Pro" },
            { href: "/settings", icon: <Settings size={20} color="var(--color-text-secondary)" strokeWidth={2} />, label: "Settings" },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href} style={{ flex: 1, textDecoration: "none", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 14, textAlign: "center" as const, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8 }}>
              {icon}
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12, color: "var(--color-text-primary)" }}>{label}</div>
            </Link>
          ))}
        </div>

        {/* Achievements */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 2px 12px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)" }}>Achievements</div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-faint)" }}>
            {ACHIEVEMENTS.filter(a=>a.check(scores)).length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {ACHIEVEMENTS.map(a => {
            const done = a.check(scores);
            return (
              <div key={a.id} style={{
                padding: "15px 6px", textAlign: "center", borderRadius: 16,
                background: "var(--color-surface)",
                border: `1px solid ${done ? "rgba(255,194,75,0.4)" : "var(--color-border)"}`,
                opacity: done ? 1 : 0.45,
              }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <a.Icon size={20} color={done ? "var(--color-gold)" : "var(--color-text-faint)"} strokeWidth={done ? 2 : 1.8} />
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.18em",
                  textTransform: "uppercase", color: "var(--color-text-faint)", marginTop: 8,
                }}>{a.name}</div>
              </div>
            );
          })}
        </div>

        {!isPro && (
          <div
            onClick={() => router.push("/pricing")}
            style={{
              marginTop: 18, cursor: "pointer",
              background: "linear-gradient(120deg, var(--color-accent-primary), color-mix(in srgb, var(--color-accent-primary) 80%, #000))",
              borderRadius: 16, padding: 16,
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <SparkyImg mood="celebrate" size={44} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
                color: "var(--color-on-accent)",
              }}>Unlock unlimited play</div>
              <div style={{
                fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-on-accent)",
                opacity: 0.85, marginTop: 2,
              }}>All figures · family leaderboard · $2/mo</div>
            </div>
            <ChevronRight size={18} color="var(--color-on-accent)" />
          </div>
        )}
      </main>
    </div>
  );
}
