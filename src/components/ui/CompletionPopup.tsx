// src/components/ui/CompletionPopup.tsx
"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SkipForward } from "lucide-react";
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
  /** Go to the numerically next stage (stage + 1). Always present. */
  onNext: () => void;
  /**
   * Optional. When provided a second "Go to Latest" button appears.
   * This should call getNextUncompletedStage() and navigate there.
   * Only shown when nextUncompletedStage !== stage + 1 (i.e. there's a gap).
   */
  onGoToLatest?: () => void;
  /**
   * The stage number that onGoToLatest would navigate to.
   * Used to decide whether to show the button at all.
   */
  nextUncompletedStage?: number;
  onShare?: () => void;
}

export function CompletionPopup({
  open,
  stage,
  elapsed,
  difficulty,
  finalXP,
  xpEarned,
  onRetry,
  onNext,
  onGoToLatest,
  nextUncompletedStage,
  onShare,
}: CompletionPopupProps) {
  const xp = finalXP ?? xpEarned ?? 0;

  // Show "Go to Latest" only when it would go somewhere different from stage+1
  const showGoToLatest =
    onGoToLatest != null &&
    nextUncompletedStage != null &&
    nextUncompletedStage !== stage + 1;

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
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(14px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: 24,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{
            background: "var(--surface)",
            borderRadius: 28,
            padding: 36,
            maxWidth: 340,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "var(--text1)",
              fontFamily: "Georgia,serif",
              marginBottom: 4,
            }}
          >
            Stage {stage} Complete!
          </h2>
          <p style={{ fontSize: 13, color: "var(--text4)", marginBottom: 24 }}>
            {elapsed} · {difficulty}
          </p>

          {/* XP block */}
          <div
            style={{
              background: "var(--bg2)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "var(--text4)",
                fontWeight: 600,
                marginBottom: 4,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              XP Earned
            </p>
            <p
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#4F6EF7",
                fontFamily: "Georgia,serif",
              }}
            >
              {xp}
            </p>
          </div>

          {/* Primary row: Retry + Next */}
          <div style={{ display: "flex", gap: 10, marginBottom: showGoToLatest ? 10 : 0 }}>
            <button
              onClick={onRetry}
              style={{
                flex: 1,
                padding: 13,
                borderRadius: 14,
                border: "0.5px solid var(--border2)",
                background: "var(--surface)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text2)",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <button
              onClick={onNext}
              style={{
                flex: 2,
                padding: 13,
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
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
              Next Stage <ChevronRight size={14} />
            </button>
          </div>

          {/* Secondary row: Go to Latest (only when there's a gap) */}
          {showGoToLatest && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onGoToLatest}
              style={{
                width: "100%",
                padding: 13,
                borderRadius: 14,
                border: "1.5px solid rgba(245,158,11,0.35)",
                background: "rgba(245,158,11,0.06)",
                fontSize: 13,
                fontWeight: 700,
                color: "#B45309",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <SkipForward size={14} />
              Go to Stage {nextUncompletedStage}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}