"use client";
import { useState, useEffect } from "react";
import { getMasteryTier, getMasteryColor, type MasteryTier } from "@/lib/mastery";
import { getCompletedStages } from "@/lib/games/stageProgress";

const SYMBOL: Record<NonNullable<MasteryTier>, string> = {
  bronze:  "◉",
  silver:  "◈",
  gold:    "◆",
  diamond: "◇",
};

const SHORT: Record<NonNullable<MasteryTier>, string> = {
  bronze:  "BR",
  silver:  "SI",
  gold:    "GO",
  diamond: "DI",
};

interface MasteryBadgeProps {
  slug: string;
  size?: number;
}

export function MasteryBadge({ slug, size = 36 }: MasteryBadgeProps) {
  const [tier, setTier] = useState<MasteryTier>(null);

  useEffect(() => {
    setTier(getMasteryTier(getCompletedStages(slug).size));
  }, [slug]);

  if (!tier) return null;

  const color = getMasteryColor(tier);
  const symSize = Math.round(size * 0.38);
  const labelSize = Math.round(size * 0.22);

  return (
    <div
      title={`${tier.charAt(0).toUpperCase() + tier.slice(1)} Mastery`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        background: `${color}18`,
        boxShadow: `0 0 10px ${color}28`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: symSize, lineHeight: 1, color }}>{SYMBOL[tier]}</span>
      <span style={{
        fontSize: labelSize,
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        letterSpacing: "0.06em",
        color,
        lineHeight: 1,
      }}>
        {SHORT[tier]}
      </span>
    </div>
  );
}
