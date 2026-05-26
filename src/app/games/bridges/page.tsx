"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "bridges";
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
import { generateBridges, checkBridges, type BridgesBoard, type Bridge } from "@/lib/games/bridgesGenerator";
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

function getDifficulty(s:number):Difficulty{
  if(s===1)return"medium";
  const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;
  return h<20?"easy":h<70?"medium":"hard";
}

function BridgesGameInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[board,setBoard]=useState<BridgesBoard|null>(null);
  const[placed,setPlaced]=useState<Bridge[]>([]);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[completed,setCompleted]=useState(false);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showResume,setShowResume]=useState(false);
  const[resumeData,setResumeData]=useState<Record<string,unknown>|null>(null);
  const[finalXP,setFinalXP]=useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - xpState.startTime) / 1000));
        setLiveXP(calculateXP(xpState).currentXP);
      }, 500);
    }}
  );

  const loadStage=useCallback((s:number)=>{
    saveGameState("bridges", {stage: s, savedAt: Date.now()});
    const diff=getDifficulty(s);
    const b=generateBridges(`bridges-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setPlaced([]);setXpState(xp);setCompleted(false);setFinalXP(0);
    setHintsUsed(0);setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");setSolutionRevealed(false);
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
      const saved=loadGameState("bridges");
      if(saved&&(saved.stage as number)>1){setResumeData(saved);setShowResume(true);return;}
    }
    loadStage(stage);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[stage,loadStage]);

  function handleRevealSolution(){
    if(!board||!xpState)return;
    setPlaced([...board.solution]);
    setSolutionRevealed(true);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  function toggleBridge(fromId:number,toId:number){
    if(!board||completed||solutionRevealed)return;
    const existing=placed.find(b=>(b.from===fromId&&b.to===toId)||(b.from===toId&&b.to===fromId));
    let np:Bridge[];
    if(!existing) np=[...placed,{from:fromId,to:toId,count:1}];
    else if(existing.count===1) np=placed.map(b=>b===existing?{...b,count:2 as 2}:b);
    else np=placed.filter(b=>b!==existing);
    setPlaced(np);
    saveGameState("bridges",{stage,placed:np,hintsUsed,startTime:xpState?.startTime,savedAt:Date.now()});
    playClick();
    if(checkBridges(board,np)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
      setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      markStageCompleted("bridges",stage);
      if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if(user)saveScore({user_id:user.id,game_slug:"bridges",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});
    }
  }

  function handleHint(){
    if(!board||!xpState||completed||hintsUsed>=3||solutionRevealed)return;
    for(const sol of board.solution){
      const existing=placed.find(b=>(b.from===sol.from&&b.to===sol.to)||(b.from===sol.to&&b.to===sol.from));
      if(!existing){
        setPlaced(prev=>[...prev,{from:sol.from,to:sol.to,count:1}]);
        setHintsUsed(h=>h+1);
        setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
        playError();return;
      }
      if(existing.count<sol.count){
        setPlaced(prev=>prev.map(b=>(b.from===sol.from&&b.to===sol.to)||(b.from===sol.to&&b.to===sol.from)?{...b,count:sol.count}:b));
        setHintsUsed(h=>h+1);
        setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
        playError();return;
      }
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--color-text-secondary)",fontSize:13}}>Generating board...</p></div>);

  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const cellSize=Math.floor(maxW/board.size);

  function getBridgeBetween(a:number,b:number){return placed.find(br=>(br.from===a&&br.to===b)||(br.from===b&&br.to===a));}
  function islandStatus(island:{required:number;id:number}){
    const total=placed.filter(b=>b.from===island.id||b.to===island.id).reduce((s,b)=>s+b.count,0);
    return total===island.required?"done":total>island.required?"over":"under";
  }

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Bridges"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={()=>{}}
        onHint={handleHint}
        onCheck={()=>{}}
      >
        <GamePageSchema slug={GAME_SLUG} />
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"16px 16px 32px"}}>
          <div style={{fontSize:11,color:"var(--color-text-secondary)"}}>Click between islands to add bridges · Each island shows its required count</div>

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"8px 20px",borderRadius:12,background:"rgba(255,68,68,0.08)",border:"0.5px solid rgba(255,68,68,0.2)",fontSize:13,fontWeight:600,color:"var(--color-error)"}}>
              Solution revealed · XP set to 1 · Retry to score properly
            </motion.div>
          )}

          <svg width={board.size*cellSize} height={board.size*cellSize}
            style={{borderRadius:16,border:"1.5px solid #E2E8F0",background:"#FAFAF9",boxShadow:"0 8px 24px rgba(0,0,0,0.07)"}}>
            {board.islands.map(island=>board.islands.map(other=>{
              if(other.id<=island.id)return null;
              const sameRow=island.r===other.r,sameCol=island.c===other.c;
              if(!sameRow&&!sameCol)return null;
              const blocked=board.islands.some(mid=>{
                if(mid.id===island.id||mid.id===other.id)return false;
                if(sameRow&&mid.r===island.r&&Math.min(island.c,other.c)<mid.c&&mid.c<Math.max(island.c,other.c))return true;
                if(sameCol&&mid.c===island.c&&Math.min(island.r,other.r)<mid.r&&mid.r<Math.max(island.r,other.r))return true;
                return false;
              });
              if(blocked)return null;
              const bridge=getBridgeBetween(island.id,other.id);
              const x1=(island.c+0.5)*cellSize,y1=(island.r+0.5)*cellSize;
              const x2=(other.c+0.5)*cellSize,y2=(other.r+0.5)*cellSize;
              const midX=(x1+x2)/2,midY=(y1+y2)/2;
              const bridgeColor=solutionRevealed?"var(--color-error)":"#374151";
              return(
                <g key={`${island.id}-${other.id}`} onClick={()=>toggleBridge(island.id,other.id)} style={{cursor:solutionRevealed?"default":"pointer"}}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={cellSize*0.7}/>
                  {bridge&&(
                    <>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={bridgeColor} strokeWidth={bridge.count===2?3:2} opacity={0.7}/>
                      {bridge.count===2&&<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FAFAF9" strokeWidth={1}/>}
                    </>
                  )}
                  {!bridge&&!solutionRevealed&&<circle cx={midX} cy={midY} r={cellSize*0.12} fill="#E2E8F0" opacity={0.6}/>}
                </g>
              );
            }))}
            {board.islands.map(island=>{
              const status=islandStatus(island);
              const x=(island.c+0.5)*cellSize,y=(island.r+0.5)*cellSize;
              const r=cellSize*0.3;
              const bgColor=status==="done"?"#22C55E":status==="over"?"var(--color-error)":"var(--color-accent-primary)";
              return(
                <g key={island.id}>
                  <circle cx={x} cy={y} r={r} fill={bgColor} opacity={status==="done"?1:0.85}/>
                  <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
                    style={{fontSize:Math.round(r*1.1),fontWeight:700,fill:"white",userSelect:"none"}}>
                    {island.required}
                  </text>
                </g>
              );
            })}
          </svg>

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>← Prev</button>
            <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Stage {stage} of {TOTAL_STAGES}</span>
            <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
          </div>
        </div>
      </GameShell>

      {showResume && resumeData && (
        <ResumeModal
          gameSlug="bridges"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={()=>{
            const s=resumeData!;
            setShowResume(false);setResumeData(null);
            setStage(s.stage as number);
            if(s.placed)setTimeout(()=>setPlaced(s.placed as Bridge[]),150);
          }}
          onStartFresh={()=>{
            clearGameState("bridges");setShowResume(false);setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="bridges" totalStages={TOTAL_STAGES} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Bridges Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Bridges"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function BridgesGame(){return<ErrorBoundary game="bridges"><BridgesGameInner/></ErrorBoundary>;}