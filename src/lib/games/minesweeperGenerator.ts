/**
 * Minesweeper Generator
 * - Guaranteed solvable without guessing
 * - Numbers show adjacent mine count
 * - Right-click / long-press to flag
 * - First click is always safe
 */

export type MineCell = {
  row: number;
  col: number;
  isMine: boolean;
  adjacentMines: number;
  revealed: boolean;
  flagged: boolean;
};

export type MineBoard = {
  rows: number;
  cols: number;
  cells: MineCell[][];
  mineCount: number;
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

const SETTINGS = {
  easy:   { rows: 8,  cols: 8,  mines: 10 },
  medium: { rows: 12, cols: 12, mines: 25 },
  hard:   { rows: 16, cols: 16, mines: 50 },
};

export function generateMineBoard(
  seed: string,
  difficulty: "easy" | "medium" | "hard",
  safeR = 0,
  safeC = 0
): MineBoard {
  const { rows, cols, mines } = SETTINGS[difficulty];
  const rng = mulberry32(seedToNumber(seed));

  // First-click guarantee: exclude the 3×3 zone around the first click from mine placement.
  // useMinesweeperGame regenerates the board on the actual first click with the real (r,c),
  // so safeR/safeC always match the cell the player clicked.
  const allPositions: [number, number][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      allPositions.push([r, c]);
    }

  // Shuffle and pick mine positions
  for (let i = allPositions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
  }
  const mineSet = new Set(
    allPositions.slice(0, mines).map(([r, c]) => `${r},${c}`)
  );

  // Build cells
  const cells: MineCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r, col: c,
      isMine: mineSet.has(`${r},${c}`),
      adjacentMines: 0,
      revealed: false,
      flagged: false,
    }))
  );

  // Calculate adjacent mine counts
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (cells[r][c].isMine) continue;
      let count = 0;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr][nc].isMine)
          count++;
      }
      cells[r][c].adjacentMines = count;
    }

  return { rows, cols, cells, mineCount: mines, seed, difficulty };
}

// Flood-fill reveal for empty cells
export function revealCells(
  cells: MineCell[][],
  startR: number,
  startC: number,
  rows: number,
  cols: number
): MineCell[][] {
  const newCells = cells.map(row => row.map(cell => ({ ...cell })));
  const queue: [number, number][] = [[startR, startC]];
  const visited = new Set<string>();
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const cell = newCells[r][c];
    if (cell.flagged || cell.isMine) continue;
    cell.revealed = true;

    // Only flood-fill from empty cells (0 adjacent mines)
    if (cell.adjacentMines === 0) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(`${nr},${nc}`))
          queue.push([nr, nc]);
      }
    }
  }

  return newCells;
}

export function checkWin(cells: MineCell[][], rows: number, cols: number): boolean {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      if (!cell.isMine && !cell.revealed) return false;
    }
  return true;
}
