"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Sun, Moon, Globe, CreditCard, Shield, Bell, Trash2, Check, ChevronRight, Zap, Infinity as InfinityIcon } from "lucide-react";
import { Navbar } from "@/components/nav/Navbar";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";

const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";

function Toggle({ value, onChange }: { value:boolean; onChange:()=>void }) {
  return (
    <button onClick={onChange}
      style={{ position:"relative", width:46, height:26, borderRadius:13,
        background:value?ACCENT:"var(--bg3)", border:"none", cursor:"pointer",
        transition:"background 0.2s", flexShrink:0 }}>
      <motion.div animate={{ x:value?20:2 }} transition={{ type:"spring", stiffness:500, damping:30 }}
        style={{ position:"absolute", top:2, width:22, height:22, background:"white", borderRadius:"50%",
          boxShadow:"0 2px 6px rgba(0,0,0,0.2)" }}/>
    </button>
  );
}

function SectionCard({ title, icon:Icon, children }: { title:string; icon:any; children:React.ReactNode }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      style={{ background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"18px 20px", marginBottom:14, boxShadow:"var(--shadow-sm)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
        <div style={{ width:30, height:30, borderRadius:9, background:"rgba(79,110,247,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={14} color="#4F6EF7"/>
        </div>
        <h2 style={{ fontSize:14, fontWeight:700, color:"var(--text1)" }}>{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function Row({ label, desc, children }: { label:string; desc?:string; children:React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"0.5px solid var(--border)" }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:"var(--text1)" }}>{label}</p>
        {desc && <p style={{ fontSize:11, color:"var(--text4)", marginTop:2 }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { isSilentMode, toggleSilentMode, theme, toggleTheme, language, setLanguage } = useSettingsStore();
  const { user, profile, signOut } = useAuthStore();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile]);

  useEffect(() => {
    if (user && !isPro) setTokens(getTokensRemaining(user.id));
  }, [user, isPro]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      username, lang_pref:language, is_silent_mode:isSilentMode
    }).eq("id", user.id);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar/>
      <main style={{ maxWidth:560, margin:"0 auto", padding:"76px 16px 60px" }}>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24, marginTop:12 }}>
          <h1 style={{ fontSize:28, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:4 }}>Settings</h1>
          <p style={{ fontSize:13, color:"var(--text4)" }}>Manage your account and preferences</p>
        </motion.div>

        {/* Profile */}
        {user && (
          <SectionCard title="Profile" icon={Shield}>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--text4)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Username</label>
              <input value={username} onChange={e=>setUsername(e.target.value)}
                style={{ width:"100%", padding:"10px 14px", borderRadius:12, border:"0.5px solid var(--border2)", fontSize:14, color:"var(--text1)", background:"var(--bg2)", outline:"none" }}
                placeholder="Your username"/>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--text4)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Email</label>
              <input value={user.email??""} disabled
                style={{ width:"100%", padding:"10px 14px", borderRadius:12, border:"0.5px solid var(--border)", fontSize:14, color:"var(--text4)", background:"var(--bg3)", cursor:"not-allowed" }}/>
            </div>
            <button onClick={saveProfile} disabled={saving}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:12, border:"none", background:ACCENT, color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {saved ? <><Check size={14}/> Saved!</> : saving ? "Saving..." : "Save Changes"}
            </button>
          </SectionCard>
        )}

        {/* Preferences */}
        <SectionCard title="Preferences" icon={Volume2}>
          <Row label="Silent Mode" desc="Disable all sounds and haptic feedback">
            <Toggle value={isSilentMode} onChange={toggleSilentMode}/>
          </Row>
          <Row label="Dark Mode" desc="Switch between light and dark theme">
            <Toggle value={theme==="dark"} onChange={toggleTheme}/>
          </Row>
          <Row label="Language" desc="Interface language and text direction">
            <div style={{ display:"flex", gap:6 }}>
              {(["en","he"] as const).map(lang=>(
                <button key={lang} onClick={()=>setLanguage(lang)}
                  style={{ padding:"6px 14px", borderRadius:10, border:"0.5px solid", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                    background:language===lang?ACCENT:"var(--bg2)",
                    color:language===lang?"white":"var(--text3)",
                    borderColor:language===lang?"transparent":"var(--border2)" }}>
                  {lang==="en"?"English":"עברית"}
                </button>
              ))}
            </div>
          </Row>
        </SectionCard>

        {/* Token status */}
        <SectionCard title="Daily Plays" icon={Zap}>
          {isPro ? (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 0" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"rgba(79,110,247,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <InfinityIcon size={18} color="#4F6EF7"/>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"var(--text1)" }}>Unlimited Plays</p>
                <p style={{ fontSize:11, color:"var(--text4)" }}>Pro subscriber — play without limits</p>
              </div>
            </div>
          ) : (
            <>
              <Row label="Today's plays remaining" desc="Resets daily at midnight UTC">
                <span style={{ fontSize:18, fontWeight:700, color: tokens>0?"#4F6EF7":"#EF4444", fontFamily:"Georgia,serif" }}>
                  {tokens}/{FREE_DAILY_TOKENS}
                </span>
              </Row>
              <div style={{ height:6, background:"var(--bg3)", borderRadius:3, overflow:"hidden", margin:"8px 0 12px" }}>
                <div style={{ height:"100%", borderRadius:3, background:ACCENT, width:`${(tokens/FREE_DAILY_TOKENS)*100}%`, transition:"width 0.4s" }}/>
              </div>
              <Link href="/pricing" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:14, background:"rgba(79,110,247,0.06)", border:"0.5px solid rgba(79,110,247,0.15)", textDecoration:"none" }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#4F6EF7" }}>Upgrade to Pro for unlimited plays</span>
                <ChevronRight size={14} color="#4F6EF7"/>
              </Link>
            </>
          )}
        </SectionCard>

        {/* Subscription */}
        <SectionCard title="Subscription" icon={CreditCard}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:"var(--text1)", marginBottom:2 }}>
                {isPro ? "Pro Subscriber" : "Free Plan"}
              </p>
              <p style={{ fontSize:11, color:"var(--text4)" }}>
                {isPro ? "Unlimited plays · All features unlocked" : "5 daily plays across all 20 games"}
              </p>
            </div>
            {isPro ? (
              <span style={{ fontSize:11, fontWeight:700, color:"#22C55E", background:"#F0FDF4", border:"0.5px solid #86EFAC", padding:"5px 12px", borderRadius:10 }}>
                Active
              </span>
            ) : (
              <Link href="/pricing" style={{ padding:"8px 16px", borderRadius:12, background:ACCENT, color:"white", fontSize:12, fontWeight:700, textDecoration:"none" }}>
                Upgrade
              </Link>
            )}
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications" icon={Bell}>
          <Row label="Daily reminder" desc="Get reminded to play your daily challenge">
            <Toggle value={false} onChange={()=>alert("Coming soon — enable browser notifications first")}/>
          </Row>
          <Row label="Streak alerts" desc="Be notified if you're about to break a streak">
            <Toggle value={false} onChange={()=>alert("Coming soon")}/>
          </Row>
        </SectionCard>

        {/* Danger zone */}
        {user && (
          <div style={{ background:"var(--surface)", borderRadius:20, border:"0.5px solid rgba(239,68,68,0.2)", padding:"18px 20px", boxShadow:"var(--shadow-sm)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#EF4444", marginBottom:2 }}>Sign Out</p>
                <p style={{ fontSize:11, color:"var(--text4)" }}>Sign out on this device</p>
              </div>
              <button onClick={signOut}
                style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid rgba(239,68,68,0.3)", background:"transparent", color:"#EF4444", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                Sign Out
              </button>
            </div>
          </div>
        )}
        {!user && (
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <p style={{ color:"var(--text4)", fontSize:13, marginBottom:16 }}>Sign in to manage your settings</p>
            <Link href="/auth/signin" style={{ padding:"11px 24px", borderRadius:14, background:ACCENT, color:"white", fontWeight:700, fontSize:13, textDecoration:"none" }}>
              Sign In
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
