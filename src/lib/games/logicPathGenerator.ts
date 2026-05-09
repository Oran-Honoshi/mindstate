export type PipeCell = {
  connections: boolean[]; // [top, right, bottom, left]
  color: string;
  locked: boolean;
};
export type LogicBoard = {
  size: number;
  grid: PipeCell[][];
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

const PIPE_COLORS=["#EF4444","#3B82F6","#22C55E","#F59E0B","#A855F7"];
function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

const PIPE_TYPES=[
  [false,true,false,true],  // horizontal ─
  [true,false,true,false],  // vertical │
  [false,true,true,false],  // corner ┐→↓
  [true,true,false,false],  // corner ┘→↑
  [true,false,false,true],  // corner └→↑
  [false,false,true,true],  // corner ┌→↓
];

export function generateLogicPath(seed:string, difficulty:"easy"|"medium"|"hard"): LogicBoard {
  const size=difficulty==="easy"?4:difficulty==="medium"?5:6;
  const rng=mulberry32(seedToNum(seed));

  const grid:PipeCell[][]=Array.from({length:size},(_,r)=>
    Array.from({length:size},(_,c)=>{
      const type=PIPE_TYPES[Math.floor(rng()*PIPE_TYPES.length)];
      const color=PIPE_COLORS[Math.floor(rng()*PIPE_COLORS.length)];
      // Some cells are locked (pre-placed, can't rotate)
      const locked=rng()<0.3;
      return{connections:[...type] as boolean[],color,locked};
    })
  );

  return{size,grid,seed,difficulty};
}

export function rotatePipe(connections:boolean[]):boolean[]{
  // Rotate 90° clockwise: top→right→bottom→left→top
  return[connections[3],connections[0],connections[1],connections[2]];
}

export function checkLogicPath(grid:PipeCell[][]): boolean {
  const size=grid.length;
  // Every adjacent pair must agree on their shared connection
  for(let r=0;r<size;r++){
    for(let c=0;c<size;c++){
      const cell=grid[r][c];
      // Check right neighbor
      if(c<size-1){
        const right=grid[r][c+1];
        if(cell.connections[1]!==right.connections[3])return false;
      } else {
        if(cell.connections[1])return false; // can't connect off edge
      }
      // Check bottom neighbor
      if(r<size-1){
        const below=grid[r+1][c];
        if(cell.connections[2]!==below.connections[0])return false;
      } else {
        if(cell.connections[2])return false;
      }
      // Check left boundary
      if(c===0&&cell.connections[3])return false;
      // Check top boundary
      if(r===0&&cell.connections[0])return false;
    }
  }
  return true;
}
