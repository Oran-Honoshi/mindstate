# 07 · Memory icon library

The icon set used in the Memory game. Renderer: `prototypes/memory-icons.jsx`. Viewable in `prototypes/Memory Icon Library.html`.

## Set

8 icons. Each one has a **unique shape** and a **unique color** so pairs read at a glance even with reduced color sensitivity. Don't add a 9th icon without a contrast review — visual differentiability is the contract.

| id        | name     | base color | dark glow | paper |
|-----------|----------|------------|-----------|-------|
| `star`    | Star     | `#F59E0B`  | amber     | filled |
| `heart`   | Heart    | `#F43F5E`  | rose      | filled |
| `diamond` | Diamond  | `#06B6D4`  | cyan      | outlined |
| `crescent`| Crescent | `#A855F7`  | violet    | filled |
| `flower`  | Flower   | `#EC4899`  | pink      | outlined |
| `sun`     | Sun      | `#EAB308`  | gold      | outlined |
| `bolt`    | Bolt     | `#3B82F6`  | sky       | filled |
| `drop`    | Drop     | `#10B981`  | emerald   | outlined |

All icons live in a 24×24 viewBox. They render cleanly between 16 and 64 px.

## Three theme treatments

Each icon is rendered three ways. Same SVG path, different paint:

### Light · colorful flat

- Solid `fill` from the table above.
- 0.6px stroke in `--deep` color (a darker shade of the fill) for crispness at small sizes.
- 1px white inner highlight on the diamond/flower/drop variants to lift them off white surfaces.
- `filter: drop-shadow(0 1px 0 rgba(0,0,0,0.06))` for subtle grounding.

### Dark Cosmic · glow

- Lighter shade of the fill (`--light` in the prototype's color tokens).
- `drop-shadow(0 0 6px <color>) drop-shadow(0 0 12px <color>66)` to glow.
- Stroke uses the saturated mid-tone.

### Paper · woodcut

- Single ink (`#1A1714`).
- Differentiation via fill vs stroke style — some shapes are filled (star, heart, crescent, bolt) and some are outlined with internal hatch lines (diamond, flower, sun, drop).
- No color. The shape carries the differentiation.

## Implementation

The library exports an array. Each entry:

```ts
type MemoryIcon = {
  id: "star" | "heart" | ...
  name: string;             // human-readable, e.g. "Star"
  color: string;            // base hex
  deep: string;             // darker shade
  light(size: number): JSX.Element;   // colorful flat
  dark(size: number): JSX.Element;    // glowing
  paper(size: number): JSX.Element;   // woodcut ink
};
```

Pick the renderer by theme:

```tsx
const ic = MEMORY_ICONS.find(i => i.id === card.iconId)!;
const render = theme === "paper" ? ic.paper : theme === "dark" ? ic.dark : ic.light;
return <div className="card-face">{render(32)}</div>;
```

## Distribution per board

A Memory stage is a 4×4 grid (16 cards = 8 pairs). The 8 icons are used exactly **once each as a pair**. Always all 8 on every board — that's the contract. Difficulty changes through:

- **Show duration** of mismatched cards before they flip back (easy 1500ms → hard 600ms).
- **Move budget** for medaling (easier stages let more moves slide).

## Themed decks (future)

The 8-icon base is the trainer set. Themed decks (Galaxies, Fruit, Almanac) plug into the same shape-and-color contract — same 8 slots, different art. Three suggested:

| Deck      | Slot mapping                                              | Pairs with theme |
|-----------|-----------------------------------------------------------|------------------|
| Galaxies  | Orion / Lyra / Vega / Draco / Pegasus / Polaris / Cassiopeia / Andromeda | Dark Cosmic     |
| Fruit     | Lemon / Fig / Plum / Cherry / Peach / Pear / Berry / Grape | Light           |
| Almanac   | Anchor / Key / Compass / Lantern / Pen / Pocketwatch / Bell / Wheel | Paper          |

Locked decks live behind Cup Clash+. Show them as locked tiles in a "Decks" sub-screen reachable from Memory's stage map.

## Files to copy

When implementing, copy these into your real codebase as the starting point — the prototype JSX is already production-style, just needs TypeScript types and a real bundler:

- `prototypes/memory-icons.jsx` → `src/games/memory/icons.tsx`
