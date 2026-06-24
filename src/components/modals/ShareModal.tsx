'use client'

import { useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { Btn } from '@/components/ui/Btn'
import { Card } from '@/components/ui/Card'
import { GameIcon } from '@/components/ui/GameIcon'
import type { GameId } from '@/components/ui/GameIcon'
import { Icon } from '@/components/ui/Icon'

const SLUG_MAP: Record<string, string> = {
  'logic-path': 'logicpath', 'pattern-match': 'patternmatch', '2048-pro': '2048',
  'gravity-sort': 'gravity', 'hex-merge': 'hexmerge', 'word-sling': 'wordsling',
  'word-climb': 'wordclimb', 'name-country': 'namecountry', 'name-city': 'namecity',
}

function fmtTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  gameSlug: string
  gameName: string
  stage: number
  xpEarned: number
  timeSeconds: number
}

export function ShareModal({ isOpen, onClose, gameSlug, gameName, stage, xpEarned, timeSeconds }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const gameId = (SLUG_MAP[gameSlug] ?? gameSlug) as GameId
  const url = `mindstate.app/play/${gameSlug}?seed=${stage}`
  const timeFormatted = fmtTime(timeSeconds)

  function handleCopy() {
    navigator.clipboard.writeText(`https://${url}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        url: `https://${url}`,
        title: `MindState — ${gameName} Stage ${stage}`,
        text: `I scored ${xpEarned} XP on ${gameName} Stage ${stage} in ${timeFormatted}. Can you beat me?`,
      }).catch(() => {})
    } else {
      handleCopy()
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 16 }}>
        Challenge a Friend
      </div>

      {/* Score card */}
      <Card variant="elevated" padding="14px" radius="var(--r-card)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
          <GameIcon game={gameId} size={36} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{gameName}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>Stage {stage}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{xpEarned} XP · {timeFormatted}</div>
          </div>
        </div>
      </Card>

      {/* URL display */}
      <Card variant="default" padding="12px" radius="var(--r-card-sm)">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all' }}>
          {url}
        </div>
      </Card>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Btn variant="ghost" size="sm" fullWidth={false} onClick={handleCopy}>
          <Icon name="Copy" size={14} style={{ marginRight: 4 }} />
          {copied ? 'Copied!' : 'Copy'}
        </Btn>
        <Btn variant="primary" size="sm" onClick={handleShare}>
          <Icon name="Share" size={14} style={{ marginRight: 4 }} />
          Share
        </Btn>
        <Btn variant="muted" size="sm" fullWidth={false} onClick={onClose}>Close</Btn>
      </div>
    </BottomSheet>
  )
}
