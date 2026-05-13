// Daily challenge — deterministic seed from today's date
// Same seed = same board for all players on the same day
// Resets at midnight UTC

export type GameSlug =
  | "tango" | "memory" | "queens" | "sudoku" | "zip" | "minesweeper"
  | "flow" | "nonogram" | "bridges" | "pattern-match" | "2048-pro"
  | "kakuro" | "gravity-sort" | "hex-merge" | "logic-path" | "lightup"
  | "patches" | "word-sling" | "hearts" | "solitaire";

export const DAILY_GAMES: GameSlug[] = [
  "tango","memory","queens","sudoku","zip","minesweeper",
  "flow","nonogram","bridges","pattern-match",
  "kakuro","gravity-sort","logic-path","lightup","word-sling",
];

export function getDailySeed(game: string, date?: Date): string {
  const d = date ?? new Date();
  const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
  return `daily-${game}-${dateStr}`;
}

export function getDailyDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function isDailyCompleted(game: string, userId: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `mindstate-daily-${game}-${getDailyDate()}-${userId}`;
  return localStorage.getItem(key) === "done";
}

export function markDailyCompleted(game: string, userId: string): void {
  if (typeof window === "undefined") return;
  const key = `mindstate-daily-${game}-${getDailyDate()}-${userId}`;
  localStorage.setItem(key, "done");
}

export type DailyDifficulty = "easy" | "medium" | "hard";

// Returns a stage number AND difficulty that rotates through the week
// Mon/Thu = Easy (1–300), Tue/Fri = Medium (301–700), Wed/Sat/Sun = Hard (701–1000)
export function getDailyStageInfo(game: string): { stage: number; difficulty: DailyDifficulty } {
  const dateStr = getDailyDate();
  const dayOfWeek = new Date().getDay(); // 0=Sun,1=Mon,...,6=Sat

  // Difficulty rotation: Easy Mon/Thu, Medium Tue/Fri, Hard Wed/Sat/Sun
  // Daily challenges are always Medium or Hard — never Easy
  // Medium: Mon/Wed/Fri, Hard: Tue/Thu/Sat/Sun
  const difficulty: DailyDifficulty =
    dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 ? "medium" : "hard";

  // Stage range per difficulty
  const ranges = { easy:[1,300], medium:[301,700], hard:[701,1000] };
  const [min, max] = ranges[difficulty];

  // Deterministic stage within that range from date+game hash
  let hash = 0;
  const key = dateStr + game;
  for (let i = 0; i < key.length; i++) {
    hash = (Math.imul(31, hash) + key.charCodeAt(i)) | 0;
  }
  const stage = min + (Math.abs(hash) % (max - min + 1));

  return { stage, difficulty };
}

// Keep backward compat
export function getDailyStageNumber(game: string): number {
  return getDailyStageInfo(game).stage;
}

// Get today's featured game (rotates daily)
export function getTodaysFeaturedGame(): GameSlug {
  const d = new Date();
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_GAMES[dayOfYear % DAILY_GAMES.length];
}

export function formatTimeUntilReset(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
