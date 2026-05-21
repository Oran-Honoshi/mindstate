// src/components/ui/CompletionPopup.tsx
"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { incrementReviewSession } from "@/components/modals/RatingModal";
import { incrementShareSession } from "@/hooks/useShareTrigger";

interface CompletionPopupProps {
  open?: boolean;
  stage: number;
  elapsed: string;
  difficulty: string;
  finalXP?: number;
  xpEarned?: number;
  onRetry: () => void;
  onNext: () => void;
  onShare?: () => void;
}

export function CompletionPopup({
  open, stage, elapsed, difficulty, finalXP, xpEarned, onRetry, onNext, onShare,
}: CompletionPopupProps) {
  const xp = finalXP ?? xpEarned ?? 0;

  // ── Fire review + share triggers whenever a stage is completed ──
  useEffect(() => {
    if (!open) return;
    incrementReviewSession();
    incrementShareSession();
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(14px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 200, padding: 24,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{
            background: "var(--surface)", borderRadius: 28, padding: 36,
            maxWidth: 340, width: "100%", textAlign: "center",
            boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h2 style={{
            fontSize: 26, fontWeight: 700, color: "var(--text1)",
            fontFamily: "Georgia,serif", marginBottom: 4,
          }}>
            Stage {stage} Complete!
          </h2>
          <p style={{ fontSize: 13, color: "var(--text4)", marginBottom: 24 }}>
            {elapsed} · {difficulty}
          </p>
          <div style={{
            background: "var(--bg2)", borderRadius: 16,
            padding: 20, marginBottom: 20,
          }}>
            <p style={{
              fontSize: 11, color: "var(--text4)", fontWeight: 600,
              marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              XP Earned
            </p>
            <p style={{
              fontSize: 52, fontWeight: 700, color: "#4F6EF7",
              fontFamily: "Georgia,serif",
            }}>
              {xp}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onRetry}
              style={{
                flex: 1, padding: 13, borderRadius: 14,
                border: "0.5px solid var(--border2)", background: "var(--surface)",
                fontSize: 13, fontWeight: 600, color: "var(--text2)", cursor: "pointer",
              }}
            >
              Retry
            </button>
            <button
              onClick={onNext}
              style={{
                flex: 2, padding: 13, borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              Next Stage →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}