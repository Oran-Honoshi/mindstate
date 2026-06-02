interface GameProgressStripProps {
  xp: number;
  maxXp: number;
}

function xpColor(xp: number): string {
  if (xp > 850) return "var(--color-accent-primary)";
  if (xp > 680) return "var(--color-gold)";
  return "var(--color-error)";
}

export function GameProgressStrip({ xp, maxXp }: GameProgressStripProps) {
  const pct = Math.max(0, Math.min(100, (xp / maxXp) * 100));
  const color = xpColor(xp);

  return (
    <div style={{ height: 5, background: "var(--color-surface-2)", flexShrink: 0 }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: color,
        transition: "width 1s linear, background-color 0.4s ease",
      }} />
    </div>
  );
}
