"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { SparkyImg } from "@/components/ui/SparkyImg";

interface AchievementCardProps {
  title: string;
  description: string;
  imageSrc: string;
  sparkyMood?: "surprised" | "celebrate" | "happy";
  onDismiss: () => void;
}

export function AchievementCard({ title, description, imageSrc, sparkyMood = "surprised", onDismiss }: AchievementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.78)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.82, y: 28, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.82, y: 28, opacity: 0 }}
        transition={{ type: "spring", stiffness: 290, damping: 24 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-accent-primary)",
          borderRadius: 20,
          padding: "32px 28px 28px",
          maxWidth: 340, width: "100%",
          textAlign: "center",
          position: "relative",
          boxShadow: "0 0 52px rgba(0,255,255,0.14), 0 24px 64px rgba(0,0,0,0.55)",
        }}
      >
        <button
          onClick={onDismiss}
          style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: 4, lineHeight: 1 }}
        >
          <X size={16} />
        </button>

        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)", marginBottom: 20 }}>
          Achievement Unlocked
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <img src={imageSrc} alt={title} width={80} height={80} style={{ objectFit: "contain" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <SparkyImg mood={sparkyMood} size={60} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", margin: "0 0 8px" }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55, margin: 0 }}>
          {description}
        </p>

        <motion.button
          onClick={onDismiss}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop: 22, width: "100%", padding: "12px 0",
            borderRadius: 10, border: "none", cursor: "pointer",
            background: "var(--color-accent-primary)", color: "#000",
            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em",
          }}
        >
          Awesome!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
