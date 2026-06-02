"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface GameTopBarProps {
  slug: string;
  gameName: string;
  stageNumber: number;
  xp: number;
}

export function GameTopBar({ slug, gameName, stageNumber, xp }: GameTopBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromDaily = searchParams.get("from") === "daily";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      flexShrink: 0,
    }}>
      {/* Back button */}
      <button
        onClick={() => router.push(isFromDaily ? "/daily" : `/stages/${slug}`)}
        aria-label="Back to stages"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          minHeight: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-primary)",
          borderRadius: "var(--radius)",
          padding: 6,
          flexShrink: 0,
        }}
      >
        <ArrowLeft size={20} />
      </button>

      {/* Center: game name + stage label */}
      <div style={{ textAlign: "center", flex: 1 }}>
        <div style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: 17,
          color: "var(--color-text-primary)",
          lineHeight: 1.2,
        }}>
          {gameName}
        </div>
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--color-text-secondary)",
          marginTop: 2,
        }}>
          Stage {stageNumber}
        </div>
      </div>

      {/* XP pill */}
      <div style={{
        background: "var(--color-surface-2)",
        borderRadius: 999,
        padding: "4px 10px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        fontWeight: 700,
        color: "var(--color-accent-primary)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {xp} XP
      </div>
    </div>
  );
}