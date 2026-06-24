"use client";

import { Suspense } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { GameIcon } from "@/components/icons/GameIcons";
import type { Difficulty } from "@/lib/games/xpEngine";

interface GameTopBarProps {
  slug: string;
  gameName: string;
  stageNumber: number;
  difficulty: Difficulty;
  xp: number;
  maxXp: number;
  elapsedSeconds: number;
}

function xpColor(xp: number): string {
  if (xp > 850) return "var(--color-accent-primary)";
  if (xp > 680) return "var(--color-gold)";
  return "var(--color-error)";
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function GameTopBarInner({
  slug, gameName, stageNumber, difficulty, xp, maxXp, elapsedSeconds,
}: GameTopBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromDaily = searchParams.get("from") === "daily";
  const color = xpColor(xp);
  const pct = Math.max(4, Math.min(100, (xp / maxXp) * 100));

  return (
    <div style={{ borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
      <div style={{ padding: "12px 16px 10px" }}>

        {/* Row 1: back · name+stage · game icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push(isFromDaily ? "/daily" : `/stages/${slug}`)}
            aria-label="Back"
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--color-text-primary)",
              flexShrink: 0, padding: 0, minHeight: 0,
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
              color: "var(--color-text-primary)", lineHeight: 1.2,
            }}>
              {gameName}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 8.5,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--color-text-faint)", marginTop: 2,
            }}>
              Stage {stageNumber} · {difficulty}
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <GameIcon slug={slug} size={30} />
          </div>
        </div>

        {/* Row 2: live XP + bar (left) · timer pill (right) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22,
                color, fontVariantNumeric: "tabular-nums",
                transition: "color 0.4s", lineHeight: 1,
              }}>
                {xp}
              </span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 8,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "var(--color-text-faint)",
              }}>
                SCORE · SOLVE FAST
              </span>
            </div>
            <div style={{
              height: 5, background: "var(--color-surface-2)",
              borderRadius: 3, marginTop: 6, overflow: "hidden",
            }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: color, borderRadius: 3,
                transition: "width 1s linear, background-color 0.4s ease",
              }} />
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 9, padding: "6px 10px", flexShrink: 0,
          }}>
            <Clock size={13} color="var(--color-text-secondary)" strokeWidth={2} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-primary)" }}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export function GameTopBar(props: GameTopBarProps) {
  return (
    <Suspense fallback={<div style={{ height: 80, borderBottom: "1px solid var(--color-border)" }} />}>
      <GameTopBarInner {...props} />
    </Suspense>
  );
}
