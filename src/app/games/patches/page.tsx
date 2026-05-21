"use client";
const TOTAL_STAGES = 1000;
const GAME_SLUG = "patches";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
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
import{generatePatches,checkPatches,type PatchesBoard,type Piece}from"@/lib/games/patchesGenerator";
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
function XPBar({xpState}:{xpState:XPState}){
  const[snap,setSnap]=useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);
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
  const[elapsed,setElapsed]=useState("00:00");
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
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{if(xpState&&!completed)timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}
  );

  const loadStage=useCallback((s:number)=>{
    saveGameState("patches",{stage:s,savedAt:Date.now()});
    const diff=getDifficulty(s);
    const b=generatePatches(`patches-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setPlaced(new Map());setPlacedPieces(new Set());
    setSelectedPiece(null);setHoverCells(new Set());
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);setElapsed("00:00");
    setSolutionRevealed(false);
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
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

  // ── Show Solution ──────────────────────────────────────────────────────────
  function handleRevealSolution(){
    if(!board||!xpState)return;
    // Read board.solution grid to reconstruct placed map
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
    const np=new Map(placed);
    cells.forEach(([pr,pc])=>np.set(`${pr},${pc}`,selectedPiece));
    const npp=new Set(placedPieces);npp.add(selectedPiece);
    setPlaced(np);setPlacedPieces(npp);setSelectedPiece(null);setHoverCells(new Set());
    saveGameState("patches",{stage,placed:Array.from(np.entries()),placedPieces:Array.from(npp),hintsUsed,startTime:xpState?.startTime,savedAt:Date.now()});
    playClick();
    if(checkPatches(board,np)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      markStageCompleted("patches",stage);
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"patches",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}
    }
  }

  function handleHint(){
    if(!board||!xpState||hintsUsed>=3||completed||solutionRevealed)return;
    // Place one unplaced piece in its solution position
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

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating puzzle...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,400):360;
  const cellSize=Math.floor(maxW/board.cols);
  const remaining=board.pieces.filter(p=>!placedPieces.has(p.id));
  const currentXP=calculateXP(xpState).currentXP;

  return(
    <div className="game-page">
      <Navbar/>
      <GamePageSchema slug="patches" />
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>
        <div style={{width:"100%",maxWidth:520,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,overflow:"hidden",flexShrink:1}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>Patches</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()} · {board.rows}×{board.cols}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:"var(--text4)"}}>{remaining.length} left</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {!solutionRevealed&&<div style={{fontSize:11,color:"var(--text4)",textAlign:"center"}}>Select a piece below · Click the board to place it · Click placed piece to pick back up</div>}

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"8px 20px",borderRadius:12,background:"rgba(239,68,68,0.08)",border:"0.5px solid rgba(239,68,68,0.2)",fontSize:13,fontWeight:600,color:"#EF4444"}}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        {/* Board */}
        <div style={{border:"2px solid #E2E8F0",borderRadius:14,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}
          onMouseLeave={()=>setHoverCells(new Set())}>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${board.cols},${cellSize}px)`}}>
            {Array.from({length:board.rows},(_,r)=>Array.from({length:board.cols},(_,c)=>{
              const k=`${r},${c}`;
              const pid=placed.get(k);
              const piece=pid!==undefined?board.pieces.find(p=>p.id===pid):null;
              const isHover=hoverCells.has(k);
              const selPiece=selectedPiece!==null?board.pieces.find(p=>p.id===selectedPiece):null;
              return(
                <div key={k}
                  onClick={()=>handleCellClick(r,c)}
                  onMouseEnter={()=>handleCellHover(r,c)}
                  style={{width:cellSize,height:cellSize,
                    cursor:solutionRevealed?"default":selectedPiece!==null||pid!==undefined?"pointer":"default",
                    background:piece?(solutionRevealed?`${piece.color}cc`:piece.color):isHover&&selPiece?`${selPiece.color}50`:"#F8F7F5",
                    borderRight:"0.5px solid #E2E8F0",borderBottom:"0.5px solid #E2E8F0",
                    borderTop:"none",borderLeft:"none",transition:"background 0.1s"}}>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Piece palette — hidden when solution revealed */}
        {!solutionRevealed&&(
          <div style={{width:"100%",maxWidth:520}}>
            <p style={{fontSize:11,fontWeight:600,color:"var(--text4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Pieces</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {board.pieces.map(piece=>{
                if(placedPieces.has(piece.id))return(
                  <div key={piece.id} style={{padding:8,borderRadius:14,border:"2px solid #E2E8F0",background:"var(--bg2)",opacity:0.4}}>
                    <div style={{width:24,height:24,borderRadius:6,background:piece.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white"}}></div>
                  </div>
                );
                return<PiecePreview key={piece.id} piece={piece} cellSize={14} selected={selectedPiece===piece.id} onClick={()=>setSelectedPiece(selectedPiece===piece.id?null:piece.id)}/>;
              })}
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <HintButton hintsLeft={3-hintsUsed} xpCost={100} onUseHint={handleHint} disabled={completed||solutionRevealed}/>
          <ShowSolution onReveal={handleRevealSolution} currentXP={currentXP} disabled={completed||solutionRevealed}/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

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
      {showMap&&<StageMap gameSlug="patches" totalStages={1000} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={elapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Patches Stage ${stage} · ${finalXP} XP · ${elapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
    </div>
  );
}
      <GameCompleteModal
        open={showGameComplete}
        gameName="Patches"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />


export default function PatchesGame(){return<ErrorBoundary game="patches"><PatchesGameInner/></ErrorBoundary>;}