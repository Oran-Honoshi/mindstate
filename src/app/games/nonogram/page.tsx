"use client";
import{UndoButton}from"@/components/ui/UndoButton";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { generateNonogram, checkNonogram, type NonogramBoard } from "@/lib/games/nonogramGenerator";
import { createXPState, calculateXP, finalizeXP, formatElapsed, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { HintButton } from "@/components/ui/HintButton";
import { GameInstructions } from "@/components/ui/GameInstructions";

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  // Pseudo-random mix: 20% easy, 50% medium, 30% hard
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
}
function shareResult(stage:number,xp:number,elapsed:string){
  const text=` MindState · Nonogram Stage ${stage} · ${xp} XP · ${elapsed}`;
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

function NonogramGameInner() {
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<NonogramBoard|null>(null);
  const[grid,setGrid]=useState<(boolean|null)[][]>([]);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const[dragging,setDragging]=useState(false);
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [gridHistory, setGridHistory] = useState<(boolean|null)[][][]>([]);
  const [feedbackCells, setFeedbackCells] = useState<Set<string>>(new Set());
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  // Freeze game when user leaves the app
  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
    }}
  );


  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generateNonogram(`nono-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setGrid(Array.from({length:b.size},()=>Array(b.size).fill(null)));
    setGridHistory([]);
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);setShowFeedback(false);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user){
      const ok=consumeToken(user.id);
      if(!ok){setShowTokenModal(true);return;}
    }
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleCell(r:number,c:number){
    if(!board||completed)return;
    const ng=grid.map(row=>[...row]);
    // 3-state cycle: empty → black → X → empty
    if(ng[r][c]===null) ng[r][c]=true;
    else if(ng[r][c]===true) ng[r][c]=false;
    else ng[r][c]=null;
    setGrid(ng); playClick();
    if(checkNonogram(board,ng)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
          if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if(user)saveScore({user_id:user.id,game_slug:"nonogram",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});
    }
  }


    function handleUndo() {
    if (gridHistory.length === 0) return;
    setGrid(gridHistory[gridHistory.length-1]);
    setGridHistory(h => h.slice(0,-1));
  }

  function handleHint() {
    if (!board || !xpState || hintsUsed >= 3) return;
    // Reveal one complete row that has no cells filled
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
    // Else reveal one empty cell
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
  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating puzzle...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const CLUE_W=Math.min(60,maxW*0.25);
  const cellSize=Math.floor((maxW-CLUE_W)/board.size);

  return(
    <div className="game-page">
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>
        <div style={{width:"100%",maxWidth:540,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:11,color:"var(--text4)"}}>Stage</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()} · {board.size}×{board.size}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="nonogram" onOpen={()=>{if(timerRef.current){clearInterval(timerRef.current);}}} onClose={()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}}}/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>


        {/* Nonogram grid */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
          {/* Column clues */}
          <div style={{display:"flex",marginLeft:CLUE_W}}>
            {board.colClues.map((clue,c)=>(
              <div key={c} style={{width:cellSize,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",paddingBottom:4,minHeight:40}}>
                {clue.map((n,i)=>(
                  <span key={i} style={{fontSize:Math.min(cellSize*0.4,11),fontWeight:700,color:"var(--text2)",lineHeight:1.3}}>{n}</span>
                ))}
              </div>
            ))}
          </div>
          {/* Rows */}
          {board.solution.map((_,r)=>(
            <div key={r} style={{display:"flex",alignItems:"center"}}>
              {/* Row clues */}
              <div style={{width:CLUE_W,display:"flex",justifyContent:"flex-end",alignItems:"center",gap:3,paddingRight:6,minHeight:cellSize}}>
                {board.rowClues[r].map((n,i)=>(
                  <span key={i} style={{fontSize:Math.min(12,cellSize*0.45),fontWeight:700,color:"var(--text2)"}}>{n}</span>
                ))}
              </div>
              {/* Cells */}
              {board.solution[r].map((_,c)=>{
                const val=grid[r]?.[c];
                return(
                  <motion.button key={c} onClick={()=>handleCell(r,c)} whileTap={{scale:0.9}}
                    style={{width:cellSize,height:cellSize,display:"flex",alignItems:"center",justifyContent:"center",
                      background:val===true?"#1C1917":val===false?"#FEF2F2":"white",
                      borderRight:"0.5px solid #E2E8F0",borderBottom:"0.5px solid #E2E8F0",borderTop:"none",borderLeft:"none",
                      cursor:"pointer",outline:"none",
                      transition:"background 0.1s"}}>
                    {val===true && <span style={{width:cellSize-4,height:cellSize-4,display:"block",background:"#1C1917",borderRadius:1}}/>}
                    {val===false && <span style={{fontSize:Math.round(cellSize*0.6),color:"#EF4444",fontWeight:900,lineHeight:1,userSelect:"none"}}>✕</span>}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>


        {/* Controls */}
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <UndoButton onUndo={handleUndo} canUndo={gridHistory.length>0} disabled={completed}/>
          <HintButton
            hintsLeft={3-hintsUsed}
            xpCost={100}
            onUseHint={handleHint}
            disabled={completed}/>
          </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      
      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={getDifficulty(stage)}
        xpEarned={finalXP}
        elapsed={elapsed}
        onRetry={()=>loadStage(stage)}
        onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{
          const text=`MindState · Nonogram Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.vercel.app"}).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");
        }}/>
</div>
  );
}


function CompletionPopup({ open, stage, elapsed, difficulty, finalXP, xpEarned, onRetry, onNext, onShare }: {
  open?: boolean; stage: number; elapsed: string; difficulty: string;
  finalXP?: number; xpEarned?: number; onRetry: () => void; onNext: () => void; onShare?: () => void;
}) {
  const xp = finalXP ?? xpEarned ?? 0;
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",
          backdropFilter:"blur(14px)",display:"flex",alignItems:"center",
          justifyContent:"center",zIndex:200,padding:24}}>
        <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
          transition={{type:"spring",stiffness:380,damping:28}}
          style={{background:"var(--surface)",borderRadius:28,padding:36,
            maxWidth:340,width:"100%",textAlign:"center",
            boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
          <div style={{fontSize:56,marginBottom:12}}>🎉</div>
          <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",
            fontFamily:"Georgia,serif",marginBottom:4}}>Stage {stage} Complete!</h2>
          <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>
            {elapsed} · {difficulty}
          </p>
          <div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}>
            <p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4,
              letterSpacing:"0.1em",textTransform:"uppercase"}}>XP Earned</p>
            <p style={{fontSize:52,fontWeight:700,color:"#4F6EF7",
              fontFamily:"Georgia,serif"}}>{xp}</p>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onRetry}
              style={{flex:1,padding:13,borderRadius:14,
                border:"0.5px solid var(--border2)",background:"var(--surface)",
                fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>
              Retry
            </button>
            <button onClick={onNext}
              style={{flex:2,padding:13,borderRadius:14,border:"none",
                background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                fontSize:13,fontWeight:700,color:"white",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              Next Stage →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function NonogramGame() {
  return (
    <ErrorBoundary game="nonogram">
      <NonogramGameInner/>
    </ErrorBoundary>
  );
}
