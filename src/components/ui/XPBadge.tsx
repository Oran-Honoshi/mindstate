"use client";
import { getLevelInfo } from "@/lib/xpLevels";

interface XPBadgeProps {
  totalXP: number;
  size?: "sm" | "md";
}

export function XPBadge({ totalXP, size = "sm" }: XPBadgeProps) {
  const info = getLevelInfo(totalXP);
  const fs   = size === "sm" ? 10 : 12;
  const px   = size === "sm" ? "5px 10px" : "7px 14px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: px,
        borderRadius: "var(--radius-pill)",
        background: `${info.color}18`,
        border: `1px solid ${info.color}44`,
        fontFamily: "var(--font-mono)",
        fontSize: fs,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: info.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: info.color,
          flexShrink: 0,
        }}
      />
      {info.name}
    </span>
  );
}
