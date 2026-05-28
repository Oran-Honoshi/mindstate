"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settingsStore";

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}

const INTENTS = [
  { id: "sharp", label: "Stay Sharp" },
  { id: "boredom", label: "Beat Boredom" },
  { id: "challenge", label: "Daily Challenge" },
  { id: "compete", label: "Compete" },
];

const slideProps = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export function StepIntent({ selected, onSelect, onNext }: Props) {
  const { theme } = useSettingsStore();
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const br = isPaper ? 4 : 20;

  const panelStyle: CSSProperties = isDark
    ? { background: "rgba(8,16,28,0.92)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }
    : { background: "var(--color-surface)", border: "1px solid var(--color-border)" };

  const pillStyle = (id: string): CSSProperties => {
    const isActive = selected === id;
    return {
      padding: "14px 20px",
      borderRadius: isPaper ? 4 : 12,
      cursor: "pointer",
      border: isActive
        ? "1.5px solid rgba(0,255,255,0.7)"
        : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--color-border)",
      background: isActive
        ? isDark ? "rgba(0,255,255,0.07)" : "rgba(0,204,204,0.08)"
        : isDark ? "rgba(12,22,38,0.75)" : "var(--color-surface-2)",
      boxShadow: isActive ? "0 0 14px rgba(0,255,255,0.18)" : "none",
      display: "flex",
      alignItems: "center",
      width: "100%",
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: isActive ? "var(--color-accent-primary)" : "var(--color-text-primary)",
      transition: "all 0.2s ease",
    };
  };

  return (
    <motion.div
      {...slideProps}
      style={{ ...panelStyle, borderRadius: br, padding: "40px 32px", display: "flex", flexDirection: "column", gap: 24 }}
    >
      <h2 style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-primary)", margin: 0 }}>
        Why are you here?
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {INTENTS.map(({ id, label }) => (
          <motion.button key={id} onClick={() => onSelect(id)} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} style={pillStyle(id)}>
            {label}
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={onNext}
        disabled={!selected}
        whileHover={selected ? { scale: 1.02 } : {}}
        whileTap={selected ? { scale: 0.97 } : {}}
        style={{
          width: "100%",
          padding: "14px 0",
          border: "none",
          cursor: selected ? "pointer" : "not-allowed",
          borderRadius: isPaper ? 4 : 12,
          background: selected
            ? isDark
              ? "linear-gradient(135deg, rgba(0,255,255,0.88), rgba(57,255,20,0.72))"
              : "var(--color-accent-primary)"
            : isDark ? "rgba(255,255,255,0.06)" : "var(--color-surface-2)",
          color: selected
            ? isDark ? "#060d18" : "var(--color-on-accent)"
            : "var(--color-text-secondary)",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          boxShadow: selected && isDark ? "0 0 20px rgba(0,255,255,0.25)" : "none",
          transition: "all 0.2s ease",
          opacity: selected ? 1 : 0.5,
        }}
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
