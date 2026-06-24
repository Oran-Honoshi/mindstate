"use client";
import { Flame } from "lucide-react";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { Confetti } from "./Confetti";

interface StreakMilestoneOverlayProps {
  isOpen: boolean;
  onDismiss: () => void;
  streakDays: number;
  streakHistory: boolean[];
}

const BG = "radial-gradient(ellipse 90% 70% at 50% 30%, color-mix(in srgb, var(--hard) 20%, var(--bg)) 0%, var(--bg) 70%)";
const FLAME_COLORS = ["var(--hard)", "var(--gold)", "var(--medium)"];

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMilestoneLabel(days: number): string {
  if (days >= 100) return "Century Streak!";
  if (days >= 60)  return "Two Months!";
  if (days >= 30)  return "One Month!";
  if (days >= 14)  return "Two Weeks!";
  return "One Week!";
}

export function StreakMilestoneOverlay({ isOpen, onDismiss, streakDays, streakHistory }: StreakMilestoneOverlayProps) {
  if (!isOpen) return null;

  // Pad/trim streakHistory to exactly 28 entries (4 weeks)
  const days28 = Array.from({ length: 28 }, (_, i) => streakHistory[i] ?? false);

  return (
    <>
      <style>{`
        @keyframes flamePulse {
          0%, 100% { transform: scale(1) }
          50%       { transform: scale(1.15) }
        }
      `}</style>
      <CelebrationOverlay background={BG} autoDismissMs={5000} onDismiss={onDismiss}>
        <Confetti count={25} colors={FLAME_COLORS} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Flame icon */}
          <div style={{ animation: "flamePulse 1.5s ease-in-out infinite", marginBottom: 16 }}>
            <Flame size={64} color="var(--hard)" fill="var(--hard)" strokeWidth={0} />
          </div>

          {/* Streak count */}
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 72,
            color: "var(--hard)", lineHeight: 1,
          }}>
            {streakDays}
          </div>

          {/* DAY STREAK label */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--hard)", marginBottom: 20,
          }}>
            DAY STREAK
          </div>

          {/* Milestone label */}
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22,
            color: "var(--text)", marginBottom: 12,
          }}>
            {getMilestoneLabel(streakDays)}
          </div>

          {/* 4-week calendar grid */}
          <div>
            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 28px)", gap: 4, marginBottom: 4 }}>
              {WEEK_LABELS.map(d => (
                <div key={d} style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--faint)",
                  textAlign: "center",
                }}>
                  {d}
                </div>
              ))}
            </div>
            {/* 4 rows × 7 cols */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 28px)", gap: 4 }}>
              {days28.map((completed, i) => {
                const isToday = i === streakDays - 1 && i < 28;
                return (
                  <div
                    key={i}
                    style={{
                      width: 28, height: 28,
                      borderRadius: 6,
                      background: completed ? "var(--hard)" : "var(--surf2)",
                      border: isToday ? "2px solid var(--hard)" : "none",
                      opacity: completed ? 1 : 0.5,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Sparky */}
          <div style={{ marginTop: 16 }}>
            <SparkyImg expr="celebrate" size={52} />
          </div>

          {/* Tap to dismiss */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)",
            marginTop: 12,
          }}>
            Tap anywhere to continue
          </div>
        </div>
      </CelebrationOverlay>
    </>
  );
}
