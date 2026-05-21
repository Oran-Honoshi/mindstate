"use client";
const TOTAL_STAGES = 1000;
const GAME_SLUG = "logic-path";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { OutOfTokensModal } from "@/components/ui/OutOfTokensModal";
import { HintButton } from "@/components/ui/HintButton";
import { ShowSolution } from "@/components/ui/ShowSolution";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import {
  generateLogicPath, rotatePipe, checkLogicPath, isCellCorrect,
  type LogicBoard, type PipeCell
} from "@/lib/games/logicPathGenerator";
import { createXPState, calculateXP, finalizeXP, formatElapsed, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { consumeToken } from "@/lib/games/tokenEngine";
import { updateStreak } from "@/lib/supabase/streaks";
import { GamePageSchema } from "@/components/seo/GamePageSchema";

function getDifficulty(s: number): Difficulty { return s<=300?"easy":s<=700?"medium":"hard"; }

const HINT_XP_COST = 100;
const MAX_HINTS = 3;

function PipeSVG({ cell, size, isCorrect, showFeedback }: {
  cell: PipeCell; size: number; isCorrect?: boolean; showFeedback?: boolean;
}) {
  const c = size / 2;
  const w = Math.max(4, size * 0.18);
  const color = showFeedback ? (isCorrect ? "#22C55E" : "#4F6EF7") : "#4F6EF7";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {showFeedback && <rect x={0} y={0} width={size} height={size} fill={isCorrect?"rgba(34,197,94,0.08)":"rgba(79,110,247,0.05)"} rx={6}/>}
      {cell.connections[0] && <rect x={c-w/2} y={0} width={w} height={c+w/2} fill={color} rx={w/3}/>}
      {cell.connections[1] && <rect x={c-w/2} y={c-w/2} width={size-c+w/2} height={w} fill={color} rx={w/3}/>}
      {cell.connections[2] && <rect x={c-w/2} y={c-w/2} width={w} height={size-c+w/2} fill={color} rx={w/3}/>}
      {cell.connections[3] && <rect x={0} y={c-w/2} width={c+w/2} height={w} fill={color} rx={w/3}/>}
      <circle cx={c} cy={c} r={w*0.85} fill={color}/>
      {cell.connections[0] && <circle cx={c} cy={2} r={w*0.4} fill={color} opacity={0.6}/>}
      {cell.connections[1] && <circle cx={size-2} cy={c} r={w*0.4} fill={color} opacity={0.6}/>}
      {cell.connections[2] && <circle cx={c} cy={size-2} r={w*0.4} fill={color} opacity={0.6}/>}
      {cell.connections[3] && <circle cx={2} cy={c} r={w*0.4} fill={color} opacity={0.6}/>}
    </svg>
  );
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

function LogicPathPageInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [board, setBoard] = useState<LogicBoard | null>(null);
  const [grid, setGrid] = useState<PipeCell[][]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
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
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const pausedRef = useRef(false);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
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
    setElapsed("00:00"); setHintsUsed(0); setShowFeedback(false);
    setSolutionRevealed(false);
    setNextUncompleted(null);
    if (timerRef.current) clearInterval(timerRef.current);
    pausedRef.current = false;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) setElapsed(formatElapsed(xp.startTime));
    }, 1000);
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

  // ── Show Solution ──────────────────────────────────────────────────────────
  function handleRevealSolution() {
    if (!board || !xpState) return;
    // Copy solution grid with all cells locked so they can't be rotated
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
    const ng = grid.map(row => row.map(cell => ({ ...cell, connections: [...cell.connections] as [boolean,boolean,boolean,boolean] })));
    ng[r][c] = rotatePipe(ng[r][c]);
    setGrid(ng);
    saveGameState("logic-path", {stage, grid: ng, hintsUsed, startTime: xpState?.startTime, savedAt: Date.now()});
    playClick();
    if (checkLogicPath(ng) && xpState) {
      const earned = Math.max(1, finalizeXP(xpState) - hintsUsed * HINT_XP_COST);
      setFinalXP(earned); setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
      markStageCompleted("logic-path",stage);
      if (user) { updateStreak(user.id); saveScore({ user_id:user.id, game_slug:"logic-path", stage_number:stage, difficulty:getDifficulty(stage), xp_earned:earned, time_taken:Math.floor((Date.now()-xpState.startTime)/1000) }); }
    }
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
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
    }
  }

  if (!board || !xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--text4)", fontSize:13 }}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW = typeof window!=="undefined" ? Math.min(window.innerWidth-48, 400) : 340;
  const cellSize = Math.floor((maxW - (board.size-1)*8) / board.size);
  const currentXP = calculateXP(xpState).currentXP;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <Navbar/>
      <GamePageSchema slug="logic-path" />
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:16 }}>

        <div style={{ width:"100%", maxWidth:480, background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"16px 20px", boxShadow:"var(--shadow-sm)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Link href="/games" style={{ color:"var(--text4)", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}><ArrowLeft size={14}/> Games</Link>
              <div style={{ width:1, height:16, background:"var(--border)" }}/>
              <span style={{ fontSize:20, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:`${diffColor}15`, color:diffColor }}>{diff.toUpperCase()} · {board.size}×{board.size}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:12, color:"var(--text4)", fontFamily:"monospace" }}>{elapsed}</span>
              <button onClick={() => loadStage(stage)} style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", color:"var(--text4)", display:"flex" }}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{ fontSize:12, color:"var(--text3)", textAlign:"center", maxWidth:340, lineHeight:1.6 }}>
          Click any pipe to rotate it 90°. Make all connections match between neighbors. No open ends at borders.
        </div>

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"8px 20px",borderRadius:12,background:"rgba(239,68,68,0.08)",border:"0.5px solid rgba(239,68,68,0.2)",fontSize:13,fontWeight:600,color:"#EF4444"}}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        <div style={{ display:"flex", gap:16, fontSize:11, color:"var(--text4)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:16, height:16, borderRadius:4, background:"rgba(79,110,247,0.1)", border:"1.5px solid #4F6EF7", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:8, height:2, background:"#4F6EF7", borderRadius:1 }}/>
            </div>
            Pipe segment
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:16, height:16, borderRadius:4, background:"rgba(34,197,94,0.1)", border:"1.5px solid #22C55E" }}/>
            Correct
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}><Lock size={11}/> Locked</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:`repeat(${board.size},${cellSize}px)`, gap:8, background:"var(--bg2)", borderRadius:16, padding:12, border:"1.5px solid var(--border)", boxShadow:"var(--shadow-md)" }}>
          {grid.map((row, r) => row.map((cell, c) => {
            const correct = isCellCorrect(grid, board.solution, r, c);
            return (
              <motion.div key={`${r}-${c}`}
                whileTap={!cell.locked&&!solutionRevealed?{scale:0.88}:{}}
                onClick={() => handleRotate(r, c)}
                style={{
                  width:cellSize, height:cellSize, borderRadius:10,
                  background: cell.locked ? (solutionRevealed?"rgba(239,68,68,0.05)":"var(--bg3)")
                    : showFeedback&&correct ? "rgba(34,197,94,0.08)" : "var(--surface)",
                  border:`1.5px solid ${cell.locked?(solutionRevealed?"rgba(239,68,68,0.2)":"var(--border2)"):showFeedback&&correct?"#86EFAC":"var(--border)"}`,
                  cursor: cell.locked||solutionRevealed ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  position:"relative", transition:"all 0.15s",
                }}>
                <PipeSVG cell={cell} size={cellSize-8} isCorrect={showFeedback?correct:undefined} showFeedback={showFeedback}/>
                {cell.locked && <div style={{ position:"absolute", top:3, right:3 }}><Lock size={8} color={solutionRevealed?"#EF4444":"var(--text4)"}/></div>}
              </motion.div>
            );
          }))}
        </div>

        <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap", justifyContent:"center" }}>
          <HintButton hintsLeft={MAX_HINTS-hintsUsed} xpCost={HINT_XP_COST} onUseHint={handleHint} disabled={completed||solutionRevealed}/>
          {!solutionRevealed&&(
            <button onClick={() => setShowFeedback(f => !f)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:20, border:"0.5px solid var(--border2)", background:showFeedback?"rgba(34,197,94,0.08)":"var(--surface)", fontSize:12, fontWeight:600, color:showFeedback?"#22C55E":"var(--text3)", cursor:"pointer" }}>
              {showFeedback ? "Feedback On" : "Check Progress"}
            </button>
          )}
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

      <OutOfTokensModal gameName="Logic Path" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showResume && resumeData && (
        <ResumeModal
          gameSlug="logic-path"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
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
      {showMap&&<StageMap gameSlug="logic-path" totalStages={1000} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={diff} xpEarned={finalXP} elapsed={elapsed}
        onRetry={() => loadStage(stage)} onNext={() => { setCompleted(false); setStage(s => s+1); }}
        onShare={() => { const text=`MindElement · Logic Path Stage ${stage} · ${finalXP} XP · ${elapsed}`; if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{}); else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank"); }}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Logic Path"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />

    </div>
  );
}
export default function LogicPathPage(){return<ErrorBoundary game="logic-path"><LogicPathPageInner/></ErrorBoundary>;}