'use client'

import { useRef, useEffect } from 'react'
import { StageNode } from './StageNode'

const SVG_W = 300
const AMPLITUDE = 84
const VSPACING = 70
const TOP_PAD = 80
const TOTAL = 100

function nodePos(i: number) {
  return {
    x: SVG_W / 2 + AMPLITUDE * Math.sin(i * 0.8),
    y: TOP_PAD + i * VSPACING,
  }
}

interface StagePathProps {
  slug: string
  completed: Set<number>
  lastStage: number
  onStageSelect: (stage: number) => void
}

const DIFF_LABELS = [
  { i: 0,  label: 'EASY' },
  { i: 30, label: 'MEDIUM' },
  { i: 70, label: 'HARD' },
]

export function StagePath({ completed, lastStage, onStageSelect }: StagePathProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const positions = Array.from({ length: TOTAL }, (_, i) => nodePos(i))
  const svgHeight = TOP_PAD + (TOTAL - 1) * VSPACING + 80

  const allPts = positions.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const donePts = positions.slice(0, lastStage).map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [lastStage])

  return (
    <>
      <style>{`
        @keyframes stagePulse { 0% { transform: translate(-50%,-50%) scale(1); opacity: 0.55; } 100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; } }
        @keyframes sparkyFade { 0% { opacity:0; transform:translateX(-50%) translateY(8px); } 100% { opacity:1; transform:translateX(-50%) translateY(0); } }
      `}</style>
      <div style={{ position: 'relative', width: SVG_W, margin: '0 auto', padding: '0 0 40px', height: svgHeight }}>
        {/* SVG background + completed path */}
        <svg
          width={SVG_W} height={svgHeight}
          viewBox={`0 0 ${SVG_W} ${svgHeight}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'block' }}
        >
          <polyline points={allPts} fill="none" stroke="var(--border)" strokeWidth={2} strokeDasharray="6 4" />
          {lastStage > 1 && <polyline points={donePts} fill="none" stroke="var(--accent)" strokeWidth={2} opacity={0.6} />}
          {DIFF_LABELS.map(({ i, label }) => {
            const p = positions[i]
            const xOff = p.x > SVG_W / 2 ? -10 : SVG_W - 10
            return (
              <text key={label} x={xOff} y={p.y - 14}
                textAnchor={p.x > SVG_W / 2 ? 'end' : 'start'}
                fontFamily="var(--font-mono)" fontSize={8} fill="var(--faint)" letterSpacing="0.15em">
                {label}
              </text>
            )
          })}
        </svg>

        {/* Scroll anchor */}
        <div ref={scrollRef} style={{ position: 'absolute', top: Math.max(0, nodePos(lastStage - 1).y - 60), height: 1, width: 1, pointerEvents: 'none' }} />

        {/* Nodes */}
        {positions.map((pos, i) => {
          const stageNum = i + 1
          const done = completed.has(stageNum)
          const current = stageNum === lastStage
          const locked = stageNum > lastStage
          const isMilestone = stageNum % 5 === 0
          return (
            <StageNode key={i} stageNum={stageNum} pos={pos} done={done} current={current}
              locked={locked} isMilestone={isMilestone} lastStage={lastStage}
              onTap={() => onStageSelect(stageNum)} />
          )
        })}
      </div>
    </>
  )
}
