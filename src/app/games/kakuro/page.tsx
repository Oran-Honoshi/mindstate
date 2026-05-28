"use client";
const TOTAL_STAGES = 100;
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
import { ChevronRight, Delete } from "lucide-react";
import { generateKakuro, checkKakuro, type KakuroBoard } from "@/lib/games/kakuroGenerator";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(s: number): Difficulty { return s<=300?"easy":s<=700?"medium":"hard"; }

function KakuroGameInner() {
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const clueBg = theme === "dark" ? "var(--color-surface-2)" : "#374151";
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [board, setBoard] = useState<KakuroBoard | null>(null);
  const [userGrid, setUserGrid] = useState<(number|null)[][]>([]);
  const [selected, setSelected] = useState<[number,number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveXP, setLiveXP] = useState(1000);
  const [finalElapsed, setFinalElapsed] = useState("0:00");
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
  const [history, setHistory] = useState<(number|null)[][][]>([]);
  const [checkState, setCheckState] = useState<Map<string, "correct" | "incorrect"> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - xpState.startTime) / 1000));
        setLiveXP(calculateXP(xpState).currentXP);
      }, 500);
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
    setXpState(xp); setCompleted(false); setFinalXP(0); setHintsUsed(0);
    setElapsedSeconds(0); setLiveXP(1000); setFinalElapsed("0:00");
    setSolutionRevealed(false);
    setHistory([]);
    setCheckState(null);
    if (checkTimerRef.current) { clearTimeout(checkTimerRef.current); checkTimerRef.current = null; }
    setNextUncompleted(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - xp.startTime) / 1000));
      setLiveXP(calculateXP(xp).currentXP);
    }, 500);
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

  function handleRevealSolution() {
    if (!board || !xpState) return;
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
    setHistory(h => [...h.slice(-19), userGrid.map(row => [...row])]);
    const ng = userGrid.map(row => [...row]);
    ng[r][c] = num;
    setUserGrid(ng);
    saveGameState("kakuro",{stage,userGrid:ng,hintsUsed,startTime:xpState?.startTime,savedAt:Date.now()});
    playClick();
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
      setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
      markStageCompleted("kakuro", stage);
      if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if (user) saveScore({ user_id:user.id, game_slug:"kakuro", stage_number:stage, difficulty:getDifficulty(stage), xp_earned:earned, time_taken:Math.floor((Date.now()-xpState.startTime)/1000), hints_used:hintsUsed });
    }
  }

  function handleUndo() {
    if (history.length === 0) return;
    setUserGrid(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
    setErrors(new Set());
    playClick();
  }

  function handleCheck() {
    if (!board || completed || solutionRevealed) return;
    const result = new Map<string, "correct" | "incorrect">();
    const { size, grid } = board;
    // Each "run" is a horizontal or vertical sequence of white cells terminated by black/clue
    // Find runs and their target sum from preceding clue cell
    type Run = { cells: [number, number][]; target: number };
    const horizRuns: Run[] = [];
    const vertRuns: Run[] = [];
    for (let r = 0; r < size; r++) {
      let run: [number, number][] = [];
      let target = 0;
      for (let c = 0; c <= size; c++) {
        const cell = c < size ? grid[r][c] : null;
        if (cell && cell.type === "white") run.push([r, c]);
        else {
          if (run.length > 0) horizRuns.push({ cells: run, target });
          run = [];
          if (cell && cell.type === "clue") {
            const clue = cell as { type: "clue"; right?: number; down?: number };
            target = clue.right ?? 0;
          } else target = 0;
        }
      }
    }
    for (let c = 0; c < size; c++) {
      let run: [number, number][] = [];
      let target = 0;
      for (let r = 0; r <= size; r++) {
        const cell = r < size ? grid[r][c] : null;
        if (cell && cell.type === "white") run.push([r, c]);
        else {
          if (run.length > 0) vertRuns.push({ cells: run, target });
          run = [];
          if (cell && cell.type === "clue") {
            const clue = cell as { type: "clue"; right?: number; down?: number };
            target = clue.down ?? 0;
          } else target = 0;
        }
      }
    }
    for (const run of [...horizRuns, ...vertRuns]) {
      const vals = run.cells.map(([r, c]) => userGrid[r][c]);
      if (vals.some(v => v === null)) continue; // incomplete run — no verdict
      const sum = vals.reduce<number>((s, v) => s + (v ?? 0), 0);
      const hasDup = new Set(vals).size !== vals.length;
      const status: "correct" | "incorrect" = sum === run.target && !hasDup ? "correct" : "incorrect";
      run.cells.forEach(([r, c]) => {
        const k = `${r},${c}`;
        // If any run marks a cell incorrect, prefer that
        if (status === "incorrect" || !result.has(k)) result.set(k, status);
      });
    }
    setCheckState(result);
    playClick();
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => setCheckState(null), 2000);
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
    <div style={{ minHeight:"100vh", background:"var(--color-bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--color-text-secondary)", fontSize:13 }}>Generating puzzle...</p>
    </div>
  );

  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 420) : 360;
  const cellSize = Math.floor(maxW / board.size);

  return (
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Kakuro"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug="kakuro" />
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:18, padding:"16px 16px 32px" }}>
          <div style={{ fontSize:11, color:"var(--color-text-secondary)" }}>Fill white cells · Each run must sum to its clue · No repeats in a run · {board.size}×{board.size}</div>

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"8px 20px",borderRadius:12,background:"color-mix(in srgb, var(--color-error) 8%, transparent)",border:"0.5px solid color-mix(in srgb, var(--color-error) 20%, transparent)",fontSize:13,fontWeight:600,color:"var(--color-error)"}}>
              Solution revealed · XP set to 1 · Retry to score properly
            </motion.div>
          )}

          <div style={{ border:"2px solid var(--color-border)", borderRadius:12, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${board.size},${cellSize}px)` }}>
              {board.grid.map((row, r) => row.map((cell, c) => {
                if (cell.type === "black") return (
                  <div key={`${r}-${c}`} style={{ width:cellSize, height:cellSize, background:clueBg, borderRight:"0.5px solid var(--color-border)", borderBottom:"0.5px solid var(--color-border)", borderTop:"none", borderLeft:"none" }}/>
                );
                if (cell.type === "clue") {
                  const clue = cell as { type:"clue"; right?:number; down?:number };
                  return (
                    <div key={`${r}-${c}`} style={{ width:cellSize, height:cellSize, background:clueBg, borderRight:"0.5px solid var(--color-border)", borderBottom:"0.5px solid var(--color-border)", borderTop:"none", borderLeft:"none", position:"relative", overflow:"hidden" }}>
                      <svg width={cellSize} height={cellSize}>
                        <line x1={0} y1={0} x2={cellSize} y2={cellSize} stroke="var(--color-border)" strokeWidth={1}/>
                        {clue.down!==undefined&&<text x={cellSize*0.25} y={cellSize*0.45} textAnchor="middle" dominantBaseline="middle" style={{fontSize:Math.min(cellSize*0.3,11),fontWeight:700,fill:"white",fontFamily:"var(--font-mono)"}}>{clue.down}</text>}
                        {clue.right!==undefined&&<text x={cellSize*0.75} y={cellSize*0.72} textAnchor="middle" dominantBaseline="middle" style={{fontSize:Math.min(cellSize*0.3,11),fontWeight:700,fill:"white",fontFamily:"var(--font-mono)"}}>{clue.right}</text>}
                      </svg>
                    </div>
                  );
                }
                const isSelected = selected?.[0]===r && selected?.[1]===c;
                const hasError = errors.has(`${r},${c}`);
                const val = userGrid[r]?.[c];
                const isSolution = solutionRevealed && val !== null;
                const check = checkState?.get(`${r},${c}`);
                return (
                  <motion.button key={`${r}-${c}`}
                    onClick={() => { if (!solutionRevealed) setSelected([r,c]); }}
                    animate={hasError?{x:[-2,2,-2,2,0]}:{}}
                    transition={{ duration:0.25 }}
                    style={{ width:cellSize, height:cellSize, display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:Math.round(cellSize*0.45), fontWeight:700,
                      cursor: solutionRevealed ? "default" : "pointer", outline:"none",
                      background: check==="correct" ? "var(--color-accent-secondary)" : check==="incorrect" ? "var(--color-error)" : isSolution?"color-mix(in srgb, var(--color-error) 4%, var(--color-surface))":isSelected?"color-mix(in srgb, var(--color-accent-primary) 12%, var(--color-surface))":hasError?"color-mix(in srgb, var(--color-error) 10%, var(--color-surface))":"var(--color-surface)",
                      color: check ? "var(--color-bg)" : isSolution?"var(--color-error)":hasError?"var(--color-error)":val?"var(--color-accent-primary)":"var(--color-border)",
                      borderRight:"0.5px solid var(--color-border)", borderBottom:"0.5px solid var(--color-border)", borderTop:"none", borderLeft:"none",
                      boxShadow: isSelected&&!solutionRevealed?"inset 0 0 0 2px var(--color-accent-primary)":"none",
                      transition: "background 0.2s" }}>
                    {val ?? ""}
                  </motion.button>
                );
              }))}
            </div>
          </div>

          {!solutionRevealed && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => handleInput(n)}
                  style={{ width:44, height:44, borderRadius:12, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", fontSize:16, fontWeight:700, color:"var(--color-text-secondary)", cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
                  {n}
                </button>
              ))}
              <button onClick={() => handleInput(null)}
                style={{ width:44, height:44, borderRadius:12, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Delete size={16} color="#94A3B8"/>
              </button>
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => stage>1&&setStage(s=>s-1)} disabled={stage===1}
              style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", cursor:stage>1?"pointer":"not-allowed", fontSize:12, color:"var(--color-text-secondary)", opacity:stage===1?0.4:1 }}>← Prev</button>
            <span style={{ fontSize:12, color:"var(--color-text-secondary)" }}>Stage {stage} of {TOTAL_STAGES}</span>
            <button onClick={() => setStage(s=>s+1)}
              style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", cursor:"pointer", fontSize:12, color:"var(--color-text-secondary)", fontWeight:600 }}>Next <ChevronRight size={13}/></button>
          </div>
        </div>
      </GameShell>

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
      {showMap&&<StageMap gameSlug="kakuro" totalStages={TOTAL_STAGES} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Kakuro Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Kakuro"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function KakuroGame(){return<ErrorBoundary game="kakuro"><KakuroGameInner/></ErrorBoundary>;}