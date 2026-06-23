'use client'

import { CSSProperties, ReactNode } from 'react'

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'muted'
type BtnSize = 'sm' | 'md' | 'lg'

interface BtnProps {
  variant?: BtnVariant
  size?: BtnSize
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
}

const sizeStyle: Record<BtnSize, CSSProperties> = {
  sm: { fontSize: '13px', padding: '9px 18px' },
  md: { fontSize: '15px', padding: '13px 24px' },
  lg: { fontSize: '16px', padding: '15px 28px' },
}

const variantStyle: Record<BtnVariant, CSSProperties> = {
  primary:  { background: 'var(--accent)',  color: 'var(--on-accent)', border: 'none' },
  ghost:    { background: 'transparent',    color: 'var(--accent)',    border: '1.5px solid var(--accent)' },
  danger:   { background: 'transparent',    color: 'var(--hard)',      border: '1.5px solid var(--hard)' },
  muted:    { background: 'var(--surf2)',   color: 'var(--muted)',     border: 'none' },
}

export function Btn({
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled = false,
  onClick,
  children,
  type = 'button',
}: BtnProps) {
  const isFullWidth = fullWidth ?? variant === 'primary'

  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    borderRadius: 'var(--r-btn)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: isFullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    transition: 'opacity 120ms ease, transform 120ms ease',
    userSelect: 'none' as const,
    ...sizeStyle[size],
    ...variantStyle[variant],
  }

  return (
    <button
      type={type}
      style={style}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onPointerDown={(e) => { if (!disabled) e.currentTarget.style.cssText += ';opacity:0.82;transform:scale(0.98)' }}
      onPointerUp={(e) => { if (!disabled) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = '' } }}
      onPointerLeave={(e) => { if (!disabled) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = '' } }}
    >
      {children}
    </button>
  )
}
