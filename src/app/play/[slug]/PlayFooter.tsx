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
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minHeight: 52,
        background: bg,
        border: border ?? 'none',
        borderRadius: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 100ms ease',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  )
}

export function PlayFooter({ hintsUsed, onHint, onCheck }: PlayFooterProps) {
  const hintsLeft = Math.max(0, 3 - hintsUsed)
  return (
    <div style={{
      background: 'var(--surf)',
      borderTop: '0.5px solid var(--border)',
      display: 'flex',
      gap: 8,
      padding: '6px 12px',
      alignItems: 'stretch',
      flexShrink: 0,
    }}>
      <FooterBtn disabled bg="var(--surf2)">
        <Icon name="Undo" size={22} color="var(--muted)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Undo</span>
      </FooterBtn>

      <FooterBtn onClick={onHint} bg="var(--surf)" border="1px solid var(--accent)">
        <div style={{ position: 'relative' }}>
          <Icon name="Hint" size={22} color="var(--accent)" />
          <span style={{
            position: 'absolute',
            top: -4,
            right: -8,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: 'var(--on-accent)',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {hintsLeft}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hint</span>
      </FooterBtn>

      <FooterBtn onClick={onCheck} bg="var(--accent)">
        <Icon name="Check" size={22} color="var(--on-accent)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--on-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Check</span>
      </FooterBtn>
    </div>
  )
}
