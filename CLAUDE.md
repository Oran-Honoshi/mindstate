# CLAUDE.md — MindState Project Rules

> Read this file at the start of every session. All code generation must follow these rules without exception.

---

## 0. Project Identity

**App Name:** MindState  
**Tagline:** Sharper Every Day  
**Stack:** Next.js (App Router) · TypeScript · Zustand · Supabase · i18next · Paddle · Framer Motion  
**Design Aesthetic:** "Professional Leisure" — minimalist, surgical, high-contrast dark/light  
**Palette:**
- Background: `#121212` (Deep Charcoal)
- Accent 1: `#00FFFF` (Electric Cyan)
- Accent 2: `#39FF14` (Neon Mint)
- Never use purple gradients, generic white backgrounds, or pastel color schemes.

---

## 1. Component Architecture

### Single Responsibility
Each component must do exactly ONE thing. A component that renders a game grid must not also manage scoring, timers, or routing.

### Max File Length
- **Components:** 150 lines maximum. If a component exceeds 150 lines, split it into sub-components immediately — do not ask for permission.
- **Hooks:** 100 lines maximum. Extract further if needed.
- **Utilities:** No limit, but keep functions small and pure.

### Folder Structure
```
src/
├── app/                         # Next.js App Router pages & layouts
│   ├── (auth)/                  # Auth group: login, register
│   ├── (app)/                   # Protected group: dashboard, games
│   │   ├── play/[game]/         # Game routes
│   │   └── leaderboard/
│   ├── api/                     # API route handlers
│   └── layout.tsx
│
├── components/
│   ├── ui/                      # Atomic, reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx            # Radix UI Dialog wrapper
│   │   ├── Avatar.tsx           # Radix UI Avatar wrapper
│   │   └── Badge.tsx
│   └── layout/                  # App-wide chrome
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── LanguageSwitcher.tsx
│
├── features/                    # One folder per major feature
│   ├── games/
│   │   ├── tango/
│   │   │   ├── TangoBoard.tsx       # UI only
│   │   │   ├── TangoCell.tsx        # Single cell UI
│   │   │   ├── TangoControls.tsx    # Hint/restart buttons
│   │   │   └── useTango.ts          # All game logic
│   │   ├── queens/
│   │   │   ├── QueensBoard.tsx
│   │   │   └── useQueens.ts
│   │   ├── zip/
│   │   ├── sudoku/
│   │   ├── memory/
│   │   └── minesweeper/
│   ├── scoring/
│   │   ├── ScoreDisplay.tsx
│   │   ├── XPBadge.tsx
│   │   └── useXPEngine.ts
│   ├── progression/
│   │   ├── StageMap.tsx
│   │   ├── StageCard.tsx
│   │   └── useProgression.ts
│   ├── leaderboard/
│   │   ├── GlobalLeaderboard.tsx
│   │   ├── FamilyLeaderboard.tsx
│   │   └── useLeaderboard.ts
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── useAuth.ts
│   └── subscription/
│       ├── PricingCards.tsx
│       ├── PlanBadge.tsx
│       └── usePaddle.ts
│
├── hooks/                       # Shared cross-feature hooks
│   ├── useSoundEngine.ts        # Audio + haptics + silent mode
│   ├── useRTL.ts                # LTR/RTL detection from i18n
│   ├── useRealtimeGoals.ts      # Supabase Realtime subscriptions
│   └── useStageGenerator.ts    # Algorithmic seed-based level gen
│
├── lib/                         # Pure utilities, no React
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── generators/              # One file per game generator
│   │   ├── tangoGenerator.ts
│   │   ├── queensGenerator.ts
│   │   ├── zipGenerator.ts
│   │   ├── sudokuGenerator.ts
│   │   ├── memoryGenerator.ts
│   │   └── minesweeperGenerator.ts
│   ├── xp.ts                    # XP decay math, hint penalty logic
│   ├── i18n.ts                  # i18next config
│   └── paddle.ts                # Paddle SDK init
│
├── store/                       # Zustand stores only
│   ├── useSettingsStore.ts      # silentMode, language, theme
│   ├── useGameStore.ts          # active stage, timer, hints used
│   └── useUserStore.ts          # profile, subscription status
│
├── types/                       # TypeScript interfaces & enums
│   ├── game.ts
│   ├── score.ts
│   ├── user.ts
│   └── supabase.ts              # Auto-generated DB types
│
└── constants/
    ├── games.ts                 # Game slugs, display names, icon map
    └── stages.ts                # Difficulty config, XP tables
```

---

## 2. Coding Standards

### Naming Conventions
| Type | Convention | Example |
|---|---|---|
| Component files | PascalCase | `TangoBoard.tsx` |
| Hook files | camelCase, `use` prefix | `useTango.ts` |
| Utility files | camelCase | `tangoGenerator.ts` |
| Store files | camelCase, `use` prefix | `useSettingsStore.ts` |
| CSS classes | Tailwind only | `bg-[#121212]` |
| TypeScript interfaces | PascalCase, `I` prefix optional | `GameStage` or `IGameStage` |
| Supabase table types | PascalCase | `Profile`, `Score` |

### TypeScript
- Every component must have a TypeScript interface for its props. No `any` types.
- Supabase response types must come from auto-generated types in `types/supabase.ts`.
- Use `unknown` instead of `any` for error catch blocks.

### Styling
- **Tailwind CSS only.** Do not create `.css` or `.module.css` files unless for global body/html resets in `globals.css`.
- Use Tailwind arbitrary values for brand colors: `bg-[#121212]`, `text-[#00FFFF]`, `border-[#39FF14]`.
- For RTL support, use Tailwind's `rtl:` variant prefix, not manual `direction` overrides.
- All animations must use Framer Motion — do not use raw CSS `@keyframes` for interactive elements.

### Icons & UI Primitives
- Icons: Lucide React only. Never hand-draw SVG icons.
- Modals: Radix UI `Dialog` wrapped in `components/ui/Modal.tsx`.
- Avatars: Radix UI `Avatar` wrapped in `components/ui/Avatar.tsx`.
- Buttons: Always use `components/ui/Button.tsx` — never write a raw `<button>` in a feature component.

---

## 3. State Management Rules

| State Type | Tool | Example |
|---|---|---|
| Simple local toggle | `useState` | Cell selected / not selected |
| More than 2 related `useState` | Extract to custom hook | Game board state |
| Global settings | Zustand (`useSettingsStore`) | Silent mode, language, theme |
| Auth / user profile | Zustand (`useUserStore`) | Logged-in user, subscription tier |
| Active game state | Zustand (`useGameStore`) | Timer, hints used, current seed |
| All API / DB data fetching | TanStack Query (`useQuery`) | Leaderboard scores, stage list |
| Real-time subscriptions | Supabase Realtime via `useRealtimeGoals.ts` | Friend breaks a record |

### No Prop Drilling
If data needs to pass through more than 2 component layers, it must live in Zustand or React Context — not in props. Ask before threading a prop more than 2 levels deep.

---

## 4. Game Engine Rules

### No Hardcoded Boards
Never hardcode puzzle layouts. Every game has an algorithmic generator in `lib/generators/[game]Generator.ts` that accepts a `seed: number` and returns a deterministic board.

### Generator Interface (all games must conform)
```typescript
interface GeneratorResult {
  board: unknown[][];     // Game-specific board type
  solution: unknown[][];  // Correct solution
  seed: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

function generateBoard(seed: number, difficulty: Difficulty): GeneratorResult
```

### XP Engine (`lib/xp.ts`)
```typescript
// Max XP per stage
const MAX_XP = 1000;

// Linear decay: XP = MAX_XP - (elapsed_seconds * decayRate)
// decayRate varies by difficulty
const DECAY_RATES = { easy: 0.5, medium: 1.0, hard: 1.5 };

// Hint penalty: each hint costs 25% of MAX_XP, applied immediately
const HINT_PENALTY = MAX_XP * 0.25; // = 250 XP per hint

// XP can reach 0 but never go negative
function computeXP(elapsedSeconds: number, hintsUsed: number, difficulty: Difficulty): number
```

### Progression (100 Stages per Game)
- Stages 1–30: Easy
- Stages 31–70: Medium  
- Stages 71–100: Hard

Stage unlock logic must live in `features/progression/useProgression.ts`, not in any game component.

---

## 5. Internationalization (i18n) Rules

- All user-facing strings must use `i18next` `t()` function — no hardcoded English strings in components.
- RTL layout is automatic: `useRTL.ts` reads the current language and sets `document.dir`. All components use Tailwind `rtl:` variants.
- Language preference is stored in Zustand (`useSettingsStore`) and synced to Supabase `profiles.lang_pref` on change.
- Translation files live in `public/locales/[lang]/common.json`.

---

## 6. Sound & Haptics Engine (`hooks/useSoundEngine.ts`)

All audio and vibration must route through this single hook. No component should call `new Audio()` or `navigator.vibrate()` directly.

```typescript
interface SoundEngine {
  playClick(): void;       // Subtle click for grid interactions
  playSuccess(): void;     // High-pitched chime for stage completion
  playError(): void;       // Muted thud for wrong moves
  isSilent: boolean;       // Reads from useSettingsStore
}
```

Silent Mode toggle lives in Navbar/Settings and writes to `useSettingsStore.silentMode`. The engine checks this flag before every sound/vibration call.

---

## 7. Database Rules (Supabase)

### Schema (do not alter table names)
```sql
profiles      -- id, username, avatar_url, lang_pref, is_silent_mode, subscription_status
games         -- id, slug, description, active
stages        -- id, game_id, difficulty_level, seed_data, max_xp
scores        -- id, user_id, stage_id, xp_earned, time_taken, completed_at
family_groups -- id, admin_id, member_limit, invite_code
```

### Query Rules
- All Supabase queries must go through TanStack Query hooks in `features/` or `hooks/`.
- Never call `supabase` directly inside a component. Always call it inside a hook.
- Row Level Security (RLS) must be enabled on all tables. Never disable RLS to fix a bug — fix the policy instead.

---

## 8. Subscription & Payments (Paddle)

Plans (do not change slugs):
- `individual` — $2/month, 1 member
- `family_s` — $5/month, 3 members
- `family_l` — $10/month, 7 members

Subscription status is stored in `profiles.subscription_status`. Gate premium content by reading this field via `useUserStore` — never trust client-side-only checks for access control. Validate subscription server-side in API routes.

---

## 9. Social & Sharing Rules

### Challenge URL Format
```
mindstate.app/play/[game-slug]?seed=[seed-id]
```
The seed must be reproducible: the same seed always generates the same board.

### Realtime Goal Celebrations
Implemented in `hooks/useRealtimeGoals.ts` via Supabase Realtime channel subscriptions. Triggers a Framer Motion overlay notification — not a browser alert or toast library.

---

## 10. Refactoring Protocol

Before adding any new feature to an existing file:
1. Check the file's line count. If it's over 120 lines, refactor first.
2. Check the number of `useState` calls. If more than 2, extract to a custom hook.
3. Never delete existing functionality unless explicitly asked. Comment it out with a `// TODO: [reason]` tag instead.

When asked to refactor, output a list of proposed changes before writing any code. Wait for approval.

---

## 11. The Blueprint Phase (Mandatory for New Features)

Before writing any code for a new feature:

1. **Blueprint first:** List all components, hooks, and utility files you plan to create. State which existing files will be modified.
2. **Wait for approval** before writing a single line of code.
3. **File by file:** Once approved, implement one file at a time.
4. **Review phase:** After completing a feature, check: "Does this structure follow CLAUDE.md? If not, suggest a refactor."

Example prompt to trigger Blueprint Phase:
> "Claude, I want to add [Feature]. List the components and hooks you suggest creating first. Do not write code yet."

---

## 12. Anti-Patterns (Never Do These)

| Anti-Pattern | Forbidden Because | Correct Alternative |
|---|---|---|
| God Components | Undebuggable, violates single responsibility | Split into feature folder with sub-components |
| Prop drilling 3+ levels | Brittle, hard to refactor | Zustand store or React Context |
| Hardcoded puzzle boards | Doesn't scale to 600 stages | Algorithmic seed generator |
| `any` TypeScript type | Defeats type safety | Specific interface or `unknown` |
| Raw `<button>` in feature components | Inconsistent styling | `components/ui/Button.tsx` |
| `new Audio()` in components | Bypasses silent mode | `useSoundEngine` hook |
| Direct `supabase` calls in components | Bypasses React Query cache | Hook with `useQuery` / `useMutation` |
| Hardcoded English strings | Breaks i18n | `t('key')` from i18next |
| CSS files for layout | Conflicts with Tailwind | Tailwind classes only |
| "Make it look better" (vague instruction) | Claude will guess wrong | Specify exact Tailwind classes and values |

---

## 13. PWA Configuration

- `next-pwa` configured in `next.config.ts`.
- `theme_color`: `#121212`
- Icons: `/public/icons/icon-192.png` and `/public/icons/icon-512.png` (the MindState brain mascot).
- Offline strategy: Cache game assets and the last 3 played stages.

---

## 14. Session Startup Checklist

At the start of every new chat session, confirm:
- [ ] You have read this entire CLAUDE.md file.
- [ ] You will not exceed 150 lines per component.
- [ ] You will use Blueprint Phase before any new feature.
- [ ] You will route all audio through `useSoundEngine`.
- [ ] You will use Tailwind for all styling — no new CSS files.
- [ ] You will use TanStack Query for all Supabase data fetching.

---

*Last updated: MindState v1 specification. Update this file whenever the architecture changes.*
