"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Volume2, VolumeX, Sun, Moon,
  Zap, Infinity, Download, Accessibility,
} from "lucide-react";
import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";

export function GamesNav() {
  const { isSilentMode, toggleSilentMode, isAccessibilityMode, toggleAccessibilityMode, theme, setTheme } = useSettingsStore();
  const { user, profile } = useAuthStore();
  const { isInstallable, triggerInstall } = usePWAInstall();
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  useEffect(() => {
    if (!user || isPro) return;
    setTokens(getTokensRemaining(user.id));
    const iv = setInterval(() => setTokens(getTokensRemaining(user.id)), 10000);
    return () => clearInterval(iv);
  }, [user, isPro]);

  return (
    <nav className="ms-nav" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: "0 16px", height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "color-mix(in srgb, var(--color-bg) 93%, transparent)",
      backdropFilter: "blur(20px)",
      borderBottom: "0.5px solid var(--color-border)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
        <img src="/icons/icon-192.png" alt="Mind Element" style={{ width: 30, height: 30, borderRadius: "22.5%", objectFit: "cover" }}/>
        <span className="nav-logo-text" style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>
          Mind Element
        </span>
      </Link>

      <div className="nav-links-desktop" style={{ gap: 4 }}>
        {[["Games", "/games"], ["Daily", "/daily"], ["Leaderboard", "/leaderboard"], ["Family", "/family"], ["Pricing", "/pricing"]].map(([l, h]) => (
          <Link key={l} href={h}
            style={{ fontSize: 14, color: "var(--color-text-secondary)", padding: "7px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"}>
            {l}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {user && !isPro && (
          <div className="hide-mobile-flex" style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, background: "var(--color-surface-2)", border: "0.5px solid var(--color-border)" }}>
            <Zap size={12} color={tokens > 0 ? "var(--color-accent-primary)" : "var(--color-error)"} fill={tokens > 0 ? "var(--color-accent-primary)" : "var(--color-error)"}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: tokens > 0 ? "var(--color-accent-primary)" : "var(--color-error)" }}>{tokens}</span>
            <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>/ {FREE_DAILY_TOKENS}</span>
          </div>
        )}
        {user && isPro && (
          <div className="hide-mobile-flex" style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20, background: "rgba(0,255,255,0.1)", border: "0.5px solid rgba(0,255,255,0.2)" }}>
            <Infinity size={12} color="var(--color-accent-primary)"/>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent-primary)" }}>Pro</span>
          </div>
        )}
        {isInstallable && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            onClick={triggerInstall}
            className="hide-mobile-flex"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 20, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", border: "none", cursor: "pointer", color: "var(--color-on-accent)", fontSize: 12, fontWeight: 600 }}>
            <Download size={13}/>
            Install App
          </motion.button>
        )}
        <button onClick={toggleAccessibilityMode} title={isAccessibilityMode ? "Accessibility on" : "Accessibility off"}
          className="hide-mobile-flex"
          style={{ padding: 7, borderRadius: 9, background: "transparent", border: "none", cursor: "pointer", display: "flex", color: isAccessibilityMode ? "var(--color-accent-primary)" : "var(--color-text-secondary)" }}>
          <Accessibility size={15}/>
        </button>
        <button onClick={toggleSilentMode}
          style={{ padding: 7, borderRadius: 9, background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex" }}>
          {isSilentMode ? <VolumeX size={15}/> : <Volume2 size={15}/>}
        </button>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{ padding: 7, borderRadius: 9, background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex" }}>
          {theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}
        </button>
        {user ? (
          <Link href="/profile" style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px 5px 5px", borderRadius: 13, border: "0.5px solid rgba(0,0,0,0.09)", background: "var(--color-surface)", textDecoration: "none", cursor: "pointer" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--color-accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#000" }}>
              {(profile?.username ?? user.email ?? "U")[0].toUpperCase()}
            </div>
            <span className="hide-mobile-flex" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile?.username ?? "Profile"}
            </span>
          </Link>
        ) : (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Link href="/auth/signin" className="hide-mobile-flex"
              style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "7px 12px", borderRadius: 10, textDecoration: "none" }}>
              Sign in
            </Link>
            <Link href="/games"
              style={{ fontSize: 13, fontWeight: 700, color: "var(--color-on-accent)", padding: "8px 14px", borderRadius: 12, background: "var(--color-accent-primary)", textDecoration: "none", boxShadow: "0 3px 10px rgba(0,255,255,0.2)", whiteSpace: "nowrap" }}>
              Start Playing
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
