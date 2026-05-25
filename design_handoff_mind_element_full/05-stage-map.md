# 05 · Stage Map — The Ascent

The user approved **Path D · The Ascent** as the stage map style. Renderer: `PathTopo` in `prototypes/path-difficulty.jsx`.

## Concept

100 stages stacked into **10 terraced elevations**, like a topographic map. Easy at the base (elevations 0-2), Medium in the middle (3-6), Hard at the summit (7-9). Each elevation holds 10 stages laid out horizontally.

As you climb, terraces narrow (`inset = elevation * 4px`) and shift band colors.

## Anatomy

```
┌─────────────────────────────────────┐
│  ☰  Tango          [RESUME · 24]    │
│  23 / 100 cleared                   │
├─────────────────────────────────────┤
│                                     │
│   ┌── HARD · 91-100 ─────────┐      │  ← summit (narrowest)
│   │ ●●●●●●●●●●               │      │
│   └─────────────────────────-┘      │
│   ┌── HARD · 81-90 ──────────┐      │
│   │ ●●●●●●●●●●               │      │
│   └─────────────────────────-┘      │
│   …                                  │
│   ┌── MEDIUM · 41-50 ────────────┐  │
│   │ ●●●●●●●●●●                   │  │
│   └─────────────────────────────-┘  │
│   …                                  │
│ ┌── EASY · 1-10 ───────────────────┐│  ← base (widest)
│ │ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ★ ✓              ││
│ └──────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

Note the order: terraces stack with `flex-direction: column-reverse` so elevation 0 (Easy) appears at the **bottom** of the screen and elevation 9 (Hard) at the **top**. The user climbs upward — like a hill viewed from the side.

## Terrace styling

| Band     | Elevations | Light fill   | Dark fill                   | Paper fill |
|----------|-----------|--------------|-----------------------------|------------|
| Easy     | 0-2       | `#D1FADF`    | `rgba(52,211,153,0.18)`     | `#E8DCBA`  |
| Medium   | 3-6       | `#FEF3C7`    | `rgba(245,179,66,0.18)`     | `#FFCFA8`  |
| Hard     | 7-9       | `#FCE7F3`    | `rgba(244,114,182,0.18)`    | `#D4B896`  |

- Top of each terrace gets a 1.5px solid `tierEdge` color (the band's strong hue).
- Each terrace has a corner label in label-font: `EASY · 1-10`, `MEDIUM · 41-50`, etc.

## Stage nodes

- 22×22 circles inside each terrace, equal spacing.
- Visual states (see `stageState(n)` in `path-difficulty.jsx`):
  - **done** — mint fill, mint border, white check
  - **medaled** — gold fill, gold border, `★` glyph (every 3rd done in the prototype)
  - **current** — surface fill, 2px accent border, accent number, accent glow halo
  - **next** — surface fill, hairline border, ink-2 number
  - **locked** — transparent, hair border, ink-4 number

## Scroll

The map is scrollable vertically. On mount, scroll to the current stage so it's near the bottom-middle of the viewport (the natural "next thing to climb").

```ts
useEffect(() => {
  const el = document.querySelector(`[data-stage="${currentStage}"]`);
  if (el) {
    const rect = el.getBoundingClientRect();
    const target = rect.top + window.scrollY - window.innerHeight * 0.6;
    window.scrollTo({ top: target, behavior: "smooth" });
  }
}, [currentStage]);
```

(Do not use `el.scrollIntoView()` — it can disturb other scroll containers.)

## Interaction

- Tap done/current/next → `/play/<slug>/<n>`.
- Tap locked → small toast: "Clear stage N to unlock."
- Long-press a done stage → bottom sheet showing your best time + medal status, with "Replay" link.

## Header chrome

- **Title** = current game's display name.
- **Subtitle** = `<cleared> / 100 cleared`.
- **Right-side pill** = `RESUME · <currentStage>`. Tapping it routes straight to the current stage.

## Difficulty-aware reordering

When the user has selected **Mixed Difficulty** in settings (`06-difficulty.md`), don't change the visual layout of the map (easy still at base, hard at summit). Instead:
- Render an extra **route line** that zigzags through stages in the **play order** (mixed), drawn as a thin dashed `var(--accent)` SVG path connecting the next ~5 stages.
- The next-to-play stage gets its glow + "RESUME" pill, regardless of its elevation.

This way the user can still see their progress on the elevation map but also follow the prescribed sequence.

## Alternate path styles (future)

The prototype also has 3 other styles in `path-difficulty.jsx`: `PathSquares`, `PathWinding`, `PathConstellation`. Not building those in v1 (user chose The Ascent), but keep them around as `<MapStyle>` variants gated by `useSettings.mapStyle`. Settings → "Stage map style" bottom sheet shows all four (one selectable).

## Responsive

- Mobile (< 480px): one column of terraces. Stage nodes at 22×22.
- Tablet (480-900): same single column, capped at 480px width and centered.
- Desktop (≥ 900): hold the 480px cap. The terraced metaphor doesn't scale wider gracefully; instead, run a 2-column layout where the right column shows current-stage detail (preview of the next puzzle + your stats on this game). See `09-mobile-first.md`.
