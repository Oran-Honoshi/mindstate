'use client'

import { SparkyImg } from '@/components/ui/SparkyImg'
import { Btn } from '@/components/ui/Btn'

interface UpgradeBannerProps {
  isSubscribed: boolean
  onOpenPaywall: () => void
}

export function UpgradeBanner({ isSubscribed, onOpenPaywall }: UpgradeBannerProps) {
  if (isSubscribed) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, var(--surf)) 0%, var(--surf) 100%)',
      border: '0.5px solid color-mix(in srgb, var(--accent) 30%, transparent)',
      borderRadius: 'var(--r-card)',
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <SparkyImg expr="celebrate" size={44} />

      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 16,
          color: 'var(--text)',
        }}>
          Unlock All 24 Games
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--muted)',
          marginTop: 4,
        }}>
          From $2/month · Family plans available
        </div>
        <div style={{ marginTop: 8 }}>
          <Btn variant="primary" size="sm" fullWidth={false} onClick={onOpenPaywall}>
            Go Pro
          </Btn>
        </div>
      </div>
    </div>
  )
}
