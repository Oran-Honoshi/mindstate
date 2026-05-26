"use client";

import { motion } from "framer-motion";
import { Trophy, BookOpen } from "lucide-react";

interface PracticeToggleProps {
  practice: boolean;
  onChange: (v: boolean) => void;
}

export function PracticeToggle({ practice, onChange }: PracticeToggleProps) {
  return (
    <div style={{
      display: "flex", background: "#F1EDE8", borderRadius: 14,
      padding: 3, gap: 2,
    }}>
      {[
        { value: false, label: "Ranked", icon: Trophy, color: "var(--color-accent-primary)" },
        { value: true,  label: "Practice", icon: BookOpen, color: "#94A3B8" },
      ].map(opt => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 14px", borderRadius: 11, border: "none",
            cursor: "pointer", fontSize: 12, fontWeight: 600,
            background: practice === opt.value ? "white" : "transparent",
            color: practice === opt.value ? opt.color : "#94A3B8",
            boxShadow: practice === opt.value ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s",
          }}>
          <opt.icon size={13} />
          {opt.label}
          {opt.value && (
            <span style={{ fontSize: 9, color: "#94A3B8", marginLeft: 2 }}>½ XP</span>
          )}
        </button>
      ))}
    </div>
  );
}
