'use client'

import { CSSProperties, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { SparkyImg } from '@/components/ui/SparkyImg'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface ForgotPasswordViewProps {
  onBack: () => void
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

export function ForgotPasswordView({ onBack }: ForgotPasswordViewProps) {
  const [email, setEmail]       = useState('')
  const [emailError, setEmailError] = useState<string | undefined>()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      setEmailError('Enter a valid email address')
      return
    }
    setEmailError(undefined)
    setIsLoading(true)
    setApiError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) {
      setApiError(error.message)
      setIsLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 16, textAlign: 'center' }}>
        <SparkyImg expr="happy" size={52} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>
          Check your email
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', maxWidth: 280 }}>
          We sent a reset link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.
        </p>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <Btn variant="primary" size="lg" onClick={() => window.open('mailto:')}>
            Open email
          </Btn>
          <button
            type="button"
            onClick={handleSubmit as unknown as () => void}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: 'var(--accent)', fontWeight: 600, padding: '8px 0',
            }}
          >
            Resend
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>
          Reset password
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)' }}>
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      {apiError && <ErrorBanner message={apiError} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          error={emailError}
          autoComplete="email"
          disabled={isLoading}
        />
        <Btn variant="primary" size="lg" type="submit" disabled={isLoading}>
          {isLoading ? 'Sending…' : 'Send Reset Link'}
        </Btn>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14,
            color: 'var(--muted)', padding: '4px 0', textAlign: 'center',
          }}
        >
          ← Back to sign in
        </button>
      </form>
    </div>
  )
}
