'use client'

import { Icon } from '@/components/ui/Icon'
import { SparkyImg } from '@/components/ui/SparkyImg'

interface StageNodeProps {
  stageNum: number
  pos: { x: number; y: number }
  done: boolean
  current: boolean
  locked: boolean
  isMilestone: boolean
  lastStage: number
  onTap: () => void
}

export function StageNode({ stageNum, pos, done, current, locked, isMilestone, lastStage, onTap }: StageNodeProps) {
  const sz = current ? 52 : isMilestone ? 48 : 44
  const nearLocked = locked && stageNum <= lastStage + 5
  const opacity = locked && !nearLocked ? 0.35 : 1

  let bg = 'var(--surf)', border = '1.5px solid var(--border)'
  if (done && isMilestone && stageNum % 10 === 0) { bg = 'color-mix(in srgb, var(--violet) 20%, transparent)'; border = '2px solid var(--violet)' }
  else if (done && isMilestone) { bg = 'color-mix(in srgb, var(--gold) 18%, transparent)'; border = '2px solid var(--gold)' }
  else if (done) { bg = 'color-mix(in srgb, var(--accent) 12%, transparent)'; border = '2px solid var(--accent)' }
  else if (current) { bg = 'var(--accent)'; border = 'none' }
  else if (locked && isMilestone) { bg = 'var(--surf2)'; border = '1.5px solid var(--gold)' }

  return (
    <div
      onClick={!locked ? onTap : undefined}
      style={{
        position: 'absolute',
        left: pos.x, top: pos.y,
        transform: 'translate(-50%, -50%)',
        width: sz, height: sz,
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity,
        zIndex: current ? 10 : 1,
      }}
    >
      {/* Pulse ring */}
      {current && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: sz + 36, height: sz + 36,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'var(--accent)',
          opacity: 0,
          animation: 'stagePulse 1.8s infinite ease-out',
          pointerEvents: 'none',
        }} />
      )}
      {/* Sparky */}
      {current && (
        <div style={{
          position: 'absolute',
          top: -(sz / 2 + 52 + 38),
          left: '50%', transform: 'translateX(-50%)',
          animation: 'sparkyFade 400ms ease-out',
          zIndex: 20,
        }}>
          <SparkyImg expr="focused" size={38} />
        </div>
      )}
      {/* Node circle */}
      <div style={{
        width: sz, height: sz, borderRadius: '50%',
        background: bg, border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {done && isMilestone && stageNum % 10 === 0 && <Icon name="Trophy" size={16} color="var(--violet)" />}
        {done && isMilestone && stageNum % 10 !== 0 && <Icon name="Star" size={16} color="var(--gold)" />}
        {done && !isMilestone && <Icon name="Check" size={14} color="var(--accent)" />}
        {current && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--on-accent)' }}>{stageNum}</span>}
        {locked && <Icon name="Lock" size={13} color="var(--faint)" />}
      </div>
      {/* Label below current */}
      {current && (
        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '0.1em' }}>STAGE {stageNum}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--faint)' }}>up to 1000 XP</div>
        </div>
      )}
    </div>
  )
}
