export type Piece = { cells: [number,number][]; color: string; id: number };
export type PatchesBoard = {
  rows: number; cols: number;
  pieces: Piece[];
  solution: number[][];
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

const PIECE_COLORS = [
  "#EF4444","#3B82F6","#22C55E","#F59E0B","#A855F7",
  "#EC4899","#14B8A6","#F97316","#6366F1","#84CC16",
];

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

const DIRS:([number,number])[] = [[0,1],[1,0],[0,-1],[-1,0]];

// Grow a random polyomino from a starting cell using flood-fill growth
function growPiece(
  grid: number[][],
  startR: number, startC: number,
  targetSize: number,
  rows: number, cols: number,
  rng: () => number
): [number,number][] {
  const cells: [number,number][] = [[startR, startC]];
  const frontier: [number,number][] = [];

  // Add initial neighbors
  for (const [dr,dc] of DIRS) {
    const nr=startR+dr, nc=startC+dc;
    if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&grid[nr][nc]===-1) {
      frontier.push([nr,nc]);
    }
  }

  while (cells.length < targetSize && frontier.length > 0) {
    // Pick random frontier cell
    const idx = Math.floor(rng() * frontier.length);
    const [r,c] = frontier.splice(idx,1)[0];
    if (grid[r][c] !== -1) continue;
    cells.push([r,c]);
    // Add its neighbors to frontier
    for (const [dr,dc] of DIRS) {
      const nr=r+dr, nc=c+dc;
      if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&grid[nr][nc]===-1) {
        if (!frontier.some(([fr,fc])=>fr===nr&&fc===nc) &&
            !cells.some(([cr,cc])=>cr===nr&&cc===nc)) {
          frontier.push([nr,nc]);
        }
      }
    }
  }

  return cells;
}

export function generatePatches(seed:string, difficulty:"easy"|"medium"|"hard"): PatchesBoard {
  const rows = difficulty==="easy"?4:difficulty==="medium"?5:6;
  const cols = difficulty==="easy"?4:difficulty==="medium"?5:6;
  const totalCells = rows * cols;
  // Target piece sizes: 3-5 cells each
  const minSize = difficulty==="easy"?3:3;
  const maxSize = difficulty==="easy"?4:5;

  const rng = mulberry32(seedToNum(seed));

  for (let attempt = 0; attempt < 50; attempt++) {
    const grid: number[][] = Array.from({length:rows}, () => Array(cols).fill(-1));
    const pieces: Piece[] = [];
    let pieceId = 0;

    let safety = 0;
    while (safety++ < 200) {
      // Find first empty cell
      let startR=-1, startC=-1;
      outer: for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
        if (grid[r][c]===-1) { startR=r; startC=c; break outer; }
      }
      if (startR===-1) break; // all filled

      // Count remaining empty cells
      const emptyCells = grid.flat().filter(v=>v===-1).length;
      // Don't make piece bigger than remaining cells
      const target = Math.min(
        minSize + Math.floor(rng()*(maxSize-minSize+1)),
        emptyCells
      );

      // Mark tentatively to prevent reuse
      const cells = growPiece(grid, startR, startC, target, rows, cols, rng);

      // Actually place
      const color = PIECE_COLORS[pieceId % PIECE_COLORS.length];
      cells.forEach(([r,c]) => { grid[r][c] = pieceId; });
      pieces.push({ cells, color, id: pieceId });
      pieceId++;
    }

    // Verify all cells covered
    if (grid.flat().every(v => v !== -1)) {
      // Normalize piece cells to start from (0,0)
      const normalizedPieces = pieces.map(p => {
        const minR = Math.min(...p.cells.map(([r])=>r));
        const minC = Math.min(...p.cells.map(([,c])=>c));
        return {
          ...p,
          cells: p.cells.map(([r,c]) => [r-minR, c-minC] as [number,number])
        };
      });

      // Shuffle for display
      const shuffled = [...normalizedPieces];
      for (let i=shuffled.length-1;i>0;i--) {
        const j=Math.floor(rng()*(i+1));
        [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
      }

      return { rows, cols, pieces: shuffled, solution: grid, seed, difficulty };
    }
  }

  // Fallback: simple 2x2 grid split into 4 single cells
  const grid = Array.from({length:rows}, (_,r) => Array.from({length:cols}, (_,c) => r*cols+c));
  const pieces: Piece[] = Array.from({length:rows*cols}, (_,i) => ({
    id: i,
    color: PIECE_COLORS[i % PIECE_COLORS.length],
    cells: [[0,0] as [number,number]]
  }));
  return { rows, cols, pieces, solution: grid, seed, difficulty };
}

export function checkPatches(board:PatchesBoard, placed:Map<string,number>): boolean {
  for (let r=0;r<board.rows;r++) {
    for (let c=0;c<board.cols;c++) {
      if (board.solution[r][c] !== (placed.get(`${r},${c}`)??-1)) return false;
    }
  }
  return true;
}
