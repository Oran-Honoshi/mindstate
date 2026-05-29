"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "nonogram";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { generateNonogram, checkNonogram, type NonogramBoard } from "@/lib/games/nonogramGenerator";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";
import { useSettingsStore } from "@/store/settingsStore";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
}

function NonogramGameInner() {
  const{user}=useAuthStore();
  const { theme } = useSettingsStore();
  const searchParams = useSearchParams();
  const isDaily = searchParams.get("daily") === "1";
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[board,setBoard]=useState<NonogramBoard|null>(null);
  const[grid,setGrid]=useState<(boolean|null)[][]>([]);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[completed,setCompleted]=useState(false);
  const[showResume,setShowResume]=useState(false);
  const[resumeData,setResumeData]=useState<Record<string,unknown>|null>(null);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[finalXP,setFinalXP]=useState(0);
  const [gridHistory, setGridHistory] = useState<(boolean|null)[][][]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [checkState, setCheckState] = useState<Map<string, "correct" | "incorrect"> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => {
      if (xpState && !completed) {
        timerRef.current = setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - xpState.startTime) / 1000));
          setLiveXP(calculateXP(xpState).currentXP);
        }, 500);
      }
    }
  );

  const loadStage=useCallback((s:number)=>{
    saveGameState("nonogram", {stage: s, savedAt: Date.now()});
    const diff=getDifficulty(s);
    const b=generateNonogram(`nono-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setGrid(Array.from({length:b.size},()=>Array(b.size).fill(null)));
    setGridHistory([]);
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);
    setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");
    setSolutionRevealed(false);
    setCheckState(null);
    if (checkTimerRef.current) { clearTimeout(checkTimerRef.current); checkTimerRef.current = null; }
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{
      setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));
      setLiveXP(calculateXP(xp).currentXP);
    },500);
    if(user&&!isDaily){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  },[user]);

  const resumeChecked = useRef(false);

  useEffect(()=>{
    if(!resumeChecked.current){
      resumeChecked.current=true;
      const saved=loadGameState("nonogram");
      if(saved&&(saved.stage as number)>1){setResumeData(saved);setShowResume(true);return;}
    }
    loadStage(stage);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[stage,loadStage]);

  function handleRevealSolution() {
    if (!board || !xpState) return;
    setGrid(board.solution.map(row => row.map(v => v)));
    setSolutionRevealed(true);
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleCell(r:number,c:number){
    if(!board||completed||solutionRevealed)return;
    const ng=grid.map(row=>[...row]);
    if(ng[r][c]===null) ng[r][c]=true;
    else if(ng[r][c]===true) ng[r][c]=false;
    else ng[r][c]=null;
    setGridHistory(h=>[...h.slice(-19),grid.map(r=>[...r])]);
    setGrid(ng);
    saveGameState("nonogram", {stage, grid: ng, hintsUsed, startTime: xpState?.startTime, savedAt: Date.now()});
    playClick();
    if(checkNonogram(board,ng)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);
      setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
      setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      markStageCompleted("nonogram",stage);
      if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if(user)saveScore({user_id:user.id,game_slug:"nonogram",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});
    }
  }

  function handleUndo() {
    if (gridHistory.length === 0) return;
    setGrid(gridHistory[gridHistory.length-1]);
    setGridHistory(h => h.slice(0,-1));
  }

  function handleCheck() {
    if (!board || completed || solutionRevealed) return;
    const result = new Map<string, "correct" | "incorrect">();
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        if (grid[r][c] === true) {
          result.set(`${r},${c}`, board.solution[r][c] === true ? "correct" : "incorrect");
        }
      }
    }
    setCheckState(result);
    playClick();
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => setCheckState(null), 2000);
  }

  function handleHint() {
    if (!board || !xpState || hintsUsed >= 3 || solutionRevealed) return;
    for (let r = 0; r < board.size; r++) {
      if (grid[r].every(v => v === null)) {
        const ng = grid.map(row => [...row]);
        ng[r] = board.solution[r].map(v => v);
        setGrid(ng);
        setHintsUsed(h => h + 1);
        setXpState(prev => prev ? {...prev, hintsUsed: Math.min(prev.hintsUsed + 1, prev.maxHints)} : prev);
        playError();
        return;
      }
    }
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        if (grid[r][c] === null) {
          const ng = grid.map(row => [...row]);
          ng[r][c] = board.solution[r][c];
          setGrid(ng);
          setHintsUsed(h => h + 1);
          setXpState(prev => prev ? {...prev, hintsUsed: Math.min(prev.hintsUsed + 1, prev.maxHints)} : prev);
          playError();
          return;
        }
      }
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--color-text-secondary)",fontSize:13}}>Generating puzzle...</p></div>);

  const diff=getDifficulty(stage);
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const CLUE_W=Math.min(60,maxW*0.25);
  const cellSize=Math.floor((maxW-CLUE_W)/board.size);
  const cellBorder = theme==="dark" ? "rgba(255,255,255,0.06)" : "var(--color-border)";

  // Compute completed rows and cols for mint flash
  const completedRows = new Set<number>();
  const completedCols = new Set<number>();
  if (!solutionRevealed) {
    for (let r = 0; r < board.size; r++) {
      if (grid[r]?.every((v, c) => v === board.solution[r][c])) completedRows.add(r);
    }
    for (let c = 0; c < board.size; c++) {
      if (board.solution.every((row, r) => grid[r]?.[c] === row[c])) completedCols.add(c);
    }
  }

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Nonogram"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug="nonogram" />

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"8px 20px",borderRadius:12,background:"color-mix(in srgb, var(--color-error) 8%, transparent)",border:"0.5px solid color-mix(in srgb, var(--color-error) 20%, transparent)",fontSize:12,fontWeight:600,color:"var(--color-error)",fontFamily:"var(--font-mono)"}}>
            SOLUTION REVEALED · XP SET TO 1 · RETRY TO SCORE
          </motion.div>
        )}

        <div style={{
          padding: 10, borderRadius: 16,
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
          display: "inline-block",
        }}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
            <div style={{display:"flex",marginLeft:CLUE_W}}>
              {board.colClues.map((clue,c)=>{
                const isDoneCol = completedCols.has(c);
                return (
                  <div key={c} style={{width:cellSize,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",paddingBottom:4,minHeight:40}}>
                    {clue.map((n,i)=>(
                      <span key={i} style={{
                        fontSize:Math.min(cellSize*0.4,11),fontWeight:700,
                        color: isDoneCol ? "var(--color-accent-secondary)" : "var(--color-text-secondary)",
                        lineHeight:1.3,fontFamily:"var(--font-mono)",
                        transition:"color 0.3s",
                      }}>{n}</span>
                    ))}
                  </div>
                );
              })}
            </div>
            {board.solution.map((_,r)=>{
              const isDoneRow = completedRows.has(r);
              return (
                <div key={r} style={{display:"flex",alignItems:"center"}}>
                  <div style={{width:CLUE_W,display:"flex",justifyContent:"flex-end",alignItems:"center",gap:3,paddingRight:6,minHeight:cellSize}}>
                    {board.rowClues[r].map((n,i)=>(
                      <span key={i} style={{
                        fontSize:Math.min(12,cellSize*0.45),fontWeight:700,
                        color: isDoneRow ? "var(--color-accent-secondary)" : "var(--color-text-secondary)",
                        fontFamily:"var(--font-mono)",transition:"color 0.3s",
                      }}>{n}</span>
                    ))}
                  </div>
                  {board.solution[r].map((_,c)=>{
                    const val=grid[r]?.[c];
                    const isSol = solutionRevealed && board.solution[r][c] === true;
                    const check = checkState?.get(`${r},${c}`);
                    const isDoneCol = completedCols.has(c);
                    const isCellDone = isDoneRow || isDoneCol;
                    const filledBg = check==="correct" ? "var(--color-accent-secondary)"
                      : check==="incorrect" ? "var(--color-error)"
                      : isSol ? "color-mix(in srgb, var(--color-error) 15%, var(--color-surface))"
                      : val===true ? (isCellDone ? "color-mix(in srgb, var(--color-accent-secondary) 30%, var(--color-accent-primary))" : "var(--color-accent-primary)")
                      : val===false ? "color-mix(in srgb, var(--color-error) 10%, var(--color-surface))"
                      : theme==="dark" ? "rgba(6,13,24,0.85)" : "var(--color-surface)";
                    return(
                      <motion.button key={c} onClick={()=>handleCell(r,c)}
                        whileTap={solutionRevealed?{}:{scale:0.88}}
                        style={{width:cellSize,height:cellSize,display:"flex",alignItems:"center",justifyContent:"center",
                          background: filledBg,
                          borderRight:`0.5px solid ${cellBorder}`,borderBottom:`0.5px solid ${cellBorder}`,borderTop:"none",borderLeft:"none",
                          cursor:solutionRevealed?"default":"pointer",outline:"none",transition:"background 0.25s"}}>
                        {val===true&&!check&&(
                          <span style={{
                            width:cellSize-4,height:cellSize-4,display:"block",
                            background:isSol?"var(--color-error)":isCellDone?"var(--color-accent-secondary)":"var(--color-accent-primary)",
                            borderRadius:2,
                            boxShadow: theme==="dark" && !isSol
                              ? (isCellDone
                                ? "0 0 8px 2px rgba(57,255,20,0.45)"
                                : "0 0 8px 2px rgba(0,255,255,0.35)")
                              : "none",
                            transition:"background 0.3s, box-shadow 0.3s",
                          }}/>
                        )}
                        {val===false&&!solutionRevealed&&(
                          <span style={{
                            fontSize:Math.round(cellSize*0.55),
                            color:"var(--color-error)",fontWeight:900,lineHeight:1,userSelect:"none",opacity:0.7,
                          }}>✕</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:4}}>
          <button onClick={()=>{ if(stage>1){ clearGameState(GAME_SLUG); setStage(s=>s-1); } }} disabled={stage===1} style={{padding:"8px 18px",borderRadius:10,border:"1px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:11,fontFamily:"var(--font-mono)",color:"var(--color-text-secondary)",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase" as const,opacity:stage===1?0.38:1}}>← PREV</button>
          <span style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",fontWeight:600,letterSpacing:"0.06em"}}>STAGE {stage}/{TOTAL_STAGES}</span>
          <button onClick={()=>{ clearGameState(GAME_SLUG); setStage(s=>s+1); }} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 18px",borderRadius:10,border:"1px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:11,fontFamily:"var(--font-mono)",color:"var(--color-text-secondary)",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase" as const}}>NEXT <ChevronRight size={12}/></button>
        </div>
      </GameShell>

      {showResume && resumeData && (
        <ResumeModal
          gameSlug="nonogram"
          stageNumber={resumeData.stage as number}
          savedAt={resumeData.savedAt as number}
          onDismiss={() => { setShowResume(false); setResumeData(null); }}
          onResume={()=>{
            const s=resumeData!;
            setShowResume(false);setResumeData(null);
            setStage(s.stage as number);
            if(s.grid)setTimeout(()=>setGrid(s.grid as (boolean|null)[][]),150);
          }}
          onStartFresh={()=>{
            clearGameState("nonogram");setShowResume(false);setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="nonogram" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Nonogram Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Nonogram"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function NonogramGame(){return<ErrorBoundary game="nonogram"><NonogramGameInner/></ErrorBoundary>;}