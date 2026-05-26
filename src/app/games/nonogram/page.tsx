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
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{
      setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));
      setLiveXP(calculateXP(xp).currentXP);
    },500);
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
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
        onCheck={()=>{}}
      >
        <GamePageSchema slug="nonogram" />

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"8px 20px",borderRadius:12,background:"rgba(255,68,68,0.08)",border:"0.5px solid rgba(255,68,68,0.2)",fontSize:13,fontWeight:600,color:"var(--color-error)"}}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
          <div style={{display:"flex",marginLeft:CLUE_W}}>
            {board.colClues.map((clue,c)=>(
              <div key={c} style={{width:cellSize,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",paddingBottom:4,minHeight:40}}>
                {clue.map((n,i)=>(
                  <span key={i} style={{fontSize:Math.min(cellSize*0.4,11),fontWeight:700,color:"var(--color-text-secondary)",lineHeight:1.3}}>{n}</span>
                ))}
              </div>
            ))}
          </div>
          {board.solution.map((_,r)=>(
            <div key={r} style={{display:"flex",alignItems:"center"}}>
              <div style={{width:CLUE_W,display:"flex",justifyContent:"flex-end",alignItems:"center",gap:3,paddingRight:6,minHeight:cellSize}}>
                {board.rowClues[r].map((n,i)=>(
                  <span key={i} style={{fontSize:Math.min(12,cellSize*0.45),fontWeight:700,color:"var(--color-text-secondary)"}}>{n}</span>
                ))}
              </div>
              {board.solution[r].map((_,c)=>{
                const val=grid[r]?.[c];
                const isSol = solutionRevealed && board.solution[r][c] === true;
                return(
                  <motion.button key={c} onClick={()=>handleCell(r,c)} whileTap={solutionRevealed?{}:{scale:0.9}}
                    style={{width:cellSize,height:cellSize,display:"flex",alignItems:"center",justifyContent:"center",
                      background:isSol?"rgba(255,68,68,0.15)":val===true?"#1C1917":val===false?"#FEF2F2":"white",
                      borderRight:"0.5px solid #E2E8F0",borderBottom:"0.5px solid #E2E8F0",borderTop:"none",borderLeft:"none",
                      cursor:solutionRevealed?"default":"pointer",outline:"none",transition:"background 0.1s"}}>
                    {val===true&&<span style={{width:cellSize-4,height:cellSize-4,display:"block",background:isSol?"var(--color-error)":"#1C1917",borderRadius:1}}/>}
                    {val===false&&!solutionRevealed&&<span style={{fontSize:Math.round(cellSize*0.6),color:"var(--color-error)",fontWeight:900,lineHeight:1,userSelect:"none"}}>✕</span>}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Stage {stage} of 100</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </GameShell>

      {showResume && resumeData && (
        <ResumeModal
          gameSlug="nonogram"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
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