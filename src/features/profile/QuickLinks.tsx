'use client'

import { useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'

interface QuickLinksProps {
  isSubscribed: boolean
  onOpenPaywall: () => void
}

export function QuickLinks({ isSubscribed, onOpenPaywall }: QuickLinksProps) {
  const router = useRouter()

  const cardBase = {
    flex: 1,
    background: 'var(--surf)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--r-card)',
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    transition: 'transform 0.1s, background 0.15s',
  }

  const links = [
    {
      icon: 'User' as const,
      color: 'var(--accent)',
      label: 'Family',
      action: () => router.push('/family'),
      show: true,
    },
    {
      icon: 'Crown' as const,
      color: 'var(--gold)',
      label: 'Go Pro',
      action: onOpenPaywall,
      show: !isSubscribed,
    },
    {
      icon: 'Settings' as const,
      color: 'var(--muted)',
      label: 'Settings',
      action: () => router.push('/settings'),
      show: true,
    },
  ].filter((l) => l.show)

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {links.map(({ icon, color, label, action }) => (
        <div
          key={label}
          style={cardBase}
          onClick={action}
          onPointerDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onPointerUp={(e) => (e.currentTarget.style.transform = '')}
          onPointerLeave={(e) => (e.currentTarget.style.transform = '')}
        >
          <Icon name={icon} size={22} color={color} strokeWidth={2} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 12,
            color: 'var(--text)',
          }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
