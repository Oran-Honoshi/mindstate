# 06 · Difficulty progression

A user setting that controls the order in which a game's 100 stages are presented. Renderer: `DifficultyPicker` in `prototypes/path-difficulty.jsx`. Route: `/settings/difficulty`.

## The two modes

| Mode      | Description                                                                  | Effect on stages 1-100                                       |
|-----------|------------------------------------------------------------------------------|--------------------------------------------------------------|
| `straight`| **Straight Climb** — easy → medium → hard, in lockstep.                      | 1-30 easy, 31-70 medium, 71-100 hard. Linear.                |
| `mix`     | **Mixed Difficulty** — surprises keep you sharp; easy follows hard.          | Deterministic permutation that interleaves all three buckets.|

Default is `straight`.

## UI

Two cards stacked. Selected card gets `--accent` 2px border + `--shadow-boost`. Each card contains:

- Icon block (left, 44×44) — five horizontal bars; "straight" shows increasing widths; "mix" shows random widths.
- Title (serif, 17px) — `Straight Climb` / `Mixed Difficulty`. In Paper: `Steady Climb` / `Mixed Bag`.
- Subtitle (label font, accent color, uppercase): `EASY → MEDIUM → HARD` or `EASY & HARD, SIDE BY SIDE`.
- One-line description (13px, ink-2).
- Radio circle on the right (22×22).
- **Preview strip** below a dashed divider — 20 segments showing the actual progression for the first 20 stages, colored by difficulty:
  - Easy → mint
  - Medium → amber
  - Hard → rose
  - Paper renders the same strip with opacities (0.25 easy / 0.5 med / 0.85 hard) and a hairline border per segment.

Bottom: full-width primary `Save preference` button.

## The deterministic permutation (mix mode)

You can't actually mix the difficulty designation of a stage — that's part of the puzzle's data. What you do mix is the **order the user encounters them**. Implement as:

```ts
function mixedOrder(n = 100): number[] {
  const easy = range(1, 30);
  const med  = range(31, 70);
  const hard = range(71, 100);
  // Deterministic interleave: weighted 2 easy / 3 med / 2 hard per cycle
  const out: number[] = [];
  const pat = ["e","e","m","h","m","e","m","h","m","e"];  // 10-step pattern
  let i = 0;
  while (out.length < n) {
    const k = pat[i % pat.length];
    const pool = k === "e" ? easy : k === "m" ? med : hard;
    const next = pool.shift();
    if (next != null) out.push(next);
    i++;
  }
  return out;
}
```

Persist `mixedOrder[currentIndex]` as the user's next stage. On reload, replay the deterministic order so they keep going.

## Storage

Save in `useSettings.difficulty`. On change, reset `mixedOrderIndex` to whatever index they're already at (don't reshuffle history they've already played; just affect "what's next").

## Effect on Stage Map (The Ascent)

See `05-stage-map.md` § "Difficulty-aware reordering". TL;DR: the map's spatial layout doesn't change (terraces are still easy-base, hard-summit); the **route line** drawn on top connects upcoming stages in play order. In `straight` mode the line is just upward; in `mix` mode it zigzags.

## Edge cases

- A user switching from `mix` → `straight` mid-game: leave already-completed stages where they are; continue with the lowest uncompleted stage in straight order.
- Switching `straight` → `mix`: rebuild the mixed order over the remaining uncompleted stages.

## Onboarding

Step 2's intent picker ("What brings you here?") nudges defaults:
- "Sharpen daily" → `straight`
- "Climb the ranks" → `straight`
- "Wind down at night" → `mix`

The user can override anytime from Profile → Settings → Difficulty progression.
