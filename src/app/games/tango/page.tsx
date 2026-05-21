"use client";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import { StageMap } from "@/components/ui/StageMap";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";

import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, RotateCcw, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import {
  generateTangoBoard, validateBoard, buildSeed,
  type Cell, type TangoBoard, type CellStatus,
} from "@/lib/games/tangoGenerator";
import {
  createXPState, calculateXP, finalizeXP, formatElapsed,
  type XPState, type Difficulty,
} from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { SunIcon, MoonIcon } from "@/components/icons/GameIcons";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { UndoButton } from "@/components/ui/UndoButton";
import { HintButton } from "@/components/ui/HintButton";
import { ShowSolution } from "@/components/ui/ShowSolution";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import { useBoardWidth } from "@/hooks/useScreenWidth";
import { GamePageSchema } from "@/components/seo/GamePageSchema";

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
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
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"monospace", minWidth:36 }}>
        {snap.currentXP}
      </span>
      <span style={{ fontSize:11, color:"var(--text4)" }}>XP</span>
    </div>
  );
}

function TangoGameInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => getLastStage("tango"));
  const [board, setBoard] = useState<TangoBoard | null>(null);
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [history, setHistory] = useState<typeof playerGrid[]>([]);
  const [squish, setSquish] = useState<string|null>(null);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());
  const [errorCols, setErrorCols] = useState<Set<number>>(new Set());
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  // ShowSolution state
  const [solutionRevealed, setSolutionRevealed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const maxW = useBoardWidth(48, 560);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
    }}
  );

  const loadStage = useCallback((s: number) => {
    saveGameState("tango", {stage, savedAt: Date.now()});
    const diff = getDifficulty(s);
    const seed = buildSeed("tango", diff, s);
    const b = generateTangoBoard(seed, diff);
    const xp = createXPState(diff);
    setBoard(b);
    setPlayerGrid(b.puzzle.map(r=>[...r]));
    setXpState(xp);
    setCompleted(false);
    setFinalXP(0);
    setElapsed("00:00");
    setHintsUsed(0);
    setHistory([]);
    setErrorRows(new Set());
    setErrorCols(new Set());
    setErrorCells(new Set());
    setSolutionRevealed(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if(timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  // ── Show Solution handler ─────────────────────────────────────────────────
  function handleRevealSolution() {
    if (!board || !xpState) return;
    // Fill complete solution into playerGrid
    setPlayerGrid(board.solution.map(r => [...r]));
    // Set XP to 1
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    setSolutionRevealed(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function checkRowColErrors(grid: Cell[][], size: number) {
    const newErrorRows = new Set<number>();
    const newErrorCols = new Set<number>();
    const newErrorCells = new Set<string>();
    for (let r = 0; r < size; r++) {
      const row = grid[r];
      if (!row.every(c => c !== null)) continue;
      const suns = row.filter(c => c === "S").length;
      const moons = row.filter(c => c === "M").length;
      for (let c = 0; c <= size - 3; c++) {
        if (row[c] !== null && row[c] === row[c+1] && row[c] === row[c+2]) {
          newErrorCells.add(`${r},${c}`); newErrorCells.add(`${r},${c+1}`); newErrorCells.add(`${r},${c+2}`);
          playError();
        }
      }
      if (suns !== size/2 || moons !== size/2) newErrorRows.add(r);
    }
    for (let c = 0; c < size; c++) {
      const col = grid.map(r => r[c]);
      if (!col.every(v => v !== null)) continue;
      const suns = col.filter(v => v === "S").length;
      const moons = col.filter(v => v === "M").length;
      for (let r = 0; r <= size - 3; r++) {
        if (col[r] !== null && col[r] === col[r+1] && col[r] === col[r+2]) {
          newErrorCells.add(`${r},${c}`); newErrorCells.add(`${r+1},${c}`); newErrorCells.add(`${r+2},${c}`);
          playError();
        }
      }
      if (suns !== size/2 || moons !== size/2) newErrorCols.add(c);
    }
    setErrorRows(newErrorRows); setErrorCols(newErrorCols); setErrorCells(newErrorCells);
    if (newErrorCells.size > 0) setTimeout(() => { setErrorCells(new Set()); }, 3000);
  }

  function handleCellClick(r: number, c: number) {
    if (!board || completed || solutionRevealed) return;
    const given = board.puzzle[r][c];
    if (given !== null) return;
    const cur = playerGrid[r][c];
    const next: Cell = cur===null?"S":cur==="S"?"M":null;
    const key = `${r}-${c}`;
    setSquish(key); setTimeout(()=>setSquish(null), 340);
    setHistory(h => [...h.slice(-19), playerGrid.map(r=>[...r])]);
    const ng = playerGrid.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?next:cell));
    setPlayerGrid(ng);
    checkRowColErrors(ng, board.size);
    playClick();
    const ns = validateBoard(board.puzzle, ng, board.solution);
    const done = ns.every(row=>row.every(s=>s==="correct"||s==="given"));
    if (done && xpState) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned); setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(()=>triggerConfetti(), 80);
      markStageCompleted("tango", stage);
      if (user) saveScore({ user_id:user.id, game_slug:"tango", stage_number:stage, difficulty:getDifficulty(stage), xp_earned:earned, time_taken:Math.floor((Date.now()-xpState.startTime)/1000) });
    }
  }

  function handleUndo() {
    if (history.length === 0) return;
    setPlayerGrid(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
    setErrorRows(new Set()); setErrorCols(new Set()); setErrorCells(new Set());
  }

  function handleHint() {
    if (!board || !xpState || completed || hintsUsed >= 3 || solutionRevealed) return;
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        if (playerGrid[r][c] === null) {
          const ng = playerGrid.map(row => [...row]);
          ng[r][c] = board.solution[r][c];
          setPlayerGrid(ng);
          setHintsUsed(h => h + 1);
          setXpState(prev => prev ? {...prev, hintsUsed: Math.min((prev.hintsUsed||0) + 1, prev.maxHints)} : prev);
          playError();
          return;
        }
      }
    }
  }

  if (!board || !xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--text4)", fontSize:13 }}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const cellSize = Math.floor((maxW - (board.size-1)*10) / board.size);
  const currentXP = calculateXP(xpState).currentXP;

  const cm = new Map<string,"same"|"diff">();
  board.constraints.forEach(c=>cm.set(`${c.row1}-${c.col1}-${c.row2}-${c.col2}`,c.type));

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <Navbar/>
      <GamePageSchema slug="tango" />
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:20 }}>

        <div style={{ width:"100%", maxWidth:580, background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, overflow:"hidden", flexShrink:1 }}>
              <Link href="/games" style={{ color:"var(--text4)", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
                <ArrowLeft size={14}/> Games
              </Link>
              <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>Tango</span>
              <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
              <span style={{ fontSize:11, color:"var(--text4)" }}>Stage</span>
              <span style={{ fontSize:20, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:`${diffColor}15`, color:diffColor }}>
                {diff.toUpperCase()} · {board.size}×{board.size}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              <span style={{ fontSize:12, color:"var(--text4)", fontFamily:"monospace" }}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", color:"var(--text4)", display:"flex" }}>
                <RotateCcw size={13}/>
              </button>
              <button onClick={()=>setShowMap(true)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex",fontSize:11,fontWeight:600,gap:3,alignItems:"center"}}>
                ⊞ Map
              </button>
              <button onClick={()=>{ const url=`${window.location.origin}/play/tango?seed=${board.seed}`; navigator.clipboard.writeText(url); }}
                style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", color:"var(--text4)", display:"flex" }}>
                <Share2 size={13}/>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Solution revealed banner */}
        {solutionRevealed && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            style={{ padding:"8px 20px", borderRadius:12, background:"rgba(239,68,68,0.08)", border:"0.5px solid rgba(239,68,68,0.2)", fontSize:13, fontWeight:600, color:"#EF4444" }}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        <div style={{ display:"flex", gap:16, fontSize:11, color:"var(--text4)" }}>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><SunIcon size={13}/> Sun</span>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><MoonIcon size={13}/> Moon</span>
          <span>· Equal per row & col · No 3 in a row</span>
        </div>

        {/* Board */}
        <div style={{ width:"100%", maxWidth:maxW, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${board.size},${cellSize}px)`, gap:10 }}>
            {board.puzzle.map((_,r)=>board.puzzle[r].map((_,c)=>{
              const given = board.puzzle[r][c];
              const isGiven = given !== null;
              const value = playerGrid[r][c];
              const key = `${r}-${c}`;
              const hasError = errorRows.has(r) || errorCols.has(c);
              const isSolution = solutionRevealed && !isGiven;
              const rightC = cm.get(`${r}-${c}-${r}-${c+1}`);
              const bottomC = cm.get(`${r}-${c}-${r+1}-${c}`);
              return (
                <div key={key} style={{ position:"relative", width:cellSize, height:cellSize }}>
                  <motion.button
                    onClick={()=>handleCellClick(r,c)}
                    whileTap={!isGiven&&!solutionRevealed?{scale:0.88}:{}}
                    animate={squish===key?{scaleX:[1,0.86,1.08,1],scaleY:[1,1.1,0.94,1]}:{}}
                    transition={{ duration:0.32 }}
                    style={{
                      width:"100%", height:"100%",
                      borderRadius: Math.round(cellSize*0.22),
                      display:"flex", alignItems:"center", justifyContent:"center",
                      border:"1.5px solid",
                      background: isSolution ? "rgba(239,68,68,0.06)"
                        : isGiven ? "#F8F7F5"
                        : hasError ? "rgba(239,68,68,0.08)"
                        : "white",
                      borderColor: isSolution ? "rgba(239,68,68,0.3)"
                        : isGiven ? "#EDE9E4"
                        : value ? "#DDD6F8" : "#EDE9E4",
                      cursor: isGiven || solutionRevealed ? "default" : "pointer",
                      outline:"none",
                    }}>
                    {value==="S" && <SunIcon size={Math.round(cellSize*0.48)}/>}
                    {value==="M" && <MoonIcon size={Math.round(cellSize*0.48)}/>}
                    {!value && <div style={{ width:Math.round(cellSize*0.14), height:Math.round(cellSize*0.14), borderRadius:"50%", background:isGiven?"#CCC7BE":"#E8E4DE" }}/>}
                  </motion.button>
                  {rightC && c < board.size-1 && (
                    <div style={{ position:"absolute", right:-10, top:"50%", transform:"translateY(-50%)", zIndex:10, width:20, height:20, borderRadius:"50%", background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, border:`1.5px solid ${rightC==="same"?"#4F6EF7":"#F87171"}`, color:rightC==="same"?"#4F6EF7":"#F87171", boxShadow:"0 2px 6px rgba(0,0,0,0.1)" }}>
                      {rightC==="same"?"=":"×"}
                    </div>
                  )}
                  {bottomC && r < board.size-1 && (
                    <div style={{ position:"absolute", bottom:-10, left:"50%", transform:"translateX(-50%)", zIndex:10, width:20, height:20, borderRadius:"50%", background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, border:`1.5px solid ${bottomC==="same"?"#4F6EF7":"#F87171"}`, color:bottomC==="same"?"#4F6EF7":"#F87171", boxShadow:"0 2px 6px rgba(0,0,0,0.1)" }}>
                      {bottomC==="same"?"=":"×"}
                    </div>
                  )}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Controls */}
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <UndoButton onUndo={handleUndo} canUndo={history.length > 0} disabled={completed || solutionRevealed}/>
          <HintButton
            hintsLeft={3-hintsUsed}
            xpCost={100}
            onUseHint={handleHint}
            disabled={completed || solutionRevealed}/>
          <ShowSolution
            onReveal={handleRevealSolution}
            currentXP={currentXP}
            disabled={completed || solutionRevealed}/>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:stage>1?"pointer":"not-allowed", fontSize:12, color:"var(--text3)", opacity:stage===1?0.4:1 }}>← Prev</button>
          <span style={{ fontSize:12, color:"var(--text4)" }}>Stage {stage} of 100</span>
          <button onClick={()=>setStage(s=>s+1)}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", fontSize:12, color:"var(--text2)", fontWeight:600 }}>
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </main>

      <OutOfTokensModal gameName="Tango" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showMap&&<StageMap gameSlug="tango" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={getDifficulty(stage)}
        xpEarned={finalXP}
        elapsed={elapsed}
        onRetry={()=>loadStage(stage)}
        onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{
          const text=`MindState · Tango Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.app"}).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");
        }}/>
    </div>
  );
}

export default function TangoGame() {
  return (
    <ErrorBoundary game="tango">
      <TangoGameInner/>
    </ErrorBoundary>
  );
}