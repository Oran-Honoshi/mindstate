"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { GameInstructions } from "@/components/ui/GameInstructions";
import { generateQueensBoard, type QueensBoard } from "@/lib/games/queensGenerator";
import {
  createXPState, calculateXP, finalizeXP,
  formatElapsed, type XPState, type Difficulty,
} from "@/lib/games/xpEngine";
import { buildSeed } from "@/lib/games/tangoGenerator";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { markDailyCompleted, getDailySeed } from "@/lib/games/dailyChallenge";
import { consumeToken, getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";
import { TokenHUD } from "@/components/ui/TokenGate";

function getDifficulty(stage: number): Difficulty {
  if (stage <= 300) return "easy";
  if (stage <= 700) return "medium";
  return "hard";
}

function shareResult(stage: number, xp: number, elapsed: string) {
  const text = `🧠 MindState · Queens Stage ${stage} · ${xp} XP · ${elapsed}`;
  const url = "https://mindstate.vercel.app";
  if (navigator.share) {
    navigator.share({ title: "MindState", text, url }).catch(() => {});
  } else {
    const tweet = encodeURIComponent(text + " " + url);
    window.open("https://twitter.com/intent/tweet?text=" + tweet, "_blank");
  }
}

// Darker, more saturated region palettes
const REGION_PALETTE = [
  { fill:"#DBEAFE", border:"#1D4ED8", queen:"#1E3A8A" }, // Blue
  { fill:"#FED7AA", border:"#C2410C", queen:"#7C2D12" }, // Orange
  { fill:"#BBF7D0", border:"#15803D", queen:"#14532D" }, // Green
  { fill:"#E9D5FF", border:"#7C3AED", queen:"#4C1D95" }, // Purple
  { fill:"#FECDD3", border:"#BE123C", queen:"#881337" }, // Rose
  { fill:"#FDE68A", border:"#B45309", queen:"#78350F" }, // Amber
  { fill:"#99F6E4", border:"#0F766E", queen:"#134E4A" }, // Teal
  { fill:"#FECACA", border:"#B91C1C", queen:"#7F1D1D" }, // Red
  { fill:"#DDD6FE", border:"#6D28D9", queen:"#3B0764" }, // Violet
  { fill:"#A5F3FC", border:"#0E7490", queen:"#164E63" }, // Cyan
];

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => {
    const iv = setInterval(() => setSnap(calculateXP(xpState)), 500);
    return () => clearInterval(iv);
  }, [xpState]);
  const pct = snap.percentRemaining;
  const color = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:4, background:"var(--bg3)", borderRadius:2, overflow:"hidden" }}>
        <motion.div animate={{ width:`${pct*100}%` }} transition={{ duration:0.5 }}
          style={{ height:"100%", background:color, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"monospace", minWidth:36 }}>
        {snap.currentXP}
      </span>
      <span style={{ fontSize:11, color:"var(--text4)" }}>XP</span>
    </div>
  );
}

// Cell state: 0=empty, 1=X mark, 2=queen
type CellVal = 0 | 1 | 2;

function checkWin(grid: CellVal[][], board: QueensBoard): { won: boolean; errors: Set<string> } {
  const size = board.size;
  const errors = new Set<string>();
  const queens: [number,number][] = [];

  // Collect all placed queens
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 2) queens.push([r, c]);
    }
  }

  if (queens.length !== size) return { won: false, errors };

  // Check: one per row
  const rowCounts = new Array(size).fill(0);
  const colCounts = new Array(size).fill(0);
  const regionCounts = new Array(size).fill(0);

  for (const [r, c] of queens) {
    rowCounts[r]++;
    colCounts[c]++;
    regionCounts[board.regions[r][c]]++;
  }

  for (let i = 0; i < size; i++) {
    if (rowCounts[i] !== 1) queens.filter(([r])=>r===i).forEach(([r,c])=>errors.add(`${r},${c}`));
    if (colCounts[i] !== 1) queens.filter(([,c])=>c===i).forEach(([r,c])=>errors.add(`${r},${c}`));
    if (regionCounts[i] !== 1) queens.filter(([r,c])=>board.regions[r][c]===i).forEach(([r,c])=>errors.add(`${r},${c}`));
  }

  // Check adjacency (no two queens touch diagonally or directly)
  for (let i = 0; i < queens.length; i++) {
    for (let j = i+1; j < queens.length; j++) {
      const [r1,c1] = queens[i], [r2,c2] = queens[j];
      if (Math.abs(r1-r2) <= 1 && Math.abs(c1-c2) <= 1) {
        errors.add(`${r1},${c1}`); errors.add(`${r2},${c2}`);
      }
    }
  }

  return { won: errors.size === 0 && queens.length === size, errors };
}

export default function QueensGame() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(1);
  const [board, setBoard] = useState<QueensBoard | null>(null);
  const [grid, setGrid] = useState<CellVal[][]>([]);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage = useCallback((s: number) => {
    const diff = getDifficulty(s);
    const seed = buildSeed("queens", diff, s);
    const b = generateQueensBoard(seed, diff);
    const xp = createXPState(diff);
    setBoard(b);
    setGrid(Array.from({length:b.size},()=>new Array(b.size).fill(0)));
    setErrors(new Set());
    setXpState(xp); setCompleted(false); setFinalXP(0); setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleCellClick(r: number, c: number) {
    if (completed || !board) return;
    const cur = grid[r][c];
    // Cycle: empty(0) → X(1) → queen(2) → empty(0)
    const next: CellVal = cur === 0 ? 1 : cur === 1 ? 2 : 0;
    const ng = grid.map((row, ri) => row.map((v, ci) => ri===r&&ci===c ? next : v));
    setGrid(ng);
    playClick();

    const { won, errors: errs } = checkWin(ng, board);
    setErrors(errs);
    if (errs.size > 0) playError();

    if (won && xpState) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned); setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
      if (user) saveScore({
        user_id: user.id, game_slug: "queens", stage_number: stage,
        difficulty: getDifficulty(stage), xp_earned: earned,
        time_taken: Math.floor((Date.now()-xpState.startTime)/1000),
      });
      const k = `mindstate-stages-${user?.id??"guest"}`;
      if (typeof window !== "undefined") localStorage.setItem(k, String((parseInt(localStorage.getItem(k)??"0"))+1));
    }
  }

  if (!board || !xpState) return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const queensPlaced = grid.flat().filter(v=>v===2).length;
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth-32, 540) : 480;
  const cellSize = Math.floor(maxW / board.size);

  return (
    <div className="game-page">
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>

        <div style={{width:"100%",maxWidth:600,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}>
                <ArrowLeft size={14}/> Games
              </Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:11,color:"var(--text4)"}}>Stage</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>
                {diff.toUpperCase()} · {board.size}×{board.size}
              </span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"var(--text4)"}}>♛ {queensPlaced}/{board.size}</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}>
                <RotateCcw size={13}/>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{fontSize:12,color:"var(--text4)",textAlign:"center"}}>
          Tap once → ✕ mark · Tap twice → ♛ queen · Tap thrice → clear
          <br/>One queen per row, column & color region. Queens cannot touch.
        </div>

        {/* Board */}
        <div style={{border:"2px solid #374151",borderRadius:16,overflow:"hidden",boxShadow:"0 12px 40px rgba(0,0,0,0.1)"}}>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${cellSize}px)`}}>
            {board.regions.map((row,r)=>row.map((regionId,c)=>{
              const key = `${r},${c}`;
              const val = grid[r]?.[c] ?? 0;
              const isError = errors.has(key);
              const pal = REGION_PALETTE[regionId % REGION_PALETTE.length];
              const rightDiff = c<board.size-1 && board.regions[r][c+1]!==regionId;
              const bottomDiff = r<board.size-1 && board.regions[r+1][c]!==regionId;
              const leftDiff = c>0 && board.regions[r][c-1]!==regionId;
              const topDiff = r>0 && board.regions[r-1][c]!==regionId;
              return (
                <motion.button key={key} onClick={()=>handleCellClick(r,c)}
                  animate={isError&&val===2?{scale:[1,0.9,1.05,1]}:{}}
                  transition={{duration:0.3}}
                  style={{
                    width:cellSize, height:cellSize,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: isError ? "#FEF2F2" : pal.fill,
                    borderTop: topDiff?`3px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.12)",
                    borderLeft: leftDiff?`3px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.12)",
                    borderRight: rightDiff?`3px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.12)",
                    borderBottom: bottomDiff?`3px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.12)",
                    cursor:"pointer", outline:"none",
                    transition:"background 0.15s",
                  }}>
                  {val===1&&(
                    <span style={{fontSize:Math.round(cellSize*0.38),color:isError?"#EF4444":"#64748B",fontWeight:700,lineHeight:1}}>✕</span>
                  )}
                  {val===2&&(
                    <motion.span
                      initial={{scale:0,rotate:-20}}
                      animate={{scale:1,rotate:0}}
                      transition={{type:"spring",stiffness:500,damping:25}}
                      style={{fontSize:Math.round(cellSize*0.5),color:isError?"#EF4444":pal.queen,lineHeight:1,filter:`drop-shadow(0 2px 4px ${pal.border}80)`}}>
                      ♛
                    </motion.span>
                  )}
                </motion.button>
              );
            }))}
          </div>
        </div>

        {/* Region legend */}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",maxWidth:560}}>
          {Array.from({length:board.size},(_,i)=>{
            const pal=REGION_PALETTE[i%REGION_PALETTE.length];
            return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:14,height:14,borderRadius:4,background:pal.fill,border:`2.5px solid ${pal.border}`}}/>
                <span style={{fontSize:10,color:"var(--text3)",fontWeight:500}}>Region {i+1}</span>
              </div>
            );
          })}
        </div>

        {/* Stage nav */}
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>
            ← Prev
          </button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)}
            style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </main>

      <AnimatePresence>
        {completed&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{background:"var(--surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <CheckCircle size={48} color="#22C55E" style={{margin:"0 auto 16px"}}/>
              <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif",marginBottom:4}}>Stage {stage} Complete</h2>
              <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>{elapsed} · {diff}</p>
              <div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}>
                <p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4}}>XP EARNED</p>
                <p style={{fontSize:48,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p>
              </div>
              <button onClick={()=>shareResult(stage,finalXP,elapsed)}
                style={{width:"100%",marginBottom:12,padding:"11px",borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <Share2 size={14}/> Share Result
              </button>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>Retry</button>
                <button onClick={()=>{setCompleted(false);setStage(s=>s+1);}}
                  style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  Next Stage <ChevronRight size={14}/>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
