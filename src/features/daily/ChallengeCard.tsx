'use client'

import { CSSProperties } from 'react'
import { BoardPreview } from '@/components/ui/BoardPreview'
import { GameIcon } from '@/components/icons/GameIcons'
import { Btn } from '@/components/ui/Btn'
import { Icon } from '@/components/ui/Icon'
import { DailyChallenge, DIFFICULTY_COLOR } from './dailyData'

interface ChallengeCardProps {
  challenge: DailyChallenge
  onPlay: (c: DailyChallenge) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function DoneOverlay({ challenge }: { challenge: DailyChallenge }) {
  const overlayStyle: CSSProperties = {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    borderRadius: 'inherit',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  }
  const circleStyle: CSSProperties = {
    width: 54, height: 54, borderRadius: 27,
    border: '2px solid var(--easy)',
    background: 'color-mix(in srgb, var(--easy) 20%, transparent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
  return (
    <div style={overlayStyle}>
      <div style={circleStyle}>
        <Icon name="Check" size={24} color="var(--easy)" strokeWidth={2.5} />
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--easy)' }}>Done!</span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--gold)' }}>
        +{challenge.xpEarned} XP
      </span>
      {challenge.bestTimeSeconds !== undefined && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
          Best: {formatTime(challenge.bestTimeSeconds)}
        </span>
      )}
    </div>
  )
}

export function ChallengeCard({ challenge, onPlay }: ChallengeCardProps) {
  const diffColor = DIFFICULTY_COLOR[challenge.difficulty]

  const outerStyle: CSSProperties = {
    flex: 1, display: 'flex', flexDirection: 'column',
    background: 'var(--surf)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-card)', overflow: 'hidden',
  }

  const previewAreaStyle: CSSProperties = {
    flex: 1, position: 'relative',
    background: 'radial-gradient(circle at 50% 40%, var(--surf2) 0%, var(--bg) 100%)',
  }

  const boardCenterStyle: CSSProperties = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%) scale(0.9)',
  }

  const diffChipStyle: CSSProperties = {
    position: 'absolute', top: 10, left: 10,
    background: `color-mix(in srgb, ${diffColor} 15%, transparent)`,
    border: `1px solid color-mix(in srgb, ${diffColor} 40%, transparent)`,
    color: diffColor, borderRadius: 'var(--r-pill)', padding: '3px 10px',
    fontFamily: 'var(--font-mono)', fontSize: 8,
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  }

  const xpChipStyle: CSSProperties = {
    position: 'absolute', top: 10, right: 10,
    background: 'color-mix(in srgb, var(--gold) 15%, transparent)',
    border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)',
    color: 'var(--gold)', borderRadius: 'var(--r-pill)', padding: '3px 10px',
    display: 'flex', alignItems: 'center', gap: 4,
    fontFamily: 'var(--font-mono)', fontSize: 8,
  }

  const footerStyle: CSSProperties = {
    padding: '10px 14px 12px', flexShrink: 0,
  }

  const footerRow1Style: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
  }

  const completedBtnStyle: CSSProperties = {
    border: '1px solid var(--easy)', color: 'var(--easy)',
    background: 'transparent', padding: '10px 0',
    borderRadius: 'var(--r-btn)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, fontSize: 14,
    fontFamily: 'var(--font-display)', fontWeight: 700, width: '100%',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 14px' }}>
      <div style={outerStyle}>
        <div style={previewAreaStyle}>
          <div style={boardCenterStyle}>
            <BoardPreview game={challenge.gameSlug} size={30} gap={5} />
          </div>
          <div style={diffChipStyle}>{challenge.difficulty}</div>
          <div style={xpChipStyle}>
            <Icon name="Bolt" size={10} color="var(--gold)" />
            +{challenge.xpReward}
          </div>
          {challenge.isCompleted && <DoneOverlay challenge={challenge} />}
        </div>
        <div style={footerStyle}>
          <div style={footerRow1Style}>
            <GameIcon slug={challenge.gameSlug} size={38} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                {challenge.gameName}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                Stage {challenge.stage}
              </div>
            </div>
          </div>
          {challenge.isCompleted ? (
            <div style={completedBtnStyle}>
              <Icon name="Check" size={14} color="var(--easy)" strokeWidth={2.5} />
              Completed
            </div>
          ) : (
            <Btn variant="primary" size="md" onClick={() => onPlay(challenge)}>
              ▶ Play Challenge
            </Btn>
          )}
        </div>
      </div>
    </div>
  )
}
