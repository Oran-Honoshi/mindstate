"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Brain, Gamepad2, Target, Users } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}

const INTENTS = [
  { id: "sharp",     label: "Stay Sharp",          sub: "Keep your mind in peak condition", Icon: Brain },
  { id: "boredom",   label: "Beat Boredom",         sub: "Turn idle time into brain gains",   Icon: Gamepad2 },
  { id: "challenge", label: "Daily Challenge",       sub: "One focused puzzle every day",      Icon: Target },
  { id: "compete",   label: "Compete with Family",   sub: "Family leaderboards and records",   Icon: Users },
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

  const panelStyle: CSSProperties = { background: "var(--color-surface)", border: "1px solid var(--color-border)" };

  const cardStyle = (id: string): CSSProperties => {
    const isActive = selected === id;
    return {
      width: "100%",
      padding: "14px 16px",
      borderRadius: isPaper ? 4 : 12,
      cursor: "pointer",
      border: isActive
        ? "1.5px solid rgba(0,255,255,0.7)"
        : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--color-border)",
      background: isActive
        ? isDark ? "rgba(0,255,255,0.07)" : "rgba(0,204,204,0.08)"
        : isDark ? "rgba(12,22,38,0.75)" : "var(--color-surface-2)",
      boxShadow: isActive ? "0 0 14px rgba(0,255,255,0.18)" : "none",
      display: "flex", alignItems: "center", gap: 14,
      transition: "all 0.2s ease",
      textAlign: "left",
    };
  };

  return (
    <motion.div
      {...slideProps}
      style={{ ...panelStyle, borderRadius: br, padding: "40px 32px", display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div>
        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.01em", color: "var(--color-text-primary)", margin: "0 0 6px" }}>
          Why are you here?
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>
          Pick what resonates most with you.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {INTENTS.map(({ id, label, sub, Icon }) => {
          const isActive = selected === id;
          return (
            <motion.button key={id} onClick={() => onSelect(id)} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} style={cardStyle(id)}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: isActive ? "rgba(0,255,255,0.12)" : "var(--color-surface)",
                border: isActive ? "1px solid rgba(0,255,255,0.25)" : "1px solid var(--color-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={16} color={isActive ? "var(--color-accent-primary)" : "var(--color-text-secondary)"} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13, color: isActive ? "var(--color-accent-primary)" : "var(--color-text-primary)", margin: "0 0 2px" }}>
                  {label}
                </p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>
                  {sub}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={onNext}
        disabled={!selected}
        whileHover={selected ? { scale: 1.02 } : {}}
        whileTap={selected ? { scale: 0.97 } : {}}
        style={{
          width: "100%", padding: "14px 0", border: "none",
          cursor: selected ? "pointer" : "not-allowed",
          borderRadius: isPaper ? 4 : 12,
          background: selected ? "var(--color-accent-primary)" : "var(--color-surface-2)",
          color: selected ? "#000" : "var(--color-text-secondary)",
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
          letterSpacing: "0.08em", textTransform: "uppercase",
          transition: "all 0.2s ease", opacity: selected ? 1 : 0.5,
        }}
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
