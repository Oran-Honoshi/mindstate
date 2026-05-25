# 04 · Games

Three playable games. Each renders inside the standard game chrome (see `03-screens.md` §6-8). Renderers: `TangoScreen`, `MemoryScreen`, `QueensScreen` in `prototypes/game-board-themes.jsx`.

---

## Tango — sun & moon balance

**Goal**: fill the 6×6 board with suns (S) and moons (M) so that:
1. No three of the same in a row or column (horizontally or vertically).
2. Each row contains exactly three suns and three moons; same for columns.
3. Constraint chips between adjacent cells must hold:
   - `=` chip → the two cells share the same value
   - `×` chip → the two cells differ

**Givens** are pre-filled and immutable (tinted background).

### Visuals

- 6×6 grid. Cell size: 44px on mobile, 46px on Paper.
- Gap between cells: 5px on Light/Dark, 0 on Paper.
- Cell radius: 10px on Light/Dark, 0 on Paper.
- Sun glyph: light = stroked golden sun + rays, dark = glowing amber orb, paper = `☀` in serif at 60% size.
- Moon glyph: light = filled indigo crescent, dark = glowing violet orb, paper = `☾` in serif.
- Constraint chips: 14×14 circle, white bg, 1.5px colored border, sits **between cells** with z-index above the grid.
  - `=` chip: accent-colored border + glyph
  - `×` chip: ruby-colored border + glyph

### Interaction

- Tap empty cell → sun. Tap sun → moon. Tap moon → empty.
- Long-press cycles backwards.
- Invalid placement: pulse-shake the cell, ruby cell bg flashes for 400ms.
- Hint button: highlights one cell with a soft accent glow + 6×6 dot indicator (no answer revealed; logic hint).

### Win

When all cells filled and no constraint violated → `/complete/tango/<stage>`. Capture elapsed time, hints used.

### Sample puzzles

Use a deterministic generator seeded by the stage number, so stage 12 is always the same puzzle. Algorithm: place a valid full board, randomly remove ~40% of cells based on difficulty (easy keeps more givens, hard keeps fewer), drop in ~3-5 constraint chips. Keep a solver in `src/lib/tango/solver.ts` for hint and validation.

---

## Memory — find the pairs

**Goal**: flip cards two at a time. Match all 8 pairs.

### Visuals

- 4×4 grid (16 cards = 8 pairs). Aspect 1:1, gap 9px (Paper: 6px), radius 12px (Paper: 0).
- **Card back**: distinct per theme.
  - Light: linear gradient `linear-gradient(160deg, var(--accent), var(--accent-2))` + a small white-stroked circle motif.
  - Dark: navy gradient `linear-gradient(160deg, #1E1B4B, #312E81)` + 4 tiny stars.
  - Paper: solid `#1A1714` ink + a serif italic `M` glyph in cream.
- **Card face**: cream/white surface with the icon (see `07-memory-icons.md`).
- **Matched cards**: stay face-up at 85% opacity, mint border, and a small mint-circle ✓ in the top-right corner.

### Icons

Default set is 8 icons from the **Memory Icon Library**: star, heart, diamond, crescent, flower, sun, bolt, drop. Each one has a unique shape **and** a unique color. The shape is constant across themes; the rendering varies (colorful flat / glowing / woodcut ink). See `07-memory-icons.md`.

### Interaction

- Tap face-down card → it flips face-up (400ms rotateY animation).
- If exactly two cards face-up:
  - If they match → both stay face-up; mark `matched`; +20 XP per pair; if 3 pairs found in a row → **chain x2** indicator with extra XP.
  - If they don't match → flip both back after 800ms.
- Show running stats: time, pairs found (e.g. `3/8`), chain multiplier.

### Win

All 8 pairs matched → `/complete/memory/<stage>`. Use `moves` as the primary stat for medaling.

### Chain rule (simple, hook-y)

- Every successful match within 6s of the previous one keeps the chain alive. A miss or > 6s gap resets it.
- Chain multiplies the XP earned for the next match: 1× → 2× → 3× → cap at 3×.

---

## Crowns — one per region

**Goal**: place exactly one crown in every row, every column, **and** every region. No two crowns may sit in adjacent cells (including diagonals).

### Visuals

- 6×6 board, divided into 6 colored regions.
- Cell size: 46px on mobile (48 on Paper).
- **Region boundaries**: thicker (2.5px on Light, 2px on Dark, 2.5px on Paper) and a distinct color from inner grid lines.
- **Region differentiation**:
  - Light: 6 pastel fills (red, amber, green, cyan, violet, pink). Crown marker color matches the region's deep counterpart.
  - Dark: 6 muted fills + glowing crown matched to the region's neon hue.
  - Paper: each region uses a **hatch pattern** (not color): none / dots / diag / crosshatch / horizontal / diag-reverse. A capital letter A-F sits in the corner of the first cell of each region.
- **Crown marker**: SVG (see `CrownGlyph` in `game-board-themes.jsx`). Always uses the crown shape — never substitute a queen-chess piece.
- **Cross marker** (× indicator the player places to mark "I know nothing goes here"): subtle, 14px, 35% opacity ink.

### Interaction

- Tap empty cell → cross.
- Tap cross → crown.
- Tap crown → empty.
- Invalid placement (would break row/col/region/adjacency): cell flashes ruby. Detail strip shows the rule that fired ("No two crowns adjacent.").

### Win

All 6 crowns placed, no rule violated → `/complete/crowns/<stage>`.

### Region generation

A region is a contiguous polyomino. Use a deterministic seeded generator. Each region must be solvable to exactly one crown. Store the region map as a 6×6 array of region ids `0..5`. The solver lives in `src/lib/crowns/solver.ts`.

---

## Shared game chrome

```tsx
<GameShell game="tango" stage={23}>
  <GameTopBar />
  <GameProgressStrip time={t} hintsLeft={h} />
  <GameBoard />          {/* one of Tango/Memory/Crowns */}
  <GameToolbar />
</GameShell>
```

### GameTopBar

- Back arrow (left, 32×32 tap target) → `/stages/<slug>`
- Game name (serif, 20px)
- Stage label below name: `STAGE 23` in label font, ink-3
- Hamburger on the right (32×32) — see `02-navigation.md`
- XP pill below name area on Paper, beside hamburger on Light/Dark

### GameProgressStrip

- 4px-tall bar showing XP fill for this stage (animates as you place pieces toward a complete board)
- Below the bar: time elapsed (left, mono) + hints used (right, label font)

### GameToolbar

- 3 buttons, equal-width pill-shaped (Paper: square).
- Undo (left): rolls back last move. Disabled when at first move.
- **Hint** (center, accent-tinted): consumes 1 hint, highlights an actionable cell.
- Check (right): validates current state, shows any violated rule.
- Each button has an icon (glyph) at 13px and a 12px label.

### Hint quota

Players get 3 hints per stage on Free. Cup Clash+ → unlimited. The Hint button shows a small badge `2` (remaining) in the top-right corner of the button.
