"use client";
import { Trophy } from "lucide-react";
import { GameIcon } from "@/components/ui/GameIcon";
import type { GameId } from "@/components/ui/GameIcon";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { Confetti } from "./Confetti";

interface CenturyClubOverlayProps {
  isOpen: boolean;
  onDismiss: () => void;
  gameSlug: string;
  gameName: string;
  totalTimeSeconds: number;
  bestXP: number;
  totalHintsUsed: number;
}

const BG = "radial-gradient(ellipse 90% 70% at 50% 30%, color-mix(in srgb, var(--gold) 25%, var(--bg)) 0%, var(--bg) 70%)";

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function CenturyClubOverlay({ isOpen, onDismiss, gameSlug, gameName, totalTimeSeconds, bestXP, totalHintsUsed }: CenturyClubOverlayProps) {
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
      <CelebrationOverlay background={BG} autoDismissMs={5000} onDismiss={onDismiss}>
        <Confetti count={40} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Eyebrow */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.25em", textTransform: "uppercase",
            color: "var(--gold)", marginBottom: 16,
          }}>
            CENTURY CLUB
          </div>

          {/* Game icon with gold glow */}
          <div
            style={{
              width: 88, height: 88, borderRadius: 22,
              background: "color-mix(in srgb, var(--gold) 15%, var(--surf))",
              border: "2px solid var(--gold)",
              boxShadow: "0 0 32px color-mix(in srgb, var(--gold) 30%, transparent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "sparkyPop 500ms ease-out both",
            }}
          >
            <GameIcon game={gameSlug as GameId} size={72} />
          </div>

          {/* Game name */}
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28,
            color: "var(--text)", margin: "12px 0 4px",
          }}>
            {gameName}
          </div>

          {/* Subtitle */}
          <div style={{
            fontFamily: "var(--font-body)", fontSize: 14,
            color: "var(--muted)", marginBottom: 20,
          }}>
            All 100 Stages Complete
          </div>

          {/* Diamond mastery row */}
          <div style={{ display: "flex", flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
            <Trophy size={20} color="var(--gold)" />
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
              color: "var(--gold)",
            }}>
              Diamond Mastery
            </span>
            <Trophy size={20} color="var(--gold)" />
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
            {[
              { label: "Total Time", value: formatTime(totalTimeSeconds) },
              { label: "Best XP",    value: bestXP.toLocaleString() },
              { label: "Hints",      value: String(totalHintsUsed) },
            ].map(s => (
              <div key={s.label} style={{
                background: "color-mix(in srgb, var(--gold) 10%, var(--surf))",
                border: "1px solid color-mix(in srgb, var(--gold) 30%, transparent)",
                borderRadius: 11, padding: "10px 14px", textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
                  color: "var(--gold)",
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em",
                  color: "var(--faint)", marginTop: 3,
                }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Tap to dismiss */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)",
            marginTop: 4,
          }}>
            Tap anywhere to continue
          </div>
        </div>
      </CelebrationOverlay>
    </>
  );
}
