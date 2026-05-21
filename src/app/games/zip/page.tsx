"use client";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";

import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
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
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { HintButton } from "@/components/ui/HintButton";
import { GameInstructions } from "@/components/ui/GameInstructions";

import { GamePageSchema } from "@/components/seo/GamePageSchema";

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  // Pseudo-random mix: 20% easy, 50% medium, 30% hard
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
}

function shareResult(stage: number, xp: number, elapsed: string) {
  const text = ` MindState · Zip Stage ${stage} · ${xp} XP · ${elapsed}`;
  const url = "https://mindstate.vercel.app";
  if (navigator.share) navigator.share({ title: "MindState", text, url }).catch(() => {});
  else window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text + " " + url), "_blank");
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedToNum(s: string): number {
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
  const rng = mulberry32(seedToNum(seed));
  const dirs: Pos[] = [[0,1],[0,-1],[1,0],[-1,0]];

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function findPath(): Pos[] | null {
    const startR = Math.floor(rng() * size);
    const startC = Math.floor(rng() * size);
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const path: Pos[] = [];

    function bt(r: number, c: number): boolean {
      if (r < 0 || r >= size || c < 0 || c >= size || visited[r][c]) return false;
      visited[r][c] = true;
      path.push([r, c]);
      if (path.length === size * size) return true;
      for (const [dr, dc] of shuffle(dirs)) {
        if (bt(r + dr, c + dc)) return true;
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
    path = [];
    for (let r = 0; r < size; r++) {
      const cols = r % 2 === 0
        ? Array.from({ length: size }, (_, c) => c)
        : Array.from({ length: size }, (_, c) => size - 1 - c);
      for (const c of cols) path.push([r, c]);
    }
  }

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
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:4, background:"var(--bg3)", borderRadius:2, overflow:"hidden" }}>
        <motion.div animate={{ width:`${pct*100}%` }} transition={{ duration:0.5 }}
          style={{ height:"100%", background:color, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"monospace", minWidth:36 }}>{snap.currentXP}</span>
      <span style={{ fontSize:11, color:"var(--text4)" }}>XP</span>
    </div>
  );
}

function ZipGameInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => getLastStage("zip"));
  const [board, setBoard] = useState<ZipBoard | null>(null);
  const [userPath, setUserPath] = useState<Pos[]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  // Freeze game when user leaves the app
  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
    }}
  );

  const boardRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const cellSizeRef = useRef(0);

  const loadStage = useCallback((s: number) => {
    saveGameState("zip", {stage, savedAt: Date.now()});
    const diff = getDifficulty(s);
    const b = generateZipBoard(`zip-${diff}-${s}`, diff);
    const xp = createXPState(diff);
    const startPos = b.path[0];
    setBoard(b);
    setUserPath([startPos]);
    setXpState(xp);
    setCompleted(false); setFinalXP(0); setHintsUsed(0); setShowFeedback(false); setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
    if(user){
      const ok=consumeToken(user.id);
      if(!ok){setShowTokenModal(true);return;}
    }
  }, [user]);

  useEffect(() => {
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function tryAddCell(r: number, c: number, currentPath: Pos[]): Pos[] | null {
    if (!board) return null;
    const key = `${r},${c}`;
    const pathSet = new Set(currentPath.map(([pr, pc]) => `${pr},${pc}`));
    const last = currentPath[currentPath.length - 1];

    // Undo — tapping second to last
    if (currentPath.length >= 2) {
      const prev = currentPath[currentPath.length - 2];
      if (prev[0] === r && prev[1] === c) return currentPath.slice(0, -1);
    }

    if (pathSet.has(key)) return null;
    if (Math.abs(last[0] - r) + Math.abs(last[1] - c) !== 1) return null;

    // Check waypoint order
    const wp = board.waypoints.get(key);
    if (wp !== undefined) {
      const visitedWps = [...board.waypoints.entries()]
        .filter(([k]) => pathSet.has(k))
        .map(([, v]) => v);
      const maxWp = visitedWps.length > 0 ? Math.max(...visitedWps) : 0;
      if (wp !== maxWp + 1) return null;
    }

    return [...currentPath, [r, c]];
  }

  function checkComplete(path: Pos[], b: ZipBoard): boolean {
    if (path.length !== b.size * b.size) return false;
    const maxWp = Math.max(...Array.from(b.waypoints.values()));
    const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));
    return b.waypoints.get(`${path[path.length-1][0]},${path[path.length-1][1]}`) === maxWp &&
      [...b.waypoints.entries()].every(([k]) => pathSet.has(k));
  }

  function handleCellInteraction(r: number, c: number) {
    if (!board || completed) return;
    setUserPath(prev => {
      const newPath = tryAddCell(r, c, prev);
      if (!newPath) return prev;
      playClick();
      if (checkComplete(newPath, board) && xpState) {
        const earned = finalizeXP(xpState);
        setFinalXP(earned); setCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
        playSuccess(); setTimeout(() => triggerConfetti(), 80);
          markStageCompleted("zip",stage);
        if (user) saveScore({
          user_id: user.id, game_slug: "zip", stage_number: stage,
          difficulty: getDifficulty(stage), xp_earned: earned,
          time_taken: Math.floor((Date.now() - xpState.startTime) / 1000),
        });
      }
      return newPath;
    });
  }

  // Touch drag support — convert touch position to cell
  function getCellFromTouch(touch: React.Touch | Touch): [number, number] | null {
    if (!boardRef.current || !board) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const cellSize = cellSizeRef.current;
    const gap = 10;
    const step = cellSize + gap;
    const c = Math.floor(x / step);
    const r = Math.floor(y / step);
    if (r < 0 || r >= board.size || c < 0 || c >= board.size) return null;
    // Check we're actually within the cell (not in the gap)
    const cellX = x - c * step;
    const cellY = y - r * step;
    if (cellX > cellSize || cellY > cellSize) return null;
    return [r, c];
  }

  if (!board || !xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--text4)", fontSize:13 }}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const pathSet = new Set(userPath.map(([r, c]) => `${r},${c}`));
  const last = userPath[userPath.length - 1];
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 480) : 400;
  const gap = 10;
  const cellSize = Math.floor((maxW - (board.size - 1) * gap) / board.size);
  cellSizeRef.current = cellSize;
  const totalCells = board.size * board.size;

function handleHint() {
    if (!board || !xpState || completed || hintsUsed >= 3) return;
    // Add the next correct cell to the path
    const nextIdx = userPath.length;
    if (nextIdx < board.path.length) {
      const nextCell = board.path[nextIdx];
      setUserPath(prev => [...prev, nextCell]);
      setHintsUsed(h => h + 1);
      setXpState(prev => prev ? {...prev, hintsUsed: Math.min((prev.hintsUsed||0)+1, prev.maxHints)} : prev);
      playError();
    }
  }

function handleCheck() {
    if (!board || !xpState || completed) return;
    // Show how many cells are on the correct path so far
    let correctCount = 0;
    for (let i = 0; i < userPath.length; i++) {
      if (i < board.path.length &&
          userPath[i][0] === board.path[i][0] &&
          userPath[i][1] === board.path[i][1]) {
        correctCount++;
      } else break;
    }
    setXpState(prev => prev ? {...prev, hintsUsed: Math.min((prev.hintsUsed||0)+1, prev.maxHints)} : prev);
    // Visual: trim path to correct portion + flash
    if (correctCount < userPath.length) {
      setUserPath(userPath.slice(0, correctCount));
    }
    playError();
  }
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <Navbar/>
      <GamePageSchema slug="zip" />
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:18 }}>

        {/* Stage header */}
        <div style={{ width:"100%", maxWidth:540, background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, overflow:"hidden", flexShrink:1 }}>
              <Link href="/games" style={{ color:"var(--text4)", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
                <ArrowLeft size={14}/> Games
              </Link>
              <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
              <span style={{ fontSize:11, color:"var(--text4)" }}>Stage</span>
              <span style={{ fontSize:20, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:`${diffColor}15`, color:diffColor }}>
                {diff.toUpperCase()} · {board.size}×{board.size}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              <span style={{ fontSize:12, color:"var(--text4)", fontFamily:"monospace" }}>{elapsed}</span>
              <button onClick={() => loadStage(stage)} style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", color:"var(--text4)", display:"flex" }}>
                <RotateCcw size={13}/>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Progress */}
        <div style={{ fontSize:12, color:"var(--text4)" }}>
          {userPath.length} / {totalCells} cells · visit waypoints 1→{board.waypoints.size} in order
        </div>

        {/* Board — tap AND drag */}
        <div style={{ position:"relative" }}>
          {/* SVG path lines */}
          <svg
            style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1 }}
            width={board.size * (cellSize + gap) - gap}
            height={board.size * (cellSize + gap) - gap}>
            {userPath.slice(1).map(([r, c], i) => {
              const [pr, pc] = userPath[i];
              const step = cellSize + gap;
              const cx = cellSize / 2;
              return (
                <line key={i}
                  x1={pc * step + cx} y1={pr * step + cx}
                  x2={c * step + cx} y2={r * step + cx}
                  stroke="#4F6EF7" strokeWidth="4"
                  strokeLinecap="round" opacity="0.55"/>
              );
            })}
          </svg>

          {/* Grid — with touch drag support */}
          <div
            ref={boardRef}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${board.size},${cellSize}px)`,
              gap,
              position: "relative",
              zIndex: 2,
              touchAction: "none", // prevent page scroll while dragging on board
            }}
            onTouchStart={e => {
              isDragging.current = true;
              const cell = getCellFromTouch(e.touches[0]);
              if (cell) handleCellInteraction(cell[0], cell[1]);
            }}
            onTouchMove={e => {
              if (!isDragging.current) return;
              const cell = getCellFromTouch(e.touches[0]);
              if (cell) handleCellInteraction(cell[0], cell[1]);
            }}
            onTouchEnd={() => { isDragging.current = false; }}
            onMouseLeave={() => { isDragging.current = false; }}
          >
            {Array.from({ length: board.size }, (_, r) =>
              Array.from({ length: board.size }, (_, c) => {
                const key = `${r},${c}`;
                const inPath = pathSet.has(key);
                const isLast = last[0] === r && last[1] === c;
                const isStart = userPath[0][0] === r && userPath[0][1] === c;
                const wp = board.waypoints.get(key);
                const isVisitedWp = wp !== undefined && pathSet.has(key);

                return (
                  <motion.div
                    key={key}
                    onMouseDown={() => { isDragging.current = true; handleCellInteraction(r, c); }}
                    onMouseEnter={() => { if (isDragging.current) handleCellInteraction(r, c); }}
                    onMouseUp={() => { isDragging.current = false; }}
                    onClick={() => handleCellInteraction(r, c)}
                    style={{
                      width: cellSize, height: cellSize,
                      borderRadius: Math.round(cellSize * 0.22),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1.5px solid",
                      background: isLast ? "#EEF2FF"
                        : isVisitedWp ? "#F0FDF4"
                        : inPath ? "#F5F7FF"
                        : "white",
                      borderColor: isLast ? "#4F6EF7"
                        : isVisitedWp ? "#86EFAC"
                        : inPath ? "#C7D2FE"
                        : "#E2E8F0",
                      boxShadow: wp !== undefined ? "0 4px 12px rgba(79,110,247,0.15)" : "0 2px 6px rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      fontSize: Math.round(cellSize * 0.34),
                      fontWeight: 700,
                      color: isLast ? "#4F6EF7" : isVisitedWp ? "#16A34A" : wp ? "#4F6EF7" : "#94A3B8",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      transition: "background 0.12s, border-color 0.12s",
                    }}>
                    {wp ?? ""}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:16, fontSize:11, color:"var(--text4)" }}>
          <span>Drag or tap to trace</span>
          <span>·</span>
          <span>Numbers = waypoints</span>
          <span>·</span>
          <button onClick={() => board && setUserPath([board.path[0]])}
            style={{ color:"#4F6EF7", background:"none", border:"none", cursor:"pointer", fontSize:11, fontWeight:600 }}>
            Reset path
          </button>
        </div>

        {/* Stage nav */}

        {/* Controls */}
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <HintButton
            hintsLeft={3-hintsUsed}
            xpCost={100}
            onUseHint={()=>{
              if(!xpState||hintsUsed>=3)return;
              setHintsUsed(h=>h+1);
              setXpState(prev => prev ? {...prev, hintsUsed: Math.min(prev.hintsUsed + 1, prev.maxHints)} : prev);
            }}
            disabled={completed}/>
          </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:stage>1?"pointer":"not-allowed", fontSize:12, color:"var(--text3)", opacity:stage===1?0.4:1 }}>
            ← Prev
          </button>
          <span style={{ fontSize:12, color:"var(--text4)" }}>Stage {stage} of 1000</span>
          <button onClick={() => setStage(s=>s+1)}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", fontSize:12, color:"var(--text2)", fontWeight:600 }}>
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </main>

      {showMap&&<StageMap gameSlug="zip" totalStages={1000} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={getDifficulty(stage)}
        xpEarned={finalXP}
        elapsed={elapsed}
        onRetry={()=>loadStage(stage)}
        onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{
          const text=`MindState · Zip Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.vercel.app"}).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");
        }}/>
</div>
  );
}

function CompletionPopup({ open, stage, elapsed, difficulty, finalXP, xpEarned, onRetry, onNext, onShare }: {
  open?: boolean; stage: number; elapsed: string; difficulty: string;
  finalXP?: number; xpEarned?: number; onRetry: () => void; onNext: () => void; onShare?: () => void;
}) {
  const xp = finalXP ?? xpEarned ?? 0;
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",
          backdropFilter:"blur(14px)",display:"flex",alignItems:"center",
          justifyContent:"center",zIndex:200,padding:24}}>
        <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
          transition={{type:"spring",stiffness:380,damping:28}}
          style={{background:"var(--surface)",borderRadius:28,padding:36,
            maxWidth:340,width:"100%",textAlign:"center",
            boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
          <div style={{fontSize:56,marginBottom:12}}>🎉</div>
          <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",
            fontFamily:"Georgia,serif",marginBottom:4}}>Stage {stage} Complete!</h2>
          <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>
            {elapsed} · {difficulty}
          </p>
          <div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}>
            <p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4,
              letterSpacing:"0.1em",textTransform:"uppercase"}}>XP Earned</p>
            <p style={{fontSize:52,fontWeight:700,color:"#4F6EF7",
              fontFamily:"Georgia,serif"}}>{xp}</p>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onRetry}
              style={{flex:1,padding:13,borderRadius:14,
                border:"0.5px solid var(--border2)",background:"var(--surface)",
                fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>
              Retry
            </button>
            <button onClick={onNext}
              style={{flex:2,padding:13,borderRadius:14,border:"none",
                background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                fontSize:13,fontWeight:700,color:"white",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              Next Stage →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ZipGame() {
  return (
    <ErrorBoundary game="zip">
      <ZipGameInner/>
    </ErrorBoundary>
  );
}
