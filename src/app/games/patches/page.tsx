"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "patches";
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
import{generatePatches,checkPatches,type PatchesBoard,type Piece}from"@/lib/games/patchesGenerator";
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

function PiecePreview({piece,cellSize,selected,onClick}:{piece:Piece;cellSize:number;selected:boolean;onClick:()=>void}){
  const maxR=Math.max(...piece.cells.map(([r])=>r))+1;
  const maxC=Math.max(...piece.cells.map(([,c])=>c))+1;
  return(
    <motion.button onClick={onClick} whileTap={{scale:0.92}}
      style={{padding:8,borderRadius:14,border:`2px solid ${selected?piece.color:"#E2E8F0"}`,
        background:selected?`${piece.color}15`:"white",cursor:"pointer",outline:"none",
        boxShadow:selected?`0 4px 12px ${piece.color}40`:"0 2px 6px rgba(0,0,0,0.04)"}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${maxC},${cellSize}px)`,gap:2,gridTemplateRows:`repeat(${maxR},${cellSize}px)`}}>
        {Array.from({length:maxR},(_,r)=>Array.from({length:maxC},(_,c)=>{
          const isCell=piece.cells.some(([pr,pc])=>pr===r&&pc===c);
          return<div key={`${r}-${c}`} style={{width:cellSize,height:cellSize,borderRadius:3,background:isCell?piece.color:"transparent"}}/>;
        }))}
      </div>
    </motion.button>
  );
}

function PatchesGameInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[board,setBoard]=useState<PatchesBoard|null>(null);
  const[placed,setPlaced]=useState<Map<string,number>>(new Map());
  const[placedPieces,setPlacedPieces]=useState<Set<number>>(new Set());
  const[selectedPiece,setSelectedPiece]=useState<number|null>(null);
  const[hoverCells,setHoverCells]=useState<Set<string>>(new Set());
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[completed,setCompleted]=useState(false);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[finalXP,setFinalXP]=useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const[showResume,setShowResume]=useState(false);
  const[resumeData,setResumeData]=useState<Record<string,unknown>|null>(null);
  const[history,setHistory]=useState<{placed:Map<string,number>;placedPieces:Set<number>}[]>([]);
  const[checkState,setCheckState]=useState<Map<string,"correct"|"incorrect">|null>(null);
  const checkTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{
      if(xpState&&!completed){
        timerRef.current=setInterval(()=>{
          setElapsedSeconds(Math.floor((Date.now()-xpState.startTime)/1000));
          setLiveXP(calculateXP(xpState).currentXP);
        },500);
      }
    }
  );

  const loadStage=useCallback((s:number)=>{
    saveGameState("patches",{stage:s,savedAt:Date.now()});
    const diff=getDifficulty(s);
    const b=generatePatches(`patches-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setPlaced(new Map());setPlacedPieces(new Set());
    setSelectedPiece(null);setHoverCells(new Set());
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);
    setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");
    setSolutionRevealed(false);
    setHistory([]);
    setCheckState(null);
    if(checkTimerRef.current){clearTimeout(checkTimerRef.current);checkTimerRef.current=null;}
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
      const saved=loadGameState("patches");
      if(saved&&(saved.stage as number)>1){setResumeData(saved);setShowResume(true);return;}
    }
    loadStage(stage);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[stage,loadStage]);

  function handleRevealSolution(){
    if(!board||!xpState)return;
    const np=new Map<string,number>();
    const npp=new Set<number>();
    for(let r=0;r<board.rows;r++){
      for(let c=0;c<board.cols;c++){
        const pid=board.solution[r][c];
        if(pid>=0){np.set(`${r},${c}`,pid);npp.add(pid);}
      }
    }
    setPlaced(np);setPlacedPieces(npp);
    setSelectedPiece(null);setHoverCells(new Set());
    setSolutionRevealed(true);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  function getCellsForPieceAt(pieceId:number,r:number,c:number):[number,number][]|null{
    if(!board)return null;
    const piece=board.pieces.find(p=>p.id===pieceId);
    if(!piece)return null;
    return piece.cells.map(([pr,pc])=>[pr+r,pc+c] as [number,number]);
  }

  function handleCellHover(r:number,c:number){
    if(selectedPiece===null||!board||solutionRevealed)return;
    const cells=getCellsForPieceAt(selectedPiece,r,c);
    if(!cells)return;
    setHoverCells(new Set(cells.map(([r,c])=>`${r},${c}`)));
  }

  function handleCellClick(r:number,c:number){
    if(!board||completed||solutionRevealed)return;
    const cellKey=`${r},${c}`;
    if(placed.has(cellKey)){
      const pid=placed.get(cellKey)!;
      setHistory(h=>[...h.slice(-19),{placed:new Map(placed),placedPieces:new Set(placedPieces)}]);
      const np=new Map(placed);const npp=new Set(placedPieces);
      [...placed.entries()].filter(([,v])=>v===pid).forEach(([k])=>np.delete(k));
      npp.delete(pid);
      setPlaced(np);setPlacedPieces(npp);setSelectedPiece(pid);
      playClick();return;
    }
    if(selectedPiece===null)return;
    const cells=getCellsForPieceAt(selectedPiece,r,c);
    if(!cells)return;
    const valid=cells.every(([pr,pc])=>{
      if(pr<0||pr>=board.rows||pc<0||pc>=board.cols)return false;
      if(placed.has(`${pr},${pc}`))return false;
      return true;
    });
    if(!valid){playError();return;}
    setHistory(h=>[...h.slice(-19),{placed:new Map(placed),placedPieces:new Set(placedPieces)}]);
    const np=new Map(placed);
    cells.forEach(([pr,pc])=>np.set(`${pr},${pc}`,selectedPiece));
    const npp=new Set(placedPieces);npp.add(selectedPiece);
    setPlaced(np);setPlacedPieces(npp);setSelectedPiece(null);setHoverCells(new Set());
    saveGameState("patches",{stage,placed:Array.from(np.entries()),placedPieces:Array.from(npp),hintsUsed,startTime:xpState?.startTime,savedAt:Date.now()});
    playClick();
    if(checkPatches(board,np)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);
      setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
      setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      markStageCompleted("patches",stage);
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"patches",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});}
    }
  }

  function handleUndo(){
    if(history.length===0||completed||solutionRevealed)return;
    const last=history[history.length-1];
    setPlaced(last.placed);setPlacedPieces(last.placedPieces);
    setSelectedPiece(null);setHoverCells(new Set());
    setHistory(h=>h.slice(0,-1));
    playClick();
  }

  function handleCheck(){
    if(!board||completed||solutionRevealed)return;
    const result=new Map<string,"correct"|"incorrect">();
    // For each placed piece, check if every cell it occupies matches the solution
    placedPieces.forEach(pid=>{
      const pieceCells:string[]=[];
      placed.forEach((v,k)=>{if(v===pid)pieceCells.push(k);});
      const allMatch=pieceCells.every(k=>{
        const[r,c]=k.split(",").map(Number);
        return board.solution[r][c]===pid;
      });
      const verdict:"correct"|"incorrect"=allMatch?"correct":"incorrect";
      pieceCells.forEach(k=>result.set(k,verdict));
    });
    setCheckState(result);
    playClick();
    if(checkTimerRef.current)clearTimeout(checkTimerRef.current);
    checkTimerRef.current=setTimeout(()=>setCheckState(null),2000);
  }

  function handleHint(){
    if(!board||!xpState||hintsUsed>=3||completed||solutionRevealed)return;
    for(const piece of board.pieces){
      if(placedPieces.has(piece.id))continue;
      const cells:[number,number][]=[];
      for(let r=0;r<board.rows;r++)
        for(let c=0;c<board.cols;c++)
          if(board.solution[r][c]===piece.id)cells.push([r,c]);
      if(cells.length===0)continue;
      const np=new Map(placed);
      cells.forEach(([r,c])=>np.set(`${r},${c}`,piece.id));
      const npp=new Set(placedPieces);npp.add(piece.id);
      setPlaced(np);setPlacedPieces(npp);
      setHintsUsed(h=>h+1);
      setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
      playError();return;
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--color-text-secondary)",fontSize:13}}>Generating puzzle...</p></div>);

  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,400):360;
  const cellSize=Math.floor(maxW/board.cols);
  const remaining=board.pieces.filter(p=>!placedPieces.has(p.id));

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Patches"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug="patches" />

        {!solutionRevealed&&<div style={{fontSize:11,color:"var(--color-text-secondary)",textAlign:"center"}}>{remaining.length} pieces left · Select a piece below · Click board to place · Click placed piece to pick up</div>}

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"8px 20px",borderRadius:12,background:"rgba(255,68,68,0.08)",border:"0.5px solid rgba(255,68,68,0.2)",fontSize:13,fontWeight:600,color:"var(--color-error)"}}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        <div style={{border:"2px solid #E2E8F0",borderRadius:14,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}
          onMouseLeave={()=>setHoverCells(new Set())}>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${board.cols},${cellSize}px)`}}>
            {Array.from({length:board.rows},(_,r)=>Array.from({length:board.cols},(_,c)=>{
              const k=`${r},${c}`;
              const pid=placed.get(k);
              const piece=pid!==undefined?board.pieces.find(p=>p.id===pid):null;
              const isHover=hoverCells.has(k);
              const selPiece=selectedPiece!==null?board.pieces.find(p=>p.id===selectedPiece):null;
              const check=checkState?.get(k);
              return(
                <div key={k}
                  onClick={()=>handleCellClick(r,c)}
                  onMouseEnter={()=>handleCellHover(r,c)}
                  style={{width:cellSize,height:cellSize,
                    cursor:solutionRevealed?"default":selectedPiece!==null||pid!==undefined?"pointer":"default",
                    background:check==="correct"?"var(--color-accent-secondary)":check==="incorrect"?"var(--color-error)":piece?(solutionRevealed?`${piece.color}cc`:piece.color):isHover&&selPiece?`${selPiece.color}50`:"#F8F7F5",
                    borderRight:"0.5px solid #E2E8F0",borderBottom:"0.5px solid #E2E8F0",
                    borderTop:"none",borderLeft:"none",transition:"background 0.2s"}}>
                </div>
              );
            }))}
          </div>
        </div>

        {!solutionRevealed&&(
          <div style={{width:"100%",maxWidth:520}}>
            <p style={{fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Pieces</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {board.pieces.map(piece=>{
                if(placedPieces.has(piece.id))return(
                  <div key={piece.id} style={{padding:8,borderRadius:14,border:"2px solid #E2E8F0",background:"var(--color-surface-2)",opacity:0.4}}>
                    <div style={{width:24,height:24,borderRadius:6,background:piece.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white"}}></div>
                  </div>
                );
                return<PiecePreview key={piece.id} piece={piece} cellSize={14} selected={selectedPiece===piece.id} onClick={()=>setSelectedPiece(selectedPiece===piece.id?null:piece.id)}/>;
              })}
            </div>
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Stage {stage} of 100</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Patches" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showResume && resumeData && (
        <ResumeModal
          gameSlug="patches"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={()=>{
            const s=resumeData!;
            setShowResume(false);setResumeData(null);
            setStage(s.stage as number);
            if(s.placed)setTimeout(()=>{
              setPlaced(new Map(s.placed as [string,number][]));
              setPlacedPieces(new Set(s.placedPieces as number[]));
            },150);
          }}
          onStartFresh={()=>{
            clearGameState("patches");setShowResume(false);setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="patches" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Patches Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Patches"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function PatchesGame(){return<ErrorBoundary game="patches"><PatchesGameInner/></ErrorBoundary>;}