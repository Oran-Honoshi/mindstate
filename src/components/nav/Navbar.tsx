"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, VolumeX, Sun, Moon, Menu, X,
  User, Trophy, Settings, LogOut, ChevronDown,
  Gamepad2, BarChart2, Users, Star, Tag,
} from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";

const ACCENT = "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))";

export function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const { isSilentMode, toggleSilentMode, theme, setTheme } = useSettingsStore();
  const { user, profile, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { href: "/games",       label: "Games",       icon: Gamepad2  },
    { href: "/daily",       label: "Daily",        icon: Star      },
    { href: "/leaderboard", label: "Leaderboard",  icon: BarChart2 },
    { href: "/family",      label: "Family",       icon: Users     },
    { href: "/pricing",     label: "Pricing",      icon: Tag       },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        // Tighter padding on mobile — 12px sides, 24px on desktop
        padding: "0 12px", height: 56,
        background: "color-mix(in srgb, var(--color-bg) 93%, transparent)",
        backdropFilter: "blur(20px)",
        borderBottom: "0.5px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>

        {/* ── Logo ── */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", flexShrink: 0 }}>
          <img
            src="/icons/icon-192.png"
            alt="MindElement"
            style={{ width: 30, height: 30, borderRadius: "22.5%", objectFit: "cover" }}
          />
          {/* Hide full name on very small screens — show only on ≥480px */}
          <span className="nav-logo-text" style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>
            MindElement
          </span>
        </Link>

        {/* ── Desktop center nav ── */}
        <div className="nav-links-desktop">
          {navLinks.map(link => (
            isLanding ? (
              <a key={link.href}
                href={"#" + link.href.replace("/", "")}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(link.href.replace("/", ""))?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 12px", borderRadius: 10, textDecoration: "none",
                  fontSize: 13, fontWeight: 500, color: "#64748B",
                }}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 12px", borderRadius: 10, textDecoration: "none",
                  fontSize: 13, fontWeight: 500, transition: "all 0.15s",
                  background: isActive(link.href) ? "rgba(0,255,255,0.08)" : "transparent",
                  color: isActive(link.href) ? "var(--color-accent-primary)" : "#64748B",
                }}>
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* ── Right side ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>

          {/* Silent mode — only on game pages, hidden on landing */}
          {!isLanding && (
            <button onClick={toggleSilentMode}
              style={{ padding: 7, borderRadius: 9, background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex" }}>
              {isSilentMode ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}

          {/* Theme toggle */}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{ padding: 7, borderRadius: 9, background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex" }}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Auth area */}
          {isLanding ? (
            // Landing: show sign in + start free (desktop only — mobile uses hamburger)
            <div className="nav-links-desktop" style={{ gap: 6 }}>
              <Link href="/auth/signin"
                style={{
                  fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)",
                  padding: "7px 12px", borderRadius: 10, textDecoration: "none",
                  border: "0.5px solid var(--color-border)", background: "var(--color-surface)",
                }}>
                Sign in
              </Link>
              <Link href="/auth/signup"
                style={{
                  fontSize: 13, fontWeight: 700, color: "#000",
                  padding: "7px 14px", borderRadius: 11, background: ACCENT,
                  textDecoration: "none", boxShadow: "0 3px 8px rgba(0,255,255,0.2)",
                }}>
                Start Free
              </Link>
            </div>
          ) : user ? (
            // Logged in: profile dropdown (desktop) / hamburger opens to profile (mobile)
            <>
              {/* Desktop profile button */}
              <div className="nav-links-desktop" style={{ position: "relative", marginLeft: 2 }}>
                <button onClick={() => setProfileOpen(o => !o)} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 8px 5px 5px", borderRadius: 12,
                  border: "0.5px solid rgba(0,0,0,0.09)", background: "var(--color-surface)",
                  cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", background: ACCENT,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#000", flexShrink: 0,
                  }}>
                    {(profile?.username ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)",
                    maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {profile?.username ?? "Profile"}
                  </span>
                  <ChevronDown size={11} color="#94A3B8" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.14 }}
                        style={{
                          position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200,
                          background: "var(--color-surface)", border: "0.5px solid var(--color-border)",
                          borderRadius: 18, boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
                          zIndex: 50, overflow: "hidden",
                        }}>
                        <div style={{ padding: "13px 15px 9px", borderBottom: "0.5px solid #F8F7F5" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {profile?.username ?? "Player"}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user.email}
                          </p>
                        </div>
                        {[
                          { href: "/profile",     icon: User,     label: "Profile"     },
                          { href: "/leaderboard", icon: Trophy,   label: "Leaderboard" },
                          { href: "/family",      icon: Users,    label: "Family"      },
                          { href: "/settings",    icon: Settings, label: "Settings"    },
                        ].map(item => (
                          <Link key={item.href} href={item.href}
                            onClick={() => setProfileOpen(false)}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "10px 15px", fontSize: 13, color: "var(--color-text-secondary)",
                              textDecoration: "none", borderBottom: "0.5px solid #FAFAF9",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F8F7F5"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                            <item.icon size={14} color="#94A3B8" />
                            {item.label}
                          </Link>
                        ))}
                        <button onClick={() => { signOut(); setProfileOpen(false); }}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 15px", fontSize: 13, color: "var(--color-error)",
                            background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FEF2F2"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile: just avatar circle, opens hamburger */}
              <button className="nav-mobile-only"
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  width: 30, height: 30, borderRadius: "50%", background: ACCENT,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#000",
                  border: "none", cursor: "pointer", marginLeft: 2,
                }}>
                {(profile?.username ?? user.email ?? "U")[0].toUpperCase()}
              </button>
            </>
          ) : (
            // Not logged in — desktop shows sign in, mobile shows hamburger
            <>
              <div className="nav-links-desktop" style={{ gap: 5, marginLeft: 4 }}>
                <Link href="/auth/signin"
                  style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "7px 11px", borderRadius: 10, textDecoration: "none" }}>
                  Sign in
                </Link>
                <Link href="/auth/signup"
                  style={{
                    fontSize: 13, fontWeight: 700, color: "#000",
                    padding: "7px 14px", borderRadius: 11, background: ACCENT,
                    textDecoration: "none", boxShadow: "0 3px 8px rgba(0,255,255,0.2)",
                  }}>
                  Start Free
                </Link>
              </div>
            </>
          )}

          {/* Hamburger — mobile only, always shown */}
          <button onClick={() => setMenuOpen(o => !o)} className="nav-mobile-only"
            style={{
              padding: 7, borderRadius: 9, background: "transparent",
              border: "none", cursor: "pointer", color: "var(--color-text-secondary)", marginLeft: 2,
              display: "flex",
            }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", zIndex: 40 }}
              onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{
                position: "fixed", right: 0, top: 0, bottom: 0, width: 260,
                background: "var(--color-surface)", zIndex: 50,
                boxShadow: "-8px 0 40px rgba(0,0,0,0.1)",
                display: "flex", flexDirection: "column",
              }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px", borderBottom: "0.5px solid var(--color-border)",
              }}>
                <span style={{ fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>Menu</span>
                <button onClick={() => setMenuOpen(false)}
                  style={{ padding: 6, borderRadius: 8, background: "var(--color-surface-2)", border: "none", cursor: "pointer" }}>
                  <X size={16} color="#64748B" />
                </button>
              </div>
              <div style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: 12, textDecoration: "none",
                      fontSize: 14, fontWeight: 500,
                      color: isActive(link.href) ? "var(--color-accent-primary)" : "#374151",
                      background: isActive(link.href) ? "rgba(0,255,255,0.07)" : "transparent",
                    }}>
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}
                <div style={{ height: "0.5px", background: "var(--color-border)", margin: "8px 0" }} />
                {user ? (
                  <>
                    {[
                      { href: "/profile",  icon: User,     label: "Profile"  },
                      { href: "/settings", icon: Settings, label: "Settings" },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "12px 14px", borderRadius: 12, textDecoration: "none",
                          fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)",
                        }}>
                        <item.icon size={16} color="#94A3B8" />
                        {item.label}
                      </Link>
                    ))}
                    <button onClick={() => { signOut(); setMenuOpen(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 14px", borderRadius: 12,
                        fontSize: 14, fontWeight: 500, color: "var(--color-error)",
                        background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                      }}>
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
                    <Link href="/auth/signin" onClick={() => setMenuOpen(false)}
                      style={{
                        display: "block", textAlign: "center", padding: "12px",
                        borderRadius: 12, border: "0.5px solid var(--color-border)",
                        fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", textDecoration: "none",
                      }}>
                      Sign in
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMenuOpen(false)}
                      style={{
                        display: "block", textAlign: "center", padding: "12px",
                        borderRadius: 12, background: ACCENT,
                        fontSize: 13, fontWeight: 700, color: "#000", textDecoration: "none",
                      }}>
                      Start Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}