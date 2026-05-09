export type Island = { r: number; c: number; required: number; id: number };
export type Bridge = { from: number; to: number; count: 1|2 };
export type BridgesBoard = {
  size: number;
  islands: Island[];
  solution: Bridge[];
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

function mulberry32(seed: number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

export function generateBridges(seed: string, difficulty: "easy"|"medium"|"hard"): BridgesBoard {
  const size = difficulty==="easy"?7:difficulty==="medium"?9:11;
  const numIslands = difficulty==="easy"?8:difficulty==="medium"?14:20;
  const rng = mulberry32(seedToNum(seed));

  // Place islands on grid
  const grid = Array.from({length:size},()=>Array(size).fill(-1));
  const islands: Island[] = [];

  // Place islands avoiding adjacency
  let attempts=0;
  while(islands.length < numIslands && attempts < 1000) {
    attempts++;
    const r = Math.floor(rng()*size);
    const c = Math.floor(rng()*size);
    if(grid[r][c]!==-1) continue;
    // Check not adjacent to existing island
    const adj = [[-1,0],[1,0],[0,-1],[0,1]].some(([dr,dc])=>{
      const nr=r+dr,nc=c+dc;
      return nr>=0&&nr<size&&nc>=0&&nc<size&&grid[nr][nc]!==-1;
    });
    if(adj) continue;
    const id = islands.length;
    grid[r][c] = id;
    islands.push({r,c,required:0,id});
  }

  // Build solution bridges
  const solution: Bridge[] = [];
  const connections = new Map<number,number[]>();
  islands.forEach(i=>connections.set(i.id,[]));

  // Connect islands horizontally/vertically
  for(const island of islands) {
    // Try right
    for(let dc=1;island.c+dc<size;dc++) {
      const cell = grid[island.r][island.c+dc];
      if(cell!==-1) {
        const target = islands[cell];
        if(!solution.some(b=>(b.from===island.id&&b.to===target.id)||(b.from===target.id&&b.to===island.id))) {
          const count = rng()<0.35?2:1;
          solution.push({from:island.id,to:target.id,count:count as 1|2});
          connections.get(island.id)!.push(target.id);
          connections.get(target.id)!.push(island.id);
        }
        break;
      }
    }
    // Try down
    for(let dr=1;island.r+dr<size;dr++) {
      const cell = grid[island.r+dr][island.c];
      if(cell!==-1) {
        const target = islands[cell];
        if(!solution.some(b=>(b.from===island.id&&b.to===target.id)||(b.from===target.id&&b.to===island.id))) {
          if(rng()<0.6) {
            const count = rng()<0.35?2:1;
            solution.push({from:island.id,to:target.id,count:count as 1|2});
          }
        }
        break;
      }
    }
  }

  // Set required counts
  islands.forEach(island=>{
    const total = solution.filter(b=>b.from===island.id||b.to===island.id).reduce((s,b)=>s+b.count,0);
    island.required = Math.max(1,total);
  });

  return {size,islands,solution,seed,difficulty};
}

export function checkBridges(board: BridgesBoard, placed: Bridge[]): boolean {
  return board.islands.every(island=>{
    const total = placed.filter(b=>b.from===island.id||b.to===island.id).reduce((s,b)=>s+b.count,0);
    return total===island.required;
  });
}
