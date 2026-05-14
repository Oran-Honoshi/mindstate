export type LightCell =
  | { type:"white" }
  | { type:"black"; clue:number|null }
  | { type:"bulb" };

export type LightBoard = {
  size: number;
  grid: LightCell[][];
  solution: string[]; // keys of bulb positions in solution
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

function key(r:number,c:number){return`${r},${c}`;}

// Solve light-up: place bulbs so every white cell is lit, no conflicts
function solve(grid:LightCell[][], size:number, pos:number, bulbs:Set<string>): boolean {
  // Find next unlit white cell
  while (pos < size*size) {
    const r = Math.floor(pos/size), c = pos%size;
    if (grid[r][c].type === 'white' && !isLit(r, c, size, grid, bulbs)) break;
    pos++;
  }
  if (pos >= size*size) {
    // Check all white cells are lit and black clues satisfied
    for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
      if (grid[r][c].type==='white' && !isLit(r,c,size,grid,bulbs)) return false;
      if (grid[r][c].type==='black') {
        const bc = grid[r][c] as {type:'black';clue:number|null};
        if (bc.clue !== null && bc.clue >= 0) {
          const adj = countAdjBulbs(r,c,size,bulbs);
          if (adj !== bc.clue) return false;
        }
      }
    }
    return true;
  }
  const r = Math.floor(pos/size), c = pos%size;
  // Try placing bulb here
  if (canPlaceBulb(r,c,size,grid,bulbs)) {
    bulbs.add(key(r,c));
    if (solve(grid, size, pos+1, bulbs)) return true;
    bulbs.delete(key(r,c));
  }
  // Try without bulb
  if (solve(grid, size, pos+1, bulbs)) return true;
  return false;
}

function isLit(r:number, c:number, size:number, grid:LightCell[][], bulbs:Set<string>):boolean {
  if (bulbs.has(key(r,c))) return true;
  for (const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    let nr=r+dr, nc=c+dc;
    while (nr>=0&&nr<size&&nc>=0&&nc<size&&grid[nr][nc].type!=='black') {
      if (bulbs.has(key(nr,nc))) return true;
      nr+=dr; nc+=dc;
    }
  }
  return false;
}

function canPlaceBulb(r:number,c:number,size:number,grid:LightCell[][],bulbs:Set<string>):boolean {
  // Can't conflict with existing bulb
  for (const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    let nr=r+dr, nc=c+dc;
    while (nr>=0&&nr<size&&nc>=0&&nc<size&&grid[nr][nc].type!=='black') {
      if (bulbs.has(key(nr,nc))) return false;
      nr+=dr; nc+=dc;
    }
  }
  // Check adjacent black clues won't be exceeded
  for (const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const nr=r+dr, nc=c+dc;
    if (nr<0||nr>=size||nc<0||nc>=size) continue;
    const cell = grid[nr][nc] as {type:string;clue?:number|null};
    if (cell.type==='black' && cell.clue != null && cell.clue >= 0) {
      const current = countAdjBulbs(nr,nc,size,bulbs);
      if (current >= cell.clue) return false;
    }
  }
  return true;
}

function countAdjBulbs(r:number,c:number,size:number,bulbs:Set<string>):number {
  return [[0,1],[0,-1],[1,0],[-1,0]].filter(([dr,dc])=>{
    const nr=r+dr,nc=c+dc;
    return nr>=0&&nr<size&&nc>=0&&nc<size&&bulbs.has(key(nr,nc));
  }).length;
}

export function generateLightUp(seed:string, difficulty:"easy"|"medium"|"hard"): LightBoard {
  const size = difficulty==="easy"?6:difficulty==="medium"?8:10;
  const blackProb = difficulty==="easy"?0.15:difficulty==="medium"?0.18:0.20;
  const rng = mulberry32(seedToNum(seed));

  for (let attempt=0; attempt<50; attempt++) {
    const grid:LightCell[][] = Array.from({length:size},()=>
      Array.from({length:size},()=>{
        if (rng()<blackProb) return{type:"black",clue:null} as LightCell;
        return{type:"white"} as LightCell;
      })
    );

    // Solve to find bulb positions
    const bulbs = new Set<string>();
    if (!solve(grid, size, 0, bulbs)) continue;

    // Add clues to some black cells
    for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
      const cell = grid[r][c] as {type:string;clue?:number|null};
      if (cell.type==='black' && rng()<0.5) {
        const adj = countAdjBulbs(r,c,size,bulbs);
        (grid[r][c] as any).clue = adj;
      }
    }

    return { size, grid, solution: [...bulbs], seed, difficulty };
  }

  // Fallback: all white, no blacks
  const grid:LightCell[][] = Array.from({length:size},()=>Array.from({length:size},()=>({type:"white"} as LightCell)));
  // Place bulbs every other cell in first row
  const solution: string[] = [];
  for (let c=0;c<size;c+=2) solution.push(key(0,c));
  return { size, grid, solution, seed, difficulty };
}

export function computeLighting(grid:LightCell[][]): {
  lit:Set<string>; conflicts:Set<string>; blackErrors:Set<string>
} {
  const size=grid.length;
  const lit=new Set<string>();
  const conflicts=new Set<string>();

  for(let r=0;r<size;r++) for(let c=0;c<size;c++) {
    if(grid[r][c].type!=="bulb") continue;
    lit.add(key(r,c));
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>{
      let nr=r+dr,nc=c+dc;
      while(nr>=0&&nr<size&&nc>=0&&nc<size&&grid[nr][nc].type!=="black"){
        const k=key(nr,nc);
        if(grid[nr][nc].type==="bulb"){conflicts.add(key(r,c));conflicts.add(k);}
        lit.add(k); nr+=dr; nc+=dc;
      }
    });
  }

  const blackErrors=new Set<string>();
  for(let r=0;r<size;r++) for(let c=0;c<size;c++) {
    const cell=grid[r][c] as {type:string;clue?:number|null};
    if(cell.type!=="black"||cell.clue==null||cell.clue<0) continue;
    const adjBulbs=[[0,1],[0,-1],[1,0],[-1,0]].filter(([dr,dc])=>{
      const nr=r+dr,nc=c+dc;
      return nr>=0&&nr<size&&nc>=0&&nc<size&&grid[nr][nc].type==="bulb";
    }).length;
    if(adjBulbs!==cell.clue) blackErrors.add(key(r,c));
  }

  return{lit,conflicts,blackErrors};
}

export function checkLightUp(grid:LightCell[][]): boolean {
  const size=grid.length;
  const{lit,conflicts,blackErrors}=computeLighting(grid);
  if(conflicts.size>0||blackErrors.size>0) return false;
  for(let r=0;r<size;r++) for(let c=0;c<size;c++)
    if(grid[r][c].type==="white"&&!lit.has(key(r,c))) return false;
  return true;
}
