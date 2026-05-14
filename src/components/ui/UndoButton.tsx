"use client";
import { Undo2 } from "lucide-react";

interface UndoButtonProps {
  onUndo: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export function UndoButton({ onUndo, canUndo, disabled }: UndoButtonProps) {
  return (
    <button
      onClick={onUndo}
      disabled={!canUndo || disabled}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "6px 14px", borderRadius: 20,
        border: "0.5px solid rgba(100,116,139,0.35)",
        background: "rgba(100,116,139,0.06)",
        cursor: !canUndo || disabled ? "not-allowed" : "pointer",
        fontSize: 12, fontWeight: 600, color: "#475569",
        opacity: !canUndo || disabled ? 0.4 : 1,
      }}>
      <Undo2 size={13} color="#475569"/>
      Undo
    </button>
  );
}
