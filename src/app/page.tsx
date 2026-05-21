"use client";
import { ReviewModal } from "@/components/ui/ReviewModal";
import React from "react";
import { FAQSchema, OrganizationSchema, WebAppSchema, HowToSchema } from "@/app/seo-schema";
import { ComingSoonTeaser } from "@/components/ui/ComingSoonTeaser";
import { GameSnapshot } from "@/components/ui/GameSnapshots";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ArrowRight, Check,
  Volume2, VolumeX, Sun, Moon, Star, Zap,
  Flame, Shield, Infinity, Trophy, Download, Accessibility
} from "lucide-react";
import Link from "next/link";
import {
  generateTangoBoard, validateBoard, buildSeed,
  type Cell, type TangoBoard, type CellStatus
} from "@/lib/games/tangoGenerator";
import { playClick, playSuccess } from "@/lib/audio/soundEngine";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { GameIcon, SunIcon, MoonIcon } from "@/components/icons/GameIcons";
import { triggerConfetti } from "@/components/effects/Confetti";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";
import { usePWAInstall } from "@/hooks/usePWAInstall";

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
  { name:"Free", price:"$0", period:"/mo", paddlePriceId: null, trial: false, features:["All 24 games","All 100 stages","3 hints per stage","5 plays per day","Global leaderboard"], highlight:false, free:true },
  { name:"Individual", price:"$2",  period:"/mo", paddlePriceId:"pri_01ks5tm2jqs69wrg92jxrc936b", trial: true, features:["All 24 games","100 stages each","Unlimited daily plays","3-day free trial","Global leaderboard","Infinite mode"], highlight:false, free:false },
  { name:"Family · 3", price:"$5",  period:"/mo", paddlePriceId:"pri_01ks5tnfpxvgdh2gkfm0k5pry8", trial: true, features:["3 members","Family leaderboard","All individual perks","3-day free trial","Shared streaks","Priority support"], highlight:true, free:false },
  { name:"Family · 7", price:"$10", period:"/mo", paddlePriceId:"pri_01ks5tpt6wsyn05gexnpade0a0", trial: true, features:["7 members","Family leaderboard","All individual perks","3-day free trial","Shared streaks","Priority support"], highlight:false, free:false },
];

// ── HERO CAROUSEL ─────────────────────────────────────────────────────────
const CAROUSEL_GAMES = [
  { key:"tango",  label:"Tango",  href:"/games/tango",  desc:"Balance rows & columns" },
  { key:"memory", label:"Memory", href:"/games/memory", desc:"Flip cards, find pairs"  },
  { key:"queens", label:"Queens", href:"/games/queens", desc:"One queen per region"    },
];

function MiniMemoryHero() {
  const ICONS = ["🌿","🔥","💧","⭐","🌙","☀️","❄️","💎"];
  const [cards] = useState(()=>{
    const pairs=[...ICONS];
    const arr=[...pairs,...pairs];
    let s=777;
    for(let i=arr.length-1;i>0;i--){s=(s*1664525+1013904223)&0xffffffff;const j=Math.abs(s)%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}
    return arr.map((v,i)=>({id:i,value:v,flipped:false,matched:false}));
  });
  const [state,setState]=useState(cards);
  const [sel,setSel]=useState<number[]>([]);
  const CELL=44;
  function flip(id:number){
    const card=state.find(c=>c.id===id);
    if(!card||card.flipped||card.matched||sel.length===2)return;
    const ns=state.map(c=>c.id===id?{...c,flipped:true}:c);
    const nsel=[...sel,id];
    setState(ns);setSel(nsel);
    if(nsel.length===2){
      const [a,b]=nsel.map(sid=>ns.find(c=>c.id===sid)!);
      if(a.value===b.value){
        setState(prev=>prev.map(c=>c.id===a.id||c.id===b.id?{...c,matched:true}:c));
        setSel([]);playSuccess();
      } else {
        setTimeout(()=>{setState(prev=>prev.map(c=>c.id===a.id||c.id===b.id?{...c,flipped:false}:c));setSel([]);},700);
      }
    }
  }
  const matched=state.filter(c=>c.matched).length/2;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      {matched===8&&<motion.div initial={{scale:0}} animate={{scale:1}} style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"2px 10px",borderRadius:10}}>All pairs found!</motion.div>}
      <div style={{display:"grid",gridTemplateColumns:`repeat(4,${CELL}px)`,gap:6}}>
        {state.map(card=>(
          <motion.button key={card.id} onClick={()=>flip(card.id)} whileTap={{scale:0.88}}
            style={{width:CELL,height:CELL,borderRadius:10,border:"1.5px solid",outline:"none",
              cursor:card.matched?"default":"pointer",
              background:card.flipped||card.matched?"var(--surface)":"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
              borderColor:card.matched?"#86EFAC":card.flipped?"#DDD6F8":"transparent",
              fontSize:card.flipped||card.matched?22:0,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:card.matched?"0 0 0 2px #86EFAC":"none"}}>
            {(card.flipped||card.matched)&&card.value}
          </motion.button>
        ))}
      </div>
      <p style={{fontSize:10,color:"var(--text4)"}}>{matched}/8 pairs found · tap to flip</p>
    </div>
  );
}

const REGION_PALETTE_MINI=[
  {fill:"#DBEAFE",border:"#1D4ED8",queen:"#1E3A8A"},
  {fill:"#FED7AA",border:"#C2410C",queen:"#7C2D12"},
  {fill:"#BBF7D0",border:"#15803D",queen:"#14532D"},
  {fill:"#E9D5FF",border:"#7C3AED",queen:"#4C1D95"},
  {fill:"#FECDD3",border:"#BE123C",queen:"#881337"},
  {fill:"#FDE68A",border:"#B45309",queen:"#78350F"},
];

function MiniQueensHero() {
  const SIZE=6;
  const REGIONS=[
    [0,0,1,1,2,2],[0,0,1,1,2,2],[3,3,1,4,4,2],
    [3,3,5,4,4,2],[3,5,5,5,4,2],[3,5,5,5,5,2],
  ];
  const [grid,setGrid]=useState<number[][]>(()=>Array.from({length:SIZE},()=>new Array(SIZE).fill(0)));
  const CELL=40;
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
    if(checkWon(ng)){playSuccess();setTimeout(()=>triggerConfetti(),80);}
  }
  const won=checkWon(grid);
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      {won&&<motion.div initial={{scale:0}} animate={{scale:1}} style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"2px 10px",borderRadius:10}}>Solved!</motion.div>}
      <div style={{border:"2px solid #374151",borderRadius:10,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},${CELL}px)`}}>
          {REGIONS.map((row,r)=>row.map((rid,c)=>{
            const val=grid[r][c];
            const pal=REGION_PALETTE_MINI[rid%REGION_PALETTE_MINI.length];
            const rd=c<SIZE-1&&REGIONS[r][c+1]!==rid;
            const bd=r<SIZE-1&&REGIONS[r+1][c]!==rid;
            return(
              <button key={`${r}-${c}`} onClick={()=>toggle(r,c)}
                style={{width:CELL,height:CELL,display:"flex",alignItems:"center",justifyContent:"center",
                  background:pal.fill,cursor:"pointer",outline:"none",
                  borderRight:rd?`2.5px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.1)",
                  borderBottom:bd?`2.5px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.1)",
                  borderTop:"none",borderLeft:"none",fontSize:CELL*0.45}}>
                {val===1&&<span style={{color:"#64748B",fontWeight:700}}>✕</span>}
                {val===2&&<motion.span initial={{scale:0}} animate={{scale:1}} style={{color:pal.queen}}>♛</motion.span>}
              </button>
            );
          }))}
        </div>
      </div>
      <p style={{fontSize:10,color:"var(--text4)"}}>tap once=✕ twice=♛ · one queen per region</p>
    </div>
  );
}

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const game = CAROUSEL_GAMES[active];
  return (
    <div style={{width:"100%"}}>
      <div style={{display:"flex",gap:6,marginBottom:14,justifyContent:"center"}}>
        {CAROUSEL_GAMES.map((g,i)=>(
          <button key={g.key} onClick={()=>setActive(i)}
            style={{padding:"5px 14px",borderRadius:20,border:"1.5px solid",fontSize:11,fontWeight:700,
              cursor:"pointer",outline:"none",transition:"all 0.15s",
              background:active===i?"linear-gradient(135deg,#4F6EF7,#9C6BE8)":"var(--surface)",
              color:active===i?"white":"var(--text3)",
              borderColor:active===i?"transparent":"var(--border2)"}}>
            {g.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
          transition={{duration:0.2}}>
          {active===0 && <TangoDemo cellSize={42}/>}
          {active===1 && <MiniMemoryHero/>}
          {active===2 && <MiniQueensHero/>}
        </motion.div>
      </AnimatePresence>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
        <span style={{fontSize:10,color:"var(--text4)"}}>{game.desc}</span>
        <Link href={game.href} style={{fontSize:11,fontWeight:600,color:"#4F6EF7",display:"flex",alignItems:"center",gap:3,textDecoration:"none"}}>
          Full game <ArrowRight size={10}/>
        </Link>
      </div>
    </div>
  );
}

// ── Tango Demo ────────────────────────────────────────────────────────────────
function TangoDemo({ cellSize = 52 }: { cellSize?: number }) {
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
    if(ns.every(row=>row.every(s=>s==="correct"||s==="given"))){
      setSolved(true);playSuccess();setTimeout(()=>triggerConfetti(),80);
    }
  }

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div>
          <p style={{fontSize:9,color:"var(--text4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Hard · {board.size}×{board.size} · Free Play</p>
          <p style={{fontSize:13,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>Tango</p>
        </div>
        <AnimatePresence>
          {solved&&<motion.span initial={{scale:0}} animate={{scale:1}} style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"2px 10px",borderRadius:20}}>Solved!</motion.span>}
        </AnimatePresence>
      </div>
      <div style={{height:3,background:"var(--bg3)",borderRadius:2,marginBottom:12}}>
        <motion.div style={{height:3,background:"linear-gradient(90deg,#4F6EF7,#9C6BE8)",borderRadius:2}} animate={{width:solved?"100%":"28%"}} transition={{duration:0.8}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${cellSize}px)`,gap:6,marginBottom:10}}>
        {board.puzzle.map((_,r)=>board.puzzle[r].map((_,c)=>{
          const isGiven=statuses[r][c]==="given";
          const value=playerGrid[r][c];
          const key=`${r}-${c}`;
          const hasError=errorRows.has(r)||errorCols.has(c);
          const rightC=cm.get(`${r}-${c}-${r}-${c+1}`);
          const bottomC=cm.get(`${r}-${c}-${r+1}-${c}`);
          return(
            <div key={key} style={{position:"relative",width:cellSize,height:cellSize}}>
              <motion.button onClick={()=>handleClick(r,c)}
                whileTap={!isGiven?{scale:0.85}:{}}
                animate={squish===key?{scaleX:[1,0.86,1.08,1],scaleY:[1,1.1,0.94,1]}:{}}
                transition={{duration:0.32}}
                style={{width:"100%",height:"100%",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid",
                  background:hasError?"rgba(239,68,68,0.07)":isGiven?"var(--bg2)":"var(--surface)",
                  borderColor:isGiven?"var(--border)":value?"#DDD6F8":"var(--border)",
                  cursor:isGiven?"default":"pointer",outline:"none"}}>
                {value==="S"&&<SunIcon size={cellSize*0.48}/>}
                {value==="M"&&<MoonIcon size={cellSize*0.48}/>}
                {!value&&<div style={{width:6,height:6,borderRadius:"50%",background:"var(--border2)"}}/>}
              </motion.button>
              {rightC&&c<board.size-1&&(
                <div style={{position:"absolute",right:-6,top:"50%",transform:"translateY(-50%)",zIndex:10,width:12,height:12,borderRadius:"50%",background:"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,border:`1.5px solid ${rightC==="same"?"#4F6EF7":"#F87171"}`,color:rightC==="same"?"#4F6EF7":"#F87171"}}>
                  {rightC==="same"?"=":"×"}
                </div>
              )}
              {bottomC&&r<board.size-1&&(
                <div style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",zIndex:10,width:12,height:12,borderRadius:"50%",background:"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,border:`1.5px solid ${bottomC==="same"?"#4F6EF7":"#F87171"}`,color:bottomC==="same"?"#4F6EF7":"#F87171"}}>
                  {bottomC==="same"?"=":"×"}
                </div>
              )}
            </div>
          );
        }))}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
        <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"var(--text4)"}}><SunIcon size={11}/> Sun</span>
        <span style={{color:"var(--border2)"}}>·</span>
        <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"var(--text4)"}}><MoonIcon size={11}/> Moon</span>
        <span style={{color:"var(--border2)"}}>·</span>
        <button onClick={()=>{setPlayerGrid(board.puzzle.map(r=>[...r]));setStatuses(board.puzzle.map(r=>r.map(c=>c!==null?"given":"empty")));setSolved(false);setErrorRows(new Set());setErrorCols(new Set());}}
          style={{fontSize:10,color:"#4F6EF7",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Reset</button>
      </div>
    </div>
  );
}

// ── All 24 games ──────────────────────────────────────────────────────────────
const GAMES = [
  { slug:"tango",         name:"Tango",          desc:"Balance rows & columns",  free:true  },
  { slug:"memory",        name:"Memory",          desc:"Flip cards, find pairs",  free:true  },
  { slug:"queens",        name:"Queens",          desc:"One queen per region",    free:true  },
  { slug:"sudoku",        name:"Mini Sudoku",     desc:"No repeats in grid",      free:false },
  { slug:"zip",           name:"Zip",             desc:"Trace through every cell",free:false },
  { slug:"flow",          name:"Flow",            desc:"Connect color dots",      free:false },
  { slug:"bridges",       name:"Bridges",         desc:"Right number of bridges", free:false },
  { slug:"kakuro",        name:"Kakuro",          desc:"Digit sums guide you",    free:false },
  { slug:"logic-path",    name:"Logic Path",      desc:"Rotate pipes to connect", free:false },
  { slug:"lightup",       name:"Light Up",        desc:"Illuminate every cell",   free:false },
  { slug:"nonogram",      name:"Nonogram",        desc:"Pixel art from clues",    free:false },
  { slug:"pattern-match", name:"Pattern Match",   desc:"Find the rule",           free:false },
  { slug:"patches",       name:"Patches",         desc:"Tile with polyominoes",   free:false },
  { slug:"2048-pro",      name:"2048 Pro",        desc:"Merge to the target",     free:false },
  { slug:"gravity-sort",  name:"Gravity Sort",    desc:"Sort falling blocks",     free:false },
  { slug:"hex-merge",     name:"Hex Merge",       desc:"Chain hex merges",        free:false },
  { slug:"word-sling",    name:"Word Sling",      desc:"Build scoring words",     free:false },
  { slug:"hearts",        name:"Hearts",          desc:"Avoid penalty cards",     free:false },
  { slug:"solitaire",     name:"Solitaire",       desc:"Classic Klondike",        free:false },
  { slug:"minesweeper",   name:"Minesweeper",     desc:"Deduce the mines",        free:false },
  { slug:"word-climb",    name:"Word Climb",      desc:"Climb the word ladder",   free:false },
  { slug:"pinpoint",      name:"Pinpoint",        desc:"Guess from clues",        free:false },
  { slug:"name-country",  name:"Name the Country",desc:"Identify from the flag",  free:false },
  { slug:"name-city",     name:"Name the City",   desc:"Identify the city",       free:false },
];

// ── Landing page mini snapshots ───────────────────────────────────────────────
function LandingSnapshot({ slug }: { slug: string }) {
  const snaps: Record<string, React.ReactNode> = {

    "flow": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(79,110,247,0.04)" rx={8}/>
        {([ ["#EF4444","0,0","0,3"],[" #3B82F6","3,0","3,3"],["#22C55E","0,2","2,0"],["#F59E0B","1,3","3,2"] ] as [string,string,string][]).map(([c,s,e],i)=>(
          <g key={i}>
            <circle cx={parseInt(s.split(",")[1])*20+10} cy={parseInt(s.split(",")[0])*20+10} r={8} fill={c}/>
            <circle cx={parseInt(e.split(",")[1])*20+10} cy={parseInt(e.split(",")[0])*20+10} r={8} fill={c}/>
          </g>
        ))}
      </svg>
    ),

    "bridges": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(180,83,9,0.04)" rx={8}/>
        <line x1={15} y1={15} x2={65} y2={15} stroke="#374151" strokeWidth={2}/>
        <line x1={15} y1={65} x2={65} y2={65} stroke="#374151" strokeWidth={2}/>
        <line x1={15} y1={15} x2={15} y2={65} stroke="#374151" strokeWidth={2}/>
        <line x1={65} y1={15} x2={65} y2={65} stroke="#374151" strokeWidth={2}/>
        {([
          [15, 15, 3],
          [65, 15, 2],
          [15, 65, 2],
          [65, 65, 3],
        ] as [number, number, number][]).map(([x, y, n], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={10} fill="#4F6EF7"/>
            <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
              style={{fontSize:9,fontWeight:700,fill:"white"}}>{n}</text>
          </g>
        ))}
      </svg>
    ),

    "nonogram": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(190,24,93,0.04)" rx={8}/>
        {([[1,0,1,1],[0,1,1,0],[1,1,0,1],[1,0,1,1]] as number[][]).map((row,r)=>row.map((cell,c)=>(
          <rect key={`${r}-${c}`} x={c*16+16} y={r*16+16} width={14} height={14} fill={cell?"#1C1917":"rgba(0,0,0,0.06)"} rx={2}/>
        )))}
      </svg>
    ),

    "pattern-match": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(124,58,237,0.04)" rx={8}/>
        {[3,6,9,12].map((n,i)=>(
          <g key={i}>
            <rect x={i*16+4} y={25} width={13} height={13} rx={3} fill="rgba(124,58,237,0.15)" stroke="#7C3AED" strokeWidth={1}/>
            <text x={i*16+10.5} y={34} textAnchor="middle" dominantBaseline="middle" style={{fontSize:8,fontWeight:700,fill:"#7C3AED"}}>{n}</text>
          </g>
        ))}
        <rect x={68} y={25} width={13} height={13} rx={3} fill="none" stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="3"/>
        <text x={74.5} y={34} textAnchor="middle" dominantBaseline="middle" style={{fontSize:8,fontWeight:700,fill:"#7C3AED"}}>?</text>
        <text x={40} y={55} textAnchor="middle" style={{fontSize:9,fill:"#94A3B8"}}>Add 3 each time</text>
      </svg>
    ),

    "2048-pro": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="#FAF8EF" rx={8}/>
        <rect x={4} y={4} width={72} height={72} rx={6} fill="#BBADA0"/>
        {([[2,4,8,16],[32,64,128,256],[0,2,4,8],[0,0,2,4]] as number[][]).map((row,r)=>row.map((val,c)=>{
          const clrs:Record<number,string>={0:"#CDC1B4",2:"#EEE4DA",4:"#EDE0C8",8:"#F2B179",16:"#F59563",32:"#F67C5F",64:"#F65E3B",128:"#EDCF72",256:"#EDC22E"};
          return<rect key={`${r}-${c}`} x={c*17+8} y={r*17+8} width={14} height={14} rx={2} fill={clrs[val]||"#CDC1B4"}/>;
        }))}
      </svg>
    ),

    "kakuro": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(29,78,216,0.04)" rx={8}/>
        {([
          [0, 0, "B"],
          [0, 1, "W"],
          [0, 2, "W"],
          [1, 0, "W"],
          [1, 1, "W"],
          [1, 2, "B"],
          [2, 0, "W"],
          [2, 1, "B"],
          [2, 2, "W"],
        ] as [number, number, string][]).map(([r, c, t], i) => (
          <g key={i}>
            <rect
              x={c * 22 + 12} y={r * 22 + 12}
              width={20} height={20}
              fill={t === "B" ? "#374151" : "white"}
              stroke="#E2E8F0" strokeWidth={0.5}
            />
            {t === "B" && i === 0 && (
              <>
                <line x1={12} y1={12} x2={32} y2={32} stroke="#555" strokeWidth={0.5}/>
                <text x={28} y={30} style={{fontSize:7, fill:"white", fontWeight:700}}>9</text>
              </>
            )}
            {t === "B" && i === 5 && (
              <>
                <line x1={56} y1={34} x2={76} y2={54} stroke="#555" strokeWidth={0.5}/>
                <text x={70} y={52} style={{fontSize:7, fill:"white", fontWeight:700}}>3</text>
              </>
            )}
            {t === "W" && i === 1 && (
              <text
                x={c * 22 + 22} y={r * 22 + 22}
                textAnchor="middle" dominantBaseline="middle"
                style={{fontSize:9, fontWeight:700, fill:"#4F6EF7"}}
              >4</text>
            )}
          </g>
        ))}
      </svg>
    ),

    "gravity-sort": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(194,65,12,0.04)" rx={8}/>
        {([["#EF4444","#3B82F6","#22C55E"],["#3B82F6","#22C55E","#EF4444"],["#22C55E","#EF4444","#3B82F6"]] as string[][]).map((col,c)=>col.map((color,r)=>(
          <rect key={`${c}-${r}`} x={c*22+12} y={r*18+14} width={18} height={15} rx={4} fill={color} opacity={0.85}/>
        )))}
        <text x={40} y={74} textAnchor="middle" style={{fontSize:8,fill:"#94A3B8"}}>Sort by color</text>
      </svg>
    ),

    "hex-merge": (
      <svg width={80} height={80} viewBox="-40 -40 80 80">
        <rect x={-40} y={-40} width={80} height={80} fill="rgba(13,148,136,0.04)" rx={8}/>
        {([[-1,-1,2],[0,-1,4],[1,-2,2],[-1,0,4],[0,0,8],[1,-1,4],[-1,1,2],[0,1,4],[1,0,2]] as [number,number,number][]).map(([q,r,val],i)=>{
          const x=14*(1.5*q),y=14*(Math.sqrt(3)/2*q+Math.sqrt(3)*r);
          const clrs:Record<number,string>={2:"#DBEAFE",4:"#BBF7D0",8:"#FDE68A"};
          const pts=Array.from({length:6},(_,k)=>{const a=Math.PI/180*(60*k-30);return`${x+12*Math.cos(a)},${y+12*Math.sin(a)}`;}).join(" ");
          return<g key={i}><polygon points={pts} fill={clrs[val]} stroke="rgba(0,0,0,0.1)" strokeWidth={0.5}/><text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:8,fontWeight:700,fill:"#374151"}}>{val}</text></g>;
        })}
      </svg>
    ),

    "logic-path": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(8,145,178,0.04)" rx={8}/>
        {([[false,true,false,true],[true,false,true,false],[false,true,false,true],[true,true,false,false],[false,false,true,true],[true,false,true,false],[false,true,true,false],[false,false,false,true],[true,false,false,false]] as boolean[][]).map((pipe,i)=>{
          const r=Math.floor(i/3),c=i%3,cx=c*22+22,cy=r*22+22,w=3;const color="#4F6EF7";
          return<g key={i}>{pipe[0]&&<rect x={cx-w/2} y={cy-11} width={w} height={11} fill={color} rx={1}/>}{pipe[1]&&<rect x={cx} y={cy-w/2} width={11} height={w} fill={color} rx={1}/>}{pipe[2]&&<rect x={cx-w/2} y={cy} width={w} height={11} fill={color} rx={1}/>}{pipe[3]&&<rect x={cx-11} y={cy-w/2} width={11} height={w} fill={color} rx={1}/>}<circle cx={cx} cy={cy} r={w*0.9} fill={color}/></g>;
        })}
      </svg>
    ),

    "lightup": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(202,138,4,0.04)" rx={8}/>
        {([[0,0,"B1"],[0,1,"dot"],[0,2,"lit"],[1,0,"dot"],[1,1,"B"],[1,2,"dot"],[2,0,"lit"],[2,1,"dot"],[2,2,"B0"]] as [number,number,string][]).map(([r,c,type],i)=>{
          const isBlack=type.startsWith("B");
          return<g key={i}><rect x={c*24+8} y={r*24+8} width={22} height={22} fill={isBlack?"#374151":type==="dot"?"#FFFBEB":"#FFFDE7"} stroke="#E2E8F0" strokeWidth={0.5}/>{type==="dot"&&<text x={c*24+19} y={r*24+21} textAnchor="middle" style={{fontSize:13}}>●</text>}{isBlack&&type.length>1&&<text x={c*24+19} y={r*24+21} textAnchor="middle" dominantBaseline="middle" style={{fontSize:11,fontWeight:700,fill:"white"}}>{type.slice(1)}</text>}</g>;
        })}
      </svg>
    ),

    "patches": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(245,158,11,0.04)" rx={8}/>
        {([[0,"#EF4444"],[0,"#EF4444"],[1,"#3B82F6"],[1,"#3B82F6"],[0,"#EF4444"],[2,"#22C55E"],[2,"#22C55E"],[1,"#3B82F6"],[3,"#F59E0B"],[2,"#22C55E"],[2,"#22C55E"],[1,"#3B82F6"],[3,"#F59E0B"],[3,"#F59E0B"],[2,"#22C55E"],[3,"#F59E0B"]] as [number,string][]).map(([,color],i)=>{
          const r=Math.floor(i/4),c=i%4;
          return<rect key={i} x={c*16+8} y={r*16+8} width={15} height={15} fill={color} opacity={0.8} rx={2}/>;
        })}
      </svg>
    ),

    "word-sling": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(4,120,87,0.04)" rx={8}/>
        {["B","R","A","I","N"].map((l,i)=>(
          <g key={i}><rect x={i*13+7} y={8} width={12} height={16} rx={3} fill="white" stroke="#E2E8F0" strokeWidth={1}/><text x={i*13+13} y={18} textAnchor="middle" dominantBaseline="middle" style={{fontSize:9,fontWeight:700,fill:"#1C1917"}}>{l}</text></g>
        ))}
        {["T","R","A","I","N"].map((l,i)=>(
          <g key={i}><rect x={i*13+7} y={28} width={12} height={16} rx={3} fill="white" stroke="#E2E8F0" strokeWidth={1}/><text x={i*13+13} y={38} textAnchor="middle" dominantBaseline="middle" style={{fontSize:9,fontWeight:700,fill:"#1C1917"}}>{l}</text></g>
        ))}
        <rect x={8} y={52} width={28} height={13} rx={6} fill="#F0FDF4" stroke="#86EFAC" strokeWidth={1}/>
        <text x={22} y={60} textAnchor="middle" dominantBaseline="middle" style={{fontSize:8,fontWeight:700,fill:"#15803D"}}>BRAIN</text>
        <rect x={40} y={52} width={28} height={13} rx={6} fill="#F0FDF4" stroke="#86EFAC" strokeWidth={1}/>
        <text x={54} y={60} textAnchor="middle" dominantBaseline="middle" style={{fontSize:8,fontWeight:700,fill:"#15803D"}}>TRAIN</text>
      </svg>
    ),

    "hearts": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(225,29,72,0.04)" rx={8}/>
        {([["A♠","#1C1917"],["K♥","#DC2626"],["Q♦","#DC2626"],["J♣","#1C1917"]] as [string,string][]).map(([card,color],i)=>(
          <g key={i}><rect x={i*17+6} y={28} width={15} height={24} rx={3} fill="white" stroke="#E2E8F0" strokeWidth={1}/><text x={i*17+13.5} y={40} textAnchor="middle" dominantBaseline="middle" style={{fontSize:7,fontWeight:700,fill:color}}>{card}</text></g>
        ))}
        <text x={40} y={65} textAnchor="middle" style={{fontSize:9,fontWeight:600,fill:"#94A3B8"}}>Avoid ♥ & Q♠</text>
      </svg>
    ),

    "solitaire": (
      <svg width={80} height={80} viewBox="0 0 80 80">
        <rect width={80} height={80} fill="rgba(67,56,202,0.04)" rx={8}/>
        {([["A♥","#DC2626",6,6],["A♦","#DC2626",22,6],["A♣","#1C1917",38,6],["A♠","#1C1917",54,6],
           ["K♠","#1C1917",6,34],["Q♥","#DC2626",6,46],["J♣","#1C1917",6,58]] as [string,string,number,number][]).map(([card,color,x,y],i)=>(
          <g key={i}><rect x={x} y={y} width={14} height={20} rx={2} fill="white" stroke="#E2E8F0" strokeWidth={1}/><text x={x+7} y={y+12} textAnchor="middle" dominantBaseline="middle" style={{fontSize:6,fontWeight:700,fill:color}}>{card}</text></g>
        ))}
      </svg>
    ),
  };

  const snap = snaps[slug];
  if (!snap) return <GameIcon slug={slug} size={52}/>;
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>{snap}</div>;
}

// ── Game Card ─────────────────────────────────────────────────────────────────
function GameCard({ game, i }: { game: typeof GAMES[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ delay:(i%4)*0.05 }}>
      <Link href={`/games/${game.slug}`} style={{ display:"block", textDecoration:"none" }}>
        <div
          onMouseEnter={()=>setHovered(true)}
          onMouseLeave={()=>setHovered(false)}
          style={{
            background:"var(--surface)",
            borderRadius:20,
            border:`0.5px solid ${hovered?"rgba(79,110,247,0.3)":"var(--border)"}`,
            overflow:"hidden", cursor:"pointer",
            boxShadow:hovered?"0 20px 48px rgba(79,110,247,0.14)":"var(--shadow-sm)",
            transform:hovered?"translateY(-4px) scale(1.01)":"translateY(0) scale(1)",
            transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}>
          <div style={{
            height:110,
            background:hovered
              ? "linear-gradient(135deg,rgba(79,110,247,0.07),rgba(156,107,232,0.09))"
              : "rgba(79,110,247,0.03)",
            display:"flex", alignItems:"center", justifyContent:"center",
            position:"relative", transition:"background 0.25s",
            overflow:"hidden",
          }}>
            <GameSnapshot slug={game.slug}/>
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity:0, y:6 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:6 }}
                  style={{
                    position:"absolute", inset:0,
                    background:"rgba(79,110,247,0.88)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexDirection:"column", gap:4,
                    backdropFilter:"blur(4px)",
                  }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"white" }}>
                    {game.free ? "Play Stage 1" : "Play Now"}
                  </span>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>
                    {game.free ? "Free" : "Uses 1 daily play"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:4 }}>
              {game.free && (
                <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:8, background:"rgba(79,110,247,0.15)", color:"#4F6EF7" }}>
                  Free
                </span>
              )}
              <span style={{ fontSize:9, fontWeight:600, padding:"2px 7px", borderRadius:8, background:"rgba(34,197,94,0.12)", color:"#15803D" }}>
                Live
              </span>
            </div>
          </div>
          <div style={{ padding:"11px 14px 13px" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"var(--text1)", marginBottom:3 }}>{game.name}</p>
            <p style={{ fontSize:11, color:"var(--text3)", lineHeight:1.5 }}>{game.desc}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Trustpilot Badge ──────────────────────────────────────────────────────────
function TrustpilotBadge() {
  return (
    <div style={{
      background:"white", borderRadius:20, padding:"28px 32px",
      border:"0.5px solid rgba(0,0,0,0.07)", textAlign:"center",
      boxShadow:"0 2px 8px rgba(0,0,0,0.04)", maxWidth:480, margin:"0 auto",
    }}>
      <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:12}}>
        {[1,2,3,4,5].map(s=>(
          <span key={s} style={{fontSize:28,color:"#F59E0B"}}>★</span>
        ))}
      </div>
      <p style={{fontSize:16,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",marginBottom:6}}>
        Loved by brain-training fans
      </p>
      <p style={{fontSize:13,color:"#64748B",marginBottom:16,lineHeight:1.6}}>
        "Addictive, beautiful, and actually makes me feel sharper."
      </p>
      <a href="https://www.trustpilot.com/review/mindelement.app" target="_blank"
        style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,
          color:"#00B67A",textDecoration:"none",
          padding:"10px 20px",borderRadius:12,border:"1.5px solid #00B67A"}}>
        ★ Rate us on Trustpilot
      </a>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isSilentMode, toggleSilentMode, isAccessibilityMode, toggleAccessibilityMode, theme, toggleTheme } = useSettingsStore();
  const { user, profile } = useAuthStore();
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  // PWA install prompt — intercepts Chrome's bottom-sheet and gives us control
  const { isInstallable, triggerInstall } = usePWAInstall();

  useEffect(() => {
    if (!user || isPro) return;
    setTokens(getTokensRemaining(user.id));
    const iv = setInterval(() => setTokens(getTokensRemaining(user.id)), 10000);
    return () => clearInterval(iv);
  }, [user, isPro]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).Paddle) {
        (window as any).Paddle.Setup({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", color:"var(--text1)" }}>

      {/* ── NAV ── */}
      <nav className="ms-nav" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:50,
        padding:"0 48px", height:64,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <img src="/icons/icon-192.png" alt="MindElement" style={{ width:34, height:34, borderRadius:"22.5%", objectFit:"cover" }}/>
          <span style={{ fontWeight:700, fontSize:18, color:"var(--text1)", fontFamily:"Georgia,serif" }}>MindElement</span>
        </Link>

        {/* Center nav */}
        <div className="nav-links-desktop" style={{ gap:4 }}>
          {[["Games","/games"],["Leaderboard","/leaderboard"],["Family","/family"],["Pricing","/pricing"]].map(([l,h])=>(
            <Link key={l} href={h} style={{ fontSize:14, color:"var(--text3)", padding:"7px 14px", borderRadius:10, textDecoration:"none", fontWeight:500, transition:"color 0.15s" }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="var(--text1)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="var(--text3)"}>
              {l}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {/* Token counter */}
          {user && !isPro && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:20, background:"var(--bg2)", border:"0.5px solid var(--border)" }}>
              <Zap size={13} color={tokens>0?"#4F6EF7":"#EF4444"} fill={tokens>0?"#4F6EF7":"#EF4444"}/>
              <span style={{ fontSize:12, fontWeight:700, color:tokens>0?"#4F6EF7":"#EF4444" }}>{tokens}</span>
              <span style={{ fontSize:11, color:"var(--text4)" }}>/ {FREE_DAILY_TOKENS}</span>
            </div>
          )}
          {user && isPro && (
            <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:20, background:"rgba(79,110,247,0.1)", border:"0.5px solid rgba(79,110,247,0.2)" }}>
              <Infinity size={12} color="#4F6EF7"/>
              <span style={{ fontSize:11, fontWeight:700, color:"#4F6EF7" }}>Pro</span>
            </div>
          )}

          {/* Install App — only shown when Chrome fires beforeinstallprompt */}
          {isInstallable && (
            <motion.button
              initial={{ opacity:0, scale:0.8 }}
              animate={{ opacity:1, scale:1 }}
              onClick={triggerInstall}
              title="Install MindElement app"
              style={{
                display:"flex", alignItems:"center", gap:5,
                padding:"6px 12px", borderRadius:20,
                background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                border:"none", cursor:"pointer", color:"white",
                fontSize:12, fontWeight:600,
              }}>
              <Download size={13}/>
              <span className="hide-mobile">Install App</span>
            </motion.button>
          )}

          {/* Accessibility mode toggle */}
          <button
            onClick={toggleAccessibilityMode}
            title={isAccessibilityMode ? "Accessibility mode on" : "Accessibility mode off"}
            style={{
              padding:8, borderRadius:10, background:"transparent", border:"none",
              cursor:"pointer", display:"flex",
              color: isAccessibilityMode ? "#4F6EF7" : "var(--text4)",
            }}>
            <Accessibility size={16}/>
          </button>

          <button onClick={toggleSilentMode} style={{ padding:8, borderRadius:10, background:"transparent", border:"none", cursor:"pointer", color:"var(--text4)", display:"flex" }}>
            {isSilentMode?<VolumeX size={16}/>:<Volume2 size={16}/>}
          </button>
          <button onClick={toggleTheme} style={{ padding:8, borderRadius:10, background:"transparent", border:"none", cursor:"pointer", color:"var(--text4)", display:"flex" }}>
            {theme==="dark"?<Sun size={16}/>:<Moon size={16}/>}
          </button>

          {user ? (
            <Link href="/profile" style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 10px 6px 6px", borderRadius:14, border:"0.5px solid var(--border)", background:"var(--surface)", textDecoration:"none", cursor:"pointer" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"white" }}>
                {(profile?.username ?? user.email ?? "U")[0].toUpperCase()}
              </div>
              <span className="hide-mobile" style={{ fontSize:12, fontWeight:600, color:"var(--text2)", maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {profile?.username ?? "Profile"}
              </span>
            </Link>
          ) : (
            <div style={{ display:"flex", gap:6 }}>
              <Link href="/auth/signin" style={{ fontSize:13, color:"var(--text3)", padding:"7px 12px", borderRadius:10, textDecoration:"none" }}>Sign in</Link>
              <Link href="/auth/signup" style={{ fontSize:13, fontWeight:700, color:"white", padding:"8px 18px", borderRadius:12, background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", textDecoration:"none", boxShadow:"0 3px 10px rgba(79,110,247,0.3)" }}>
                Start Playing
              </Link>
            </div>
          )}
        </div>
      </nav>

      <FAQSchema/>
      <OrganizationSchema/>
      <WebAppSchema/>
      <HowToSchema/>

      {/* ── HERO ── */}
      <section className="hero-grid" style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 80px", minHeight:"100vh" }}>
        <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 16px", borderRadius:20, background:"var(--surface)", border:"0.5px solid var(--border)", boxShadow:"var(--shadow-sm)", marginBottom:28, fontSize:13, color:"var(--text3)", fontWeight:500 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#22C55E", display:"block" }}/>
            24 Games · 100 Stages Each · Free to Start
          </div>

          <h1 className="hero-h1" style={{ fontFamily:"Georgia,serif", fontWeight:700, lineHeight:1.06, marginBottom:24, fontSize:"clamp(52px,5.5vw,80px)" }}>
            <span style={{ display:"block", color:"var(--text1)" }}>Sharper</span>
            <span style={{ display:"block", fontStyle:"italic", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8,#C4785A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Every Day.</span>
          </h1>

          <p style={{ fontSize:20, color:"var(--text3)", lineHeight:1.65, marginBottom:36, maxWidth:460 }}>
            24 logic disciplines. 100 stages each. An elegant training suite for every mind — children, professionals, and seniors alike.
          </p>

          <div style={{ display:"flex", gap:14, marginBottom:40, flexWrap:"wrap" }}>
            <Link href={user?"/games":"/auth/signup"}
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"15px 28px", borderRadius:16, background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", color:"white", fontWeight:700, fontSize:16, textDecoration:"none", boxShadow:"0 8px 24px rgba(79,110,247,0.35)" }}>
              Start Playing <ChevronRight size={16}/>
            </Link>
            <Link href="/games"
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"15px 28px", borderRadius:16, background:"var(--surface)", color:"var(--text2)", fontWeight:600, fontSize:16, textDecoration:"none", border:"0.5px solid var(--border)", boxShadow:"var(--shadow-sm)" }}>
              Explore Games <ArrowRight size={15}/>
            </Link>
            {/* Hero-level install CTA — only on mobile when installable */}
            {isInstallable && (
              <motion.button
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                onClick={triggerInstall}
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"15px 28px", borderRadius:16, background:"var(--surface)", color:"var(--text2)", fontWeight:600, fontSize:16, border:"0.5px solid var(--border)", boxShadow:"var(--shadow-sm)", cursor:"pointer" }}>
                <Download size={15}/> Install App
              </motion.button>
            )}
          </div>

          {/* Social proof */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ display:"flex" }}>
              {[IMGS.cafe,IMGS.park,IMGS.work_w,IMGS.subway,IMGS.dining].map((img,i)=>(
                <div key={i} style={{ width:34, height:34, borderRadius:"50%", border:"2.5px solid var(--bg)", marginLeft:i>0?-10:0, position:"relative", zIndex:5-i, overflow:"hidden", boxShadow:"0 2px 6px rgba(0,0,0,0.15)" }}>
                  <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display:"flex", gap:1, marginBottom:3 }}>
                {[1,2,3,4,5].map(i=><Star key={i} size={13} fill="#F59E0B" color="#F59E0B"/>)}
              </div>
              <p style={{ fontSize:13, color:"var(--text4)" }}>Loved by players everywhere</p>
            </div>
          </div>
        </motion.div>

        {/* Right — device mockup */}
        <motion.div className="hero-device" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, delay:0.15 }} style={{ display:"flex", justifyContent:"center" }}>
          <div style={{ position:"relative" }}>
            <div style={{ background:"linear-gradient(145deg,#E8E4DE,#CEC9C1)", borderRadius:32, padding:12, boxShadow:"0 40px 80px rgba(0,0,0,0.2),0 8px 24px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.5)" }}>
              <div style={{ background:"var(--surface)", borderRadius:22, overflow:"hidden", minWidth:340, boxShadow:"inset 0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", background:"var(--bg2)", borderBottom:"0.5px solid var(--border)" }}>
                  <span style={{ fontSize:11, fontWeight:600, color:"var(--text4)", fontFamily:"monospace" }}>9:41</span>
                  <div style={{ display:"flex", gap:3 }}>{[0,1,2].map(i=><div key={i} style={{ width:4, height:4, borderRadius:"50%", background:"var(--border2)" }}/>)}</div>
                </div>
                <HeroCarousel/>
              </div>
            </div>
            <div style={{ position:"absolute", bottom:-12, left:"15%", right:"15%", height:20, background:"rgba(79,110,247,0.2)", filter:"blur(18px)", borderRadius:"50%" }}/>
          </div>
        </motion.div>
      </section>

      {/* ── VALUE BAR ── */}
      <section style={{ background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", padding:"22px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-around", flexWrap:"wrap", gap:16 }}>
          {[
            { icon:Trophy,   text:"24 Unique Disciplines" },
            { icon:Star,     text:"2,400+ Expert Stages" },
            { icon:Infinity, text:"Infinite Daily Challenges" },
            { icon:Shield,   text:"Zero Ads. Ever." },
            { icon:Zap,      text:"5 Free Plays Daily" },
          ].map((item,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, color:"white" }}>
              <item.icon size={18} color="rgba(255,255,255,0.8)"/>
              <span style={{ fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.95)", whiteSpace:"nowrap" }}>{item.text}</span>
              {i < 4 && <span style={{ color:"rgba(255,255,255,0.3)", fontSize:20, marginLeft:6 }}>·</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ── TOKEN ECONOMY ── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"72px 48px 0" }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ marginBottom:36 }}>
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text4)", marginBottom:10 }}>How it works</p>
          <h2 style={{ fontSize:40, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:12 }}>
            Play every game, every day.
          </h2>
          <p style={{ fontSize:18, color:"var(--text3)", maxWidth:560 }}>
            Free players get 5 daily plays across all 24 games. Pro subscribers play without limits.
          </p>
        </motion.div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:72 }}>
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0 }}
            style={{ background:"var(--surface)", borderRadius:24, border:"0.5px solid var(--border)", padding:"28px 28px", boxShadow:"var(--shadow-sm)" }}>
            <div style={{ width:44, height:44, borderRadius:14, background:"rgba(79,110,247,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <Zap size={22} color="#4F6EF7"/>
            </div>
            <p style={{ fontSize:48, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", lineHeight:1, marginBottom:8 }}>5</p>
            <p style={{ fontSize:16, fontWeight:600, color:"var(--text2)", marginBottom:6 }}>Free Daily Plays</p>
            <p style={{ fontSize:14, color:"var(--text3)", lineHeight:1.6 }}>Play any of the 24 games. Tokens reset every 24 hours at midnight.</p>
          </motion.div>

          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.08 }}
            style={{ background:"linear-gradient(135deg,rgba(245,158,11,0.1),rgba(234,88,12,0.08))", borderRadius:24, border:"0.5px solid rgba(245,158,11,0.2)", padding:"28px 28px", boxShadow:"var(--shadow-sm)" }}>
            <div style={{ width:44, height:44, borderRadius:14, background:"rgba(245,158,11,0.15)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <Flame size={22} color="#F59E0B" className="streak-fire"/>
            </div>
            <p style={{ fontSize:48, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", lineHeight:1, marginBottom:8 }}>+10</p>
            <p style={{ fontSize:16, fontWeight:600, color:"var(--text2)", marginBottom:6 }}>Weekly Streak Bonus</p>
            <p style={{ fontSize:14, color:"var(--text3)", lineHeight:1.6 }}>Play 7 days in a row and earn 10 bonus plays automatically added to your account.</p>
          </motion.div>

          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.16 }}
            style={{ background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", borderRadius:24, padding:"28px 28px", boxShadow:"0 16px 40px rgba(79,110,247,0.25)" }}>
            <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <Infinity size={22} color="white"/>
            </div>
            <p style={{ fontSize:48, fontWeight:700, color:"white", fontFamily:"Georgia,serif", lineHeight:1, marginBottom:8 }}>∞</p>
            <p style={{ fontSize:16, fontWeight:600, color:"rgba(255,255,255,0.95)", marginBottom:6 }}>Pro Unlimited</p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", lineHeight:1.6 }}>Unlimited plays, all 100 stages per game, Infinite Mode and Family leaderboards from $2/mo.</p>
            <Link href="/pricing" style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:16, padding:"10px 18px", borderRadius:12, background:"white", color:"#4F6EF7", fontSize:13, fontWeight:700, textDecoration:"none" }}>
              Upgrade <ChevronRight size={13}/>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── LIFESTYLE STRIP ── */}
      <section style={{ paddingBottom:72, overflow:"hidden" }}>
        <div className="lifestyle-strip">
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
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.05 }}
              style={{ flexShrink:0, position:"relative", borderRadius:20, overflow:"hidden", width:200, height:264, boxShadow:"var(--shadow-md)" }}>
              <img src={item.img} alt={item.label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"32px 14px 14px", background:"linear-gradient(transparent,rgba(0,0,0,0.6))", color:"white", fontSize:12, fontWeight:600 }}>
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div id="games" style={{scrollMarginTop:"70px"}}/>
      {/* ── GAMES COLLECTION ── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"0 48px 80px" }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ marginBottom:32 }}>
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text4)", marginBottom:10 }}>The Collection</p>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <h2 style={{ fontSize:40, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", lineHeight:1.1 }}>
              Twenty-Four Games.<br/>
              <em style={{ fontStyle:"italic", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>One Subscription.</em>
            </h2>
            <Link href="/games" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"11px 20px", borderRadius:14, border:"0.5px solid var(--border)", background:"var(--surface)", color:"var(--text2)", textDecoration:"none", fontSize:14, fontWeight:600 }}>
              View All Games <ArrowRight size={14}/>
            </Link>
          </div>
        </motion.div>
        <div className="games-grid-4">
          {GAMES.map((game,i)=><GameCard key={game.slug} game={game} i={i}/>)}
        </div>
      </section>

      {/* ── COMING SOON TEASER ── */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}><ComingSoonTeaser compact/></div>

      <div id="how-it-works" style={{scrollMarginTop:"70px"}}/>
      {/* ── HOW IT WORKS ── */}
      <section style={{ background:"var(--bg2)", borderTop:"0.5px solid var(--border)", borderBottom:"0.5px solid var(--border)", padding:"72px 48px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:40, color:"var(--text1)", textAlign:"center", marginBottom:52 }}>
            Built for the Modern Mind
          </h2>
          <div className="how-grid">
            {[
              { from:"#4F6EF7", to:"#7C4FD4", num:"01", title:"Choose a discipline", body:"24 logic games, each with its own rhythm. Start free with any game — no account needed." },
              { from:"#9C6BE8", to:"#C4785A", num:"02", title:"Train daily",          body:"XP decays in real time. The faster you solve, the more you earn. Build a streak for bonus plays." },
              { from:"#7C9E87", to:"#4A7C59", num:"03", title:"Master and compete",   body:"Family leaderboards, shareable challenge links, and real-time celebrations when records fall." },
            ].map((s,i)=>(
              <motion.div key={i} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                style={{ background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:28, boxShadow:"var(--shadow-sm)" }}>
                <div style={{ width:44, height:44, borderRadius:"22.5%", background:`linear-gradient(135deg,${s.from},${s.to})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700, color:"white", fontFamily:"Georgia,serif", marginBottom:16 }}>
                  {s.num}
                </div>
                <p style={{ fontSize:17, fontWeight:700, color:"var(--text1)", marginBottom:10 }}>{s.title}</p>
                <p style={{ fontSize:15, color:"var(--text3)", lineHeight:1.65 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL WIDTH PHOTO CTA ── */}
      <section style={{ position:"relative", height:460, overflow:"hidden" }}>
        <img src={IMGS.work_m} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(79,110,247,0.87),rgba(156,107,232,0.78))" }}/>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"0 48px" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:48, color:"white", marginBottom:14, lineHeight:1.08 }}>
              Your sharpest self<br/><em>starts here.</em>
            </h2>
            <p style={{ fontSize:18, color:"rgba(255,255,255,0.8)", marginBottom:32, maxWidth:440 }}>
              Join thousands of players training their minds daily. 5 free plays, every day. No credit card needed.
            </p>
            <Link href={user?"/games":"/auth/signup"}
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"16px 32px", borderRadius:18, background:"white", color:"#4F6EF7", fontWeight:700, fontSize:16, textDecoration:"none", boxShadow:"0 8px 28px rgba(0,0,0,0.2)" }}>
              Start Playing — It's Free <ChevronRight size={16}/>
            </Link>
          </motion.div>
        </div>
      </section>

      <div id="coming-soon" style={{scrollMarginTop:"70px"}}/>
      <ComingSoonTeaser/>

      <div id="pricing" style={{scrollMarginTop:"70px"}}/>
      {/* ── PRICING ── */}
      <section style={{ maxWidth:1000, margin:"0 auto", padding:"80px 48px" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:40, color:"var(--text1)", marginBottom:10 }}>Simple, Honest Pricing</h2>
          <p style={{ fontSize:18, color:"var(--text4)" }}>Less than a coffee. Sharper than ever.</p>
        </div>
        <div className="pricing-grid" style={{ alignItems:"start", maxWidth:860, margin:"0 auto" }}>
          {PLANS.map((plan,i)=>(
            <motion.div key={i} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
              style={{ borderRadius:24, padding:28, position:"relative",
                background: plan.highlight ? "linear-gradient(135deg,#4F6EF7,#9C6BE8)" : "var(--surface)",
                border: plan.highlight ? "none" : "0.5px solid var(--border)",
                boxShadow: plan.highlight ? "0 24px 56px rgba(79,110,247,0.3)" : "var(--shadow-sm)",
                color: plan.highlight ? "white" : "var(--text1)" }}>
              {plan.highlight&&(
                <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", fontSize:10, fontWeight:700, color:"#4F6EF7", background:"white", padding:"4px 14px", borderRadius:20, boxShadow:"0 2px 8px rgba(0,0,0,0.1)", whiteSpace:"nowrap" }}>
                  Most Popular
                </div>
              )}
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12, color:plan.highlight?"rgba(255,255,255,0.65)":"var(--text4)" }}>{plan.name}</p>
              <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:22 }}>
                <span style={{ fontSize:52, fontWeight:700, lineHeight:1, fontFamily:"Georgia,serif" }}>{plan.price}</span>
                <span style={{ fontSize:14, paddingBottom:7, opacity:0.6 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle:"none", marginBottom:24, display:"flex", flexDirection:"column", gap:10 }}>
                {plan.features.map((f,j)=>(
                  <li key={j} style={{ display:"flex", alignItems:"center", gap:10, fontSize:14, color:plan.highlight?"rgba(255,255,255,0.88)":"var(--text2)" }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:plan.highlight?"rgba(255,255,255,0.2)":"#EEF2FF" }}>
                      <Check size={10} color={plan.highlight?"white":"#4F6EF7"}/>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.free ? (
                <Link href="/auth/signup" style={{ display:"block", textAlign:"center", padding:"13px", borderRadius:14, fontWeight:700, fontSize:14, textDecoration:"none", background:"var(--surface)", color:"var(--text2)", border:"1.5px solid var(--border2)" }}>
                  Start Free
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && (window as any).Paddle) {
                      (window as any).Paddle.Checkout.open({
                        items: [{ priceId: plan.paddlePriceId, quantity: 1 }],
                      });
                    }
                  }}
                  style={{ display:"block", width:"100%", textAlign:"center", padding:"13px", borderRadius:14, fontWeight:700, fontSize:14, cursor:"pointer", border:"none",
                    background: plan.highlight ? "white" : "transparent",
                    color: plan.highlight ? "#4F6EF7" : "var(--text2)",
                    outline: plan.highlight ? "none" : "1.5px solid var(--border2)" }}>
                  {plan.trial ? "Start 3-day free trial" : "Get Started"}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <div id="faq" style={{scrollMarginTop:"70px"}}/>
      <section style={{ maxWidth:720, margin:"0 auto", padding:"80px 48px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text4)", marginBottom:10 }}>FAQ</p>
          <h2 style={{ fontSize:36, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", lineHeight:1.15 }}>
            Frequently Asked Questions
          </h2>
        </div>
        {[
          ["Is MindElement free to use?", "Yes — free users get 5 plays per day across all 24 games. Daily challenges are always free. Subscribe for unlimited access at $2/month."],
          ["What does Pro include?", "Unlimited plays across all 24 games, all 100 stages per game, family leaderboards for up to 7 members, and early access to new games."],
          ["How much does Pro cost?", "Individual Pro is $2/month. Family plans start at $5/month for 3 members and $10/month for 7 members."],
          ["Is it appropriate for children?", "Yes. The puzzles build spatial reasoning and logical thinking without any ads, distractions, or inappropriate content."],
          ["Can it help older adults stay sharp?", "Yes. Accessibility Mode provides larger touch targets and optional timer-free play, designed for comfortable daily use at any age."],
          ["How does family billing work?", "One monthly charge covers up to 3 or 7 independent player profiles, each with their own progress and scores, plus a shared family leaderboard."],
          ["Can I cancel anytime?", "Yes. Cancel from your profile settings at any time. You keep access until the end of your billing period."],
          ["Do I need an account?", "No — you can play as a guest. Creating a free account saves your progress, streaks, and XP scores to the leaderboard."],
          ["Does it work offline?", "Yes. MindElement is a Progressive Web App. Install it to your home screen and play without an internet connection."],
          ["What languages are supported?", "English, Spanish, German, French, Portuguese, Dutch, and Hebrew with full right-to-left layout."],
        ].map(([q, a], i) => (
          <details key={i} style={{ borderBottom:"0.5px solid var(--border)" }}>
            <summary style={{ fontSize:15, fontWeight:600, color:"var(--text1)",
              padding:"18px 0", cursor:"pointer", listStyle:"none",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              {q}
              <span style={{ fontSize:20, color:"var(--text4)", flexShrink:0 }}>+</span>
            </summary>
            <p style={{ fontSize:14, color:"var(--text3)", lineHeight:1.75, paddingBottom:18, maxWidth:600 }}>{a}</p>
          </details>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"0.5px solid var(--border)", background:"var(--bg2)", padding:"32px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <img src="/icons/icon-192.png" alt="MindElement" style={{ width:28, height:28, borderRadius:"22.5%", objectFit:"cover" }}/>
            <span style={{ fontWeight:700, fontSize:15, color:"var(--text2)", fontFamily:"Georgia,serif" }}>MindElement</span>
          </Link>
          <p style={{ fontSize:13, color:"var(--text4)" }}>&copy; {new Date().getFullYear()} MindElement. All rights reserved.</p>
          <div style={{ display:"flex", gap:24 }}>
            {[["Games","/games"],["Pricing","/pricing"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h])=>(
              <Link key={l} href={h} style={{ fontSize:13, color:"var(--text4)", textDecoration:"none" }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}