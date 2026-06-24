'use client'

import { useState } from 'react'
import { GameIcon } from '@/components/ui/GameIcon'
import type { GameId } from '@/components/ui/GameIcon'
import { Btn } from '@/components/ui/Btn'

const SLUG_MAP: Record<string, string> = {
  'logic-path': 'logicpath', 'pattern-match': 'patternmatch', '2048-pro': '2048',
  'gravity-sort': 'gravity', 'hex-merge': 'hexmerge', 'word-sling': 'wordsling',
  'word-climb': 'wordclimb', 'name-country': 'namecountry', 'name-city': 'namecity',
}

interface StageIntroModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: (stage: number, timerEnabled: boolean) => void
  gameSlug: string
  gameName: string
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  maxXP: number
  bestXP: number
}

export function StageIntroModal({ isOpen, onClose, onStart, gameSlug, gameName, stage, difficulty, maxXP, bestXP }: StageIntroModalProps) {
  const [timerOn, setTimerOn] = useState(true)
  if (!isOpen) return null

  const gameId = (SLUG_MAP[gameSlug] ?? gameSlug) as GameId
  const diffColor = `var(--${difficulty})`

  const chipBase: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 11,
    borderRadius: 'var(--r-pill)', padding: '4px 10px',
  }

  return (
    <>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--surf)', borderRadius: '20px 20px 0 0',
          padding: '0 var(--screen-pad) 32px',
          animation: 'slideUp 250ms ease-out',
        }}>
          <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 99, margin: '10px auto 16px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <GameIcon game={gameId} size={42} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{gameName}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>Stage {stage}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ ...chipBase, color: diffColor, background: `color-mix(in srgb, ${diffColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${diffColor} 40%, transparent)` }}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span style={{ ...chipBase, color: 'var(--gold)', background: 'color-mix(in srgb, var(--gold) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)' }}>
              Up to {maxXP} XP
            </span>
            {bestXP > 0 && <span style={{ ...chipBase, color: 'var(--muted)', background: 'var(--surf2)', border: '1px solid var(--border)' }}>Best: {bestXP} XP</span>}
          </div>
          {/* Timer toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderRadius: 12, marginBottom: 16,
            background: timerOn ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--surf2)',
            border: timerOn ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Timer</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>XP decays −4/sec</div>
            </div>
            <div onClick={() => setTimerOn(v => !v)} style={{ width: 40, height: 22, borderRadius: 99, padding: 2, cursor: 'pointer', background: timerOn ? 'var(--accent)' : 'var(--surf2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: timerOn ? 'flex-end' : 'flex-start', flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: timerOn ? 'var(--on-accent)' : 'var(--muted)' }} />
            </div>
          </div>
          <Btn variant="primary" size="lg" onClick={() => onStart(stage, timerOn)}>Start Stage {stage}</Btn>
          <div style={{ marginTop: 8 }}>
            <Btn variant="ghost" size="md" onClick={onClose}>Maybe later</Btn>
          </div>
        </div>
      </div>
    </>
  )
}
