"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
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

function getDifficulty(stage: number): Difficulty {
  return stage<=300?"easy":stage<=700?"medium":"hard";
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

export default function NonogramGame() {
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<NonogramBoard|null>(null);
  const[grid,setGrid]=useState<(boolean|null)[][]>([]);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const[mode,setMode]=useState<"fill"|"cross">("fill");
  const[dragging,setDragging]=useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generateNonogram(`nono-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setGrid(Array.from({length:b.size},()=>Array(b.size).fill(null)));
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);setShowFeedback(false);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user)consumeToken(user.id);
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleCell(r:number,c:number){
    if(!board||completed)return;
    const ng=grid.map(row=>[...row]);
    if(mode==="fill") ng[r][c]=ng[r][c]===true?null:true;
    else ng[r][c]=ng[r][c]===false?null:false;
    setGrid(ng); playClick();
    if(checkNonogram(board,ng)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      if(user)saveScore({user_id:user.id,game_slug:"nonogram",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});
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

        {/* Mode toggle */}
        <div style={{display:"flex",background:"var(--bg3)",borderRadius:14,padding:3,gap:2}}>
          {(["fill","cross"] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              style={{padding:"7px 16px",borderRadius:11,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                background:mode===m?"white":"transparent",color:mode===m?"#1C1917":"#94A3B8",
                boxShadow:mode===m?"0 2px 8px rgba(0,0,0,0.08)":"none",transition:"all 0.15s"}}>
              {m==="fill"?"■ Fill":" Cross"}
            </button>
          ))}
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
                      background:val===true?"#1C1917":val===false?"#F8F7F5":"white",
                      borderRight:"0.5px solid #E2E8F0",borderBottom:"0.5px solid #E2E8F0",borderTop:"none",borderLeft:"none",
                      cursor:"pointer",outline:"none",fontSize:cellSize*0.4,color:"var(--text4)",fontWeight:700}}>
                    {val===false&&""}
                  </motion.button>
                );
              })}
            </div>
          ))}
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
          const text=`MindState · Nonogram Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.vercel.app"}).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");
        }}/>

    </div>
  );
}
