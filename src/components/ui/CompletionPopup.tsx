// src/components/ui/CompletionPopup.tsx
"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SkipForward } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const router = useRouter();

  // Show "Go to Latest" only when it would go somewhere different from stage+1
  const showGoToLatest =
    onGoToLatest != null &&
    nextUncompletedStage != null &&
    nextUncompletedStage !== stage + 1;

  // ── Fire review + share triggers, then route to /complete ──
  useEffect(() => {
    if (!open) return;
    incrementReviewSession();
    incrementShareSession();

    // Navigate to dedicated complete page for any /games/[slug] route
    const match = pathname.match(/^\/games\/([^/]+)/);
    if (match) {
      const slug = match[1];
      const params = new URLSearchParams({ xp: String(xp), time: elapsed, hints: "0" });
      router.push(`/complete/${slug}/${stage}?${params.toString()}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            background: "var(--color-surface)",
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
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
              marginBottom: 4,
            }}
          >
            Stage {stage} Complete!
          </h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
            {elapsed} · {difficulty}
          </p>

          {/* XP block */}
          <div
            style={{
              background: "var(--color-surface-2)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
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
                color: "var(--color-accent-primary)",
                fontFamily: "var(--font-sans)",
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
                border: "0.5px solid var(--color-border)",
                background: "var(--color-surface)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-secondary)",
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
                background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))",
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