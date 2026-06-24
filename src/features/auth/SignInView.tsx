'use client'

import { CSSProperties, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { GoogleOAuthButton } from '@/components/ui/GoogleOAuthButton'

interface SignInViewProps {
  onForgotPassword: () => void
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>or</span>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 'var(--r-card)',
    border: '1px solid var(--hard)',
    background: 'color-mix(in srgb, var(--hard) 10%, var(--surf))',
    marginBottom: 16,
  }
  return (
    <div style={style}>
      <X size={14} color="var(--hard)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--hard)' }}>{message}</span>
    </div>
  )
}

export function SignInView({ onForgotPassword }: SignInViewProps) {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: { email?: string; password?: string } = {}
    if (!EMAIL_RE.test(email)) errs.email = 'Enter a valid email address'
    if (!password) errs.password = 'Password is required'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setIsLoading(true)
    setApiError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setApiError(error.message)
      setIsLoading(false)
    } else {
      router.push('/shell')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--text)', marginBottom: 6 }}>
          Welcome back
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)' }}>
          Sign in to continue your streak.
        </p>
      </div>

      {apiError && <ErrorBanner message={apiError} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GoogleOAuthButton disabled={isLoading} />

        <Divider />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
          disabled={isLoading}
        />
        <Input
          label="Password"
          type="password"
          placeholder="your password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="current-password"
          disabled={isLoading}
        />

        <div style={{ textAlign: 'right', marginTop: -8 }}>
          <button
            type="button"
            onClick={onForgotPassword}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--accent)', fontWeight: 600, padding: 0,
            }}
          >
            Forgot password?
          </button>
        </div>

        <Btn variant="primary" size="lg" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in…' : 'Sign In'}
        </Btn>
      </form>
    </div>
  )
}
