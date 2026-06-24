"use client";
import type { LeaderboardScope } from "./leaderboardData";

interface ScopeToggleProps {
  scope: LeaderboardScope
  onChange: (scope: LeaderboardScope) => void
}

const OPTIONS: { key: LeaderboardScope; label: string }[] = [
  { key: 'global', label: 'Global' },
  { key: 'family', label: 'Family' },
]

export function ScopeToggle({ scope, onChange }: ScopeToggleProps) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--surf)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--r-card)',
      padding: 4,
    }}>
      {OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: 8,
            borderRadius: 'calc(var(--r-card) - 4px)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            transition: 'background 150ms ease, color 150ms ease',
            background: scope === key ? 'var(--surf2)' : 'transparent',
            color: scope === key ? 'var(--text)' : 'var(--muted)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
