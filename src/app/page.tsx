"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ChevronRight, ArrowRight, Check,
  Volume2, VolumeX, Sun, Moon, Star, Lock
} from "lucide-react";
import Link from "next/link";
import {
  generateTangoBoard, validateBoard,
  type Cell, type TangoBoard, type CellStatus
} from "@/lib/games/tangoGenerator";
import { playClick, playSuccess } from "@/lib/audio/soundEngine";
import { useSettingsStore } from "@/store/settingsStore";
import { GameIcon, SunIcon, MoonIcon } from "@/components/icons/GameIcons";
import { triggerConfetti } from "@/components/effects/Confetti";

const BASE = "https://ixlcndaryfgkbcjooitu.supabase.co/storage/v1/object/public/asset%20library/";
const IMGS = {
  cafe:   BASE + "2%20women%20at%20a%20cafe%20playing%20phones.jpg",
  street: BASE + "man%20at%20street%20holding%20phone%20playing.jpg",
  subway: BASE + "man%20at%20subway%20playing%20phone.jpg",
  sofa:   BASE + "man%20at%20work%20on%20sofa%20playing%20phone.jpg",
  work_m: BASE + "man%20at%20work%20playing%20phone.jpg",
  dining: BASE + "woman%20at%20dining%20table%20at%20home%20smiling%20holding%20phone.jpg",
  park:   BASE + "woman%20at%20the%20park%20playing%20phone.jpg",
  work_w: BASE + "woman%20at%20work%20playing%20phone.jpg",
  bed:    BASE + "woman%20lying%20in%20bed%20holding%20phone%20smiling.jpg",
};

const PLANS = [
  { name:"Individual", price:"$2",  period:"/mo", features:["All 20 games","1,000 stages each","Daily challenges","Global leaderboard","Infinite mode"], highlight:false },
  { name:"Family · 3", price:"$5",  period:"/mo", features:["3 members","Family leaderboard","All individual perks","Shared streaks","Priority support"], highlight:true },
  { name:"Family · 7", price:"$10", period:"/mo", features:["7 members","Family leaderboard","All individual perks","Shared streaks","Priority support"], highlight:false },
];

// ── REGION PALETTES (darker, matching game) ───────────────────────────────────
const REGION_PALETTE = [
  { fill:"#DBEAFE", border:"#1D4ED8", queen:"#1E3A8A" },
  { fill:"#FED7AA", border:"#C2410C", queen:"#7C2D12" },
  { fill:"#BBF7D0", border:"#15803D", queen:"#14532D" },
  { fill:"#E9D5FF", border:"#7C3AED", queen:"#4C1D95" },
  { fill:"#FECDD3", border:"#BE123C", queen:"#881337" },
];

// ── MINI TANGO — Medium difficulty 5×5 ───────────────────────────────────────
function MiniTango() {
  const [board] = useState<TangoBoard>(() => generateTangoBoard("preview-med-42","medium"));
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>(() => board.puzzle.map(r=>[...r]));
  const [statuses, setStatuses] = useState<CellStatus[][]>(() =>
    board.puzzle.map(r=>r.map(c=>c!==null?"given":"empty"))
  );
  const [solved, setSolved] = useState(false);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());
  const [errorCols, setErrorCols] = useState<Set<number>>(new Set());

  const cm = new Map<string,"same"|"diff">();
  board.constraints.forEach(c=>cm.set(`${c.row1}-${c.col1}-${c.row2}-${c.col2}`,c.type));

  function checkErrors(grid: Cell[][], size: number) {
    const er = new Set<number>(), ec = new Set<number>();
    for (let r=0;r<size;r++){
      const row=grid[r];
      if(!row.every(c=>c!==null))continue;
      const s=row.filter(c=>c==="S").length,m=row.filter(c=>c==="M").length;
      const tri=row.some((c,i)=>i<=size-3&&c!==null&&c===row[i+1]&&c===row[i+2]);
      if(s!==size/2||m!==size/2||tri)er.add(r);
    }
    for(let c=0;c<size;c++){
      const col=grid.map(r=>r[c]);
      if(!col.every(v=>v!==null))continue;
      const s=col.filter(v=>v==="S").length,m=col.filter(v=>v==="M").length;
      const tri=col.some((v,i)=>i<=size-3&&v!==null&&v===col[i+1]&&v===col[i+2]);
      if(s!==size/2||m!==size/2||tri)ec.add(c);
    }
    setErrorRows(er); setErrorCols(ec);
  }

  function handleClick(r:number,c:number){
    if(solved||statuses[r][c]==="given")return;
    const cur=playerGrid[r][c];
    const next:Cell=cur===null?"S":cur==="S"?"M":null;
    const ng=playerGrid.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?next:cell));
    setPlayerGrid(ng); checkErrors(ng, board.size); playClick();
    const ns=validateBoard(board.puzzle,ng,board.solution);
    setStatuses(ns);
    if(ns.every(row=>row.every(s=>s==="correct"||s==="given"))){setSolved(true);playSuccess();}
  }

  const CELL = board.size === 6 ? 30 : 34;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      {solved&&<motion.div initial={{scale:0}} animate={{scale:1}} style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"2px 10px",borderRadius:10}}>Solved! ✓</motion.div>}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${CELL}px)`,gap:4}}>
        {board.puzzle.map((_,r)=>board.puzzle[r].map((_,c)=>{
          const isGiven=statuses[r][c]==="given";
          const value=playerGrid[r][c];
          const isErrorR=errorRows.has(r), isErrorC=errorCols.has(c);
          const hasError=isErrorR||isErrorC;
          const rightC=cm.get(`${r}-${c}-${r}-${c+1}`);
          const bottomC=cm.get(`${r}-${c}-${r+1}-${c}`);
          return(
            <div key={`${r}-${c}`} style={{position:"relative",width:CELL,height:CELL}}>
              <motion.button whileTap={{scale:0.85}} onClick={()=>handleClick(r,c)}
                style={{width:"100%",height:"100%",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
                  border:"1.5px solid",
                  background:hasError?"rgba(239,68,68,0.08)":isGiven?"#F8F7F5":"white",
                  borderColor:isGiven?"#EDE9E4":value?"#DDD6F8":"#EDE9E4",
                  cursor:isGiven?"default":"pointer",outline:"none"}}>
                {value==="S"&&<SunIcon size={CELL*0.52}/>}
                {value==="M"&&<MoonIcon size={CELL*0.52}/>}
                {!value&&<div style={{width:5,height:5,borderRadius:"50%",background:isGiven?"#CCC":"#E8E4DE"}}/>}
              </motion.button>
              {rightC&&c<board.size-1&&(
                <div style={{position:"absolute",right:-5,top:"50%",transform:"translateY(-50%)",zIndex:10,width:10,height:10,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,fontWeight:700,border:`1px solid ${rightC==="same"?"#4F6EF7":"#F87171"}`,color:rightC==="same"?"#4F6EF7":"#F87171"}}>
                  {rightC==="same"?"=":"×"}
                </div>
              )}
              {bottomC&&r<board.size-1&&(
                <div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",zIndex:10,width:10,height:10,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,fontWeight:700,border:`1px solid ${bottomC==="same"?"#4F6EF7":"#F87171"}`,color:bottomC==="same"?"#4F6EF7":"#F87171"}}>
                  {bottomC==="same"?"=":"×"}
                </div>
              )}
            </div>
          );
        }))}
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>Medium · {board.size}×{board.size}</p>
    </div>
  );
}

// ── MINI MEMORY — 4×4 with Lucide-style icons ────────────────────────────────
function MiniMemory() {
  const ICONS = ["🌿","🔥","💧","⭐","🌙","☀️","❄️","💎","🦋","🌸","🦊","🎯"];
  const [cards] = useState(()=>{
    const pairs = ICONS.slice(0,8);
    const arr = [...pairs,...pairs];
    let s=777;
    for(let i=arr.length-1;i>0;i--){s=(s*1664525+1013904223)&0xffffffff;const j=Math.abs(s)%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}
    return arr.map((v,i)=>({id:i,value:v,flipped:false,matched:false}));
  });
  const [state,setState]=useState(cards);
  const [sel,setSel]=useState<number[]>([]);
  const checking=useState(false);
  const CELL=40;

  function flip(id:number){
    const card=state.find(c=>c.id===id);
    if(!card||card.flipped||card.matched||sel.length===2)return;
    const ns=state.map(c=>c.id===id?{...c,flipped:true}:c);
    const nsel=[...sel,id];
    setState(ns); setSel(nsel);
    if(nsel.length===2){
      const [a,b]=nsel.map(sid=>ns.find(c=>c.id===sid)!);
      if(a.value===b.value){
        setState(prev=>prev.map(c=>c.id===a.id||c.id===b.id?{...c,matched:true}:c));
        setSel([]);
      } else {
        setTimeout(()=>{setState(prev=>prev.map(c=>c.id===a.id||c.id===b.id?{...c,flipped:false}:c));setSel([]);},700);
      }
    }
  }

  const matched=state.filter(c=>c.matched).length/2;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(4,${CELL}px)`,gap:5}}>
        {state.map(card=>(
          <motion.button key={card.id} onClick={()=>flip(card.id)} whileTap={{scale:0.88}}
            style={{width:CELL,height:CELL,borderRadius:9,border:"1.5px solid",outline:"none",cursor:card.matched?"default":"pointer",
              background:card.flipped||card.matched?"white":"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
              borderColor:card.matched?"#86EFAC":card.flipped?"#DDD6F8":"transparent",
              fontSize:card.flipped||card.matched?20:0,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:card.matched?"0 0 0 2px #86EFAC":"none"}}>
            {(card.flipped||card.matched)&&card.value}
          </motion.button>
        ))}
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>{matched}/8 pairs · Find all matches</p>
    </div>
  );
}

// ── MINI QUEENS — 6×6 harder board ───────────────────────────────────────────
function MiniQueens() {
  // Handcrafted 6×6 medium board
  const SIZE=6;
  const REGIONS=[
    [0,0,1,1,2,2],
    [0,0,1,1,2,2],
    [3,3,1,4,4,2],
    [3,3,5,4,4,2],
    [3,5,5,5,4,2],
    [3,5,5,5,5,2],
  ];
  const PALS=REGION_PALETTE;
  const [grid,setGrid]=useState<number[][]>(()=>Array.from({length:SIZE},()=>new Array(SIZE).fill(0)));
  const CELL=36;

  function checkWon(g:number[][]){
    const queens:[number,number][]=[];
    g.forEach((row,r)=>row.forEach((v,c)=>{if(v===2)queens.push([r,c]);}));
    if(queens.length!==SIZE)return false;
    const rows=new Set(queens.map(([r])=>r));
    const cols=new Set(queens.map(([,c])=>c));
    const regions=new Set(queens.map(([r,c])=>REGIONS[r][c]));
    if(rows.size!==SIZE||cols.size!==SIZE||regions.size!==SIZE)return false;
    for(let i=0;i<queens.length;i++)for(let j=i+1;j<queens.length;j++){
      const[r1,c1]=queens[i],[r2,c2]=queens[j];
      if(Math.abs(r1-r2)<=1&&Math.abs(c1-c2)<=1)return false;
    }
    return true;
  }

  function toggle(r:number,c:number){
    const cur=grid[r][c];
    const next=cur===0?1:cur===1?2:0;
    const ng=grid.map((row,ri)=>row.map((v,ci)=>ri===r&&ci===c?next:v));
    setGrid(ng);
    if(checkWon(ng))playSuccess();
  }

  const won=checkWon(grid);
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      {won&&<motion.div initial={{scale:0}} animate={{scale:1}} style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"2px 10px",borderRadius:10}}>Solved! ✓</motion.div>}
      <div style={{border:"1.5px solid #374151",borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},${CELL}px)`}}>
          {REGIONS.map((row,r)=>row.map((rid,c)=>{
            const val=grid[r][c];
            const pal=PALS[rid%PALS.length];
            const rd=c<SIZE-1&&REGIONS[r][c+1]!==rid;
            const bd=r<SIZE-1&&REGIONS[r+1][c]!==rid;
            return(
              <button key={`${r}-${c}`} onClick={()=>toggle(r,c)}
                style={{width:CELL,height:CELL,display:"flex",alignItems:"center",justifyContent:"center",
                  background:pal.fill,cursor:"pointer",outline:"none",
                  borderRight:rd?`2px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.12)",
                  borderBottom:bd?`2px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.12)",
                  borderTop:"none",borderLeft:"none",fontSize:CELL*0.45}}>
                {val===1&&<span style={{color:"#64748B",fontWeight:700,lineHeight:1}}>✕</span>}
                {val===2&&<motion.span initial={{scale:0}} animate={{scale:1}} style={{color:pal.queen,lineHeight:1}}>♛</motion.span>}
              </button>
            );
          }))}
        </div>
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>Medium · 6×6 · Tap once=✕ twice=♛</p>
    </div>
  );
}

// ── MINI SUDOKU — 9×9 proper ──────────────────────────────────────────────────
function MiniSudoku() {
  const GIVEN: (number|null)[][] = [
    [5,3,null,null,7,null,null,null,null],
    [6,null,null,1,9,5,null,null,null],
    [null,9,8,null,null,null,null,6,null],
    [8,null,null,null,6,null,null,null,3],
    [4,null,null,8,null,3,null,null,1],
    [7,null,null,null,2,null,null,null,6],
    [null,6,null,null,null,null,2,8,null],
    [null,null,null,4,1,9,null,null,5],
    [null,null,null,null,8,null,null,7,9],
  ];
  const [selected,setSelected]=useState<[number,number]|null>(null);
  const [board,setBoard]=useState(GIVEN.map(r=>[...r]));
  const CELL=26;
  const NUM_C:{[k:number]:string}={1:"#2563EB",2:"#16A34A",3:"#DC2626",4:"#7C3AED",5:"#C2410C",6:"#0891B2",7:"#B45309",8:"#BE185D",9:"#374151"};

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{border:"2px solid #374151",borderRadius:6,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(9,${CELL}px)`}}>
          {board.map((row,r)=>row.map((val,c)=>{
            const isGiven=GIVEN[r][c]!==null;
            const isSel=selected?.[0]===r&&selected?.[1]===c;
            const rb=(c+1)%3===0&&c<8;
            const bb=(r+1)%3===0&&r<8;
            return(
              <button key={`${r}-${c}`} onClick={()=>!isGiven&&setSelected([r,c])}
                style={{width:CELL,height:CELL,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:11,fontWeight:700,cursor:isGiven?"default":"pointer",outline:"none",
                  background:isSel?"#EEF2FF":isGiven?"#F8F7F5":"white",
                  color:isGiven?"#1C1917":NUM_C[val??0]??"transparent",
                  borderRight:rb?"2px solid #374151":"0.5px solid #E2E8F0",
                  borderBottom:bb?"2px solid #374151":"0.5px solid #E2E8F0",
                  borderTop:"none",borderLeft:"none",
                  boxShadow:isSel?"inset 0 0 0 2px #4F6EF7":"none"}}>
                {val??""}</button>
            );
          }))}
        </div>
      </div>
      <div style={{display:"flex",gap:4}}>
        {[1,2,3,4,5,6,7,8,9].map(n=>(
          <button key={n} onClick={()=>{if(!selected)return;const[r,c]=selected;if(GIVEN[r][c]!==null)return;const nb=board.map(row=>[...row]);nb[r][c]=n;setBoard(nb);}}
            style={{width:22,height:22,borderRadius:5,border:"0.5px solid #E2E8F0",background:"white",fontSize:10,fontWeight:700,color:"#374151",cursor:"pointer"}}>
            {n}
          </button>
        ))}
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>Hard · 9×9 · Tap cell then number</p>
    </div>
  );
}

// ── MINI MINESWEEPER — harder board ──────────────────────────────────────────
function MiniMinesweeper() {
  const SIZE=6, MINES=8;
  const LAYOUT=[
    [0,1,false],[0,2,false],[0,4,true],[1,0,true],[1,3,false],
    [2,1,false],[2,5,true],[3,2,true],[3,4,false],[4,0,false],
    [4,3,true],[5,1,true],[5,4,false],[5,5,true],
  ];
  type C={mine:boolean;adj:number;rev:boolean;flag:boolean};
  const [cells,setCells]=useState<C[][]>(()=>{
    const grid:C[][]=Array.from({length:SIZE},()=>Array.from({length:SIZE},()=>({mine:false,adj:0,rev:false,flag:false})));
    LAYOUT.forEach(([r,c,m])=>{if(m)grid[r as number][c as number].mine=true;});
    const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
      if(!grid[r][c].mine) grid[r][c].adj=dirs.filter(([dr,dc])=>{const nr=r+dr,nc=c+dc;return nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&grid[nr][nc].mine;}).length;
    }
    // Pre-reveal some safe cells
    [[0,0],[0,1],[0,2],[0,3],[1,1],[1,2],[2,0],[2,2],[2,3],[3,0],[3,1],[3,3],[4,1],[4,2],[5,0],[5,2],[5,3]].forEach(([r,c])=>{grid[r][c].rev=true;});
    return grid;
  });
  const [dead,setDead]=useState(false);
  const CELL=36;
  const NC:{[k:number]:string}={1:"#2563EB",2:"#16A34A",3:"#DC2626",4:"#7C3AED",5:"#C2410C",6:"#0891B2"};

  function click(r:number,c:number){
    if(dead||cells[r][c].rev||cells[r][c].flag)return;
    if(cells[r][c].mine){setDead(true);setCells(p=>p.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?{...cell,rev:true}:cell)));return;}
    setCells(p=>p.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?{...cell,rev:true}:cell)));
  }
  function flag(e:React.MouseEvent,r:number,c:number){
    e.preventDefault();
    if(cells[r][c].rev)return;
    setCells(p=>p.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?{...cell,flag:!cell.flag}:cell)));
  }

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      {dead&&<div style={{display:"flex",gap:6,alignItems:"center"}}>
        <span style={{fontSize:9,color:"#EF4444",fontWeight:700}}>💥 Mine hit!</span>
        <button onClick={()=>{setDead(false);setCells(prev=>prev.map(row=>row.map(c=>c.mine?{...c,rev:false}:{...c})));}} style={{fontSize:9,color:"#4F6EF7",background:"none",border:"none",cursor:"pointer"}}>Retry</button>
      </div>}
      <div style={{border:"1.5px solid #E2E8F0",borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},${CELL}px)`}}>
          {cells.map((row,r)=>row.map((cell,c)=>(
            <button key={`${r}-${c}`} onClick={()=>click(r,c)} onContextMenu={e=>flag(e,r,c)}
              style={{width:CELL,height:CELL,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,fontWeight:700,cursor:cell.rev?"default":"pointer",outline:"none",
                background:cell.rev?(cell.mine?"#FEF2F2":"#F8F7F5"):cell.flag?"#FFFBEB":"white",
                borderRight:"0.5px solid #E2E8F0",borderBottom:"0.5px solid #E2E8F0",borderTop:"none",borderLeft:"none",
                color:NC[cell.adj]??"transparent",
                boxShadow:!cell.rev&&!cell.flag?"inset 0 1px 0 rgba(255,255,255,0.8),inset 0 -1px 0 rgba(0,0,0,0.06)":"none"}}>
              {cell.flag&&"🚩"}
              {cell.rev&&cell.mine&&"💣"}
              {cell.rev&&!cell.mine&&(cell.adj>0?cell.adj:"")}
            </button>
          )))}
        </div>
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>Medium · 6×6 · Right-click to flag</p>
    </div>
  );
}

// ── MINI ZIP — harder 4×4 ────────────────────────────────────────────────────
function MiniZip() {
  const SIZE=4;
  const WAYPOINTS:{[k:string]:number}={"0,0":1,"0,3":2,"3,3":3,"3,0":4,"1,1":5,"2,2":6};
  const [userPath,setUserPath]=useState<[number,number][]>([[0,0]]);
  const pathSet=new Set(userPath.map(([r,c])=>`${r},${c}`));
  const last=userPath[userPath.length-1];
  const CELL=46;

  function handleClick(r:number,c:number){
    const key=`${r},${c}`;
    if(pathSet.has(key)&&userPath.length>=2&&userPath[userPath.length-2][0]===r&&userPath[userPath.length-2][1]===c){setUserPath(p=>p.slice(0,-1));return;}
    if(pathSet.has(key))return;
    if(Math.abs(last[0]-r)+Math.abs(last[1]-c)!==1)return;
    const wp=WAYPOINTS[key];
    if(wp!==undefined){
      const lastWp=Array.from(WAYPOINTS.entries()).filter(([k])=>pathSet.has(k)).map(([,v])=>v);
      const maxWp=lastWp.length>0?Math.max(...lastWp):0;
      if(wp!==maxWp+1)return;
    }
    setUserPath(p=>[...p,[r,c]]);
  }

  const complete=userPath.length===SIZE*SIZE;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      {complete&&<motion.div initial={{scale:0}} animate={{scale:1}} style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"2px 10px",borderRadius:10}}>Complete! ✓</motion.div>}
      <div style={{position:"relative",width:SIZE*(CELL+5)-5,height:SIZE*(CELL+5)-5}}>
        <svg style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1}} width={SIZE*(CELL+5)-5} height={SIZE*(CELL+5)-5}>
          {userPath.slice(1).map(([r,c],i)=>{
            const[pr,pc]=userPath[i];const step=CELL+5;const cx=CELL/2;
            return<line key={i} x1={pc*step+cx} y1={pr*step+cx} x2={c*step+cx} y2={r*step+cx} stroke="#4F6EF7" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>;
          })}
        </svg>
        {Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>{
          const key=`${r},${c}`;const inPath=pathSet.has(key);const wp=WAYPOINTS[key];const isLast=last[0]===r&&last[1]===c;
          return(
            <motion.button key={key} onClick={()=>handleClick(r,c)} whileTap={{scale:0.88}}
              style={{position:"absolute",left:c*(CELL+5),top:r*(CELL+5),width:CELL,height:CELL,borderRadius:10,border:"1.5px solid",outline:"none",cursor:"pointer",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",
                background:inPath?(isLast?"#EEF2FF":wp?"#F0FDF4":"#F5F7FF"):"white",
                borderColor:inPath?(isLast?"#4F6EF7":wp?"#86EFAC":"#C7D2FE"):"#E2E8F0",
                fontSize:wp?15:0,fontWeight:700,color:wp?"#4F6EF7":"transparent"}}>
              {wp??""}</motion.button>
          );
        }))}
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>Medium · 4×4 · Visit waypoints in order</p>
    </div>
  );
}

// ── GAME DATA ─────────────────────────────────────────────────────────────────
const GAMES = [
  { slug:"tango",         name:"Tango",          desc:"Balance rows & columns",                  free:true,  preview:true  },
  { slug:"memory",        name:"Memory",          desc:"Flip cards, find pairs",                  free:true,  preview:true  },
  { slug:"queens",        name:"Queens",          desc:"One queen per row, col & region",         free:true,  preview:true  },
  { slug:"sudoku",        name:"Mini Sudoku",     desc:"Fill the grid, no repeats",              free:false, preview:true  },
  { slug:"zip",           name:"Zip",             desc:"Trace a path through every cell",         free:false, preview:true  },
  { slug:"minesweeper",   name:"Minesweeper",     desc:"Deduce every mine from clues",            free:false, preview:true  },
  { slug:"patches",       name:"Patches",         desc:"Tile with polyomino shapes",              free:false, preview:false },
  { slug:"hearts",        name:"Hearts",          desc:"Trick-avoidance in solo mode",            free:false, preview:false },
  { slug:"solitaire",     name:"Solitaire",       desc:"Classic Klondike, polished",              free:false, preview:false },
  { slug:"word-sling",    name:"Word Sling",      desc:"Build high-scoring words",                free:false, preview:false },
  { slug:"2048-pro",      name:"2048 Pro",        desc:"Merge tiles to reach 2048",               free:false, preview:false },
  { slug:"logic-path",    name:"Logic Path",      desc:"Connect pipe ends to fill board",         free:false, preview:false },
  { slug:"pattern-match", name:"Pattern Match",   desc:"Identify the rule, complete it",          free:false, preview:false },
  { slug:"hex-merge",     name:"Hex Merge",       desc:"Merge hexagons in chain reactions",       free:false, preview:false },
  { slug:"gravity-sort",  name:"Gravity Sort",    desc:"Sort falling blocks by column",           free:false, preview:false },
  { slug:"bridges",       name:"Bridges",         desc:"Connect islands with right bridges",      free:false, preview:false },
  { slug:"kakuro",        name:"Kakuro",          desc:"Crossword meets Sudoku",                  free:false, preview:false },
  { slug:"nonogram",      name:"Nonogram",        desc:"Solve pixel puzzles from clues",          free:false, preview:false },
  { slug:"flow",          name:"Flow",            desc:"Connect dots without crossing",           free:false, preview:false },
  { slug:"lightup",       name:"Light Up",        desc:"Illuminate every cell once",              free:false, preview:false },
];

const PREVIEWS: Record<string, React.ReactNode> = {
  tango:       <MiniTango/>,
  memory:      <MiniMemory/>,
  queens:      <MiniQueens/>,
  sudoku:      <MiniSudoku/>,
  zip:         <MiniZip/>,
  minesweeper: <MiniMinesweeper/>,
};

// ── GAME CARD ─────────────────────────────────────────────────────────────────
function GameCard({ game, index }: { game: typeof GAMES[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const freeGames = ["tango","memory","queens"];
  const isFree = freeGames.includes(game.slug);
  const href = isFree ? `/games/${game.slug}` : `/games/${game.slug}`;

  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ delay:(index%4)*0.05, duration:0.4 }}>
      <Link href={href} style={{ display:"block", textDecoration:"none" }}>
        <div
          onMouseEnter={()=>setHovered(true)}
          onMouseLeave={()=>setHovered(false)}
          style={{
            background:"white", borderRadius:20,
            border:`0.5px solid ${hovered?"rgba(79,110,247,0.3)":"rgba(0,0,0,0.07)"}`,
            overflow:"hidden", cursor:"pointer",
            boxShadow: hovered
              ? "0 20px 48px rgba(79,110,247,0.14), 0 4px 12px rgba(0,0,0,0.06)"
              : "0 2px 8px rgba(0,0,0,0.04)",
            transform: hovered ? "translateY(-4px)" : "translateY(0)",
            transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}>
          {/* Preview area */}
          <div style={{
            minHeight: game.preview ? 190 : 110,
            background: hovered
              ? "linear-gradient(135deg,rgba(79,110,247,0.07),rgba(156,107,232,0.09))"
              : "rgba(79,110,247,0.04)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding: game.preview ? "18px 14px 14px" : "20px 14px",
            position:"relative",
            transition:"background 0.25s",
          }}>
            {game.preview ? (
              <div style={{ transform:"scale(0.92)", transformOrigin:"center" }}>
                {PREVIEWS[game.slug]}
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                <GameIcon slug={game.slug} size={52}/>
                <span style={{ fontSize:10, color:"#94A3B8", fontWeight:500 }}>Coming in v1.1</span>
              </div>
            )}
            {/* Badge */}
            <div style={{ position:"absolute", top:10, right:10 }}>
              {isFree ? (
                <span style={{ fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:10, background:"rgba(79,110,247,0.12)", color:"#4F6EF7" }}>
                  Free
                </span>
              ) : (
                <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:9, fontWeight:600, padding:"3px 9px", borderRadius:10, background:"rgba(0,0,0,0.06)", color:"#64748B" }}>
                  <Lock size={8}/> Pro
                </span>
              )}
            </div>
          </div>
          {/* Info */}
          <div style={{ padding:"11px 14px 13px" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#1C1917", marginBottom:3 }}>{game.name}</p>
            <p style={{ fontSize:11, color:"#64748B", lineHeight:1.5 }}>{game.desc}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── HERO TANGO DEMO ───────────────────────────────────────────────────────────
function HeroTangoDemo() {
  const [board] = useState<TangoBoard>(() => generateTangoBoard("hero-hard-77","hard"));
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>(() => board.puzzle.map(r=>[...r]));
  const [statuses, setStatuses] = useState<CellStatus[][]>(() =>
    board.puzzle.map(r=>r.map(c=>c!==null?"given":"empty"))
  );
  const [solved, setSolved] = useState(false);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());
  const [errorCols, setErrorCols] = useState<Set<number>>(new Set());
  const [squish, setSquish] = useState<string|null>(null);

  const cm = new Map<string,"same"|"diff">();
  board.constraints.forEach(c=>cm.set(`${c.row1}-${c.col1}-${c.row2}-${c.col2}`,c.type));

  function checkErrors(grid: Cell[][], size: number) {
    const er=new Set<number>(),ec=new Set<number>();
    for(let r=0;r<size;r++){const row=grid[r];if(!row.every(c=>c!==null))continue;const s=row.filter(c=>c==="S").length,m=row.filter(c=>c==="M").length;const tri=row.some((c,i)=>i<=size-3&&c!==null&&c===row[i+1]&&c===row[i+2]);if(s!==size/2||m!==size/2||tri)er.add(r);}
    for(let c=0;c<size;c++){const col=grid.map(r=>r[c]);if(!col.every(v=>v!==null))continue;const s=col.filter(v=>v==="S").length,m=col.filter(v=>v==="M").length;const tri=col.some((v,i)=>i<=size-3&&v!==null&&v===col[i+1]&&v===col[i+2]);if(s!==size/2||m!==size/2||tri)ec.add(c);}
    setErrorRows(er);setErrorCols(ec);
  }

  function handleClick(r:number,c:number){
    if(solved||statuses[r][c]==="given")return;
    const cur=playerGrid[r][c];
    const next:Cell=cur===null?"S":cur==="S"?"M":null;
    const key=`${r}-${c}`;
    setSquish(key);setTimeout(()=>setSquish(null),340);
    const ng=playerGrid.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?next:cell));
    setPlayerGrid(ng);checkErrors(ng,board.size);
    const ns=validateBoard(board.puzzle,ng,board.solution);
    setStatuses(ns);playClick();
    if(ns.every(row=>row.every(s=>s==="correct"||s==="given"))){setSolved(true);playSuccess();setTimeout(()=>triggerConfetti(),80);}
  }

  const CELL=44;
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div>
          <p style={{fontSize:9,color:"#94A3B8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Hard · {board.size}×{board.size} · Free Play</p>
          <p style={{fontSize:13,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif"}}>Tango</p>
        </div>
        <AnimatePresence>
          {solved&&<motion.span initial={{scale:0}} animate={{scale:1}} style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"2px 10px",borderRadius:20}}>✓ Solved!</motion.span>}
        </AnimatePresence>
      </div>
      <div style={{height:3,background:"#EDE9E4",borderRadius:2,marginBottom:12}}>
        <motion.div style={{height:3,background:"linear-gradient(90deg,#4F6EF7,#9C6BE8)",borderRadius:2}} animate={{width:solved?"100%":"28%"}} transition={{duration:0.8}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${CELL}px)`,gap:6,marginBottom:10}}>
        {board.puzzle.map((_,r)=>board.puzzle[r].map((_,c)=>{
          const isGiven=statuses[r][c]==="given";
          const value=playerGrid[r][c];
          const key=`${r}-${c}`;
          const hasError=errorRows.has(r)||errorCols.has(c);
          const rightC=cm.get(`${r}-${c}-${r}-${c+1}`);
          const bottomC=cm.get(`${r}-${c}-${r+1}-${c}`);
          return(
            <div key={key} style={{position:"relative",width:CELL,height:CELL}}>
              <motion.button onClick={()=>handleClick(r,c)}
                whileTap={!isGiven?{scale:0.85}:{}}
                animate={squish===key?{scaleX:[1,0.86,1.08,1],scaleY:[1,1.1,0.94,1]}:{}}
                transition={{duration:0.32}}
                style={{width:"100%",height:"100%",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid",
                  background:hasError?"rgba(239,68,68,0.07)":isGiven?"#F8F7F5":"white",
                  borderColor:isGiven?"#EDE9E4":value?"#DDD6F8":"#EDE9E4",
                  boxShadow:isGiven?"none":value?"0 3px 10px rgba(79,110,247,0.12)":"0 1px 4px rgba(0,0,0,0.05)",
                  cursor:isGiven?"default":"pointer",outline:"none"}}>
                {value==="S"&&<SunIcon size={CELL*0.48}/>}
                {value==="M"&&<MoonIcon size={CELL*0.48}/>}
                {!value&&<div style={{width:6,height:6,borderRadius:"50%",background:isGiven?"#D1CBC1":"#E8E4DE"}}/>}
              </motion.button>
              {rightC&&c<board.size-1&&(
                <div style={{position:"absolute",right:-6,top:"50%",transform:"translateY(-50%)",zIndex:10,width:12,height:12,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,border:`1.5px solid ${rightC==="same"?"#4F6EF7":"#F87171"}`,color:rightC==="same"?"#4F6EF7":"#F87171"}}>
                  {rightC==="same"?"=":"×"}
                </div>
              )}
              {bottomC&&r<board.size-1&&(
                <div style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",zIndex:10,width:12,height:12,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,border:`1.5px solid ${bottomC==="same"?"#4F6EF7":"#F87171"}`,color:bottomC==="same"?"#4F6EF7":"#F87171"}}>
                  {bottomC==="same"?"=":"×"}
                </div>
              )}
            </div>
          );
        }))}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
        <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#94A3B8"}}><SunIcon size={11}/> Sun</span>
        <span style={{color:"#E2E8F0"}}>·</span>
        <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#94A3B8"}}><MoonIcon size={11}/> Moon</span>
        <span style={{color:"#E2E8F0"}}>·</span>
        <button onClick={()=>{setPlayerGrid(board.puzzle.map(r=>[...r]));setStatuses(board.puzzle.map(r=>r.map(c=>c!==null?"given":"empty")));setSolved(false);setErrorRows(new Set());setErrorCols(new Set());}}
          style={{fontSize:10,color:"#4F6EF7",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Reset</button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isSilentMode, toggleSilentMode, theme, toggleTheme } = useSettingsStore();
  const W = { maxWidth:1100, margin:"0 auto", padding:"0 40px" };

  return (
    <div style={{background:"#FDFCFB",minHeight:"100vh",color:"#1C1917"}}>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,background:"rgba(253,252,251,0.93)",backdropFilter:"blur(20px)",borderBottom:"0.5px solid rgba(0,0,0,0.07)",padding:"0 40px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
          <img src="/icons/icon-192.png" alt="MindState" style={{width:32,height:32,borderRadius:"22.5%",objectFit:"cover"}}/>
          <span style={{fontWeight:700,fontSize:16,color:"#1C1917",fontFamily:"Georgia,serif"}}>MindState</span>
        </Link>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <Link href="/games" style={{fontSize:13,color:"#64748B",padding:"6px 12px",borderRadius:10,textDecoration:"none"}}>Games</Link>
          <button onClick={toggleSilentMode} style={{padding:7,borderRadius:9,background:"transparent",border:"none",cursor:"pointer",color:"#94A3B8",display:"flex"}}>
            {isSilentMode?<VolumeX size={15}/>:<Volume2 size={15}/>}
          </button>
          <button onClick={toggleTheme} style={{padding:7,borderRadius:9,background:"transparent",border:"none",cursor:"pointer",color:"#94A3B8",display:"flex"}}>
            {theme==="dark"?<Sun size={15}/>:<Moon size={15}/>}
          </button>
          <Link href="/auth/signin" style={{fontSize:13,color:"#64748B",padding:"6px 12px",borderRadius:10,textDecoration:"none"}}>Sign in</Link>
          <Link href="/auth/signup" style={{fontSize:13,fontWeight:700,color:"white",padding:"8px 16px",borderRadius:12,background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",textDecoration:"none",boxShadow:"0 3px 10px rgba(79,110,247,0.25)"}}>Start Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-grid" style={{...W,paddingTop:100,paddingBottom:72,minHeight:"100vh"}}>
        <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.6}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,background:"white",border:"0.5px solid rgba(0,0,0,0.08)",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",marginBottom:24,fontSize:12,color:"#64748B",fontWeight:500}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#22C55E",display:"block"}}/>
            20 Games · 1,000 Stages Each · Free to Start
          </div>
          <h1 className="hero-h1" style={{fontFamily:"Georgia,serif",fontWeight:700,lineHeight:1.08,marginBottom:20}}>
            <span style={{display:"block",color:"#1C1917"}}>Sharper</span>
            <span style={{display:"block",fontStyle:"italic",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8,#C4785A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Every Day.</span>
          </h1>
          <p style={{fontSize:16,color:"#64748B",lineHeight:1.7,marginBottom:28,maxWidth:400}}>
            Explore 20 logic disciplines and 1,000 hand-crafted stages each. An elegant training suite for the modern mind.
          </p>
          <div style={{display:"flex",gap:12,marginBottom:36,flexWrap:"wrap"}}>
            <Link href="/auth/signup" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"13px 24px",borderRadius:14,background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",color:"white",fontWeight:700,fontSize:14,textDecoration:"none",boxShadow:"0 6px 20px rgba(79,110,247,0.3)"}}>
              Begin Training <ChevronRight size={15}/>
            </Link>
            <Link href="/games" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"13px 24px",borderRadius:14,background:"white",color:"#374151",fontWeight:600,fontSize:14,textDecoration:"none",border:"0.5px solid rgba(0,0,0,0.1)",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              Explore Games <ArrowRight size={14}/>
            </Link>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{display:"flex"}}>
              {[IMGS.cafe,IMGS.park,IMGS.work_w,IMGS.subway,IMGS.dining].map((img,i)=>(
                <div key={i} style={{width:32,height:32,borderRadius:"50%",border:"2px solid white",marginLeft:i>0?-10:0,position:"relative",zIndex:5-i,overflow:"hidden",boxShadow:"0 2px 6px rgba(0,0,0,0.15)"}}>
                  <img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
              ))}
            </div>
            <div>
              <div style={{display:"flex",gap:1,marginBottom:3}}>
                {[1,2,3,4,5].map(i=><Star key={i} size={12} fill="#F59E0B" color="#F59E0B"/>)}
              </div>
              <p style={{fontSize:12,color:"#94A3B8"}}>Loved by players everywhere</p>
            </div>
          </div>
        </motion.div>

        {/* Device frame */}
        <motion.div className="hero-device" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.6,delay:0.15}} style={{display:"flex",justifyContent:"center"}}>
          <div style={{position:"relative"}}>
            <div style={{background:"linear-gradient(145deg,#E8E4DE,#CEC9C1)",borderRadius:28,padding:10,boxShadow:"0 32px 64px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.5)"}}>
              <div style={{background:"#FDFCFB",borderRadius:20,overflow:"hidden",minWidth:320}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:"rgba(255,255,255,0.9)",borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}>
                  <span style={{fontSize:10,fontWeight:600,color:"#94A3B8",fontFamily:"monospace"}}>9:41</span>
                  <div style={{display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:"#E2E8F0"}}/>)}</div>
                </div>
                <div style={{padding:"14px 16px 16px"}}><HeroTangoDemo/></div>
                <div style={{padding:"0 16px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#CBD5E1"}}>No account needed</span>
                  <Link href="/games/tango" style={{fontSize:11,fontWeight:600,color:"#4F6EF7",display:"flex",alignItems:"center",gap:3,textDecoration:"none"}}>Full game <ArrowRight size={10}/></Link>
                </div>
              </div>
            </div>
            <div style={{position:"absolute",bottom:-10,left:"15%",right:"15%",height:16,background:"rgba(79,110,247,0.18)",filter:"blur(14px)",borderRadius:"50%"}}/>
          </div>
        </motion.div>
      </section>

      {/* LIFESTYLE STRIP */}
      <section style={{paddingBottom:72,overflow:"hidden"}}>
        <div className="lifestyle-strip">
          {[
            {img:IMGS.cafe,label:"At the café"},
            {img:IMGS.subway,label:"On the commute"},
            {img:IMGS.park,label:"In the park"},
            {img:IMGS.work_w,label:"At work"},
            {img:IMGS.bed,label:"Before bed"},
            {img:IMGS.sofa,label:"On the sofa"},
            {img:IMGS.dining,label:"At home"},
            {img:IMGS.street,label:"On the go"},
          ].map((item,i)=>(
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}
              style={{flexShrink:0,position:"relative",borderRadius:20,overflow:"hidden",width:190,height:250,boxShadow:"0 8px 24px rgba(0,0,0,0.12)"}}>
              <img src={item.img} alt={item.label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"28px 14px 12px",background:"linear-gradient(transparent,rgba(0,0,0,0.55))",color:"white",fontSize:11,fontWeight:600}}>
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* GAMES — 4 cols, live previews */}
      <section style={{...W,paddingBottom:72}}>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{marginBottom:28}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:"#94A3B8",marginBottom:8}}>The Collection</p>
          <h2 style={{fontSize:36,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",marginBottom:8,lineHeight:1.1}}>
            Twenty Games.<br/>
            <em style={{fontStyle:"italic",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>One Subscription.</em>
          </h2>
          <p style={{fontSize:14,color:"#64748B",lineHeight:1.7,maxWidth:500}}>
            Every game includes a free Daily Challenge. Subscribe to unlock all 1,000 stages, Infinite Mode, and family leaderboards.
          </p>
        </motion.div>
        <div className="games-grid-4">
          {GAMES.map((game,i)=><GameCard key={game.slug} game={game} index={i}/>)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{background:"white",borderTop:"0.5px solid rgba(0,0,0,0.06)",borderBottom:"0.5px solid rgba(0,0,0,0.06)",padding:"64px 40px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <h2 style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:34,color:"#1C1917",textAlign:"center",marginBottom:48}}>Built for the Modern Mind</h2>
          <div className="how-grid">
            {[
              {from:"#4F6EF7",to:"#7C4FD4",num:"01",title:"Choose a discipline",body:"20 logic games, each with its own rhythm. Start free with the Daily Challenge — no account needed."},
              {from:"#9C6BE8",to:"#C4785A",num:"02",title:"Train daily",body:"XP decays in real time. The faster you solve, the more you earn. Streaks and hints shape your score."},
              {from:"#7C9E87",to:"#4A7C59",num:"03",title:"Master & compete",body:"Family leaderboards, shareable challenge links, and real-time celebrations when records fall."},
            ].map((s,i)=>(
              <motion.div key={i} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
                style={{background:"#FDFCFB",borderRadius:20,border:"0.5px solid rgba(0,0,0,0.07)",padding:24,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                <div style={{width:40,height:40,borderRadius:"22.5%",background:`linear-gradient(135deg,${s.from},${s.to})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",fontFamily:"Georgia,serif",marginBottom:14}}>
                  {s.num}
                </div>
                <p style={{fontSize:15,fontWeight:700,color:"#1C1917",marginBottom:8}}>{s.title}</p>
                <p style={{fontSize:13,color:"#64748B",lineHeight:1.65}}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FULL WIDTH CTA */}
      <section style={{position:"relative",height:420,overflow:"hidden"}}>
        <img src={IMGS.work_m} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(79,110,247,0.85),rgba(156,107,232,0.75))"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 40px"}}>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <h2 style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:40,color:"white",marginBottom:12,lineHeight:1.1}}>
              Your sharpest self<br/><em>starts here.</em>
            </h2>
            <p style={{fontSize:15,color:"rgba(255,255,255,0.8)",marginBottom:28,maxWidth:400}}>
              Join thousands of players training their minds daily. It only takes one stage to get hooked.
            </p>
            <Link href="/auth/signup" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 28px",borderRadius:16,background:"white",color:"#4F6EF7",fontWeight:700,fontSize:15,textDecoration:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>
              Start Free Today <ChevronRight size={16}/>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{...W,paddingTop:72,paddingBottom:72}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <h2 style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:34,color:"#1C1917",marginBottom:8}}>Simple, Honest Pricing</h2>
          <p style={{fontSize:14,color:"#94A3B8"}}>Less than a coffee. Sharper than ever.</p>
        </div>
        <div className="pricing-grid" style={{alignItems:"start",maxWidth:860,margin:"0 auto"}}>
          {PLANS.map((plan,i)=>(
            <motion.div key={i} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              style={{borderRadius:22,padding:26,position:"relative",
                background:plan.highlight?"linear-gradient(135deg,#4F6EF7,#9C6BE8)":"white",
                border:plan.highlight?"none":"0.5px solid rgba(0,0,0,0.08)",
                boxShadow:plan.highlight?"0 20px 48px rgba(79,110,247,0.28)":"0 2px 8px rgba(0,0,0,0.04)",
                color:plan.highlight?"white":"#1C1917"}}>
              {plan.highlight&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",fontSize:10,fontWeight:700,color:"#4F6EF7",background:"white",padding:"4px 14px",borderRadius:20,boxShadow:"0 2px 8px rgba(0,0,0,0.1)",whiteSpace:"nowrap"}}>Most Popular</div>}
              <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,color:plan.highlight?"rgba(255,255,255,0.65)":"#94A3B8"}}>{plan.name}</p>
              <div style={{display:"flex",alignItems:"flex-end",gap:4,marginBottom:20}}>
                <span style={{fontSize:46,fontWeight:700,lineHeight:1,fontFamily:"Georgia,serif"}}>{plan.price}</span>
                <span style={{fontSize:13,paddingBottom:6,opacity:0.6}}>{plan.period}</span>
              </div>
              <ul style={{listStyle:"none",marginBottom:22,display:"flex",flexDirection:"column",gap:9}}>
                {plan.features.map((f,j)=>(
                  <li key={j} style={{display:"flex",alignItems:"center",gap:9,fontSize:13,color:plan.highlight?"rgba(255,255,255,0.88)":"#374151"}}>
                    <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:plan.highlight?"rgba(255,255,255,0.2)":"#EEF2FF"}}>
                      <Check size={9} color={plan.highlight?"white":"#4F6EF7"}/>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" style={{display:"block",textAlign:"center",padding:"12px",borderRadius:14,fontWeight:700,fontSize:13,textDecoration:"none",
                background:plan.highlight?"white":"transparent",color:plan.highlight?"#4F6EF7":"#374151",
                border:plan.highlight?"none":"1.5px solid rgba(0,0,0,0.12)"}}>
                Start Free Trial
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"0.5px solid rgba(0,0,0,0.06)",background:"rgba(255,255,255,0.8)",padding:"28px 40px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
            <img src="/icons/icon-192.png" alt="MindState" style={{width:24,height:24,borderRadius:"22.5%",objectFit:"cover"}}/>
            <span style={{fontWeight:700,fontSize:13,color:"#374151",fontFamily:"Georgia,serif"}}>MindState</span>
          </Link>
          <p style={{fontSize:12,color:"#CBD5E1"}}>&copy; {new Date().getFullYear()} MindState. All rights reserved.</p>
          <div style={{display:"flex",gap:20}}>
            {[["Games","/games"],["Pricing","/pricing"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h])=>(
              <Link key={l} href={h} style={{fontSize:12,color:"#94A3B8",textDecoration:"none"}}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
