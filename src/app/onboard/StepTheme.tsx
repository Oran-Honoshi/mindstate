"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useSettingsStore, type Theme } from "@/store/settingsStore";

interface ThemeColors {
  bg: string; surface: string; surface2: string; accent: string; text: string; textSub: string;
}

interface PreviewProps {
  id: Theme; label: string; colors: ThemeColors; selected: boolean; onSelect: () => void;
}

function ThemeCard({ id, label, colors, selected, onSelect }: PreviewProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        flex: 1,
        padding: 0,
        cursor: "pointer",
        border: selected ? "2px solid #00FFFF" : "2px solid transparent",
        borderRadius: 14,
        overflow: "hidden",
        background: "transparent",
        boxShadow: selected
          ? "0 0 18px rgba(0,255,255,0.28), 0 4px 16px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.18)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div style={{ background: colors.surface, padding: "7px 9px", display: "flex", gap: 5, alignItems: "center" }}>
        <div style={{ width: 7, height: 7, borderRadius: 4, background: colors.accent }} />
        <div style={{ width: 14, height: 3, borderRadius: 2, background: colors.textSub, opacity: 0.35 }} />
        <div style={{ width: 10, height: 3, borderRadius: 2, background: colors.textSub, opacity: 0.2 }} />
      </div>
      <div style={{ background: colors.bg, padding: "8px 7px", display: "flex", flexDirection: "column", gap: 4 }}>
        {[0, 1, 2].map(ri => (
          <div key={ri} style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map(ci => (
              <div
                key={ci}
                style={{
                  flex: 1,
                  height: 16,
                  borderRadius: 3,
                  background:
                    ri === 0 && ci === 1 ? colors.accent + "55"
                    : ri === 1 && ci === 0 ? colors.accent + "30"
                    : colors.surface,
                  border: `1px solid ${colors.surface2}`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ background: colors.surface, padding: "7px 6px", textAlign: "center" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.text }}>
          {label}
        </span>
      </div>
    </motion.button>
  );
}

const THEMES: { id: Theme; label: string; colors: ThemeColors }[] = [
  { id: "dark",  label: "Dark",  colors: { bg: "#121212", surface: "#1E1E1E", surface2: "#2A2A2A", accent: "#00FFFF", text: "#F5F5F5", textSub: "#A0A0A0" } },
  { id: "light", label: "Light", colors: { bg: "#FFFFFF", surface: "#F5F5F5", surface2: "#E8E8E8", accent: "#00CCCC", text: "#121212", textSub: "#555555" } },
  { id: "paper", label: "Paper", colors: { bg: "#F2E8D9", surface: "#EDE0C8", surface2: "#E5D5B0", accent: "#2D5A1B", text: "#1A1714", textSub: "#4A3F35" } },
];

const slideProps = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

interface Props {
  onFinish: () => void;
}

export function StepTheme({ onFinish }: Props) {
  const { theme, setTheme } = useSettingsStore();
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const br = isPaper ? 4 : 20;

  const panelStyle: CSSProperties = isDark
    ? { background: "rgba(8,16,28,0.92)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }
    : { background: "var(--color-surface)", border: "1px solid var(--color-border)" };

  return (
    <motion.div
      {...slideProps}
      style={{ ...panelStyle, borderRadius: br, padding: "40px 32px", display: "flex", flexDirection: "column", gap: 28 }}
    >
      <h2 style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-primary)", margin: 0 }}>
        Choose your look
      </h2>

      <div style={{ display: "flex", gap: 12 }}>
        {THEMES.map(t => (
          <ThemeCard key={t.id} {...t} selected={theme === t.id} onSelect={() => setTheme(t.id)} />
        ))}
      </div>

      <motion.button
        onClick={onFinish}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: "100%",
          padding: "14px 0",
          border: "none",
          cursor: "pointer",
          borderRadius: isPaper ? 4 : 12,
          background: isDark
            ? "linear-gradient(135deg, rgba(0,255,255,0.88), rgba(57,255,20,0.72))"
            : "var(--color-accent-primary)",
          color: isDark ? "#060d18" : "var(--color-on-accent)",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          boxShadow: isDark ? "0 0 22px rgba(0,255,255,0.28)" : "var(--shadow-sm)",
        }}
      >
        Start Playing
      </motion.button>
    </motion.div>
  );
}
