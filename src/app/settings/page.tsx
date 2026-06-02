"use client";
import { useTranslation } from "react-i18next";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, Sun, Moon, Check, ChevronRight, Zap } from "lucide-react";
import { Navbar } from "@/components/nav/Navbar";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { useSettingsStore } from "@/store/settingsStore";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/config";
import type { Language } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";

const ACCENT = "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))";

function Toggle({ value, onChange }: { value:boolean; onChange:()=>void }) {
  return (
    <button onClick={onChange}
      style={{ position:"relative", width:46, height:26, borderRadius:13,
        background:value?ACCENT:"var(--color-surface-2)", border:"none", cursor:"pointer",
        transition:"background 0.2s", flexShrink:0 }}>
      <motion.div animate={{ x:value?20:2 }} transition={{ type:"spring", stiffness:500, damping:30 }}
        style={{ position:"absolute", top:2, width:22, height:22, background:"white", borderRadius:"50%",
          boxShadow:"0 2px 6px rgba(0,0,0,0.2)" }}/>
    </button>
  );
}

function Row({ label, desc, children }: { label:string; desc?:string; children:React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"0.5px solid var(--color-border)" }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:"var(--color-text-primary)" }}>{label}</p>
        {desc && <p style={{ fontSize:11, color:"var(--color-text-secondary)", marginTop:2 }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

// suppress unused icon imports — they may be kept for future use
void Sun;
void Moon;
void Volume2;

export default function SettingsPage() {
  const { t } = useTranslation();
  const { isSilentMode, toggleSilentMode, language, setLanguage } = useSettingsStore();
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
    <div className="settings-page" style={{ minHeight:"100vh", background:"var(--color-bg)" }}>
      <Navbar/>
      <main style={{ maxWidth:560, margin:"0 auto", padding:"76px 16px 60px" }}>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24, marginTop:12 }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--color-text-primary)", fontFamily:"var(--font-display)", marginBottom:4 }}>Settings</h1>
          <p style={{ fontSize:13, color:"var(--color-text-secondary)" }}>Manage your account and preferences</p>
        </motion.div>

        {/* Profile */}
        {user && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent-primary)", marginBottom: 10 }}>Profile</div>
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 16 }}>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, fontWeight:600, color:"var(--color-text-secondary)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Username</label>
                <input value={username} onChange={e=>setUsername(e.target.value)}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:12, border:"0.5px solid var(--color-border)", fontSize:14, color:"var(--color-text-primary)", background:"var(--color-surface-2)", outline:"none" }}
                  placeholder="Your username"/>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:600, color:"var(--color-text-secondary)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Email</label>
                <input value={user.email??""} disabled
                  style={{ width:"100%", padding:"10px 14px", borderRadius:12, border:"0.5px solid var(--color-border)", fontSize:14, color:"var(--color-text-secondary)", background:"var(--color-surface-2)", cursor:"not-allowed" }}/>
              </div>
              <button onClick={saveProfile} disabled={saving}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:12, border:"none", background:ACCENT, color:"#000", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {saved ? <><Check size={14}/> Saved!</> : saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Preferences */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent-primary)", marginBottom: 10 }}>Preferences</div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 16 }}>
            <Row label="Silent Mode" desc="Disable all sounds and haptic feedback">
              <Toggle value={isSilentMode} onChange={toggleSilentMode}/>
            </Row>
            <Row label="Theme" desc="Choose how MindState looks">
              <ThemeSwitcher/>
            </Row>
            <Row label={t("settings_lang")} desc="Interface language · Direction auto-switches for RTL">
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, maxWidth:320, justifyContent:"flex-end" }}>
                {SUPPORTED_LANGUAGES.map(lang=>(
                  <button key={lang.code} onClick={()=>setLanguage(lang.code as Language)}
                    style={{ padding:"5px 10px", borderRadius:10, border:"0.5px solid", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                      background:language===lang.code?ACCENT:"var(--color-surface-2)",
                      color:language===lang.code?"#000":"var(--color-text-secondary)",
                      borderColor:language===lang.code?"transparent":"var(--color-border)" }}>
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            </Row>
          </div>
        </div>

        {/* Subscription (combines Daily Plays + Subscription) */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent-primary)", marginBottom: 10 }}>Subscription</div>
          <div style={{
            background: "radial-gradient(120% 80% at 50% 0%, rgba(47,230,224,0.08), transparent), var(--color-surface)",
            border: "1px solid var(--color-border)", borderRadius: 16, padding: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isPro ? 0 : 16 }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  {isPro ? "Pro" : "Free plan"}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-text-faint)" }}>
                  {isPro ? "Unlimited plays · All features unlocked" : "5 daily plays across all 20 games"}
                </div>
              </div>
              {!isPro && (
                <Link href="/pricing" style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "9px 14px", borderRadius: 12,
                  background: ACCENT, color: "#000", fontSize: 12, fontWeight: 700, textDecoration: "none",
                }}>
                  <Zap size={12} fill="#000" strokeWidth={0} />
                  Upgrade
                </Link>
              )}
            </div>
            {!isPro && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" }}>Today&apos;s plays</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: tokens > 0 ? "var(--color-accent-primary)" : "var(--color-error)", fontFamily: "var(--font-display)" }}>
                    {tokens}/{FREE_DAILY_TOKENS}
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--color-surface-2)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: ACCENT, width: `${(tokens/FREE_DAILY_TOKENS)*100}%`, transition: "width 0.4s" }}/>
                </div>
                <Link href="/pricing" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:14, background:"rgba(0,255,255,0.06)", border:"0.5px solid rgba(0,255,255,0.15)", textDecoration:"none", marginTop: 12 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"var(--color-accent-primary)" }}>Upgrade to Pro for unlimited plays</span>
                  <ChevronRight size={14} color="var(--color-accent-primary)"/>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent-primary)", marginBottom: 10 }}>Notifications</div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 16 }}>
            <Row label="Daily reminder" desc="Get reminded to play your daily challenge">
              <Toggle value={false} onChange={()=>alert("Coming soon — enable browser notifications first")}/>
            </Row>
            <Row label="Streak alerts" desc="Be notified if you're about to break a streak">
              <Toggle value={false} onChange={()=>alert("Coming soon")}/>
            </Row>
          </div>
        </div>

        {/* Sign out */}
        {user && (
          <div style={{ marginTop: 22 }}>
            <button
              onClick={signOut}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: 13, borderRadius: 13,
                background: "transparent", border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Sign out
            </button>
          </div>
        )}

        {!user && (
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <p style={{ color:"var(--color-text-secondary)", fontSize:13, marginBottom:16 }}>Sign in to manage your settings</p>
            <Link href="/auth/signin" style={{ padding:"11px 24px", borderRadius:14, background:ACCENT, color:"#000", fontWeight:700, fontSize:13, textDecoration:"none" }}>
              Sign In
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
