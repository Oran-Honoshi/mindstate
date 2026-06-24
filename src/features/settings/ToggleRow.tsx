"use client";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

interface ToggleRowProps {
  iconName: IconName;
  label: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
  hasBorder?: boolean;
}

export function ToggleRow({ iconName, label, desc, checked, onToggle, hasBorder = true }: ToggleRowProps) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        cursor: "pointer",
        ...(hasBorder ? { borderBottom: "0.5px solid var(--border)" } : {}),
      }}
    >
      <Icon name={iconName} size={18} color="var(--muted)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
          {label}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
          {desc}
        </div>
      </div>
      <div style={{
        width: 40, height: 22, borderRadius: 11, position: "relative", flexShrink: 0,
        background: checked ? "var(--accent)" : "var(--surf2)",
        border: "1px solid var(--border)",
        transition: "background 150ms ease",
      }}>
        <motion.div
          animate={{ x: checked ? 19 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            position: "absolute", top: 2,
            width: 16, height: 16, borderRadius: 8,
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </div>
  );
}
