'use client'

import { Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SparkyImg } from '@/components/ui/SparkyImg'
import type { SparkyExpr } from '@/components/ui/SparkyImg'

const GOALS = [
  { n: 1,  xp: '~600 XP/day' },
  { n: 2,  xp: '~1,200 XP/day' },
  { n: 3,  xp: '~1,800 XP/day' },
  { n: 5,  xp: '~3,000 XP/day' },
  { n: 10, xp: '~6,000 XP/day' },
]

function sparkyExpr(goal: number): SparkyExpr {
  if (goal >= 10) return 'celebrate'
  if (goal >= 5) return 'focused'
  return 'happy'
}

interface Props {
  selectedGoal: number
  onChange: (goal: number) => void
}

export function GoalSlide({ selectedGoal, onChange }: Props) {
  const dailyXP = selectedGoal * 600
  const estimatedLevel = Math.min(50, Math.floor((selectedGoal * 600 * 7) / 1000) + 1)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px var(--screen-pad) 0', overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>
        Set your daily goal
      </h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
        How many stages do you want to complete each day?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {GOALS.map(({ n, xp }) => {
          const selected = selectedGoal === n
          return (
            <Card
              key={n}
              variant="default"
              padding="14px 16px"
              onClick={() => onChange(n)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
                border: selected ? '1.5px solid var(--accent)' : '0.5px solid var(--border)',
                background: selected ? 'color-mix(in srgb, var(--accent) 8%, var(--surf))' : 'var(--surf)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
                {n} stage{n > 1 ? 's' : ''}/day
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: selected ? 'var(--gold)' : 'var(--muted)' }}>
                  {xp}
                </span>
                {selected && <Check size={16} color="var(--accent)" strokeWidth={2.5} />}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Live XP preview */}
      <Card variant="default" padding="12px 16px" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <SparkyImg expr={sparkyExpr(selectedGoal)} size={36} />
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>
            That&apos;s ~{dailyXP.toLocaleString()} XP/day
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
            You&apos;ll reach Level {estimatedLevel} in a week
          </p>
        </div>
      </Card>
    </div>
  )
}
