/**
 * Zip Game Generator
 * Rules:
 * - NxN grid with numbered cells (1..N*N or subset)
 * - Draw a continuous path that visits every cell exactly once
 * - Path must pass through numbered cells in order
 * - Player traces the path by clicking/dragging cells in sequence
 */

export type ZipCell = {
  row: number;
  col: number;
  number: number | null; // waypoint number, null = regular cell
};

export type ZipBoard = {
  size: number;
  cells: ZipCell[][];
  path: [number, number][]; // solution path in order
  waypoints: Map<string, number>; // "r,c" -> waypoint number
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

const DIRS = [[-1,0],[1,0],[0,-1],[0,1]];

function generateHamiltonianPath(size: number, rng: () => number): [number, number][] | null {
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const path: [number, number][] = [];

  // Random start cell
  const startR = Math.floor(rng() * size);
  const startC = Math.floor(rng() * size);

  function backtrack(r: number, c: number): boolean {
    visited[r][c] = true;
    path.push([r, c]);

    if (path.length === size * size) return true;

    const dirs = shuffle([...DIRS], rng);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      if (visited[nr][nc]) continue;
      if (backtrack(nr, nc)) return true;
    }

    visited[r][c] = false;
    path.pop();
    return false;
  }

  return backtrack(startR, startC) ? path : null;
}

const SETTINGS = {
  easy:   { size: 5, waypointCount: 5  },
  medium: { size: 6, waypointCount: 7  },
  hard:   { size: 7, waypointCount: 9  },
};

export function generateZipBoard(seed: string, difficulty: "easy" | "medium" | "hard"): ZipBoard {
  const { size, waypointCount } = SETTINGS[difficulty];
  const rng = mulberry32(seedToNumber(seed));

  let path: [number, number][] | null = null;
  let attempts = 0;
  while (!path && attempts < 200) {
    path = generateHamiltonianPath(size, rng);
    attempts++;
  }
  if (!path) {
    // Fallback: simple snake path
    path = [];
    for (let r = 0; r < size; r++) {
      const cols = Array.from({ length: size }, (_, c) => c);
      if (r % 2 === 1) cols.reverse();
      cols.forEach(c => path!.push([r, c]));
    }
  }

  // Explicit completeness guarantee: path must visit every cell exactly once
  if (path.length !== size * size) {
    path = [];
    for (let r = 0; r < size; r++) {
      const cols = Array.from({ length: size }, (_, c) => c);
      if (r % 2 === 1) cols.reverse();
      cols.forEach(c => (path as [number, number][]).push([r, c]));
    }
  }

  // Pick evenly spaced waypoints along the path
  const waypointIndices = new Set<number>();
  waypointIndices.add(0); // always mark start
  waypointIndices.add(path.length - 1); // always mark end
  const step = Math.floor(path.length / (waypointCount - 1));
  for (let i = 1; i < waypointCount - 1; i++) {
    waypointIndices.add(Math.min(i * step, path.length - 1));
  }

  const waypoints = new Map<string, number>();
  let wpNum = 1;
  const sortedIndices = Array.from(waypointIndices).sort((a, b) => a - b);
  sortedIndices.forEach(idx => {
    const [r, c] = path![idx];
    waypoints.set(`${r},${c}`, wpNum++);
  });

  const cells: ZipCell[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => ({
      row: r, col: c,
      number: waypoints.get(`${r},${c}`) ?? null,
    }))
  );

  return { size, cells, path, waypoints, seed, difficulty };
}

export function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

export function validateZipPath(
  playerPath: [number, number][],
  board: ZipBoard
): { valid: boolean; complete: boolean; error: string | null } {
  if (playerPath.length === 0) return { valid: true, complete: false, error: null };

  // Check adjacency
  for (let i = 1; i < playerPath.length; i++) {
    const [r1, c1] = playerPath[i - 1];
    const [r2, c2] = playerPath[i];
    if (!isAdjacent(r1, c1, r2, c2)) {
      return { valid: false, complete: false, error: "Non-adjacent cells" };
    }
  }

  // Check no repeats
  const seen = new Set(playerPath.map(([r, c]) => `${r},${c}`));
  if (seen.size !== playerPath.length) {
    return { valid: false, complete: false, error: "Repeated cell" };
  }

  // Check waypoints are hit in order
  const sortedWaypoints = Array.from(board.waypoints.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([key]) => key);

  let wpIdx = 0;
  for (const [r, c] of playerPath) {
    const key = `${r},${c}`;
    if (board.waypoints.has(key)) {
      if (key !== sortedWaypoints[wpIdx]) {
        return { valid: false, complete: false, error: "Wrong waypoint order" };
      }
      wpIdx++;
    }
  }

  const complete =
    playerPath.length === board.size * board.size &&
    wpIdx === sortedWaypoints.length;

  return { valid: true, complete, error: null };
}
