"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "logic-path";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Lock } from "lucide-react";
import { OutOfTokensModal } from "@/components/ui/OutOfTokensModal";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import {
  generateLogicPath, rotatePipe, checkLogicPath, isCellCorrect,
  type LogicBoard, type PipeCell
} from "@/lib/games/logicPathGenerator";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { consumeToken } from "@/lib/games/tokenEngine";
import { updateStreak } from "@/lib/supabase/streaks";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";
import { useSettingsStore } from "@/store/settingsStore";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(s: number): Difficulty { return s<=300?"easy":s<=700?"medium":"hard"; }

const HINT_XP_COST = 100;
const MAX_HINTS = 3;

function PipeSVG({ cell, size, isCorrect, showFeedback, isDark }: {
  cell: PipeCell; size: number; isCorrect?: boolean; showFeedback?: boolean; isDark?: boolean;
}) {
  const c = size / 2;
  const w = Math.max(4, size * 0.18);
  const color = showFeedback ? (isCorrect ? "var(--color-accent-secondary)" : "var(--color-accent-primary)") : "var(--color-accent-primary)";
  const glowFilter = isDark && showFeedback && isCorrect ? "url(#glow-pipe-correct)" : undefined;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {isDark && showFeedback && isCorrect && (
        <defs>
          <filter id="glow-pipe-correct" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      )}
      {showFeedback && <rect x={0} y={0} width={size} height={size} fill={isCorrect?"color-mix(in srgb, var(--color-accent-secondary) 8%, transparent)":"rgba(0,255,255,0.05)"} rx={6}/>}
      <g filter={glowFilter}>
        {cell.connections[0] && <rect x={c-w/2} y={0} width={w} height={c+w/2} fill={color} rx={w/3}/>}
        {cell.connections[1] && <rect x={c-w/2} y={c-w/2} width={size-c+w/2} height={w} fill={color} rx={w/3}/>}
        {cell.connections[2] && <rect x={c-w/2} y={c-w/2} width={w} height={size-c+w/2} fill={color} rx={w/3}/>}
        {cell.connections[3] && <rect x={0} y={c-w/2} width={c+w/2} height={w} fill={color} rx={w/3}/>}
        <circle cx={c} cy={c} r={w*0.85} fill={color}/>
        {cell.connections[0] && <circle cx={c} cy={2} r={w*0.4} fill={color} opacity={0.6}/>}
        {cell.connections[1] && <circle cx={size-2} cy={c} r={w*0.4} fill={color} opacity={0.6}/>}
        {cell.connections[2] && <circle cx={c} cy={size-2} r={w*0.4} fill={color} opacity={0.6}/>}
        {cell.connections[3] && <circle cx={2} cy={c} r={w*0.4} fill={color} opacity={0.6}/>}
      </g>
    </svg>
  );
}

function LogicPathPageInner() {
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [board, setBoard] = useState<LogicBoard | null>(null);
  const [grid, setGrid] = useState<PipeCell[][]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveXP, setLiveXP] = useState(1000);
  const [finalElapsed, setFinalElapsed] = useState("0:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [history, setHistory] = useState<PipeCell[][][]>([]);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const pausedRef = useRef(false);

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
    saveGameState("logic-path", {stage: s, savedAt: Date.now()});
    const diff = getDifficulty(s);
    const b = generateLogicPath(`logic-${diff}-${s}`, diff);
    const xp = createXPState(diff);
    setBoard(b);
    setGrid(b.grid.map(row => row.map(cell => ({ ...cell, connections: [...cell.connections] as [boolean,boolean,boolean,boolean] }))));
    setXpState(xp); setCompleted(false); setFinalXP(0);
    setElapsedSeconds(0); setLiveXP(1000); setFinalElapsed("0:00");
    setHintsUsed(0); setShowFeedback(false);
    setSolutionRevealed(false);
    setHistory([]);
    if (checkTimerRef.current) { clearTimeout(checkTimerRef.current); checkTimerRef.current = null; }
    setNextUncompleted(null);
    if (timerRef.current) clearInterval(timerRef.current);
    pausedRef.current = false;
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - xp.startTime) / 1000));
      setLiveXP(calculateXP(xp).currentXP);
    }, 500);
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  }, [user]);

  const resumeChecked = useRef(false);

  useEffect(() => {
    if (!resumeChecked.current) {
      resumeChecked.current = true;
      const saved = loadGameState("logic-path");
      if (saved && (saved.stage as number) > 1) { setResumeData(saved); setShowResume(true); return; }
    }
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleRevealSolution() {
    if (!board || !xpState) return;
    setGrid(board.solution.map(row =>
      row.map(cell => ({ ...cell, connections: [...cell.connections] as [boolean,boolean,boolean,boolean], locked: true }))
    ));
    setShowFeedback(true);
    setSolutionRevealed(true);
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleRotate(r: number, c: number) {
    if (!board || completed || grid[r][c].locked || solutionRevealed) return;
    setHistory(h => [...h.slice(-19), grid.map(row => row.map(cell => ({ ...cell, connections: [...cell.connections] as [boolean,boolean,boolean,boolean] })))]);
    const ng = grid.map(row => row.map(cell => ({ ...cell, connections: [...cell.connections] as [boolean,boolean,boolean,boolean] })));
    ng[r][c] = rotatePipe(ng[r][c]);
    setGrid(ng);
    saveGameState("logic-path", {stage, grid: ng, hintsUsed, startTime: xpState?.startTime, savedAt: Date.now()});
    playClick();
    if (checkLogicPath(ng) && xpState) {
      const earned = Math.max(1, finalizeXP(xpState) - hintsUsed * HINT_XP_COST);
      setFinalXP(earned); setCompleted(true);
      setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
      markStageCompleted("logic-path",stage);
      if (user) { updateStreak(user.id); saveScore({ user_id:user.id, game_slug:"logic-path", stage_number:stage, difficulty:getDifficulty(stage), xp_earned:earned, time_taken:Math.floor((Date.now()-xpState.startTime)/1000), hints_used:hintsUsed }); }
    }
  }

  function handleUndo() {
    if (history.length === 0) return;
    setGrid(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
    playClick();
  }

  function handleCheck() {
    if (!board || completed || solutionRevealed) return;
    setShowFeedback(true);
    playClick();
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => setShowFeedback(false), 2000);
  }

  function handleHint() {
    if (!board || hintsUsed >= MAX_HINTS || !xpState || solutionRevealed) return;
    const ng = grid.map(row => row.map(cell => ({ ...cell, connections: [...cell.connections] as [boolean,boolean,boolean,boolean] })));
    let fixed = false;
    outer: for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        if (!ng[r][c].locked && !isCellCorrect(ng, board.solution, r, c)) {
          ng[r][c] = { ...board.solution[r][c], locked: true };
          fixed = true; break outer;
        }
      }
    }
    if (!fixed) return;
    setGrid(ng); setHintsUsed(h => h + 1); playClick();
    if (checkLogicPath(ng) && xpState) {
      const earned = Math.max(1, finalizeXP(xpState) - (hintsUsed+1) * HINT_XP_COST);
      setFinalXP(earned); setCompleted(true);
      setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
    }
  }

  if (!board || !xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--color-text-secondary)", fontSize:13 }}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const maxW = typeof window!=="undefined" ? Math.min(window.innerWidth-48, 400) : 340;
  const cellSize = Math.floor((maxW - (board.size-1)*8) / board.size);

  return (
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Logic Path"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={MAX_HINTS-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug="logic-path" />
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"16px 16px 32px" }}>
          <div style={{ fontSize:11, color:"var(--color-text-secondary)", textAlign:"center", fontFamily:"var(--font-mono)", letterSpacing:"0.04em" }}>
            CLICK PIPE TO ROTATE 90° · MATCH ALL CONNECTIONS · NO OPEN ENDS AT BORDERS
          </div>

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"8px 20px",borderRadius:12,background:"color-mix(in srgb, var(--color-error) 8%, transparent)",border:"0.5px solid color-mix(in srgb, var(--color-error) 20%, transparent)",fontSize:12,fontWeight:600,color:"var(--color-error)",fontFamily:"var(--font-mono)"}}>
              SOLUTION REVEALED · XP SET TO 1 · RETRY TO SCORE
            </motion.div>
          )}

          <div style={{ display:"flex", gap:14, fontSize:10, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.04em" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:14, height:14, borderRadius:3, background:"rgba(0,255,255,0.1)", border:"1px solid var(--color-accent-primary)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:7, height:2, background:"var(--color-accent-primary)", borderRadius:1 }}/>
              </div>
              PIPE
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:14, height:14, borderRadius:3, background:"color-mix(in srgb, var(--color-accent-secondary) 12%, transparent)", border:"1px solid var(--color-accent-secondary)" }}/>
              CORRECT
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><Lock size={10}/> LOCKED</div>
          </div>

          <div style={{
            display:"grid", gridTemplateColumns:`repeat(${board.size},${cellSize}px)`, gap:8,
            padding: 12, borderRadius: 16,
            background: theme==="dark"
              ? `radial-gradient(circle, rgba(0,255,255,0.09) 1px, transparent 1px), #060d18`
              : theme==="light"
              ? `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px), #f8f9fb`
              : `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px), #f5f0e8`,
            backgroundSize: "18px 18px",
            border: "1px solid color-mix(in srgb, var(--color-accent-primary) 14%, transparent)",
            boxShadow: theme==="dark"
              ? "0 0 0 1px rgba(0,255,255,0.03), 0 20px 64px rgba(0,0,0,0.5)"
              : "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            {grid.map((row, r) => row.map((cell, c) => {
              const correct = isCellCorrect(grid, board.solution, r, c);
              const borderColor = cell.locked
                ? (solutionRevealed ? "color-mix(in srgb, var(--color-error) 20%, transparent)" : "var(--color-border)")
                : showFeedback && correct
                ? `color-mix(in srgb, var(--color-accent-secondary) ${theme==="dark"?"70%":"50%"}, transparent)`
                : "var(--color-border)";
              return (
                <motion.div key={`${r}-${c}`}
                  whileTap={!cell.locked&&!solutionRevealed?{scale:0.88}:{}}
                  onClick={() => handleRotate(r, c)}
                  style={{
                    width:cellSize, height:cellSize, borderRadius:10,
                    background: cell.locked
                      ? (solutionRevealed ? "color-mix(in srgb, var(--color-error) 5%, transparent)" : theme==="dark" ? "rgba(6,13,24,0.8)" : "var(--color-surface-2)")
                      : showFeedback&&correct
                      ? (theme==="dark" ? "rgba(57,255,20,0.07)" : "color-mix(in srgb, var(--color-accent-secondary) 8%, transparent)")
                      : theme==="dark" ? "rgba(10,18,32,0.85)" : "var(--color-surface)",
                    border:`1.5px solid ${borderColor}`,
                    boxShadow: showFeedback && correct && theme==="dark"
                      ? "0 0 8px rgba(57,255,20,0.22)"
                      : "none",
                    cursor: cell.locked||solutionRevealed ? "not-allowed" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    position:"relative", transition:"all 0.15s",
                  }}>
                  <PipeSVG cell={cell} size={cellSize-8} isCorrect={showFeedback?correct:undefined} showFeedback={showFeedback} isDark={theme==="dark"}/>
                  {cell.locked && <div style={{ position:"absolute", top:3, right:3 }}><Lock size={8} color={solutionRevealed?"var(--color-error)":"var(--color-text-secondary)"}/></div>}
                </motion.div>
              );
            }))}
          </div>

          {!solutionRevealed&&(
            <button onClick={() => setShowFeedback(f => !f)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:20,
                border: showFeedback ? "1px solid color-mix(in srgb, var(--color-accent-secondary) 50%, transparent)" : "1px solid var(--color-border)",
                background: showFeedback ? "color-mix(in srgb, var(--color-accent-secondary) 8%, transparent)" : "var(--color-surface)",
                fontSize:11, fontWeight:600, fontFamily:"var(--font-mono)", letterSpacing:"0.05em",
                color:showFeedback?"var(--color-accent-secondary)":"var(--color-text-secondary)", cursor:"pointer" }}>
              {showFeedback ? "FEEDBACK ON" : "CHECK PROGRESS"}
            </button>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => { if(stage>1){ clearGameState(GAME_SLUG); setStage(s=>s-1); } }} disabled={stage===1}
              style={{ padding:"8px 18px", borderRadius:10, border:"1px solid var(--color-border)", background:"var(--color-surface)", cursor:stage>1?"pointer":"not-allowed", fontSize:11, fontFamily:"var(--font-mono)", color:"var(--color-text-secondary)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" as const, opacity:stage===1?0.38:1 }}>← PREV</button>
            <span style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", fontWeight:600, letterSpacing:"0.06em" }}>STAGE {stage}/{TOTAL_STAGES}</span>
            <button onClick={() => { clearGameState(GAME_SLUG); setStage(s=>s+1); }}
              style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 18px", borderRadius:10, border:"1px solid var(--color-border)", background:"var(--color-surface)", cursor:"pointer", fontSize:11, fontFamily:"var(--font-mono)", color:"var(--color-text-secondary)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" as const }}>NEXT <ChevronRight size={12}/></button>
          </div>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Logic Path" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showResume && resumeData && (
        <ResumeModal
          gameSlug="logic-path"
          stageNumber={resumeData.stage as number}
          savedAt={resumeData.savedAt as number}
          onDismiss={() => { setShowResume(false); setResumeData(null); }}
          onResume={() => {
            const s = resumeData!;
            setShowResume(false); setResumeData(null);
            setStage(s.stage as number);
            if (s.grid) setTimeout(() => setGrid(s.grid as typeof grid), 150);
          }}
          onStartFresh={() => {
            clearGameState("logic-path"); setShowResume(false); setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="logic-path" totalStages={TOTAL_STAGES} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={diff} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={() => loadStage(stage)} onNext={() => { setCompleted(false); setStage(s => s+1); }}
        onShare={() => { const text=`MindElement · Logic Path Stage ${stage} · ${finalXP} XP · ${finalElapsed}`; if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{}); else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank"); }}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Logic Path"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function LogicPathPage(){return<ErrorBoundary game="logic-path"><LogicPathPageInner/></ErrorBoundary>;}