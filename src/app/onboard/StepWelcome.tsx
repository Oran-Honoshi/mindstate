"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settingsStore";
import { SparkyImg } from "@/components/ui/SparkyImg";

interface Props {
  onNext: () => void;
}

const slideProps = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export function StepWelcome({ onNext }: Props) {
  const { theme } = useSettingsStore();
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const br = isPaper ? 4 : 24;

  const panelStyle: CSSProperties = { background: "var(--color-surface)", border: "1px solid var(--color-border)" };

  return (
    <motion.div
      {...slideProps}
      style={{
        ...panelStyle,
        borderRadius: br,
        padding: "56px 32px 44px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
      }}
    >
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          boxShadow: isDark
            ? "0 0 36px rgba(0,255,255,0.2), 0 8px 32px rgba(0,0,0,0.55)"
            : "var(--shadow-md)",
        }}
      >
        <SparkyImg mood="idle" size={96} />
      </motion.div>

      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
        <h1
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          MindElement
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-text-secondary)",
            margin: 0,
          }}
        >
          Sharper Every Day
        </p>
      </div>

      <motion.button
        onClick={onNext}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: "100%",
          padding: "14px 0",
          border: "none",
          cursor: "pointer",
          borderRadius: isPaper ? 4 : 12,
          background: "var(--color-accent-primary)",
          color: "#000",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Get Started
      </motion.button>
    </motion.div>
  );
}
