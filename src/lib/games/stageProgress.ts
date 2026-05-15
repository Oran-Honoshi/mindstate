// Stage progress persistence — saves last reached stage per game
// Uses localStorage so progress survives page refreshes

const PREFIX = "mindstate-stage-";

export function getLastStage(gameSlug: string): number {
  if (typeof window === "undefined") return 1;
  return parseInt(localStorage.getItem(`${PREFIX}${gameSlug}`) ?? "1");
}

export function saveLastStage(gameSlug: string, stage: number): void {
  if (typeof window === "undefined") return;
  const current = getLastStage(gameSlug);
  // Only advance — never go backwards
  if (stage > current) {
    localStorage.setItem(`${PREFIX}${gameSlug}`, String(stage));
  }
}

export function getCompletedStages(gameSlug: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(`${PREFIX}${gameSlug}-completed`);
  if (!raw) return new Set();
  return new Set(JSON.parse(raw) as number[]);
}

export function markStageCompleted(gameSlug: string, stage: number): void {
  if (typeof window === "undefined") return;
  const completed = getCompletedStages(gameSlug);
  completed.add(stage);
  localStorage.setItem(`${PREFIX}${gameSlug}-completed`, JSON.stringify([...completed]));
  saveLastStage(gameSlug, stage + 1); // next stage becomes current
}
