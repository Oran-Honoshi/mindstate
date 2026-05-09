"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import {
  createXPState, calculateXP, finalizeXP,
  formatElapsed, type XPState, type Difficulty,
} from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { consumeToken, getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";
import { TokenHUD } from "@/components/ui/TokenGate";

function getDifficulty(stage: number): Difficulty {
  if (stage <= 300) return "easy";
  if (stage <= 700) return "medium";
  return "hard";
}

function shareResult(stage: number, xp: number, elapsed: string) {
  const text = `🧠 MindState · Zip Stage ${stage} · ${xp} XP · ${elapsed}`;
  const url = "https://mindstate.vercel.app";
  if (navigator.share) {
    navigator.share({ title: "MindState", text, url }).catch(() => {});
  } else {
    const tweet = encodeURIComponent(text + " " + url);
    window.open("https://twitter.com/intent/tweet?text=" + tweet, "_blank");
  }
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedToNumber(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type Pos = [number, number];

interface ZipBoard {
  size: number;
  path: Pos[];
  waypoints: Map<string, number>;
  seed: string;
}

function generateZipBoard(seed: string, difficulty: Difficulty): ZipBoard {
  const size = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const rng = mulberry32(seedToNumber(seed));
  const dirs: Pos[] = [[0,1],[0,-1],[1,0],[-1,0]];

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length-1; i > 0; i--) {
      const j = Math.floor(rng() * (i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Generate Hamiltonian path via backtracking
  function findPath(): Pos[] | null {
    const startR = Math.floor(rng() * size);
    const startC = Math.floor(rng() * size);
    const visited = Array.from({length: size}, () => Array(size).fill(false));
    const path: Pos[] = [];

    function bt(r: number, c: number): boolean {
      if (r < 0 || r >= size || c < 0 || c >= size || visited[r][c]) return false;
      visited[r][c] = true;
      path.push([r, c]);
      if (path.length === size * size) return true;
      for (const [dr, dc] of shuffle(dirs)) {
        if (bt(r+dr, c+dc)) return true;
      }
      path.pop();
      visited[r][c] = false;
      return false;
    }

    return bt(startR, startC) ? path : null;
  }

  let path: Pos[] | null = null;
  let attempts = 0;
  while (!path && attempts < 50) { path = findPath(); attempts++; }
  if (!path) {
    // Fallback: simple snake path
    path = [];
    for (let r = 0; r < size; r++) {
      const cols = r % 2 === 0
        ? Array.from({length: size}, (_, c) => c)
        : Array.from({length: size}, (_, c) => size-1-c);
      for (const c of cols) path.push([r, c]);
    }
  }

  // Place waypoints at intervals
  const numWaypoints = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const interval = Math.floor(path.length / (numWaypoints - 1));
  const waypointIndices = [0];
  for (let i = 1; i < numWaypoints - 1; i++) waypointIndices.push(i * interval);
  waypointIndices.push(path.length - 1);

  const waypoints = new Map<string, number>();
  waypointIndices.forEach((idx, i) => {
    waypoints.set(`${path![idx][0]},${path![idx][1]}`, i + 1);
  });

  return { size, path, waypoints, seed };
}

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => {
    const iv = setInterval(() => setSnap(calculateXP(xpState)), 500);
    return () => clearInterval(iv);
  }, [xpState]);
  const pct = snap.percentRemaining;
  const color = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,height:4,background:"#F1EDE8",borderRadius:2,overflow:"hidden"}}>
        <motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}}
          style={{height:"100%",background:color,borderRadius:2}}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span>
      <span style={{fontSize:11,color:"#94A3B8"}}>XP</span>
    </div>
  );
}

export default function ZipGame() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(1);
  const [board, setBoard] = useState<ZipBoard | null>(null);
  const [userPath, setUserPath] = useState<Pos[]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage = useCallback((s: number) => {
    const diff = getDifficulty(s);
    const seed = `zip-${diff}-${s}`;
    const b = generateZipBoard(seed, diff);
    const xp = createXPState(diff);
    const startPos = b.path[0];
    setBoard(b);
    setUserPath([startPos]);
    setXpState(xp);
    setCompleted(false); setFinalXP(0); setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleCellClick(r: number, c: number) {
    if (!board || completed) return;
    const key = `${r},${c}`;
    const pathSet = new Set(userPath.map(([pr,pc]) => `${pr},${pc}`));
    const last = userPath[userPath.length - 1];

    // If clicking second-to-last — undo
    if (userPath.length >= 2) {
      const prev = userPath[userPath.length - 2];
      if (prev[0] === r && prev[1] === c) {
        setUserPath(p => p.slice(0, -1));
        return;
      }
    }

    if (pathSet.has(key)) return;
    if (Math.abs(last[0]-r) + Math.abs(last[1]-c) !== 1) return;

    // Check waypoint order — must visit in sequence
    const wp = board.waypoints.get(key);
    if (wp !== undefined) {
      const lastWp = Array.from(board.waypoints.entries())
        .filter(([k]) => pathSet.has(k))
        .map(([,v]) => v);
      const maxWp = lastWp.length > 0 ? Math.max(...lastWp) : 0;
      if (wp !== maxWp + 1) { playError(); return; }
    }

    const newPath: Pos[] = [...userPath, [r, c]];
    setUserPath(newPath);
    playClick();

    // Win: all cells visited and last waypoint reached
    if (newPath.length === board.size * board.size && xpState) {
      const maxWp = Math.max(...Array.from(board.waypoints.values()));
      const visitedWps = new Set(newPath.map(([pr,pc]) => board.waypoints.get(`${pr},${pc}`)).filter(Boolean));
      if (visitedWps.has(maxWp)) {
        const earned = finalizeXP(xpState);
        setFinalXP(earned); setCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
        playSuccess(); setTimeout(() => triggerConfetti(), 80);
        if (user) saveScore({
          user_id: user.id, game_slug: "zip", stage_number: stage,
          difficulty: getDifficulty(stage), xp_earned: earned,
          time_taken: Math.floor((Date.now()-xpState.startTime)/1000),
        });
        const k = `mindstate-stages-${user?.id??"guest"}`;
        if (typeof window !== "undefined") localStorage.setItem(k, String((parseInt(localStorage.getItem(k)??"0"))+1));
      }
    }
  }

  if (!board || !xpState) return (
    <div style={{minHeight:"100vh",background:"#FDFCFB",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#94A3B8",fontSize:13}}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const pathSet = new Set(userPath.map(([r,c]) => `${r},${c}`));
  const last = userPath[userPath.length-1];
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth-48, 480) : 400;
  const gap = 8;
  const cellSize = Math.floor((maxW - (board.size-1)*gap) / board.size);
  const totalCells = board.size * board.size;

  return (
    <div style={{minHeight:"100vh",background:"#FDFCFB",display:"flex",flexDirection:"column"}}>
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>

        {/* Stage header */}
        <div style={{width:"100%",maxWidth:540,background:"white",borderRadius:20,border:"0.5px solid rgba(0,0,0,0.07)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"#94A3B8",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}>
                <ArrowLeft size={14}/> Games
              </Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:11,color:"#94A3B8"}}>Stage</span>
              <span style={{fontSize:20,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>
                {diff.toUpperCase()} · {board.size}×{board.size}
              </span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"#94A3B8",fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid #E2E8F0",background:"white",cursor:"pointer",color:"#94A3B8",display:"flex"}}>
                <RotateCcw size={13}/>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Progress */}
        <div style={{fontSize:12,color:"#94A3B8"}}>
          {userPath.length} / {totalCells} cells · connect all waypoints in order
        </div>

        {/* Board */}
        <div style={{position:"relative"}}>
          {/* SVG path lines */}
          <svg
            style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1}}
            width={board.size*(cellSize+gap)-gap}
            height={board.size*(cellSize+gap)-gap}>
            {userPath.slice(1).map(([r,c],i) => {
              const [pr,pc] = userPath[i];
              const step = cellSize+gap;
              const cx = cellSize/2;
              return (
                <line key={i}
                  x1={pc*step+cx} y1={pr*step+cx}
                  x2={c*step+cx} y2={r*step+cx}
                  stroke="#4F6EF7" strokeWidth="3"
                  strokeLinecap="round" opacity="0.5"/>
              );
            })}
          </svg>

          {/* Grid */}
          <div style={{
            display:"grid",
            gridTemplateColumns:`repeat(${board.size},${cellSize}px)`,
            gap,position:"relative",zIndex:2,
          }}>
            {Array.from({length:board.size},(_,r)=>Array.from({length:board.size},(_,c)=>{
              const key = `${r},${c}`;
              const inPath = pathSet.has(key);
              const isLast = last[0]===r && last[1]===c;
              const isStart = userPath[0][0]===r && userPath[0][1]===c;
              const wp = board.waypoints.get(key);
              const pathIdx = userPath.findIndex(([pr,pc])=>pr===r&&pc===c);
              const isVisitedWp = wp !== undefined && pathIdx !== -1;

              return (
                <motion.button key={key}
                  onClick={()=>handleCellClick(r,c)}
                  whileTap={{scale:0.9}}
                  style={{
                    width:cellSize, height:cellSize,
                    borderRadius:Math.round(cellSize*0.22),
                    display:"flex", alignItems:"center", justifyContent:"center",
                    border:"1.5px solid",
                    background: isLast ? "#EEF2FF"
                      : isVisitedWp ? "#F0FDF4"
                      : inPath ? "#F5F7FF"
                      : "white",
                    borderColor: isLast ? "#4F6EF7"
                      : isVisitedWp ? "#86EFAC"
                      : inPath ? "#C7D2FE"
                      : "#E2E8F0",
                    boxShadow: wp !== undefined ? "0 4px 12px rgba(79,110,247,0.15)" : "0 2px 6px rgba(0,0,0,0.04)",
                    cursor: "pointer", outline:"none",
                    fontSize: Math.round(cellSize*0.32),
                    fontWeight:700,
                    color: isLast ? "#4F6EF7" : isVisitedWp ? "#16A34A" : wp ? "#4F6EF7" : "#94A3B8",
                    transition:"background 0.15s, border-color 0.15s",
                  }}>
                  {wp ?? ""}
                </motion.button>
              );
            }))}
          </div>
        </div>

        {/* Legend */}
        <div style={{display:"flex",gap:16,fontSize:11,color:"#94A3B8"}}>
          <span>Numbered cells = waypoints</span>
          <span>·</span>
          <span>Visit in order 1→{board.waypoints.size}</span>
          <span>·</span>
          <button onClick={()=>{ const start=board.path[0]; setUserPath([start]); }}
            style={{color:"#4F6EF7",background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600}}>
            Reset path
          </button>
        </div>

        {/* Stage nav */}
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid #E2E8F0",background:"white",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"#64748B",opacity:stage===1?0.4:1}}>
            ← Prev
          </button>
          <span style={{fontSize:12,color:"#94A3B8"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)}
            style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid #E2E8F0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600}}>
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </main>

      <AnimatePresence>
        {completed&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{background:"white",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <CheckCircle size={48} color="#22C55E" style={{margin:"0 auto 16px"}}/>
              <h2 style={{fontSize:26,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",marginBottom:4}}>Stage {stage} Complete</h2>
              <p style={{fontSize:13,color:"#94A3B8",marginBottom:24}}>{elapsed} · {diff}</p>
              <div style={{background:"#F8F7F5",borderRadius:16,padding:20,marginBottom:20}}>
                <p style={{fontSize:11,color:"#94A3B8",fontWeight:600,marginBottom:4}}>XP EARNED</p>
                <p style={{fontSize:48,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p>
              </div>
              <button onClick={()=>shareResult(stage,finalXP,elapsed)}
                style={{width:"100%",marginBottom:12,padding:"11px",borderRadius:14,border:"0.5px solid #E2E8F0",background:"white",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <Share2 size={14}/> Share Result
              </button>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid #E2E8F0",background:"white",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer"}}>Retry</button>
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
