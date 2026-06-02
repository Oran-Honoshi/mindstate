"use client";
import { Users, Check } from "lucide-react";
import { motion } from "framer-motion";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { triggerConfetti } from "@/components/effects/Confetti";
import { useEffect } from "react";

interface LevelUpOverlayProps {
  levelNumber: number;
  rankName: string;
  currentXP: number;
  nextLevelXP: number;
  onDismiss: () => void;
}

export function LevelUpOverlay({ levelNumber, rankName, currentXP, nextLevelXP, onDismiss }: LevelUpOverlayProps) {
  useEffect(() => {
    triggerConfetti();
  }, []);

  const pct = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "radial-gradient(130% 80% at 50% 16%, #15233a, #0B0C0F 62%)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Main content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 30, position: "relative", zIndex: 4, textAlign: "center",
      }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--color-gold)", marginBottom: 22,
          }}
        >
          Level up
        </motion.div>

        {/* Sparky with gold aura */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 20 }}
          style={{ position: "relative", marginBottom: 14 }}
        >
          <div style={{
            position: "absolute",
            inset: -26, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,194,75,0.22), transparent 70%)",
            pointerEvents: "none",
          }} />
          <SparkyImg mood="gold" size={128} />
        </motion.div>

        {/* Level number */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 44,
            color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1,
          }}>
            Level {levelNumber}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            justifyContent: "center", marginTop: 8,
          }}>
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: 14,
              color: "var(--color-text-secondary)",
            }}>
              {rankName}
            </span>
          </div>
        </motion.div>

        {/* XP progress bar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{ width: "78%", marginTop: 28 }}
        >
          <div style={{
            height: 5, background: "rgba(255,255,255,0.08)",
            borderRadius: 3, overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.55, duration: 0.8, ease: "easeOut" }}
              style={{
                height: "100%", borderRadius: 3,
                background: "linear-gradient(90deg, var(--color-accent-primary), var(--color-gold))",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
              {currentXP} XP
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
              {nextLevelXP} → LVL {levelNumber + 1}
            </span>
          </div>
        </motion.div>

        {/* Unlock feature card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            width: "78%", marginTop: 18,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 13, padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 11,
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "rgba(47,230,224,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Users size={17} color="var(--color-accent-primary)" strokeWidth={2} />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--color-accent-primary)",
            }}>
              Unlocked
            </div>
            <div style={{
              fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12.5,
              color: "var(--color-text-primary)", marginTop: 2,
            }}>
              Family challenge invites
            </div>
          </div>
          <Check size={18} color="#54D06A" strokeWidth={2.4} />
        </motion.div>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: "0 30px 30px", position: "relative", zIndex: 4 }}>
        <button
          onClick={onDismiss}
          style={{
            width: "100%", padding: "14px 0",
            borderRadius: 14, border: "none",
            background: "var(--color-accent-primary)",
            color: "var(--color-on-accent)",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
