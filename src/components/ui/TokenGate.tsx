"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import {
  getTokensRemaining, secondsUntilReset, formatCountdown,
  FREE_DAILY_TOKENS
} from "@/lib/games/tokenEngine";
import { useAuthStore } from "@/store/authStore";

interface TokenGateProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void; // called when user has tokens and confirms play
  gameName: string;
  isDaily?: boolean;
}

export function TokenGate({ open, onClose, onConfirm, gameName, isDaily }: TokenGateProps) {
  const { user, profile } = useAuthStore();
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);
  const [countdown, setCountdown] = useState("");
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  useEffect(() => {
    if (!user) return;
    setTokens(getTokensRemaining(user.id));
    const iv = setInterval(() => {
      setTokens(getTokensRemaining(user.id));
      setCountdown(String(secondsUntilReset(user.id)));
    }, 1000);
    return () => clearInterval(iv);
  }, [user]);

  // Pro or daily — just confirm immediately
  useEffect(() => {
    if (!open) return;
    if (isPro || isDaily || !user) { onConfirm(); return; }
  }, [open, isPro, isDaily]);

  if (!open || isPro || isDaily || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)", display: "flex",
          alignItems: "center", justifyContent: "center",
          zIndex: 200, padding: 24,
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            background: "white", borderRadius: 28, padding: 32,
            maxWidth: 380, width: "100%", position: "relative",
            boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          }}
        >
          <button onClick={onClose}
            style={{ position: "absolute", top: 14, right: 14, padding: 6, borderRadius: 8, background: "#F8F7F5", border: "none", cursor: "pointer", display: "flex" }}>
            <X size={14} color="#94A3B8" />
          </button>

          {tokens > 0 ? (
            <>
              {/* Has tokens */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={22} color="white" fill="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1C1917", fontFamily: "var(--font-sans)" }}>
                    Play {gameName}
                  </h2>
                  <p style={{ fontSize: 12, color: "#94A3B8" }}>This uses 1 daily play</p>
                </div>
              </div>

              {/* Token display */}
              <div style={{ background: "#F8F7F5", borderRadius: 16, padding: "14px 18px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1917" }}>Daily plays remaining</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: "var(--color-accent-primary)", fontFamily: "var(--font-sans)" }}>
                    {tokens} / {FREE_DAILY_TOKENS}
                  </p>
                </div>
                <div style={{ height: 6, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,var(--color-accent-primary),var(--color-accent-primary))", width: `${(tokens/FREE_DAILY_TOKENS)*100}%`, transition: "width 0.4s" }}/>
                </div>
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>
                  <Clock size={10} style={{ display: "inline", marginRight: 4 }}/>
                  Resets in {countdown}
                </p>
              </div>

              <button
                onClick={onConfirm}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(79,110,247,0.3)" }}>
                Play Now <ChevronRight size={15} />
              </button>

              <Link href="/pricing" onClick={onClose}
                style={{ display: "block", textAlign: "center", fontSize: 12, color: "#94A3B8", textDecoration: "none" }}>
                Go Pro for unlimited plays →
              </Link>
            </>
          ) : (
            <>
              {/* No tokens left */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}></div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1C1917", fontFamily: "var(--font-sans)", marginBottom: 6 }}>
                  No plays left today
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>
                  You've used all {FREE_DAILY_TOKENS} free daily plays. Come back tomorrow, or upgrade for unlimited access.
                </p>
              </div>

              <div style={{ background: "#F8F7F5", borderRadius: 16, padding: "14px 18px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 13, color: "#64748B" }}>Resets in</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#1C1917", fontFamily: "monospace" }}>{countdown}</p>
                </div>
              </div>

              <Link href="/pricing" onClick={onClose}
                style={{ display: "block", textAlign: "center", padding: 14, borderRadius: 14, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", fontSize: 14, fontWeight: 700, color: "white", textDecoration: "none", marginBottom: 10, boxShadow: "0 6px 20px rgba(79,110,247,0.3)" }}>
                Upgrade to Pro — Unlimited Plays
              </Link>

              <button onClick={onClose}
                style={{ width: "100%", padding: 11, borderRadius: 12, border: "none", background: "transparent", fontSize: 12, color: "#94A3B8", cursor: "pointer" }}>
                Come back tomorrow
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Token HUD — shows in game header ─────────────────────────────────────────
export function TokenHUD({ userId, isPro }: { userId: string; isPro: boolean }) {
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (isPro) return;
    setTokens(getTokensRemaining(userId));
    const iv = setInterval(() => {
      setTokens(getTokensRemaining(userId));
      setCountdown(String(secondsUntilReset(userId)));
    }, 1000);
    return () => clearInterval(iv);
  }, [userId, isPro]);

  if (isPro) return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#22C55E", fontWeight: 600 }}>
      <Zap size={12} fill="#22C55E" color="#22C55E" /> Pro
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens > 0 ? "var(--color-accent-primary)" : "var(--color-error)", fontWeight: 600 }}>
      <Zap size={12} color={tokens > 0 ? "var(--color-accent-primary)" : "var(--color-error)"} />
      {tokens}/{FREE_DAILY_TOKENS} plays
    </div>
  );
}
