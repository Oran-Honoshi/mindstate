'use client'

import { Icon } from '@/components/ui/Icon'
import { Bar } from '@/components/ui/Bar'
import { GameIcon } from '@/components/ui/GameIcon'
import type { GameId } from '@/components/ui/GameIcon'

interface PlayTopBarProps {
  gameName: string
  gameId: GameId
  stage: number
  xpRemaining: number
  timerSeconds: number
  onQuit: () => void
}

function fmtTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function PlayTopBar({ gameName, gameId, stage, xpRemaining, timerSeconds, onQuit }: PlayTopBarProps) {
  const xpColor = xpRemaining > 700 ? 'var(--accent)' : xpRemaining > 300 ? 'var(--medium)' : 'var(--hard)'
  return (
    <div style={{ background: 'var(--surf)', borderBottom: '0.5px solid var(--border)', flexShrink: 0 }}>
      {/* Row 1 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 6px', gap: 8 }}>
        <button
          onClick={onQuit}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--text)' }}
        >
          <Icon name="ChevronLeft" size={20} color="var(--text)" />
        </button>
        <span style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 15,
          color: 'var(--text)',
        }}>
          {gameName} · Stage {stage}
        </span>
        <GameIcon game={gameId} size={20} />
      </div>
      {/* Row 2 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 10px', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: 18,
          color: xpColor,
          minWidth: 48,
        }}>
          {xpRemaining}
        </span>
        <div style={{ flex: 1 }}>
          <Bar colorMode="xp" value={xpRemaining / 1000} height={6} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--muted)',
          minWidth: 44,
          textAlign: 'right',
        }}>
          {fmtTime(timerSeconds)}
        </span>
      </div>
    </div>
  )
}
