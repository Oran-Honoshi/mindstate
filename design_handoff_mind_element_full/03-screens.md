# 03 · Screens

Every screen, with layout details. Open `prototypes/Cup Clash Approval.html` alongside this doc — each section here references the JSX renderer in `prototypes/approval-screens.jsx` (and `path-difficulty.jsx` / `game-board-themes.jsx` for stage map / games).

> **Mobile width**: design width is 400px (phone frame interior is 382px). Use that as your reference. See `09-mobile-first.md` for desktop behavior.

---

## 1 · Landing — `/`

**Renderer**: `LandingScreen` in `approval-screens.jsx`. **Route**: `/`.

### Anatomy

```
┌─────────────────────────────────────┐
│  ☰   Cup Clash      [Sign in]       │  ← top nav (hamburger LEFT)
├─────────────────────────────────────┤
│                                     │
│  EST. 2026 · DAILY EDITION          │  ← (paper only)
│                                     │
│  Sharpen daily.                     │  ← display XL, 40px, serif
│  Five minutes.                      │     accent color, italic in paper
│                                     │
│  Tango, Memory, Crowns and more.    │  ← body, ink-2, 14px
│  Five new puzzles a day…            │
│                                     │
│  ┌────┬────┬────┐                   │  ← 3 pictogram cards
│  │ ☼☽ │ □□ │ ♛  │                   │
│  │TANGO│MEMORY│CROWNS│              │
│  └────┴────┴────┘                   │
│                                     │
│  [    Start playing — free    ]     │  ← primary button, full width
│  No card. No subscription.          │
│                                     │
├─────────────────────────────────────┤
│  3.2M daily players      v 1.0      │  ← footer
└─────────────────────────────────────┘
```

### Behavior

- Hamburger opens drawer with anchor links to (`#how`, `#games`, `#pricing`, `#faq`) and `/onboarding`.
- Sign-in button → `/onboarding`.
- Primary CTA → `/onboarding`.
- The 3 pictograms are decorative on the hero; further down the page, the **Games** section repeats them as larger interactive cards each linking into `/onboarding?game=<slug>`.

### Below the hero (add as separate `<section id=…>`)

Build these only if you need additional landing content; they aren't shown in the prototype but the hamburger anchors expect them:

- `#how` — "How it works" (3 steps with icons)
- `#games` — Larger versions of the 3 game cards with descriptions
- `#pricing` — Paywall preview (free vs +)
- `#faq` — 4-6 expandable questions

If you skip them for v1, ship without those drawer links rather than linking to empty sections.

---

## 2 · Onboarding — `/onboarding`

**Renderer**: `OnboardingScreen` in `approval-screens.jsx`.

A 4-step flow. The prototype shows **step 2 of 4 — "What brings you here?"** as a representative pattern; all four steps share the same chrome.

### Steps

| Step | Title                       | Body                                     | Input                          |
|------|-----------------------------|------------------------------------------|--------------------------------|
| 1    | Welcome to Cup Clash        | Three games to start. More to unlock.    | Just a CTA "Begin"             |
| 2    | What brings you here?       | Pick one. We'll calibrate your daily set.| 3 radio options (see below)    |
| 3    | What should we call you?    | Choose a display name.                   | Text input + avatar picker     |
| 4    | How should it look?         | Pick a screen view. Change anytime.      | 3-up theme segmented control   |

Step 2 options (the prototype shows these):
- **Sharpen daily** · 5 min · core puzzles
- **Climb the ranks** · Long sessions · medaled solves
- **Wind down at night** · Quiet game · no streak pressure

### Anatomy

```
┌─────────────────────────────────────┐
│  STEP 2 / 4                  [Skip] │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░          │  ← progress bar (--accent)
├─────────────────────────────────────┤
│                                     │
│  What brings you here?              │  ← display M, serif
│  Pick one. We'll calibrate…         │  ← body S, ink-3
│                                     │
│  ┌─[●]─Sharpen daily─────────┐      │  ← selected: 2px accent border
│  │     5 min · core puzzles  │      │     shadow-boost
│  └───────────────────────────┘      │
│  ┌─[○]─Climb the ranks──────┐       │
│  │     Long sessions…       │       │
│  └──────────────────────────┘       │
│  ┌─[○]─Wind down at night───┐       │
│  │     Quiet game…          │       │
│  └──────────────────────────┘       │
│                                     │
│  [ Back ]   [   Continue →    ]     │  ← ghost + primary
└─────────────────────────────────────┘
```

### State

Persist after step 4: `useSettings = { name, avatar, intent, theme }`. Then redirect to `/home`.

---

## 3 · Home — Games hub — `/home`

**Renderer**: `HomeScreen` in `approval-screens.jsx`.

### Anatomy

```
┌─────────────────────────────────────┐
│  ☰  Cup Clash       [847 XP] [YK]   │  ← top nav + xp pill + avatar
├─────────────────────────────────────┤
│  MONDAY · MAY 25                    │  ← label, ink-3
│  Welcome back, Yael.                │  ← display M, serif
│  Streak 14 days · today's set, 5.   │  ← body S, ink-3
│                                     │
│  ┌─────────────────────────┐        │  ← daily challenge banner
│  │ ⚡  DAILY CHALLENGE · 2x │        │     accent gradient bg in
│  │     Hard Tango · 6×6 →   │        │     light/dark; ink+border
│  └─────────────────────────┘        │     in paper
│                                     │
│  ALL GAMES                          │
│  ┌─────────────────────────┐        │
│  │ ☼☽  Tango              │        │  ← row: icon · name · desc
│  │     Balance suns…  23/100│       │     · progress bar · count
│  └─────────────────────────┘        │
│  ┌─────────────────────────┐        │
│  │ □□  Memory             │        │
│  │     Find pairs    11/100│        │
│  └─────────────────────────┘        │
│  ┌─────────────────────────┐        │
│  │ ♛  Crowns              │        │
│  │     One per region  8/100│       │
│  └─────────────────────────┘        │
│  ┌─────────────────────────┐        │
│  │ ⊞  Sudoku   [PRO]       │        │  ← locked: 70% opacity
│  │     No repeats     0/100│        │     pro pill in warn color
│  └─────────────────────────┘        │
├─────────────────────────────────────┤
│  [Games] [Map] [League] [You]       │  ← bottom nav
└─────────────────────────────────────┘
```

### Behavior

- Daily challenge → `/play/<slug>/<stageN>` (specific stage marked daily).
- Tapping a game row → `/stages/<slug>`. Locked games → `/paywall`.
- Bottom nav: see `02-navigation.md`.

---

## 4 · Stage Map — The Ascent — `/stages/:slug`

**Renderer**: `PathTopo` in `path-difficulty.jsx`. **Full details**: `05-stage-map.md`.

Terraced elevations 1-100. Easy (1-30) at base, Medium (31-70) middle, Hard (71-100) summit. Difficulty bands narrow as you climb. Current stage glows.

---

## 5 · Difficulty picker — `/settings/difficulty`

**Renderer**: `DifficultyPicker` in `path-difficulty.jsx`. **Full details**: `06-difficulty.md`.

Two cards: **Straight Climb** (easy → medium → hard) and **Mixed Difficulty**. Each card includes a 20-segment preview strip showing the resulting sequence. One primary "Save preference" button at bottom.

---

## 6, 7, 8 · Game screens — `/play/:slug/:stage`

**Renderers**: `TangoScreen`, `MemoryScreen`, `QueensScreen` (Crowns) in `game-board-themes.jsx`. **Full details**: `04-games.md`.

Common chrome:
```
[back] · Game name + STAGE label · [847 XP]
─────────────────────────────────────────
XP bar  ▓▓▓▓▓▓░░░░░░     1:23   HINTS · 2
─────────────────────────────────────────
                  [board]
─────────────────────────────────────────
        [Undo]  [Hint]  [Check]
```

On win: store result, navigate to `/complete/<slug>/<stage>`.

---

## 9 · Stage Complete — `/complete/:slug/:stage`

**Renderer**: `CompleteScreen` in `approval-screens.jsx`.

### Anatomy

```
┌─────────────────────────────────────┐
│  STAGE 24 · TANGO                   │  ← accent pill
│                                     │
│  Stage cleared.                     │  ← display L, serif
│  Well played.                       │  ← body S, ink-3
│                                     │
│  ┌──────┬──────┬──────┐             │  ← stats grid
│  │ 1:47 │ +120 │  0   │             │
│  │ TIME │  XP  │ HINTS│             │
│  └──────┴──────┴──────┘             │
│                                     │
│  ┌─────────────────────────┐        │  ← medal card (only if earned)
│  │ ★  Gold medal earned    │        │
│  │    No hints, sub-2-min  │        │
│  └─────────────────────────┘        │
│                                     │
│  UP NEXT                            │
│  ┌─────────────────────────┐        │
│  │ (25)  Stage 25 · Tango  │        │
│  │       Medium · +100 XP →│        │
│  └─────────────────────────┘        │
│                                     │
│  [  Map  ]  [  Play stage 25 →  ]   │  ← ghost + primary
└─────────────────────────────────────┘
```

### Logic

- If `time < threshold && hints === 0` → gold medal callout.
- If next stage is in same game, "Up next" links there. If just finished stage 100 of a game, "Up next" suggests a different game.
- XP added to user's total before render.

---

## 10 · Paywall — `/paywall`

**Renderer**: `PaywallScreen` in `approval-screens.jsx`.

### Anatomy

```
┌─────────────────────────────────────┐
│                              [✕]    │
│  CUP CLASH +                        │  ← accent pill
│  Unlock the full collection.        │  ← display L
│  All games. No ads. Unlimited hints.│  ← body S
│                                     │
│  ★  All 24 games unlocked           │  ← benefit rows
│     Sudoku, Kakuro, Bridges…        │
│  ∞  Unlimited daily solves          │
│     Stop the 3-hard-stages cap      │
│  ✦  Free hints, no ads              │
│  ▲  Themed Memory decks             │
│                                     │
│  ┌─[●]─Yearly────────[$3.33/mo]─┐  │  ← preselected: 2px accent
│  │  billed annually · $40 SAVE 60%│ │
│  └────────────────────────────────┘ │
│  ┌─[○]─Monthly───────[$7.99/mo]─┐  │
│  │  cancel anytime                │ │
│  └────────────────────────────────┘ │
│                                     │
│  [  Start 7-day free trial  ]       │
│  Restore purchase · Privacy · Terms │
└─────────────────────────────────────┘
```

### Logic

Pre-select yearly. On CTA tap: stub for v1 — log the event and route to `/paywall/success` (empty page that says "Subscription activated — placeholder").

---

## 11 · Leaderboard — `/league`

**Renderer**: `LeaderboardScreen` in `approval-screens.jsx`.

### Anatomy

```
┌─────────────────────────────────────┐
│  ☰  Cup Clash         [SEASON 4]    │
│                                     │
│  League                             │  ← display M
│  Top 5 promote on Sunday.           │
│                                     │
│  [Weekly] [All time] [Friends]      │  ← tabs (Weekly selected)
│                                     │
│       ┌──┐  ┌──┐  ┌──┐              │  ← podium (2-1-3 visual order)
│       │ A│  │ Y│  │ C│              │     avatars on top
│       │  │  │ ★│  │  │              │
│       │ 2│  │ 1│  │ 3│              │     bars below, height-ranked
│       └──┘  └──┘  └──┘              │
│                                     │
│  4  YK  Yael (you)        10,470    │  ← rows 4+, your row highlighted
│  5  TP  T. Park            9,920    │
│  6  RS  R. Singh           9,400    │
│  …                                  │
├─────────────────────────────────────┤
│  [Games] [Map] [League] [You]       │
└─────────────────────────────────────┘
```

### Logic

- Tab switches data source (weekly / all-time / friends).
- "Your row" sticks visually: highlighted with `var(--accent)` border + `var(--pill-bg)` background.
- Podium first 3 only. Rest in list.

---

## 12 · Profile — `/profile`

**Renderer**: `ProfileScreen` in `approval-screens.jsx`.

### Anatomy

```
┌─────────────────────────────────────┐
│  ☰  You                       [⚙]   │  ← gear → /settings (full page)
│                                     │
│  ┌────┐ Yael K.                     │  ← identity card
│  │ YK │ Joined Jan 2026 · Tel Aviv  │
│  └────┘                             │
│                                     │
│  ┌──────┬──────┬──────┐             │  ← hero stats
│  │  42  │ 14d  │  27  │             │
│  │STAGES│STREAK│GOLDS │             │
│  └──────┴──────┴──────┘             │
│                                     │
│  ┌─────────────────────────┐        │  ← XP ring card
│  │ (L8 ring) 10,470/14,000 │        │
│  │           3,530 to L9    │       │
│  └─────────────────────────┘        │
│                                     │
│  SETTINGS                           │
│  ┌─────────────────────────┐        │
│  │ Difficulty progression  │ Mixed  │ ›
│  │ Screen view             │ Light  │ ›
│  │ Stage map style         │ Ascent │ ›
│  │ Notifications           │ 8am    │ ›
│  │ Sign out                │        │ ›
│  └─────────────────────────┘        │
├─────────────────────────────────────┤
│  [Games] [Map] [League] [You]       │
└─────────────────────────────────────┘
```

### Behavior

- Each settings row → its own sub-screen or a sheet. For v1:
  - Difficulty progression → `/settings/difficulty` (the picker, screen 5)
  - Screen view → opens a bottom sheet with the 3-up theme switcher
  - Stage map style → bottom sheet (the only option for v1 is "The Ascent", but the future contract is set)
  - Notifications → native browser permission prompt + a time picker
  - Sign out → confirm dialog, clear localStorage, return to `/`

---

## Empty / loading / error states (apply across all screens)

- **Empty list** (e.g. Friends tab on Leaderboard): show a small illustration placeholder + 1-line copy ("Add friends to compete.") + a ghost button.
- **Loading**: skeleton blocks matching the layout's main shapes. No spinners.
- **Error**: full-bleed card, neutral ink, "Something went wrong." + Retry ghost button. Don't expose raw error text.
