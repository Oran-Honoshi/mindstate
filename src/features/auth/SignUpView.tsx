'use client'

import { CSSProperties, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { GoogleOAuthButton } from '@/components/ui/GoogleOAuthButton'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const USERNAME_RE = /^[a-zA-Z0-9_]+$/

type Strength = 'weak' | 'fair' | 'strong'

function getStrength(pw: string): Strength {
  if (pw.length >= 10) return 'strong'
  if (pw.length >= 6) return 'fair'
  return 'weak'
}

const STRENGTH_CONFIG: Record<Strength, { label: string; color: string; segments: number }> = {
  weak:   { label: 'Weak',   color: 'var(--hard)',   segments: 1 },
  fair:   { label: 'Fair',   color: 'var(--medium)', segments: 2 },
  strong: { label: 'Strong', color: 'var(--easy)',   segments: 3 },
}

function PasswordStrength({ password }: { password: string }) {
  if (!password.length) return null
  const s = getStrength(password)
  const { label, color, segments } = STRENGTH_CONFIG[s]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: -8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= segments ? color : 'var(--surf2)',
            transition: 'background 200ms ease',
          }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color }}>{label}</span>
    </div>
  )
}

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
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', borderRadius: 'var(--r-card)',
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

export function SignUpView() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState<{ username?: string; email?: string; password?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!username || username.length < 3) errs.username = 'Username must be at least 3 characters'
    else if (!USERNAME_RE.test(username)) errs.username = 'Username can only contain letters, numbers, and _'
    if (!EMAIL_RE.test(email)) errs.email = 'Enter a valid email address'
    if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setIsLoading(true)
    setApiError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username } },
    })
    if (error) {
      setApiError(error.message)
      setIsLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        subscription_status: 'free',
      })
    }
    router.push('/onboard')
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--text)', marginBottom: 6 }}>
          Create account
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)' }}>
          Start your brain training today.
        </p>
      </div>

      {apiError && <ErrorBanner message={apiError} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GoogleOAuthButton disabled={isLoading} />

        <Divider />

        <Input
          label="Username"
          type="username"
          placeholder="how others will see you"
          value={username}
          onChange={setUsername}
          error={errors.username}
          autoComplete="username"
          disabled={isLoading}
        />
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
          placeholder="8+ characters"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="new-password"
          disabled={isLoading}
        />

        <PasswordStrength password={password} />

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5,
        }}>
          By continuing you agree to our{' '}
          <a href="/terms" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Terms</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy</a>.
        </p>

        <Btn variant="primary" size="lg" type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Create Account'}
        </Btn>
      </form>
    </div>
  )
}
