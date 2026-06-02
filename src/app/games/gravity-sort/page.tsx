"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "gravity-sort";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef, Suspense }from"react";
import{useSearchParams}from"next/navigation";
import{motion,AnimatePresence}from"framer-motion";
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
import { useSettingsStore } from "@/store/settingsStore";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(s:number):Difficulty{if(s===1)return"medium";const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;return h<20?"easy":h<70?"medium":"hard";}

function GravitySortPageInner(){
  const{user}=useAuthStore();
  const { theme } = useSettingsStore();
  const searchParams=useSearchParams();
  const isDaily=searchParams.get("daily")==="1";
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
    ()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xpState.startTime)/1000));if (!useSettingsStore.getState().isPracticeMode) setLiveXP(calculateXP(xpState).currentXP);},500);}}
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
    timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));if (!useSettingsStore.getState().isPracticeMode) setLiveXP(calculateXP(xp).currentXP);},500);
    if(user&&!isDaily){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
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

  const gap=10;
  const blockSize=Math.min(56,Math.floor((boardWidth-(board.cols-1)*gap)/board.cols));

  const boardBg = theme === "dark"
    ? `radial-gradient(circle, rgba(0,255,255,0.09) 1px, transparent 1px), #060d18`
    : theme === "light"
    ? `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px), #f8f9fb`
    : `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px), #f5f0e8`;

  const navBtnStyle = {
    padding: "8px 18px", borderRadius: 10,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    cursor: "pointer", fontSize: 11,
    fontFamily: "var(--font-mono)",
    color: "var(--color-text-secondary)",
    fontWeight: 600, letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  };

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Gravity Sort"
        stageNumber={stage}
        difficulty={getDifficulty(stage)}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug={GAME_SLUG} />
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"16px 16px 32px"}}>

          <div style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",letterSpacing:"0.05em"}}>
            MOVES {moves} · CLICK COLUMN TO LIFT TOP BALL · CLICK AGAIN TO DROP
          </div>

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"10px 20px",borderRadius:12,background:"color-mix(in srgb, var(--color-error) 8%, transparent)",border:"0.5px solid color-mix(in srgb, var(--color-error) 20%, transparent)",fontSize:12,fontWeight:600,color:"var(--color-error)",textAlign:"center",maxWidth:400,fontFamily:"var(--font-mono)"}}>
              STRATEGY: MOVE TOP BALL TO ITS COLOR COLUMN · USE FREE COLUMNS AS BUFFERS
            </motion.div>
          )}

          <div style={{
            padding: 14, borderRadius: 18,
            background: boardBg, backgroundSize: "18px 18px",
            border: "1px solid color-mix(in srgb, var(--color-accent-primary) 14%, transparent)",
            boxShadow: theme === "dark"
              ? "0 0 0 1px rgba(0,255,255,0.03), 0 20px 64px rgba(0,0,0,0.5)"
              : "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <div style={{display:"flex",gap:gap,alignItems:"flex-end"}}>
              {blocks.map((col,ci)=>{
                const isSelected=selected===ci;
                const isSorted=col.length>0&&col.every(b=>b===ci)&&ci<board.colors.length;
                const check=checkState?.get(ci);
                const colColor = ci < board.colors.length ? board.colors[ci] : undefined;
                const borderColor=check==="correct"?"var(--color-accent-secondary)":check==="incorrect"?"var(--color-error)":isSelected?"var(--color-accent-primary)":isSorted?"var(--color-accent-secondary)":"var(--color-border)";
                return(
                  <motion.div key={ci}
                    onClick={()=>handleColClick(ci)}
                    animate={
                      isSorted && theme === "dark" ? {
                        y: 0,
                        boxShadow: [
                          `0 0 0 2px rgba(57,255,20,0.35), 0 4px 20px rgba(0,0,0,0.45)`,
                          `0 0 0 2px rgba(57,255,20,0.9), 0 0 20px rgba(57,255,20,0.28), 0 4px 20px rgba(0,0,0,0.45)`,
                          `0 0 0 2px rgba(57,255,20,0.35), 0 4px 20px rgba(0,0,0,0.45)`,
                        ],
                      } : isSelected ? {
                        y: -10,
                        boxShadow: `0 0 0 2px rgba(0,255,255,0.9), 0 0 18px rgba(0,255,255,0.22), 0 8px 24px rgba(0,0,0,0.45)`,
                      } : {
                        y: 0,
                        boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                      }
                    }
                    transition={isSorted && theme === "dark" ? {
                      boxShadow: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                      y: { type: "spring", stiffness: 400, damping: 25 },
                    } : { type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                      cursor: solutionRevealed ? "not-allowed" : "pointer",
                      display: "flex", flexDirection: "column-reverse", gap: 5,
                      width: blockSize,
                      minHeight: board.rows * blockSize + board.rows * 5,
                      background: theme === "dark"
                        ? isSelected ? "rgba(0,255,255,0.06)" : "rgba(6,13,24,0.7)"
                        : isSelected ? "color-mix(in srgb, var(--color-accent-primary) 6%, var(--color-surface))" : "var(--color-surface)",
                      borderRadius: 14, padding: 6,
                      border: `2px solid ${borderColor}`,
                      transition: "border-color 0.2s, background 0.2s",
                      position: "relative", flexShrink: 0,
                      opacity: solutionRevealed ? 0.8 : 1,
                    }}>
                    {colColor && (
                      <div style={{
                        position: "absolute", bottom: -12, left: "50%", transform: "translateX(-50%)",
                        width: blockSize * 0.55, height: 4, borderRadius: 2,
                        background: colColor,
                        opacity: 0.65,
                        boxShadow: theme === "dark" ? `0 0 6px ${colColor}99` : "none",
                      }}/>
                    )}
                    {col.map((block,bi)=>(
                      <motion.div key={`${ci}-${bi}`}
                        initial={{scale:0.7,opacity:0}}
                        animate={{scale:1,opacity:1}}
                        transition={{type:"spring",stiffness:400,damping:25}}
                        style={{
                          width: blockSize - 12, height: blockSize - 12,
                          borderRadius: "50%",
                          background: board.colors[block],
                          alignSelf: "center",
                          boxShadow: theme === "dark"
                            ? `0 0 ${blockSize / 3}px ${board.colors[block]}cc, 0 0 ${blockSize / 6}px ${board.colors[block]}, 0 3px 8px rgba(0,0,0,0.4)`
                            : `0 3px 10px ${board.colors[block]}60`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, position: "relative",
                        }}>
                        {bi === col.length - 1 && isSelected && (
                          <span style={{fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 700}}>↑</span>
                        )}
                      </motion.div>
                    ))}
                    {isSorted && (
                      <div style={{
                        position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                        fontSize: 12, color: "var(--color-accent-secondary)",
                        fontFamily: "var(--font-mono)", fontWeight: 700,
                      }}>✓</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
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
export default function GravitySortPage(){return<ErrorBoundary game="gravity-sort"><Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100dvh",background:"var(--color-bg)",color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",fontSize:14}}>Loading...</div>}><GravitySortPageInner/></Suspense></ErrorBoundary>;}
