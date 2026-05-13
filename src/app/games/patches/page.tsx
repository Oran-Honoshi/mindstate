"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,CheckCircle,ChevronRight,Share2,RefreshCw}from"lucide-react";
import Link from"next/link";
import { updateStreak } from "@/lib/supabase/streaks";
import{Navbar}from"@/components/nav/Navbar";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{HintButton}from"@/components/ui/HintButton";
import{CheckProgressButton}from"@/components/ui/CheckProgressButton";

import{generatePatches,checkPatches,type PatchesBoard,type Piece}from"@/lib/games/patchesGenerator";
import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import{ShowSolution}from"@/components/ui/ShowSolution";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}
function shareResult(stage:number,xp:number,elapsed:string){
  const text=` MindState · Patches Stage ${stage} · ${xp} XP · ${elapsed}`;
  const url="https://mindstate.vercel.app";
  if(navigator.share)navigator.share({title:"MindState",text,url}).catch(()=>{});
  else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");
}

function XPBar({xpState}:{xpState:XPState}){
  const[snap,setSnap]=useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);
}

// Mini piece preview
function PiecePreview({piece,cellSize,selected,onClick}:{piece:Piece;cellSize:number;selected:boolean;onClick:()=>void}){
  const maxR=Math.max(...piece.cells.map(([r])=>r))+1;
  const maxC=Math.max(...piece.cells.map(([,c])=>c))+1;
  return(
    <motion.button onClick={onClick} whileTap={{scale:0.92}}
      style={{padding:8,borderRadius:14,border:`2px solid ${selected?piece.color:"#E2E8F0"}`,
        background:selected?`${piece.color}15`:"white",cursor:"pointer",outline:"none",
        boxShadow:selected?`0 4px 12px ${piece.color}40`:"0 2px 6px rgba(0,0,0,0.04)"}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${maxC},${cellSize}px)`,gap:2,
        gridTemplateRows:`repeat(${maxR},${cellSize}px)`}}>
        {Array.from({length:maxR},(_,r)=>Array.from({length:maxC},(_,c)=>{
          const isCell=piece.cells.some(([pr,pc])=>pr===r&&pc===c);
          return<div key={`${r}-${c}`} style={{width:cellSize,height:cellSize,borderRadius:3,
            background:isCell?piece.color:"transparent"}}/>;
        }))}
      </div>
    </motion.button>
  );
}

export default function PatchesGame(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<PatchesBoard|null>(null);
  const[placed,setPlaced]=useState<Map<string,number>>(new Map()); // cell -> pieceId
  const[placedPieces,setPlacedPieces]=useState<Set<number>>(new Set());
  const[selectedPiece,setSelectedPiece]=useState<number|null>(null);
  const[hoverCells,setHoverCells]=useState<Set<string>>(new Set());
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generatePatches(`patches-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setPlaced(new Map());setPlacedPieces(new Set());
    setSelectedPiece(null);setHoverCells(new Set());
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);setShowFeedback(false);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user){
      const ok=consumeToken(user.id);
      if(!ok){setShowTokenModal(true);return;}
    }
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function getCellsForPieceAt(pieceId:number,r:number,c:number):[number,number][]|null{
    if(!board)return null;
    const piece=board.pieces.find(p=>p.id===pieceId);
    if(!piece)return null;
    // Offset piece so first cell aligns with r,c
    const dr=r-piece.cells[0][0];
    const dc=c-piece.cells[0][1];
    return piece.cells.map(([pr,pc])=>[pr+dr,pc+dc] as [number,number]);
  }

  function handleCellHover(r:number,c:number){
    if(selectedPiece===null||!board)return;
    const cells=getCellsForPieceAt(selectedPiece,r,c);
    if(!cells)return;
    setHoverCells(new Set(cells.map(([r,c])=>`${r},${c}`)));
  }

  function handleCellClick(r:number,c:number){
    if(!board||completed)return;
    const cellKey=`${r},${c}`;

    // If cell already placed, remove that piece
    if(placed.has(cellKey)){
      const pid=placed.get(cellKey)!;
      const np=new Map(placed);
      const npp=new Set(placedPieces);
      [...placed.entries()].filter(([,v])=>v===pid).forEach(([k])=>np.delete(k));
      npp.delete(pid);
      setPlaced(np);setPlacedPieces(npp);
      setSelectedPiece(pid);
      playClick();
      return;
    }

    if(selectedPiece===null)return;

    const cells=getCellsForPieceAt(selectedPiece,r,c);
    if(!cells)return;

    // Validate placement
    const valid=cells.every(([pr,pc])=>{
      if(pr<0||pr>=board.rows||pc<0||pc>=board.cols)return false;
      if(placed.has(`${pr},${pc}`))return false;
      return true;
    });

    if(!valid){playError();return;}

    const np=new Map(placed);
    cells.forEach(([pr,pc])=>np.set(`${pr},${pc}`,selectedPiece));
    const npp=new Set(placedPieces);
    npp.add(selectedPiece);
    setPlaced(np);setPlacedPieces(npp);
    setSelectedPiece(null);setHoverCells(new Set());
    playClick();

    if(checkPatches(board,np)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"patches",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}}
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating puzzle...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,400):360;
  const cellSize=Math.floor(maxW/board.cols);
  const remaining=board.pieces.filter(p=>!placedPieces.has(p.id));

  return(
    <div className="game-page">
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>
        <div style={{width:"100%",maxWidth:520,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()} · {board.rows}×{board.cols}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:"var(--text4)"}}>{remaining.length} left</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="patches" onOpen={()=>{if(timerRef.current){clearInterval(timerRef.current);}}} onClose={()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}}}/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{fontSize:11,color:"var(--text4)",textAlign:"center"}}>
          Select a piece below · Click the board to place it · Click placed piece to pick back up
        </div>

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
                  style={{width:cellSize,height:cellSize,cursor:selectedPiece!==null||pid!==undefined?"pointer":"default",
                    background:piece?piece.color:isHover&&selPiece?`${selPiece.color}50`:"#F8F7F5",
                    borderRight:"0.5px solid #E2E8F0",borderBottom:"0.5px solid #E2E8F0",
                    borderTop:"none",borderLeft:"none",
                    transition:"background 0.1s"}}>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Piece palette */}
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


        {/* Controls */}
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <HintButton
            hintsLeft={3-hintsUsed}
            xpCost={100}
            onUseHint={()=>{
              if(!xpState||hintsUsed>=3)return;
              setHintsUsed(h=>h+1);
              xpState.startTime=xpState.startTime-60000;
            }}
            disabled={completed}/>
          <CheckProgressButton
            onCheck={()=>{
              if(!xpState||completed)return;
              xpState.startTime=xpState.startTime-30000;
              setShowFeedback(true);
              setTimeout(()=>setShowFeedback(false),2000);
            }}
            disabled={completed}
            xpCost={50}/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      
      
      <OutOfTokensModal
        gameName="Patches"
        open={showTokenModal}
        onClose={()=>setShowTokenModal(false)}/>
      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={getDifficulty(stage)}
        xpEarned={finalXP}
        maxXP={xpState?.maxXP??1000}
        elapsed={elapsed}
        onRetry={()=>loadStage(stage)}
        onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{
          const text=`MindState · Patches Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.vercel.app"}).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");
        }}/>

    
      <AnimatePresence>
        {completed&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:24}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} transition={{type:"spring",stiffness:380,damping:28}}
              style={{background:"var(--surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <div style={{fontSize:56,marginBottom:12}}>🎉</div>
              <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif",marginBottom:4}}>Stage Complete!</h2>
              <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>{elapsed} · {getDifficulty(stage)}</p>
              <div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}>
                <p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4,letterSpacing:"0.1em",textTransform:"uppercase"}}>XP Earned</p>
                <p style={{fontSize:52,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>loadStage(stage)}
                  style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>
                  Retry
                </button>
                <button onClick={()=>{setCompleted(false);setStage(s=>s+1);}}
                  style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  Next Stage →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
</div>
  );
}
