'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function OnboardReset() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (params.get('reset-onboard') === 'true') {
      localStorage.removeItem('onboarding-complete')
      router.replace('/onboard')
    }
  }, [params, router])

  return null
}
