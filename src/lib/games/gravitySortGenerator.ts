export type GravityBoard = {
  cols: number;
  rows: number;
  blocks: number[][];   // each col is a stack, bottom to top
  colors: string[];
  targetCols: number[][];
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

const BLOCK_COLORS = ["var(--color-error)","#3B82F6","#22C55E","#F59E0B","#A855F7","#EC4899","#14B8A6"];

function mulberry32(seed: number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

export function generateGravitySort(seed: string, difficulty: "easy"|"medium"|"hard"): GravityBoard {
  const rng = mulberry32(seedToNum(seed));
  const numColors = difficulty==="easy"?3:difficulty==="medium"?4:5;
  const cols = numColors + 2;
  const rows = difficulty==="easy"?4:difficulty==="medium"?5:6;
  const colors = BLOCK_COLORS.slice(0, numColors);

  // Target: each color in its own column, sorted
  const targetCols: number[][] = Array.from({length:cols},(_,i)=>i<numColors?Array(rows).fill(i):[]);

  // Shuffle blocks
  const allBlocks: number[] = [];
  colors.forEach((_,i)=>{ for(let j=0;j<rows;j++) allBlocks.push(i); });
  for(let i=allBlocks.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[allBlocks[i],allBlocks[j]]=[allBlocks[j],allBlocks[i]];}

  // Distribute into cols (leave some empty)
  const blocks: number[][] = Array.from({length:cols},()=>[]);
  allBlocks.forEach((b,i)=>blocks[i%numColors].push(b));

  return { cols, rows, blocks, colors, targetCols, seed, difficulty };
}

export function checkGravitySort(board: GravityBoard, blocks: number[][]): boolean {
  for(let c=0;c<board.cols;c++){
    if(c<board.colors.length){
      if(blocks[c].length!==board.rows)return false;
      if(!blocks[c].every(b=>b===c))return false;
    }
  }
  return true;
}
