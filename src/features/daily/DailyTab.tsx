'use client'

import { useState, useRef, useMemo, CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_CHALLENGES, DailyChallenge } from './dailyData'
import { DailyHeader } from './DailyHeader'
import { SparkyCoachingStrip } from './SparkyCoachingStrip'
import { ChallengeCarousel, ChallengeCarouselHandle } from './ChallengeCarousel'
import { DotIndicator } from './DotIndicator'
import { StatsStrip } from './StatsStrip'

export function DailyTab() {
  const router = useRouter()
  const [challenges] = useState<DailyChallenge[]>(MOCK_CHALLENGES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<ChallengeCarouselHandle>(null)

  const resetsAt = useMemo(() => {
    const d = new Date()
    d.setHours(24, 0, 0, 0)
    return d
  }, [])

  const completedCount = challenges.filter(c => c.isCompleted).length
  const totalXPEarned  = challenges.reduce((s, c) => s + (c.xpEarned ?? 0), 0)
  const completedIndices = challenges
    .map((c, i) => c.isCompleted ? i : -1)
    .filter(i => i >= 0)

  function handlePlay(challenge: DailyChallenge) {
    router.push(`/games/${challenge.gameSlug}?stage=${challenge.stage}&daily=true`)
  }

  function handleDotTap(i: number) {
    setCurrentIndex(i)
    carouselRef.current?.scrollToIndex(i)
  }

  const rootStyle: CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  return (
    <div style={rootStyle}>
      <DailyHeader completedCount={completedCount} resetsAt={resetsAt} />
      <SparkyCoachingStrip completedCount={completedCount} totalXPEarned={totalXPEarned} />
      <ChallengeCarousel
        ref={carouselRef}
        challenges={challenges}
        onIndexChange={setCurrentIndex}
        onPlay={handlePlay}
      />
      <DotIndicator
        total={8}
        currentIndex={currentIndex}
        completedIndices={completedIndices}
        onDotTap={handleDotTap}
      />
      <StatsStrip totalXP={totalXPEarned} completedCount={completedCount} streak={28} />
    </div>
  )
}
