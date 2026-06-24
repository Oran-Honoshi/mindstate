"use client";
import { Zap } from "lucide-react";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { Card } from "@/components/ui/Card";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { Confetti } from "./Confetti";

interface LevelUpOverlayProps {
  isOpen: boolean;
  onDismiss: () => void;
  newLevel: number;
  newLevelTitle: string;
  totalXP: number;
}

const BG = "radial-gradient(ellipse 90% 70% at 50% 30%, color-mix(in srgb, var(--violet) 30%, var(--bg)) 0%, var(--bg) 70%)";

export function LevelUpOverlay({ isOpen, onDismiss, newLevel, newLevelTitle, totalXP }: LevelUpOverlayProps) {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes sparkyPop {
          0%   { transform: scale(0) }
          70%  { transform: scale(1.1) }
          100% { transform: scale(1) }
        }
      `}</style>
      <CelebrationOverlay background={BG} autoDismissMs={4000} onDismiss={onDismiss}>
        <Confetti count={30} />

        {/* Content layer above confetti */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Sparky */}
          <div style={{ animation: "sparkyPop 500ms ease-out both", marginBottom: 20 }}>
            <SparkyImg expr="celebrate" size={96} />
          </div>

          {/* Eyebrow */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--violet)", marginBottom: 8,
          }}>
            LEVEL UP
          </div>

          {/* Level number */}
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 52,
            color: "var(--text)", lineHeight: 1, margin: "8px 0",
          }}>
            Level {newLevel}
          </div>

          {/* Level title */}
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24,
            color: "var(--violet)", marginBottom: 20,
          }}>
            {newLevelTitle}
          </div>

          {/* XP badge */}
          <Card variant="default" padding="10px 20px">
            <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <Zap size={16} color="var(--gold)" fill="var(--gold)" strokeWidth={0} />
              <span style={{
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14,
                color: "var(--gold)",
              }}>
                {totalXP.toLocaleString()} XP total
              </span>
            </div>
          </Card>

          {/* Tap to dismiss */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)",
            marginTop: 24,
          }}>
            Tap anywhere to continue
          </div>
        </div>
      </CelebrationOverlay>
    </>
  );
}
