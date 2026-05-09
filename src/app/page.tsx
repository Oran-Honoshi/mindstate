"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ChevronRight, ArrowRight, Check,
  Volume2, VolumeX, Sun, Moon, Star, Quote
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
  { name:"Individual", price:"$2",  features:["All 20 games","1000 stages/game","Daily challenges","Global leaderboard","Infinite mode"], highlight:false },
  { name:"Family · 3", price:"$5",  features:["3 members","Family leaderboard","All individual perks","Shared streaks","Priority support"], highlight:true },
  { name:"Family · 7", price:"$10", features:["7 members","Family leaderboard","All individual perks","Shared streaks","Priority support"], highlight:false },
];

// ── Mini game previews ────────────────────────────────────────────────────────

function MiniTango() {
  const [board] = useState<TangoBoard>(() => generateTangoBoard("preview-easy-1","easy"));
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>(() => board.puzzle.map(r=>[...r]));
  const [statuses, setStatuses] = useState<CellStatus[][]>(() =>
    board.puzzle.map(r=>r.map(c=>c!==null?"given":"empty"))
  );
  const [solved, setSolved] = useState(false);
  const cm = new Map<string,"same"|"diff">();
  board.constraints.forEach(c=>cm.set(`${c.row1}-${c.col1}-${c.row2}-${c.col2}`,c.type));

  function handleClick(r:number,c:number){
    if(solved||statuses[r][c]==="given")return;
    const cur=playerGrid[r][c];
    const next:Cell=cur===null?"S":cur==="S"?"M":null;
    const ng=playerGrid.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?next:cell));
    setPlayerGrid(ng);
    const ns=validateBoard(board.puzzle,ng,board.solution);
    setStatuses(ns); playClick();
    if(ns.every(row=>row.every(s=>s==="correct"||s==="given"))){setSolved(true);playSuccess();}
  }

  const CELL=36;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      {solved && <div style={{fontSize:9,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"1px 8px",borderRadius:10,marginBottom:2}}>Solved! ✓</div>}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${CELL}px)`,gap:5}}>
        {board.puzzle.map((_,r)=>board.puzzle[r].map((_,c)=>{
          const isGiven=statuses[r][c]==="given";
          const value=playerGrid[r][c];
          const rightC=cm.get(`${r}-${c}-${r}-${c+1}`);
          const bottomC=cm.get(`${r}-${c}-${r+1}-${c}`);
          return (
            <div key={`${r}-${c}`} style={{position:"relative",width:CELL,height:CELL}}>
              <motion.button whileTap={{scale:0.85}} onClick={()=>handleClick(r,c)}
                style={{width:"100%",height:"100%",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
                  border:"1.5px solid",background:isGiven?"#F8F7F5":"white",
                  borderColor:isGiven?"#EDE9E4":value?"#DDD6F8":"#EDE9E4",
                  cursor:isGiven?"default":"pointer",outline:"none",
                  boxShadow:value?"0 2px 8px rgba(79,110,247,0.1)":"none"}}>
                {value==="S"&&<SunIcon size={18}/>}
                {value==="M"&&<MoonIcon size={18}/>}
                {!value&&<div style={{width:5,height:5,borderRadius:"50%",background:isGiven?"#CCC":"#E8E4DE"}}/>}
              </motion.button>
              {rightC&&c<board.size-1&&(
                <div style={{position:"absolute",right:-6,top:"50%",transform:"translateY(-50%)",zIndex:10,
                  width:12,height:12,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:7,fontWeight:700,border:`1px solid ${rightC==="same"?"#4F6EF7":"#F87171"}`,
                  color:rightC==="same"?"#4F6EF7":"#F87171"}}>
                  {rightC==="same"?"=":"×"}
                </div>
              )}
              {bottomC&&r<board.size-1&&(
                <div style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",zIndex:10,
                  width:12,height:12,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:7,fontWeight:700,border:`1px solid ${bottomC==="same"?"#4F6EF7":"#F87171"}`,
                  color:bottomC==="same"?"#4F6EF7":"#F87171"}}>
                  {bottomC==="same"?"=":"×"}
                </div>
              )}
            </div>
          );
        }))}
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>Click cells to play</p>
    </div>
  );
}

function MiniMemory() {
  const ICONS = ["🌿","🔥","💧","⭐","🌙","☀️","❄️","💎"];
  const [cards] = useState(() => {
    const doubled = [...ICONS,...ICONS];
    const seed = 42;
    let s = seed;
    const arr = [...doubled];
    for(let i=arr.length-1;i>0;i--){s=(s*1664525+1013904223)&0xffffffff;const j=Math.abs(s)%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}
    return arr.map((v,i)=>({id:i,value:v,flipped:false,matched:false}));
  });
  const [state,setState] = useState(cards);
  const [sel,setSel] = useState<number[]>([]);
  const checking = useState(false);

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
        setTimeout(()=>{
          setState(prev=>prev.map(c=>c.id===a.id||c.id===b.id?{...c,flipped:false}:c));
          setSel([]);
        },700);
      }
    }
  }

  const CELL=38;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(4,${CELL}px)`,gap:5}}>
        {state.map(card=>(
          <motion.button key={card.id} onClick={()=>flip(card.id)} whileTap={{scale:0.88}}
            style={{width:CELL,height:CELL,borderRadius:8,border:"1.5px solid",outline:"none",cursor:"pointer",
              background:card.flipped||card.matched?"white":"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
              borderColor:card.matched?"#86EFAC":card.flipped?"#EDE9E4":"transparent",
              fontSize:card.flipped||card.matched?18:0,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
            {(card.flipped||card.matched)&&card.value}
          </motion.button>
        ))}
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>Find matching pairs</p>
    </div>
  );
}

function MiniQueens() {
  const SIZE=5;
  const REGIONS=[[0,0,0,1,1],[0,0,1,1,2],[3,3,1,2,2],[3,4,4,4,2],[3,3,4,4,4]];
  const PALS=[
    {fill:"#EFF6FF",border:"#3B82F6",queen:"#1D4ED8"},
    {fill:"#FFF7ED",border:"#F97316",queen:"#C2410C"},
    {fill:"#F0FDF4",border:"#22C55E",queen:"#15803D"},
    {fill:"#FDF4FF",border:"#A855F7",queen:"#7E22CE"},
    {fill:"#FFFBEB",border:"#EAB308",queen:"#A16207"},
  ];
  const [queens,setQueens]=useState<Set<string>>(new Set());
  const CELL=34;

  function toggle(r:number,c:number){
    const key=`${r},${c}`;
    const nq=new Set(queens);
    if(nq.has(key))nq.delete(key); else nq.add(key);
    setQueens(nq);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{border:"1.5px solid #E2E8F0",borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},${CELL}px)`}}>
          {REGIONS.map((row,r)=>row.map((regionId,c)=>{
            const key=`${r},${c}`;
            const hasQueen=queens.has(key);
            const pal=PALS[regionId];
            const rightDiff=c<SIZE-1&&REGIONS[r][c+1]!==regionId;
            const bottomDiff=r<SIZE-1&&REGIONS[r+1][c]!==regionId;
            return (
              <button key={key} onClick={()=>toggle(r,c)}
                style={{width:CELL,height:CELL,display:"flex",alignItems:"center",justifyContent:"center",
                  background:pal.fill,cursor:"pointer",outline:"none",fontSize:18,
                  borderTop:"none",borderLeft:"none",
                  borderRight:rightDiff?`2px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.1)",
                  borderBottom:bottomDiff?`2px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.1)"}}>
                {hasQueen&&<span style={{color:pal.queen,lineHeight:1,fontSize:16}}>♛</span>}
              </button>
            );
          }))}
        </div>
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>One queen per region</p>
    </div>
  );
}

function MiniSudoku() {
  const GRID=[[4,null,6,null,null,3],[null,3,null,6,null,null],[null,null,3,null,6,null],[3,null,null,4,null,6],[null,6,null,null,3,null],[6,null,4,null,null,4]];
  const BOX_R=2,BOX_C=3,SIZE=6;
  const CELL=28;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{border:"2px solid #DC2626",borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},${CELL}px)`}}>
          {GRID.map((row,r)=>row.map((val,c)=>{
            const rightBox=(c+1)%BOX_C===0&&c<SIZE-1;
            const bottomBox=(r+1)%BOX_R===0&&r<SIZE-1;
            return (
              <div key={`${r}-${c}`} style={{width:CELL,height:CELL,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:700,color:val?"#DC2626":"#CBD5E1",
                background:val?"#FEF2F2":"#FDFCFB",
                borderRight:rightBox?"2px solid #DC2626":"0.5px solid rgba(0,0,0,0.1)",
                borderBottom:bottomBox?"2px solid #DC2626":"0.5px solid rgba(0,0,0,0.1)",
                borderTop:"none",borderLeft:"none"}}>
                {val||""}
              </div>
            );
          }))}
        </div>
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>No repeats in rows or boxes</p>
    </div>
  );
}

function MiniZip() {
  const PATH=[[0,0],[0,1],[0,2],[1,2],[2,2],[2,1],[2,0],[1,0],[1,1]];
  const WAYPOINTS:{[k:string]:number}={"0,0":1,"0,2":2,"2,2":3,"2,0":4,"1,1":5};
  const SIZE=3,CELL=44;
  const [userPath,setUserPath]=useState<[number,number][]>([[0,0]]);
  const pathSet=new Set(userPath.map(([r,c])=>`${r},${c}`));
  const last=userPath[userPath.length-1];

  function handleClick(r:number,c:number){
    const key=`${r},${c}`;
    if(pathSet.has(key)&&userPath.length>=2&&userPath[userPath.length-2][0]===r&&userPath[userPath.length-2][1]===c){
      setUserPath(p=>p.slice(0,-1)); return;
    }
    if(pathSet.has(key))return;
    if(Math.abs(last[0]-r)+Math.abs(last[1]-c)!==1)return;
    setUserPath(p=>[...p,[r,c]]);
  }

  const complete=userPath.length===SIZE*SIZE;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:SIZE*(CELL+6)-6,height:SIZE*(CELL+6)-6}}>
        <svg style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1}} width={SIZE*(CELL+6)-6} height={SIZE*(CELL+6)-6}>
          {userPath.slice(1).map(([r,c],i)=>{
            const [pr,pc]=userPath[i];
            const cx=(CELL+6)/2,step=CELL+6;
            return <line key={i} x1={pc*step+cx} y1={pr*step+cx} x2={c*step+cx} y2={r*step+cx} stroke="#4F6EF7" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>;
          })}
        </svg>
        {Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>{
          const key=`${r},${c}`;
          const inPath=pathSet.has(key);
          const wp=WAYPOINTS[key];
          const isLast=last[0]===r&&last[1]===c;
          return (
            <motion.button key={key} onClick={()=>handleClick(r,c)} whileTap={{scale:0.88}}
              style={{position:"absolute",left:c*(CELL+6),top:r*(CELL+6),width:CELL,height:CELL,
                borderRadius:10,border:"1.5px solid",outline:"none",cursor:"pointer",zIndex:2,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:inPath?(isLast?"#EEF2FF":"#F5F7FF"):"white",
                borderColor:inPath?(isLast?"#4F6EF7":"#A5B4FC"):"#E2E8F0",
                fontSize:wp?14:8,fontWeight:700,color:wp?"#4F6EF7":"#94A3B8"}}>
              {wp||""}
            </motion.button>
          );
        }))}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {complete&&<span style={{fontSize:9,color:"#16A34A",fontWeight:700}}>Complete!</span>}
        <button onClick={()=>setUserPath([[0,0]])} style={{fontSize:9,color:"#94A3B8",background:"none",border:"none",cursor:"pointer"}}>Reset</button>
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>Connect all cells in order</p>
    </div>
  );
}

function MiniMinesweeper() {
  const GRID=[
    [{n:0,mine:false},{n:1,mine:false},{n:null,mine:true},{n:1,mine:false}],
    [{n:1,mine:false},{n:2,mine:false},{n:2,mine:false},{n:1,mine:false}],
    [{n:null,mine:true},{n:2,mine:false},{n:null,mine:true},{n:1,mine:false}],
    [{n:1,mine:false},{n:2,mine:false},{n:2,mine:false},{n:1,mine:false}],
  ];
  const NUM_COLORS:{[k:number]:string}={1:"#3B82F6",2:"#16A34A",3:"#DC2626"};
  const [revealed,setRevealed]=useState<Set<string>>(new Set(["0,0","0,1","1,0","1,1","1,2","1,3","2,1","3,0","3,1","3,2","3,3","0,3","2,3"]));
  const [dead,setDead]=useState(false);
  const CELL=38;

  function click(r:number,c:number){
    if(dead)return;
    const key=`${r},${c}`;
    if(revealed.has(key))return;
    if(GRID[r][c].mine){setDead(true);setRevealed(prev=>new Set([...prev,key]));return;}
    setRevealed(prev=>new Set([...prev,key]));
  }

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      {dead&&<button onClick={()=>{setDead(false);setRevealed(new Set(["0,0","0,1","1,0","1,1","1,2","1,3","2,1","3,0","3,1","3,2","3,3","0,3","2,3"]));}}
        style={{fontSize:9,color:"#EF4444",background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:8,padding:"1px 8px",cursor:"pointer"}}>
        💥 Try again
      </button>}
      <div style={{border:"1.5px solid #E2E8F0",borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(4,${CELL}px)`}}>
          {GRID.map((row,r)=>row.map((cell,c)=>{
            const key=`${r},${c}`;
            const isRev=revealed.has(key);
            return (
              <button key={key} onClick={()=>click(r,c)}
                style={{width:CELL,height:CELL,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,fontWeight:700,cursor:isRev?"default":"pointer",outline:"none",
                  background:isRev?(cell.mine?"#FEF2F2":"#F8F7F5"):"white",
                  borderRight:"0.5px solid #E2E8F0",borderBottom:"0.5px solid #E2E8F0",
                  borderTop:"none",borderLeft:"none",
                  color:cell.mine?"#DC2626":NUM_COLORS[cell.n??0]??"transparent"}}>
                {isRev?(cell.mine?"💣":cell.n||""):""}
              </button>
            );
          }))}
        </div>
      </div>
      <p style={{fontSize:9,color:"#94A3B8"}}>Deduce the mines</p>
    </div>
  );
}

// ── Game card with live preview ───────────────────────────────────────────────
const GAME_PREVIEWS: Record<string, React.ReactNode> = {
  tango:       <MiniTango/>,
  memory:      <MiniMemory/>,
  queens:      <MiniQueens/>,
  sudoku:      <MiniSudoku/>,
  zip:         <MiniZip/>,
  minesweeper: <MiniMinesweeper/>,
};

const GAMES = [
  { slug:"tango",         name:"Tango",          desc:"Balance rows & columns",                  free:true  },
  { slug:"memory",        name:"Memory",          desc:"Flip cards, find matching pairs",          free:true  },
  { slug:"queens",        name:"Queens",          desc:"One queen per row, col & region",          free:true  },
  { slug:"sudoku",        name:"Mini Sudoku",     desc:"Fill the grid, no repeats",               free:false },
  { slug:"zip",           name:"Zip",             desc:"Trace a path through every cell",          free:false },
  { slug:"minesweeper",   name:"Minesweeper",     desc:"Deduce every mine from clues",             free:false },
  { slug:"patches",       name:"Patches",         desc:"Tile with polyomino shapes",               free:false },
  { slug:"hearts",        name:"Hearts",          desc:"Trick-avoidance in solo mode",             free:false },
  { slug:"solitaire",     name:"Solitaire",       desc:"Classic Klondike, polished",               free:false },
  { slug:"word-sling",    name:"Word Sling",      desc:"Build high-scoring words",                 free:false },
  { slug:"2048-pro",      name:"2048 Pro",        desc:"Merge tiles to reach 2048",                free:false },
  { slug:"logic-path",    name:"Logic Path",      desc:"Connect pipe ends to fill board",          free:false },
  { slug:"pattern-match", name:"Pattern Match",   desc:"Identify the rule, complete it",           free:false },
  { slug:"hex-merge",     name:"Hex Merge",       desc:"Merge hexagons in chain reactions",        free:false },
  { slug:"gravity-sort",  name:"Gravity Sort",    desc:"Sort falling blocks by column",            free:false },
  { slug:"bridges",       name:"Bridges",         desc:"Connect islands with right bridges",       free:false },
  { slug:"kakuro",        name:"Kakuro",          desc:"Crossword meets Sudoku",                   free:false },
  { slug:"nonogram",      name:"Nonogram",        desc:"Solve pixel puzzles from clues",           free:false },
  { slug:"flow",          name:"Flow",            desc:"Connect dots without crossing",            free:false },
  { slug:"lightup",       name:"Light Up",        desc:"Illuminate every cell once",               free:false },
];

function GameCard({ game, index }: { game: typeof GAMES[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const freeGames = ["tango","memory","queens"];
  const isFree = freeGames.includes(game.slug);
  const hasPreview = !!GAME_PREVIEWS[game.slug];
  const href = isFree ? `/games/${game.slug}` : "/pricing";

  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ delay:(index%4)*0.06, duration:0.4 }}
    >
      <Link href={href} style={{ display:"block", textDecoration:"none" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background:"white", borderRadius:20,
            border:`0.5px solid ${hovered?"rgba(79,110,247,0.25)":"rgba(0,0,0,0.07)"}`,
            overflow:"hidden", cursor:"pointer",
            boxShadow: hovered
              ? "0 16px 40px rgba(79,110,247,0.12), 0 4px 12px rgba(0,0,0,0.06)"
              : "0 2px 8px rgba(0,0,0,0.04)",
            transform: hovered ? "translateY(-4px)" : "translateY(0)",
            transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}>

          {/* Preview area */}
          <div style={{
            minHeight: hasPreview ? 180 : 100,
            background: hovered
              ? "linear-gradient(135deg,rgba(79,110,247,0.06),rgba(156,107,232,0.08))"
              : "rgba(79,110,247,0.04)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding: hasPreview ? "20px 16px 16px" : "24px 16px",
            position:"relative",
            transition:"background 0.25s",
          }}>
            {hasPreview ? (
              <div style={{ transform:"scale(0.95)", transformOrigin:"center" }}>
                {GAME_PREVIEWS[game.slug]}
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <GameIcon slug={game.slug} size={48}/>
                <span style={{ fontSize:10, color:"#94A3B8" }}>Coming soon</span>
              </div>
            )}
            {/* Badge */}
            <div style={{ position:"absolute", top:10, right:10 }}>
              <span style={{
                fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:10,
                background: isFree ? "rgba(79,110,247,0.1)" : "rgba(0,0,0,0.05)",
                color: isFree ? "#4F6EF7" : "#94A3B8",
              }}>
                {isFree ? "Free" : "Pro"}
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{ padding:"12px 14px 14px" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#1C1917", marginBottom:3 }}>{game.name}</p>
            <p style={{ fontSize:11, color:"#64748B", lineHeight:1.5 }}>{game.desc}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Tango Demo (hero) ────────────────────────────────────────────────────
function HeroTangoDemo() {
  const [board] = useState<TangoBoard>(() => generateTangoBoard("landing-easy-3","easy"));
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>(() => board.puzzle.map(r=>[...r]));
  const [statuses, setStatuses] = useState<CellStatus[][]>(() =>
    board.puzzle.map(r=>r.map(c=>c!==null?"given":"empty"))
  );
  const [solved, setSolved] = useState(false);
  const [squish, setSquish] = useState<string|null>(null);

  const cm = new Map<string,"same"|"diff">();
  board.constraints.forEach(c=>cm.set(`${c.row1}-${c.col1}-${c.row2}-${c.col2}`,c.type));

  function handleClick(r:number,c:number){
    if(solved||statuses[r][c]==="given")return;
    const cur=playerGrid[r][c];
    const next:Cell=cur===null?"S":cur==="S"?"M":null;
    const key=`${r}-${c}`;
    setSquish(key); setTimeout(()=>setSquish(null),340);
    const ng=playerGrid.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?next:cell));
    setPlayerGrid(ng);
    const ns=validateBoard(board.puzzle,ng,board.solution);
    setStatuses(ns); playClick();
    if(ns.every(row=>row.every(s=>s==="correct"||s==="given"))){
      setSolved(true); playSuccess(); setTimeout(()=>triggerConfetti(),80);
    }
  }

  const CELL=52;
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div>
          <p style={{fontSize:9,color:"#94A3B8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Free Play · No account needed</p>
          <p style={{fontSize:14,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif"}}>Tango</p>
        </div>
        <AnimatePresence>
          {solved&&<motion.span initial={{scale:0}} animate={{scale:1}}
            style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"3px 10px",borderRadius:20}}>
            ✓ Solved!
          </motion.span>}
        </AnimatePresence>
      </div>
      <div style={{height:3,background:"#EDE9E4",borderRadius:2,marginBottom:14}}>
        <motion.div style={{height:3,background:"linear-gradient(90deg,#4F6EF7,#9C6BE8)",borderRadius:2}}
          animate={{width:solved?"100%":"42%"}} transition={{duration:0.8}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${CELL}px)`,gap:7,marginBottom:12}}>
        {board.puzzle.map((_,r)=>board.puzzle[r].map((_,c)=>{
          const isGiven=statuses[r][c]==="given";
          const value=playerGrid[r][c];
          const key=`${r}-${c}`;
          const rightC=cm.get(`${r}-${c}-${r}-${c+1}`);
          const bottomC=cm.get(`${r}-${c}-${r+1}-${c}`);
          return(
            <div key={key} style={{position:"relative",width:CELL,height:CELL}}>
              <motion.button onClick={()=>handleClick(r,c)}
                whileTap={!isGiven?{scale:0.85}:{}}
                animate={squish===key?{scaleX:[1,0.86,1.08,1],scaleY:[1,1.1,0.94,1]}:{}}
                transition={{duration:0.32}}
                style={{width:"100%",height:"100%",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid",
                  background:isGiven?"#F8F7F5":"white",
                  borderColor:isGiven?"#EDE9E4":value?"#D1C8E8":"#F0EDE8",
                  boxShadow:isGiven?"none":value?"0 3px 10px rgba(79,110,247,0.12)":"0 1px 4px rgba(0,0,0,0.05)",
                  cursor:isGiven?"default":"pointer",outline:"none"}}>
                {value==="S"&&<SunIcon size={22}/>}
                {value==="M"&&<MoonIcon size={22}/>}
                {!value&&<div style={{width:6,height:6,borderRadius:"50%",background:isGiven?"#D1CBC1":"#E8E4DE"}}/>}
              </motion.button>
              {rightC&&c<board.size-1&&(
                <div style={{position:"absolute",right:-8,top:"50%",transform:"translateY(-50%)",zIndex:10,width:16,height:16,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,border:`1.5px solid ${rightC==="same"?"#4F6EF7":"#F87171"}`,color:rightC==="same"?"#4F6EF7":"#F87171",boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}}>
                  {rightC==="same"?"=":"×"}
                </div>
              )}
              {bottomC&&r<board.size-1&&(
                <div style={{position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",zIndex:10,width:16,height:16,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,border:`1.5px solid ${bottomC==="same"?"#4F6EF7":"#F87171"}`,color:bottomC==="same"?"#4F6EF7":"#F87171",boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}}>
                  {bottomC==="same"?"=":"×"}
                </div>
              )}
            </div>
          );
        }))}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14}}>
        <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#94A3B8"}}><SunIcon size={11}/> Sun</span>
        <span style={{color:"#E2E8F0",fontSize:10}}>·</span>
        <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#94A3B8"}}><MoonIcon size={11}/> Moon</span>
        <span style={{color:"#E2E8F0",fontSize:10}}>·</span>
        <button onClick={()=>{setPlayerGrid(board.puzzle.map(r=>[...r]));setStatuses(board.puzzle.map(r=>r.map(c=>c!==null?"given":"empty")));setSolved(false);}}
          style={{fontSize:10,color:"#4F6EF7",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>
          Reset
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isSilentMode, toggleSilentMode, theme, toggleTheme } = useSettingsStore();
  const W = { maxWidth:1100, margin:"0 auto", padding:"0 40px" };

  return (
    <div style={{background:"#FDFCFB",minHeight:"100vh",color:"#1C1917"}}>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,background:"rgba(253,252,251,0.92)",backdropFilter:"blur(20px)",borderBottom:"0.5px solid rgba(0,0,0,0.07)",padding:"0 40px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
          <div style={{width:28,height:28,borderRadius:"22.5%",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 8px rgba(79,110,247,0.3)"}}>
            <Brain size={14} color="white"/>
          </div>
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
          <Link href="/auth/signup" style={{fontSize:13,fontWeight:700,color:"white",padding:"8px 16px",borderRadius:12,background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",textDecoration:"none",boxShadow:"0 3px 10px rgba(79,110,247,0.25)"}}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{...W,paddingTop:100,paddingBottom:72,display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,alignItems:"center",minHeight:"100vh"}}>
        <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.6}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,background:"white",border:"0.5px solid rgba(0,0,0,0.08)",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",marginBottom:24,fontSize:12,color:"#64748B",fontWeight:500}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#22C55E",display:"block"}}/>
            20 Games · 1,000 Stages Each · Free to Start
          </div>
          <h1 style={{fontFamily:"Georgia,serif",fontWeight:700,lineHeight:1.08,marginBottom:20,fontSize:"clamp(42px,4.5vw,62px)"}}>
            <span style={{display:"block",color:"#1C1917"}}>Sharper</span>
            <span style={{display:"block",fontStyle:"italic",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8,#C4785A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Every Day.</span>
          </h1>
          <p style={{fontSize:16,color:"#64748B",lineHeight:1.7,marginBottom:28,maxWidth:400}}>
            Explore 20 logic disciplines and 1,000 hand-crafted stages each. An elegant training suite for the modern mind. Countless hours of fun, zero nonsense.
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
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.6,delay:0.15}} style={{display:"flex",justifyContent:"center"}}>
          <div style={{position:"relative"}}>
            <div style={{background:"linear-gradient(145deg,#E8E4DE,#CEC9C1)",borderRadius:28,padding:10,boxShadow:"0 32px 64px rgba(0,0,0,0.15),0 8px 24px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.5)"}}>
              <div style={{background:"#FDFCFB",borderRadius:20,overflow:"hidden",minWidth:310}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:"rgba(255,255,255,0.8)",borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}>
                  <span style={{fontSize:10,fontWeight:600,color:"#94A3B8",fontFamily:"monospace"}}>9:41</span>
                  <div style={{display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:"#E2E8F0"}}/>)}</div>
                </div>
                <div style={{padding:"14px 16px 16px"}}><HeroTangoDemo/></div>
                <div style={{padding:"0 16px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#CBD5E1"}}>No account needed</span>
                  <Link href="/games/tango" style={{fontSize:11,fontWeight:600,color:"#4F6EF7",display:"flex",alignItems:"center",gap:3,textDecoration:"none"}}>
                    Full game <ArrowRight size={10}/>
                  </Link>
                </div>
              </div>
            </div>
            <div style={{position:"absolute",bottom:-10,left:"15%",right:"15%",height:16,background:"rgba(79,110,247,0.18)",filter:"blur(14px)",borderRadius:"50%"}}/>
          </div>
        </motion.div>
      </section>

      {/* LIFESTYLE STRIP */}
      <section style={{paddingBottom:72,overflow:"hidden"}}>
        <div style={{display:"flex",gap:12,padding:"0 40px",overflowX:"auto",scrollbarWidth:"none"}}>
          {[
            {img:IMGS.cafe,   label:"At the café"},
            {img:IMGS.subway, label:"On the commute"},
            {img:IMGS.park,   label:"In the park"},
            {img:IMGS.work_w, label:"At work"},
            {img:IMGS.bed,    label:"Before bed"},
            {img:IMGS.sofa,   label:"On the sofa"},
            {img:IMGS.dining, label:"At home"},
            {img:IMGS.street, label:"On the go"},
          ].map((item,i)=>(
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}
              style={{flexShrink:0,position:"relative",borderRadius:20,overflow:"hidden",width:190,height:250,boxShadow:"0 8px 24px rgba(0,0,0,0.12)"}}>
              <img src={item.img} alt={item.label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"28px 14px 12px",background:"linear-gradient(transparent,rgba(0,0,0,0.55)",color:"white",fontSize:11,fontWeight:600}}>
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* GAMES COLLECTION — 4 cols, live previews */}
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {GAMES.map((game,i)=><GameCard key={game.slug} game={game} index={i}/>)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{background:"white",borderTop:"0.5px solid rgba(0,0,0,0.06)",borderBottom:"0.5px solid rgba(0,0,0,0.06)",padding:"64px 40px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <h2 style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:34,color:"#1C1917",textAlign:"center",marginBottom:48}}>
            Built for the Modern Mind
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
            {[
              {from:"#4F6EF7",to:"#7C4FD4",num:"01",title:"Choose a discipline",body:"20 logic games, each with its own rhythm. Start free with the Daily Challenge — no account needed."},
              {from:"#9C6BE8",to:"#C4785A",num:"02",title:"Train daily",body:"XP decays in real time. The faster you solve, the more you earn. Streaks reward consistency."},
              {from:"#7C9E87",to:"#4A7C59",num:"03",title:"Master & compete",body:"Family leaderboards, shareable links, and real-time celebrations when records fall."},
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

      {/* FULL WIDTH PHOTO CTA */}
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18,alignItems:"start",maxWidth:860,margin:"0 auto"}}>
          {PLANS.map((plan,i)=>(
            <motion.div key={i} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              style={{borderRadius:22,padding:26,position:"relative",
                background:plan.highlight?"linear-gradient(135deg,#4F6EF7,#9C6BE8)":"white",
                border:plan.highlight?"none":"0.5px solid rgba(0,0,0,0.08)",
                boxShadow:plan.highlight?"0 20px 48px rgba(79,110,247,0.28)":"0 2px 8px rgba(0,0,0,0.04)",
                color:plan.highlight?"white":"#1C1917"}}>
              {plan.highlight&&(
                <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",fontSize:10,fontWeight:700,color:"#4F6EF7",background:"white",padding:"4px 14px",borderRadius:20,boxShadow:"0 2px 8px rgba(0,0,0,0.1)",whiteSpace:"nowrap"}}>
                  Most Popular
                </div>
              )}
              <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,color:plan.highlight?"rgba(255,255,255,0.65)":"#94A3B8"}}>{plan.name}</p>
              <div style={{display:"flex",alignItems:"flex-end",gap:4,marginBottom:20}}>
                <span style={{fontSize:46,fontWeight:700,lineHeight:1,fontFamily:"Georgia,serif"}}>{plan.price}</span>
                <span style={{fontSize:13,paddingBottom:6,opacity:0.6}}>/mo</span>
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
                background:plan.highlight?"white":"transparent",
                color:plan.highlight?"#4F6EF7":"#374151",
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
            <div style={{width:24,height:24,borderRadius:"22.5%",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Brain size={11} color="white"/>
            </div>
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
