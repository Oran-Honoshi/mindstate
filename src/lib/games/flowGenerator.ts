export type Color = string;
export type FlowBoard = {
  size: number;
  dots: Map<string, Color>;
  colors: Color[];
  solution: Map<string, string[]>;
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

const COLORS = ["#EF4444","#3B82F6","#22C55E","#F59E0B","#A855F7","#EC4899","#14B8A6","#F97316"];

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
function key(r: number, c: number) { return `${r},${c}`; }
const DIRS = [[0,1],[0,-1],[1,0],[-1,0]];

export function generateFlowBoard(seed: string, difficulty: "easy"|"medium"|"hard"): FlowBoard {
  const size = difficulty === "easy" ? 5 : difficulty === "medium" ? 7 : 8;
  const numColors = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 7;
  const rng = mulberry32(seedToNum(seed));

  function ri(max: number) { return Math.floor(rng() * max); }
  function shuffle<T>(a: T[]): T[] {
    const b = [...a];
    for (let i = b.length-1; i > 0; i--) { const j = ri(i+1); [b[i],b[j]]=[b[j],b[i]]; }
    return b;
  }

  // Generate by placing paths first then filling remaining cells
  for (let attempt = 0; attempt < 100; attempt++) {
    const colorAssign = Array.from({length:size}, () => Array(size).fill(-1));
    const paths: string[][] = [];
    const dots = new Map<string, Color>();
    const colors = shuffle(COLORS.slice(0, numColors));
    let ok = true;

    for (let ci = 0; ci < numColors; ci++) {
      // Random walk from a free cell
      const free: [number,number][] = [];
      for (let r=0;r<size;r++) for (let c=0;c<size;c++) if (colorAssign[r][c]===-1) free.push([r,c]);
      if (free.length < 2) { ok = false; break; }

      const [sr, sc] = free[ri(Math.min(free.length, 4))];
      const path: string[] = [key(sr,sc)];
      colorAssign[sr][sc] = ci;
      let [cr, cc] = [sr, sc];
      const maxSteps = Math.floor(size * size / numColors) + ri(3);

      for (let step = 0; step < maxSteps; step++) {
        const nexts = shuffle(DIRS)
          .map(([dr,dc]) => [cr+dr, cc+dc] as [number,number])
          .filter(([nr,nc]) => nr>=0&&nr<size&&nc>=0&&nc<size&&colorAssign[nr][nc]===-1);
        if (!nexts.length) break;
        [cr, cc] = nexts[0];
        colorAssign[cr][cc] = ci;
        path.push(key(cr,cc));
      }

      if (path.length < 2) { ok = false; break; }
      paths.push(path);
      dots.set(path[0], colors[ci]);
      dots.set(path[path.length-1], colors[ci]);
    }

    if (!ok) continue;

    // Flood-fill remaining cells to nearest path
    let changed = true;
    while (changed) {
      changed = false;
      for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
        if (colorAssign[r][c] !== -1) continue;
        for (const [dr,dc] of DIRS) {
          const nr=r+dr, nc=c+dc;
          if (nr<0||nr>=size||nc<0||nc>=size) continue;
          if (colorAssign[nr][nc] === -1) continue;
          colorAssign[r][c] = colorAssign[nr][nc];
          paths[colorAssign[nr][nc]].push(key(r,c));
          changed = true;
          break;
        }
      }
    }

    // Check all filled
    if (colorAssign.some(row => row.some(v => v === -1))) continue;

    const solution = new Map<string, string[]>();
    paths.forEach((path, ci) => solution.set(colors[ci], path));

    return { size, dots, colors: colors.slice(0, numColors), solution, seed, difficulty };
  }

  // Fallback: 2 colors
  const dots = new Map<string,Color>();
  const solution = new Map<string,string[]>();
  const size2 = difficulty === "easy" ? 5 : 7;
  dots.set(key(0,0), COLORS[0]); dots.set(key(0,size2-1), COLORS[0]);
  dots.set(key(size2-1,0), COLORS[1]); dots.set(key(size2-1,size2-1), COLORS[1]);
  solution.set(COLORS[0], Array.from({length:size2}, (_,c) => key(0,c)));
  solution.set(COLORS[1], Array.from({length:size2}, (_,c) => key(size2-1,c)));
  return { size:size2, dots, colors:COLORS.slice(0,2), solution, seed, difficulty };
}

export function checkFlowComplete(board: FlowBoard, paths: Map<string, {color:Color;cells:string[]}>): boolean {
  const filled = new Set<string>();
  for (const [,p] of paths) p.cells.forEach(c => filled.add(c));
  if (filled.size !== board.size * board.size) return false;
  for (const [pos, color] of board.dots) {
    const path = [...paths.values()].find(p => p.color === color);
    if (!path || !path.cells.includes(pos)) return false;
  }
  return true;
}
