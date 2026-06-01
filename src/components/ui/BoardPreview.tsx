"use client";
import { ReactNode } from "react";
import { useSettingsStore } from "@/store/settingsStore";

type TK = "dark" | "light" | "paper";
interface TH { bg:string; surf2:string; border:string; text:string; muted:string; key:TK }

const THEMES: Record<TK, TH> = {
  dark:  { bg:"#0B0C0F", surf2:"#1D2027", border:"#2A2E37", text:"#F4F6F8", muted:"#868D99", key:"dark"  },
  light: { bg:"#F5F6F8", surf2:"#EDEFF3", border:"#E2E5EB", text:"#15171C", muted:"#5C6370", key:"light" },
  paper: { bg:"#ECE3D0", surf2:"#E5DAC0", border:"#D6C9AB", text:"#241A0C", muted:"#7A6A4A", key:"paper" },
};

const C="#2FE6E0", V="#8E7CFF", G="#FFC24B", E="#54D06A", M="#F5A623", H="#FF5C66";

const SLUG_MAP: Record<string,string> = {
  "logic-path":"logicpath","pattern-match":"patternmatch","2048-pro":"2048",
  "gravity-sort":"gravity","hex-merge":"hexmerge","word-sling":"wordsling",
  "word-climb":"wordclimb","name-country":"namecountry","name-city":"namecity",
};

type CellFn = (r:number,c:number)=>[string|null,ReactNode?];

function MiniGrid({ cols,rows,sz,gp,T,fn }:{ cols:number;rows:number;sz:number;gp:number;T:TH;fn:CellFn }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},${sz}px)`, gap:gp }}>
      {Array.from({length:cols*rows}).map((_,i)=>{
        const r=Math.floor(i/cols),c=i%cols,[bg,child]=fn(r,c);
        return <div key={i} style={{ width:sz,height:sz,borderRadius:Math.max(3,sz*0.22),background:bg??T.bg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>{child}</div>;
      })}
    </div>
  );
}

const Dot = ({ col,d }:{col:string;d?:number}) =>
  <div style={{ width:d??10,height:d??10,borderRadius:"50%",background:col }}/>;
const Sun = ({ s }:{s:number}) =>
  <svg width={s} height={s} viewBox="0 0 20 20"><circle cx="10" cy="10" r="5.5" fill={G}/></svg>;
const Moon = ({ s }:{s:number}) =>
  <svg width={s} height={s} viewBox="0 0 20 20"><path d="M14 4C9 4 6 6.5 6 10C6 13.5 9 16 14 16C10.5 13 10.5 7 14 4Z" fill={V}/></svg>;
const Num = ({ v,sz,color }:{v:ReactNode;sz:number;color?:string}) =>
  <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:sz*0.5,color:color??"inherit",lineHeight:1 }}>{v}</span>;
const Crown = ({ sz }:{sz:number}) =>
  <svg width={sz} height={sz} viewBox="0 0 20 20" fill={V}><path d="M2 14L4 6L8 10L10 4L12 10L16 6L18 14Z"/></svg>;
const Bolt = ({ sz,col }:{sz:number;col:string}) =>
  <svg width={sz} height={sz} viewBox="0 0 20 20" fill={col}><path d="M11 1L4 12L9 12L9 19L16 8L11 8Z"/></svg>;
const Star = ({ sz,col }:{sz:number;col:string}) =>
  <svg width={sz} height={sz} viewBox="0 0 20 20" fill={col}><path d="M10 2L12 7.5L18 8L14 12L15.3 18L10 15L4.7 18L6 12L2 8L8 7.5Z"/></svg>;
const Spark = ({ sz,col }:{sz:number;col:string}) =>
  <svg width={sz} height={sz} viewBox="0 0 20 20"><path d="M10 2L11.5 8.5L18 10L11.5 11.5L10 18L8.5 11.5L2 10L8.5 8.5Z" fill={col}/></svg>;

function renderGame(slug:string, sz:number, gp:number, T:TH): ReactNode {
  const card = T.key==="dark" ? "#2A2E37" : T.surf2;
  const clue = T.key==="dark" ? "#1A1D24" : T.key==="paper" ? "#DACFB4" : "#DCE0E6";
  const G_ = (cols:number,rows:number,fn:CellFn) =>
    <MiniGrid cols={cols} rows={rows} sz={sz} gp={gp} T={T} fn={fn}/>;

  switch (SLUG_MAP[slug]??slug) {
    case "tango": {
      const m=[[1,0,2,0,1],[0,2,0,1,0],[2,0,1,0,2],[0,1,0,2,0],[1,0,2,0,1]];
      return G_(5,5,(r,c)=>[null,m[r][c]===1?<Sun s={sz*.62}/>:m[r][c]===2?<Moon s={sz*.62}/>:null]);
    }
    case "queens": {
      const reg=[[0,0,1,1,2],[0,0,1,2,2],[3,0,1,1,2],[3,3,4,1,2],[3,4,4,4,2]];
      const dk=["#3a2e1e","#2a3550","#3a2540","#243a2e","#3a2430"];
      const lt=["#efe6d2","#dce6f2","#ecdcf2","#dcefe2","#f2dce2"];
      const cols=T.key==="dark"?dk:lt;
      const cr:Record<string,boolean>={"0-0":true,"2-2":true,"4-4":true};
      return G_(5,5,(r,c)=>[cols[reg[r][c]],cr[`${r}-${c}`]?<Crown sz={sz*.6}/>:null]);
    }
    case "sudoku": {
      const m=[["5","","","2","",""],["","","6","","3",""],["","1","","","","4"],["2","","","","5",""],["","4","","1","",""],["","","3","","","6"]];
      return G_(6,6,(r,c)=>[null,m[r][c]?<Num v={m[r][c]} sz={sz}/>:null]);
    }
    case "flow": {
      const dots:Record<string,string>={"0-0":C,"0-4":H,"2-1":G,"4-4":C,"4-0":H,"2-3":G};
      const paths:Record<string,string>={"1-0":C,"2-0":C,"3-0":C,"4-1":C,"4-2":C,"4-3":C,"1-4":H};
      return G_(5,5,(r,c)=>{const k=`${r}-${c}`;return[paths[k]?paths[k]+"33":null,dots[k]?<Dot col={dots[k]} d={sz*.55}/>:null];});
    }
    case "memory": {
      const rev:Record<string,[string,ReactNode]>={"0-1":[T.bg,<Bolt sz={sz*.55} col={G}/>],"1-3":[T.bg,<Spark sz={sz*.55} col={C}/>],"2-0":[T.bg,<Star sz={sz*.55} col={V}/>],"3-2":[T.bg,<Bolt sz={sz*.55} col={G}/>]};
      return G_(4,4,(r,c)=>{const k=`${r}-${c}`;return rev[k]??[card,null];});
    }
    case "zip": {
      const n:Record<string,number>={"0-0":1,"0-4":2,"2-2":3,"4-0":4,"4-4":5};
      return G_(5,5,(r,c)=>{const v=n[`${r}-${c}`];return[v?C+"22":null,v?<Num v={v} sz={sz} color={C}/>:null];});
    }
    case "kakuro":
      return G_(5,5,(r,c)=>{const cl=r===0||c===0;return[cl?clue:null,cl&&(r+c)%2?<Num v={((r*3+c*4)%9)+1} sz={sz*.8} color={T.muted}/>:null];});
    case "logicpath": {
      const path=new Set(["0-0","1-0","2-0","2-1","2-2","3-2","4-2","4-3","4-4"]);
      return G_(5,5,(r,c)=>{const k=`${r}-${c}`;const end=k==="0-0"||k==="4-4";return[path.has(k)?C+"2e":null,end?<Dot col={k==="0-0"?C:G} d={sz*.5}/>:null];});
    }
    case "lightup": {
      const wall:Record<string,number>={"1-1":2,"3-3":1};
      const bulb=new Set(["0-3","2-0","4-4"]);
      return G_(5,5,(r,c)=>{const k=`${r}-${c}`;if(wall[k]!==undefined)return[clue,<Num v={wall[k]} sz={sz*.8} color={H}/>];if(bulb.has(k))return[G+"22",<Dot col={G} d={sz*.5}/>];return[null,null];});
    }
    case "nonogram": {
      const fill=new Set(["0-1","0-2","1-0","1-3","2-0","2-3","3-1","3-2","4-2"]);
      return G_(5,5,(r,c)=>[fill.has(`${r}-${c}`)?C:null,null]);
    }
    case "patternmatch":
      return <div style={{display:"flex",gap:gp,alignItems:"center"}}>{["3","6","12","?"].map((v,i)=><div key={i} style={{width:sz*1.3,height:sz*1.3,borderRadius:sz*.3,background:i===3?"transparent":card,border:`1.5px ${i===3?"dashed":"solid"} ${i===3?C:T.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Num v={v} sz={sz} color={i===3?C:undefined}/></div>)}</div>;
    case "patches": {
      const pal=[C,V,G,E,H,M];
      const map=[[0,0,1,2,2],[0,3,3,2,4],[5,3,1,1,4],[5,5,1,4,4],[5,0,0,0,4]];
      return G_(5,5,(r,c)=>[pal[map[r][c]]+"cc",null]);
    }
    case "2048": {
      const m:Record<string,number>={"0-0":2,"0-1":4,"1-1":8,"1-2":16,"2-2":8,"2-3":32,"3-0":2,"3-2":4,"3-3":64};
      const col:Record<number,string>={2:card,4:C+"55",8:G+"66",16:V+"66",32:M+"77",64:H+"77"};
      return G_(4,4,(r,c)=>{const v=m[`${r}-${c}`];return[v?col[v]:null,v?<Num v={v} sz={sz*.78}/>:null];});
    }
    case "gravity": {
      const cols=[[C,G,V,H],[G,C,H],[V,H,C,G,C],[H,C],[G,V]];
      return <div style={{display:"flex",gap:gp*1.6,alignItems:"flex-end"}}>{cols.map((col,ci)=><div key={ci} style={{width:sz,background:card,borderRadius:sz*.4,padding:gp,display:"flex",flexDirection:"column",gap:gp,justifyContent:"flex-end",height:sz*5.6}}>{col.map((cc,i)=><div key={i} style={{width:sz*.7,height:sz*.7,borderRadius:"50%",background:cc,margin:"0 auto"}}/>)}</div>)}</div>;
    }
    case "hexmerge": {
      const rows=[[2,4,2],[4,8,4,2],[2,4,2]];
      return <div style={{display:"flex",flexDirection:"column",gap:gp}}>{rows.map((row,ri)=><div key={ri} style={{display:"flex",gap:gp,marginLeft:ri===1?0:sz*.55}}>{row.map((v,i)=><div key={i} style={{width:sz*1.05,height:sz*1.05,clipPath:"polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)",background:v>=8?G+"88":v>=4?C+"66":card,display:"flex",alignItems:"center",justifyContent:"center"}}><Num v={v} sz={sz*.7}/></div>)}</div>)}</div>;
    }
    case "wordsling": {
      const letters=[["M","I","N","D"],["T","A","E","S"],["R","O","L","P"],["G","N","I","K"]];
      const hot=new Set(["0-0","0-1","0-2","0-3"]);
      return G_(4,4,(r,c)=>[hot.has(`${r}-${c}`)?G+"cc":card,<Num v={letters[r][c]} sz={sz*.62} color={hot.has(`${r}-${c}`)?"#0B0C0F":T.muted}/>]);
    }
    case "hearts":
      return <div style={{display:"flex"}}>{[0,1,2,3].map(i=><div key={i} style={{width:sz*1.7,height:sz*2.4,borderRadius:sz*.3,background:card,border:`1px solid ${T.border}`,marginLeft:i?-sz*.5:0,display:"flex",alignItems:"center",justifyContent:"center",transform:`rotate(${(i-1.5)*6}deg)`}}><svg width={sz} height={sz} viewBox="0 0 20 20"><path d="M10 16C3 11 3 5 7 6C9 6.4 10 8 10 8.6C10 8 11 6.4 13 6C17 5 17 11 10 16Z" fill={H}/></svg></div>)}</div>;
    case "solitaire":
      return <div style={{display:"flex",gap:gp*1.4,alignItems:"flex-start"}}>{[2,3,1,2].map((cnt,ci)=><div key={ci} style={{position:"relative",width:sz*1.5,height:sz*3.2}}>{Array.from({length:cnt}).map((_,i)=><div key={i} style={{position:"absolute",top:i*sz*.55,left:0,width:sz*1.5,height:sz*2,borderRadius:sz*.25,background:card,border:`1px solid ${T.border}`}}><div style={{padding:2}}><svg width={sz*.6} height={sz*.6} viewBox="0 0 20 20"><path d="M10 16C3 11 3 5 7 6C9 6.4 10 8 10 8.6C10 8 11 6.4 13 6C17 5 17 11 10 16Z" fill={ci%2?H:C}/></svg></div></div>)}</div>)}</div>;
    case "minesweeper": {
      const m:Record<string,string>={"0-2":"f","1-4":"f","2-3":"1","3-1":"f"};
      const nums:Record<string,string>={"0-1":"1","1-1":"2","1-2":"3","2-0":"1","2-4":"1","3-0":"1","3-2":"2","3-4":"3","4-1":"2"};
      const nc:Record<string,string>={1:C,2:E,3:H};
      return G_(5,5,(r,c)=>{const k=`${r}-${c}`;if(m[k]==="f")return[card,<div style={{width:sz*.4,height:sz*.4,background:H,clipPath:"polygon(0 0,100% 35%,0 60%)"}}/>];if(nums[k])return[T.bg,<Num v={nums[k]} sz={sz*.62} color={nc[nums[k]]}/>];return[card,null];});
    }
    case "wordclimb": {
      const words=["DOG","COG","COT","CAT"];
      return <div style={{display:"flex",flexDirection:"column",gap:gp}}>{words.map((w,ri)=><div key={ri} style={{display:"flex",gap:gp,marginLeft:(3-ri)*sz*.4}}>{w.split("").map((ch,i)=><div key={i} style={{width:sz*1.1,height:sz*1.1,borderRadius:sz*.25,background:E+(ri===0?"cc":"55"),display:"flex",alignItems:"center",justifyContent:"center"}}><Num v={ch} sz={sz*.58} color={ri===0?"#0B0C0F":T.text}/></div>)}</div>)}</div>;
    }
    case "pinpoint":
      return <div style={{display:"flex",gap:gp*2,alignItems:"center"}}><div style={{display:"flex",flexDirection:"column",gap:gp}}>{["Movies","Action","Sci-Fi","?"].map((s,i)=><div key={i} style={{width:sz*4,height:sz*.95,borderRadius:sz*.25,background:i===3?"transparent":card,border:`1px ${i===3?"dashed":"solid"} ${i===3?C:T.border}`,display:"flex",alignItems:"center",paddingLeft:4}}><span style={{fontSize:sz*.42,color:i===3?C:T.muted,fontWeight:600}}>{s}</span></div>)}</div><svg width={sz*2.6} height={sz*2.6} viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke={C} strokeWidth="2.5"/><circle cx="20" cy="20" r="8" fill="none" stroke={C} strokeWidth="2.5"/><circle cx="20" cy="20" r="3" fill={G}/></svg></div>;
    case "namecountry":
      return <div style={{display:"flex",alignItems:"center",gap:gp*2}}><div style={{width:sz*.3,height:sz*4,background:T.muted,borderRadius:2}}/><div style={{borderRadius:sz*.2,overflow:"hidden",border:`1px solid ${T.border}`}}>{[C,"#E8EDF2",E].map((c,i)=><div key={i} style={{width:sz*3.6,height:sz,background:c}}/>)}</div><Num v="?" sz={sz*1.2} color={C}/></div>;
    case "namecity": {
      const hs=[2.2,3.4,1.6,4,2.8,3.2,1.8];
      const cs=[C,V,G,C,M,V,C];
      return <div style={{display:"flex",alignItems:"flex-end",gap:gp*1.4,height:sz*5}}>{hs.map((h,i)=><div key={i} style={{width:sz*.9,height:sz*h,background:cs[i]+"cc",borderRadius:`${sz*.2}px ${sz*.2}px 0 0`}}/>)}<Num v="?" sz={sz*1.1} color={G}/></div>;
    }
    case "bridges": {
      const nodes:Array<[number,number,number]>=[[1,1,3],[1,4,2],[3,1,2],[3,4,3],[2,2,4]];
      return G_(5,5,(r,c)=>{const node=nodes.find(([nr,nc])=>nr===r&&nc===c);return[null,node?<div style={{width:sz*.8,height:sz*.8,borderRadius:"50%",background:C,display:"flex",alignItems:"center",justifyContent:"center"}}><Num v={node[2]} sz={sz} color="#0B0C0F"/></div>:null];});
    }
    default:
      return G_(5,5,()=>[null,null]);
  }
}

interface BoardPreviewProps {
  game: string;
  size?: number;
  gap?: number;
  theme?: TK;
}

export function BoardPreview({ game, size = 14, gap = 2, theme }: BoardPreviewProps) {
  const { theme: storeTheme } = useSettingsStore();
  const key = (theme ?? storeTheme ?? "dark") as TK;
  const T = THEMES[key] ?? THEMES.dark;
  return <>{renderGame(game, size, gap, T)}</>;
}
