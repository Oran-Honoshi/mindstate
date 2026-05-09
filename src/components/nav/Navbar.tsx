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
        padding:"12px 32px",
        background:"rgba(253,252,251,0.92)",
        backdropFilter:"blur(20px)",
        borderBottom:"0.5px solid rgba(0,0,0,0.07)",
        boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
          <div style={{
            width:30, height:30, borderRadius:"22.5%", background:ACCENT,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 10px rgba(79,110,247,0.28)",
          }}>
            <Brain size={15} color="white"/>
          </div>
          <span style={{ fontWeight:700, fontSize:16, color:"#1C1917", fontFamily:"Georgia,serif" }}>
            MindState
          </span>
        </Link>

        {/* Center nav links — desktop only */}
        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"8px 14px", borderRadius:12, textDecoration:"none",
              fontSize:13, fontWeight:600, transition:"all 0.15s",
              background: isActive(link.href) ? "rgba(79,110,247,0.08)" : "transparent",
              color: isActive(link.href) ? "#4F6EF7" : "#64748B",
            }}>
              <link.icon size={14}/>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <button onClick={toggleSilentMode} title={isSilentMode?"Enable sound":"Mute"}
            style={{ padding:8, borderRadius:10, background:"transparent", border:"none", cursor:"pointer", color:"#94A3B8", display:"flex", alignItems:"center" }}>
            {isSilentMode ? <VolumeX size={16}/> : <Volume2 size={16}/>}
          </button>
          <button onClick={toggleTheme}
            style={{ padding:8, borderRadius:10, background:"transparent", border:"none", cursor:"pointer", color:"#94A3B8", display:"flex", alignItems:"center" }}>
            {theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}
          </button>

          {user ? (
            <div style={{ position:"relative", marginLeft:4 }}>
              <button onClick={() => setProfileOpen(o => !o)} style={{
                display:"flex", alignItems:"center", gap:7,
                padding:"6px 10px 6px 6px", borderRadius:14,
                border:"0.5px solid rgba(0,0,0,0.09)", background:"white",
                cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{
                  width:26, height:26, borderRadius:"50%", background:ACCENT,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:700, color:"white",
                }}>
                  {(profile?.username ?? user.email ?? "U")[0].toUpperCase()}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:"#374151", maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {profile?.username ?? "Profile"}
                </span>
                <ChevronDown size={12} color="#94A3B8"/>
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
                        position:"absolute", right:0, top:"calc(100% + 8px)", width:210,
                        background:"white", border:"0.5px solid rgba(0,0,0,0.08)",
                        borderRadius:18, boxShadow:"0 16px 48px rgba(0,0,0,0.12)",
                        zIndex:50, overflow:"hidden",
                      }}>
                      <div style={{ padding:"14px 16px 10px", borderBottom:"0.5px solid #F8F7F5" }}>
                        <p style={{ fontSize:13, fontWeight:700, color:"#1C1917", marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {profile?.username ?? "Player"}
                        </p>
                        <p style={{ fontSize:11, color:"#94A3B8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {user.email}
                        </p>
                      </div>
                      {[
                        { href:"/profile",     icon:User,     label:"Profile"     },
                        { href:"/leaderboard", icon:Trophy,   label:"Leaderboard" },
                        { href:"/family",      icon:Users,    label:"Family"      },
                        { href:"/settings",    icon:Settings, label:"Settings"    },
                      ].map(item => (
                        <Link key={item.href} href={item.href}
                          onClick={() => setProfileOpen(false)}
                          style={{
                            display:"flex", alignItems:"center", gap:10,
                            padding:"11px 16px", fontSize:13, color:"#374151",
                            textDecoration:"none", borderBottom:"0.5px solid #FAFAF9",
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F8F7F5"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          <item.icon size={14} color="#94A3B8"/>
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { signOut(); setProfileOpen(false); }}
                        style={{
                          width:"100%", display:"flex", alignItems:"center", gap:10,
                          padding:"11px 16px", fontSize:13, color:"#EF4444",
                          background:"transparent", border:"none", cursor:"pointer", textAlign:"left",
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FEF2F2"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <LogOut size={14}/>
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:4 }}>
              <Link href="/auth/signin" style={{ fontSize:13, color:"#64748B", padding:"8px 12px", borderRadius:10, textDecoration:"none" }}>
                Sign in
              </Link>
              <Link href="/auth/signup" style={{
                fontSize:13, fontWeight:700, color:"white",
                padding:"8px 16px", borderRadius:12, background:ACCENT,
                textDecoration:"none", boxShadow:"0 4px 10px rgba(79,110,247,0.25)",
              }}>
                Start Free
              </Link>
            </div>
          )}

          {/* Mobile burger */}
          <button onClick={() => setMenuOpen(o => !o)}
            style={{ padding:8, borderRadius:10, background:"transparent", border:"none", cursor:"pointer", color:"#64748B", display:"none" }}
            className="ms-burger">
            {menuOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.2)", zIndex:40 }}
              onClick={() => setMenuOpen(false)}/>
            <motion.div
              initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
              transition={{ type:"spring", damping:28, stiffness:300 }}
              style={{
                position:"fixed", right:0, top:0, bottom:0, width:260,
                background:"white", zIndex:50,
                boxShadow:"-8px 0 40px rgba(0,0,0,0.1)",
                display:"flex", flexDirection:"column",
              }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"0.5px solid #F1EDE8" }}>
                <span style={{ fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif" }}>Menu</span>
                <button onClick={() => setMenuOpen(false)}
                  style={{ padding:6, borderRadius:8, background:"#F8F7F5", border:"none", cursor:"pointer" }}>
                  <X size={16} color="#64748B"/>
                </button>
              </div>
              <div style={{ flex:1, padding:12, display:"flex", flexDirection:"column", gap:4 }}>
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"12px 14px", borderRadius:12, textDecoration:"none",
                      fontSize:14, fontWeight:500,
                      color: isActive(link.href) ? "#4F6EF7" : "#374151",
                      background: isActive(link.href) ? "rgba(79,110,247,0.07)" : "transparent",
                    }}>
                    <link.icon size={16}/>
                    {link.label}
                  </Link>
                ))}
              </div>
              {!user && (
                <div style={{ padding:16, borderTop:"0.5px solid #F1EDE8", display:"flex", flexDirection:"column", gap:8 }}>
                  <Link href="/auth/signin" onClick={() => setMenuOpen(false)}
                    style={{ display:"block", textAlign:"center", padding:"12px", borderRadius:12, border:"0.5px solid #E2E8F0", fontSize:13, fontWeight:600, color:"#374151", textDecoration:"none" }}>
                    Sign in
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMenuOpen(false)}
                    style={{ display:"block", textAlign:"center", padding:"12px", borderRadius:12, background:ACCENT, fontSize:13, fontWeight:700, color:"white", textDecoration:"none" }}>
                    Start Free
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media(max-width:768px){
          .ms-burger { display:flex !important; }
        }
      `}</style>
    </>
  );
}
