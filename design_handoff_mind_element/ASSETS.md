# Assets — Mind Element

All under `assets/`. Two kinds: **code-rendered SVG** (game icons, board previews, mascot geometry, medals — no files, generated in `brandkit.jsx` / `previews.jsx`) and **raster PNGs** (mascot art, card faces, place images, badge).

## Raster assets (in this bundle)
| Path | What | Where used | Source / notes |
|---|---|---|---|
| `sparky/idle·happy·focused·surprised·celebrate·resting.png` | Mascot "Sparky" expression set | celebrations, onboarding, avatars, menus | User Gemini art; sliced from an expression sheet, checkerboard background keyed to transparent |
| `sparky/gold.png`, `sparky/violet.png` | Reward (gold) & milestone (violet) Sparky | Level-up & Century takeovers | Gemini art, background keyed |
| `sparky/hero.png` | Hi-res hero Sparky | splash / large displays | Gemini art, background keyed |
| `memory/face-0…24.png` | Memory card faces (18 distinct subjects) | Memory game (`game-screens.jsx`, `FACE_IDS`) | Sliced from a Gemini 5×5 pack sheet |
| `cards/back.png` | Branded card back | Memory + Solitaire/Hearts | Gemini art, background keyed |
| `badges/speed.png` | "Speed Demon" achievement medallion | Achievement card (`rewards.jsx`) | Gemini art, background keyed |
| `places/kyoto.png` | Kyoto illustration (16:9) | Name the City | Gemini art; watermark corner cropped |
| `places/japan.png` | Japan / Mt Fuji illustration (16:9) | Name the Country | Gemini art; watermark corner cropped |
| `marketing/hero.png` | 3-phone product shot | Landing hero | Gemini art; watermark corner cropped |

## Code-rendered (no files — keep as components or export to SVG/PNG at build)
- **24 game icons** — `GameIcon({game,size})` in `brandkit.jsx`. One geometric glyph per game in a rounded tile.
- **24 board previews** — `BoardPreview({game,size,gap,t})` in `previews.jsx`. Theme-aware designed mini-boards (used on hybrid game cards + as fallback play art).
- **Mascot geometry, app icon, NodeMark logo, Medals** — `brandkit.jsx`.
- **Line icons** — `Icon({name,size,color,stroke})` in `icons.jsx`.

## Generating more art (Gemini)
Prompt packs in `prompts/`:
- `Cooler Assets - Gemini Prompts.md` — master style + per-slot prompts (recommended).
- `Game Assets - Gemini Prompts.md` — memory packs, decks, city/country, educational.
- `Sparky - Gemini Prompts.md` — mascot bible, expressions, color/pose variants, app icon.
- `Handoff - City Country Data.md` — Wikipedia / Wikidata / REST-Countries integration for facts, images, and flags.

## Production notes
- Mascot expressions, gold/violet, badges → ship as transparent PNGs (or SVG if redrawn).
- Memory: support **unlockable packs** (folders like `memory/cosmos/`, `garden/`…) gated by level/XP.
- Place images/flags: source dynamically (see data handoff); store generated art per place with a Wikipedia fallback.
- Keep `image-slot.js` only for the prototypes' drag-drop placeholders; not needed in production.
