export type HexBoard = {
  radius: number;
  cells: Map<string, number>;   // "q,r" -> value (0=empty)
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

export const HEX_DIRS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];

function hexKey(q:number,r:number){return`${q},${r}`;}

export function generateHex(seed:string, difficulty:"easy"|"medium"|"hard"): HexBoard {
  const radius = difficulty==="easy"?2:difficulty==="medium"?3:4;
  const rng = mulberry32(seedToNum(seed));
  const cells = new Map<string,number>();

  // Generate all hex coords within radius
  for(let q=-radius;q<=radius;q++){
    const r1=Math.max(-radius,-q-radius);
    const r2=Math.min(radius,-q+radius);
    for(let r=r1;r<=r2;r++) cells.set(hexKey(q,r),0);
  }

  // Place tiles ensuring adjacent pairs exist for merging
  const vals=[1,2,4,8,16];
  const keys=[...cells.keys()];
  const numTiles=difficulty==="easy"?8:difficulty==="medium"?14:20;
  // First place pairs of matching tiles on adjacent cells
  const numPairs=Math.floor(numTiles/2);
  let placed=0;
  for(let p=0;p<numPairs&&placed<numTiles-1;p++){
    const val=vals[Math.floor(rng()*3)]; // 1,2,4 for easy merging
    const k=keys[Math.floor(rng()*keys.length)];
    const[q,r]=k.split(",").map(Number);
    const dirs=HEX_DIRS.filter(([dq,dr])=>cells.has(hexKey(q+dq,r+dr)));
    if(!dirs.length)continue;
    const[dq,dr]=dirs[Math.floor(rng()*dirs.length)];
    cells.set(k,val);
    cells.set(hexKey(q+dq,r+dr),val);
    placed+=2;
  }
  // Fill remaining with random values
  for(let i=placed;i<numTiles;i++){
    const k=keys[Math.floor(rng()*keys.length)];
    if(cells.get(k)===0)cells.set(k,vals[Math.floor(rng()*vals.length)]);
  }

  return{radius,cells,seed,difficulty};
}

export function hexToPixel(q:number,r:number,size:number):[number,number]{
  const x=size*(3/2*q);
  const y=size*(Math.sqrt(3)/2*q+Math.sqrt(3)*r);
  return[x,y];
}

export function mergeCells(cells:Map<string,number>,q:number,r:number,tq:number,tr:number):Map<string,number>|null{
  const src=cells.get(hexKey(q,r));
  const tgt=cells.get(hexKey(tq,tr));
  if(!src||!tgt||src!==tgt)return null;
  const nc=new Map(cells);
  nc.set(hexKey(q,r),0);
  nc.set(hexKey(tq,tr),src*2);
  return nc;
}

export function checkHexWin(cells:Map<string,number>,target:number):boolean{
  return [...cells.values()].some(v=>v>=target);
}
