# Design Tokens — Mind Element

All values are the source of truth (from `brandkit.jsx` `TOKENS`/`FONTS`). Implement as a theme provider; never hard-code dark values.

## Themes (runtime-switchable: Dark / Light / Paper)
| Token | Dark | Light | Paper |
|---|---|---|---|
| bg | `#0B0C0F` | `#F5F6F8` | `#ECE3D0` |
| surface | `#14161B` | `#FFFFFF` | `#F5EFE0` |
| surface-2 | `#1D2027` | `#EDEFF3` | `#E5DAC0` |
| border | `#2A2E37` | `#E2E5EB` | `#D6C9AB` |
| text | `#F4F6F8` | `#15171C` | `#241A0C` |
| muted | `#868D99` | `#5C6370` | `#7A6A4A` |
| faint | `#5A606C` | `#9AA1AD` | `#A8967A` |
| accent | `#2FE6E0` | `#0FB3AC` | `#0E8B90` |
| on-accent (text on accent) | `#06231F` | `#FFFFFF` | `#FFFFFF` |

Dark is the product default. Paper headlines use the serif + italic; Dark/Light use the grotesque.

## Brand accents (constant across themes)
- **Cyan — focus/interactive:** `#2FE6E0` (deep `#0E8E93`, soft `#8FF3EE`)
- **Violet — “mind”/milestones:** `#8E7CFF` (deep `#5B49C9`)
- **Gold — rewards ONLY:** `#FFC24B` (deep `#E0941B`)
> **Rule:** gold appears only for achievements, level-ups, medals, mastery — never in chrome. That’s what makes a reward feel earned.

## Difficulty
- Easy `#54D06A` · Medium `#F5A623` · Hard `#FF5C66`

## Medal / mastery tiers (gradient a→b)
- Bronze `#E7B07E → #B5732F` · Silver `#E2E8EF → #97A3B0` · Gold `#FFD479 → #E0941B` · Diamond `#A6F6F0 → #2FE6E0`
- Per-game mastery thresholds (stages cleared): Bronze 10 · Silver 30 · Gold 60 · Diamond 100.

## Account levels
XP ranks → named tiers: Spark (1–4) · Adept (5–9) · Sharp (10–19) · Tactician (20–34) · Master (35–49) · Grandmaster (50+). Level-up = full-screen takeover; ring color by tier (cyan <10, gold <25, violet ≥25).

## Typography
- **Display / numerals:** Space Grotesk 700 (tabular numerals for XP/scores).
- **Body / UI:** DM Sans 400/500/600.
- **Micro-labels:** Space Mono, UPPERCASE, letter-spacing `0.16–0.2em`.
- **Paper headlines:** Spectral 600/700 italic.
- Scale: Display 32 / 24 / 19 · Body 15 / 14 / 13 · Micro 11 / 10. Headline letter-spacing `-0.02em`.

## Radii
- Cards 14–18px · tiles/inputs 11–13px · pills/full · app-icon squircle = 22.5% of size · game-icon tile rounding ~25%.

## Motion
- Durations 0.18–0.45s. Easing `cubic-bezier(.3,.7,.3,1)` (and `.2,.7,.3,1`). Confetti restrained. Memory cards 3D-flip (.45s).

## Spacing
- Screen padding 16–24px · card padding 11–24px · grid gaps 8–16px. Mobile-first; phone canvas 384×812.
