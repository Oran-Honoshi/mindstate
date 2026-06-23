import { CSSProperties, ReactNode } from 'react'

interface MicroProps {
  color?: string
  size?: number
  weight?: number
  spacing?: string
  children: ReactNode
  className?: string
}

export function Micro({
  color,
  size = 10,
  weight = 700,
  spacing = '0.08em',
  children,
  className,
}: MicroProps) {
  const style: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: `${size}px`,
    fontWeight: weight,
    letterSpacing: spacing,
    textTransform: 'uppercase',
    color: color ?? 'var(--muted)',
  }

  return (
    <span style={style} className={className}>
      {children}
    </span>
  )
}
