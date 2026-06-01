"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { triggerConfetti } from "@/components/effects/Confetti";

interface CenturyOverlayProps {
  gameName: string;
  onDismiss: () => void;
}

export function CenturyOverlay({ gameName, onDismiss }: CenturyOverlayProps) {
  useEffect(() => {
    triggerConfetti();
    const t = setTimeout(onDismiss, 5000);
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
        background: "rgba(0,0,0,0.96)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: 32,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.06, type: "spring", stiffness: 240, damping: 18 }}
      >
        <SparkyImg mood="violet" size={148} />
      </motion.div>

      <motion.div
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.45 }}
      >
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 80, color: "#8E7CFF", lineHeight: 0.9, marginBottom: 14 }}>
          CENTURY
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
          {gameName} · All 100 Stages Complete
        </p>
      </motion.div>
    </motion.div>
  );
}
