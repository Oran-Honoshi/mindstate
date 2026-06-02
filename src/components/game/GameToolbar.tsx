"use client";

import { Undo, Lightbulb, Check } from "lucide-react";

interface GameToolbarProps {
  onUndo: () => void;
  onHint: () => void;
  onCheck?: () => void;
  hintsRemaining: number;
}

const baseBtn: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "11px 0",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 13,
  cursor: "pointer",
  minHeight: 0,
  transition: "transform 0.1s, background 0.15s, border-color 0.15s",
};

const microLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 8,
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: "var(--color-text-secondary)",
};

export function GameToolbar({ onUndo, onHint, onCheck, hintsRemaining }: GameToolbarProps) {
  const hintDisabled = hintsRemaining === 0;

  return (
    <div style={{
      display: "flex",
      gap: 9,
      padding: "12px 16px 20px",
      background: "var(--color-surface)",
      borderTop: "1px solid var(--color-border)",
      flexShrink: 0,
    }}>
      {/* Undo */}
      <button
        onClick={onUndo}
        aria-label="Undo"
        style={baseBtn}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
        onMouseUp={e => (e.currentTarget.style.transform = "")}
        onMouseLeave={e => (e.currentTarget.style.transform = "")}
      >
        <Undo size={19} strokeWidth={2} color="var(--color-text-primary)" />
        <span style={microLabel}>UNDO</span>
      </button>

      {/* Hint */}
      <button
        onClick={onHint}
        disabled={hintDisabled}
        aria-label={`Hint — ${hintsRemaining} left`}
        style={{
          ...baseBtn,
          opacity: hintDisabled ? 0.45 : 1,
          cursor: hintDisabled ? "not-allowed" : "pointer",
        }}
        onMouseDown={e => { if (!hintDisabled) e.currentTarget.style.transform = "scale(0.96)"; }}
        onMouseUp={e => (e.currentTarget.style.transform = "")}
        onMouseLeave={e => (e.currentTarget.style.transform = "")}
      >
        <Lightbulb size={19} strokeWidth={2} color="var(--color-gold)" />
        <span style={microLabel}>HINT · {hintsRemaining} LEFT</span>
      </button>

      {/* Check — only when game provides it */}
      {onCheck && (
        <button
          onClick={onCheck}
          aria-label="Check"
          style={{
            ...baseBtn,
            flex: 1.4,
            background: "var(--color-accent-primary)",
            border: "none",
          }}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
          onMouseUp={e => (e.currentTarget.style.transform = "")}
          onMouseLeave={e => (e.currentTarget.style.transform = "")}
        >
          <Check size={19} strokeWidth={2.6} color="var(--color-on-accent)" />
          <span style={{ ...microLabel, color: "var(--color-on-accent)", fontWeight: 700 }}>CHECK</span>
        </button>
      )}
    </div>
  );
}
