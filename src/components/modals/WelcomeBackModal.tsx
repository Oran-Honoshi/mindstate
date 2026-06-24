'use client'

import { CenterModal } from './CenterModal'
import { SparkyImg } from '@/components/ui/SparkyImg'
import { Btn } from '@/components/ui/Btn'

interface WelcomeBackModalProps {
  isOpen: boolean
  onClose: () => void
  streakBroken: boolean
  streakCount: number
  freezesRemaining: number
  onPlayDaily: () => void
  onGoToGames: () => void
}

export function WelcomeBackModal({
  isOpen, onClose, streakBroken, streakCount, freezesRemaining, onPlayDaily, onGoToGames,
}: WelcomeBackModalProps) {
  return (
    <CenterModal isOpen={isOpen} onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <SparkyImg expr={streakBroken ? 'surprised' : 'happy'} size={52} />
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
          color: streakBroken ? 'var(--hard)' : 'var(--easy)',
        }}>
          {streakBroken ? 'Streak Lost' : 'Streak Saved!'}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
          {streakBroken
            ? `Your ${streakCount}-day streak ended. Start a new one today!`
            : `A Streak Freeze kept your ${streakCount}-day streak alive!`}
        </div>

        {/* Streak count badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 6, marginTop: 14, marginBottom: 6,
          background: streakBroken ? 'color-mix(in srgb, var(--hard) 12%, transparent)' : 'color-mix(in srgb, var(--easy) 12%, transparent)',
          border: `1px solid ${streakBroken ? 'color-mix(in srgb, var(--hard) 30%, transparent)' : 'color-mix(in srgb, var(--easy) 30%, transparent)'}`,
          borderRadius: 12, padding: '8px 16px',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color: streakBroken ? 'var(--hard)' : 'var(--easy)' }}>
            {streakCount}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: streakBroken ? 'var(--hard)' : 'var(--easy)' }}>
            day streak
          </span>
        </div>

        {!streakBroken && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
            Freezes remaining: {freezesRemaining}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          <Btn variant="primary" onClick={onPlayDaily}>Play Today&apos;s Challenge</Btn>
          {streakBroken && (
            <Btn variant="ghost" onClick={onGoToGames}>Go to Games</Btn>
          )}
        </div>
      </div>
    </CenterModal>
  )
}
