export type Color = string;
export type Pos = [number, number];
export type FlowBoard = {
  size: number;
  dots: Map<string, Color>;
  colors: Color[];
  solution: Map<string, Color>;
  seed: string;
  difficulty: "easy" | "medium" | "hard";
};

const COLORS = ["#EF4444","#3B82F6","#22C55E","#F59E0B","#A855F7","#EC4899","#14B8A6","#F97316","#6366F1","#84CC16"];

function mulberry32(seed: number) {
  return function() {
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

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function key(r: number, c: number) { return `${r},${c}`; }

export function generateFlowBoard(seed: string, difficulty: "easy" | "medium" | "hard"): FlowBoard {
  const size = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 9;
  const numColors = difficulty === "easy" ? 5 : difficulty === "medium" ? 7 : 9;
  const rng = mulberry32(seedToNum(seed));
  const dirs: Pos[] = [[0,1],[0,-1],[1,0],[-1,0]];

  function inBounds(r: number, c: number) { return r >= 0 && r < size && c >= 0 && c < size; }

  // Generate paths for each color
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    const used = new Set<string>();
    const paths: Pos[][] = [];
    const solution = new Map<string, Color>();
    let valid = true;

    const colors = shuffle(COLORS.slice(0, numColors), rng);

    for (let ci = 0; ci < numColors; ci++) {
      // Random start not yet used
      const available: Pos[] = [];
      for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
          if (!used.has(key(r, c))) available.push([r, c]);

      if (available.length < 2) { valid = false; break; }

      const starts = shuffle(available, rng);
      const start = starts[0];
      if (used.has(key(start[0], start[1]))) { valid = false; break; }

      // Random walk from start
      const path: Pos[] = [start];
      used.add(key(start[0], start[1]));
      const maxLen = Math.floor(size * size / numColors) + Math.floor(rng() * 3);

      for (let step = 0; step < maxLen; step++) {
        const [cr, cc] = path[path.length - 1];
        const nexts = shuffle(dirs, rng)
          .map(([dr, dc]) => [cr + dr, cc + dc] as Pos)
          .filter(([nr, nc]) => inBounds(nr, nc) && !used.has(key(nr, nc)));
        if (!nexts.length) break;
        const next = nexts[0];
        path.push(next);
        used.add(key(next[0], next[1]));
      }

      if (path.length < 2) { valid = false; break; }

      path.forEach(([r, c]) => solution.set(key(r, c), colors[ci]));
      paths.push(path);
    }

    if (!valid) continue;

    // Build dots (start + end of each path)
    const dots = new Map<string, Color>();
    paths.forEach((path, ci) => {
      dots.set(key(path[0][0], path[0][1]), colors[ci]);
      dots.set(key(path[path.length-1][0], path[path.length-1][1]), colors[ci]);
    });

    return { size, dots, colors: colors.slice(0, numColors), solution, seed, difficulty };
  }

  // Fallback minimal board
  const dots = new Map<string, Color>();
  dots.set(key(0,0), COLORS[0]); dots.set(key(0,size-1), COLORS[0]);
  dots.set(key(size-1,0), COLORS[1]); dots.set(key(size-1,size-1), COLORS[1]);
  return { size, dots, colors: COLORS.slice(0,2), solution: dots, seed, difficulty };
}

export function checkFlowComplete(
  board: FlowBoard,
  paths: Map<string, { color: Color; cells: string[] }>
): boolean {
  // Every cell must be filled
  const filled = new Set<string>();
  for (const [, p] of paths) p.cells.forEach(c => filled.add(c));
  const total = board.size * board.size;
  if (filled.size !== total) return false;
  // Every color dot must be connected
  for (const [pos, color] of board.dots) {
    const path = [...[...paths.values()].find(p => p.color === color);
    if (!path) return false;
    if (!path.cells.includes(pos)) return false;
  }
  return true;
}
