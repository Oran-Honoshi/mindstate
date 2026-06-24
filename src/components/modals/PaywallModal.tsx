'use client'

import { useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { Btn } from '@/components/ui/Btn'
import { Card } from '@/components/ui/Card'

type PlanId = 'individual' | 'family3' | 'family7'
type Billing = 'monthly' | 'annual'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (plan: PlanId, billing: Billing) => void
}

interface PlanConfig {
  id: PlanId
  name: string
  monthly: string
  annual: string
  features: string[]
  popular?: boolean
}

const PLANS: PlanConfig[] = [
  {
    id: 'individual',
    name: 'Individual',
    monthly: '$2/mo',
    annual: '$16/yr',
    features: ['Unlimited plays', 'All 24 games', 'Personal leaderboard'],
  },
  {
    id: 'family3',
    name: 'Family 3',
    monthly: '$5/mo',
    annual: '$40/yr',
    features: ['Unlimited plays', 'All 24 games', 'Family leaderboard · 3 profiles'],
    popular: true,
  },
  {
    id: 'family7',
    name: 'Family 7',
    monthly: '$10/mo',
    annual: '$80/yr',
    features: ['Unlimited plays', 'All 24 games', 'Up to 7 profiles'],
  },
]

export function PaywallModal({ isOpen, onClose, onSelectPlan }: PaywallModalProps) {
  const [billing, setBilling] = useState<Billing>('annual')
  const [selected, setSelected] = useState<PlanId>('family3')

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>
          Unlock Everything
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
          Play unlimited stages across all 24 games
        </div>
      </div>

      {/* Billing toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['monthly', 'annual'] as Billing[]).map(b => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 'var(--r-pill)',
              border: 'none', cursor: 'pointer', position: 'relative',
              background: billing === b ? 'var(--accent)' : 'var(--surf2)',
              color: billing === b ? 'var(--on-accent)' : 'var(--muted)',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
            }}
          >
            {b === 'monthly' ? 'Monthly' : 'Annual'}
            {b === 'annual' && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--gold)', color: '#1a1000',
                fontFamily: 'var(--font-mono)', fontSize: 9,
                padding: '2px 5px', borderRadius: 4,
              }}>Save 33%</span>
            )}
          </button>
        ))}
      </div>

      {/* Plan cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {PLANS.map(plan => (
          <div
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            style={{
              padding: '14px', borderRadius: 'var(--r-card)',
              background: 'var(--surf2)',
              border: `1.5px solid ${selected === plan.id ? 'var(--accent)' : plan.popular ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border)'}`,
              cursor: 'pointer', position: 'relative',
            }}
          >
            {plan.popular && (
              <span style={{
                position: 'absolute', top: -8, right: 12,
                background: 'var(--surf)', border: '1px solid var(--accent)',
                color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 9,
                padding: '2px 7px', borderRadius: 4, letterSpacing: '0.08em',
              }}>MOST POPULAR</span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{plan.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 22, color: 'var(--accent)', marginLeft: 'auto' }}>
                {billing === 'monthly' ? plan.monthly : plan.annual}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {plan.features.map(f => (
                <span key={f} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)' }}>· {f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Btn variant="primary" size="lg" onClick={() => onSelectPlan(selected, billing)}>
        Start 7-day free trial
      </Btn>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
        Cancel anytime · No card surprises
      </div>
    </BottomSheet>
  )
}
