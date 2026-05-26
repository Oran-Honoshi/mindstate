"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "gravity-sort";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ChevronRight}from"lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { useBoardWidth } from "@/hooks/useScreenWidth";
import{generateGravitySort,checkGravitySort,type GravityBoard}from"@/lib/games/gravitySortGenerator";
import{createXPState,calculateXP,finalizeXP,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(s:number):Difficulty{if(s===1)return"medium";const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;return h<20?"easy":h<70?"medium":"hard";}

function GravitySortPageInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[board,setBoard]=useState<GravityBoard|null>(null);
  const[blocks,setBlocks]=useState<number[][]>([]);
  const[selected,setSelected]=useState<number|null>(null);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[completed,setCompleted]=useState(false);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[finalXP,setFinalXP]=useState(0);
  const[moves,setMoves]=useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const[history,setHistory]=useState<{blocks:number[][];moves:number}[]>([]);
  const[checkState,setCheckState]=useState<Map<number,"correct"|"incorrect">|null>(null);
  const checkTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const boardWidth=useBoardWidth(32,460);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xpState.startTime)/1000));setLiveXP(calculateXP(xpState).currentXP);},500);}}
  );

  const loadStage=useCallback((s:number)=>{
    saveGameState("gravity-sort",{stage:s,savedAt:Date.now()});
    const diff=getDifficulty(s);
    const b=generateGravitySort(`gravity-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setBlocks(b.blocks.map(col=>[...col]));setSelected(null);
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);
    setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");setMoves(0);
    setSolutionRevealed(false);
    setHistory([]);
    setCheckState(null);
    if(checkTimerRef.current){clearTimeout(checkTimerRef.current);checkTimerRef.current=null;}
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));setLiveXP(calculateXP(xp).currentXP);},500);
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleRevealSolution(){
    if(!xpState)return;
    setSolutionRevealed(true);
    setSelected(null);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  function handleHint(){
    if(!board||!xpState||hintsUsed>=3||completed||solutionRevealed)return;
    for(let fromCol=0;fromCol<blocks.length;fromCol++){
      const col=blocks[fromCol];
      if(col.length===0)continue;
      const topBlock=col[col.length-1];
      if(fromCol===topBlock)continue;
      const toCol=topBlock;
      if(blocks[toCol].length<board.rows){
        setSelected(fromCol);
        setTimeout(()=>{
          const nb=blocks.map((c:number[])=>[...c]);
          const block=nb[fromCol].pop()!;
          nb[toCol].push(block);
          setBlocks(nb);setSelected(null);setMoves(m=>m+1);playError();
        },600);
        setHintsUsed(h=>h+1);
        setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
        return;
      }
    }
    setHintsUsed(h=>h+1);
    setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
  }

  function handleUndo(){
    if(history.length===0)return;
    const last=history[history.length-1];
    setBlocks(last.blocks);setMoves(last.moves);setSelected(null);
    setHistory(h=>h.slice(0,-1));
    playClick();
  }

  function handleCheck(){
    if(!board||completed||solutionRevealed)return;
    const result=new Map<number,"correct"|"incorrect">();
    blocks.forEach((col,ci)=>{
      if(ci>=board.colors.length){
        result.set(ci,col.length===0?"correct":"incorrect");
        return;
      }
      const sorted=col.length>0&&col.every(b=>b===ci);
      result.set(ci,sorted?"correct":"incorrect");
    });
    setCheckState(result);
    playClick();
    if(checkTimerRef.current)clearTimeout(checkTimerRef.current);
    checkTimerRef.current=setTimeout(()=>setCheckState(null),2000);
  }

  function handleColClick(col:number){
    if(!board||completed||solutionRevealed)return;
    if(selected===null){if(blocks[col].length===0)return;setSelected(col);playClick();}
    else{
      if(selected===col){setSelected(null);return;}
      if(blocks[col].length>=board.rows){playError();setSelected(null);return;}
      if(blocks[selected].length===0){setSelected(col);return;}
      setHistory(h=>[...h.slice(-19),{blocks:blocks.map(c=>[...c]),moves}]);
      const nb=blocks.map(c=>[...c]);const block=nb[selected].pop()!;nb[col].push(block);
      setBlocks(nb);setSelected(null);setMoves(m=>m+1);playClick();
      if(checkGravitySort(board,nb)&&xpState){
        const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
        setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
        clearGameState("gravity-sort");if(timerRef.current)clearInterval(timerRef.current);
        playSuccess();setTimeout(()=>triggerConfetti(),80);markStageCompleted("gravity-sort",stage);
        if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"gravity-sort",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});}
      }
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--color-text-secondary)",fontSize:13}}>Generating board...</p></div>);

  const gap=8;
  const blockSize=Math.min(56,Math.floor((boardWidth-(board.cols-1)*gap)/board.cols));

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Gravity Sort"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug={GAME_SLUG} />
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20,padding:"16px 16px 32px"}}>
          <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>Moves: {moves}</div>

          {!solutionRevealed&&<div style={{fontSize:11,color:"var(--color-text-secondary)",textAlign:"center"}}>Click a column to pick up its top block · Click another to drop it<br/>Sort each color into its own column</div>}

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"10px 20px",borderRadius:12,background:"rgba(255,68,68,0.08)",border:"0.5px solid rgba(255,68,68,0.2)",fontSize:13,fontWeight:600,color:"var(--color-error)",textAlign:"center",maxWidth:400}}>
              Strategy: Move top block to its matching color column · Use free columns as buffers · XP set to 1
            </motion.div>
          )}

          <div style={{display:"flex",gap:gap,flexWrap:"wrap",justifyContent:"center"}}>
            {board.colors.map((color,i)=>(<div key={i} style={{width:blockSize,textAlign:"center"}}><div style={{width:blockSize,height:6,borderRadius:3,background:color,opacity:0.4,marginBottom:2}}/><span style={{fontSize:9,color:"var(--color-text-secondary)"}}>col {i+1}</span></div>))}
            {Array.from({length:board.cols-board.colors.length},(_,i)=>(<div key={`e-${i}`} style={{width:blockSize,textAlign:"center"}}><div style={{width:blockSize,height:6,borderRadius:3,background:"#E2E8F0",marginBottom:2}}/><span style={{fontSize:9,color:"var(--color-text-secondary)"}}>free</span></div>))}
          </div>

          <div style={{display:"flex",gap:gap,alignItems:"flex-end",maxWidth:"100%",overflow:"hidden"}}>
            {blocks.map((col,ci)=>{
              const isSelected=selected===ci;
              const isSorted=col.length>0&&col.every(b=>b===ci)&&ci<board.colors.length;
              const check=checkState?.get(ci);
              const borderColor=check==="correct"?"var(--color-accent-secondary)":check==="incorrect"?"var(--color-error)":isSelected?"var(--color-accent-primary)":isSorted?"#22C55E":"#E2E8F0";
              return(
                <motion.div key={ci} onClick={()=>handleColClick(ci)} animate={isSelected?{y:-8}:{y:0}} transition={{type:"spring",stiffness:400,damping:25}}
                  style={{cursor:solutionRevealed?"not-allowed":"pointer",display:"flex",flexDirection:"column-reverse",gap:4,width:blockSize,minHeight:board.rows*blockSize+board.rows*4,background:isSelected?"rgba(0,255,255,0.06)":"#F8F7F5",borderRadius:14,padding:6,border:`2px solid ${borderColor}`,transition:"border-color 0.2s,background 0.2s",position:"relative",flexShrink:0,opacity:solutionRevealed?0.8:1}}>
                  {col.map((block,bi)=>(<motion.div key={`${ci}-${bi}`} initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:400,damping:25}} style={{width:"100%",height:blockSize-12,borderRadius:10,background:board.colors[block],boxShadow:`0 3px 10px ${board.colors[block]}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{bi===col.length-1&&isSelected&&"↑"}</motion.div>))}
                  {isSorted&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",fontSize:16}}>✓</div>}
                </motion.div>
              );
            })}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>← Prev</button>
            <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Stage {stage} of {TOTAL_STAGES}</span>
            <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
          </div>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Gravity Sort" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showMap&&<StageMap gameSlug="gravity-sort" totalStages={TOTAL_STAGES} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Gravity Sort Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Gravity Sort"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function GravitySortPage(){return<ErrorBoundary game="gravity-sort"><GravitySortPageInner/></ErrorBoundary>;}