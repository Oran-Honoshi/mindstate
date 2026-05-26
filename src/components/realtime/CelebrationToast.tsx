"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap } from "lucide-react";

export interface RecordBreak {
  id: string;
  username: string;
  game_slug: string;
  xp_earned: number;
  stage_number: number;
}

const GAME_NAMES: Record<string, string> = {
  tango: "Tango", memory: "Memory", queens: "Queens",
  sudoku: "Mini Sudoku", zip: "Zip", minesweeper: "Minesweeper",
};

interface CelebrationToastProps {
  record: RecordBreak;
  onDismiss: () => void;
}

export function CelebrationToast({ record, onDismiss }: CelebrationToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{
        background: "white",
        borderRadius: 20,
        padding: "14px 18px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(79,110,247,0.15)",
        border: "0.5px solid rgba(79,110,247,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 300,
        maxWidth: 380,
        cursor: "pointer",
      }}
      onClick={onDismiss}
    >
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Trophy size={18} color="white"/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 2 }}>
          Family record!
        </p>
        <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>
          <strong style={{ color: "var(--color-accent-primary)" }}>{record.username}</strong> scored{" "}
          <strong style={{ color: "#1C1917" }}>{record.xp_earned} XP</strong> on{" "}
          {GAME_NAMES[record.game_slug] ?? record.game_slug} Stage {record.stage_number}
        </p>
      </div>
      <Zap size={14} color="#F59E0B" style={{ flexShrink: 0 }}/>
    </motion.div>
  );
}
