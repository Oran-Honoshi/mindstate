# MindElement — Design System

## Theme
**Default:** Dark. Scene: player glancing at their score on a phone in a dim room after work. The darkness is intentional — it makes the cyan scores pop.

## Palette
| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#121212` | Base surface — near-black charcoal |
| `--color-surface` | `#1E1E1E` | Elevated surface |
| `--color-surface-2` | `#2A2A2A` | Double-elevated |
| `--color-accent-primary` | `#00FFFF` | Electric Cyan — scores, XP, active states |
| `--color-accent-secondary` | `#39FF14` | Neon Mint — streaks, success states |
| `--color-text-primary` | `#F5F5F5` | Body text |
| `--color-text-secondary` | `#A0A0A0` | Labels, secondary |
| `--color-border` | `rgba(255,255,255,0.12)` | Borders |
| `--color-on-accent` | `#000000` | Text on cyan backgrounds |
| `--color-error` | `#FF4444` | Errors |

Color strategy: **Committed** — cyan is not an accent, it IS the brand. Score numbers, XP, active tab indicators all use it without apology.

## Typography
| Token | Value | Use |
|---|---|---|
| `--font-sans` | Inter | Headlines, body, UI labels |
| `--font-mono` | JetBrains Mono | Scores, XP numbers, stage numbers, timers |

### Hierarchy
- Display: 72–96px, weight 800, line-height 1.0, letter-spacing -0.02em
- H1: 48–80px, weight 700, line-height 1.06
- H2: 32–40px, weight 700
- Body: 16–18px, weight 400, line-height 1.65, max 65ch
- Label: 10–12px, weight 700, letter-spacing 0.08–0.12em, uppercase

Monospace (JetBrains Mono) is reserved for score values, XP numbers, stage numbers, timers. It is never used as a "technical" aesthetic prop.

## Spacing
Vary for rhythm. Section breaks: 80–96px. Inner section gaps: 48px. Card internals: 20–28px.

## Border radius
Default `--radius`: 8px. Sharp 4px for scoreboard/table rows. Rounder 16–24px for card panels.

## Motion
Framer Motion only. Ease-out on reveal. No bounce, no elastic. Stagger 0.05–0.1s per item.
Entry: `opacity 0→1, y 20→0, duration 0.4–0.6`.

## Component conventions
- Buttons: `components/ui/Button.tsx` always
- Modals: Radix Dialog via `components/ui/Modal.tsx`
- Icons: Lucide React only
- No raw `<button>` in feature components

## Banned patterns (per design laws)
- Gradient text (`background-clip: text` + gradient)
- Rounded icon badges above every card heading
- Identical card grid with icon+heading+text repeated
- Glassmorphism as default
- Side-stripe borders >1px as colored accents
- Gradient text
- All-caps body copy
