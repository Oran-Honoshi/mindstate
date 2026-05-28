"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "lightup";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
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
import{generateLightUp,computeLighting,checkLightUp,type LightBoard,type LightCell}from"@/lib/games/lightUpGenerator";
import{createXPState,calculateXP,finalizeXP,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{useSettingsStore}from"@/store/settingsStore";
import{consumeToken}from"@/lib/games/tokenEngine";
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

function LightUpPageInner(){
  const{user}=useAuthStore();
  const{theme}=useSettingsStore();
  const blackCellBg=theme==="dark"?"var(--color-surface-2)":"#374151";
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[board,setBoard]=useState<LightBoard|null>(null);
  const[grid,setGrid]=useState<LightCell[][]>([]);
  const[lighting,setLighting]=useState<ReturnType<typeof computeLighting>>({lit:new Set(),conflicts:new Set(),blackErrors:new Set()});
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
  const [gridHistory, setGridHistory] = useState<typeof grid[]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [checkState, setCheckState] = useState<Map<string, "correct" | "incorrect"> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    saveGameState("lightup", {stage: s, savedAt: Date.now()});
    const diff=getDifficulty(s);
    const b=generateLightUp(`light-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setGrid(b.grid.map(row=>[...row]));
    setGridHistory([]);
    setLighting({lit:new Set(),conflicts:new Set(),blackErrors:new Set()});
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
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  },[user]);

  const resumeChecked = useRef(false);

  useEffect(()=>{
    if(!resumeChecked.current){
      resumeChecked.current=true;
      const saved=loadGameState("lightup");
      if(saved&&(saved.stage as number)>1){setResumeData(saved);setShowResume(true);return;}
    }
    loadStage(stage);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[stage,loadStage]);

  function handleRevealSolution() {
    if (!board || !xpState) return;
    const ng = board.grid.map(row => [...row]) as LightCell[][];
    for (const solKey of board.solution) {
      const [sr, sc] = solKey.split(",").map(Number);
      ng[sr][sc] = { type:"bulb" };
    }
    setGrid(ng);
    const lt = computeLighting(ng);
    setLighting(lt);
    setSolutionRevealed(true);
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleCell(r:number,c:number){
    if(!board||completed||solutionRevealed)return;
    const cell=grid[r][c];
    if(cell.type==="black")return;
    const ng=grid.map(row=>[...row]);
    ng[r][c]=cell.type==="bulb"?{type:"white"}:{type:"bulb"};
    setGridHistory(h=>[...h.slice(-19),[...grid.map(r=>[...r])]]);
    setGrid(ng);
    saveGameState("lightup", {stage, grid: ng, hintsUsed, startTime: xpState?.startTime, savedAt: Date.now()});
    const lt=computeLighting(ng);
    setLighting(lt);
    if(lt.conflicts.size>0||lt.blackErrors.size>0)playError();
    else playClick();
    if(checkLightUp(ng)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
      setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      markStageCompleted("lightup",stage);
      if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"lightup",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});}
    }
  }

  function handleUndo() {
    if (gridHistory.length === 0) return;
    const prev = gridHistory[gridHistory.length-1];
    setGrid(prev);
    setLighting(computeLighting(prev));
    setGridHistory(h => h.slice(0,-1));
  }

  function handleHint() {
    if (!board || !xpState || hintsUsed >= 3 || solutionRevealed) return;
    for (const solKey of board.solution) {
      const [sr, sc] = solKey.split(",").map(Number);
      if (grid[sr][sc].type === "white") {
        const ng = grid.map(row => [...row]);
        ng[sr][sc] = {type:"bulb"};
        const lt = computeLighting(ng);
        setGrid(ng); setLighting(lt);
        setHintsUsed(h => h + 1);
        setXpState(prev => prev ? {...prev, hintsUsed: Math.min(prev.hintsUsed + 1, prev.maxHints)} : prev);
        playError();
        return;
      }
    }
  }

  function handleCheck() {
    if (!board || completed || solutionRevealed) return;
    const solSet = new Set(board.solution);
    const result = new Map<string, "correct" | "incorrect">();
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        if (grid[r][c].type === "bulb") {
          const k = `${r},${c}`;
          result.set(k, solSet.has(k) ? "correct" : "incorrect");
        }
      }
    }
    setCheckState(result);
    playClick();
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => setCheckState(null), 2000);
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--color-text-secondary)",fontSize:13}}>Generating board...</p></div>);

  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const cellSize=Math.floor(maxW/board.size);
  const totalWhite=grid.flat().filter(c=>c.type!=="black").length;
  const litCount=lighting.lit.size;

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Light Up"
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
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"16px 16px 32px"}}>
          <div style={{fontSize:11,color:"var(--color-text-secondary)",textAlign:"center"}}>
            {litCount}/{totalWhite} lit · Click white cells to place ● bulbs · Light must reach every white cell<br/>
            Black numbers = required adjacent bulbs · Bulbs can't light each other
          </div>

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"8px 20px",borderRadius:12,background:"color-mix(in srgb, var(--color-error) 8%, transparent)",border:"0.5px solid color-mix(in srgb, var(--color-error) 20%, transparent)",fontSize:13,fontWeight:600,color:"var(--color-error)"}}>
              Solution revealed · XP set to 1 · Retry to score properly
            </motion.div>
          )}

          <div style={{border:"2px solid var(--color-border)",borderRadius:14,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${cellSize}px)`}}>
              {grid.map((row,r)=>row.map((cell,c)=>{
                const k=`${r},${c}`;
                const isLit=lighting.lit.has(k);
                const isConflict=lighting.conflicts.has(k);
                const isBlackErr=lighting.blackErrors.has(k);
                const isSolBulb=solutionRevealed&&cell.type==="bulb";
                const check=checkState?.get(k);
                if(cell.type==="black"){
                  const bc=cell as{type:"black";clue:number|null};
                  return(
                    <div key={k} style={{width:cellSize,height:cellSize,background:isBlackErr?"color-mix(in srgb, var(--color-error) 60%, var(--color-surface-2))":blackCellBg,display:"flex",alignItems:"center",justifyContent:"center",borderRight:"0.5px solid var(--color-border)",borderBottom:"0.5px solid var(--color-border)",borderTop:"none",borderLeft:"none"}}>
                      {bc.clue!=null&&bc.clue>=0&&<span style={{fontSize:Math.round(cellSize*0.4),fontWeight:700,color:isBlackErr?"var(--color-error)":"white",fontFamily:"var(--font-mono)"}}>{bc.clue}</span>}
                    </div>
                  );
                }
                const isBulb=cell.type==="bulb";
                return(
                  <motion.button key={k} onClick={()=>handleCell(r,c)}
                    whileTap={solutionRevealed?{}:{scale:0.9}}
                    style={{width:cellSize,height:cellSize,display:"flex",alignItems:"center",justifyContent:"center",
                      background:check==="correct"?"var(--color-accent-secondary)":check==="incorrect"?"var(--color-error)":isConflict?"color-mix(in srgb, var(--color-error) 10%, var(--color-surface))":isSolBulb?"color-mix(in srgb, var(--color-error) 8%, transparent)":isLit?"color-mix(in srgb, #F59E0B 15%, var(--color-surface))":"var(--color-surface)",
                      borderRight:"0.5px solid var(--color-border)",borderBottom:"0.5px solid var(--color-border)",borderTop:"none",borderLeft:"none",
                      cursor:solutionRevealed?"default":"pointer",outline:"none",fontSize:Math.round(cellSize*0.5),
                      transition:"background 0.2s",
                      boxShadow:isLit&&!isBulb?`inset 0 0 ${cellSize/2}px rgba(253,224,71,0.3)`:"none"}}>
                    {isBulb&&!check&&<span style={{filter:isConflict?"grayscale(1)":"none",color:isSolBulb?"var(--color-error)":"inherit"}}>●</span>}
                    {isBulb&&check&&<span style={{color:check==="correct"?"var(--color-on-accent)":"white"}}>●</span>}
                  </motion.button>
                );
              }))}
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>← Prev</button>
            <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Stage {stage} of {TOTAL_STAGES}</span>
            <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
          </div>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Light Up" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showResume && resumeData && (
        <ResumeModal
          gameSlug="lightup"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={()=>{
            const s=resumeData!;
            setShowResume(false);setResumeData(null);
            setStage(s.stage as number);
            if(s.grid)setTimeout(()=>{setGrid(s.grid as typeof grid);setLighting(computeLighting(s.grid as typeof grid));},150);
          }}
          onStartFresh={()=>{
            clearGameState("lightup");setShowResume(false);setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="lightup" totalStages={TOTAL_STAGES} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Light Up Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Light Up"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function LightUpPage(){return<ErrorBoundary game="lightup"><LightUpPageInner/></ErrorBoundary>;}