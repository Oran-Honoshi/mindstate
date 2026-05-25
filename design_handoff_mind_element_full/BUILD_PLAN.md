# Build Plan

A phased build for Mind Element. Each phase ends with something working you can demo.

## Phase 0 · Scaffolding (1 day)

Set up the project:

```bash
npm create vite@latest mind-element -- --template react-ts
cd mind-element
npm i react-router-dom zustand
```

Add Google Fonts to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Outfit:wght@400..800&family=JetBrains+Mono:wght@500;700&family=Special+Elite&family=Old+Standard+TT:wght@400;700&display=swap" rel="stylesheet"/>
```

Folder layout:

```
src/
├── App.tsx
├── main.tsx
├── routes.tsx
├── themes/
│   ├── tokens.css            ← all CSS vars per theme (see 01-design-system.md)
│   ├── ThemeProvider.tsx     ← reads theme from store, applies data-theme attr to <html>
│   └── index.ts
├── components/
│   ├── nav/                  ← hamburger menu + drawer (see 02-navigation.md)
│   ├── ui/                   ← Pill, PrimaryBtn, GhostBtn, Card, etc
│   └── icons/                ← Memory icons + game icons + UI icons
├── games/
│   ├── tango/
│   ├── memory/
│   └── crowns/
├── screens/
│   ├── Landing.tsx
│   ├── Onboarding.tsx
│   ├── Home.tsx
│   ├── StageMap.tsx          ← The Ascent
│   ├── Game.tsx              ← thin router → games/<slug>/Game.tsx
│   ├── Complete.tsx
│   ├── Paywall.tsx
│   ├── Leaderboard.tsx
│   ├── Profile.tsx
│   └── DifficultyPicker.tsx
├── store/
│   ├── useTheme.ts
│   ├── useProgress.ts
│   └── useSettings.ts
└── lib/
    ├── seed.ts               ← deterministic puzzle generator
    └── format.ts             ← time/xp/etc
```

## Phase 1 · Foundations (1-2 days)

Build in this order:

1. **Tokens & theming** (`01-design-system.md`). Three themes via CSS variables on `<html data-theme="…">`. Persist the chosen theme in `useTheme` zustand store, read on app boot.
2. **Hamburger menu** (`02-navigation.md`). Same component used on landing and inside the app. Slide-in drawer with section links + theme switcher.
3. **Routing skeleton**. All routes return a stub that says "Landing", "Home", etc. Hamburger should already work to navigate.
4. **Shared UI primitives**: `<Pill>`, `<PrimaryBtn>`, `<GhostBtn>`, `<Card>`, `<Section>`, `<Wordmark>`. Each reads CSS vars so it themes automatically.
5. **Layout shell**: a single `<MobileFrame>` component that centers content at max-width 480px on desktop, full-width on mobile. The hamburger lives in the shell, not in each screen.

You should be able to open any route and see chrome (top bar + hamburger + bottom nav where appropriate) rendering correctly in all 3 themes.

## Phase 2 · Static screens (3-4 days)

Build each non-game screen as a static React component. No interactivity yet; just renders. Order:

1. **Landing** (`03-screens.md` §1) — hero + 3 game pictograms + CTA + footer. Hamburger is the only nav.
2. **Home / Games hub** (§3) — daily challenge banner + games list. Hamburger + bottom nav.
3. **Stage Map · The Ascent** (`05-stage-map.md`) — terraced elevations 1-100.
4. **Stage Complete** (§9) — stats card + medal + "up next".
5. **Paywall** (§10) — Mind Element+ benefits + 2 plans.
6. **Leaderboard** (§11) — podium + list.
7. **Profile** (§12) — identity + stats + settings list.
8. **Difficulty picker** (`06-difficulty.md`) — Straight vs Mix.
9. **Onboarding** (§2) — 4 steps, modeled on the prototype's step 2.

Each screen must render correctly in **all 3 themes**. Use the prototype's `Mind Element Approval.html` as your visual reference — open it side-by-side with your code.

## Phase 3 · Games (4-6 days)

Three real, playable games. See `04-games.md`.

1. **Tango** — 6×6 sun/moon. Tap to cycle: empty → sun → moon → empty. Validate row/column/three-in-a-row constraints. Show "=" / "×" chips. Undo/Hint/Check.
2. **Memory** — 4×4 grid of 8 paired icons. Tap to flip. Two cards face up → matched stays, mismatch flips back after 800ms. Track moves + pairs + chain.
3. **Crowns** — 6×6 with 6 regions. Tap empty → cross, cross → crown, crown → empty. Validate one-per-row/column/region and no adjacency.

Each game shares:
- Top bar (back, name, stage, XP pill)
- XP/time strip
- Board (the game-specific part)
- Toolbar: Undo, Hint, Check

Win condition triggers navigate to `/complete/:slug/:stage`.

## Phase 4 · State & persistence (1-2 days)

Plug `useProgress` (per-game completed stages, current stage, medals) and `useSettings` (theme, difficulty mode, map style preference, notifications) into all screens. Persist both to localStorage. See `08-data-model.md`.

## Phase 5 · Onboarding & landing polish (1-2 days)

- Onboarding 4-step flow with state machine: welcome → intent → name → first-puzzle prompt → into the app.
- Landing page polish: optional scroll-into-view sections (How it works, Games, Pricing, FAQ) — see `02-navigation.md` for which sections the hamburger links to.

## Phase 6 · Polish (1-2 days)

- Animations: card flip (Memory), shake on invalid move, gentle pulse on hint target.
- Accessibility: tab order, focus rings (the design's accent color, 2px), aria-labels on game cells.
- PWA: manifest + service worker so the app installs on phone home screens.
- Empty / loading / error states for every screen.

## Done definition

A user on a phone can:
1. Land on the marketing page, open hamburger, jump to any section, tap "Start playing"
2. Onboard, pick intent and name, switch the screen view to Paper, see it persist on reload
3. Open Home, tap Tango, play stage 1 of Tango, win, see Complete, navigate to stage 2
4. Open the hamburger from anywhere, switch theme to Dark, the entire app reflows
5. Open Profile, change difficulty progression to "Mixed", see the Stage Map reorder
6. Open Paywall, see the trial CTA (no real Stripe yet — log an event and continue)

Ship it.
