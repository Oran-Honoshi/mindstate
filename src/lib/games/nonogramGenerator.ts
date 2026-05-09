export type NonogramBoard = {
  size: number;
  solution: boolean[][];
  rowClues: number[][];
  colClues: number[][];
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = (seed + 0x6d2b79f5)|0;
    let t = Math.imul(seed ^ (seed>>>15), 1|seed);
    t = (t + Math.imul(t ^ (t>>>7), 61|t))^t;
    return ((t ^ (t>>>14))>>>0)/4294967296;
  };
}
function seedToNum(s: string): number {
  let h = 0;
  for (let i=0;i<s.length;i++) h=(Math.imul(31,h)+s.charCodeAt(i))|0;
  return Math.abs(h);
}

function getClues(line: boolean[]): number[] {
  const clues: number[] = [];
  let count = 0;
  for (const cell of line) {
    if (cell) count++;
    else if (count > 0) { clues.push(count); count = 0; }
  }
  if (count > 0) clues.push(count);
  return clues.length ? clues : [0];
}

export function generateNonogram(seed: string, difficulty: "easy"|"medium"|"hard"): NonogramBoard {
  const size = difficulty==="easy"?5:difficulty==="medium"?10:15;
  const density = difficulty==="easy"?0.6:difficulty==="medium"?0.55:0.5;
  const rng = mulberry32(seedToNum(seed));

  const solution: boolean[][] = Array.from({length:size},()=>
    Array.from({length:size},()=>rng()<density)
  );

  const rowClues = solution.map(row => getClues(row));
  const colClues = Array.from({length:size},(_,c)=>getClues(solution.map(r=>r[c])));

  return { size, solution, rowClues, colClues, seed, difficulty };
}

export function checkNonogram(board: NonogramBoard, grid: (boolean|null)[][]): boolean {
  for (let r=0;r<board.size;r++) {
    if (!grid[r].every(c=>c!==null)) return false;
    const actual = getClues(grid[r].map(c=>c===true));
    if (actual.join(",")!==board.rowClues[r].join(",")) return false;
  }
  for (let c=0;c<board.size;c++) {
    const col = grid.map(r=>r[c]===true);
    const actual = getClues(col);
    if (actual.join(",")!==board.colClues[c].join(",")) return false;
  }
  return true;
}
