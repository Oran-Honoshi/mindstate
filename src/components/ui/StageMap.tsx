"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { getLastStage, getCompletedStages } from "@/lib/games/stageProgress";

interface StageMapProps {
  gameSlug: string;
  totalStages: number;
  currentStage: number;
  onSelectStage: (stage: number) => void;
  onClose: () => void;
}

export function StageMap({ gameSlug, totalStages, currentStage, onSelectStage, onClose }: StageMapProps) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [lastStage, setLastStage] = useState(1);

  useEffect(() => {
    setCompleted(getCompletedStages(gameSlug));
    setLastStage(getLastStage(gameSlug));
  }, [gameSlug]);

  // Show stages in groups of 10
  const COLS = 10;
  const visibleStages = Math.min(totalStages, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: "var(--surface)", borderRadius: 24, padding: 24,
          maxWidth: 480, width: "100%", maxHeight: "80vh", overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text1)", fontFamily: "Georgia,serif", margin: 0 }}>
            Stage Map
          </h2>
          <button onClick={onClose}
            style={{ padding: "6px 14px", borderRadius: 10, border: "0.5px solid var(--border2)", background: "var(--surface)", fontSize: 12, cursor: "pointer", color: "var(--text3)" }}>
            Close
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 6 }}>
          {Array.from({ length: visibleStages }, (_, i) => {
            const s = i + 1;
            const isDone = completed.has(s);
            const isCurrent = s === lastStage;
            const isLocked = s > lastStage;
            const isActive = s === currentStage;

            return (
              <motion.button
                key={s}
                whileTap={{ scale: 0.88 }}
                onClick={() => { onSelectStage(s); onClose(); }}
                disabled={isLocked}
                style={{
                  width: "100%", aspectRatio: "1",
                  borderRadius: 8, border: "none",
                  background: isActive
                    ? "linear-gradient(135deg,#4F6EF7,#9C6BE8)"
                    : isCurrent
                    ? "#EEF2FF"
                    : isDone
                    ? "#F0FDF4"
                    : isLocked
                    ? "var(--bg2)"
                    : "var(--bg3)",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700,
                  color: isActive ? "white" : isCurrent ? "#4F6EF7" : isDone ? "#16A34A" : isLocked ? "var(--text4)" : "var(--text3)",
                  boxShadow: isCurrent ? "0 0 0 2px #4F6EF7" : "none",
                  opacity: isLocked ? 0.4 : 1,
                  position: "relative",
                }}
              >
                {isDone ? <Check size={10} strokeWidth={3}/> : s}
                {isCurrent && !isDone && (
                  <div style={{
                    position: "absolute", top: -3, right: -3,
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#4F6EF7",
                  }}/>
                )}
              </motion.button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 11, color: "var(--text4)", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#F0FDF4", border: "1px solid #86EFAC" }}/> Completed
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#EEF2FF", border: "2px solid #4F6EF7" }}/> Current
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--bg2)", opacity: 0.4 }}/> Locked
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
