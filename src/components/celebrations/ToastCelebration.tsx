"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { SparkyImg } from "@/components/ui/SparkyImg";

interface ToastCelebrationProps {
  xpEarned: number;
  onDismiss: () => void;
}

export function ToastCelebration({ xpEarned, onDismiss }: ToastCelebrationProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      onClick={onDismiss}
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 90,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-pill)",
        padding: "10px 20px 10px 10px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        cursor: "pointer",
        minWidth: 200,
      }}
    >
      <SparkyImg mood="happy" size={36} />
      <div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 2 }}>
          XP Earned
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--color-accent-primary)", lineHeight: 1 }}>
          +{xpEarned}
        </p>
      </div>
    </motion.div>
  );
}
