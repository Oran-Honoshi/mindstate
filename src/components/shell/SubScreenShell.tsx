"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

interface SubScreenShellProps {
  onClose: () => void;
  title: string;
  rightAction?: ReactNode;
  children: ReactNode;
}

export function SubScreenShell({ onClose, title, rightAction, children }: SubScreenShellProps) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        height: 56,
        borderBottom: "0.5px solid var(--border)",
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          aria-label="Back"
          style={{
            width: 32, height: 32, borderRadius: 9,
            background: "var(--surf)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0, flexShrink: 0,
          }}
        >
          <Icon name="ChevronLeft" size={18} color="var(--text)" />
        </button>

        <div style={{
          flex: 1, textAlign: "center",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text)",
        }}>
          {title}
        </div>

        <div style={{ width: 32, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          {rightAction}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </div>
    </motion.div>
  );
}
