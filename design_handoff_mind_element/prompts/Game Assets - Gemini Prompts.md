# Mind Element — Game Asset Prompt Pack (Gemini)

Asset sets that make individual games feel premium and worth paying for — starting with **Memory**, then extending to **Solitaire/Hearts**, **Name the City**, and **Name the Country**. All tuned so one set works across the Dark / Light / Paper themes.

> **Theme strategy:** make each card face a **self-contained, full-bleed square** with its *own* background/illustration. Because the art carries its own backdrop, the same set looks right on dark, light and paper — no per-theme variants needed. (Card *backs* get one on-brand design.)

> **Consistency rule (every set):** generate one great asset first, attach it as a **reference image**, then say *"same art style, lighting, framing and border — only change the subject."* Reuse the same chat/seed.

---

## 1 · MEMORY — collectible card faces

You need **15+ pairs** for hard levels; make **more** for diversity and for unlockable packs (reach Level X / Y XP → new pack). Each *pair* = one image used on two cards.

### Art-direction (pick one, keep it for the whole set)
**Recommended — "soft-3D collectible sticker":**
```
STYLE: a single icon-subject rendered as a glossy, soft-3D collectible sticker,
centered on a smooth two-tone radial-gradient square background, subtle inner
vignette, gentle top light, thin soft inner border like a trading card. Premium,
friendly, readable at small sizes. Appeals to kids and adults. No text.
```
Alt — "flat editorial": flat vector subject, smooth gradient bg, long soft shadow.

### Batch prompt (one image, the whole set)
```
[STYLE]
A 4x4 grid sheet of 16 Mind Element memory cards, each a different subject,
each a full-bleed rounded square with its own distinct color gradient background,
consistent lighting and framing across all 16, evenly spaced on a plain backdrop.
Subjects: gem, ringed planet, rocket, star, heart, flower, lightning bolt, crescent moon,
sun, fox, owl, whale, mushroom, rainbow, crystal cluster, hot-air balloon.
1:1 each, no text, no labels.
```
*(Sheet is convenient; for cleanest edges, also generate the favorites as individual 1:1 images.)*

### Per-card template (best quality / consistency)
```
[STYLE] Same card style and background treatment as the reference.
SUBJECT: <one subject>. Distinct <color> gradient background.
Full-bleed 1:1 square, high resolution, no text.
```

### Themed packs (diversity + the "learn something" hook)
Generate the set as **packs** — each pack is its own visual world AND can teach a fact on match:
- **Cosmos** — planets, comet, rocket, moon, sun, galaxy, satellite, astronaut *(space facts)*
- **Garden** — flower, leaf, mushroom, bee, butterfly, tree, fruit, watering can *(nature facts)*
- **Creatures** — fox, owl, whale, cat, frog, crab, deer, hedgehog *(animal facts)*
- **Treasure** — gem, crystal, gold coin, key, crown, ring, chest, pearl
Unlock rule example: Garden free, Cosmos at Level 5, Creatures at Level 12, Treasure at Diamond mastery.

### Card BACK (one design, all themes)
```
[STYLE] A Mind Element playing-card back: deep gradient (electric cyan #2FE6E0 to
near-black #0B0C0F), a faint dotted grid texture, and a small centered glowing
"spark" emblem (a thin antenna ending in a cyan orb). Symmetrical, premium, no text.
Full-bleed 1:1.
```

### Specs
- **1:1**, highest resolution available. Full-bleed (the app rounds the corners).
- Keep the subject centered with even padding so it survives the rounded mask.
- Drop finished faces onto the **card slots** in *Game Screens → Memory* (ids `memory-pair-*`). I'll wire the full deck to pull from a folder once you have the set.

---

## 2 · SOLITAIRE / HEARTS — a real deck

```
[STYLE — flat premium, single family]
A Mind Element playing-card face: <rank><suit> (e.g. "Ace of hearts"), clean modern
pip layout, brand palette (hearts/diamonds in coral #FF5C66, clubs/spades in deep slate),
crisp white card with thin rounded border, subtle paper texture. No photoreal, no text
besides the rank index. 2.5:3.5 card ratio.
```
- Generate the 4 suit symbols + court-card art (J/Q/K) in one consistent style; number cards can be composed from the pip + index.
- One shared **card back** (reuse the Memory back, or a variant).

---

## 3 · NAME THE CITY — image + facts (educational)

Per city: one **stylized illustration** + a short facts payload you author.
```
[STYLE] A stylized, warm semi-flat illustration of the <CITY> skyline / most iconic
landmark, soft depth, golden-hour palette, no text, no labels, clean and premium.
16:9, high resolution.
```
Pair each image with data (you write this — keep it kid-friendly):
```json
{ "city": "Kyoto", "country": "Japan", "facts": [
  "Former capital of Japan for over 1,000 years",
  "Home to 1,600+ Buddhist temples",
  "Famous for cherry blossoms in spring" ] }
```
On a correct answer, reveal the image + 1–2 facts → "learn something new."

## 4 · NAME THE COUNTRY — landscape + flag + facts
```
[STYLE] Same illustration style as the city set. A recognizable landscape / landmark
of <COUNTRY>, warm semi-flat, no text. 16:9.
```
- **Flags:** don't generate — use real flag SVGs (accurate + free). I'll wire them in.
- Facts payload like the city set (capital, population, a fun fact).

---

## 5 · How it lands in the build
| Asset | Where it plugs in |
|---|---|
| Memory faces (packs) | `memory-pair-*` slots → unlockable packs by level/XP |
| Card back | Memory + Solitaire/Hearts |
| City/Country images + facts | reveal panel after a correct answer (educational moment) |

Generate any one set, drop it onto the slots in **Game Screens**, and I'll wire the rest (folders, pack-unlock logic, the facts reveal panel).
