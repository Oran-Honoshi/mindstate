'use client'

import { Bar } from '@/components/ui/Bar'

interface ProfileHeroCardProps {
  username: string
  avatarUrl?: string
  level: number
  levelTitle: string
  currentXP: number
  nextLevelXP: number
}

function ringColor(level: number): string {
  if (level >= 25) return 'var(--violet)'
  if (level >= 10) return 'var(--gold)'
  return 'var(--accent)'
}

export function ProfileHeroCard({
  username,
  avatarUrl,
  level,
  levelTitle,
  currentXP,
  nextLevelXP,
}: ProfileHeroCardProps) {
  const ring = ringColor(level)
  const pct = Math.min(1, currentXP / Math.max(1, nextLevelXP))

  return (
    <div style={{
      background: 'var(--surf)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--r-card)',
      padding: 16,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Avatar with tier ring */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          padding: 3,
          background: `conic-gradient(${ring}, ${ring}88, ${ring})`,
          flexShrink: 0,
          marginBottom: 10,
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: ring,
            overflow: 'hidden',
          }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (username[0] ?? 'U').toUpperCase()
            )}
          </div>
        </div>

        {/* Name */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 20,
          color: 'var(--text)',
          textAlign: 'center',
        }}>
          {username}
        </div>

        {/* Level title */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--muted)',
          textAlign: 'center',
          marginBottom: 12,
          marginTop: 2,
        }}>
          Level {level} · {levelTitle}
        </div>

        {/* XP progress bar */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
              {currentXP.toLocaleString()} XP
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
              {nextLevelXP.toLocaleString()} XP
            </span>
          </div>
          <Bar colorMode="xp" value={pct} height={8} />
        </div>
      </div>
    </div>
  )
}
