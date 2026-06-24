'use client'

import { useRouter } from 'next/navigation'
import { AuthShell } from '@/features/auth/AuthShell'
import { ForgotPasswordView } from '@/features/auth/ForgotPasswordView'

export default function ForgotPasswordPage() {
  const router = useRouter()

  return (
    <AuthShell
      view="forgotPassword"
      onViewChange={(v) => {
        if (v === 'signUp') router.push('/auth/signup')
        else router.push('/auth/signin')
      }}
    >
      <ForgotPasswordView onBack={() => router.push('/auth/signin')} />
    </AuthShell>
  )
}
