interface GameProgressStripProps {
  xp: number;
  maxXp: number;
  elapsedSeconds: number;
  hintsRemaining: number;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function GameProgressStrip({
  xp,
  maxXp,
  elapsedSeconds,
  hintsRemaining,
}: GameProgressStripProps) {
  const pct = Math.max(0, Math.min(100, (xp / maxXp) * 100));

  return (
    <div style={{ flexShrink: 0 }}>
      {/* 4px XP fill bar */}
      <div style={{
        height: 4,
        width: "100%",
        background: "var(--color-surface-2)",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: "var(--color-accent-primary)",
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Time · hints row */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 16px",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--color-text-secondary)",
        }}>
          {formatTime(elapsedSeconds)}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--color-text-secondary)",
        }}>
          {hintsRemaining} hint{hintsRemaining !== 1 ? "s" : ""} left
        </span>
      </div>
    </div>
  );
}