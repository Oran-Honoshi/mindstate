export type Cell = "S" | "M" | null;
export type ConstraintType = "same" | "diff";

export interface CellConstraint {
  row1: number; col1: number; row2: number; col2: number; type: ConstraintType;
}

export interface TangoBoard {
  size: number; solution: Cell[][]; puzzle: Cell[][];
  constraints: CellConstraint[]; seed: string; difficulty: "easy" | "medium" | "hard";
}

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
  for (let i = 0; i < seed.length; i++) hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function canPlace(board: Cell[][], size: number, r: number, c: number, sym: Cell): boolean {
  const half = size / 2;
  board[r][c] = sym;

  let s = 0, m = 0;
  for (let cc = 0; cc < size; cc++) {
    if (board[r][cc] === "S") s++;
    if (board[r][cc] === "M") m++;
  }
  if (s > half || m > half) { board[r][c] = null; return false; }
  for (let cc = Math.max(0, c - 2); cc <= Math.min(size - 3, c); cc++) {
    if (board[r][cc] !== null && board[r][cc] === board[r][cc+1] && board[r][cc] === board[r][cc+2]) {
      board[r][c] = null; return false;
    }
  }

  s = 0; m = 0;
  for (let rr = 0; rr < size; rr++) {
    if (board[rr][c] === "S") s++;
    if (board[rr][c] === "M") m++;
  }
  if (s > half || m > half) { board[r][c] = null; return false; }
  for (let rr = Math.max(0, r - 2); rr <= Math.min(size - 3, r); rr++) {
    if (board[rr][c] !== null && board[rr][c] === board[rr+1][c] && board[rr][c] === board[rr+2][c]) {
      board[r][c] = null; return false;
    }
  }

  board[r][c] = null;
  return true;
}

function solve(board: Cell[][], size: number, rng: () => number, maxIter = 200000): boolean {
  let iter = 0;
  function bt(pos: number): boolean {
    if (++iter > maxIter) return false;
    if (pos === size * size) return true;
    const r = Math.floor(pos / size);
    const c = pos % size;
    if (board[r][c] !== null) return bt(pos + 1);
    const syms: Cell[] = rng() > 0.5 ? ["S", "M"] : ["M", "S"];
    for (const sym of syms) {
      if (canPlace(board, size, r, c, sym)) {
        board[r][c] = sym;
        if (bt(pos + 1)) return true;
        board[r][c] = null;
      }
    }
    return false;
  }
  return bt(0);
}

function enumValidRows(size: number): Cell[][] {
  const half = size / 2;
  const results: Cell[][] = [];
  function gen(row: Cell[], pos: number) {
    if (pos === size) {
      const s = row.filter(x => x === "S").length;
      const m = row.filter(x => x === "M").length;
      if (s !== half || m !== half) return;
      for (let i = 0; i < size - 2; i++) {
        if (row[i] === row[i+1] && row[i] === row[i+2]) return;
      }
      results.push([...row]);
      return;
    }
    gen([...row, "S"], pos + 1);
    gen([...row, "M"], pos + 1);
  }
  gen([], 0);
  return results;
}

function seedBoard(board: Cell[][], size: number, rng: () => number) {
  const validRows = enumValidRows(size);
  const shuffled = [...validRows].sort(() => rng() - 0.5);
  if (shuffled.length === 0) return;
  board[0] = [...shuffled[0]];
  for (const candidate of shuffled.slice(1)) {
    let diffs = 0;
    for (let c = 0; c < size; c++) if (candidate[c] !== board[0][c]) diffs++;
    if (diffs >= 2) { board[1] = [...candidate]; break; }
  }
}

function generateConstraints(solution: Cell[][], size: number, rng: () => number, count: number): CellConstraint[] {
  const pairs: Array<[number,number,number,number]> = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (c + 1 < size) pairs.push([r, c, r, c+1]);
    if (r + 1 < size) pairs.push([r, c, r+1, c]);
  }
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.slice(0, count).map(([r1,c1,r2,c2]) => ({
    row1: r1, col1: c1, row2: r2, col2: c2,
    type: solution[r1][c1] === solution[r2][c2] ? "same" : "diff",
  }));
}

function maskPuzzle(solution: Cell[][], size: number, rng: () => number, revealRatio: number): Cell[][] {
  const puzzle = solution.map(row => [...row]);
  const indices = Array.from({ length: size * size }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const toHide = Math.floor(size * size * (1 - revealRatio));
  for (let i = 0; i < toHide; i++) {
    puzzle[Math.floor(indices[i] / size)][indices[i] % size] = null;
  }
  return puzzle;
}

const SETTINGS = {
  easy:   { size: 4, revealRatio: 0.50, constraintCount: 6 },
  medium: { size: 6, revealRatio: 0.40, constraintCount: 10 },
  hard:   { size: 8, revealRatio: 0.35, constraintCount: 16 },
};

export function generateTangoBoard(seed: string, difficulty: "easy" | "medium" | "hard"): TangoBoard {
  const { size, revealRatio, constraintCount } = SETTINGS[difficulty];
  const rng = mulberry32(seedToNumber(seed));

  const solution: Cell[][] = Array.from({ length: size }, () => Array(size).fill(null));
  seedBoard(solution, size, rng);
  const ok = solve(solution, size, rng);

  if (!ok) {
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) solution[r][c] = null;
    solve(solution, size, () => 0.3);
  }

  return {
    size, solution,
    puzzle: maskPuzzle(solution, size, rng, revealRatio),
    constraints: generateConstraints(solution, size, rng, constraintCount),
    seed, difficulty,
  };
}

export type CellStatus = "correct" | "incorrect" | "empty" | "given";

export function validateBoard(puzzle: Cell[][], playerBoard: Cell[][], solution: Cell[][]): CellStatus[][] {
  return puzzle.map((row, r) => row.map((given, c) => {
    if (given !== null) return "given";
    if (playerBoard[r][c] === null) return "empty";
    return playerBoard[r][c] === solution[r][c] ? "correct" : "incorrect";
  }));
}

export function buildSeed(game: string, difficulty: string, stage: number): string {
  return `${game}-${difficulty}-${stage}`;
}