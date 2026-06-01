"use client";
import { motion } from "framer-motion";
import { SparkyImg } from "@/components/ui/SparkyImg";

interface CardCelebrationProps {
  title: string;
  description: string;
  onDismiss: () => void;
}

export function CardCelebration({ title, description, onDismiss }: CardCelebrationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.82, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--color-border)",
          padding: "40px 28px 32px",
          textAlign: "center",
          maxWidth: 320,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <SparkyImg mood="celebrate" size={80} />
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
          {description}
        </p>
        <button
          onClick={onDismiss}
          style={{
            marginTop: 4,
            padding: "13px 36px",
            borderRadius: "var(--radius-pill)",
            border: "none",
            background: "var(--color-accent-primary)",
            color: "var(--color-on-accent)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Awesome!
        </button>
      </motion.div>
    </motion.div>
  );
}
