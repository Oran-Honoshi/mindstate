"use client";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface ToastCelebrationProps {
  xpEarned: number;
  timeTaken: number;   // seconds
  hintsUsed: number;
  onDismiss: () => void;
}

function formatTime(s: number): string {
  if (s === Infinity || isNaN(s)) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function ToastCelebration({ xpEarned, timeTaken, hintsUsed, onDismiss }: ToastCelebrationProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2600);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const hintsLabel = hintsUsed === 0
    ? "no hints"
    : `${hintsUsed} hint${hintsUsed > 1 ? "s" : ""} used`;

  return (
    <>
      <style>{`
        @keyframes me-slidedown {
          0%   { transform: translateY(-120%); opacity: 0 }
          12%  { transform: translateY(0);     opacity: 1 }
          80%  { transform: translateY(0);     opacity: 1 }
          100% { transform: translateY(-120%); opacity: 0 }
        }
      `}</style>
      <div
        onClick={onDismiss}
        style={{
          position: "fixed",
          top: 56,
          left: 18,
          right: 18,
          zIndex: 90,
          animation: "me-slidedown 2.6s ease-in-out both forwards",
          cursor: "pointer",
        }}
      >
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {/* Left icon */}
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: "rgba(84,208,106,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircle size={18} color="#54D06A" strokeWidth={2.4} />
          </div>

          {/* Center text */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
              color: "var(--color-text-primary)", lineHeight: 1,
            }}>
              Stage cleared
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 8.5,
              letterSpacing: "0.06em",
              color: "var(--color-text-secondary)",
              marginTop: 4,
            }}>
              Solved in {formatTime(timeTaken)} · {hintsLabel}
            </div>
          </div>

          {/* Right XP */}
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
            color: "var(--color-accent-primary)", flexShrink: 0,
          }}>
            +{xpEarned}
          </div>
        </div>
      </div>
    </>
  );
}
