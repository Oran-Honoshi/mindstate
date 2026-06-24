'use client'

import { useRouter } from 'next/navigation'
import { AuthShell } from '@/features/auth/AuthShell'
import { SignUpView } from '@/features/auth/SignUpView'

export default function SignUpPage() {
  const router = useRouter()

  return (
    <AuthShell
      view="signUp"
      onViewChange={(v) => {
        if (v === 'signIn') router.push('/auth/signin')
      }}
    >
      <SignUpView />
    </AuthShell>
  )
}
