export type WordBoard = {
  letters: string[];
  solutions: string[];
  minLength: number;
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

// Common English words by length
const WORDS_BY_LENGTH: Record<number, string[]> = {
  3: ["cat","dog","run","fly","big","sun","hat","cup","map","key","bed","box","car","sky","sea","arm","art","age","air","bay","bag"],
  4: ["time","year","game","play","mind","word","book","life","love","hand","home","city","data","face","form","good","help","idea","just","kind"],
  5: ["brain","think","learn","smart","logic","chess","light","space","world","power","music","plant","river","storm","tiger","water","earth","flame","grace","heart"],
  6: ["puzzle","master","simple","castle","dragon","flower","garden","mirror","nature","orange","palace","rabbit","silver","spring","stream","planet","finger","shadow","bridge","temple"],
  7: ["captain","diamond","perfect","magical","kitchen","evening","morning","welcome","warrior","journey","dolphin","sparkle","gravity","pattern","logical","forward","miracle","courage"],
};

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

export function generateWordBoard(seed:string, difficulty:"easy"|"medium"|"hard"): WordBoard {
  const rng=mulberry32(seedToNum(seed));
  function ri<T>(arr:T[]):T{return arr[Math.floor(rng()*arr.length)];}
  function shuffle<T>(arr:T[]):T[]{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

  const minLen=difficulty==="easy"?3:difficulty==="medium"?4:5;
  const numLetters=difficulty==="easy"?7:difficulty==="medium"?9:11;

  // Pick a set of target words
  const allSolutions:string[]=[];
  const lengths=difficulty==="easy"?[3,4]:difficulty==="medium"?[4,5,6]:([5,6,7] as number[]);
  lengths.forEach(len=>{
    const pool=WORDS_BY_LENGTH[len]??[];
    const picks=shuffle(pool).slice(0,3);
    allSolutions.push(...picks);
  });

  // Build letter pool from solutions + some random
  const letterPool:string[]=[];
  allSolutions.forEach(w=>letterPool.push(...w.split("")));
  // Add random consonants
  const extras="bcdfghjklmnpqrstvwxyz".split("");
  while(letterPool.length<numLetters*2) letterPool.push(ri(extras));

  // Pick final letters
  const letters=shuffle(letterPool).slice(0,numLetters).map(l=>l.toUpperCase());

  // Filter solutions to only those buildable from letters
  const letterCounts=new Map<string,number>();
  letters.forEach(l=>{letterCounts.set(l.toLowerCase(),(letterCounts.get(l.toLowerCase())??0)+1);});

  const solutions=allSolutions.filter(word=>{
    const wc=new Map<string,number>();
    word.split("").forEach(c=>{wc.set(c,(wc.get(c)??0)+1);});
    return [...wc.entries()].every(([c,n])=>(letterCounts.get(c)??0)>=n);
  });

  return{letters:shuffle(letters),solutions:[...new Set(solutions)],minLength:minLen,seed,difficulty};
}

export function isValidWord(word:string, board:WordBoard): boolean {
  return board.solutions.includes(word.toLowerCase());
}

export function scoreWord(word:string): number {
  const len=word.length;
  if(len<=3)return 100;
  if(len<=4)return 200;
  if(len<=5)return 350;
  if(len<=6)return 500;
  return 750;
}
