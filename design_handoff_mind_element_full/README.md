# Cup Clash — Implementation Handoff

> **For Claude Code (or any developer).** Build the Cup Clash mobile-first web app from this design package.

## What this is

Cup Clash is a daily-puzzle web app — three free games (Tango, Memory, Crowns) plus more behind a subscription. The app supports **three "screen views"** (visual themes) the user can switch at any time:

1. **Light · Refined** — warm minimal, indigo/violet accent
2. **Dark · Cosmic** — deep navy + neon glow, purple accent
3. **Paper · Gazette** — newsprint cream, woodcut ink

There is also a public **landing page** for marketing/acquisition.

Everything is **mobile-first** (designed at 400×820, the prototype phone frame). Desktop is a centered ~480px column with a wider hero band on the landing page.

## What you are getting

The `prototypes/` folder contains HTML/JSX files that **render the final design** in a browser. They are not production code — they are **design references**. Your job is to **recreate them in a real, maintainable stack**.

The numbered `.md` files in this folder are the build spec. Read them in order.

## Recommended stack

If the user hasn't told you otherwise, use:

- **Vite + React 18 + TypeScript** — fast dev loop, no build surprises
- **CSS variables** for theme tokens (no Tailwind required; the prototypes use inline styles which translate cleanly to CSS Modules or styled-components)
- **React Router** (`react-router-dom`) for page routing
- **Zustand** for client state (themes, progress, settings) — small, no boilerplate
- **localStorage** for persistence (no backend yet; design is offline-first)
- **Google Fonts**: Fraunces (display), Outfit (sans), JetBrains Mono (mono), Old Standard TT (paper serif), Special Elite (paper typer)

If a backend exists, wire progress, leaderboard, and subscriptions to it. If not, ship a local-only version first; the data shape (see `08-data-model.md`) is designed to be lifted into a real backend without rewriting components.

## File map

```
design_handoff_cup_clash_full/
├── README.md                  ← you are here
├── BUILD_PLAN.md              ← phased build steps (start here after this)
├── 01-design-system.md        ← tokens, theming, type, spacing, motion
├── 02-navigation.md           ← the 3-line hamburger spec (landing + app)
├── 03-screens.md              ← every screen, detailed
├── 04-games.md                ← game mechanics + visual specs
├── 05-stage-map.md            ← "The Ascent" map style
├── 06-difficulty.md           ← Straight vs Mix progression
├── 07-memory-icons.md         ← Memory icon library
├── 08-data-model.md           ← state shape + persistence
├── 09-mobile-first.md         ← responsive guidance
└── prototypes/
    ├── Cup Clash Approval.html        ← every screen × every theme
    ├── Game Boards & Paths.html       ← boards + 4 path styles
    ├── Memory Icon Library.html       ← icon set
    ├── memory-icons.jsx
    ├── game-board-themes.jsx
    ├── path-difficulty.jsx
    ├── approval-screens.jsx
    ├── games-revisions-frames.jsx
    └── design-canvas.jsx
```

## How to use this package

1. **Open the prototypes first.** Run `python -m http.server` in `prototypes/` and open `Cup Clash Approval.html` to see every screen in every theme. This is the source of truth for what to build.
2. **Read `BUILD_PLAN.md`** for a phased approach (foundations → screens → polish).
3. **Use the numbered specs as you go.** Each screen in `03-screens.md` references the prototype file and the JSX function that renders it. Open that JSX and copy-adapt the layout into a real React component using your theme tokens.

## Non-goals (for v1)

- Multi-language. English first. Designs are LTR; Hebrew RTL will come later.
- Real backend. Local-only is fine for v1.
- Native apps. PWA-installable mobile web is the target.
- Real auth. Stub it; a "Sign in" CTA on the landing page can save name+avatar to localStorage.

## Visual fidelity

These are **high-fidelity mockups**. Every color, type size, radius, and shadow in the prototypes is intentional. When you implement, **match the prototype within 2px / 1 shade**. If you have to deviate (e.g., your routing pattern requires different chrome), do it but note it in commit messages.

## Brand naming notes

- The third game is called **"Crowns"**, not Queens. The marker is a crown SVG. Don't use chess imagery — the mechanic (one per row/col/region, no adjacency) is generic and our visual treatment is original.
- The app is **Cup Clash**. The wordmark is set in Fraunces (serif) for Light/Dark themes; in Old Standard TT for Paper.
