'use client'

import { Bar } from '@/components/ui/Bar'
import { Card } from '@/components/ui/Card'

interface LobbyProgressProps {
  stagesCompleted: number
}

interface DiffRow { label: string; range: string; total: number; done: number; locked: boolean; color: string }

export function LobbyProgress({ stagesCompleted: sc }: LobbyProgressProps) {
  const pct = Math.round((sc / 100) * 100)

  const tiers = [
    { label: 'Bronze', count: 10,  reached: sc >= 1,  color: '#CD7F32', flex: 1 },
    { label: 'Silver', count: 20, reached: sc >= 10, color: '#C0C0C0', flex: 2 },
    { label: 'Gold',   count: 30, reached: sc >= 30, color: 'var(--gold)', flex: 3 },
    { label: 'Diamond',count: 40, reached: sc >= 60, color: 'var(--violet)', flex: 4 },
  ]

  const diffRows: DiffRow[] = [
    { label: 'Easy',   range: '1–30',   total: 30, done: Math.min(sc, 30),           locked: false,    color: 'var(--easy)' },
    { label: 'Medium', range: '31–70',  total: 40, done: Math.max(0, Math.min(sc-30,40)), locked: sc < 30,  color: 'var(--medium)' },
    { label: 'Hard',   range: '71–100', total: 30, done: Math.max(0, sc-70),          locked: sc < 70,  color: 'var(--hard)' },
  ]

  return (
    <div style={{ padding: '0 var(--screen-pad)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Overall Progress</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>{pct}%</span>
      </div>
      <Bar colorMode="accent" value={sc / 100} height={6} />
      <div style={{ marginTop: 12, marginBottom: 4, display: 'flex', gap: 4 }}>
        {tiers.map(t => (
          <div key={t.label} style={{ flex: t.flex, height: 4, borderRadius: 99, background: t.reached ? t.color : 'var(--surf2)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        {tiers.map(t => (
          <span key={t.label} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: t.reached ? t.color : 'var(--faint)' }}>{t.label}</span>
        ))}
      </div>
      <Card variant="default" padding="0" radius="var(--r-card)">
        {diffRows.map((r, i) => (
          <div key={r.label} style={{
            display: 'flex', alignItems: 'center', padding: '12px 14px',
            borderTop: i === 0 ? 'none' : '0.5px solid var(--border)',
            opacity: r.locked ? 0.45 : 1,
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: r.color }}>{r.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>Stages {r.range}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: r.locked ? 'var(--faint)' : 'var(--text)' }}>
              {r.locked ? 'Locked' : `${r.done}/${r.total}`}
            </span>
          </div>
        ))}
      </Card>
    </div>
  )
}
