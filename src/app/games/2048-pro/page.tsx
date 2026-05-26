"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "2048-pro";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ChevronRight,Trophy}from"lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
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

function getDifficulty(s:number):Difficulty{
  if(s===1)return"medium";
  const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;
  return h<20?"easy":h<70?"medium":"hard";
}
function shareResult(stage:number,score:number,best:number){const text=` MindElement · 2048 Pro Stage ${stage} · Score: ${score} · Best tile: ${best}`;const url="https://mindelement.app";if(navigator.share)navigator.share({title:"MindElement",text,url}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");}

type Grid=number[][];
const TILE_COLORS:Record<number,{bg:string;color:string}>={0:{bg:"#EDE0C8",color:"transparent"},2:{bg:"#EEE4DA",color:"#776E65"},4:{bg:"#EDE0C8",color:"#776E65"},8:{bg:"#F2B179",color:"white"},16:{bg:"#F59563",color:"white"},32:{bg:"#F67C5F",color:"white"},64:{bg:"#F65E3B",color:"white"},128:{bg:"#EDCF72",color:"white"},256:{bg:"#EDCC61",color:"white"},512:{bg:"#EDC850",color:"white"},1024:{bg:"#EDC53F",color:"white"},2048:{bg:"#EDC22E",color:"white"},4096:{bg:"#3C3A32",color:"white"},8192:{bg:"#3C3A32",color:"white"}};
function getColor(v:number):{bg:string;color:string}{return TILE_COLORS[v]??{bg:"#3C3A32",color:"white"};}
function initGrid(seed:number):Grid{const g=Array.from({length:4},()=>Array(4).fill(0));addTile(g,seed);addTile(g,seed+1);return g;}
function addTile(g:Grid,seed:number){const empty:number[][]=[];g.forEach((row,r)=>row.forEach((v,c)=>{if(v===0)empty.push([r,c]);}));if(!empty.length)return;const idx=Math.abs(seed*1664525+1013904223)%empty.length;const[r,c]=empty[Math.abs(idx)%empty.length];g[r][c]=Math.random()<0.9?2:4;}
function compress(row:number[]):{row:number[];merged:boolean}{const nums=row.filter(v=>v!==0);let merged=false;for(let i=0;i<nums.length-1;i++){if(nums[i]===nums[i+1]){nums[i]*=2;nums.splice(i+1,1);merged=true;}}while(nums.length<4)nums.push(0);return{row:nums,merged};}
function move(g:Grid,dir:"up"|"down"|"left"|"right"):{grid:Grid;score:number;moved:boolean}{const size=4;let score=0;let moved=false;const ng=g.map(r=>[...r]);if(dir==="left"||dir==="right"){for(let r=0;r<size;r++){const row=dir==="right"?[...ng[r]].reverse():ng[r];const{row:newRow,merged}=compress(row);const final=dir==="right"?[...newRow].reverse():newRow;if(final.some((v,i)=>v!==ng[r][i]))moved=true;ng[r]=final;if(merged)score+=newRow.reduce((s,v)=>s+v,0);}}else{for(let c=0;c<size;c++){const col=Array.from({length:size},(_,r)=>ng[r][c]);const row=dir==="down"?[...col].reverse():col;const{row:newRow,merged}=compress(row);const final=dir==="down"?[...newRow].reverse():newRow;if(final.some((v,i)=>v!==col[i]))moved=true;final.forEach((v,r)=>{ng[r][c]=v;});if(merged)score+=newRow.reduce((s,v)=>s+v,0);}}return{grid:ng,score,moved};}
function hasWon(g:Grid,target:number){return g.some(r=>r.some(v=>v>=target));}
function hasLost(g:Grid){if(g.some(r=>r.some(v=>v===0)))return false;for(let r=0;r<4;r++)for(let c=0;c<4;c++){if(c<3&&g[r][c]===g[r][c+1])return false;if(r<3&&g[r][c]===g[r+1][c])return false;}return true;}

function TwentyFortyEightProPageInner(){
  const{user}=useAuthStore();
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[hintsUsed,setHintsUsed]=useState(0);
  const[grid,setGrid]=useState<Grid>(()=>initGrid(1));
  const[score,setScore]=useState(0);
  const[bestTile,setBestTile]=useState(2);
  const[gameState,setGameState]=useState<"playing"|"won"|"lost">("playing");
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[finalXP,setFinalXP]=useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const[showResume,setShowResume]=useState(false);
  const[resumeData,setResumeData]=useState<Record<string,unknown>|null>(null);
  const[history,setHistory]=useState<{grid:Grid;score:number;bestTile:number}[]>([]);
  const touchStart=useRef<{x:number;y:number}|null>(null);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{if(xpState&&gameState==="playing"&&!solutionRevealed){timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xpState.startTime)/1000));setLiveXP(calculateXP(xpState).currentXP);},500);}}
  );

  const diff=getDifficulty(stage);
  const target=diff==="easy"?512:diff==="medium"?1024:2048;

  const handleHint=useCallback(()=>{
    if(!xpState||hintsUsed>=3||solutionRevealed)return;
    setHintsUsed(h=>h+1);
    setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
  },[xpState,hintsUsed,solutionRevealed]);

  const loadStage=useCallback((s:number)=>{
    saveGameState("2048-pro",{stage:s,savedAt:Date.now()});
    const d=getDifficulty(s);
    const xp=createXPState(d);
    const g=initGrid(s*997);
    setGrid(g);setScore(0);setBestTile(2);setGameState("playing");
    setXpState(xp);setFinalXP(0);setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");setHintsUsed(0);
    setSolutionRevealed(false);
    setHistory([]);
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));setLiveXP(calculateXP(xp).currentXP);},500);
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  },[user]);

  const resumeChecked = useRef(false);

  useEffect(()=>{
    if(!resumeChecked.current){
      resumeChecked.current=true;
      const saved=loadGameState("2048-pro");
      if(saved&&(saved.stage as number)>1){setResumeData(saved);setShowResume(true);return;}
    }
    loadStage(stage);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[stage,loadStage]);

  function handleRevealSolution(){
    if(!xpState)return;
    setSolutionRevealed(true);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  function handleUndo(){
    if(history.length===0)return;
    const last=history[history.length-1];
    setGrid(last.grid);setScore(last.score);setBestTile(last.bestTile);
    setHistory(h=>h.slice(0,-1));
    playClick();
  }

  const handleMove=useCallback((dir:"up"|"down"|"left"|"right")=>{
    if(gameState!=="playing"||!xpState||solutionRevealed)return;
    const{grid:ng,score:s,moved}=move(grid,dir);
    if(!moved){playError();return;}
    setHistory(h=>[...h.slice(-19),{grid:grid.map(r=>[...r]),score,bestTile}]);
    addTile(ng,Date.now());
    const newBest=Math.max(bestTile,...ng.flat());
    setGrid(ng);setScore(prev=>prev+s);setBestTile(newBest);
    saveGameState("2048-pro",{stage,grid:ng,score:score+s,bestTile:newBest,hintsUsed,startTime:xpState?.startTime,savedAt:Date.now()});
    playClick();
    if(hasWon(ng,target)){
      const earned=finalizeXP(xpState);setFinalXP(earned);setGameState("won");
      setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      markStageCompleted("2048-pro",stage);
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"2048-pro",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});}}
    else if(hasLost(ng)){setGameState("lost");if(timerRef.current)clearInterval(timerRef.current);}
  },[grid,gameState,xpState,bestTile,target,stage,user,solutionRevealed]);

  useEffect(()=>{
    function onKey(e:KeyboardEvent){const map:Record<string,"up"|"down"|"left"|"right">={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};if(map[e.key]){e.preventDefault();handleMove(map[e.key]);}}
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  },[handleMove]);

  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,360):320;
  const cellSize=Math.floor((maxW-12)/4);

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="2048 Pro"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
      >
        <GamePageSchema slug={GAME_SLUG} />
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"16px 16px 32px"}}>
          <div style={{display:"flex",gap:12}}>
            {[{label:"Score",value:score},{label:"Best Tile",value:bestTile}].map(s=>(
              <div key={s.label} style={{background:"#BBADA0",borderRadius:12,padding:"10px 20px",textAlign:"center",minWidth:90}}>
                <p style={{fontSize:10,fontWeight:700,color:"#EEE4DA",letterSpacing:"0.1em",marginBottom:2}}>{s.label.toUpperCase()}</p>
                <p style={{fontSize:20,fontWeight:700,color:"white",fontFamily:"var(--font-sans)"}}>{s.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"10px 20px",borderRadius:12,background:"rgba(255,68,68,0.08)",border:"0.5px solid rgba(255,68,68,0.2)",fontSize:13,fontWeight:600,color:"var(--color-error)",textAlign:"center",maxWidth:340}}>
              Target: {target} · Strategy: keep highest tile in a corner, build in rows · XP set to 1
            </motion.div>
          )}

          <div
            style={{background:"#BBADA0",borderRadius:16,padding:8,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",touchAction:"none",opacity:solutionRevealed?0.7:1}}
            onTouchStart={e=>{const t=e.touches[0];touchStart.current={x:t.clientX,y:t.clientY};}}
            onTouchEnd={e=>{
              if(!touchStart.current)return;
              const t=e.changedTouches[0];
              const dx=t.clientX-touchStart.current.x,dy=t.clientY-touchStart.current.y;
              touchStart.current=null;
              if(Math.abs(dx)<10&&Math.abs(dy)<10)return;
              if(Math.abs(dx)>Math.abs(dy))handleMove(dx>0?"right":"left");
              else handleMove(dy>0?"down":"up");
            }}>
            <div style={{display:"grid",gridTemplateColumns:`repeat(4,${cellSize}px)`,gap:8}}>
              {grid.map((row,r)=>row.map((val,c)=>{
                const{bg,color}=getColor(val);
                const fontSize=val>=1000?cellSize*0.28:cellSize*0.38;
                return(
                  <motion.div key={`${r}-${c}-${val}`} initial={val>0?{scale:0.8,opacity:0}:{}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:400,damping:25}}
                    style={{width:cellSize,height:cellSize,borderRadius:8,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize,fontWeight:700,color,boxShadow:val>=8?"0 2px 8px rgba(0,0,0,0.2)":"none"}}>
                    {val||""}
                  </motion.div>
                );
              }))}
            </div>
          </div>

          <div style={{fontSize:11,color:"var(--color-text-secondary)",textAlign:"center"}}>
            {solutionRevealed?"Board locked · Retry to play properly":"Arrow keys or swipe to move · Reach "+target+" to win"}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,48px)",gridTemplateRows:"repeat(2,48px)",gap:6}}>
            {[{dir:"up",label:"↑",col:2,row:1},{dir:"left",label:"←",col:1,row:2},{dir:"down",label:"↓",col:2,row:2},{dir:"right",label:"→",col:3,row:2}].map(btn=>(
              <button key={btn.dir} onClick={()=>handleMove(btn.dir as any)} disabled={solutionRevealed}
                style={{gridColumn:btn.col,gridRow:btn.row,width:48,height:48,borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",fontSize:18,cursor:solutionRevealed?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:solutionRevealed?0.4:1}}>
                {btn.label}
              </button>
            ))}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>← Prev</button>
            <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Stage {stage} of {TOTAL_STAGES}</span>
            <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
          </div>
        </div>
      </GameShell>

      <AnimatePresence>
        {(gameState==="won"||gameState==="lost")&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{background:"var(--color-surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              {gameState==="won"?<Trophy size={48} color="#F59E0B" style={{margin:"0 auto 16px"}}/>:<div style={{fontSize:48,marginBottom:16}}>😔</div>}
              <h2 style={{fontSize:26,fontWeight:700,color:"var(--color-text-primary)",fontFamily:"var(--font-sans)",marginBottom:4}}>{gameState==="won"?`${target} Reached!`:"Game Over"}</h2>
              <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:24}}>Score: {score.toLocaleString()} · Best: {bestTile}</p>
              {gameState==="won"&&(
                <div style={{background:"var(--color-surface-2)",borderRadius:16,padding:20,marginBottom:20}}>
                  <p style={{fontSize:11,color:"var(--color-text-secondary)",fontWeight:600,marginBottom:4}}>XP EARNED</p>
                  <p style={{fontSize:48,fontWeight:700,color:"var(--color-accent-primary)",fontFamily:"var(--font-sans)"}}>{finalXP}</p>
                </div>
              )}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",fontSize:13,fontWeight:600,color:"var(--color-text-secondary)",cursor:"pointer"}}>Retry</button>
                <button onClick={()=>setStage(s=>s+1)} style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Next Stage <ChevronRight size={14}/></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OutOfTokensModal gameName="2048 Pro" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showResume && resumeData && (
        <ResumeModal
          gameSlug="2048-pro"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={()=>{
            const s=resumeData!;
            setShowResume(false);setResumeData(null);
            setStage(s.stage as number);
            if(s.grid)setTimeout(()=>{setGrid(s.grid as Grid);if(s.score)setScore(s.score as number);if(s.bestTile)setBestTile(s.bestTile as number);},150);
          }}
          onStartFresh={()=>{
            clearGameState("2048-pro");setShowResume(false);setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="2048-pro" totalStages={TOTAL_STAGES} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <GameCompleteModal
        open={showGameComplete}
        gameName="2048 Pro"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function TwentyFortyEightProPage(){return<ErrorBoundary game="2048-pro"><TwentyFortyEightProPageInner/></ErrorBoundary>;}