'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthShell } from '@/features/auth/AuthShell'
import { SignInView } from '@/features/auth/SignInView'
import { ForgotPasswordView } from '@/features/auth/ForgotPasswordView'

type View = 'signIn' | 'forgotPassword'

export default function SignInPage() {
  const [view, setView] = useState<View>('signIn')
  const router = useRouter()

  return (
    <AuthShell
      view={view}
      onViewChange={(v) => {
        if (v === 'signUp') router.push('/auth/signup')
        else setView(v as View)
      }}
    >
      {view === 'signIn' ? (
        <SignInView onForgotPassword={() => setView('forgotPassword')} />
      ) : (
        <ForgotPasswordView onBack={() => setView('signIn')} />
      )}
    </AuthShell>
  )
}
