'use client'

import { CSSProperties, ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'outline' | 'text'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
}

const sizeMap: Record<string, CSSProperties> = {
  sm: { padding: '9px 14px', fontSize: 13 },
  md: { padding: '12px 18px', fontSize: 14 },
  lg: { padding: '14px 18px', fontSize: 15 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  const base: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    borderRadius: 'var(--r-btn)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    transition: 'transform 0.1s, opacity 0.15s',
    opacity: disabled ? 0.5 : 1,
    letterSpacing: '-0.01em',
    ...sizeMap[size],
  }

  const variantStyles: Record<string, CSSProperties> = {
    primary: { background: 'var(--accent)', color: 'var(--on-accent)' },
    ghost:   { background: 'var(--surf2)', color: 'var(--text)' },
    outline: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' },
    text:    { background: 'none', color: 'var(--muted)', fontFamily: 'var(--font-body)', fontWeight: 400, padding: '4px 0', fontSize: 13 },
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variantStyles[variant] }}
      onPointerDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)' }}
      onPointerUp={(e) => { e.currentTarget.style.transform = '' }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = '' }}
    >
      {children}
    </button>
  )
}
