'use client'

import { useRef, useEffect, forwardRef, useImperativeHandle, CSSProperties } from 'react'
import { DailyChallenge } from './dailyData'
import { ChallengeCard } from './ChallengeCard'

export interface ChallengeCarouselHandle {
  scrollToIndex(i: number): void
}

interface ChallengeCarouselProps {
  challenges: DailyChallenge[]
  onIndexChange: (i: number) => void
  onPlay: (c: DailyChallenge) => void
}

export const ChallengeCarousel = forwardRef<ChallengeCarouselHandle, ChallengeCarouselProps>(
  function ChallengeCarousel({ challenges, onIndexChange, onPlay }, ref) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const isSyncing = useRef(false)
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useImperativeHandle(ref, () => ({
      scrollToIndex(i: number) {
        const el = scrollRef.current
        if (!el) return
        isSyncing.current = true
        el.scrollTo({ left: i * el.offsetWidth, behavior: 'smooth' })
        setTimeout(() => { isSyncing.current = false }, 520)
      },
    }))

    useEffect(() => {
      const el = scrollRef.current
      if (!el) return
      const handle = () => {
        if (isSyncing.current) return
        clearTimeout(scrollTimer.current)
        scrollTimer.current = setTimeout(() => {
          const idx = Math.round(el.scrollLeft / (el.offsetWidth || 1))
          onIndexChange(Math.max(0, Math.min(idx, challenges.length - 1)))
        }, 80)
      }
      el.addEventListener('scroll', handle, { passive: true })
      return () => { el.removeEventListener('scroll', handle) }
    }, [challenges.length, onIndexChange])

    const containerStyle: CSSProperties = {
      flex: 1,
      display: 'flex',
      overflowX: 'auto',
      scrollSnapType: 'x mandatory',
      // WebkitOverflowScrolling handled by className for iOS momentum scroll
      minHeight: 0,
    }

    const slideStyle: CSSProperties = {
      minWidth: '100%',
      scrollSnapAlign: 'start',
      flexShrink: 0,
      display: 'flex',
      padding: '6px 0',
    }

    return (
      <div
        ref={scrollRef}
        className="daily-carousel"
        style={containerStyle}
      >
        {challenges.map(c => (
          <div key={c.id} style={slideStyle}>
            <ChallengeCard challenge={c} onPlay={onPlay} />
          </div>
        ))}
      </div>
    )
  }
)
