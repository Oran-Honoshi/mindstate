# 08 · Data model

State that the app needs. Designed for local-only v1 but lifts cleanly to a backend.

## Stores (Zustand)

### `useSettings`

User preferences. Persisted to `localStorage["cc.settings"]`.

```ts
interface SettingsState {
  // identity
  name: string;          // "Yael K."
  avatar: string;        // initials or url
  intent: "sharpen" | "climb" | "calm";

  // appearance
  theme: "light" | "dark" | "paper";

  // gameplay
  difficulty: "straight" | "mix";
  mapStyle: "ascent" | "squares" | "winding" | "constellation";  // v1: only "ascent"

  // notifications
  notifications: boolean;
  notifyAt: string;      // "08:00"

  // bookkeeping
  onboardingComplete: boolean;
  termsAcceptedAt: number;  // epoch ms
}
```

### `useProgress`

Per-game progress. Persisted to `localStorage["cc.progress"]`.

```ts
type GameSlug = "tango" | "memory" | "crowns" | "sudoku" /* future */;

interface ProgressState {
  byGame: Record<GameSlug, {
    cleared: Set<number>;            // stages cleared
    medaled: Set<number>;            // gold-medaled stages
    bestTimes: Record<number, number>; // stage -> ms
    currentStage: number;            // next to play (resume target)
    mixedOrderIndex: number;         // pointer into the mixed permutation
  }>;

  totalXp: number;
  streakDays: number;
  lastPlayedAt: number;              // epoch ms (for streak calc)
  recentGame: GameSlug;              // for the hamburger's "Stage map" link
}
```

> Serializing Sets: write a custom localStorage middleware that converts Set → array on save and back on load.

### `useUi` (transient)

Not persisted. Holds in-flight UI state (drawer open, current modal, toast queue).

```ts
interface UiState {
  drawerOpen: boolean;
  toast: { id: string; text: string; tone?: "info"|"warn"|"error" } | null;
  modal: "theme" | "difficulty" | "mapStyle" | null;
}
```

## XP & medaling rules

```
Stage completed:
  base XP        = difficulty === "easy" ? 60 : "medium" ? 100 : 140
  daily x2       = isDailyChallenge ? × 2 : × 1
  no-hint bonus  = hintsUsed === 0 ? + 20 : 0
  speed bonus    = time < 0.6 × parTime ? + 30 : 0

  totalXp += base * daily + no-hint + speed

Medal threshold:
  GOLD   = hintsUsed === 0 && time < 0.7 × parTime
  SILVER = hintsUsed <= 1 && time < parTime
  BRONZE = stage cleared
```

`parTime` per stage is a lookup: easy 120s, medium 180s, hard 300s. Stored alongside the puzzle definition.

## Streak

Compute on app launch:

```ts
function recomputeStreak(state: ProgressState): number {
  const today = startOfDay(Date.now());
  const last  = startOfDay(state.lastPlayedAt || 0);
  const oneDay = 86_400_000;
  if (today - last === 0)        return state.streakDays;     // already played
  if (today - last === oneDay)   return state.streakDays + 1; // continued
  if (today - last > oneDay)     return 0;                    // broken
  return state.streakDays;
}
```

Update `lastPlayedAt` and `streakDays` after any stage completes.

## Routes & deep links

| Route                       | Screen           | Notes                                    |
|-----------------------------|------------------|------------------------------------------|
| `/`                         | Landing          | Public                                   |
| `/onboarding`               | Onboarding       | Step is internal; not in URL             |
| `/home`                     | Home             | Default after onboarding                 |
| `/stages/:slug`             | StageMap         | `slug` ∈ {tango, memory, crowns}         |
| `/play/:slug/:stage`        | Game             | `stage` is a number 1-100                |
| `/complete/:slug/:stage`    | Complete         | Shown after a win                        |
| `/league`                   | Leaderboard      |                                          |
| `/profile`                  | Profile          |                                          |
| `/settings/difficulty`      | DifficultyPicker | Modal-like, but real route               |
| `/paywall`                  | Paywall          |                                          |

Use `react-router-dom`. Protect everything behind `/onboarding` with a guard that redirects to `/onboarding` if `settings.onboardingComplete === false`.

## Per-stage puzzle data

Don't ship 100 hand-authored puzzles. Generate deterministically:

```ts
function getPuzzle(slug: GameSlug, stage: number) {
  const seed = hash(`${slug}-${stage}`);
  switch (slug) {
    case "tango":  return generateTangoPuzzle(seed, difficultyFor(stage));
    case "memory": return generateMemoryPuzzle(seed, difficultyFor(stage));
    case "crowns": return generateCrownsPuzzle(seed, difficultyFor(stage));
  }
}

function difficultyFor(stage: number): "easy" | "medium" | "hard" {
  if (stage <= 30) return "easy";
  if (stage <= 70) return "medium";
  return "hard";
}
```

Puzzles must be guaranteed solvable. Each generator should:
1. Build a valid full solution.
2. Remove cells according to difficulty (preserving uniqueness for Tango/Crowns).
3. Run the solver to verify uniqueness; if not unique, repeat from step 2 with a different random removal.

## Future backend contract

When you add a backend, the same shapes work as POST/GET payloads:

```
GET  /api/me                      → { settings, progress, leaderboardRank }
POST /api/stage-complete          { slug, stage, time, hints, result } → { newXp, medal, streak }
GET  /api/league/:scope           → { rows: [...] }
POST /api/subscription/checkout   → { url }
```

Wrap network calls in `src/lib/api.ts` so swapping local → remote is a single-file change.
