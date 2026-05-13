"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { generateBridges, checkBridges, type BridgesBoard, type Bridge } from "@/lib/games/bridgesGenerator";
import { createXPState, calculateXP, finalizeXP, formatElapsed, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { HintButton } from "@/components/ui/HintButton";
import { CheckProgressButton } from "@/components/ui/CheckProgressButton";
import { GameInstructions } from "@/components/ui/GameInstructions";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}
function shareResult(stage:number,xp:number,elapsed:string){const text=` MindState · Bridges Stage ${stage} · ${xp} XP · ${elapsed}`;const url="https://mindstate.vercel.app";if(navigator.share)navigator.share({title:"MindState",text,url}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");}
function XPBar({xpState}:{xpState:XPState}){const[snap,setSnap]=useState(()=>calculateXP(xpState));useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);}

function BridgesGameInner(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<BridgesBoard|null>(null);
  const[placed,setPlaced]=useState<Bridge[]>([]);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const [feedbackBridges, setFeedbackBridges] = useState<Set<string>>(new Set());
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generateBridges(`bridges-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setPlaced([]);setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);setShowFeedback(false);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user){
      const ok=consumeToken(user.id);
      if(!ok){setShowTokenModal(true);return;}
    }
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function toggleBridge(fromId:number,toId:number){
    if(!board||completed)return;
    const existing=placed.find(b=>(b.from===fromId&&b.to===toId)||(b.from===toId&&b.to===fromId));
    let np:Bridge[];
    if(!existing) np=[...placed,{from:fromId,to:toId,count:1}];
    else if(existing.count===1) np=placed.map(b=>b===existing?{...b,count:2 as 2}:b);
    else np=placed.filter(b=>b!==existing);
    setPlaced(np); playClick();
    if(checkBridges(board,np)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      if(user)saveScore({user_id:user.id,game_slug:"bridges",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p></div>);

  const diff=getDifficulty(stage);const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const cellSize=Math.floor(maxW/board.size);

  function getBridgeBetween(a:number,b:number){return placed.find(br=>(br.from===a&&br.to===b)||(br.from===b&&br.to===a));}

  function islandStatus(island:{required:number;id:number}){
    const total=placed.filter(b=>b.from===island.id||b.to===island.id).reduce((s,b)=>s+b.count,0);
    return total===island.required?"done":total>island.required?"over":"under";
  }

  return(
    <div className="game-page">
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>
        <div style={{width:"100%",maxWidth:540,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="bridges" onOpen={()=>{if(timerRef.current){clearInterval(timerRef.current);}}} onClose={()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}}}/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>
        <div style={{fontSize:11,color:"var(--text4)"}}>Click between islands to add bridges · Each island shows its required count</div>

        {/* SVG Board */}
        <svg width={board.size*cellSize} height={board.size*cellSize} style={{borderRadius:16,border:"1.5px solid #E2E8F0",background:"#FAFAF9",boxShadow:"0 8px 24px rgba(0,0,0,0.07)"}}>
          {/* Bridges */}
          {board.islands.map(island=>
            board.islands.map(other=>{
              if(other.id<=island.id)return null;
              const sameRow=island.r===other.r;
              const sameCol=island.c===other.c;
              if(!sameRow&&!sameCol)return null;
              // Check no island in between
              const blocked=board.islands.some(mid=>{
                if(mid.id===island.id||mid.id===other.id)return false;
                if(sameRow&&mid.r===island.r&&Math.min(island.c,other.c)<mid.c&&mid.c<Math.max(island.c,other.c))return true;
                if(sameCol&&mid.c===island.c&&Math.min(island.r,other.r)<mid.r&&mid.r<Math.max(island.r,other.r))return true;
                return false;
              });
              if(blocked)return null;
              const bridge=getBridgeBetween(island.id,other.id);
              const x1=(island.c+0.5)*cellSize,y1=(island.r+0.5)*cellSize;
              const x2=(other.c+0.5)*cellSize,y2=(other.r+0.5)*cellSize;
              const midX=(x1+x2)/2,midY=(y1+y2)/2;
              return(
                <g key={`${island.id}-${other.id}`} onClick={()=>toggleBridge(island.id,other.id)} style={{cursor:"pointer"}}>
                  {/* Clickable area */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={cellSize*0.7}/>
                  {bridge&&(
                    <>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth={bridge.count===2?3:2} opacity={0.7}
                        strokeDasharray={bridge.count===2?"none":"none"}/>
                      {bridge.count===2&&<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FAFAF9" strokeWidth={1}/>}
                    </>
                  )}
                  {!bridge&&(
                    <circle cx={midX} cy={midY} r={cellSize*0.12} fill="#E2E8F0" opacity={0.6}/>
                  )}
                </g>
              );
            })
          )}
          {/* Islands */}
          {board.islands.map(island=>{
            const status=islandStatus(island);
            const x=(island.c+0.5)*cellSize,y=(island.r+0.5)*cellSize;
            const r=cellSize*0.3;
            const bgColor=status==="done"?"#22C55E":status==="over"?"#EF4444":"#4F6EF7";
            return(
              <g key={island.id}>
                <circle cx={x} cy={y} r={r} fill={bgColor} opacity={status==="done"?1:0.85}/>
                <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
                  style={{fontSize:Math.round(r*1.1),fontWeight:700,fill:"white",userSelect:"none"}}>
                  {island.required}
                </text>
              </g>
            );
          })}
        </svg>


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
          const text=`MindState · Bridges Stage ${stage} · ${finalXP} XP · ${elapsed}`;
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

export default function BridgesGame() {
  return (
    <ErrorBoundary game="bridges">
      <BridgesGameInner/>
    </ErrorBoundary>
  );
}
