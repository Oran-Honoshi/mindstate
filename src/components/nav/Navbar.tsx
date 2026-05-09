"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Volume2, VolumeX, Sun, Moon, Menu, X,
  User, Trophy, Settings, LogOut, ChevronDown,
  Gamepad2, BarChart2, Users,
} from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";

const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";

export function Navbar() {
  const pathname = usePathname();
  const { isSilentMode, toggleSilentMode, theme, toggleTheme } = useSettingsStore();
  const { user, profile, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { href:"/games",       label:"Games",       icon:Gamepad2  },
    { href:"/leaderboard", label:"Leaderboard", icon:BarChart2 },
    { href:"/family",      label:"Family",      icon:Users     },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:50,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px", height:58,
        background:"rgba(253,252,251,0.94)",
        backdropFilter:"blur(20px)",
        borderBottom:"0.5px solid rgba(0,0,0,0.07)",
        boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
          <div style={{ width:28, height:28, borderRadius:"22.5%", background:ACCENT,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 3px 8px rgba(79,110,247,0.28)" }}>
            <Brain size={14} color="white"/>
          </div>
          <span style={{ fontWeight:700, fontSize:15, color:"#1C1917", fontFamily:"Georgia,serif" }}>
            MindState
          </span>
        </Link>

        {/* Desktop center nav */}
        <div className="nav-links-desktop">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 13px", borderRadius:11, textDecoration:"none",
              fontSize:13, fontWeight:600, transition:"all 0.15s",
              background: isActive(link.href) ? "rgba(79,110,247,0.08)" : "transparent",
              color: isActive(link.href) ? "#4F6EF7" : "#64748B",
            }}>
              <link.icon size={14}/>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:3 }}>
          <button onClick={toggleSilentMode}
            style={{ padding:8, borderRadius:10, background:"transparent", border:"none", cursor:"pointer", color:"#94A3B8", display:"flex" }}>
            {isSilentMode ? <VolumeX size={15}/> : <Volume2 size={15}/>}
          </button>
          <button onClick={toggleTheme}
            style={{ padding:8, borderRadius:10, background:"transparent", border:"none", cursor:"pointer", color:"#94A3B8", display:"flex" }}>
            {theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}
          </button>

          {user ? (
            <div style={{ position:"relative", marginLeft:4 }}>
              <button onClick={() => setProfileOpen(o=>!o)} style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"5px 9px 5px 5px", borderRadius:13,
                border:"0.5px solid rgba(0,0,0,0.09)", background:"white",
                cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:ACCENT,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:700, color:"white" }}>
                  {(profile?.username ?? user.email ?? "U")[0].toUpperCase()}
                </div>
                <span className="hide-mobile" style={{ fontSize:12, fontWeight:600, color:"#374151", maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {profile?.username ?? "Profile"}
                </span>
                <ChevronDown size={11} color="#94A3B8"/>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={() => setProfileOpen(false)}/>
                    <motion.div
                      initial={{ opacity:0, y:8, scale:0.96 }}
                      animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:8, scale:0.96 }}
                      transition={{ duration:0.14 }}
                      style={{
                        position:"absolute", right:0, top:"calc(100% + 8px)", width:200,
                        background:"white", border:"0.5px solid rgba(0,0,0,0.08)",
                        borderRadius:18, boxShadow:"0 16px 48px rgba(0,0,0,0.12)",
                        zIndex:50, overflow:"hidden",
                      }}>
                      <div style={{ padding:"13px 15px 9px", borderBottom:"0.5px solid #F8F7F5" }}>
                        <p style={{ fontSize:13, fontWeight:700, color:"#1C1917", marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {profile?.username ?? "Player"}
                        </p>
                        <p style={{ fontSize:11, color:"#94A3B8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {user.email}
                        </p>
                      </div>
                      {[
                        { href:"/profile",     icon:User,     label:"Profile"      },
                        { href:"/leaderboard", icon:Trophy,   label:"Leaderboard"  },
                        { href:"/family",      icon:Users,    label:"Family"       },
                        { href:"/settings",    icon:Settings, label:"Settings"     },
                      ].map(item => (
                        <Link key={item.href} href={item.href}
                          onClick={() => setProfileOpen(false)}
                          style={{
                            display:"flex", alignItems:"center", gap:10,
                            padding:"10px 15px", fontSize:13, color:"#374151",
                            textDecoration:"none", borderBottom:"0.5px solid #FAFAF9",
                            transition:"background 0.1s",
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#F8F7F5"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}>
                          <item.icon size={14} color="#94A3B8"/>
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={() => { signOut(); setProfileOpen(false); }}
                        style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                          padding:"10px 15px", fontSize:13, color:"#EF4444",
                          background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#FEF2F2"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}>
                        <LogOut size={14}/>
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:5, marginLeft:4 }}>
              <Link href="/auth/signin" className="hide-mobile"
                style={{ fontSize:13, color:"#64748B", padding:"7px 11px", borderRadius:10, textDecoration:"none" }}>
                Sign in
              </Link>
              <Link href="/auth/signup"
                style={{ fontSize:13, fontWeight:700, color:"white",
                  padding:"7px 14px", borderRadius:11, background:ACCENT,
                  textDecoration:"none", boxShadow:"0 3px 8px rgba(79,110,247,0.25)" }}>
                Start Free
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(o=>!o)} className="nav-mobile-only"
            style={{ padding:8, borderRadius:10, background:"transparent", border:"none", cursor:"pointer", color:"#64748B", marginLeft:4 }}>
            {menuOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.18)", zIndex:40 }}
              onClick={() => setMenuOpen(false)}/>
            <motion.div
              initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
              transition={{ type:"spring", damping:28, stiffness:300 }}
              style={{ position:"fixed", right:0, top:0, bottom:0, width:260,
                background:"white", zIndex:50,
                boxShadow:"-8px 0 40px rgba(0,0,0,0.1)",
                display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"16px 20px", borderBottom:"0.5px solid #F1EDE8" }}>
                <span style={{ fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif" }}>Menu</span>
                <button onClick={() => setMenuOpen(false)}
                  style={{ padding:6, borderRadius:8, background:"#F8F7F5", border:"none", cursor:"pointer" }}>
                  <X size={16} color="#64748B"/>
                </button>
              </div>
              <div style={{ flex:1, padding:12, display:"flex", flexDirection:"column", gap:3 }}>
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setMenuOpen(false)}
                    style={{ display:"flex", alignItems:"center", gap:10,
                      padding:"12px 14px", borderRadius:12, textDecoration:"none",
                      fontSize:14, fontWeight:500,
                      color: isActive(link.href) ? "#4F6EF7" : "#374151",
                      background: isActive(link.href) ? "rgba(79,110,247,0.07)" : "transparent" }}>
                    <link.icon size={16}/>
                    {link.label}
                  </Link>
                ))}
                <div style={{ height:"0.5px", background:"#F1EDE8", margin:"8px 0" }}/>
                {user ? (
                  <>
                    {[
                      { href:"/profile",  icon:User,     label:"Profile"  },
                      { href:"/settings", icon:Settings, label:"Settings" },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                        style={{ display:"flex", alignItems:"center", gap:10,
                          padding:"12px 14px", borderRadius:12, textDecoration:"none",
                          fontSize:14, fontWeight:500, color:"#374151" }}>
                        <item.icon size={16} color="#94A3B8"/>
                        {item.label}
                      </Link>
                    ))}
                    <button onClick={() => { signOut(); setMenuOpen(false); }}
                      style={{ display:"flex", alignItems:"center", gap:10,
                        padding:"12px 14px", borderRadius:12,
                        fontSize:14, fontWeight:500, color:"#EF4444",
                        background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                      <LogOut size={16}/>
                      Sign out
                    </button>
                  </>
                ) : null}
              </div>
              {!user && (
                <div style={{ padding:"12px 16px 24px", borderTop:"0.5px solid #F1EDE8", display:"flex", flexDirection:"column", gap:8 }}>
                  <Link href="/auth/signin" onClick={() => setMenuOpen(false)}
                    style={{ display:"block", textAlign:"center", padding:"12px",
                      borderRadius:12, border:"0.5px solid #E2E8F0",
                      fontSize:13, fontWeight:600, color:"#374151", textDecoration:"none" }}>
                    Sign in
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMenuOpen(false)}
                    style={{ display:"block", textAlign:"center", padding:"12px",
                      borderRadius:12, background:ACCENT,
                      fontSize:13, fontWeight:700, color:"white", textDecoration:"none" }}>
                    Start Free
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
