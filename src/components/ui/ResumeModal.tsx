"use client";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

interface ResumeModalProps {
  gameSlug: string;
  stageName: string | number;
  savedAt: number;
  onResume: () => void;
  onStartFresh: () => void;
}

function timeAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
  return `${Math.floor(secs/86400)}d ago`;
}

export function ResumeModal({ stageName, savedAt, onResume, onStartFresh }: ResumeModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          background: "var(--color-surface)", borderRadius: 28, padding: 32,
          maxWidth: 340, width: "100%", textAlign: "center",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>💾</div>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)", marginBottom: 8,
        }}>
          Pick up where you left off?
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>
          You have an unfinished game on Stage {stageName}.
        </p>
        <p style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Saved {timeAgo(savedAt)}
        </p>

        <button
          onClick={onResume}
          style={{
            width: "100%", padding: 14, borderRadius: 14, border: "none",
            background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))",
            fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginBottom: 10,
          }}
        >
          <Play size={15}/> Continue Stage {stageName}
        </button>

        <button
          onClick={onStartFresh}
          style={{
            width: "100%", padding: 12, borderRadius: 14,
            border: "0.5px solid var(--color-border)", background: "var(--color-surface)",
            fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <RotateCcw size={13}/> Start Fresh
        </button>
      </motion.div>
    </motion.div>
  );
}
