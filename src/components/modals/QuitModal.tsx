'use client'

import { Icon } from '@/components/ui/Icon'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'

interface QuitModalProps {
  isOpen: boolean
  onClose: () => void
  onAbandon: () => void
  timeElapsed: number
  xpRemaining: number
  hintsUsed: number
}

function fmtTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

interface StatCellProps { value: string; label: string }

function StatCell({ value, label }: StatCellProps) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--faint)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export function QuitModal({ isOpen, onClose, onAbandon, timeElapsed, xpRemaining, hintsUsed }: QuitModalProps) {
  if (!isOpen) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Card variant="default" padding="24px" radius="var(--r-card)">
        <div style={{ maxWidth: 340, width: '100%' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'color-mix(in srgb, var(--hard) 16%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Icon name="X" size={28} color="var(--hard)" />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)', textAlign: 'center', margin: 0 }}>Give up?</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', textAlign: 'center', marginBottom: 16 }}>
            Your progress on this stage will be lost.
          </p>
          <div style={{ background: 'var(--surf2)', borderRadius: 11, padding: '10px 0', display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
            <StatCell value={fmtTime(timeElapsed)} label="time elapsed" />
            <StatCell value={String(xpRemaining)} label="xp remaining" />
            <StatCell value={String(hintsUsed)} label="hints used" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn variant="ghost" size="md" onClick={onClose}>Keep Playing</Btn>
            <Btn variant="danger" size="md" onClick={onAbandon}>Abandon Stage</Btn>
          </div>
        </div>
      </Card>
    </div>
  )
}
