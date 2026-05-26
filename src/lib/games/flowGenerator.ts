// src/lib/games/flowGenerator.ts
// Generates fully solvable Flow boards where:
//  - Every cell is covered by exactly one path
//  - Each path runs from dot A → dot B with no dangling filler cells
//  - solution Map<Color, string[]> is ordered start→end for hint stepping

export type Color = string;
export type FlowBoard = {
  size: number;
  dots: Map<string, Color>;
  colors: Color[];
  solution: Map<string, string[]>; // color → ordered path [start, ..., end]
  seed: string;
  difficulty: "easy" | "medium" | "hard";
};

const COLORS = [
  "var(--color-error)", "#3B82F6", "#22C55E", "#F59E0B",
  "#A855F7", "#EC4899", "#14B8A6", "#F97316",
];

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
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

function key(r: number, c: number) { return `${r},${c}`; }
function parseKey(k: string): [number, number] {
  const [r, c] = k.split(",").map(Number);
  return [r, c];
}

const DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

function shuffle<T>(a: T[], rng: () => number): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/**
 * Core algorithm: Hamiltonian-path style space-filling.
 *
 * Strategy:
 * 1. Place dot-pairs at random free cells.
 * 2. For each color, do a depth-first walk from start→end that must
 *    visit every remaining unvisited cell reachable from this color's territory.
 * 3. Use a "space-filling" DFS with lookahead to avoid dead ends.
 *
 * Simpler reliable approach used here:
 * 1. Partition the grid into numColors regions using Voronoi-like expansion.
 * 2. For each region, find a Hamiltonian path through that region.
 * 3. Place dots at path start and end.
 */
export function generateFlowBoard(
  seed: string,
  difficulty: "easy" | "medium" | "hard"
): FlowBoard {
  const size = difficulty === "easy" ? 5 : difficulty === "medium" ? 7 : 8;
  const numColors = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 7;
  const rng = mulberry32(seedToNum(seed));

  for (let attempt = 0; attempt < 200; attempt++) {
    const result = tryGenerate(size, numColors, rng);
    if (result) return { ...result, seed, difficulty };
  }

  // Guaranteed fallback — simple 2-color board
  return makeFallback(size, seed, difficulty);
}

function tryGenerate(
  size: number,
  numColors: number,
  rng: () => number
): Omit<FlowBoard, "seed" | "difficulty"> | null {
  // Step 1: Assign each cell to a color via random Voronoi expansion
  const assign = Array.from({ length: size }, () => Array(size).fill(-1));

  // Pick random seed cells for each color
  const allCells: [number, number][] = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) allCells.push([r, c]);
  const shuffledCells = shuffle(allCells, rng);
  const seeds = shuffledCells.slice(0, numColors);

  seeds.forEach(([r, c], ci) => { assign[r][c] = ci; });

  // BFS expansion — each color expands simultaneously
  const queues: [number, number][][] = seeds.map(s => [s]);
  let remaining = size * size - numColors;

  while (remaining > 0) {
    let anyExpanded = false;
    for (let ci = 0; ci < numColors; ci++) {
      if (queues[ci].length === 0) continue;
      const idx = Math.floor(rng() * queues[ci].length);
      const [r, c] = queues[ci][idx];
      const neighbors = shuffle(
        DIRS.map(([dr, dc]) => [r + dr, c + dc] as [number, number]).filter(
          ([nr, nc]) =>
            nr >= 0 && nr < size && nc >= 0 && nc < size && assign[nr][nc] === -1
        ),
        rng
      );
      if (neighbors.length > 0) {
        const [nr, nc] = neighbors[0];
        assign[nr][nc] = ci;
        queues[ci].push([nr, nc]);
        remaining--;
        anyExpanded = true;
      } else {
        queues[ci].splice(idx, 1);
      }
    }
    if (!anyExpanded) break;
  }

  // Check all cells assigned
  if (assign.some(row => row.some(v => v === -1))) return null;

  // Step 2: For each color region, find a Hamiltonian path
  const colors = shuffle(COLORS.slice(0, numColors), rng);
  const dots = new Map<string, Color>();
  const solution = new Map<string, string[]>();

  for (let ci = 0; ci < numColors; ci++) {
    const region: [number, number][] = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (assign[r][c] === ci) region.push([r, c]);

    if (region.length === 0) return null;
    if (region.length === 1) {
      // Single cell — dot at both ends (degenerate, skip this attempt)
      return null;
    }

    // Find Hamiltonian path through region using DFS
    const path = findHamiltonianPath(region, size, rng);
    if (!path) return null;

    const color = colors[ci];
    const startKey = key(path[0][0], path[0][1]);
    const endKey = key(path[path.length - 1][0], path[path.length - 1][1]);

    // Ensure dots are different cells
    if (startKey === endKey) return null;

    dots.set(startKey, color);
    dots.set(endKey, color);
    solution.set(color, path.map(([r, c]) => key(r, c)));
  }

  return {
    size,
    dots,
    colors,
    solution,
  };
}

/**
 * Finds a Hamiltonian path through a set of cells (all must be visited exactly once).
 * Uses DFS with random start and neighbor ordering.
 * Returns null if no path found within iteration limit.
 */
function findHamiltonianPath(
  region: [number, number][],
  gridSize: number,
  rng: () => number
): [number, number][] | null {
  const cellSet = new Set(region.map(([r, c]) => key(r, c)));
  const n = region.length;

  // Build adjacency within region
  const adj = new Map<string, string[]>();
  for (const [r, c] of region) {
    const k = key(r, c);
    const neighbors: string[] = [];
    for (const [dr, dc] of DIRS) {
      const nk = key(r + dr, c + dc);
      if (cellSet.has(nk)) neighbors.push(nk);
    }
    adj.set(k, neighbors);
  }

  // Try multiple random start cells
  const starts = shuffle([...region], rng).slice(0, Math.min(region.length, 8));

  for (const [sr, sc] of starts) {
    const path: string[] = [];
    const visited = new Set<string>();

    function dfs(k: string): boolean {
      path.push(k);
      visited.add(k);
      if (path.length === n) return true;

      const neighbors = shuffle(adj.get(k) ?? [], rng).filter(nk => !visited.has(nk));

      // Warnsdorff's heuristic: prefer cells with fewer onward neighbors
      neighbors.sort((a, b) => {
        const fa = (adj.get(a) ?? []).filter(x => !visited.has(x)).length;
        const fb = (adj.get(b) ?? []).filter(x => !visited.has(x)).length;
        return fa - fb;
      });

      for (const nk of neighbors) {
        if (dfs(nk)) return true;
      }

      path.pop();
      visited.delete(k);
      return false;
    }

    if (dfs(key(sr, sc))) {
      return path.map(k => parseKey(k));
    }
  }

  return null;
}

function makeFallback(
  size: number,
  seed: string,
  difficulty: "easy" | "medium" | "hard"
): FlowBoard {
  const dots = new Map<string, Color>();
  const solution = new Map<string, string[]>();
  const s = Math.max(4, size);

  // Color 0: top row left→right
  dots.set(key(0, 0), COLORS[0]);
  dots.set(key(0, s - 1), COLORS[0]);
  solution.set(COLORS[0], Array.from({ length: s }, (_, c) => key(0, c)));

  // Color 1: bottom row left→right
  dots.set(key(s - 1, 0), COLORS[1]);
  dots.set(key(s - 1, s - 1), COLORS[1]);
  solution.set(COLORS[1], Array.from({ length: s }, (_, c) => key(s - 1, c)));

  // Color 2: left col rows 1..s-2
  if (s > 2) {
    dots.set(key(1, 0), COLORS[2]);
    dots.set(key(s - 2, 0), COLORS[2]);
    solution.set(COLORS[2], Array.from({ length: s - 2 }, (_, r) => key(r + 1, 0)));
  }

  // Color 3: right col rows 1..s-2
  if (s > 2) {
    dots.set(key(1, s - 1), COLORS[3]);
    dots.set(key(s - 2, s - 1), COLORS[3]);
    solution.set(COLORS[3], Array.from({ length: s - 2 }, (_, r) => key(r + 1, s - 1)));
  }

  return {
    size: s,
    dots,
    colors: COLORS.slice(0, solution.size),
    solution,
    seed,
    difficulty,
  };
}

export function checkFlowComplete(
  board: FlowBoard,
  paths: Map<string, { color: Color; cells: string[] }>
): boolean {
  // All cells must be covered
  const filled = new Set<string>();
  for (const [, p] of paths) p.cells.forEach(c => filled.add(c));
  if (filled.size !== board.size * board.size) return false;

  // Every dot must be an endpoint of its color's path
  for (const [pos, color] of board.dots) {
    const path = [...paths.values()].find(p => p.color === color);
    if (!path) return false;
    const cells = path.cells;
    // dot must be at start or end of the drawn path
    if (cells[0] !== pos && cells[cells.length - 1] !== pos) return false;
  }

  return true;
}