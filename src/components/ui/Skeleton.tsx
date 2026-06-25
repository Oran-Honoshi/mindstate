'use client'

interface SkeletonProps {
  width?: string
  height?: number
  radius?: string
}

export function Skeleton({ width = '100%', height = 16, radius = '8px' }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, var(--surf2) 25%, var(--surf) 50%, var(--surf2) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  )
}
