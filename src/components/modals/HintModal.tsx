'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import { Btn } from '@/components/ui/Btn'

interface HintModalProps {
  isOpen: boolean
  onClose: () => void
  onUseHint: (tier: 1 | 2 | 3) => void
  xpRemaining: number
}

interface Tier { num: 1 | 2 | 3; icon: IconName; name: string; desc: string; cost: number; color: string }

const TIERS: Tier[] = [
  { num: 1, icon: 'Info',  name: 'Nudge',         desc: 'A gentle direction. No cell revealed.',  cost: 50,  color: 'var(--easy)' },
  { num: 2, icon: 'Hint',  name: 'Reveal Cell',   desc: 'Shows the correct value for one cell.', cost: 150, color: 'var(--medium)' },
  { num: 3, icon: 'Star',  name: 'Full Solution',  desc: 'Reveals the entire board.',             cost: 400, color: 'var(--hard)' },
]

export function HintModal({ isOpen, onClose, onUseHint, xpRemaining }: HintModalProps) {
  const [sel, setSel] = useState<1 | 2 | 3 | null>(null)
  if (!isOpen) return null

  const selectedTier = TIERS.find(t => t.num === sel)

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
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Need a hint?</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--faint)' }}>Choose wisely</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {TIERS.map(t => (
              <div key={t.num} onClick={() => setSel(t.num)}
                style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px',
                  borderRadius: 12, cursor: 'pointer',
                  background: sel === t.num ? `color-mix(in srgb, ${t.color} 12%, transparent)` : 'var(--surf2)',
                  border: `1.5px solid ${sel === t.num ? `color-mix(in srgb, ${t.color} 50%, transparent)` : 'var(--border)'}`,
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${t.color} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${t.color} 30%, transparent)`, flexShrink: 0 }}>
                  <Icon name={t.icon} size={20} color={t.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{t.name}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)' }}>{t.desc}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: t.color, flexShrink: 0 }}>−{t.cost} XP</span>
              </div>
            ))}
          </div>
          {selectedTier && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              Score: {xpRemaining} → {Math.max(0, xpRemaining - selectedTier.cost)}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn variant="primary" disabled={!sel} onClick={() => sel && onUseHint(sel)}>Use Hint</Btn>
            <Btn variant="ghost" size="md" onClick={onClose}>Cancel</Btn>
          </div>
        </div>
      </div>
    </>
  )
}
