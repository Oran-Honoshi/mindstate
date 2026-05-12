export type PatternType = "arithmetic"|"geometric"|"fibonacci"|"alternating"|"color"|"shape";
export type PatternItem = { value: string; color?: string };
export type PatternBoard = {
  sequence: PatternItem[];
  answer: PatternItem;
  options: PatternItem[];
  rule: string;
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

const SHAPES=["●","■","▲","◆","★","","⬟","⬠"];
const COLORS=["#EF4444","#3B82F6","#22C55E","#F59E0B","#A855F7","#EC4899","#14B8A6","#F97316"];

export function generatePattern(seed:string, difficulty:"easy"|"medium"|"hard"): PatternBoard {
  const rng=mulberry32(seedToNum(seed));
  const seqLen=difficulty==="easy"?4:difficulty==="medium"?5:6;

  function ri(arr:any[]){return arr[Math.floor(rng()*arr.length)];}
  function pick(min:number,max:number){return Math.floor(rng()*(max-min+1))+min;}

  const type=difficulty==="easy"
    ?ri(["arithmetic","alternating"])
    :difficulty==="medium"
    ?ri(["arithmetic","geometric","fibonacci","alternating"])
    :ri(["arithmetic","geometric","fibonacci","alternating","color","shape"]);

  let sequence:PatternItem[]=[];
  let answer:PatternItem;
  let rule="";

  switch(type){
    case "arithmetic":{
      const start=pick(1,20);const step=pick(1,difficulty==="hard"?15:8);
      const nums=Array.from({length:seqLen+1},(_,i)=>start+i*step);
      sequence=nums.slice(0,seqLen).map(n=>({value:String(n)}));
      answer={value:String(nums[seqLen])};
      rule=`Add ${step} each time`;break;
    }
    case "geometric":{
      const start=pick(1,5);const ratio=pick(2,difficulty==="hard"?4:3);
      const nums=Array.from({length:seqLen+1},(_,i)=>start*Math.pow(ratio,i));
      sequence=nums.slice(0,seqLen).map(n=>({value:String(n)}));
      answer={value:String(nums[seqLen])};
      rule=`Multiply by ${ratio} each time`;break;
    }
    case "fibonacci":{
      const a=pick(1,5),b=pick(1,5);
      const nums=[a,b];while(nums.length<seqLen+1)nums.push(nums[nums.length-1]+nums[nums.length-2]);
      sequence=nums.slice(0,seqLen).map(n=>({value:String(n)}));
      answer={value:String(nums[seqLen])};
      rule="Each number = sum of previous two";break;
    }
    case "alternating":{
      const a=pick(1,30),b=pick(1,30),step=pick(1,5);
      const nums:number[]=[];
      for(let i=0;i<seqLen+1;i++)nums.push(i%2===0?a+Math.floor(i/2)*step:b+Math.floor(i/2)*step);
      sequence=nums.slice(0,seqLen).map(n=>({value:String(n)}));
      answer={value:String(nums[seqLen])};
      rule="Two alternating sequences";break;
    }
    case "color":{
      const palette=SHAPES.slice(0,3);const colors=COLORS.slice(0,3);
      const items:PatternItem[]=[];
      for(let i=0;i<seqLen+1;i++)items.push({value:palette[i%palette.length],color:colors[i%colors.length]});
      sequence=items.slice(0,seqLen);answer=items[seqLen];
      rule="Color and shape both cycle";break;
    }
    case "shape":{
      const shapes=SHAPES.slice(0,4);
      const items=Array.from({length:seqLen+1},(_,i)=>({value:shapes[i%shapes.length],color:COLORS[Math.floor(i/shapes.length)%COLORS.length]}));
      sequence=items.slice(0,seqLen);answer=items[seqLen];
      rule="Shape cycles, color changes per cycle";break;
    }
    default:{
      sequence=Array.from({length:seqLen},(_,i)=>({value:String(i+1)}));
      answer={value:String(seqLen+1)};rule="Count up";
    }
  }

  // Generate wrong options
  const opts:PatternItem[]=[answer];
  const isNum=!isNaN(Number(answer.value));
  while(opts.length<4){
    let wrong:PatternItem;
    if(isNum){
      const n=Number(answer.value);
      const delta=pick(-15,15);
      const candidate=n+delta;
      if(candidate<=0||opts.some(o=>o.value===String(candidate)))continue;
      wrong={value:String(candidate)};
    } else {
      const s=ri(SHAPES),c=ri(COLORS);
      if(opts.some(o=>o.value===s&&o.color===c))continue;
      wrong={value:s,color:c};
    }
    opts.push(wrong);
  }
  // Shuffle options
  for(let i=opts.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]];}

  return{sequence,answer,options:opts,rule,seed,difficulty};
}
