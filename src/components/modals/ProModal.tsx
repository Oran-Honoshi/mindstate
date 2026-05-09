"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Check, Zap, Trophy, Users, Infinity } from "lucide-react";
import Link from "next/link";

interface ProModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

const FEATURES = [
  { icon: Infinity,  text: "1,000 stages per game" },
  { icon: Zap,       text: "Infinite Mode — no stage limit" },
  { icon: Trophy,    text: "Global & Family leaderboards" },
  { icon: Users,     text: "Family groups up to 7 members" },
  { icon: Lock,      text: "All 20 games unlocked" },
];

export function ProModal({ open, onClose, feature }: ProModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
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

            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
              borderRadius: 18, padding: "20px 20px", marginBottom: 24, textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "white", fontFamily: "Georgia,serif", marginBottom: 4 }}>
                Pro Feature
              </h2>
              {feature && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  "{feature}" requires a Pro subscription
                </p>
              )}
            </div>

            {/* Features */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                What you unlock
              </p>
              {FEATURES.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < FEATURES.length - 1 ? "0.5px solid #F8F7F5" : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <f.icon size={13} color="#4F6EF7" />
                  </div>
                  <p style={{ fontSize: 13, color: "#374151" }}>{f.text}</p>
                  <Check size={13} color="#22C55E" style={{ marginLeft: "auto", flexShrink: 0 }} />
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div style={{ background: "#F8F7F5", borderRadius: 16, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 2 }}>Individual Plan</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#1C1917", fontFamily: "Georgia,serif" }}>
                  $2<span style={{ fontSize: 13, fontWeight: 400, color: "#94A3B8" }}>/mo</span>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 2 }}>Family Plan from</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#4F6EF7", fontFamily: "Georgia,serif" }}>
                  $5<span style={{ fontSize: 13, fontWeight: 400, color: "#94A3B8" }}>/mo</span>
                </p>
              </div>
            </div>

            <Link href="/pricing" onClick={onClose}
              style={{
                display: "block", textAlign: "center", padding: 14,
                borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                fontSize: 14, fontWeight: 700, color: "white", textDecoration: "none",
                boxShadow: "0 8px 24px rgba(79,110,247,0.3)",
              }}>
              Upgrade to Pro — $2/mo
            </Link>
            <button onClick={onClose}
              style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 12, border: "none", background: "transparent", fontSize: 12, color: "#94A3B8", cursor: "pointer" }}>
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
