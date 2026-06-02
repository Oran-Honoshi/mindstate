"use client";
import { motion } from "framer-motion";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { Zap } from "lucide-react";

interface CardCelebrationProps {
  title: string;
  description: string;
  onDismiss: () => void;
  variant?: "default" | "mastery" | "achievement";
  // mastery variant
  masteryTier?: "bronze" | "silver" | "gold" | "diamond";
  gameName?: string;
  masteryXpBonus?: number;
  // achievement variant
  badgeSrc?: string;
  achievementXpBonus?: number;
}

const TIER_COLOR: Record<string, string> = {
  bronze: "#B45309",
  silver: "#9CA3AF",
  gold: "#F59E0B",
  diamond: "#A78BFA",
};
const TIER_SYMBOL: Record<string, string> = {
  bronze: "●", silver: "◆", gold: "★", diamond: "◈",
};

export function CardCelebration({
  title, description, onDismiss,
  variant = "default",
  masteryTier, gameName, masteryXpBonus,
  badgeSrc, achievementXpBonus,
}: CardCelebrationProps) {
  const tierColor = masteryTier ? TIER_COLOR[masteryTier] : "#9CA3AF";
  const buttonLabel = variant === "mastery" ? "Nice" : variant === "achievement" ? "Collect" : "Awesome!";
  const eyebrow = variant === "mastery"
    ? "MASTERY UNLOCKED"
    : variant === "achievement"
    ? "ACHIEVEMENT UNLOCKED"
    : null;

  return (
    <>
      <style>{`
        @keyframes me-pop {
          0%   { transform: scale(0.85); opacity: 0 }
          100% { transform: scale(1);    opacity: 1 }
        }
        @keyframes me-ring-pulse {
          0%,100% { opacity: 0.55; transform: scale(1) }
          50%     { opacity: 0.1;  transform: scale(1.12) }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(8,9,12,0.78)",
          backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}
        onClick={onDismiss}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "var(--color-surface)",
            borderRadius: 22,
            border: "1px solid var(--color-border)",
            padding: "28px 24px",
            textAlign: "center",
            maxWidth: 320,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            animation: "me-pop 0.45s ease-out both",
          }}
        >
          {/* Eyebrow */}
          {eyebrow && (
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: variant === "mastery" ? tierColor : "var(--color-gold)",
              marginBottom: 16,
            }}>
              {eyebrow}
            </div>
          )}

          {/* Hero */}
          {variant === "mastery" && masteryTier ? (
            <div style={{ position: "relative", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Pulse ring */}
              <div style={{
                position: "absolute",
                width: 108, height: 108, borderRadius: "50%",
                border: `2px solid ${tierColor}`,
                animation: "me-ring-pulse 1.8s ease-in-out infinite",
                pointerEvents: "none",
              }} />
              {/* Medal circle */}
              <div style={{
                width: 84, height: 84, borderRadius: "50%",
                border: `2px solid ${tierColor}`,
                background: `${tierColor}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, color: tierColor,
              }}>
                {TIER_SYMBOL[masteryTier]}
              </div>
            </div>
          ) : variant === "achievement" && badgeSrc ? (
            <div style={{ marginBottom: 14 }}>
              <img
                src={badgeSrc}
                alt=""
                style={{ width: 92, height: 92, borderRadius: 20, objectFit: "cover", display: "block" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: 14 }}>
              <SparkyImg mood="celebrate" size={80} />
            </div>
          )}

          {/* Title */}
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: variant === "mastery" ? 26 : 22,
            color: "var(--color-text-primary)", lineHeight: 1.2, marginBottom: 10,
          }}>
            {title}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: 13, color: "var(--color-text-secondary)",
            lineHeight: 1.65, marginBottom: 14,
          }}>
            {description}
          </p>

          {/* XP bonus strip — mastery */}
          {variant === "mastery" && masteryXpBonus && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              background: "var(--color-surface-2)", borderRadius: 10, padding: "8px 14px",
              marginBottom: 18, width: "100%",
            }}>
              <SparkyImg mood="happy" size={28} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--color-text-secondary)" }}>
                +{masteryXpBonus} XP bonus
              </span>
            </div>
          )}

          {/* XP chip — achievement */}
          {variant === "achievement" && achievementXpBonus && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18,
              background: "rgba(255,194,75,0.12)",
              border: "1px solid rgba(255,194,75,0.3)",
              borderRadius: 9, padding: "6px 12px",
            }}>
              <Zap size={13} color="var(--color-gold)" fill="var(--color-gold)" strokeWidth={0} />
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                color: "var(--color-gold)",
              }}>+{achievementXpBonus} XP</span>
            </div>
          )}

          {/* Primary button */}
          <button
            onClick={onDismiss}
            style={{
              width: "100%", padding: "14px 0",
              borderRadius: 14, border: "none",
              background: "var(--color-accent-primary)",
              color: "var(--color-on-accent)",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
              cursor: "pointer", marginBottom: 4,
            }}
          >
            {buttonLabel}
          </button>

          {/* Secondary button */}
          <button
            onClick={onDismiss}
            style={{
              width: "100%", padding: "10px 0",
              borderRadius: 14, border: "none",
              background: "transparent",
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
              cursor: "pointer",
            }}
          >
            Share milestone
          </button>
        </div>
      </motion.div>
    </>
  );
}
