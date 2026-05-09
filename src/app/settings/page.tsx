"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Sun, Moon, Globe, CreditCard, Trash2, Check, Shield } from "lucide-react";
import { Navbar } from "@/components/nav/Navbar";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";

function Toggle({ value, onChange }: { value:boolean; onChange:()=>void }) {
  return (
    <button onClick={onChange}
      style={{ position:"relative", width:44, height:24, borderRadius:12,
        background:value?ACCENT:"#E2E8F0", border:"none", cursor:"pointer",
        transition:"background 0.2s", flexShrink:0 }}>
      <motion.div animate={{ x:value?20:2 }} transition={{ type:"spring", stiffness:500, damping:30 }}
        style={{ position:"absolute", top:2, width:20, height:20, background:"white", borderRadius:"50%", boxShadow:"0 1px 4px rgba(0,0,0,0.15)" }}/>
    </button>
  );
}

function Row({ icon:Icon, label, desc, children }:{ icon:any; label:string; desc?:string; children:React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"0.5px solid #F8F7F5" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:"#F8F7F5", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={16} color="#64748B"/>
        </div>
        <div>
          <p style={{ fontSize:13, fontWeight:600, color:"#1C1917" }}>{label}</p>
          {desc && <p style={{ fontSize:11, color:"#94A3B8", marginTop:1 }}>{desc}</p>}
        </div>
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

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ username, lang_pref:language, is_silent_mode:isSilentMode }).eq("id", user.id);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB" }}>
      <Navbar/>
      <main style={{ maxWidth:560, margin:"0 auto", padding:"76px 16px 60px" }}>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{ marginBottom:24, marginTop:12 }}>
          <h1 style={{ fontSize:28, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:4 }}>Settings</h1>
          <p style={{ fontSize:13, color:"#94A3B8" }}>Manage your account and preferences</p>
        </motion.div>

        {/* Profile */}
        {user && (
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
            style={{ background:"white", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.07)", padding:"18px 20px", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <Shield size={15} color="#4F6EF7"/>
              <h2 style={{ fontSize:14, fontWeight:700, color:"#1C1917" }}>Profile</h2>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Username</label>
              <input value={username} onChange={e=>setUsername(e.target.value)}
                style={{ width:"100%", padding:"10px 14px", borderRadius:12, border:"0.5px solid #E2E8F0", fontSize:14, color:"#1C1917", background:"#FDFCFB", outline:"none" }}
                placeholder="Your username"/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Email</label>
              <input value={user.email??""} disabled
                style={{ width:"100%", padding:"10px 14px", borderRadius:12, border:"0.5px solid #E2E8F0", fontSize:14, color:"#94A3B8", background:"#F8F7F5", cursor:"not-allowed" }}/>
            </div>
            <button onClick={saveProfile} disabled={saving}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:12, border:"none", background:ACCENT, color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {saved ? <><Check size={14}/> Saved!</> : saving ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        )}

        {/* Preferences */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          style={{ background:"white", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.07)", padding:"18px 20px", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:"#1C1917" }}>Preferences</h2>
          </div>
          <Row icon={isSilentMode?VolumeX:Volume2} label="Silent Mode" desc="Disable all sounds and haptic feedback">
            <Toggle value={isSilentMode} onChange={toggleSilentMode}/>
          </Row>
          <Row icon={theme==="dark"?Moon:Sun} label="Dark Mode" desc="Switch between light and dark theme">
            <Toggle value={theme==="dark"} onChange={toggleTheme}/>
          </Row>
          <Row icon={Globe} label="Language" desc="Choose your preferred language">
            <div style={{ display:"flex", gap:6 }}>
              {(["en","he"] as const).map(lang=>(
                <button key={lang} onClick={()=>setLanguage(lang)}
                  style={{ padding:"6px 12px", borderRadius:10, border:"0.5px solid", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                    background:language===lang?ACCENT:"white",
                    color:language===lang?"white":"#64748B",
                    borderColor:language===lang?"transparent":"#E2E8F0" }}>
                  {lang==="en"?"English":"עברית"}
                </button>
              ))}
            </div>
          </Row>
        </motion.div>

        {/* Subscription */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
          style={{ background:"white", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.07)", padding:"18px 20px", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <CreditCard size={15} color="#22C55E"/>
            <h2 style={{ fontSize:14, fontWeight:700, color:"#1C1917" }}>Subscription</h2>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:"#1C1917", marginBottom:2 }}>
                {profile?.subscription_status==="free" ? "Free Plan" : "Pro Subscriber"}
              </p>
              <p style={{ fontSize:11, color:"#94A3B8" }}>
                {profile?.subscription_status==="free" ? "Daily challenges only" : "All games and stages unlocked"}
              </p>
            </div>
            {profile?.subscription_status==="free" ? (
              <Link href="/pricing" style={{ padding:"8px 16px", borderRadius:12, background:ACCENT, color:"white", fontSize:12, fontWeight:700, textDecoration:"none" }}>
                Upgrade
              </Link>
            ) : (
              <span style={{ fontSize:11, fontWeight:700, color:"#22C55E", background:"#F0FDF4", border:"0.5px solid #86EFAC", padding:"5px 12px", borderRadius:10 }}>
                Active
              </span>
            )}
          </div>
        </motion.div>

        {/* Danger */}
        {user && (
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            style={{ background:"white", borderRadius:20, border:"0.5px solid rgba(239,68,68,0.15)", padding:"18px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#EF4444", marginBottom:2 }}>Sign Out</p>
                <p style={{ fontSize:11, color:"#94A3B8" }}>Sign out of your account on this device</p>
              </div>
              <button onClick={signOut}
                style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid rgba(239,68,68,0.3)", background:"white", color:"#EF4444", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}

        {!user && (
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <p style={{ color:"#94A3B8", fontSize:13, marginBottom:16 }}>Sign in to manage your settings</p>
            <Link href="/auth/signin" style={{ padding:"11px 24px", borderRadius:14, background:ACCENT, color:"white", fontWeight:700, fontSize:13, textDecoration:"none" }}>
              Sign In
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
