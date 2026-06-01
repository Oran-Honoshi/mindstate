"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { triggerConfetti } from "@/components/effects/Confetti";

interface LevelUpOverlayProps {
  levelName: string;
  levelColor: string;
  onDismiss: () => void;
}

export function LevelUpOverlay({ levelName, levelColor, onDismiss }: LevelUpOverlayProps) {
  useEffect(() => {
    triggerConfetti();
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 32,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 20 }}
      >
        <SparkyImg mood="gold" size={128} />
      </motion.div>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
          Level Up
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 52, color: levelColor, lineHeight: 1 }}>
          {levelName}
        </h1>
      </motion.div>
    </motion.div>
  );
}
