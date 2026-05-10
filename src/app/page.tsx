"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ChevronRight, ArrowRight, Check,
  Volume2, VolumeX, Sun, Moon, Star, Zap,
  Flame, Shield, Infinity, Trophy, Lock
} from "lucide-react";
import Link from "next/link";
import {
  generateTangoBoard, validateBoard,
  type Cell, type TangoBoard, type CellStatus
} from "@/lib/games/tangoGenerator";
import { playClick, playSuccess } from "@/lib/audio/soundEngine";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { GameIcon, SunIcon, MoonIcon } from "@/components/icons/GameIcons";
import { triggerConfetti } from "@/components/effects/Confetti";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";

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
  { name:"Individual", price:"$2",  period:"/mo", features:["All 20 games","1,000 stages each","Unlimited daily plays","Global leaderboard","Infinite mode"], highlight:false },
  { name:"Family · 3", price:"$5",  period:"/mo", features:["3 members","Family leaderboard","All individual perks","Shared streaks","Priority support"], highlight:true },
  { name:"Family · 7", price:"$10", period:"/mo", features:["7 members","Family leaderboard","All individual perks","Shared streaks","Priority support"], highlight:false },
];

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
          {solved&&<motion.span initial={{scale:0}} animate={{scale:1}} style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"2px 10px",borderRadius:20}}>✓ Solved!</motion.span>}
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

// ── All 20 games ──────────────────────────────────────────────────────────────
const GAMES = [
  { slug:"tango",         name:"Tango",          desc:"Balance rows & columns", free:true  },
  { slug:"memory",        name:"Memory",          desc:"Flip cards, find pairs", free:true  },
  { slug:"queens",        name:"Queens",          desc:"One queen per region",   free:true  },
  { slug:"sudoku",        name:"Mini Sudoku",     desc:"No repeats in grid",     free:false },
  { slug:"zip",           name:"Zip",             desc:"Trace through every cell",free:false},
  { slug:"flow",          name:"Flow",            desc:"Connect color dots",     free:false },
  { slug:"bridges",       name:"Bridges",         desc:"Right number of bridges",free:false },
  { slug:"kakuro",        name:"Kakuro",          desc:"Digit sums guide you",   free:false },
  { slug:"logic-path",    name:"Logic Path",      desc:"Rotate pipes to connect",free:false },
  { slug:"lightup",       name:"Light Up",        desc:"Illuminate every cell",  free:false },
  { slug:"nonogram",      name:"Nonogram",        desc:"Pixel art from clues",   free:false },
  { slug:"pattern-match", name:"Pattern Match",   desc:"Find the rule",          free:false },
  { slug:"patches",       name:"Patches",         desc:"Tile with polyominoes",  free:false },
  { slug:"2048-pro",      name:"2048 Pro",        desc:"Merge to the target",    free:false },
  { slug:"gravity-sort",  name:"Gravity Sort",    desc:"Sort falling blocks",    free:false },
  { slug:"hex-merge",     name:"Hex Merge",       desc:"Chain hex merges",       free:false },
  { slug:"word-sling",    name:"Word Sling",      desc:"Build scoring words",    free:false },
  { slug:"hearts",        name:"Hearts",          desc:"Avoid penalty cards",    free:false },
  { slug:"solitaire",     name:"Solitaire",       desc:"Classic Klondike",       free:false },
  { slug:"minesweeper",   name:"Minesweeper",     desc:"Deduce the mines",       free:false },
];

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
          {/* Icon area */}
          <div style={{
            height:100,
            background:hovered
              ? "linear-gradient(135deg,rgba(79,110,247,0.1),rgba(156,107,232,0.12))"
              : "rgba(79,110,247,0.04)",
            display:"flex", alignItems:"center", justifyContent:"center",
            position:"relative", transition:"background 0.25s",
          }}>
            <GameIcon slug={game.slug} size={48}/>

            {/* Hover overlay — "Play Stage 1" */}
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
                    {game.free ? "▶  Play Stage 1" : "▶  Play Now"}
                  </span>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>
                    {game.free ? "Free" : "Uses 1 daily play"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Badges */}
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

          {/* Info */}
          <div style={{ padding:"11px 14px 13px" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"var(--text1)", marginBottom:3 }}>{game.name}</p>
            <p style={{ fontSize:11, color:"var(--text3)", lineHeight:1.5 }}>{game.desc}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isSilentMode, toggleSilentMode, theme, toggleTheme } = useSettingsStore();
  const { user, profile } = useAuthStore();
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  useEffect(() => {
    if (!user || isPro) return;
    setTokens(getTokensRemaining(user.id));
    const iv = setInterval(() => setTokens(getTokensRemaining(user.id)), 10000);
    return () => clearInterval(iv);
  }, [user, isPro]);

  const W = "max-width:1200px;margin:0 auto;padding:0 48px";

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
          <img src="/icons/icon-192.png" alt="MindState" style={{ width:34, height:34, borderRadius:"22.5%", objectFit:"cover" }}/>
          <span style={{ fontWeight:700, fontSize:18, color:"var(--text1)", fontFamily:"Georgia,serif" }}>MindState</span>
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
          {/* Token counter for logged-in free users */}
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

      {/* ── HERO ── */}
      <section className="hero-grid" style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 80px", minHeight:"100vh" }}>
        {/* Left */}
        <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 16px", borderRadius:20, background:"var(--surface)", border:"0.5px solid var(--border)", boxShadow:"var(--shadow-sm)", marginBottom:28, fontSize:13, color:"var(--text3)", fontWeight:500 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#22C55E", display:"block" }}/>
            20 Games · 1,000 Stages Each · Free to Start
          </div>

          <h1 className="hero-h1" style={{ fontFamily:"Georgia,serif", fontWeight:700, lineHeight:1.06, marginBottom:24, fontSize:"clamp(52px,5.5vw,80px)" }}>
            <span style={{ display:"block", color:"var(--text1)" }}>Sharper</span>
            <span style={{ display:"block", fontStyle:"italic", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8,#C4785A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Every Day.</span>
          </h1>

          <p style={{ fontSize:20, color:"var(--text3)", lineHeight:1.65, marginBottom:36, maxWidth:460 }}>
            Explore 20 logic disciplines and 1,000 hand-crafted stages each. An elegant training suite for the modern mind.
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

        {/* Right — device */}
        <motion.div className="hero-device" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, delay:0.15 }} style={{ display:"flex", justifyContent:"center" }}>
          <div style={{ position:"relative" }}>
            <div style={{ background:"linear-gradient(145deg,#E8E4DE,#CEC9C1)", borderRadius:32, padding:12, boxShadow:"0 40px 80px rgba(0,0,0,0.2),0 8px 24px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.5)" }}>
              <div style={{ background:"var(--surface)", borderRadius:22, overflow:"hidden", minWidth:340, boxShadow:"inset 0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", background:"var(--bg2)", borderBottom:"0.5px solid var(--border)" }}>
                  <span style={{ fontSize:11, fontWeight:600, color:"var(--text4)", fontFamily:"monospace" }}>9:41</span>
                  <div style={{ display:"flex", gap:3 }}>{[0,1,2].map(i=><div key={i} style={{ width:4, height:4, borderRadius:"50%", background:"var(--border2)" }}/>)}</div>
                </div>
                <div style={{ padding:"16px 18px 18px" }}><TangoDemo cellSize={46}/></div>
                <div style={{ padding:"0 18px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"var(--text4)" }}>No account needed</span>
                  <Link href="/games/tango" style={{ fontSize:12, fontWeight:600, color:"#4F6EF7", display:"flex", alignItems:"center", gap:3, textDecoration:"none" }}>
                    Full game <ArrowRight size={11}/>
                  </Link>
                </div>
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
            { icon:Trophy,   text:"20 Unique Disciplines" },
            { icon:Star,     text:"20,000+ Expert Stages" },
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

      {/* ── TOKEN ECONOMY EXPLAINER ── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"72px 48px 0" }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ marginBottom:36 }}>
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text4)", marginBottom:10 }}>How it works</p>
          <h2 style={{ fontSize:40, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:12 }}>
            Play every game, every day.
          </h2>
          <p style={{ fontSize:18, color:"var(--text3)", maxWidth:560 }}>
            Free players get 5 daily plays across all 20 games. Pro subscribers play without limits.
          </p>
        </motion.div>

        {/* Bento stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:72 }}>
          {/* Free tier */}
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0 }}
            style={{ gridColumn:"span 1", background:"var(--surface)", borderRadius:24, border:"0.5px solid var(--border)", padding:"28px 28px", boxShadow:"var(--shadow-sm)" }}>
            <div style={{ width:44, height:44, borderRadius:14, background:"rgba(79,110,247,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <Zap size={22} color="#4F6EF7"/>
            </div>
            <p style={{ fontSize:48, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", lineHeight:1, marginBottom:8 }}>5</p>
            <p style={{ fontSize:16, fontWeight:600, color:"var(--text2)", marginBottom:6 }}>Free Daily Plays</p>
            <p style={{ fontSize:14, color:"var(--text3)", lineHeight:1.6 }}>Play any of the 20 games. Tokens reset every 24 hours at midnight.</p>
          </motion.div>

          {/* Streak */}
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.08 }}
            style={{ gridColumn:"span 1", background:"linear-gradient(135deg,rgba(245,158,11,0.1),rgba(234,88,12,0.08))", borderRadius:24, border:"0.5px solid rgba(245,158,11,0.2)", padding:"28px 28px", boxShadow:"var(--shadow-sm)" }}>
            <div style={{ width:44, height:44, borderRadius:14, background:"rgba(245,158,11,0.15)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <Flame size={22} color="#F59E0B" className="streak-fire"/>
            </div>
            <p style={{ fontSize:48, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", lineHeight:1, marginBottom:8 }}>+10</p>
            <p style={{ fontSize:16, fontWeight:600, color:"var(--text2)", marginBottom:6 }}>Weekly Streak Bonus</p>
            <p style={{ fontSize:14, color:"var(--text3)", lineHeight:1.6 }}>Play 7 days in a row and earn 10 bonus plays automatically added to your account.</p>
          </motion.div>

          {/* Pro */}
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.16 }}
            style={{ gridColumn:"span 1", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", borderRadius:24, padding:"28px 28px", boxShadow:"0 16px 40px rgba(79,110,247,0.25)" }}>
            <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <Infinity size={22} color="white"/>
            </div>
            <p style={{ fontSize:48, fontWeight:700, color:"white", fontFamily:"Georgia,serif", lineHeight:1, marginBottom:8 }}>∞</p>
            <p style={{ fontSize:16, fontWeight:600, color:"rgba(255,255,255,0.95)", marginBottom:6 }}>Pro Unlimited</p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", lineHeight:1.6 }}>Unlimited plays, all 1,000 stages per game, Infinite Mode and Family leaderboards from $2/mo.</p>
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

      {/* ── GAMES COLLECTION ── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"0 48px 80px" }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ marginBottom:32 }}>
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text4)", marginBottom:10 }}>The Collection</p>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <h2 style={{ fontSize:40, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", lineHeight:1.1 }}>
              Twenty Games.<br/>
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

      {/* ── HOW IT WORKS ── */}
      <section style={{ background:"var(--bg2)", borderTop:"0.5px solid var(--border)", borderBottom:"0.5px solid var(--border)", padding:"72px 48px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:40, color:"var(--text1)", textAlign:"center", marginBottom:52 }}>
            Built for the Modern Mind
          </h2>
          <div className="how-grid">
            {[
              { from:"#4F6EF7", to:"#7C4FD4", num:"01", title:"Choose a discipline", body:"20 logic games, each with its own rhythm. Start free with any game — no account needed." },
              { from:"#9C6BE8", to:"#C4785A", num:"02", title:"Train daily",          body:"XP decays in real time. The faster you solve, the more you earn. Build a streak for bonus plays." },
              { from:"#7C9E87", to:"#4A7C59", num:"03", title:"Master & compete",     body:"Family leaderboards, shareable challenge links, and real-time celebrations when records fall." },
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
              <Link href="/auth/signup" style={{ display:"block", textAlign:"center", padding:"13px", borderRadius:14, fontWeight:700, fontSize:14, textDecoration:"none",
                background: plan.highlight?"white":"transparent",
                color: plan.highlight?"#4F6EF7":"var(--text2)",
                border: plan.highlight?"none":"1.5px solid var(--border2)" }}>
                Start Playing Free
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"0.5px solid var(--border)", background:"var(--bg2)", padding:"32px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <img src="/icons/icon-192.png" alt="MindState" style={{ width:28, height:28, borderRadius:"22.5%", objectFit:"cover" }}/>
            <span style={{ fontWeight:700, fontSize:15, color:"var(--text2)", fontFamily:"Georgia,serif" }}>MindState</span>
          </Link>
          <p style={{ fontSize:13, color:"var(--text4)" }}>&copy; {new Date().getFullYear()} MindState. All rights reserved.</p>
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
