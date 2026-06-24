'use client'

const PILLS = ['28-day streak', '10k+ players', '24 games']

export function WelcomeSlide() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px var(--screen-pad)', textAlign: 'center', position: 'relative',
    }}>
      {/* radial gradient glow from top */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 70%)',
      }} />

      {/* floating AppIcon */}
      <div className="ob-float" style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 68, height: 68, borderRadius: 18,
          background: 'linear-gradient(135deg, var(--accent), var(--violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px color-mix(in srgb, var(--accent) 30%, transparent)',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
            color: 'var(--on-accent)',
          }}>ME</span>
        </div>
      </div>

      {/* stat pills */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        {PILLS.map((label) => (
          <div key={label} style={{
            borderRadius: 'var(--r-pill)', padding: '6px 14px',
            background: 'color-mix(in srgb, var(--accent) 10%, var(--surf))',
            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)',
          }}>
            {label}
          </div>
        ))}
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30,
        color: 'var(--text)', lineHeight: 1.2, marginBottom: 12, position: 'relative', zIndex: 1,
      }}>
        Train your mind. Every day.
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)',
        lineHeight: 1.5, position: 'relative', zIndex: 1,
      }}>
        24 games. Daily challenges. Real progress.
      </p>
    </div>
  )
}
