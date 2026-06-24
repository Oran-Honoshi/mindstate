'use client'

import { CSSProperties, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GoogleOAuthButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  disabled?: boolean
}

/* Google brand colors — intentional hardcode */
const GoogleGLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.6 9.2c0-.6 0-1.1-.2-1.6H9v3.2h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4z"/>
    <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 15.9 5.4 18 9 18z"/>
    <path fill="#FBBC05" d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5H.9C.3 6.2 0 7.5 0 9s.3 2.8.9 4z"/>
    <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.5.9 11.4 0 9 0 5.4 0 2.4 2.1.9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z"/>
  </svg>
)

export function GoogleOAuthButton({ onSuccess, onError, disabled }: GoogleOAuthButtonProps) {
  const [hovered, setHovered] = useState(false)

  async function handleClick() {
    if (disabled) return
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      onError?.(error.message)
    } else {
      onSuccess?.()
    }
  }

  const style: CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    background: hovered ? 'var(--surf2)' : 'var(--surf)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-btn)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text)',
    opacity: disabled ? 0.5 : 1,
    transition: 'background 150ms ease, opacity 120ms ease',
  }

  return (
    <button
      type="button"
      style={style}
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={(e) => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
      onPointerUp={(e) => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      <GoogleGLogo />
      Continue with Google
    </button>
  )
}
