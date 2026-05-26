"use client";

import type { CSSProperties } from "react";
import { Undo2, Lightbulb, CheckCircle2 } from "lucide-react";

interface GameToolbarProps {
  onUndo: () => void;
  onHint: () => void;
  onCheck: () => void;
  hintsRemaining: number;
}

const btnBase: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "10px 0",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  color: "var(--color-text-primary)",
  cursor: "pointer",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  minHeight: 0,
};

export function GameToolbar({ onUndo, onHint, onCheck, hintsRemaining }: GameToolbarProps) {
  const hintDisabled = hintsRemaining === 0;

  return (
    <div style={{
      display: "flex",
      gap: 16,
      padding: 16,
      background: "var(--color-surface)",
      borderTop: "1px solid var(--color-border)",
      flexShrink: 0,
    }}>
      {/* Undo */}
      <button onClick={onUndo} style={btnBase} aria-label="Undo last move">
        <Undo2 size={13} />
        Undo
      </button>

      {/* Hint — with remaining-count badge */}
      <div style={{ flex: 1, position: "relative" }}>
        {hintsRemaining > 0 && (
          <div aria-hidden style={{
            position: "absolute",
            top: -6,
            right: -6,
            zIndex: 1,
            background: "var(--color-accent-secondary)",
            color: "#000",
            fontSize: 9,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            width: 16,
            height: 16,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {hintsRemaining}
          </div>
        )}
        <button
          onClick={onHint}
          disabled={hintDisabled}
          aria-label={`Use hint — ${hintsRemaining} remaining`}
          style={{
            ...btnBase,
            width: "100%",
            flex: "unset" as CSSProperties["flex"],
            opacity: hintDisabled ? 0.35 : 1,
            color: hintDisabled
              ? "var(--color-text-secondary)"
              : "var(--color-accent-primary)",
            borderColor: hintDisabled
              ? "var(--color-border)"
              : "var(--color-accent-primary)",
            cursor: hintDisabled ? "not-allowed" : "pointer",
          }}
        >
          <Lightbulb size={13} />
          Hint
        </button>
      </div>

      {/* Check */}
      <button onClick={onCheck} style={btnBase} aria-label="Check current state">
        <CheckCircle2 size={13} />
        Check
      </button>
    </div>
  );
}