"use client";
import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";

interface Props {
  user: User;
  username?: string | null;
  isPro: boolean;
  currentStreak: number;
  tokens: number;
}

export function ProfileHeader({ user, username, isPro, currentStreak, tokens }: Props) {
  const initial = (username ?? user.email ?? "U")[0].toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
      {/* Avatar */}
      <div style={{
        width: 64, height: 64, borderRadius: 16, flexShrink: 0,
        background: "var(--color-surface)",
        border: "1px solid var(--color-accent-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, fontWeight: 800, color: "var(--color-accent-primary)",
        fontFamily: "var(--font-mono)",
      }}>
        {initial}
      </div>

      {/* Name + badges */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 4, letterSpacing: "-0.01em" }}>
          {username ?? "Player"}
        </h1>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
          {user.email}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 8px",
            borderRadius: 3, fontFamily: "var(--font-mono)",
            background: isPro ? "rgba(0,255,255,0.1)" : "var(--color-surface-2)",
            color: isPro ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
            border: isPro ? "1px solid rgba(0,255,255,0.25)" : "1px solid var(--color-border)" }}>
            {isPro ? "PRO" : "FREE"}
          </span>
          {currentStreak > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9,
              fontWeight: 700, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 3,
              fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}>
              <Flame size={9} fill="#F59E0B" /> {currentStreak} DAY STREAK
            </span>
          )}
          {!isPro && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9,
              fontWeight: 700, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 3,
              fontFamily: "var(--font-mono)", background: "rgba(0,255,255,0.05)",
              border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
              <Zap size={9} /> {tokens}/{FREE_DAILY_TOKENS} PLAYS
            </span>
          )}
        </div>
      </div>

      {!isPro && (
        <Link href="/pricing" style={{ flexShrink: 0, padding: "10px 18px", borderRadius: 8,
          background: "var(--color-accent-primary)", color: "#000", fontWeight: 700,
          fontSize: 12, textDecoration: "none" }}>
          Go Pro
        </Link>
      )}
    </motion.div>
  );
}
