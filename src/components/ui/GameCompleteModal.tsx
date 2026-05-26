// src/components/ui/GameCompleteModal.tsx
"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { triggerConfetti } from "@/components/effects/Confetti";

interface GameCompleteModalProps {
  open: boolean;
  gameName: string;
  totalStages: number;
  onPlayAgain: () => void; // goes to stage 1
  onClose: () => void;
}

export function GameCompleteModal({
  open,
  gameName,
  totalStages,
  onPlayAgain,
  onClose,
}: GameCompleteModalProps) {
  useEffect(() => {
    if (!open) return;
    // Fire confetti twice for extra celebration
    triggerConfetti();
    const t = setTimeout(() => triggerConfetti(), 800);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 500,
            padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 32 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{
              background: "var(--color-surface)",
              borderRadius: 32,
              padding: "40px 32px 32px",
              maxWidth: 360,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 40px 100px rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background glow */}
            <div
              style={{
                position: "absolute",
                top: -60,
                left: "50%",
                transform: "translateX(-50%)",
                width: 200,
                height: 200,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Crown */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 18,
                delay: 0.15,
              }}
              style={{ marginBottom: 20, display: "inline-block" }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(234,88,12,0.12))",
                  border: "2px solid rgba(245,158,11,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <Crown size={44} color="#F59E0B" fill="rgba(245,158,11,0.15)" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#F59E0B",
                  marginBottom: 8,
                }}
              >
                Mastered
              </p>
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-sans)",
                  marginBottom: 8,
                  lineHeight: 1.15,
                }}
              >
                {gameName} Complete
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  marginBottom: 28,
                  lineHeight: 1.6,
                }}
              >
                You have completed all{" "}
                <strong style={{ color: "var(--color-text-secondary)" }}>
                  {totalStages.toLocaleString()}
                </strong>{" "}
                stages. A crown has been awarded to your vault.
              </p>
            </motion.div>

            {/* XP badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              style={{
                background:
                  "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(234,88,12,0.06))",
                border: "0.5px solid rgba(245,158,11,0.2)",
                borderRadius: 16,
                padding: "14px 20px",
                marginBottom: 24,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "#B45309",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Achievement Unlocked
              </p>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#92400E",
                }}
              >
                🏆 {gameName} Master
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              style={{ display: "flex", gap: 10 }}
            >
              <Link
                href="/games"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: 13,
                  borderRadius: 14,
                  border: "0.5px solid var(--color-border)",
                  background: "var(--color-surface)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <ArrowLeft size={13} /> Vault
              </Link>
              <button
                onClick={onPlayAgain}
                style={{
                  flex: 2,
                  padding: 13,
                  borderRadius: 14,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#F59E0B,#EA580C)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <RotateCcw size={13} /> Play Again
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}