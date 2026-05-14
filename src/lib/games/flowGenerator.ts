export type Color = string;
export type FlowBoard = {
  size: number;
  dots: Map<string, Color>;
  colors: Color[];
  solution: Map<string, string[]>; // color -> ordered cell keys
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
const DIRS = [[0,1],[0,-1],[1,0],[-1,0]];

export function generateFlowBoard(seed: string, difficulty: "easy"|"medium"|"hard"): FlowBoard {
  const size = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 9;
  const numColors = difficulty === "easy" ? 5 : difficulty === "medium" ? 7 : 9;
  const rng = mulberry32(seedToNum(seed));

  // Strategy: fill entire grid first using a space-partitioning approach
  // 1. Place color endpoints randomly
  // 2. Grow paths using BFS to fill all cells
  for (let attempt = 0; attempt < 200; attempt++) {
    const grid = Array.from({length:size}, () => Array(size).fill(-1));
    const colors = shuffle(COLORS.slice(0, numColors), rng);
    const paths: number[][][] = Array.from({length:numColors}, () => []);
    const endpoints: [number,number,number,number][] = []; // [r1,c1,r2,c2] per color

    // Place endpoints — spread them out
    const allCells: [number,number][] = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        allCells.push([r,c]);
    const shuffledCells = shuffle(allCells, rng);

    let placed = 0;
    const used = new Set<string>();
    const ends: [number,number][] = [];

    for (const [r,c] of shuffledCells) {
      if (placed >= numColors * 2) break;
      if (used.has(key(r,c))) continue;
      // Keep endpoints apart
      const tooClose = ends.some(([er,ec]) => Math.abs(er-r)+Math.abs(ec-c) < 2);
      if (tooClose) continue;
      ends.push([r,c]);
      used.add(key(r,c));
      placed++;
    }

    if (placed < numColors * 2) continue;

    // Assign endpoints to colors
    for (let i = 0; i < numColors; i++) {
      const [r1,c1] = ends[i*2];
      const [r2,c2] = ends[i*2+1];
      endpoints.push([r1,c1,r2,c2]);
    }

    // Find paths between endpoints using DFS with backtracking
    // Fill entire grid
    const cellColor = Array.from({length:size}, () => Array(size).fill(-1));
    const pathCells: string[][] = Array.from({length:numColors}, () => []);

    function dfs(ci: number, r: number, c: number, visited: Set<string>): boolean {
      const [,,,er2,ec2] = [ci, ...endpoints[ci]];
      const targetR = endpoints[ci][2], targetC = endpoints[ci][3];

      if (r === targetR && c === targetC) {
        // Check if all cells for this color segment are connected
        pathCells[ci].push(key(r,c));
        // For last color, check all cells filled
        if (ci === numColors - 1) {
          const totalFilled = pathCells.flat().length;
          return totalFilled === size * size;
        }
        // Move to next color
        const nextR = endpoints[ci+1][0], nextC = endpoints[ci+1][1];
        pathCells[ci+1] = [key(nextR, nextC)];
        cellColor[nextR][nextC] = ci+1;
        visited.add(key(nextR,nextC));
        if (dfs(ci+1, nextR, nextC, visited)) return true;
        visited.delete(key(nextR,nextC));
        cellColor[nextR][nextC] = -1;
        pathCells[ci+1] = [];
        pathCells[ci].pop();
        return false;
      }

      pathCells[ci].push(key(r,c));
      cellColor[r][c] = ci;

      const dirs = shuffle([...DIRS], rng);
      for (const [dr,dc] of dirs) {
        const nr = r+dr, nc = c+dc;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (visited.has(key(nr,nc))) continue;
        visited.add(key(nr,nc));
        if (dfs(ci, nr, nc, visited)) return true;
        visited.delete(key(nr,nc));
      }

      pathCells[ci].pop();
      cellColor[r][c] = -1;
      return false;
    }

    // Simple approach: generate paths greedily, then fill remaining cells
    // Use a simpler but reliable method
    const solution = new Map<string, string[]>();
    const dots = new Map<string, Color>();
    const colorAssign = Array.from({length:size}, () => Array(size).fill(-1));
    let success = true;

    for (let ci = 0; ci < numColors; ci++) {
      const [sr,sc,er,ec] = endpoints[ci];
      // BFS to find path
      const prev = new Map<string,string>();
      const q: [number,number][] = [[sr,sc]];
      const vis = new Set<string>();
      vis.add(key(sr,sc));
      let found = false;

      while (q.length > 0) {
        const [r,c] = q.shift()!;
        if (r === er && c === ec) { found = true; break; }
        for (const [dr,dc] of shuffle([...DIRS], rng)) {
          const nr=r+dr, nc=c+dc;
          if (nr<0||nr>=size||nc<0||nc>=size) continue;
          if (vis.has(key(nr,nc))) continue;
          if (colorAssign[nr][nc] !== -1) continue;
          vis.add(key(nr,nc));
          prev.set(key(nr,nc), key(r,c));
          q.push([nr,nc]);
        }
      }

      if (!found) { success = false; break; }

      // Reconstruct path
      const path: string[] = [];
      let cur = key(er,ec);
      while (cur !== key(sr,sc)) {
        path.unshift(cur);
        cur = prev.get(cur)!;
      }
      path.unshift(key(sr,sc));

      path.forEach(k => {
        const [r,c] = k.split(",").map(Number);
        colorAssign[r][c] = ci;
      });
      solution.set(colors[ci], path);
      dots.set(key(sr,sc), colors[ci]);
      dots.set(key(er,ec), colors[ci]);
    }

    if (!success) continue;

    // Fill remaining cells into nearest path (expand existing paths)
    const remaining: [number,number][] = [];
    for (let r=0;r<size;r++)
      for (let c=0;c<size;c++)
        if (colorAssign[r][c] === -1) remaining.push([r,c]);

    // Assign remaining cells to adjacent colors
    let changed = true;
    while (remaining.length > 0 && changed) {
      changed = false;
      for (let i = remaining.length-1; i >= 0; i--) {
        const [r,c] = remaining[i];
        for (const [dr,dc] of DIRS) {
          const nr=r+dr, nc=c+dc;
          if (nr<0||nr>=size||nc<0||nc>=size) continue;
          const ci = colorAssign[nr][nc];
          if (ci === -1) continue;
          colorAssign[r][c] = ci;
          const color = colors[ci];
          solution.get(color)!.push(key(r,c));
          remaining.splice(i,1);
          changed = true;
          break;
        }
      }
    }

    if (remaining.length > 0) continue;

    return { size, dots, colors: colors.slice(0, numColors), solution, seed, difficulty };
  }

  // Fallback: simple 2-color board
  const dots = new Map<string,Color>();
  const solution = new Map<string,string[]>();
  dots.set(key(0,0), COLORS[0]); dots.set(key(0,size-1), COLORS[0]);
  dots.set(key(size-1,0), COLORS[1]); dots.set(key(size-1,size-1), COLORS[1]);
  const path1 = Array.from({length:size}, (_,c) => key(0,c));
  const path2 = Array.from({length:size}, (_,c) => key(size-1,c));
  solution.set(COLORS[0], path1);
  solution.set(COLORS[1], path2);
  return { size, dots, colors: COLORS.slice(0,2), solution, seed, difficulty };
}

export function checkFlowComplete(
  board: FlowBoard,
  paths: Map<string, { color: Color; cells: string[] }>
): boolean {
  const filled = new Set<string>();
  for (const [,p] of paths) p.cells.forEach(c => filled.add(c));
  if (filled.size !== board.size * board.size) return false;
  for (const [pos, color] of board.dots) {
    const path = [...paths.values()].find(p => p.color === color);
    if (!path || !path.cells.includes(pos)) return false;
  }
  return true;
}
