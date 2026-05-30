"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settingsStore";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}

const slideProps = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export function StepName({ value, onChange, onNext }: Props) {
  const { theme } = useSettingsStore();
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const br = isPaper ? 4 : 20;
  const [focused, setFocused] = useState(false);

  const panelStyle: CSSProperties = { background: "var(--color-surface)", border: "1px solid var(--color-border)" };

  return (
    <motion.div
      {...slideProps}
      style={{ ...panelStyle, borderRadius: br, padding: "40px 32px", display: "flex", flexDirection: "column", gap: 28 }}
    >
      <h2 style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-primary)", margin: 0 }}>
        What&apos;s your name?
      </h2>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") onNext(); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Your name"
        maxLength={32}
        autoFocus
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: isPaper ? 4 : 10,
          fontFamily: "var(--font-mono)",
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: "var(--color-text-primary)",
          background: isDark ? "rgba(4,10,22,0.9)" : "var(--color-surface-2)",
          border: focused
            ? `1.5px solid rgba(0,255,255,${isDark ? "0.75" : "0.5"})`
            : isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--color-border)",
          boxShadow: focused && isDark ? "0 0 0 3px rgba(0,255,255,0.08), 0 0 12px rgba(0,255,255,0.12)" : "none",
          outline: "none",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
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
          Continue
        </motion.button>

        <button
          onClick={() => { onChange(""); onNext(); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-secondary)",
            textAlign: "center",
            padding: "8px 0",
          }}
        >
          Skip
        </button>
      </div>
    </motion.div>
  );
}
