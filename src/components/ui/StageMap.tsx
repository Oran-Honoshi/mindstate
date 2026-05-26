// src/components/ui/StageMap.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  getLastStage,
  getCompletedStages,
  isGameFullyCompleted,
} from "@/lib/games/stageProgress";

interface StageMapProps {
  gameSlug: string;
  totalStages: number;
  currentStage: number;
  onSelectStage: (stage: number) => void;
  onClose: () => void;
}

export function StageMap({
  gameSlug,
  totalStages,
  currentStage,
  onSelectStage,
  onClose,
}: StageMapProps) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [lastStage, setLastStage] = useState(1);
  const [fullyDone, setFullyDone] = useState(false);

  useEffect(() => {
    const c = getCompletedStages(gameSlug);
    setCompleted(c);
    setLastStage(getLastStage(gameSlug));
    setFullyDone(isGameFullyCompleted(gameSlug, totalStages));
  }, [gameSlug, totalStages]);

  // Show up to 100 stages per page to keep the grid manageable
  const visibleStages = Math.min(totalStages, 100);
  const COLS = 10;

  function stageStatus(s: number): "active" | "completed" | "skipped" | "current" | "locked" {
    if (s === currentStage) return "active";
    if (completed.has(s)) return "completed";
    // Skipped = between 1 and lastStage but NOT completed and NOT active
    if (s < lastStage) return "skipped";
    if (s === lastStage) return "current";
    return "locked";
  }

  const styles: Record<
    ReturnType<typeof stageStatus>,
    { bg: string; color: string; border: string; cursor: string; opacity: number }
  > = {
    active: {
      bg: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))",
      color: "white",
      border: "none",
      cursor: "pointer",
      opacity: 1,
    },
    completed: {
      bg: "#F0FDF4",
      color: "#16A34A",
      border: "1px solid #86EFAC",
      cursor: "pointer",
      opacity: 1,
    },
    skipped: {
      bg: "#FFFBEB",
      color: "#B45309",
      border: "1px solid #FDE68A",
      cursor: "pointer",
      opacity: 1,
    },
    current: {
      bg: "#EEF2FF",
      color: "var(--color-accent-primary)",
      border: "2px solid var(--color-accent-primary)",
      cursor: "pointer",
      opacity: 1,
    },
    locked: {
      bg: "var(--color-surface-2)",
      color: "var(--color-text-secondary)",
      border: "none",
      cursor: "not-allowed",
      opacity: 0.35,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: "var(--color-surface)",
          borderRadius: 24,
          padding: 24,
          maxWidth: 480,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-sans)",
                margin: 0,
              }}
            >
              Stage Map
            </h2>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
              {completed.size} / {totalStages} completed
              {fullyDone && " · 👑 Mastered"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              border: "0.5px solid var(--color-border)",
              background: "var(--color-surface)",
              fontSize: 12,
              cursor: "pointer",
              color: "var(--color-text-secondary)",
            }}
          >
            Close
          </button>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 5,
          }}
        >
          {Array.from({ length: visibleStages }, (_, i) => {
            const s = i + 1;
            const status = stageStatus(s);
            const st = styles[status];
            const isLocked = status === "locked";

            return (
              <motion.button
                key={s}
                whileTap={!isLocked ? { scale: 0.85 } : {}}
                onClick={() => {
                  if (isLocked) return;
                  onSelectStage(s);
                  onClose();
                }}
                disabled={isLocked}
                title={
                  status === "skipped"
                    ? `Stage ${s} — not yet completed`
                    : status === "completed"
                    ? `Stage ${s} — completed`
                    : undefined
                }
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: 7,
                  background: st.bg,
                  border: st.border,
                  cursor: st.cursor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  color: st.color,
                  opacity: st.opacity,
                  position: "relative",
                  outline: "none",
                }}
              >
                {status === "completed" ? (
                  <Check size={9} strokeWidth={3} />
                ) : status === "skipped" ? (
                  // Orange dot overlay for skipped
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      color: "#B45309",
                    }}
                  >
                    {s}
                  </span>
                ) : (
                  s
                )}

                {/* Pulse dot on current stage */}
                {status === "current" && (
                  <div
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--color-accent-primary)",
                      boxShadow: "0 0 0 2px var(--color-surface)",
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            fontSize: 10,
            color: "var(--color-text-secondary)",
            flexWrap: "wrap",
          }}
        >
          {[
            { bg: "#F0FDF4", border: "1px solid #86EFAC", label: "Completed" },
            { bg: "#FFFBEB", border: "1px solid #FDE68A", label: "Skipped" },
            { bg: "#EEF2FF", border: "2px solid var(--color-accent-primary)", label: "Current" },
            {
              bg: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))",
              border: "none",
              label: "Playing now",
            },
            { bg: "var(--color-surface-2)", border: "none", label: "Locked", opacity: 0.35 },
          ].map((item) => (
            <span
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: item.bg,
                  border: item.border,
                  opacity: item.opacity ?? 1,
                  flexShrink: 0,
                }}
              />
              {item.label}
            </span>
          ))}
        </div>

        {/* Skipped stages callout */}
        {Array.from({ length: visibleStages }, (_, i) => i + 1).some(
          (s) => s < lastStage && !completed.has(s)
        ) && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(245,158,11,0.07)",
              border: "0.5px solid rgba(245,158,11,0.25)",
              fontSize: 11,
              color: "#B45309",
              fontWeight: 600,
            }}
          >
            You have skipped stages. Tap any orange stage to go back and complete
            it — finishing it will offer to jump to your latest unlocked stage.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}