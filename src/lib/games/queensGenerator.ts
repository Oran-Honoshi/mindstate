export type QueensBoard = {
  size: number;
  regions: number[][];
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
function seedToNumber(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Count valid queen placements — must equal exactly 1
function countQueenSolutions(size: number, regions: number[][]): number {
  let count = 0;
  const usedCols = new Set<number>();
  const usedRegions = new Set<number>();

  function bt(row: number, placed: [number,number][]): void {
    if (count > 1) return; // stop early
    if (row === size) { count++; return; }
    for (let col = 0; col < size; col++) {
      if (usedCols.has(col)) continue;
      const reg = regions[row][col];
      if (usedRegions.has(reg)) continue;
      // Check no adjacency with any placed queen
      let ok = true;
      for (const [qr, qc] of placed) {
        if (Math.abs(qr - row) <= 1 && Math.abs(qc - col) <= 1) { ok = false; break; }
      }
      if (!ok) continue;
      usedCols.add(col); usedRegions.add(reg);
      bt(row + 1, [...placed, [row, col]]);
      usedCols.delete(col); usedRegions.delete(reg);
      if (count > 1) return;
    }
  }
  bt(0, []);
  return count;
}

// Find the unique solution
export function solveQueens(size: number, regions: number[][]): [number,number][] | null {
  const usedCols = new Set<number>();
  const usedRegions = new Set<number>();
  const result: [number,number][] = [];

  function bt(row: number): boolean {
    if (row === size) return true;
    for (let col = 0; col < size; col++) {
      if (usedCols.has(col)) continue;
      const reg = regions[row][col];
      if (usedRegions.has(reg)) continue;
      let ok = true;
      for (const [qr, qc] of result) {
        if (Math.abs(qr - row) <= 1 && Math.abs(qc - col) <= 1) { ok = false; break; }
      }
      if (!ok) continue;
      usedCols.add(col); usedRegions.add(reg); result.push([row, col]);
      if (bt(row + 1)) return true;
      usedCols.delete(col); usedRegions.delete(reg); result.pop();
    }
    return false;
  }
  return bt(0) ? [...result] : null;
}

function generateRegions(size: number, queens: [number,number][], rng: () => number): number[][] {
  const regions = Array.from({ length: size }, () => Array(size).fill(-1));
  queens.forEach(([r, c], i) => { regions[r][c] = i; });
  const queue: [number, number, number][] = queens.map(([r, c], i) => [r, c, i]);
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  while (queue.length > 0) {
    const idx = Math.floor(rng() * queue.length);
    const [r, c, region] = queue[idx];
    queue.splice(idx, 1);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size || regions[nr][nc] !== -1) continue;
      regions[nr][nc] = region;
      queue.push([nr, nc, region]);
    }
  }
  return regions;
}

function placeQueensForRegions(size: number, rng: () => number): [number,number][] | null {
  const cols = new Set<number>();
  const result: [number,number][] = [];
  function bt(row: number): boolean {
    if (row === size) return true;
    for (const col of shuffle(Array.from({length:size},(_,i)=>i), rng)) {
      if (cols.has(col)) continue;
      let ok = true;
      for (const [qr,qc] of result) {
        if (Math.abs(qr-row)<=1 && Math.abs(qc-col)<=1) { ok=false; break; }
      }
      if (!ok) continue;
      cols.add(col); result.push([row,col]);
      if (bt(row+1)) return true;
      cols.delete(col); result.pop();
    }
    return false;
  }
  return bt(0) ? [...result] : null;
}

const SIZES = { easy: 6, medium: 8, hard: 10 };

export function generateQueensBoard(seed: string, difficulty: "easy"|"medium"|"hard"): QueensBoard {
  const size = SIZES[difficulty];
  const rng = mulberry32(seedToNumber(seed));
  let fallback: number[][] | null = null;

  // Try many region configurations until we find one with exactly 1 solution
  for (let attempt = 0; attempt < 500; attempt++) {
    const queens = placeQueensForRegions(size, rng);
    if (!queens) continue;
    const regions = generateRegions(size, queens, rng);
    const solutions = countQueenSolutions(size, regions);
    if (solutions === 1) {
      return { size, regions, seed, difficulty };
    }
    // Save first solvable board in case we can't find a unique one
    if (solutions > 0 && !fallback) fallback = regions;
  }

  // Use any solvable board rather than returning an unverified one
  if (fallback) return { size, regions: fallback, seed, difficulty };
  const rng2 = mulberry32(seedToNumber(seed) ^ 0xDEADBEEF);
  const queens = placeQueensForRegions(size, rng2) ?? Array.from({length:size},(_,i)=>[i,i] as [number,number]);
  return { size, regions: generateRegions(size, queens, rng2), seed, difficulty };
}

// Validate: check all queen constraints (used by game page)
export function validateQueens(board: QueensBoard, grid: number[][]): boolean {
  const size = board.size;
  const queens: [number,number][] = [];
  grid.forEach((row,r) => row.forEach((v,c) => { if(v===2) queens.push([r,c]); }));
  if (queens.length !== size) return false;

  const rows = new Set(queens.map(([r])=>r));
  const cols = new Set(queens.map(([,c])=>c));
  const regs = new Set(queens.map(([r,c])=>board.regions[r][c]));
  if (rows.size!==size || cols.size!==size || regs.size!==size) return false;

  for (let i=0; i<queens.length; i++) {
    for (let j=i+1; j<queens.length; j++) {
      const [r1,c1]=queens[i],[r2,c2]=queens[j];
      if (Math.abs(r1-r2)<=1 && Math.abs(c1-c2)<=1) return false;
    }
  }
  return true;
}
