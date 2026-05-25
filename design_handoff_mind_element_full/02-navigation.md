# 02 · Navigation — the 3-line menu

The user explicitly wants a **3-line hamburger menu at the top** on both the **landing page** and inside the **web app**, for full-page and section navigation. Same component, same drawer pattern, different link sets.

## Visual spec

### The hamburger button

- Position: top-left, 16px from the top, 16px from the left edge.
- Size: 40×40 tap target (icon is 22×16 inside).
- Icon: three horizontal lines, 1.8px stroke, rounded caps, 22px wide, 4px apart.
- Color: `var(--ink)` always.
- Background: transparent. On scroll past hero, optional `var(--surface)` pill with `var(--border)`.

```jsx
<button aria-label="Menu" onClick={openDrawer}>
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <path d="M1 2h20M1 8h20M1 14h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
</button>
```

### The drawer

- Slides in from the left, 86vw wide (max 360px on tablets).
- Background: `var(--surface)`. Right edge: `1px solid var(--border)`.
- Backdrop: `rgba(0,0,0,0.4)` on Light/Paper, `rgba(0,0,0,0.7)` on Dark. Click to dismiss.
- Slide animation: `transform: translateX(-100%) → 0`, 220ms `cubic-bezier(.2,.7,.3,1)`.
- Close button: top-right of drawer, the same icon flipped to an X. Esc also closes.

### Drawer structure

```
┌─ Drawer ────────────────────────────┐
│  Wordmark · "Mind Element"          │
│  ─────────────────────              │
│  PRIMARY NAV (link list)            │
│                                     │
│  ─────────────────────              │
│  THEME SWITCHER (segmented)         │
│  ─────────────────────              │
│  SECONDARY LINKS (terms, etc)       │
│  Bottom: version stamp · 1.0        │
└─────────────────────────────────────┘
```

Padding: 24px around. Section dividers: `1px solid var(--hair)` with 20px vertical spacing.

### Link rows

Each link is a full-width tap target, 48px tall, with:
- Label in `var(--font-sans)` (paper: `var(--font-serif)`), 15px, 500 weight, `var(--ink)`
- Optional caret `›` at the right, `var(--ink-3)`
- Active route: left-edge accent bar `3px solid var(--accent)` + `var(--surface-alt)` background

```jsx
<a className="nav-row" aria-current={isActive ? "page" : undefined}>
  <span>{label}</span>
  <span className="caret">›</span>
</a>
```

### Theme switcher inside drawer

A 3-up segmented control. Each segment:
- Equal width, 44px tall
- Active: `var(--surface-hi)` background, 1.5px solid `var(--accent)`, `var(--accent)` text
- Inactive: transparent, `var(--border)`, `var(--ink-3)` text
- Paper note: segments are square (no radius), shadow is `var(--shadow-card)`
- A small color chip on the left of each segment (the theme's accent swatch)

```
[ ● Light ] [ ● Dark ] [ ● Paper ]
```

## Link sets

### Landing page

The hamburger jumps to in-page section anchors (smooth scroll) **and** out to the app:

```
PRIMARY
  How it works            #how
  Games                   #games
  Pricing                 #pricing
  FAQ                     #faq

THEMES (segmented control)
  Light · Dark · Paper

SECONDARY
  Sign in                 /onboarding
  Try it free             /onboarding (highlighted, accent button)
  Terms                   /legal/terms
  Privacy                 /legal/privacy
```

Smooth-scroll behavior:

```css
html { scroll-behavior: smooth; }
section[id] { scroll-margin-top: 72px; }
```

### Web app (every route after onboarding)

```
PRIMARY
  Games                   /home
  Stage map               /stages/tango   (deep-links to current game)
  Leaderboard             /league
  You                     /profile

THEMES (segmented control)
  Light · Dark · Paper

SECONDARY
  Difficulty progression  /settings/difficulty
  Help & support          /support
  Sign out                (action)
```

The "Stage map" link is dynamic — it points to the most recently played game's map. If no game has been opened yet, default to `/stages/tango`.

## Where the hamburger appears

- **Landing page**: top-left, always visible. No bottom nav.
- **App screens**: top-left of every screen. Replaces the back arrow only on top-level screens (Home, Leaderboard, Profile). On nested screens (Stage Map, Game, Complete, Paywall, Onboarding), keep the back arrow on the left **and put the hamburger on the right** — flipping sides so it's clear which control does what.

```
[back ◂]   [Title]   [hamburger ☰]    ← nested screens
[hamburger ☰]   [Title]   [XP pill]   ← top-level screens
```

## Bottom nav (apps only)

On top-level app screens (Home, Leaderboard, Profile), the existing bottom nav stays. It is the **primary** way to move between these three. The hamburger is the **secondary** way + the only way to access non-tab destinations (Stage map, Difficulty settings, Help, Sign out).

Bottom nav items:
- Games (Home) · Map · League · You

## Accessibility

- The hamburger is a `<button>` with `aria-label="Menu"`, `aria-expanded={open}`, `aria-controls="main-drawer"`.
- The drawer is `role="dialog"`, `aria-modal="true"`, `aria-labelledby="drawer-title"`.
- Focus traps inside the drawer while open. First tab target is the close button.
- Esc closes the drawer.
- Body scroll lock while open: `document.body.style.overflow = "hidden"`.

## Implementation sketch

```tsx
// src/components/nav/HamburgerMenu.tsx
export function HamburgerMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  // …
  return (
    <>
      <button className="hamburger-btn" aria-label="Menu"
              aria-expanded={open} onClick={() => setOpen(true)}>
        <Hamburger3LineIcon/>
      </button>
      {open && (
        <FocusTrap>
          <div className="drawer-backdrop" onClick={() => setOpen(false)}/>
          <aside className="drawer" role="dialog" aria-modal="true">
            <DrawerHeader onClose={() => setOpen(false)}/>
            <NavList links={links} onNavigate={() => setOpen(false)}/>
            <ThemeSegmented value={theme} onChange={setTheme}/>
            <SecondaryList links={links.filter(l => l.section === "secondary")}/>
          </aside>
        </FocusTrap>
      )}
    </>
  );
}
```

The two pages instantiate it with different `links` props. Same component, no duplication.
