'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GameIcon, GameId } from '@/components/ui/GameIcon'
import { Btn } from '@/components/ui/Btn'
import { Micro } from '@/components/ui/Micro'
import { Icon } from '@/components/ui/Icon'

const DIFF_COLOR: Record<string, string> = {
  easy: 'var(--easy)',
  medium: 'var(--medium)',
  hard: 'var(--hard)',
}

const SLUG_MAP: Record<string, string> = {
  'logic-path': 'logicpath', 'pattern-match': 'patternmatch', '2048-pro': '2048',
  'gravity-sort': 'gravity', 'hex-merge': 'hexmerge', 'word-sling': 'wordsling',
  'word-climb': 'wordclimb', 'name-country': 'namecountry', 'name-city': 'namecity',
}

function useCountdown(target: Date): string | null {
  const [ms, setMs] = useState<number | null>(null)
  useEffect(() => {
    setMs(Math.max(0, target.getTime() - Date.now()))
    const id = setInterval(() => setMs(Math.max(0, target.getTime() - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])
  if (ms === null) return null
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface DailyBannerProps {
  gameSlug: string
  gameName: string
  difficulty: 'easy' | 'medium' | 'hard'
  resetsAt: Date
  isCompleted: boolean
  xpEarned?: number
  onPlay: () => void
}

export function DailyBanner({ gameSlug, gameName, difficulty, resetsAt, isCompleted, xpEarned, onPlay }: DailyBannerProps) {
  const countdown = useCountdown(resetsAt)
  const gameId = (SLUG_MAP[gameSlug] ?? gameSlug) as GameId

  return (
    <motion.div
      animate={{ boxShadow: ['0 0 0 0 rgba(47,230,224,0)', '0 0 20px 4px rgba(47,230,224,0.15)', '0 0 0 0 rgba(47,230,224,0)'] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: 'linear-gradient(135deg, rgba(47,230,224,0.15) 0%, rgba(47,230,224,0.05) 100%)',
        border: '1px solid rgba(47,230,224,0.25)',
        borderRadius: 'var(--r-card)',
        padding: '14px 16px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'space-between',
      }}
    >
      <motion.div
        animate={{ x: ['-130%', '130%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ flex: 1, position: 'relative' }}>
        <Micro color="var(--accent)">Today&apos;s Challenge</Micro>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginTop: 4, lineHeight: 1.1 }}>
          {gameName}
        </div>
        <div style={{ marginTop: 5 }}>
          <Micro color={DIFF_COLOR[difficulty]}>{difficulty}</Micro>
        </div>
        {countdown !== null && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
            Resets in {countdown}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative' }}>
        <GameIcon game={gameId} size={52} />
        {isCompleted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="Check" size={16} color="var(--easy)" strokeWidth={2} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--easy)' }}>
              +{xpEarned ?? 0} XP
            </span>
          </div>
        ) : (
          <Btn variant="primary" size="sm" fullWidth={false} onClick={onPlay}>
            ▶ Play
          </Btn>
        )}
      </div>
    </motion.div>
  )
}
