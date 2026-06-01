# Mind Element — "Cooler Assets" Gemini Prompt Pack

Push the art beyond the geometric placeholders into a **premium, cohesive illustrated library**. Everything below is tuned to the exact image slots already in the build, so you can drop results straight in.

> **One master style = one game.** Lock the style line below and reuse it on every prompt. Generate ONE asset first, then attach it as a reference: *"same art style, lighting, finish and framing — only change the subject."* Same chat / same seed.

### ★ Master style (use on everything)
```
STYLE: vibrant soft-3D render, claymation-meets-mobile-game finish, smooth rounded
forms, gentle subsurface glow, soft studio key light + subtle rim light, clean
shadows, rich saturated color with a cyan/violet/gold accent family. Premium,
playful, ageless (delightful for an 8-year-old and an 80-year-old). Crisp, high
detail, no text, no watermark.
```

---

## 1 · MEMORY — illustrated pack (replaces the geometric faces)
**Spec:** each face = **full-bleed 1:1 square**, self-contained background (so one set works on dark/light/paper). 18 subjects = up to 18 pairs (hard uses 15).

**Batch (one sheet):**
```
[★ STYLE]
A 6x3 grid of 18 collectible memory-card faces, each a different subject, each a
full-bleed rounded square with its OWN distinct vibrant gradient background, identical
lighting and framing across all 18, evenly spaced.
Subjects: glowing crystal gem, ringed planet, shooting star, glossy heart, honeycomb,
water droplet, blooming flower, lightning bolt, leaf, crescent moon, smiling sun,
prism, rainbow, cute fox, wise owl, friendly whale, red mushroom, hot-air balloon.
1:1 each, no text.
```
**Per-face (cleanest edges):**
```
[★ STYLE] Same card style/background as the reference.
SUBJECT: <one subject>, centered, generous padding. Distinct <color> gradient backdrop.
Full-bleed 1:1, highest resolution, no text.
```
**Unlockable themed packs (gamification + learning):** generate as worlds —
`Cosmos` (planets, comet, rocket, nebula, astronaut…), `Garden` (flora + bugs),
`Creatures` (animals), `Treasure` (gems/relics). Free pack at start; others unlock at Level 5 / 12 / Diamond mastery.
→ Drop onto slots `memory-pair-*` in **Game Screens → Memory**.

## 2 · MEMORY card BACK (one design)
```
[★ STYLE] A premium memory-card back: deep cyan→near-black gradient (#2FE6E0 → #0B0C0F),
faint glowing dot-grid texture, a single centered glowing "spark" emblem (thin antenna
ending in a cyan orb). Symmetrical, no text. Full-bleed 1:1.
```

## 3 · SPARKY — finish the mascot set
Using your locked hero Sparky as reference:
```
[★ STYLE] Same Sparky character (rounded squircle cube-cell, dot eyes, spark antenna),
COLOR VARIANT: <gold #FFC24B→#E0941B for rewards | violet #8E7CFF→#5B49C9 for milestones>,
EXPRESSION: celebrate. Transparent background PNG, 1:1, centered, no text.
```
→ Powers the Level-up & Century takeovers and the figure collection (slots already present).

## 4 · NAME THE CITY — landscape (16:9)
```
[★ STYLE] A warm, semi-stylized illustration of <CITY>'s most iconic skyline/landmark
at golden hour, soft depth and atmosphere, no text, no labels. 16:9, high resolution.
```
→ Slot `guess-city-kyoto` (and future `guess-city-*`). Pair with a facts payload:
```json
{ "city": "Kyoto", "country": "Japan", "facts": ["…","…","…"] }
```

## 5 · NAME THE COUNTRY — landmark (16:9)
```
[★ STYLE] A recognizable landmark/landscape of <COUNTRY>, warm semi-stylized, no text. 16:9.
```
→ Slot `guess-country-japan`. **Flags:** use real flag SVGs (accurate + free) — don't generate. Facts payload like the city set.

## 6 · ACHIEVEMENT badge art (1:1)
```
[★ STYLE] A glossy achievement medallion for "<Achievement>" (e.g. Speed Demon = a
winged stopwatch), soft-3D, gold + cyan accents, centered, transparent background, 1:1, no text.
```
→ Slot `achv-speed-demon` (and future badge slots).

## 7 · Optional — marketing / hero imagery
```
[★ STYLE] A floating cluster of 3 phones showing the Mind Element app (dark UI, cyan
accents, puzzle boards + Sparky celebrating), soft studio lighting, premium product
shot on a clean gradient backdrop. 16:9.
```

---

### Specs & tips
- **1:1** for memory faces / badges / Sparky; **16:9** for city/country/hero. Ask for the **highest resolution**.
- **Transparent PNG** for Sparky + badges; **full-bleed** for memory faces, city, country.
- If Gemini bakes a checkerboard instead of real alpha, send it back: *"transparent background, PNG with alpha, no checkerboard."* I can also key it out.
- Keep subjects **centered with padding** so the app's rounded mask never clips them.
- Hand me any finished set and I'll wire the folder + the level/XP pack-unlock logic + the facts-reveal data.
```
