# 09 · Mobile-first

The designs are authored at 400×820 (a phone). That is the **primary** viewport. Everything must work and feel right at 360px width. Larger screens are an enhancement.

## Breakpoints

| Token       | Range          | Layout                                                     |
|-------------|----------------|------------------------------------------------------------|
| `mobile`    | up to 479px    | Default. Single column. Bottom nav visible.                |
| `tablet`    | 480-899px      | Single column capped at 480px and centered.                |
| `desktop`   | ≥ 900px        | Two-column layouts where called out; otherwise centered.   |

```css
:root { --content-max: 480px; }

.shell {
  width: 100%;
  max-width: var(--content-max);
  margin-inline: auto;
  padding-inline: 0;
}
```

For the **landing page**, allow the hero band to be wider than 480px on desktop (max 1100px), with the rest of the page sections capped at 720px. The mobile-style three-pictogram strip becomes a larger 3-column card row.

## Touch targets

Minimum tap target is **44×44 px**. Apply to:
- Hamburger button
- Game cell taps (cells are 44+ already)
- Nav bottom items
- All buttons in toolbars
- Settings rows (use 48px height)

Use `padding`, not `width/height`, to grow tap targets without disturbing layout.

## Type scaling

Don't scale type up on larger screens. The mobile sizes are already comfortable on desktop within the 480px column. Going larger makes the app feel like an enlarged phone screenshot.

Exception: the **landing hero headline**. Mobile is 40px; bump to 56px at `tablet` and 72px at `desktop`. Keep tracking at -1.2.

## Safe areas

Account for iOS notch + home indicator:

```css
.shell-top    { padding-top:    env(safe-area-inset-top); }
.shell-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

Bottom nav uses `padding-bottom: max(16px, env(safe-area-inset-bottom))`.

## Orientation

Lock to portrait on mobile via the manifest (`"orientation": "portrait-primary"`). On tablets/desktop the app works in landscape but the centered 480px column means the side gutters get larger; no special landscape layout needed.

## PWA

Make it installable:

```json
// public/manifest.json
{
  "name": "Cup Clash",
  "short_name": "Cup Clash",
  "start_url": "/home",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#F8F4ED",
  "theme_color": "#9C6BE8",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Register a service worker (Vite plugin `vite-plugin-pwa`) for offline caching. Cache the shell + last-played puzzles so the user can keep playing offline.

## Image / icon sizes

- SVG icons (Memory icons, game icons, UI icons): always vector. 24×24 viewBox.
- Avatar fallbacks: initials in a circle, no raster.
- The only raster you might need: PWA icons + favicon. Use a single source PNG (1024×1024) and let the build pipeline emit sizes.

## Performance budget

- First contentful paint < 1.5s on a mid-range Android over 4G.
- JS bundle: keep the initial route under 200KB gzipped. Code-split by route (`React.lazy(() => import("./screens/Game"))`).
- Fonts: preconnect to Google Fonts; subset to Latin (`&subset=latin` not supported, but `&text=` works for the wordmark). For body fonts, accept the full Latin subset.

## Reduced motion

Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Disable card-flip animations (cards just swap state instantly).
- Disable the constellation/winding path drawing animation on the stage map.
- Hint indicator pulses become a static accent ring.

## Reduced data / save data

Honor `Save-Data: on` request header (if present, server-side; otherwise check `navigator.connection.saveData`):
- Skip the cosmic-bg twinkle animation (uses ~60 absolutely-positioned divs).
- Use the static newsprint texture without parallax.

## Color contrast

All three themes hit WCAG AA for body text on background:

| Theme | Body on bg                            |
|-------|---------------------------------------|
| Light | `#3C3633` on `#F8F4ED` → 9.4:1 ✓     |
| Dark  | `rgba(255,255,255,0.85)` on `#07070E` → 14:1 ✓ |
| Paper | `#3C3022` on `#EFE5C9` → 8.1:1 ✓     |

Accent on background:
| Theme | Accent on bg                          |
|-------|---------------------------------------|
| Light | `#9C6BE8` on `#F8F4ED` → 4.5:1 ✓ (UI element use only — avoid for body text) |
| Dark  | `#A855F7` on `#07070E` → 5.9:1 ✓     |
| Paper | `#1A1714` on `#EFE5C9` → 13:1 ✓      |

When in doubt, use `--ink` for any text. Accent is for chrome and CTAs.

## RTL note (future)

The product owner is Israeli; Hebrew RTL is on the roadmap. To prepare:
- Use logical CSS properties (`margin-inline-start` not `margin-left`).
- Mirror SVG icons that imply direction (back arrow, carets).
- Test the drawer slides from the **end** side in RTL (right edge instead of left).
- The 3-line hamburger and bottom nav don't change physically — bidi-neutral.

Don't ship RTL in v1; just don't paint yourself into a corner.
