# 01 · Design system

Three themes share a single token contract. Build everything against CSS variables; switch themes by setting `<html data-theme="light|dark|paper">`.

## Tokens (CSS variables)

Drop this into `src/themes/tokens.css` and import it once in `main.tsx`.

```css
:root, [data-theme="light"] {
  /* surfaces */
  --bg:           #F8F4ED;
  --surface:      #fff;
  --surface-alt:  rgba(28,25,23,0.04);
  --surface-hi:   #fff;

  /* ink */
  --ink:    #1C1917;
  --ink-2:  #3C3633;
  --ink-3:  #78706A;
  --ink-4:  #A39C95;

  /* accent + status */
  --accent:    #9C6BE8;
  --accent-2:  #4F6EF7;
  --success:   #10B981;
  --warn:      #F59E0B;
  --ruby:      #DC2626;
  --mint:      #34D399;
  --mint-bg:   #D1FADF;

  /* lines */
  --border:    rgba(28,25,23,0.10);
  --hair:      rgba(28,25,23,0.06);

  /* button defaults */
  --btn-accent:    #9C6BE8;
  --btn-accent-ink:#fff;
  --btn-bg:        #1C1917;
  --btn-ink:       #F8F4ED;

  /* type */
  --font-serif: "Fraunces","Georgia",serif;
  --font-sans:  "Outfit","Inter",system-ui,sans-serif;
  --font-mono:  "JetBrains Mono",ui-monospace,monospace;
  --font-label: var(--font-sans);

  /* radius */
  --radius-sm: 10px;
  --radius:    14px;
  --radius-lg: 20px;

  /* shadow */
  --shadow:       0 8px 24px rgba(28,25,23,0.06);
  --shadow-card:  0 4px 14px rgba(28,25,23,0.04);
  --shadow-boost: 0 4px 14px rgba(156,107,232,0.30);

  /* motion */
  --ease:    cubic-bezier(.2,.7,.3,1);
  --dur-1:   120ms;
  --dur-2:   220ms;
  --dur-3:   400ms;
}

[data-theme="dark"] {
  --bg:           #07070E;
  --surface:      rgba(255,255,255,0.04);
  --surface-alt:  rgba(255,255,255,0.02);
  --surface-hi:   rgba(255,255,255,0.08);

  --ink:    #fff;
  --ink-2:  rgba(255,255,255,0.85);
  --ink-3:  rgba(255,255,255,0.55);
  --ink-4:  rgba(255,255,255,0.35);

  --accent:    #A855F7;
  --accent-2:  #38BDF8;
  --success:   #34D399;
  --warn:      #F5B342;
  --ruby:      #F472B6;
  --mint:      #34D399;
  --mint-bg:   rgba(52,211,153,0.15);

  --border:    rgba(255,255,255,0.12);
  --hair:      rgba(255,255,255,0.06);

  --btn-accent:    #A855F7;
  --btn-accent-ink:#0E0C18;
  --btn-bg:        rgba(255,255,255,0.10);
  --btn-ink:       #fff;

  --shadow:       0 12px 36px rgba(0,0,0,0.5);
  --shadow-card:  0 12px 36px rgba(0,0,0,0.4);
  --shadow-boost: 0 0 24px rgba(168,85,247,0.5);
}

[data-theme="paper"] {
  --bg:           #EFE5C9;
  --surface:      #FFFCF1;
  --surface-alt:  rgba(232,220,186,0.55);
  --surface-hi:   #FFFCF1;

  --ink:    #1A1714;
  --ink-2:  #3C3022;
  --ink-3:  #5C4F38;
  --ink-4:  #8C7E62;

  --accent:    #1A1714;
  --accent-2:  #8C2A1F;
  --success:   #1A1714;
  --warn:      #8C2A1F;
  --ruby:      #8C2A1F;
  --mint:      #1A1714;
  --mint-bg:   #E8DCBA;

  --border:    #1A1714;
  --hair:      rgba(26,23,20,0.30);

  --btn-accent:    #1A1714;
  --btn-accent-ink:#FFFCF1;
  --btn-bg:        #FFFCF1;
  --btn-ink:       #1A1714;

  --font-serif: "Old Standard TT","Fraunces","Georgia",serif;
  --font-sans:  "Old Standard TT","Fraunces","Georgia",serif;
  --font-mono:  "Special Elite","JetBrains Mono",monospace;
  --font-label: var(--font-mono);

  --radius-sm: 0px;
  --radius:    0px;
  --radius-lg: 0px;

  --shadow:       2px 2px 0 #1A1714;
  --shadow-card:  1.5px 1.5px 0 #1A1714;
  --shadow-boost: 3px 3px 0 #1A1714;
}

/* Paper newsprint backdrop — apply to <body> when theme=paper */
[data-theme="paper"] body {
  background-color: #EFE5C9;
  background-image:
    radial-gradient(circle at 12% 18%, rgba(0,0,0,0.04) 1px, transparent 1px),
    radial-gradient(circle at 70% 60%, rgba(0,0,0,0.03) 1px, transparent 1px),
    radial-gradient(circle at 35% 80%, rgba(0,0,0,0.025) 1px, transparent 1px),
    linear-gradient(180deg, #F1E8CE 0%, #ECE0BF 100%);
  background-size: 5px 5px, 7px 7px, 11px 11px, 100% 100%;
}
```

## Type ramp

| Role            | Size | Weight | Family             | Tracking |
|-----------------|------|--------|--------------------|----------|
| Display XL      | 40   | 600    | serif              | -1.2     |
| Display L       | 32   | 600    | serif              | -0.8     |
| Display M       | 26   | 600    | serif              | -0.5     |
| Display S       | 20   | 600    | serif              | -0.3     |
| Body L          | 16   | 500    | sans               | 0        |
| Body            | 14   | 500    | sans               | 0        |
| Body S          | 13   | 500    | sans               | 0        |
| Caption         | 11   | 600    | sans               | 0.3      |
| Label           | 9.5  | 700    | label              | 1.4 (uc) |
| Mono S          | 11   | 700    | mono               | 0        |

In **Paper**, the serif slot becomes Old Standard TT (slightly more upright). The label slot is Special Elite (typewriter). Sizes don't change.

## Spacing scale

```
2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 32 · 40 · 56
```

Card padding defaults to 14 or 16. Screen-edge padding is 20-24px.

## Radius rules

- Light & Dark: `--radius-sm: 10` for chips/buttons, `--radius: 14` for cards, `--radius-lg: 20` for hero surfaces.
- Paper: **all radii = 0**. The theme reads as ink-on-paper; rounded corners break the feel.
- Pills (small badges) use `border-radius: 999px` in Light/Dark, `0` in Paper.

## Shadow rules

- Light: soft diffused (`0 8px 24px rgba(0,0,0,0.06)`).
- Dark: deeper, no spread (`0 12px 36px rgba(0,0,0,0.5)`); glows for accent surfaces (`0 0 24px var(--accent)`).
- Paper: **hard offset, no blur** (`2px 2px 0 var(--ink)`). It's a print-block aesthetic.

## Motion

- 120ms for hover/focus, 220ms for taps/state changes, 400ms for screen transitions.
- Easing `cubic-bezier(.2,.7,.3,1)` (snappy in, gentle out).
- Memory card flip: 400ms, `transform: rotateY(180deg)`, `backface-visibility: hidden` on both faces.

## Theme switcher

The Profile screen and the hamburger drawer expose a 3-up segmented control with the theme names: Light · Dark · Paper. Tapping writes to `useSettings.theme` and the `<html data-theme="…">` attribute. Default theme is whatever the user picked during onboarding step 4 ("How should it look?"), falling back to system `prefers-color-scheme`.
