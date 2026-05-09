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

function isValid(board: Cell[][], size: number): boolean {
  const half = size / 2;
  for (let r = 0; r < size; r++) {
    let s = 0, m = 0;
    for (let c = 0; c < size; c++) { if (board[r][c] === "S") s++; if (board[r][c] === "M") m++; }
    if (s > half || m > half) return false;
    for (let c = 0; c < size - 2; c++)
      if (board[r][c] !== null && board[r][c] === board[r][c+1] && board[r][c] === board[r][c+2]) return false;
  }
  for (let c = 0; c < size; c++) {
    let s = 0, m = 0;
    for (let r = 0; r < size; r++) { if (board[r][c] === "S") s++; if (board[r][c] === "M") m++; }
    if (s > half || m > half) return false;
    for (let r = 0; r < size - 2; r++)
      if (board[r][c] !== null && board[r][c] === board[r+1][c] && board[r][c] === board[r+2][c]) return false;
  }
  return true;
}

function isSolved(board: Cell[][], size: number): boolean {
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (board[r][c] === null) return false;
  return isValid(board, size);
}

function solve(board: Cell[][], size: number, rng: () => number): boolean {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null) {
        const syms: Cell[] = rng() > 0.5 ? ["S", "M"] : ["M", "S"];
        for (const sym of syms) {
          board[r][c] = sym;
          if (isValid(board, size) && solve(board, size, rng)) return true;
          board[r][c] = null;
        }
        return false;
      }
    }
  }
  return isSolved(board, size);
}

function generateConstraints(solution: Cell[][], size: number, rng: () => number, count: number): CellConstraint[] {
  const pairs: Array<[number,number,number,number]> = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (c + 1 < size) pairs.push([r, c, r, c+1]);
    if (r + 1 < size) pairs.push([r, c, r+1, c]);
  }
  for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
  return pairs.slice(0, count).map(([r1,c1,r2,c2]) => ({
    row1: r1, col1: c1, row2: r2, col2: c2,
    type: solution[r1][c1] === solution[r2][c2] ? "same" : "diff",
  }));
}

function maskPuzzle(solution: Cell[][], size: number, rng: () => number, revealRatio: number): Cell[][] {
  const puzzle = solution.map(row => [...row]);
  const indices = Array.from({ length: size * size }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
  for (let i = 0; i < Math.floor(size * size * (1 - revealRatio)); i++) {
    puzzle[Math.floor(indices[i] / size)][indices[i] % size] = null;
  }
  return puzzle;
}

const SETTINGS = {
  easy: { size: 4, revealRatio: 0.50, constraintCount: 4 },
  medium: { size: 6, revealRatio: 0.35, constraintCount: 6 },
  hard: { size: 8, revealRatio: 0.25, constraintCount: 8 },
};

export function generateTangoBoard(seed: string, difficulty: "easy" | "medium" | "hard"): TangoBoard {
  const { size, revealRatio, constraintCount } = SETTINGS[difficulty];
  const rng = mulberry32(seedToNumber(seed));
  const solution: Cell[][] = Array.from({ length: size }, () => Array(size).fill(null));
  solve(solution, size, rng);
  return { size, solution, puzzle: maskPuzzle(solution, size, rng, revealRatio), constraints: generateConstraints(solution, size, rng, constraintCount), seed, difficulty };
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
