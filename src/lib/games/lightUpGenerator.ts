export type LightCell =
  | { type:"white"; lit:boolean }
  | { type:"black"; clue:number|null } // clue = required adjacent bulbs (-1=no clue)
  | { type:"bulb" };

export type LightBoard = {
  size: number;
  grid: LightCell[][];
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

export function generateLightUp(seed:string, difficulty:"easy"|"medium"|"hard"): LightBoard {
  const size=difficulty==="easy"?6:difficulty==="medium"?8:10;
  const blackProb=difficulty==="easy"?0.18:difficulty==="medium"?0.2:0.22;
  const clueProb=0.5;
  const rng=mulberry32(seedToNum(seed));

  const grid:LightCell[][]=Array.from({length:size},(_,r)=>
    Array.from({length:size},(_,c)=>{
      if(rng()<blackProb){
        const clue=rng()<clueProb?Math.floor(rng()*4):-1;
        return{type:"black",clue} as LightCell;
      }
      return{type:"white",lit:false} as LightCell;
    })
  );

  return{size,grid,seed,difficulty};
}

export function computeLighting(grid:LightCell[][]): {
  lit:Set<string>; conflicts:Set<string>; blackErrors:Set<string>
} {
  const size=grid.length;
  const lit=new Set<string>();
  const conflicts=new Set<string>();

  // Find all bulbs and cast light
  for(let r=0;r<size;r++){
    for(let c=0;c<size;c++){
      if(grid[r][c].type!=="bulb")continue;
      lit.add(`${r},${c}`);
      // Cast in 4 directions
      [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>{
        let nr=r+dr,nc=c+dc;
        while(nr>=0&&nr<size&&nc>=0&&nc<size&&grid[nr][nc].type!=="black"){
          const k=`${nr},${nc}`;
          if(grid[nr][nc].type==="bulb"){ conflicts.add(`${r},${c}`); conflicts.add(k); }
          lit.add(k); nr+=dr; nc+=dc;
        }
      });
    }
  }

  // Check black cell clues
  const blackErrors=new Set<string>();
  for(let r=0;r<size;r++){
    for(let c=0;c<size;c++){
      const cell=grid[r][c] as {type:string;clue?:number};
      if(cell.type!=="black"||cell.clue==null||cell.clue<0)continue;
      const adjBulbs=[[0,1],[0,-1],[1,0],[-1,0]].filter(([dr,dc])=>{
        const nr=r+dr,nc=c+dc;
        return nr>=0&&nr<size&&nc>=0&&nc<size&&grid[nr][nc].type==="bulb";
      }).length;
      if(adjBulbs!==cell.clue) blackErrors.add(`${r},${c}`);
    }
  }

  return{lit,conflicts,blackErrors};
}

export function checkLightUp(grid:LightCell[][]): boolean {
  const size=grid.length;
  const{lit,conflicts,blackErrors}=computeLighting(grid);
  if(conflicts.size>0||blackErrors.size>0)return false;
  // Every white cell must be lit
  for(let r=0;r<size;r++)
    for(let c=0;c<size;c++)
      if(grid[r][c].type==="white"&&!lit.has(`${r},${c}`))return false;
  return true;
}
