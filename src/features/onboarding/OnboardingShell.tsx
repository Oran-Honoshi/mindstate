'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { WelcomeSlide } from './slides/WelcomeSlide'
import { CategorySlide } from './slides/CategorySlide'
import { GoalSlide } from './slides/GoalSlide'
import { AccountSlide } from './slides/AccountSlide'
import { ConfettiBurst } from './ConfettiBurst'
import { useOnboarding } from './useOnboarding'

const CTA_LABELS = ['Get Started', 'Continue', 'Continue', 'Start Playing']

const slideVariants = {
  enter: (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? '100%' : '-100%' }),
  center: { x: 0 },
  exit:  (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? '-100%' : '100%' }),
}

const transition = { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const }

export function OnboardingShell() {
  const {
    currentSlide, direction,
    selectedCategories, setSelectedCategories,
    selectedGoal, setSelectedGoal,
    accountValues, accountErrors, setAccountValue,
    previousSlide, completeOnboarding, handleCTA,
  } = useOnboarding()

  const slides = [
    <WelcomeSlide key="welcome" />,
    <CategorySlide
      key="category"
      selectedCategories={selectedCategories}
      onChange={setSelectedCategories}
    />,
    <GoalSlide
      key="goal"
      selectedGoal={selectedGoal}
      onChange={setSelectedGoal}
    />,
    <AccountSlide
      key="account"
      values={accountValues}
      errors={accountErrors}
      onChange={setAccountValue}
    />,
  ]

  const progressPct = (currentSlide / 3) * 100

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      <ConfettiBurst />

      {/* Progress bar */}
      <div style={{ height: 6, width: '100%', background: 'var(--surf2)', flexShrink: 0, zIndex: 1 }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: 'var(--accent)',
          transition: 'width 0.35s ease',
        }} />
      </div>

      {/* Slide container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            style={{ position: 'absolute', inset: 0 }}
          >
            {slides[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px var(--screen-pad)', borderTop: '0.5px solid var(--border)', flexShrink: 0 }}>
        <Button variant="primary" size="lg" fullWidth onClick={handleCTA}>
          {CTA_LABELS[currentSlide]}
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div>
            {currentSlide > 0 && (
              <Button variant="text" onClick={previousSlide}>← Back</Button>
            )}
          </div>
          <div>
            {currentSlide < 3 && (
              <Button variant="text" onClick={completeOnboarding}>Skip</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
