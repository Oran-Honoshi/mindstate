"use client";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import{UndoButton}from"@/components/ui/UndoButton";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,ChevronRight}from"lucide-react";
import Link from"next/link";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{Navbar}from"@/components/nav/Navbar";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{HintButton}from"@/components/ui/HintButton";
import { ShowSolution } from "@/components/ui/ShowSolution";
import{generateLightUp,computeLighting,checkLightUp,type LightBoard,type LightCell}from"@/lib/games/lightUpGenerator";
import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import { GamePageSchema } from "@/components/seo/GamePageSchema";

function getDifficulty(s:number):Difficulty{
  if(s===1)return"medium";
  const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;
  return h<20?"easy":h<70?"medium":"hard";
}
function XPBar({xpState}:{xpState:XPState}){const[snap,setSnap]=useState(()=>calculateXP(xpState));useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);}

function LightUpPageInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => getLastStage("lightup"));
  const[board,setBoard]=useState<LightBoard|null>(null);
  const[grid,setGrid]=useState<LightCell[][]>([]);
  const[lighting,setLighting]=useState<ReturnType<typeof computeLighting>>({lit:new Set(),conflicts:new Set(),blackErrors:new Set()});
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[showResume,setShowResume]=useState(false);
  const[resumeData,setResumeData]=useState<Record<string,unknown>|null>(null);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[finalXP,setFinalXP]=useState(0);
  const [gridHistory, setGridHistory] = useState<typeof grid[]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
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
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);setElapsed("00:00");
    setSolutionRevealed(false);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
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

  // \u2500\u2500 Show Solution \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  function handleRevealSolution() {
    if (!board || !xpState) return;
    // Place all bulbs from board.solution onto the grid
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
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      markStageCompleted("lightup",stage);
      if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"lightup",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}
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

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const cellSize=Math.floor(maxW/board.size);
  const totalWhite=grid.flat().filter(c=>c.type!=="black").length;
  const litCount=lighting.lit.size;
  const currentXP = calculateXP(xpState).currentXP;

  return(
    <div className="game-page">
      <Navbar/>
      <GamePageSchema slug="lightup" />
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>
        <div style={{width:"100%",maxWidth:540,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,overflow:"hidden",flexShrink:1}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>Light Up</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()} \u00b7 {board.size}\u00d7{board.size}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:"var(--text4)"}}>{litCount}/{totalWhite} lit</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{fontSize:11,color:"var(--text4)",textAlign:"center"}}>
          Click white cells to place \u25cf bulbs \u00b7 Light must reach every white cell<br/>
          Black numbers = required adjacent bulbs \u00b7 Bulbs can't light each other
        </div>

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"8px 20px",borderRadius:12,background:"rgba(239,68,68,0.08)",border:"0.5px solid rgba(239,68,68,0.2)",fontSize:13,fontWeight:600,color:"#EF4444"}}>
            Solution revealed \u00b7 XP set to 1 \u00b7 Retry to score properly
          </motion.div>
        )}

        <div style={{border:"2px solid #374151",borderRadius:14,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${cellSize}px)`}}>
            {grid.map((row,r)=>row.map((cell,c)=>{
              const k=`${r},${c}`;
              const isLit=lighting.lit.has(k);
              const isConflict=lighting.conflicts.has(k);
              const isBlackErr=lighting.blackErrors.has(k);
              const isSolBulb=solutionRevealed&&cell.type==="bulb";
              if(cell.type==="black"){
                const bc=cell as{type:"black";clue:number|null};
                return(
                  <div key={k} style={{width:cellSize,height:cellSize,background:isBlackErr?"#7F1D1D":"#374151",display:"flex",alignItems:"center",justifyContent:"center",borderRight:"0.5px solid #4B5563",borderBottom:"0.5px solid #4B5563",borderTop:"none",borderLeft:"none"}}>
                    {bc.clue!=null&&bc.clue>=0&&<span style={{fontSize:Math.round(cellSize*0.4),fontWeight:700,color:isBlackErr?"#FCA5A5":"#F9FAFB"}}>{bc.clue}</span>}
                  </div>
                );
              }
              const isBulb=cell.type==="bulb";
              return(
                <motion.button key={k} onClick={()=>handleCell(r,c)}
                  whileTap={solutionRevealed?{}:{scale:0.9}}
                  style={{width:cellSize,height:cellSize,display:"flex",alignItems:"center",justifyContent:"center",
                    background:isConflict?"#FEF2F2":isSolBulb?"rgba(239,68,68,0.08)":isLit?"#FFFBEB":"#FAFAF9",
                    borderRight:"0.5px solid #E8E4DE",borderBottom:"0.5px solid #E8E4DE",borderTop:"none",borderLeft:"none",
                    cursor:solutionRevealed?"default":"pointer",outline:"none",fontSize:Math.round(cellSize*0.5),
                    boxShadow:isLit&&!isBulb?`inset 0 0 ${cellSize/2}px rgba(253,224,71,0.3)`:"none"}}>
                  {isBulb&&<span style={{filter:isConflict?"grayscale(1)":"none",color:isSolBulb?"#EF4444":"inherit"}}>\u25cf</span>}
                </motion.button>
              );
            }))}
          </div>
        </div>

        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <UndoButton onUndo={handleUndo} canUndo={gridHistory.length>0} disabled={completed||solutionRevealed}/>
          <HintButton hintsLeft={3-hintsUsed} xpCost={100} onUseHint={handleHint} disabled={completed||solutionRevealed}/>
          <ShowSolution onReveal={handleRevealSolution} currentXP={currentXP} disabled={completed||solutionRevealed}/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>\u2190 Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 100</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

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
      {showMap&&<StageMap gameSlug="lightup" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={elapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement \u00b7 Light Up Stage ${stage} \u00b7 ${finalXP} XP \u00b7 ${elapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
    </div>
  );
}

export default function LightUpPage(){return<ErrorBoundary game="lightup"><LightUpPageInner/></ErrorBoundary>;}