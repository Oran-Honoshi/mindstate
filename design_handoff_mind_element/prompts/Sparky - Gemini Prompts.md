# Sparky — Gemini Image Prompt Pack

Generate the Mind Element mascot **Sparky** as clean, transparent-background PNGs that match the in-app design. Sparky is a friendly *living puzzle cell* — the atom every Mind Element game is built from.

> **Best results:** attach the existing Sparky SVG/screenshot as a **reference image** in Gemini and say *"keep this exact character design, colors and proportions — re-render it more polished and professional."* Reuse the same chat (or the same seed) for every variation so the style stays consistent.

---

## 0 · Character bible (the non-negotiables)
Paste this block at the top of any prompt so the character never drifts:

```
CHARACTER: "Sparky" — the mascot of Mind Element, a brain-training puzzle app.
FORM: a single rounded-square puzzle tile (squircle, ~25% corner radius), like a
   smart little cube-cell. Friendly and ageless — appealing to an 8-year-old and a
   70-year-old. NOT a robot, NOT an animal, NOT a human.
FACE: two simple, expressive eyes (rounded dots with a tiny white highlight). Minimal,
   Pixar-warm. No nose. Mouth only when smiling/celebrating — a small soft curve.
SIGNATURE DETAIL: a thin antenna rising from the top-center ending in a small glowing
   SPARK orb. This is essential — it is why he is called Sparky.
INNER DETAIL: a faint, softer rounded-square frame inset inside the body (a subtle
   "cell within a cell") — keep it gentle, never busy.
COLOR (default): electric cyan body with a smooth top-to-bottom gradient
   #2FE6E0 (light, top) to #0E8E93 (deep, bottom); soft inner glow; glossy highlight
   near the top-left; eyes in near-black #0B1316; the spark orb glows cyan #8FF3EE.
PROPORTIONS: chunky, rounded, confident. Centered. Slight bottom contact shadow.
```

---

## 1 · Art-direction style (pick one — I recommend **A** for "professional")

**A — Soft 3D, premium app mascot (recommended)**
```
STYLE: soft-matte 3D render, gentle subsurface glow, smooth rounded edges, subtle rim
light, one soft contact shadow. Polished and premium — the quality bar of top-tier app
mascots. Clean studio lighting. Not glossy-plasticky, not low-poly. High detail, crisp.
```

**B — Flat vector (cleaner / more graphic)**
```
STYLE: flat vector illustration, smooth gradients, soft long shadow, crisp geometric
edges, modern and minimal. Sticker-clean. No texture, no noise.
```

---

## 2 · Master "hero" prompt (single polished Sparky)
```
[PASTE Character bible]
[PASTE Style A or B]

Render a single hero portrait of Sparky, front-facing, friendly idle expression with a
warm subtle smile, the spark orb softly glowing. Perfectly centered.

OUTPUT: transparent background (alpha), PNG, square 1:1, the character filling ~80% of
frame with even padding. No background, no scene, no shadow plane, no text, no watermark,
no extra props. Studio-clean.
```

---

## 3 · Expression set (one prompt per expression — keep same chat/seed)
Replace the **EXPRESSION** line each time. Generate all six:

```
[Character bible] [Style A]
Same Sparky, same colors and proportions. EXPRESSION: <one of below>.
Transparent background PNG, 1:1, centered, no text, no background.
```
- `idle` — calm, attentive, eyes forward, tiny highlight, faint resting smile
- `happy` — cheerful, eyes as gentle upward arcs (^_^), soft open smile
- `focused` — concentrating, eyes as two short determined lines, slight forward lean
- `surprised` — wide round eyes, antenna spark flaring brighter, small "oh" mouth
- `celebrate` — joyful, sparkle/star-shaped eyes, big open smile, spark bursting, tiny motion lines
- `resting` — sleepy, eyes as soft downward closed arcs, antenna drooping slightly

> Tip: you can also ask for all six in **one image** — *"a 3×2 expression sheet of Sparky, six expressions labeled, evenly spaced, each on transparent background"* — but separate images give cleaner alpha edges for the app.

---

## 4 · Color variants (semantic — same shape, swap palette)
```
[Character bible but override COLOR] [Style A] celebrate expression.
Transparent PNG, 1:1, centered, no text.
```
- **Reward / Gold** (level-ups, achievements): body gradient `#FFD479 → #E0941B`, spark glows warm gold, eyes #2A1A06.
- **Mind / Violet** (milestones, premium): body gradient `#8E7CFF → #5B49C9`, spark glows lilac, eyes #140C2A.
- **Difficulty trio** (optional): Easy green `#54D06A`, Medium amber `#F5A623`, Hard coral `#FF5C66`.

---

## 5 · Poses (optional, for richer moments)
Same character + style, add a POSE line:
- `waving hello` (onboarding welcome)
- `pointing up at a glowing level number` (level-up)
- `holding/leaning on a gold medal` (mastery unlock)
- `peeking from the bottom edge` (empty states / tooltips)
- `mid-jump with confetti` (big milestone — confetti on transparent bg)
- `thinking, one antenna curled like a question mark` (loading)

---

## 6 · App icon (square, NOT transparent)
```
[Character bible] [Style A]
App icon: Sparky (idle, confident) centered on a deep near-black squircle background
(#1A1E26 to #0B0C0F vertical gradient) with a faint cyan glow behind him. Premium iOS
app-icon composition, generous padding, no text. 1024×1024, square, full-bleed background
(rounded corners handled by the OS — render a full square).
```

---

## 7 · Consistency & quality checklist
- **Transparent background:** explicitly say *"transparent background, PNG with alpha, no background, no shadow plane."* If Gemini adds a white bg, ask it to *"remove the background and export with transparency."*
- **Lock the character:** attach your best Sparky result as a reference for every later prompt; say *"same character, same colors, only change the expression/color."*
- **Negative (append if needed):** `no text, no letters, no watermark, no border, no background, not a robot, not an animal, no human features, no extra characters, no busy details`.
- **Format:** request **1:1** for portraits/expressions, **1024×1024** for the icon. Ask for the **highest resolution** available.
- **Edges:** soft-matte (Style A) gives a clean cut-out; avoid heavy outer glow that bleeds into the alpha edge (keep glow *inside* the body).

---

### Where each asset lands in the app
| Asset | Used in |
|---|---|
| Expression set (idle/happy/focused/surprised/celebrate/resting) | celebrations, onboarding, loading, empty states |
| Gold + Violet variants | level-up & milestone takeovers |
| Poses (medal / pointing / confetti) | mastery cards, level-up, century |
| App icon | home screen, splash, store listing |

Drop the finished PNGs onto the image slots in **Sparky & Rewards.html** (rank emblem, badge art) and I'll wire the rest of the app to pull from the same set.
