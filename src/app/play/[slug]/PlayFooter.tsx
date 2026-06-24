'use client'

import { Icon } from '@/components/ui/Icon'

interface PlayFooterProps {
  hintsUsed: number
  onHint: () => void
  onCheck: () => void
}

interface FooterBtnProps {
  onClick?: () => void
  disabled?: boolean
  bg: string
  border?: string
  children: React.ReactNode
}

function FooterBtn({ onClick, disabled, bg, border, children }: FooterBtnProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 4, padding: '12px 0',
        background: bg, border: border ?? 'none',
        borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  )
}

export function PlayFooter({ hintsUsed, onHint, onCheck }: PlayFooterProps) {
  return (
    <div style={{
      height: 60, background: 'var(--surf)', borderTop: '0.5px solid var(--border)',
      display: 'flex', gap: 8, padding: '0 12px', alignItems: 'center', flexShrink: 0,
    }}>
      <FooterBtn disabled bg="var(--surf2)">
        <Icon name="Undo" size={20} color="var(--muted)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}>Undo</span>
      </FooterBtn>

      <FooterBtn onClick={onHint} bg="var(--surf)" border="1px solid var(--accent)">
        <Icon name="Hint" size={20} color="var(--accent)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)' }}>Hint</span>
        {hintsUsed > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--hard)', position: 'absolute', bottom: 6 }}>
            −{hintsUsed * 150} XP
          </span>
        )}
      </FooterBtn>

      <FooterBtn onClick={onCheck} bg="var(--accent)">
        <Icon name="Check" size={20} color="var(--on-accent)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--on-accent)' }}>Check</span>
      </FooterBtn>
    </div>
  )
}
