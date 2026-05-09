export type Piece = { cells: [number,number][]; color: string; id: number };
export type PatchesBoard = {
  rows: number;
  cols: number;
  pieces: Piece[];
  solution: number[][]; // grid showing which piece id fills each cell (-1=empty)
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

const PIECE_COLORS = [
  "#EF4444","#3B82F6","#22C55E","#F59E0B","#A855F7",
  "#EC4899","#14B8A6","#F97316","#6366F1","#84CC16",
];

// Standard polyomino shapes (tetrominoes + pentominoes)
const SHAPES: [number,number][][] = [
  [[0,0],[0,1],[0,2],[0,3]],           // I tetromino
  [[0,0],[0,1],[1,0],[1,1]],           // O tetromino
  [[0,0],[0,1],[0,2],[1,1]],           // T tetromino
  [[0,0],[0,1],[1,1],[1,2]],           // S tetromino
  [[0,1],[0,2],[1,0],[1,1]],           // Z tetromino
  [[0,0],[1,0],[1,1],[1,2]],           // L tetromino
  [[0,2],[1,0],[1,1],[1,2]],           // J tetromino
  [[0,0],[0,1],[0,2],[1,0],[2,0]],     // L pentomino
  [[0,0],[0,1],[0,2],[1,2],[2,2]],     // U variant
  [[0,0],[0,1],[1,1],[2,1],[2,2]],     // Z pentomino
  [[0,1],[1,0],[1,1],[1,2],[2,1]],     // + pentomino
  [[0,0],[1,0],[1,1],[1,2],[2,2]],     // S pentomino
];

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

function rotatePiece(cells:[number,number][]): [number,number][] {
  return cells.map(([r,c])=>[-c,r] as [number,number]);
}
function normalizePiece(cells:[number,number][]): [number,number][] {
  const minR=Math.min(...cells.map(([r])=>r));
  const minC=Math.min(...cells.map(([,c])=>c));
  return cells.map(([r,c])=>[r-minR,c-minC] as [number,number]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
}

export function generatePatches(seed:string, difficulty:"easy"|"medium"|"hard"): PatchesBoard {
  const rows=difficulty==="easy"?5:difficulty==="medium"?6:7;
  const cols=difficulty==="easy"?5:difficulty==="medium"?6:7;
  const rng=mulberry32(seedToNum(seed));

  function ri<T>(arr:T[]):T{return arr[Math.floor(rng()*arr.length)];}

  // Build solution by placing pieces randomly
  const solution:number[][]=Array.from({length:rows},()=>Array(cols).fill(-1));
  const pieces:Piece[]=[];
  let pieceId=0;
  let attempts=0;

  while(attempts<500){
    attempts++;
    // Find first empty cell
    let startR=-1,startC=-1;
    outer:for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){if(solution[r][c]===-1){startR=r;startC=c;break outer;}}}
    if(startR===-1)break; // all filled

    // Try a random shape with random rotation
    let shape=[...ri(SHAPES)];
    const rotations=Math.floor(rng()*4);
    for(let i=0;i<rotations;i++) shape=rotatePiece(shape) as [number,number][];
    shape=normalizePiece(shape);

    // Place starting at startR, startC — offset to cover startR,startC
    const offsetR=startR-shape[0][0];
    const offsetC=startC-shape[0][1];
    const placed:([number,number])[]=(shape as [number,number][]).map(([r,c])=>[r+offsetR,c+offsetC]);

    // Check bounds and empty
    const valid=placed.every(([r,c])=>r>=0&&r<rows&&c>=0&&c<cols&&solution[r][c]===-1);
    if(!valid)continue;

    // Place
    const color=PIECE_COLORS[pieceId%PIECE_COLORS.length];
    placed.forEach(([r,c])=>{solution[r][c]=pieceId;});
    pieces.push({cells:placed,color,id:pieceId});
    pieceId++;
  }

  // Shuffle piece order for display
  for(let i=pieces.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [pieces[i],pieces[j]]=[pieces[j],pieces[i]];
  }

  return{rows,cols,pieces,solution,seed,difficulty};
}

export function checkPatches(board:PatchesBoard, placed:Map<string,number>): boolean {
  // Every cell must be covered exactly once with the right piece
  for(let r=0;r<board.rows;r++){
    for(let c=0;c<board.cols;c++){
      const expected=board.solution[r][c];
      const actual=placed.get(`${r},${c}`)??-1;
      if(expected!==actual)return false;
    }
  }
  return true;
}
