"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronRight, ArrowRight, Check, Volume2, VolumeX, Sun, Moon, Star, Trophy, Zap, Users } from "lucide-react";
import Link from "next/link";
import { generateTangoBoard, validateBoard, type Cell, type TangoBoard, type CellStatus } from "@/lib/games/tangoGenerator";
import { playClick, playSuccess } from "@/lib/audio/soundEngine";
import { useSettingsStore } from "@/store/settingsStore";
import { GameIcon, SunIcon, MoonIcon } from "@/components/icons/GameIcons";
import { triggerConfetti } from "@/components/effects/Confetti";

const GAMES = [
  { slug:"tango",         name:"Tango",          desc:"Balance rows & columns with equal symbols",      free:true  },
  { slug:"memory",        name:"Memory",          desc:"Flip cards, find pairs before XP fades",         free:true  },
  { slug:"queens",        name:"Queens",          desc:"One queen per row, column, and color region",    free:true  },
  { slug:"sudoku",        name:"Mini Sudoku",     desc:"Fill the grid — no repeats in any row or box",  free:false },
  { slug:"zip",           name:"Zip",             desc:"Trace a path through every cell in order",       free:false },
  { slug:"minesweeper",   name:"Minesweeper",     desc:"Deduce every mine from number clues",            free:false },
  { slug:"patches",       name:"Patches",         desc:"Tile the board with polyomino shapes",           free:false },
  { slug:"hearts",        name:"Hearts",          desc:"Classic trick-avoidance in solo mode",           free:false },
  { slug:"solitaire",     name:"Solitaire",       desc:"Classic Klondike with a polished twist",         free:false },
  { slug:"word-sling",    name:"Word Sling",      desc:"Build high-scoring words from letter tiles",     free:false },
  { slug:"2048-pro",      name:"2048 Pro",        desc:"Merge tiles to reach 2048 and beyond",           free:false },
  { slug:"logic-path",    name:"Logic Path",      desc:"Connect matching pipe ends to fill the board",   free:false },
  { slug:"pattern-match", name:"Pattern Match",   desc:"Identify the rule, complete the sequence",       free:false },
  { slug:"hex-merge",     name:"Hex Merge",       desc:"Merge hexagonal tiles in chain reactions",       free:false },
  { slug:"gravity-sort",  name:"Gravity Sort",    desc:"Sort falling blocks into correct columns",       free:false },
  { slug:"bridges",       name:"Bridges",         desc:"Connect islands with exactly the right bridges", free:false },
  { slug:"kakuro",        name:"Kakuro",          desc:"Crossword meets Sudoku — sums guide every entry",free:false },
  { slug:"nonogram",      name:"Nonogram",        desc:"Solve pixel puzzles from row/column clues",      free:false },
  { slug:"flow",          name:"Flow",            desc:"Connect color dots without crossing paths",       free:false },
  { slug:"lightup",       name:"Light Up",        desc:"Place bulbs to illuminate every cell once",      free:false },
];

const PLANS = [
  { name:"Individual", price:"$2",  features:["All 20 games","100 stages/game","Daily challenges","Global leaderboard","Infinite mode"], highlight:false },
  { name:"Family · 3", price:"$5",  features:["3 members","Family leaderboard","All individual perks","Shared streaks","Priority support"], highlight:true },
  { name:"Family · 7", price:"$10", features:["7 members","Family leaderboard","All individual perks","Shared streaks","Priority support"], highlight:false },
];

// ── Tango Demo ────────────────────────────────────────────────────────────────
function TangoDemo() {
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

  const CELL=54;
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <p style={{fontSize:9,color:"#94A3B8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Free Play · No account needed</p>
          <p style={{fontSize:15,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif"}}>Tango</p>
        </div>
        <AnimatePresence>
          {solved&&<motion.span initial={{scale:0}} animate={{scale:1}}
            style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",border:"1px solid #86EFAC",padding:"3px 10px",borderRadius:20}}>
            ✓ Solved!
          </motion.span>}
        </AnimatePresence>
      </div>
      <div style={{height:3,background:"#EDE9E4",borderRadius:2,marginBottom:16}}>
        <motion.div style={{height:3,background:"linear-gradient(90deg,#4F6EF7,#9C6BE8)",borderRadius:2}}
          animate={{width:solved?"100%":"42%"}} transition={{duration:0.8}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${CELL}px)`,gap:8,marginBottom:14}}>
        {board.puzzle.map((_,r)=>board.puzzle[r].map((_,c)=>{
          const status=statuses[r][c];
          const value=playerGrid[r][c];
          const isGiven=status==="given";
          const key=`${r}-${c}`;
          const rightC=cm.get(`${r}-${c}-${r}-${c+1}`);
          const bottomC=cm.get(`${r}-${c}-${r+1}-${c}`);
          return(
            <div key={key} style={{position:"relative",width:CELL,height:CELL}}>
              <motion.button onClick={()=>handleClick(r,c)}
                whileTap={!isGiven?{scale:0.85}:{}}
                animate={squish===key?{scaleX:[1,0.86,1.08,1],scaleY:[1,1.1,0.94,1]}:{}}
                transition={{duration:0.32}}
                style={{
                  width:"100%",height:"100%",borderRadius:12,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  border:"1.5px solid",
                  background:isGiven?"#F8F7F5":"white",
                  borderColor:isGiven?"#EDE9E4":value?"#D1C8E8":"#F0EDE8",
                  boxShadow:isGiven?"none":value?"0 4px 14px rgba(79,110,247,0.12)":"0 2px 6px rgba(0,0,0,0.05)",
                  cursor:isGiven?"default":"pointer",outline:"none",
                }}>
                {value==="S"&&<SunIcon size={24}/>}
                {value==="M"&&<MoonIcon size={24}/>}
                {!value&&<div style={{width:7,height:7,borderRadius:"50%",background:isGiven?"#D1CBC1":"#E8E4DE"}}/>}
              </motion.button>
              {rightC&&c<board.size-1&&(
                <div style={{position:"absolute",right:-9,top:"50%",transform:"translateY(-50%)",zIndex:10,
                  width:18,height:18,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:9,fontWeight:700,border:`1.5px solid ${rightC==="same"?"#4F6EF7":"#F87171"}`,
                  color:rightC==="same"?"#4F6EF7":"#F87171",boxShadow:"0 2px 6px rgba(0,0,0,0.1)"}}>
                  {rightC==="same"?"=":"×"}
                </div>
              )}
              {bottomC&&r<board.size-1&&(
                <div style={{position:"absolute",bottom:-9,left:"50%",transform:"translateX(-50%)",zIndex:10,
                  width:18,height:18,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:9,fontWeight:700,border:`1.5px solid ${bottomC==="same"?"#4F6EF7":"#F87171"}`,
                  color:bottomC==="same"?"#4F6EF7":"#F87171",boxShadow:"0 2px 6px rgba(0,0,0,0.1)"}}>
                  {bottomC==="same"?"=":"×"}
                </div>
              )}
            </div>
          );
        }))}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16}}>
        <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#94A3B8"}}><SunIcon size={12}/> Sun</span>
        <span style={{color:"#E2E8F0"}}>·</span>
        <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#94A3B8"}}><MoonIcon size={12}/> Moon</span>
        <span style={{color:"#E2E8F0"}}>·</span>
        <button onClick={()=>{setPlayerGrid(board.puzzle.map(r=>[...r]));setStatuses(board.puzzle.map(r=>r.map(c=>c!==null?"given":"empty")));setSolved(false);}}
          style={{fontSize:11,color:"#4F6EF7",background:"none",border:"none",cursor:"pointer",fontWeight:500}}>
          Reset
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isSilentMode, toggleSilentMode, theme, toggleTheme } = useSettingsStore();

  return (
    <div style={{background:"#FDFCFB",minHeight:"100vh",color:"#1C1917"}}>

      {/* NAV */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:50,
        background:"rgba(253,252,251,0.92)",backdropFilter:"blur(20px)",
        borderBottom:"0.5px solid rgba(0,0,0,0.07)",
        padding:"0 32px",height:60,
        display:"flex",alignItems:"center",justifyContent:"space-between",
      }}>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
          <div style={{width:28,height:28,borderRadius:"22.5%",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 8px rgba(79,110,247,0.3)"}}>
            <Brain size={14} color="white"/>
          </div>
          <span style={{fontWeight:700,fontSize:16,color:"#1C1917",fontFamily:"Georgia,serif"}}>MindState</span>
        </Link>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
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
      <section style={{maxWidth:1100,margin:"0 auto",padding:"100px 40px 60px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"center",minHeight:"100vh"}}>

        {/* Left */}
        <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.6}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,background:"white",border:"0.5px solid rgba(0,0,0,0.08)",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",marginBottom:24,fontSize:12,color:"#64748B",fontWeight:500}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#22C55E",display:"block"}}/>
            20 Games · 2,000+ Stages · Free to Start
          </div>

          <h1 style={{fontFamily:"Georgia,serif",fontWeight:700,lineHeight:1.08,marginBottom:20,fontSize:"clamp(44px,5vw,64px)"}}>
            <span style={{display:"block",color:"#1C1917"}}>Sharper</span>
            <span style={{display:"block",fontStyle:"italic",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8,#C4785A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Every Day.</span>
          </h1>

          <p style={{fontSize:16,color:"#64748B",lineHeight:1.7,marginBottom:28,maxWidth:400}}>
            Explore 20 logic disciplines and 2,000+ hand-crafted stages. An elegant training suite for the modern mind. Countless hours of fun, zero nonsense.
          </p>

          <div style={{display:"flex",gap:12,marginBottom:32,flexWrap:"wrap"}}>
            <Link href="/auth/signup" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"13px 24px",borderRadius:14,background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",color:"white",fontWeight:700,fontSize:14,textDecoration:"none",boxShadow:"0 6px 20px rgba(79,110,247,0.3)"}}>
              Begin Training <ChevronRight size={15}/>
            </Link>
            <Link href="/games" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"13px 24px",borderRadius:14,background:"white",color:"#374151",fontWeight:600,fontSize:14,textDecoration:"none",border:"0.5px solid rgba(0,0,0,0.1)",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              Explore Games <ArrowRight size={14}/>
            </Link>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex"}}>
              {["#4F6EF7","#9C6BE8","#7C9E87","#C4785A","#4DB6AC"].map((c,i)=>(
                <div key={i} style={{width:28,height:28,borderRadius:"50%",border:"2px solid white",background:c,marginLeft:i>0?-8:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",position:"relative",zIndex:5-i}}>
                  {String.fromCharCode(65+i)}
                </div>
              ))}
            </div>
            <div>
              <div style={{display:"flex",gap:1,marginBottom:2}}>
                {[1,2,3,4,5].map(i=><Star key={i} size={11} fill="#F59E0B" color="#F59E0B"/>)}
              </div>
              <p style={{fontSize:12,color:"#94A3B8"}}>Loved by 12,400+ daily players</p>
            </div>
          </div>
        </motion.div>

        {/* Right — Device frame */}
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.6,delay:0.15}} style={{display:"flex",justifyContent:"center"}}>
          <div style={{position:"relative"}}>
            <div style={{background:"linear-gradient(145deg,#E8E4DE,#CEC9C1)",borderRadius:28,padding:10,boxShadow:"0 32px 64px rgba(0,0,0,0.15),0 8px 24px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.5)"}}>
              <div style={{background:"#FDFCFB",borderRadius:20,overflow:"hidden",minWidth:320}}>
                {/* Status bar */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",background:"rgba(255,255,255,0.8)",borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}>
                  <span style={{fontSize:10,fontWeight:600,color:"#94A3B8",fontFamily:"monospace"}}>9:41</span>
                  <div style={{display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#E2E8F0"}}/>)}</div>
                </div>
                {/* Demo content */}
                <div style={{padding:"16px 18px 18px"}}>
                  <TangoDemo/>
                </div>
                {/* Footer */}
                <div style={{padding:"0 18px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#CBD5E1"}}>No account needed</span>
                  <Link href="/games/tango" style={{fontSize:11,fontWeight:600,color:"#4F6EF7",display:"flex",alignItems:"center",gap:4,textDecoration:"none"}}>
                    Full game <ArrowRight size={11}/>
                  </Link>
                </div>
              </div>
            </div>
            {/* Glow shadow */}
            <div style={{position:"absolute",bottom:-10,left:"15%",right:"15%",height:16,background:"rgba(79,110,247,0.18)",filter:"blur(14px)",borderRadius:"50%"}}/>
          </div>
        </motion.div>
      </section>

      {/* GAMES COLLECTION */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"0 40px 64px"}}>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{marginBottom:28}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:"#94A3B8",marginBottom:8}}>The Collection</p>
          <h2 style={{fontSize:38,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",marginBottom:8,lineHeight:1.1}}>
            Twenty Games.<br/>
            <em style={{fontStyle:"italic",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>One Subscription.</em>
          </h2>
          <p style={{fontSize:14,color:"#64748B",lineHeight:1.7,maxWidth:500}}>
            Every game includes a free Daily Challenge. Subscribe to unlock all 100 stages, Infinite Mode, and family leaderboards.
          </p>
        </motion.div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14}}>
          {GAMES.map((game,i)=>(
            <motion.div key={game.slug} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.03}}>
              <Link href={["tango","memory","queens"].includes(game.slug)?`/games/${game.slug}`:"/pricing"} style={{display:"block",textDecoration:"none"}}>
                <div style={{background:"white",borderRadius:16,border:"0.5px solid rgba(0,0,0,0.07)",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"all 0.2s",cursor:"pointer"}}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="translateY(-3px)";el.style.boxShadow="0 10px 28px rgba(0,0,0,0.09)";}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="translateY(0)";el.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)";}}>
                  <div style={{height:70,background:`rgba(79,110,247,0.07)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    <GameIcon slug={game.slug} size={34}/>
                    <span style={{position:"absolute",top:7,right:7,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:8,
                      background:game.free?"rgba(79,110,247,0.1)":"rgba(0,0,0,0.05)",
                      color:game.free?"#4F6EF7":"#94A3B8"}}>
                      {game.free?"Free":"Pro"}
                    </span>
                  </div>
                  <div style={{padding:"10px 12px 12px"}}>
                    <p style={{fontSize:12,fontWeight:700,color:"#1C1917",marginBottom:3}}>{game.name}</p>
                    <p style={{fontSize:10,color:"#64748B",lineHeight:1.5}}>{game.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
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
                <div style={{width:40,height:40,borderRadius:"22.5%",background:`linear-gradient(135deg,${s.from},${s.to})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",fontFamily:"Georgia,serif",marginBottom:14,boxShadow:`0 4px 12px ${s.from}40`}}>
                  {s.num}
                </div>
                <p style={{fontSize:15,fontWeight:700,color:"#1C1917",marginBottom:8}}>{s.title}</p>
                <p style={{fontSize:13,color:"#64748B",lineHeight:1.65}}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{maxWidth:900,margin:"0 auto",padding:"72px 40px"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <h2 style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:34,color:"#1C1917",marginBottom:8}}>Simple, Honest Pricing</h2>
          <p style={{fontSize:14,color:"#94A3B8"}}>Less than a coffee. Sharper than ever.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18,alignItems:"start"}}>
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
              <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,color:plan.highlight?"rgba(255,255,255,0.65)":"#94A3B8"}}>
                {plan.name}
              </p>
              <div style={{display:"flex",alignItems:"flex-end",gap:4,marginBottom:20}}>
                <span style={{fontSize:48,fontWeight:700,lineHeight:1,fontFamily:"Georgia,serif"}}>{plan.price}</span>
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
                border:plan.highlight?"none":"1.5px solid rgba(0,0,0,0.12)",
                boxShadow:plan.highlight?"0 4px 12px rgba(0,0,0,0.12)":"none"}}>
                Start Free Trial
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"0.5px solid rgba(0,0,0,0.06)",background:"rgba(255,255,255,0.7)",padding:"28px 40px"}}>
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
