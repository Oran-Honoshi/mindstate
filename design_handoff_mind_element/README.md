# Handoff: Mind Element — Redesign & Brand System

## Overview
A complete redesign of **Mind Element**, a brain-training hub of 24 logic games (free + paid tiers). This bundle covers the brand/mascot system, a gamification/rewards layer (levels, per-game mastery, scaling celebrations, collectible figures), the in-game shell, the 7 signed-in app screens, themed game screens with a stage path, an upgraded Memory deck, educational City/Country games, auth + onboarding, a marketing landing page, and the full game-icon + board-preview art systems.

## About the design files
The files in `prototypes/` are **design references built in HTML + React (via in-browser Babel)** — they show intended look, motion, and behavior. They are **not** meant to ship as-is. Recreate them in the target codebase using its established framework and patterns (the live app is a web app; React or the existing stack is the natural target). Where no pattern exists yet, follow the structure here. Pixel/color/type detail is exact — lift values from `DESIGN-TOKENS.md` and the JSX.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, motion, and interactions. Recreate pixel-faithfully with the codebase's component library; use `DESIGN-TOKENS.md` for the values and `COMPONENTS.md` for the file map.

## How to run the references
Open any `prototypes/*.html` in a browser (they load React + Babel from CDN and the shared `.jsx` by relative path; assets load from `assets/`). Serve the folder over a static server so `fetch`/image paths resolve.

## Architecture (shared kit + per-screen apps)
A small shared kit is reused by every screen:
- `brandkit.jsx` — design tokens (`TOKENS`, `FONTS`), the mascot/icon SVG primitives (`QuantaMascot`/Sparky, `NodeMark`, `AppIcon`, `GameIcon` for all 24 games, `Medal`, `TIER_COLORS`), and `Swatch`.
- `icons.jsx` — `Icon` line-icon set (no emoji anywhere in the product).
- `previews.jsx` — `BoardPreview` (theme-aware designed mini-board render for each of the 24 games).
- `app-screens-extra.jsx` — the **theme system** (`TH` context, `useT()`, `makeT(key,setTheme)`), shared atoms (`Card`, `Btn`, `Bar`, `Micro`, `Toggle`, `SubScreen`, `MemberAvatar`, `SparkyImg`), plus Family/Settings/Pricing screens.
Each prototype HTML loads these in order, then its own app file.

## Theming
Three themes, switched at runtime from one token object: **Dark** (default app), **Light**, **Paper** (warm editorial). `makeT(key)` returns `{...TOKENS.theme[key], key, onAccent, setTheme}`. Every surface reads from `useT()`. In production, implement as a theme context/provider; never hard-code the dark values.

## Screens / Views
See each prototype for exact layout; summary + entry file:

| View | File | Purpose |
|---|---|---|
| Brand foundation (palette, type, mascot dirs, app icon, icon teaser) | `Brand Foundation.html` (`foundation.jsx`) | Brand reference (canvas) |
| Rewards: levels, mastery, scaling celebrations, stage-complete, collectible figures, leaderboard | `Sparky & Rewards.html` (`rewards.jsx`) | Gamification system |
| In-game shell (HUD, board, footer) + stage map + fixed back-nav | `In-Game Shell.html` (`game-shell.jsx`) | Play shell |
| 7 app screens (Games/Daily/Leaderboard/Profile + Family/Settings/Pricing), bottom nav, live theming | `App Screens.html` (`app-screens.jsx` + `app-screens-extra.jsx`) | Signed-in app |
| Themed game picker → winding stage path → play (Tango & Memory interactive; City/Country educational) | `Game Screens.html` (`game-screens.jsx`) | Per-game polish |
| 24 game icons | `Game Icons.html` (`icons-gallery.jsx`) | Icon system |
| Game card direction (icon vs board vs hybrid — hybrid chosen) | `Game Cards.html` (`game-cards.jsx`) | Card spec |
| Memory pack (18 faces + back) + full 52-card Solitaire/Hearts deck | `Decks & Packs.html` (`decks.jsx`) | Deck/pack art |
| Sign up / Sign in + post-signup onboarding | `Auth Screens.html` (`auth.jsx`) | Auth flow |
| Marketing landing (hero, 24-game vault, learn-the-world, pricing, FAQ) | `Landing Page.html` (`landing.jsx`) | Public site |

## Interactions & behavior (key ones)
- **XP decay:** each stage starts at 1,000 XP, decays ~4/sec in real time; bar shifts cyan→gold→coral; hints cost 25%; Practice mode disables decay. (`game-shell.jsx`, `game-screens.jsx`)
- **Celebrations scale to the achievement:** toast (quick win) → card/modal (mastery, achievement) → full-screen takeover (level-up, century). (`rewards.jsx`)
- **Back-nav fix:** in-game Back → stage map → games as a clean stack, no dead-end modal. (`game-shell.jsx` `App`)
- **Memory:** 3D flip cards, branded back, match logic; faces from `assets/memory/`. (`game-screens.jsx`)
- **City/Country:** multiple-choice → correct answer reveals a facts panel (+ flag for country). Data is placeholder — see `prompts/Handoff - City Country Data.md` for the Wikipedia/Wikidata/REST-Countries integration.
- **Auth:** inline validation (username required, email regex, password ≥8); onboarding carousel.
- Transitions are short (~.26–.45s); easing `cubic-bezier(.3,.7,.3,1)`.

## State management
Per screen, React `useState`: theme key, nav stack/active tab, board state (memory flipped/matched, tango grid), live XP/timer (interval), equipped figure, form fields + errors, FAQ/accordion open index. No external store needed; lift theme + auth/session to app-level providers in production.

## Design tokens
See `DESIGN-TOKENS.md` (colors incl. 3 themes, brand accents, difficulty + medal tiers, type families/scale, radii, the gold-only-for-rewards rule).

## Assets
See `ASSETS.md`. All in `assets/`: `sparky/` (mascot expressions + gold/violet variants, from user-supplied Gemini art, background-keyed), `memory/` (18 card faces), `cards/back.png`, `badges/speed.png`, `places/` (city/country images, watermark removed), `marketing/hero.png`. Game icons & board previews are code-rendered SVG (`brandkit.jsx`, `previews.jsx`). Prompt packs for generating more art are in `prompts/`.

## Files
Everything needed to run the references lives beside this README: all `*.html`, all `*.jsx`, `image-slot.js`, `assets/`, and `prompts/`.
