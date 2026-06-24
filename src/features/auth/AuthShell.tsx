'use client'

import { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type AuthView = 'signIn' | 'signUp' | 'forgotPassword'

interface AuthShellProps {
  view: AuthView
  onViewChange: (view: AuthView) => void
  children: ReactNode
}

const topGlow: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 70%)',
  pointerEvents: 'none',
}

function AppMark() {
  return (
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 14,
      background: 'linear-gradient(135deg, var(--accent), var(--violet))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 18,
        color: 'var(--on-accent)',
        letterSpacing: '-0.02em',
      }}>ME</span>
    </div>
  )
}

export function AuthShell({ view, onViewChange, children }: AuthShellProps) {
  const router = useRouter()

  function handleToggle() {
    if (view === 'signIn' || view === 'forgotPassword') {
      onViewChange('signUp')
      router.push('/auth/signup')
    } else {
      onViewChange('signIn')
      router.push('/auth/signin')
    }
  }

  const isSignIn = view === 'signIn' || view === 'forgotPassword'

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflowY: 'auto',
    }}>
      {/* Top branding section */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px var(--screen-pad) 24px',
        minHeight: 180,
      }}>
        <div style={topGlow} />
        <AppMark />
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 22,
          color: 'var(--text)',
          marginBottom: 4,
        }}>Mind Element</div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--muted)',
        }}>Sharper every day.</div>
      </div>

      {/* Main content slot */}
      <div style={{ flex: 1, padding: '0 var(--screen-pad) 32px' }}>
        {children}
      </div>

      {/* Bottom toggle */}
      <div style={{
        padding: '16px var(--screen-pad) 32px',
        textAlign: 'center',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--muted)',
      }}>
        {isSignIn ? (
          <>No account?{' '}
            <button type="button" onClick={handleToggle} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontWeight: 600, fontSize: 14,
              fontFamily: 'var(--font-body)', padding: 0,
            }}>Sign up free</button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button type="button" onClick={handleToggle} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontWeight: 600, fontSize: 14,
              fontFamily: 'var(--font-body)', padding: 0,
            }}>Sign in</button>
          </>
        )}
      </div>
    </div>
  )
}
