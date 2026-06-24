'use client'

import { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { SparkyImg } from '@/components/ui/SparkyImg'
import type { AccountValues, AccountErrors } from '../useOnboarding'

interface FieldProps {
  label: string
  type: string
  placeholder: string
  value: string
  error?: string
  onChange: (v: string) => void
}

function FormField({ label, type, placeholder, value, error, onChange }: FieldProps) {
  const inputStyle: CSSProperties = {
    width: '100%', padding: '13px 14px',
    background: 'var(--surf2)',
    border: `1px solid ${error ? 'var(--hard)' : 'var(--border)'}`,
    borderRadius: 'var(--r-input)',
    fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text)',
    outline: 'none',
  }

  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
        onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? 'var(--hard)' : 'var(--border)' }}
      />
      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--hard)', marginTop: 4 }}>{error}</p>
      )}
    </div>
  )
}

interface Props {
  values: AccountValues
  errors: AccountErrors
  onChange: (field: string, value: string) => void
}

export function AccountSlide({ values, errors, onChange }: Props) {
  const router = useRouter()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px var(--screen-pad) 0', alignItems: 'center', overflowY: 'auto' }}>
      <div style={{ marginBottom: 16 }}>
        <SparkyImg expr="celebrate" size={48} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text)', textAlign: 'center', marginBottom: 6 }}>
        You&apos;re all set!
      </h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', textAlign: 'center', marginBottom: 24 }}>
        Create your account to save progress
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField label="Name" type="text" placeholder="Your name" value={values.name} error={errors.name} onChange={(v) => onChange('name', v)} />
        <FormField label="Email" type="email" placeholder="your@email.com" value={values.email} error={errors.email} onChange={(v) => onChange('email', v)} />
        <FormField label="Password" type="password" placeholder="8+ characters" value={values.password} error={errors.password} onChange={(v) => onChange('password', v)} />
      </div>

      <p style={{ marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
        Already have an account?{' '}
        <span onClick={() => router.push('/auth/login')} style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>
          Sign in
        </span>
      </p>
    </div>
  )
}
