'use client'

import { GameIcon } from '@/components/ui/GameIcon'
import type { GameId } from '@/components/ui/GameIcon'

interface LobbyHeroProps {
  gameId: GameId
  gameName: string
  description: string
  level: number
  stagesCompleted: number
  bestXP: number
}

export function LobbyHero({ gameId, gameName, description, level, stagesCompleted, bestXP }: LobbyHeroProps) {
  const pillBase: React.CSSProperties = {
    borderRadius: 99, padding: '4px 12px', fontFamily: 'var(--font-mono)', fontSize: 11,
  }
  return (
    <div style={{
      padding: '24px var(--screen-pad) 16px',
      textAlign: 'center',
      background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, transparent) 0%, var(--bg) 100%)',
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: 22, margin: '0 auto',
        background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <GameIcon game={gameId} size={62} />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text)', marginTop: 12 }}>
        {gameName}
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 280, margin: '6px auto 12px' }}>
        {description}
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ ...pillBase, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)', color: 'var(--accent)' }}>
          Level {level}
        </span>
        <span style={{ ...pillBase, background: 'color-mix(in srgb, var(--gold) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)', color: 'var(--gold)' }}>
          {stagesCompleted} / 100
        </span>
        <span style={{ ...pillBase, background: 'var(--surf2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          Best: {bestXP} XP
        </span>
      </div>
    </div>
  )
}
