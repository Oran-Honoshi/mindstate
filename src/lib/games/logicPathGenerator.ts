// Logic Path — pipe rotation puzzle
// Each cell has a pipe with connections [top, right, bottom, left]
// Goal: rotate pipes so all connections match between adjacent cells

export type PipeType = "straight" | "corner" | "tee" | "end";

export type PipeCell = {
  connections: [boolean, boolean, boolean, boolean]; // top, right, bottom, left
  rotation: number; // 0, 90, 180, 270
  locked: boolean;
  type: PipeType;
};

export type LogicBoard = {
  size: number;
  grid: PipeCell[][];
  solution: PipeCell[][];
  seed: string;
  difficulty: "easy" | "medium" | "hard";
};

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

function rotateConnections(conn: [boolean,boolean,boolean,boolean], times: number): [boolean,boolean,boolean,boolean] {
  let c = [...conn] as [boolean,boolean,boolean,boolean];
  for (let i = 0; i < times; i++) {
    c = [c[3], c[0], c[1], c[2]]; // left→top, top→right, right→bottom, bottom→left
  }
  return c;
}

// Base pipe shapes
const PIPE_SHAPES: Record<PipeType, [boolean,boolean,boolean,boolean]> = {
  straight: [true, false, true, false],  // │
  corner:   [false, true, true, false],  // └
  tee:      [true, true, true, false],   // ├
  end:      [true, false, false, false], // ╵
};

export function generateLogicPath(seed: string, difficulty: "easy" | "medium" | "hard"): LogicBoard {
  const size = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const rng = mulberry32(seedToNum(seed));

  function ri(max: number) { return Math.floor(rng() * max); }

  // Build a VALID connected solution first
  // Use a flow-fill approach: assign connections that match neighbors
  const solution: PipeCell[][] = [];

  // Step 1: Decide which edges are connected (create a spanning tree)
  const edges = new Set<string>();

  // Random spanning tree using random walk
  const visited = new Set<string>();
  const stack: [number,number][] = [[0,0]];
  visited.add("0,0");

  while (stack.length > 0 && visited.size < size * size) {
    const idx = ri(stack.length);
    const [r, c] = stack[idx];
    const dirs: [number,number,string,string][] = [
      [-1,0,"top","bottom"],[0,1,"right","left"],[1,0,"bottom","top"],[0,-1,"left","right"]
    ];
    const shuffled = [...dirs].sort(() => rng() - 0.5);
    let added = false;
    for (const [dr, dc, dir1, dir2] of shuffled) {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=size||nc<0||nc>=size) continue;
      if (visited.has(`${nr},${nc}`)) continue;
      edges.add(`${r},${c},${dir1}`);
      edges.add(`${nr},${nc},${dir2}`);
      visited.add(`${nr},${nc}`);
      stack.push([nr,nc]);
      added = true;
      break;
    }
    if (!added) stack.splice(idx, 1);
  }

  // Step 2: Build solution grid from edges
  for (let r = 0; r < size; r++) {
    solution.push([]);
    for (let c = 0; c < size; c++) {
      const top    = edges.has(`${r},${c},top`);
      const right  = edges.has(`${r},${c},right`);
      const bottom = edges.has(`${r},${c},bottom`);
      const left   = edges.has(`${r},${c},left`);
      const conn: [boolean,boolean,boolean,boolean] = [top,right,bottom,left];
      const count = conn.filter(Boolean).length;
      const type: PipeType = count === 1 ? "end" : count === 2 ?
        (top&&bottom || left&&right ? "straight" : "corner") : "tee";

      solution[r].push({
        connections: conn,
        rotation: 0,
        locked: false,
        type,
      });
    }
  }

  // Step 3: Create puzzle by rotating cells randomly
  const grid: PipeCell[][] = solution.map((row, r) =>
    row.map((cell, c) => {
      const locked = rng() < (difficulty === "easy" ? 0.35 : 0.2);
      const rotations = locked ? 0 : ri(4);
      return {
        connections: rotateConnections(cell.connections, rotations),
        rotation: rotations * 90,
        locked,
        type: cell.type,
      };
    })
  );

  return { size, grid, solution, seed, difficulty };
}

export function rotatePipe(cell: PipeCell): PipeCell {
  return {
    ...cell,
    connections: rotateConnections(cell.connections, 1),
    rotation: (cell.rotation + 90) % 360,
  };
}

export function checkLogicPath(grid: PipeCell[][]): boolean {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = grid[r][c];
      // Check right neighbor
      if (c < size - 1) {
        if (cell.connections[1] !== grid[r][c+1].connections[3]) return false;
      } else {
        if (cell.connections[1]) return false; // open edge
      }
      // Check bottom neighbor
      if (r < size - 1) {
        if (cell.connections[2] !== grid[r+1][c].connections[0]) return false;
      } else {
        if (cell.connections[2]) return false;
      }
      // Check left boundary
      if (c === 0 && cell.connections[3]) return false;
      // Check top boundary
      if (r === 0 && cell.connections[0]) return false;
    }
  }
  return true;
}

export function isCellCorrect(grid: PipeCell[][], solution: PipeCell[][], r: number, c: number): boolean {
  const cell = grid[r][c];
  const sol = solution[r][c];
  return cell.connections.every((v, i) => v === sol.connections[i]);
}
