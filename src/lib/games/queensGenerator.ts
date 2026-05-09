/**
 * Queens Generator
 * Rules:
 * - NxN grid divided into N colored regions
 * - Place exactly one queen per row, per column, and per color region
 * - No two queens can touch — not even diagonally
 */

export type QueensBoard = {
  size: number;
  regions: number[][];   // each cell has a region id (0..size-1)
  solution: [number, number][]; // queen positions [row, col]
  seed: string;
  difficulty: "easy" | "medium" | "hard";
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedToNumber(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate a valid queen placement (one per row, col, no adjacency)
function solveQueens(size: number, rng: () => number): [number, number][] | null {
  const cols = new Set<number>();
  const result: [number, number][] = [];

  function backtrack(row: number): boolean {
    if (row === size) return true;
    const shuffledCols = shuffle(Array.from({ length: size }, (_, i) => i), rng);
    for (const col of shuffledCols) {
      if (cols.has(col)) continue;
      // Check diagonal adjacency with all placed queens
      let valid = true;
      for (const [qr, qc] of result) {
        if (Math.abs(qr - row) <= 1 && Math.abs(qc - col) <= 1) {
          valid = false; break;
        }
      }
      if (!valid) continue;
      cols.add(col);
      result.push([row, col]);
      if (backtrack(row + 1)) return true;
      cols.delete(col);
      result.pop();
    }
    return false;
  }

  return backtrack(0) ? result : null;
}

// Flood-fill based region generation centered on queen positions
function generateRegions(size: number, queens: [number, number][], rng: () => number): number[][] {
  const regions = Array.from({ length: size }, () => Array(size).fill(-1));
  const queenMap = new Map<string, number>();
  queens.forEach(([r, c], i) => {
    regions[r][c] = i;
    queenMap.set(`${r},${c}`, i);
  });

  // BFS grow regions from queen seeds
  const queue: Array<[number, number, number]> = queens.map(([r, c], i) => [r, c, i]);
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

  while (queue.length > 0) {
    // Pick random element for organic shapes
    const idx = Math.floor(rng() * queue.length);
    const [r, c, region] = queue[idx];
    queue.splice(idx, 1);

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      if (regions[nr][nc] !== -1) continue;
      regions[nr][nc] = region;
      queue.push([nr, nc, region]);
    }
  }

  return regions;
}

const SIZES = { easy: 6, medium: 8, hard: 10 };

export function generateQueensBoard(seed: string, difficulty: "easy" | "medium" | "hard"): QueensBoard {
  const size = SIZES[difficulty];
  const rng = mulberry32(seedToNumber(seed));

  let queens: [number, number][] | null = null;
  let attempts = 0;
  while (!queens && attempts < 100) {
    queens = solveQueens(size, rng);
    attempts++;
  }
  if (!queens) queens = Array.from({ length: size }, (_, i) => [i, i] as [number, number]);

  const regions = generateRegions(size, queens, rng);

  return { size, regions, solution: queens, seed, difficulty };
}

export type QueenStatus = "empty" | "queen" | "marked" | "error";

export function validateQueens(
  placed: Map<string, boolean>,
  solution: [number, number][]
): { correct: boolean; errors: Set<string> } {
  const errors = new Set<string>();
  const queenCells = Array.from(placed.entries())
    .filter(([, isQueen]) => isQueen)
    .map(([key]) => key.split(",").map(Number) as [number, number]);

  // Check conflicts
  for (let i = 0; i < queenCells.length; i++) {
    for (let j = i + 1; j < queenCells.length; j++) {
      const [r1, c1] = queenCells[i];
      const [r2, c2] = queenCells[j];
      if (r1 === r2 || c1 === c2 || (Math.abs(r1-r2) === 1 && Math.abs(c1-c2) === 1)) {
        errors.add(`${r1},${c1}`);
        errors.add(`${r2},${c2}`);
      }
    }
  }

  const correct = queenCells.length === solution.length &&
    solution.every(([r, c]) => placed.get(`${r},${c}`) === true) &&
    errors.size === 0;

  return { correct, errors };
}
