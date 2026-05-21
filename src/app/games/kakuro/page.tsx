"use client";
const TOTAL_STAGES = 1000;
const GAME_SLUG = "kakuro";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronRight, Delete } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { generateKakuro, checkKakuro, type KakuroBoard } from "@/lib/games/kakuroGenerator";
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
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { GamePageSchema } from "@/components/seo/GamePageSchema";

function getDifficulty(s: number): Difficulty { return s<=300?"easy":s<=700?"medium":"hard"; }

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => { const iv = setInterval(() => setSnap(calculateXP(xpState)), 500); return () => clearInterval(iv); }, [xpState]);
  const pct = snap.percentRemaining; const color = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F59E0B" : "#EF4444";
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

function KakuroGameInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [board, setBoard] = useState<KakuroBoard | null>(null);
  const [userGrid, setUserGrid] = useState<(number|null)[][]>([]);
  const [selected, setSelected] = useState<[number,number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [finalXP, setFinalXP] = useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
    }}
  );

  const loadStage = useCallback((s: number) => {
    saveGameState("kakuro", {stage: s, savedAt: Date.now()});
    const diff = getDifficulty(s);
    const b = generateKakuro(`kakuro-${diff}-${s}`, diff);
    const xp = createXPState(diff);
    setBoard(b);
    setUserGrid(Array.from({length:b.size},()=>Array.from({length:b.size},()=>null)));
    setSelected(null); setErrors(new Set());
    setXpState(xp); setCompleted(false); setFinalXP(0); setHintsUsed(0); setElapsed("00:00");
    setSolutionRevealed(false);
    setNextUncompleted(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  }, [user]);

  const resumeChecked = useRef(false);

  useEffect(()=>{
    if(!resumeChecked.current){
      resumeChecked.current=true;
      const saved=loadGameState("kakuro");
      if(saved&&(saved.stage as number)>1){setResumeData(saved);setShowResume(true);return;}
    }
    loadStage(stage);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[stage,loadStage]);

  // ── Show Solution ──────────────────────────────────────────────────────────
  // Kakuro's generator stores solution in board.solution (a 2D array of numbers)
  function handleRevealSolution() {
    if (!board || !xpState) return;
    // Build solution grid from board: for white cells, place the solution value
    // board.solution should be a 2D grid matching board.grid dimensions
    const ng = Array.from({length:board.size}, (_, r) =>
      Array.from({length:board.size}, (_, c) => {
        if (board.grid[r]?.[c]?.type === "white") {
          return (board as any).solution?.[r]?.[c] ?? null;
        }
        return null;
      })
    );
    setUserGrid(ng);
    setSelected(null);
    setErrors(new Set());
    setSolutionRevealed(true);
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleInput(num: number | null) {
    if (!board || !selected || completed || solutionRevealed) return;
    const [r, c] = selected;
    if (board.grid[r][c]?.type !== "white") return;
    const ng = userGrid.map(row => [...row]);
    ng[r][c] = num;
    setUserGrid(ng);
    saveGameState("kakuro",{stage,userGrid:ng,hintsUsed,startTime:xpState?.startTime,savedAt:Date.now()});
    playClick();
    // Check duplicates in runs
    const errs = new Set<string>();
    const { size, grid } = board;
    for (let row = 0; row < size; row++) {
      let run: [number,number][] = [];
      for (let col = 0; col <= size; col++) {
        if (col < size && grid[row][col]?.type === "white") run.push([row,col]);
        else {
          const vals = run.map(([r2,c2])=>ng[r2][c2]).filter(v=>v!==null);
          if (new Set(vals).size !== vals.length) run.forEach(([r2,c2])=>errs.add(`${r2},${c2}`));
          run = [];
        }
      }
    }
    setErrors(errs);
    if (errs.size > 0) playError();
    if (checkKakuro(board, ng) && xpState) {
      const earned = finalizeXP(xpState); setFinalXP(earned); setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
      markStageCompleted("kakuro", stage);
      if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if (user) saveScore({ user_id:user.id, game_slug:"kakuro", stage_number:stage, difficulty:getDifficulty(stage), xp_earned:earned, time_taken:Math.floor((Date.now()-xpState.startTime)/1000) });
    }
  }

  function handleHint() {
    if (!board || !xpState || completed || hintsUsed >= 3 || solutionRevealed) return;
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        if (board.grid[r][c]?.type === "white" && !userGrid[r][c]) {
          const ng = userGrid.map(row => [...row]);
          for (let n = 1; n <= 9; n++) {
            ng[r][c] = n;
            let rowOk = true, colOk = true;
            let runNums: number[] = [];
            for (let cc = c-1; cc >= 0 && board.grid[r][cc]?.type === "white"; cc--) runNums.push(ng[r][cc] ?? 0);
            for (let cc = c+1; cc < board.size && board.grid[r][cc]?.type === "white"; cc++) runNums.push(ng[r][cc] ?? 0);
            if (runNums.filter(v=>v>0).includes(n)) rowOk = false;
            runNums = [];
            for (let rr = r-1; rr >= 0 && board.grid[rr][c]?.type === "white"; rr--) runNums.push(ng[rr][c] ?? 0);
            for (let rr = r+1; rr < board.size && board.grid[rr][c]?.type === "white"; rr++) runNums.push(ng[rr][c] ?? 0);
            if (runNums.filter(v=>v>0).includes(n)) colOk = false;
            if (rowOk && colOk) {
              setUserGrid(ng);
              setHintsUsed(h => h+1);
              setXpState(prev => prev ? {...prev, hintsUsed: Math.min(prev.hintsUsed+1, prev.maxHints)} : prev);
              playError(); return;
            }
          }
          break;
        }
      }
    }
  }

  if (!board || !xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--text4)", fontSize:13 }}>Generating puzzle...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 420) : 360;
  const cellSize = Math.floor(maxW / board.size);
  const currentXP = calculateXP(xpState).currentXP;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <Navbar/>
      <GamePageSchema slug="kakuro" />
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:18 }}>
        <div style={{ width:"100%", maxWidth:500, background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, overflow:"hidden", flexShrink:1 }}>
              <Link href="/games" style={{ color:"var(--text4)", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}><ArrowLeft size={14}/> Games</Link>
              <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
              <span style={{ fontSize:20, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:`${diffColor}15`, color:diffColor }}>{diff.toUpperCase()} · {board.size}×{board.size}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              <span style={{ fontSize:12, color:"var(--text4)", fontFamily:"monospace" }}>{elapsed}</span>
              <button onClick={() => loadStage(stage)} style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", color:"var(--text4)", display:"flex" }}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{ fontSize:11, color:"var(--text4)" }}>Fill white cells · Each run must sum to its clue · No repeats in a run</div>

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"8px 20px",borderRadius:12,background:"rgba(239,68,68,0.08)",border:"0.5px solid rgba(239,68,68,0.2)",fontSize:13,fontWeight:600,color:"#EF4444"}}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        {/* Board */}
        <div style={{ border:"2px solid #374151", borderRadius:12, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${board.size},${cellSize}px)` }}>
            {board.grid.map((row, r) => row.map((cell, c) => {
              if (cell.type === "black") return (
                <div key={`${r}-${c}`} style={{ width:cellSize, height:cellSize, background:"#374151", borderRight:"0.5px solid #4B5563", borderBottom:"0.5px solid #4B5563", borderTop:"none", borderLeft:"none" }}/>
              );
              if (cell.type === "clue") {
                const clue = cell as { type:"clue"; right?:number; down?:number };
                return (
                  <div key={`${r}-${c}`} style={{ width:cellSize, height:cellSize, background:"#374151", borderRight:"0.5px solid #4B5563", borderBottom:"0.5px solid #4B5563", borderTop:"none", borderLeft:"none", position:"relative", overflow:"hidden" }}>
                    <svg width={cellSize} height={cellSize}>
                      <line x1={0} y1={0} x2={cellSize} y2={cellSize} stroke="#4B5563" strokeWidth={1}/>
                      {clue.down!==undefined&&<text x={cellSize*0.25} y={cellSize*0.45} textAnchor="middle" dominantBaseline="middle" style={{fontSize:Math.min(cellSize*0.3,11),fontWeight:700,fill:"#F9FAFB"}}>{clue.down}</text>}
                      {clue.right!==undefined&&<text x={cellSize*0.75} y={cellSize*0.72} textAnchor="middle" dominantBaseline="middle" style={{fontSize:Math.min(cellSize*0.3,11),fontWeight:700,fill:"#F9FAFB"}}>{clue.right}</text>}
                    </svg>
                  </div>
                );
              }
              const isSelected = selected?.[0]===r && selected?.[1]===c;
              const hasError = errors.has(`${r},${c}`);
              const val = userGrid[r]?.[c];
              const isSolution = solutionRevealed && val !== null;
              return (
                <motion.button key={`${r}-${c}`}
                  onClick={() => { if (!solutionRevealed) setSelected([r,c]); }}
                  animate={hasError?{x:[-2,2,-2,2,0]}:{}}
                  transition={{ duration:0.25 }}
                  style={{ width:cellSize, height:cellSize, display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:Math.round(cellSize*0.45), fontWeight:700,
                    cursor: solutionRevealed ? "default" : "pointer", outline:"none",
                    background: isSolution?"rgba(239,68,68,0.04)":isSelected?"#EEF2FF":hasError?"#FEF2F2":"var(--surface)",
                    color: isSolution?"#EF4444":hasError?"#EF4444":val?"#4F6EF7":"#CBD5E1",
                    borderRight:"0.5px solid #E2E8F0", borderBottom:"0.5px solid #E2E8F0", borderTop:"none", borderLeft:"none",
                    boxShadow: isSelected&&!solutionRevealed?"inset 0 0 0 2px #4F6EF7":"none" }}>
                  {val ?? ""}
                </motion.button>
              );
            }))}
          </div>
        </div>

        {/* Number pad — hidden when solution revealed */}
        {!solutionRevealed && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} onClick={() => handleInput(n)}
                style={{ width:44, height:44, borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", fontSize:16, fontWeight:700, color:"var(--text2)", cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
                {n}
              </button>
            ))}
            <button onClick={() => handleInput(null)}
              style={{ width:44, height:44, borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Delete size={16} color="#94A3B8"/>
            </button>
          </div>
        )}

        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <HintButton hintsLeft={3-hintsUsed} xpCost={100} onUseHint={handleHint} disabled={completed||solutionRevealed}/>
          <ShowSolution onReveal={handleRevealSolution} currentXP={currentXP} disabled={completed||solutionRevealed}/>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:stage>1?"pointer":"not-allowed", fontSize:12, color:"var(--text3)", opacity:stage===1?0.4:1 }}>← Prev</button>
          <span style={{ fontSize:12, color:"var(--text4)" }}>Stage {stage} of 1000</span>
          <button onClick={() => setStage(s=>s+1)}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", fontSize:12, color:"var(--text2)", fontWeight:600 }}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      {showResume && resumeData && (
        <ResumeModal
          gameSlug="kakuro"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={()=>{
            const s=resumeData!;
            setShowResume(false);setResumeData(null);
            setStage(s.stage as number);
            if(s.userGrid)setTimeout(()=>setUserGrid(s.userGrid as (number|null)[][]),150);
          }}
          onStartFresh={()=>{
            clearGameState("kakuro");setShowResume(false);setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="kakuro" totalStages={1000} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={elapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Kakuro Stage ${stage} · ${finalXP} XP · ${elapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Kakuro"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />

    </div>
  );
}
export default function KakuroGame(){return<ErrorBoundary game="kakuro"><KakuroGameInner/></ErrorBoundary>;}