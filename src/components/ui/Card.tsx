'use client'

import { CSSProperties, ReactNode } from 'react'

interface CardProps {
  variant?: 'default' | 'elevated' | 'accent' | 'ghost'
  padding?: string
  radius?: string
  onClick?: () => void
  className?: string
  style?: CSSProperties
  children: ReactNode
}

const variantStyle: Record<NonNullable<CardProps['variant']>, CSSProperties> = {
  default: {
    background: 'var(--surf)',
    border: '0.5px solid var(--border)',
  },
  elevated: {
    background: 'var(--surf)',
    border: '0.5px solid var(--border)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
  },
  accent: {
    background: 'var(--surf)',
    border: '0.5px solid color-mix(in srgb, var(--accent) 30%, transparent)',
  },
  ghost: {
    background: 'transparent',
    border: 'none',
  },
}

export function Card({
  variant = 'default',
  padding,
  radius,
  onClick,
  className,
  style: styleOverride,
  children,
}: CardProps) {
  const style: CSSProperties = {
    ...variantStyle[variant],
    borderRadius: radius ?? 'var(--r-card)',
    padding: padding ?? 'var(--card-pad)',
    cursor: onClick ? 'pointer' : undefined,
    transition: onClick ? 'transform 0.1s, background 0.15s, border-color 0.15s' : undefined,
    ...styleOverride,
  }

  return (
    <div
      className={className}
      style={style}
      onClick={onClick}
      onPointerDown={onClick ? (e) => (e.currentTarget.style.transform = 'scale(0.98)') : undefined}
      onPointerUp={onClick ? (e) => (e.currentTarget.style.transform = '') : undefined}
      onPointerLeave={onClick ? (e) => (e.currentTarget.style.transform = '') : undefined}
    >
      {children}
    </div>
  )
}
