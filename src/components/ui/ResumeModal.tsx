"use client";
import { motion } from "framer-motion";
import { Play, RotateCcw, X } from "lucide-react";

interface ResumeModalProps {
  gameSlug: string;
  stageNumber: number;
  savedAt: number;
  onResume: () => void;
  onStartFresh: () => void;
  onDismiss: () => void;
}

function timeAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function slugToName(slug: string): string {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function ResumeModal({ gameSlug, stageNumber, savedAt, onResume, onStartFresh, onDismiss }: ResumeModalProps) {
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
          position: "relative",
          background: "var(--color-surface)", borderRadius: 28, padding: 32,
          maxWidth: 340, width: "100%", textAlign: "center",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
      >
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            position: "absolute", top: 14, right: 14,
            width: 30, height: 30, borderRadius: "50%",
            border: "0.5px solid var(--color-border)",
            background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--color-text-secondary)",
          }}
        >
          <X size={14} />
        </button>

        <div style={{ fontSize: 48, marginBottom: 12 }}>💾</div>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)", marginBottom: 4,
        }}>
          Resume {slugToName(gameSlug)}?
        </h2>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
          Stage {stageNumber}
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
          <Play size={15} /> Continue Stage {stageNumber}
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
          <RotateCcw size={13} /> Start Fresh
        </button>
      </motion.div>
    </motion.div>
  );
}
