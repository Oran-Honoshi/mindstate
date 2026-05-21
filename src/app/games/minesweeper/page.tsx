"use client";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronRight, Flag, Bomb } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { createXPState, calculateXP, finalizeXP, formatElapsed, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { HintButton } from "@/components/ui/HintButton";
import { ShowSolution } from "@/components/ui/ShowSolution";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GamePageSchema } from "@/components/seo/GamePageSchema";

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
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

type CellState = "hidden" | "revealed" | "flagged";
interface Cell { isMine: boolean; adjacent: number; state: CellState; }
interface Board { rows: number; cols: number; mines: number; cells: Cell[][]; }

function generateBoard(seed: string, difficulty: Difficulty, safeR: number, safeC: number): Board {
  const configs = { easy:{rows:8,cols:8,mines:10}, medium:{rows:10,cols:10,mines:20}, hard:{rows:12,cols:12,mines:35} };
  const { rows, cols, mines } = configs[difficulty];
  const rng = mulberry32(seedToNumber(seed));
  const positions: number[] = [];
  for (let i = 0; i < rows*cols; i++) {
    const r = Math.floor(i/cols), c = i%cols;
    if (Math.abs(r-safeR)<=1 && Math.abs(c-safeC)<=1) continue;
    positions.push(i);
  }
  for (let i = positions.length-1; i > 0; i--) {
    const j = Math.floor(rng()*(i+1));
    [positions[i],positions[j]] = [positions[j],positions[i]];
  }
  const mineSet = new Set(positions.slice(0, mines));
  const cells: Cell[][] = Array.from({length:rows},(_,r)=>
    Array.from({length:cols},(_,c)=>({ isMine:mineSet.has(r*cols+c), adjacent:0, state:"hidden" as CellState }))
  );
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    if (cells[r][c].isMine) continue;
    cells[r][c].adjacent = dirs.filter(([dr,dc])=>{
      const nr=r+dr,nc=c+dc;
      return nr>=0&&nr<rows&&nc>=0&&nc<cols&&cells[nr][nc].isMine;
    }).length;
  }
  return { rows, cols, mines, cells };
}

function floodReveal(cells: Cell[][], r: number, c: number, rows: number, cols: number) {
  if (r<0||r>=rows||c<0||c>=cols||cells[r][c].state!=="hidden"||cells[r][c].isMine) return;
  cells[r][c] = {...cells[r][c], state:"revealed"};
  if (cells[r][c].adjacent === 0) {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>floodReveal(cells,r+dr,c+dc,rows,cols));
  }
}

const NUM_COLORS: Record<number,string> = {1:"#2563EB",2:"#16A34A",3:"#DC2626",4:"#7C3AED",5:"#C2410C",6:"#0891B2",7:"#1F2937",8:"#6B7280"};

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap,setSnap] = useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;
  const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}>
        <motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span>
      <span style={{fontSize:11,color:"var(--text4)"}}>XP</span>
    </div>
  );
}

function MinesweeperGameInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => getLastStage("minesweeper"));
  const [board, setBoard] = useState<Board|null>(null);
  const [gameOver, setGameOver] = useState<"win"|"lose"|null>(null);
  const [xpState, setXpState] = useState<XPState|null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [finalXP, setFinalXP] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [flagCount, setFlagCount] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !gameOver && !solutionRevealed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
    }}
  );

  const loadStage = useCallback((s: number) => {
    saveGameState("minesweeper", {stage: s, savedAt: Date.now()});
    const diff = getDifficulty(s);
    const xp = createXPState(diff);
    setXpState(xp); setBoard(null); setGameOver(null);
    setElapsed("00:00"); setFinalXP(0); setFirstClick(true); setFlagCount(0);
    setSolutionRevealed(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
    const configs = { easy:{rows:8,cols:8,mines:10}, medium:{rows:10,cols:10,mines:20}, hard:{rows:12,cols:12,mines:35} };
    const {rows,cols} = configs[diff];
    const empty: Cell[][] = Array.from({length:rows},()=>Array.from({length:cols},()=>({isMine:false,adjacent:0,state:"hidden" as CellState})));
    setBoard({rows,cols,mines:configs[diff].mines,cells:empty});
  },[]);

  const resumeChecked = useRef(false);

  useEffect(()=>{
    if(!resumeChecked.current){
      resumeChecked.current=true;
      const saved=loadGameState("minesweeper");
      if(saved&&(saved.stage as number)>1){setResumeData(saved);setShowResume(true);return;}
    }
    loadStage(stage);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[stage,loadStage]);

  // ── Show Solution ──────────────────────────────────────────────────────────
  function handleRevealSolution() {
    if (!board || !xpState) return;
    // Reveal all mine positions by marking them flagged, reveal all safe cells
    const cells = board.cells.map(row => row.map(cell => ({
      ...cell,
      state: cell.isMine ? "flagged" as CellState : "revealed" as CellState,
    })));
    setBoard({...board, cells});
    setSolutionRevealed(true);
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleClick(r: number, c: number) {
    if (!board || !xpState || gameOver || solutionRevealed) return;
    if (board.cells[r][c].state === "flagged") return;
    if (board.cells[r][c].state === "revealed") return;

    let cells = board.cells.map(row => [...row.map(c => ({...c}))]);

    if (firstClick) {
      setFirstClick(false);
      const diff = getDifficulty(stage);
      const newBoard = generateBoard(`minesweeper-${diff}-${stage}`, diff, r, c);
      cells = newBoard.cells;
      floodReveal(cells, r, c, board.rows, board.cols);
      setBoard({...newBoard, cells});
      return;
    }

    if (cells[r][c].isMine) {
      cells = cells.map(row=>row.map(cell=>cell.isMine?{...cell,state:"revealed" as CellState}:cell));
      setBoard({...board,cells});
      setGameOver("lose"); playError();
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    floodReveal(cells, r, c, board.rows, board.cols);
    setBoard({...board,cells});
    saveGameState("minesweeper",{stage,cells,rows:board.rows,cols:board.cols,mines:board.mines,hintsUsed,startTime:xpState?.startTime,savedAt:Date.now()});
    playClick();

    const revealed = cells.flat().filter(c=>c.state==="revealed").length;
    if (revealed === board.rows*board.cols-board.mines && xpState) {
      const earned = finalizeXP(xpState); setFinalXP(earned); setGameOver("win");
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(()=>triggerConfetti(),80);
      markStageCompleted("minesweeper",stage);
      if (user) saveScore({user_id:user.id,game_slug:"minesweeper",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});
    }
  }

  function handleFlag(e: React.MouseEvent, r: number, c: number) {
    e.preventDefault();
    if (!board || gameOver || solutionRevealed) return;
    if (board.cells[r][c].state === "revealed") return;
    const cells = board.cells.map(row=>[...row.map(c=>({...c}))]);
    if (cells[r][c].state === "flagged") { cells[r][c].state="hidden"; setFlagCount(f=>f-1); }
    else { cells[r][c].state="flagged"; setFlagCount(f=>f+1); }
    setBoard({...board,cells});
  }

  function handleHint() {
    if (!board || !xpState || hintsUsed >= 3 || gameOver || solutionRevealed) return;
    const safeCells: [number,number][] = [];
    board.cells.forEach((row,r)=>row.forEach((cell,c)=>{
      if (!cell.isMine && cell.state==="hidden") safeCells.push([r,c]);
    }));
    if (safeCells.length === 0) return;
    const [r,c] = safeCells[Math.floor(Math.random()*safeCells.length)];
    handleClick(r,c);
    setHintsUsed(h=>h+1);
    setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
    playError();
  }

  if (!board||!xpState) return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW = typeof window!=="undefined"?Math.min(window.innerWidth-32,480):440;
  const cellSize = Math.max(Math.floor(maxW/board.cols), 28);
  const minesLeft = board.mines-flagCount;
  const currentXP = calculateXP(xpState).currentXP;

  return(
    <div className="game-page">
      <Navbar/>
      <GamePageSchema slug="minesweeper" />
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>

        <div style={{width:"100%",maxWidth:560,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,overflow:"hidden",flexShrink:1}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:11,color:"var(--text4)"}}>Stage</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"#DC2626"}}><Bomb size={13}/> {minesLeft}</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{fontSize:11,color:"var(--text4)"}}>Left click = reveal · Right click = flag · First click is always safe</div>

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"8px 20px",borderRadius:12,background:"rgba(239,68,68,0.08)",border:"0.5px solid rgba(239,68,68,0.2)",fontSize:13,fontWeight:600,color:"#EF4444"}}>
            Mines flagged · Safe cells revealed · XP set to 1
          </motion.div>
        )}

        <div style={{border:"1.5px solid #E2E8F0",borderRadius:14,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.07)"}}>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${board.cols},${cellSize}px)`}}>
            {board.cells.map((row,r)=>row.map((cell,c)=>{
              const isRevealed = cell.state==="revealed";
              const isFlagged = cell.state==="flagged";
              const isSolFlag = solutionRevealed && isFlagged && cell.isMine;
              return (
                <motion.button key={`${r},${c}`}
                  onClick={()=>handleClick(r,c)}
                  onContextMenu={e=>handleFlag(e,r,c)}
                  style={{
                    width:cellSize, height:cellSize,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:Math.round(cellSize*0.45), fontWeight:700,
                    cursor: isRevealed||solutionRevealed ? "default" : "pointer", outline:"none",
                    background: isRevealed
                      ? (cell.isMine&&gameOver==="lose")?"#FEF2F2":"#F8F7F5"
                      : isSolFlag ? "rgba(239,68,68,0.08)"
                      : isFlagged ? "#FFFBEB" : "white",
                    borderRight:"0.5px solid #E8E4DE", borderBottom:"0.5px solid #E8E4DE",
                    borderTop:"none", borderLeft:"none",
                    color: cell.isMine?"#DC2626":NUM_COLORS[cell.adjacent]??"transparent",
                    boxShadow:!isRevealed&&!isFlagged&&!solutionRevealed?"inset 0 2px 0 rgba(255,255,255,0.8),inset 0 -1px 0 rgba(0,0,0,0.06)":"none",
                  }}>
                  {isFlagged&&<Flag size={Math.round(cellSize*0.45)} color={isSolFlag?"#EF4444":"#F59E0B"}/>}
                  {isRevealed&&cell.isMine&&<Bomb size={Math.round(cellSize*0.45)} color="#DC2626"/>}
                  {isRevealed&&!cell.isMine&&(cell.adjacent>0?cell.adjacent:"")}
                </motion.button>
              );
            }))}
          </div>
        </div>

        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <HintButton hintsLeft={3-hintsUsed} xpCost={100} onUseHint={handleHint} disabled={!!gameOver||solutionRevealed}/>
          <ShowSolution onReveal={handleRevealSolution} currentXP={currentXP} disabled={!!gameOver||solutionRevealed||firstClick}/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)}
            style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      {/* Game over — lose */}
      <AnimatePresence>
        {gameOver==="lose"&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{background:"var(--surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <div style={{fontSize:48,marginBottom:16}}>💥</div>
              <h2 style={{fontSize:24,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif",marginBottom:6}}>Mine Hit</h2>
              <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>Better luck next time.</p>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>Try Again</button>
                <button onClick={()=>setStage(s=>s+1)} style={{flex:1,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer"}}>Next Stage</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over — win */}
      <AnimatePresence>
        {gameOver==="win"&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{background:"var(--surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <div style={{fontSize:48,marginBottom:16}}>✅</div>
              <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif",marginBottom:4}}>Stage {stage} Clear</h2>
              <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>{elapsed} · {diff}</p>
              <div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}>
                <p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4}}>XP EARNED</p>
                <p style={{fontSize:48,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>Retry</button>
                <button onClick={()=>{setGameOver(null);setStage(s=>s+1);}} style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Next Stage <ChevronRight size={14}/></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showResume && resumeData && (
        <ResumeModal
          gameSlug="minesweeper"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={()=>{
            const s=resumeData!;
            setShowResume(false);setResumeData(null);
            setStage(s.stage as number);
          }}
          onStartFresh={()=>{
            clearGameState("minesweeper");setShowResume(false);setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="minesweeper" totalStages={1000} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
    </div>
  );
}

export default function MinesweeperGame(){return<ErrorBoundary game="minesweeper"><MinesweeperGameInner/></ErrorBoundary>;}