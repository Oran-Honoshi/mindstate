"use client";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import{UndoButton}from"@/components/ui/UndoButton";
import { usePageVisibility } from "@/hooks/usePageVisibility";

import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ChevronRight, Share2, Delete } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
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
import { consumeToken } from "@/lib/games/tokenEngine";
import { HintButton } from "@/components/ui/HintButton";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";

type SudokuCell = number | null;
type SudokuBoard = SudokuCell[][];

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  // Pseudo-random mix: 20% easy, 50% medium, 30% hard
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

function isValid(board: SudokuBoard, r: number, c: number, num: number, size: number): boolean {
  for (let i = 0; i < size; i++) {
    if (board[r][i] === num || board[i][c] === num) return false;
  }
  const br = size === 9 ? 3 : 2, bc = size === 9 ? 3 : 3;
  const sr = Math.floor(r / br) * br, sc = Math.floor(c / bc) * bc;
  for (let ri = sr; ri < sr + br; ri++)
    for (let ci = sc; ci < sc + bc; ci++)
      if (board[ri][ci] === num) return false;
  return true;
}

function solve(board: SudokuBoard, size: number, rng: () => number): boolean {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null) {
        const nums = Array.from({ length: size }, (_, i) => i + 1);
        for (let i = nums.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [nums[i], nums[j]] = [nums[j], nums[i]]; }
        for (const n of nums) {
          if (isValid(board, r, c, n, size)) {
            board[r][c] = n;
            if (solve(board, size, rng)) return true;
            board[r][c] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSudoku(seed: string, difficulty: Difficulty) {
  const size = difficulty === "hard" ? 9 : 6;
  const remove = difficulty === "easy" ? 18 : difficulty === "medium" ? 24 : 51;
  const br = difficulty === "hard" ? 3 : 2, bc = difficulty === "hard" ? 3 : 3;
  const rng = mulberry32(seedToNumber(seed));
  const solution: SudokuBoard = Array.from({ length: size }, () => Array(size).fill(null));
  solve(solution, size, rng);
  const puzzle: SudokuBoard = solution.map(r => [...r]);
  const indices = Array.from({ length: size * size }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
  for (let i = 0; i < remove; i++) puzzle[Math.floor(indices[i] / size)][indices[i] % size] = null;
  return { size, solution, puzzle, br, bc };
}

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => { const iv = setInterval(() => setSnap(calculateXP(xpState)), 500); return () => clearInterval(iv); }, [xpState]);
  const pct = snap.percentRemaining;
  const color = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:4, background:"var(--bg3)", borderRadius:2, overflow:"hidden" }}>
        <motion.div animate={{ width:`${pct*100}%` }} transition={{ duration:0.5 }} style={{ height:"100%", background:color, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"monospace", minWidth:36 }}>{snap.currentXP}</span>
      <span style={{ fontSize:11, color:"var(--text4)" }}>XP</span>
    </div>
  );
}

function SudokuGameInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => getLastStage("sudoku"));
  const [puzzleData, setPuzzleData] = useState<ReturnType<typeof generateSudoku> | null>(null);
  const [playerBoard, setPlayerBoard] = useState<SudokuBoard>([]);
  const [selected, setSelected] = useState<[number,number]|null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [xpState, setXpState] = useState<XPState|null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [flashSections, setFlashSections] = useState<Set<string>>(new Set());
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [boardHistory, setBoardHistory] = useState<typeof playerBoard[]>([]);
  const [feedbackCells, setFeedbackCells] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  // Freeze game when user leaves the app
  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
    }}
  );


  const loadStage = useCallback((s: number) => {
    const diff = getDifficulty(s);
    const seed = buildSeed("sudoku", diff, s);
    const data = generateSudoku(seed, diff);
    const xp = createXPState(diff);
    setPuzzleData(data);
    setPlayerBoard(data.puzzle.map(r => [...r]));
    setBoardHistory([]);
    setSelected(null); setErrors(new Set());
    setXpState(xp); setCompleted(false); setFinalXP(0); setHintsUsed(0); setShowFeedback(false); setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
  }, []);

  useEffect(() => { loadStage(stage); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [stage, loadStage]);

  function handleInput(num: number | null) {
    if (!puzzleData || !selected || completed) return;
    const [r, c] = selected;
    if (puzzleData.puzzle[r][c] !== null) return;
    setBoardHistory(h=>[...h.slice(-19),playerBoard.map(r=>[...r])]);
    const nb = playerBoard.map(row => [...row]);
    nb[r][c] = num;
    setPlayerBoard(nb);
    // Auto-save progress
    saveGameState("sudoku", {
      stage, playerBoard: nb, elapsed,
      startTime: xpState?.startTime, hintsUsed,
    });
    const errs = new Set<string>();
    nb.forEach((row, ri) => row.forEach((v, ci) => {
      if (puzzleData.puzzle[ri][ci] !== null || v === null) return;
      if (v !== puzzleData.solution[ri][ci]) errs.add(`${ri}-${ci}`);
    }));
    if (errs.size > 0) { setErrors(errs); playError(); } else { setErrors(new Set()); }
    const allCorrect = nb.every((row, ri) => row.every((v, ci) => puzzleData.puzzle[ri][ci] !== null || v === puzzleData.solution[ri][ci]));
    const allFilled = nb.every(row => row.every(v => v !== null));
    const userFilledCount = nb.flat().filter((v, i) => {
      const r = Math.floor(i / nb[0].length), c = i % nb[0].length;
      return puzzleData.puzzle[r][c] === null && v !== null;
    }).length;
    const emptyCount = puzzleData.puzzle.flat().filter(v => v === null).length;
    // Flash completed box green
    if (puzzleData && num !== null) {
      const br2 = puzzleData.br, bc2 = puzzleData.bc;
      const boxR = Math.floor(selected[0]/br2)*br2, boxC = Math.floor(selected[1]/bc2)*bc2;
      const boxFull = (() => {
        for (let ri=boxR;ri<boxR+br2;ri++)
          for (let ci=boxC;ci<boxC+bc2;ci++)
            if (nb[ri][ci] === null) return false;
        return true;
      })();
      const boxCorrect = (() => {
        for (let ri=boxR;ri<boxR+br2;ri++)
          for (let ci=boxC;ci<boxC+bc2;ci++)
            if (nb[ri][ci] !== puzzleData.solution[ri][ci]) return false;
        return true;
      })();
      if (boxFull && boxCorrect) {
        const key2 = `${Math.floor(selected[0]/br2)},${Math.floor(selected[1]/bc2)}`;
        setFlashSections(prev => new Set([...prev, key2]));
        setTimeout(() => setFlashSections(prev => { const ns=new Set(prev); ns.delete(key2); return ns; }), 800);
      }
    }
    if (allCorrect && allFilled && userFilledCount >= emptyCount && xpState) {
      const earned = finalizeXP(xpState); setFinalXP(earned); setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
          markStageCompleted("sudoku",stage);
          if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if (user) saveScore({ user_id:user.id, game_slug:"sudoku", stage_number:stage, difficulty:getDifficulty(stage), xp_earned:earned, time_taken:Math.floor((Date.now()-xpState.startTime)/1000) });
    }
  }

  if (!puzzleData || !xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--text4)", fontSize:13 }}>Generating puzzle...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 480) : 400;
  const cellSize = Math.floor(maxW / puzzleData.size);
  const nums = Array.from({ length: puzzleData.size }, (_, i) => i + 1);


  function handleUndo() {
    if (boardHistory.length === 0) return;
    setPlayerBoard(boardHistory[boardHistory.length-1]);
    setBoardHistory(h => h.slice(0,-1));
    setErrors(new Set());
  }

  function handleHint() {
    if (!puzzleData || !xpState || completed || hintsUsed >= 3) return;
    for (let r = 0; r < puzzleData.size; r++) {
      for (let c = 0; c < puzzleData.size; c++) {
        if (puzzleData.puzzle[r][c] === null && playerBoard[r][c] === null) {
          const nb = playerBoard.map(row => [...row]);
          nb[r][c] = puzzleData.solution[r][c];
          setPlayerBoard(nb);
          setHintsUsed(h => h + 1);
          setXpState(prev => prev ? {...prev, hintsUsed: Math.min((prev.hintsUsed||0)+1, prev.maxHints)} : prev);
          playError();
          return;
        }
      }
    }
  }

function handleCheck() {
    if (!puzzleData || !xpState || completed) return;
    const correct = new Set<string>();
    const wrong = new Set<string>();
    playerBoard.forEach((row, r) => row.forEach((val, c) => {
      if (val !== null && puzzleData.puzzle[r][c] === null) {
        if (val === puzzleData.solution[r][c]) correct.add(`${r},${c}`);
        else wrong.add(`${r},${c}`);
      }
    }));
    setFeedbackCells(correct);
    setWrongCells(wrong);
    setShowFeedback(true);
    setXpState(prev => prev ? {...prev, hintsUsed: Math.min((prev.hintsUsed||0)+1, prev.maxHints)} : prev);
    setTimeout(() => { setShowFeedback(false); setFeedbackCells(new Set()); setWrongCells(new Set()); }, 2000);
  }
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <Navbar/>
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:18 }}>
        {/* Stage header */}
        <div style={{ width:"100%", maxWidth:520, background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Link href="/games" style={{ color:"var(--text4)", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
                <ArrowLeft size={14}/> Games
              </Link>
              <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
              <span style={{ fontSize:11, color:"var(--text4)" }}>Stage</span>
              <span style={{ fontSize:20, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:`${diffColor}15`, color:diffColor }}>
                {diff.toUpperCase()} · {puzzleData.size}×{puzzleData.size}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:12, color:"var(--text4)", fontFamily:"monospace" }}>{elapsed}</span>
              <button onClick={() => loadStage(stage)} style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", color:"var(--text4)", display:"flex" }}>
                <RotateCcw size={13}/>
              <button onClick={()=>setShowMap(true)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",fontSize:11,fontWeight:600}}>⊞</button>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Board */}
        <div style={{ border:"2px solid #374151", borderRadius:12, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.08)" }}>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${puzzleData.size},${cellSize}px)` }}>
            {puzzleData.puzzle.map((row, r) => row.map((given, c) => {
              const value = playerBoard[r][c];
              const isGiven = given !== null;
              const isSelected = selected?.[0]===r && selected?.[1]===c;
              const isError = errors.has(`${r}-${c}`);
              const sameVal = selected && value !== null && playerBoard[selected[0]][selected[1]]===value && !isSelected;
              const rightBox = (c+1)%puzzleData.bc===0 && c<puzzleData.size-1;
              const bottomBox = (r+1)%puzzleData.br===0 && r<puzzleData.size-1;
              return (
                <motion.button key={`${r}-${c}`}
                  onClick={() => { if (!isGiven) setSelected([r,c]); playClick(); }}
                  animate={isError?{x:[-2,2,-2,2,0]}:{}}
                  transition={{ duration:0.25 }}
                  style={{
                    width:cellSize, height:cellSize,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: puzzleData.size===6 ? 18 : 14,
                    fontWeight:700, outline:"none", cursor:isGiven?"default":"pointer",
                    background: showFeedback&&feedbackCells.has(`${r}-${c}`) ? "#DCFCE7"
                      : showFeedback&&wrongCells.has(`${r}-${c}`) ? "#FEF2F2"
                      : isSelected ? "#EEF2FF"
                      : isError ? "#FEF2F2"
                      : sameVal ? "#F5F7FF"
                      : isGiven ? "var(--bg2)" : "var(--surface)",
                    color: isGiven ? "#1C1917"
                      : isError ? "#EF4444"
                      : value ? "#4F6EF7" : "#CBD5E1",
                    borderRight: rightBox ? "2px solid #374151" : "0.5px solid #E2E8F0",
                    borderBottom: bottomBox ? "2px solid #374151" : "0.5px solid #E2E8F0",
                    borderTop:"none", borderLeft:"none",
                    boxShadow: isSelected ? "inset 0 0 0 2px #4F6EF7" : "none",
                  }}>
                  {value ?? ""}
                </motion.button>
              );
            }))}
          </div>
        </div>

        {/* Number pad */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
          {nums.map(n => (
            <button key={n} onClick={() => handleInput(n)}
              style={{ width:44, height:44, borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", fontSize:16, fontWeight:700, color:"var(--text2)", cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,0.04)", transition:"all 0.15s" }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="#4F6EF7"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor="#E2E8F0"}>
              {n}
            </button>
          ))}
          <button onClick={() => handleInput(null)}
            style={{ width:44, height:44, borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
            <Delete size={16} color="#94A3B8"/>
          </button>
        </div>

        {/* Stage nav */}

        {/* Controls */}
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <UndoButton onUndo={handleUndo} canUndo={boardHistory.length>0} disabled={completed}/>
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

      
      
      <OutOfTokensModal
        gameName="Sudoku"
        open={showTokenModal}
        onClose={()=>setShowTokenModal(false)}/>
      {showMap&&<StageMap gameSlug="sudoku" totalStages={1000} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      {showResume && resumeData && (
        <ResumeModal
          gameSlug="sudoku"
          stageName={resumeData.stage as number}
          savedAt={resumeData.savedAt as number ?? Date.now()}
          onResume={()=>{
            // Restore saved state
            const s = resumeData;
            setStage(s.stage as number);
            setShowResume(false);
            setResumeData(null);
            // loadStage will be called by stage effect, but we need to restore board
            // after it loads — use a flag
            setTimeout(()=>{
              if(s.playerBoard) setPlayerBoard(s.playerBoard as (number|null)[][]);
            }, 100);
          }}
          onStartFresh={()=>{
            clearGameState("sudoku");
            setShowResume(false);
            setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={getDifficulty(stage)}
        xpEarned={finalXP}
        elapsed={elapsed}
        onRetry={()=>loadStage(stage)}
        onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{
          const text=`MindState · Sudoku Stage ${stage} · ${finalXP} XP · ${elapsed}`;
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

export default function SudokuGame() {
  return (
    <ErrorBoundary game="sudoku">
      <SudokuGameInner/>
    </ErrorBoundary>
  );
}
