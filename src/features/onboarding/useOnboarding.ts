'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type SlideIndex = 0 | 1 | 2 | 3
export type Direction = 'forward' | 'back'

export interface AccountValues {
  name: string
  email: string
  password: string
}

export interface AccountErrors {
  name?: string
  email?: string
  password?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useOnboarding() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState<SlideIndex>(0)
  const [direction, setDirection] = useState<Direction>('forward')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedGoal, setSelectedGoal] = useState(3)
  const [accountValues, setAccountValuesState] = useState<AccountValues>({ name: '', email: '', password: '' })
  const [accountErrors, setAccountErrors] = useState<AccountErrors>({})

  function advanceSlide() {
    if (currentSlide < 3) {
      setDirection('forward')
      setCurrentSlide((n) => (n + 1) as SlideIndex)
    } else {
      completeOnboarding()
    }
  }

  function previousSlide() {
    if (currentSlide > 0) {
      setDirection('back')
      setCurrentSlide((n) => (n - 1) as SlideIndex)
    }
  }

  function completeOnboarding() {
    localStorage.setItem('onboarding-complete', 'true')
    router.push('/shell')
  }

  function setAccountValue(field: string, value: string) {
    setAccountValuesState((prev) => ({ ...prev, [field]: value }))
    setAccountErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validateAndComplete() {
    const errors: AccountErrors = {}
    if (!accountValues.name.trim()) errors.name = 'Name is required'
    if (!EMAIL_RE.test(accountValues.email)) errors.email = 'Enter a valid email'
    if (accountValues.password.length < 8) errors.password = 'Password must be 8+ characters'
    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors)
      return
    }
    completeOnboarding()
  }

  function handleCTA() {
    if (currentSlide === 3) {
      validateAndComplete()
    } else {
      advanceSlide()
    }
  }

  return {
    currentSlide, direction,
    selectedCategories, setSelectedCategories,
    selectedGoal, setSelectedGoal,
    accountValues, accountErrors, setAccountValue,
    advanceSlide, previousSlide, completeOnboarding, handleCTA,
  }
}
