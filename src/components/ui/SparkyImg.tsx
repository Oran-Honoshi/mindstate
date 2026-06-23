/**
 * SparkyImg — renders a Sparky expression PNG from /public/sparky/.
 *
 * Placement rules:
 *   App header:               size=26, expr='idle',      no animation
 *   Stage path current node:  size=38, expr='focused',   position absolute,
 *                             52px above node, translateX(-50%), z-index 3,
 *                             fade-in 400ms ease-out
 *   Daily coaching strip:     size=32, left-aligned
 *   Stage complete overlay:   size=52, below XP number
 *   Profile upgrade banner:   size=44, expr='celebrate'
 *   Onboarding slide 3 (goal):     size=48, expr='happy' or 'focused'
 *   Onboarding slide 4 (account):  size=48, expr='celebrate'
 */

export type SparkyExpr =
  | 'idle' | 'happy' | 'focused' | 'celebrate'
  | 'surprised' | 'resting' | 'gold' | 'violet' | 'hero'

interface SparkyImgProps {
  expr?: SparkyExpr
  mood?: SparkyExpr  // backwards-compat alias for expr
  size?: number
  className?: string
}

export function SparkyImg({ expr, mood, size = 48, className }: SparkyImgProps) {
  const expression = expr ?? mood ?? 'idle'
  return (
    <img
      src={`/sparky/${expression}.png`}
      width={size}
      height={size}
      alt={`Sparky ${expression}`}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
    />
  )
}
