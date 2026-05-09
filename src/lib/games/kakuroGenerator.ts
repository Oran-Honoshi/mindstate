export type KakuroCell =
  | { type: "black" }
  | { type: "clue"; down?: number; right?: number }
  | { type: "white"; value: number | null };

export type KakuroBoard = {
  size: number;
  grid: KakuroCell[][];
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
function seedToNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Generate a valid Kakuro solution then build clues from it
export function generateKakuro(seed: string, difficulty: "easy" | "medium" | "hard"): KakuroBoard {
  const size = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 10;
  const rng = mulberry32(seedToNum(seed));

  // Fill solution grid with valid numbers (1-9, no repeats in runs)
  const solution: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  const isWhite: boolean[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      if (r === 0 || c === 0) return false;
      return rng() > 0.3;
    })
  );

  // Fill white cells with valid values
  function fillRun(cells: [number, number][]): boolean {
    if (!cells.length) return true;
    const [r, c] = cells[0];
    const used = new Set<number>();
    cells.forEach(([r2, c2]) => { if (solution[r2][c2] > 0) used.add(solution[r2][c2]); });
    const nums = [1,2,3,4,5,6,7,8,9].filter(n => !used.has(n));
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    for (const n of nums) {
      solution[r][c] = n;
      if (fillRun(cells.slice(1))) return true;
      solution[r][c] = 0;
    }
    return false;
  }

  // Fill row runs
  for (let r = 1; r < size; r++) {
    let run: [number,number][] = [];
    for (let c = 1; c <= size; c++) {
      if (c < size && isWhite[r][c]) {
        run.push([r, c]);
      } else {
        if (run.length >= 2) fillRun(run);
        else run.forEach(([r2,c2]) => { isWhite[r2][c2] = false; });
        run = [];
      }
    }
  }

  // Build grid
  const grid: KakuroCell[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      if (!isWhite[r][c]) return { type: "black" } as KakuroCell;
      return { type: "white", value: null } as KakuroCell;
    })
  );

  // Add clues
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isWhite[r][c]) continue;
      let right: number | undefined;
      let down: number | undefined;

      // Right clue
      if (c + 1 < size && isWhite[r][c + 1]) {
        let sum = 0; let cc = c + 1;
        while (cc < size && isWhite[r][cc]) { sum += solution[r][cc]; cc++; }
        if (sum > 0) right = sum;
      }

      // Down clue
      if (r + 1 < size && isWhite[r + 1][c]) {
        let sum = 0; let rr = r + 1;
        while (rr < size && isWhite[rr][c]) { sum += solution[rr][c]; rr++; }
        if (sum > 0) down = sum;
      }

      if (right !== undefined || down !== undefined) {
        grid[r][c] = { type: "clue", right, down };
      }
    }
  }

  return { size, grid, seed, difficulty };
}

export function checkKakuro(board: KakuroBoard, userGrid: (number|null)[][]): boolean {
  const { size, grid } = board;
  // Check all runs
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = grid[r][c];
      if (cell.type !== "clue") continue;
      const clue = cell as { type:"clue"; right?:number; down?:number };

      if (clue.right !== undefined) {
        const run: (number|null)[] = [];
        for (let cc = c + 1; cc < size && grid[r][cc]?.type === "white"; cc++) run.push(userGrid[r][cc]);
        if (run.some(v => v === null)) return false;
        if (run.reduce((s: number, v) => s + (v??0), 0) !== clue.right) return false;
        if (new Set(run).size !== run.length) return false;
      }

      if (clue.down !== undefined) {
        const run: (number|null)[] = [];
        for (let rr = r + 1; rr < size && grid[rr][c]?.type === "white"; rr++) run.push(userGrid[rr][c]);
        if (run.some(v => v === null)) return false;
        if (run.reduce((s: number, v) => s + (v??0), 0) !== clue.down) return false;
        if (new Set(run).size !== run.length) return false;
      }
    }
  }
  return true;
}
