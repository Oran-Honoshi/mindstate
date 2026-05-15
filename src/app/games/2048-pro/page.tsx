"use client";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,ChevronRight,Share2,Trophy}from"lucide-react";
import Link from"next/link";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{Navbar}from"@/components/nav/Navbar";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{HintButton}from"@/components/ui/HintButton";

import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";

function getDifficulty(s:number):Difficulty{
  if(s===1)return"medium";
  const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;
  return h<20?"easy":h<70?"medium":"hard";
}
function shareResult(stage:number,score:number,best:number){const text=` MindState · 2048 Pro Stage ${stage} · Score: ${score} · Best tile: ${best}`;const url="https://mindstate.vercel.app";if(navigator.share)navigator.share({title:"MindState",text,url}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");}

type Grid=number[][];

const TILE_COLORS:Record<number,{bg:string;color:string}>={
  0:{bg:"#EDE0C8",color:"transparent"},
  2:{bg:"#EEE4DA",color:"#776E65"},
  4:{bg:"#EDE0C8",color:"#776E65"},
  8:{bg:"#F2B179",color:"white"},
  16:{bg:"#F59563",color:"white"},
  32:{bg:"#F67C5F",color:"white"},
  64:{bg:"#F65E3B",color:"white"},
  128:{bg:"#EDCF72",color:"white"},
  256:{bg:"#EDCC61",color:"white"},
  512:{bg:"#EDC850",color:"white"},
  1024:{bg:"#EDC53F",color:"white"},
  2048:{bg:"#EDC22E",color:"white"},
  4096:{bg:"#3C3A32",color:"white"},
  8192:{bg:"#3C3A32",color:"white"},
};

function getColor(v:number):{bg:string;color:string}{return TILE_COLORS[v]??{bg:"#3C3A32",color:"white"};}

function initGrid(seed:number):Grid{
  const g=Array.from({length:4},()=>Array(4).fill(0));
  addTile(g,seed); addTile(g,seed+1);
  return g;
}

function addTile(g:Grid,seed:number){
  const empty:number[][]=[];
  g.forEach((row,r)=>row.forEach((v,c)=>{if(v===0)empty.push([r,c]);}));
  if(!empty.length)return;
  const idx=Math.abs(seed*1664525+1013904223)%empty.length;
  const[r,c]=empty[Math.abs(idx)%empty.length];
  g[r][c]=Math.random()<0.9?2:4;
}

function compress(row:number[]):{row:number[];merged:boolean}{
  const nums=row.filter(v=>v!==0);
  let merged=false;
  for(let i=0;i<nums.length-1;i++){
    if(nums[i]===nums[i+1]){nums[i]*=2;nums.splice(i+1,1);merged=true;}
  }
  while(nums.length<4)nums.push(0);
  return{row:nums,merged};
}

function move(g:Grid,dir:"up"|"down"|"left"|"right"):{grid:Grid;score:number;moved:boolean}{
  const size=4;let score=0;let moved=false;
  const ng=g.map(r=>[...r]);
  if(dir==="left"||dir==="right"){
    for(let r=0;r<size;r++){
      const row=dir==="right"?[...ng[r]].reverse():ng[r];
      const{row:newRow,merged}=compress(row);
      const final=dir==="right"?[...newRow].reverse():newRow;
      if(final.some((v,i)=>v!==ng[r][i]))moved=true;
      ng[r]=final;
      if(merged)score+=newRow.reduce((s,v)=>s+v,0);
    }
  } else {
    for(let c=0;c<size;c++){
      const col=Array.from({length:size},(_,r)=>ng[r][c]);
      const row=dir==="down"?[...col].reverse():col;
      const{row:newRow,merged}=compress(row);
      const final=dir==="down"?[...newRow].reverse():newRow;
      if(final.some((v,i)=>v!==col[i]))moved=true;
      final.forEach((v,r)=>{ng[r][c]=v;});
      if(merged)score+=newRow.reduce((s,v)=>s+v,0);
    }
  }
  return{grid:ng,score,moved};
}

function hasWon(g:Grid,target:number){return g.some(r=>r.some(v=>v>=target));}
function hasLost(g:Grid){
  if(g.some(r=>r.some(v=>v===0)))return false;
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    if(c<3&&g[r][c]===g[r][c+1])return false;
    if(r<3&&g[r][c]===g[r+1][c])return false;
  }
  return true;
}

function XPBar({xpState}:{xpState:XPState}){
  const[snap,setSnap]=useState(()=>calculateXP(xpState));
  const[hintsUsed,setHintsUsed]=useState(0);
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);
}

function TwentyFortyEightProPageInner(){
  const{user}=useAuthStore();
  const[completed,setCompleted]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const [stage, setStage] = useState(() => getLastStage("2048-pro"));
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const[grid,setGrid]=useState<Grid>(()=>initGrid(1));
  const[score,setScore]=useState(0);
  const[bestTile,setBestTile]=useState(2);
  const[gameState,setGameState]=useState<"playing"|"won"|"lost">("playing");
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[finalXP,setFinalXP]=useState(0);
  const touchStart=useRef<{x:number;y:number}|null>(null);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  // Freeze game when user leaves the app
  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
    }}
  );


  const diff=getDifficulty(stage);
  const target=diff==="easy"?512:diff==="medium"?1024:2048;

  const loadStage=useCallback((s:number)=>{
    const d=getDifficulty(s);
    const xp=createXPState(d);
    const g=initGrid(s*997);
    setGrid(g);setScore(0);setBestTile(2);setGameState("playing");
    setXpState(xp);setFinalXP(0);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user){
      const ok=consumeToken(user.id);
      if(!ok){setShowTokenModal(true);return;}
    }
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  const handleMove=useCallback((dir:"up"|"down"|"left"|"right")=>{
    if(gameState!=="playing"||!xpState)return;
    const{grid:ng,score:s,moved}=move(grid,dir);
    if(!moved){playError();return;}
    addTile(ng,Date.now());
    const newBest=Math.max(bestTile,...ng.flat());
    setGrid(ng);setScore(prev=>prev+s);setBestTile(newBest);
    playClick();
    if(hasWon(ng,target)){
      const earned=finalizeXP(xpState);setFinalXP(earned);setGameState("won");
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
          markStageCompleted("2048-pro",stage);
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"2048-pro",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}} else if(hasLost(ng)){
      setGameState("lost");if(timerRef.current)clearInterval(timerRef.current);
    }
  },[grid,gameState,xpState,bestTile,target,stage,user]);

  useEffect(()=>{
    function onKey(e:KeyboardEvent){
      const map:Record<string,"up"|"down"|"left"|"right">={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
      if(map[e.key]){e.preventDefault();handleMove(map[e.key]);}
    }
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[handleMove]);

  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,360):320;
  const cellSize=Math.floor((maxW-12)/4);

  return(
    <div style={{minHeight:"100vh",background:"#FAF8EF",display:"flex",flexDirection:"column"}}>
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:16}}>
        <div style={{width:"100%",maxWidth:400,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>2048 Pro</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>TARGET {target}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="2048-pro" onOpen={()=>{if(timerRef.current){clearInterval(timerRef.current);}}} onClose={()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}}}/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          {xpState&&<XPBar xpState={xpState}/>}
        </div>

        {/* Score */}
        <div style={{display:"flex",gap:12}}>
          {[{label:"Score",value:score},{label:"Best Tile",value:bestTile}].map(s=>(
            <div key={s.label} style={{background:"#BBADA0",borderRadius:12,padding:"10px 20px",textAlign:"center",minWidth:90}}>
              <p style={{fontSize:10,fontWeight:700,color:"#EEE4DA",letterSpacing:"0.1em",marginBottom:2}}>{s.label.toUpperCase()}</p>
              <p style={{fontSize:20,fontWeight:700,color:"white",fontFamily:"Georgia,serif"}}>{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Board */}
        <div
          style={{background:"#BBADA0",borderRadius:16,padding:8,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",touchAction:"none"}}
          onTouchStart={e=>{const t=e.touches[0];touchStart.current={x:t.clientX,y:t.clientY};}}
          onTouchEnd={e=>{
            if(!touchStart.current)return;
            const t=e.changedTouches[0];
            const dx=t.clientX-touchStart.current.x;
            const dy=t.clientY-touchStart.current.y;
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
                <motion.div key={`${r}-${c}-${val}`}
                  initial={val>0?{scale:0.8,opacity:0}:{}}
                  animate={{scale:1,opacity:1}}
                  transition={{type:"spring",stiffness:400,damping:25}}
                  style={{width:cellSize,height:cellSize,borderRadius:8,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize,fontWeight:700,color,boxShadow:val>=8?"0 2px 8px rgba(0,0,0,0.2)":"none"}}>
                  {val||""}
                </motion.div>
              );
            }))}
          </div>
        </div>

        <div style={{fontSize:11,color:"var(--text4)",textAlign:"center"}}>Arrow keys or swipe to move · Reach {target} to win</div>

        {/* Direction buttons for mobile */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,48px)",gridTemplateRows:"repeat(2,48px)",gap:6}}>
          {[
            {dir:"up",label:"↑",col:2,row:1},
            {dir:"left",label:"←",col:1,row:2},
            {dir:"down",label:"↓",col:2,row:2},
            {dir:"right",label:"→",col:3,row:2},
          ].map(btn=>(
            <button key={btn.dir} onClick={()=>handleMove(btn.dir as any)}
              style={{gridColumn:btn.col,gridRow:btn.row,width:48,height:48,borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,0.06)"}}>
              {btn.label}
            </button>
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
              setXpState(prev => prev ? {...prev, hintsUsed: Math.min(prev.hintsUsed + 1, prev.maxHints)} : prev);
            }}
            disabled={completed}/>
          </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      <AnimatePresence>
        {(gameState==="won"||gameState==="lost")&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{background:"var(--surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              {gameState==="won"
                ?<Trophy size={48} color="#F59E0B" style={{margin:"0 auto 16px"}}/>
                :<div style={{fontSize:48,marginBottom:16}}></div>}
              <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif",marginBottom:4}}>
                {gameState==="won"?`${target} Reached!`:"Game Over"}
              </h2>
              <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>
                Score: {score.toLocaleString()} · Best: {bestTile}
              </p>
              {gameState==="won"&&(
                <div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}>
                  <p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4}}>XP EARNED</p>
                  <p style={{fontSize:48,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p>
                </div>
              )}
              {gameState==="won"&&(
                <button onClick={()=>shareResult(stage,score,bestTile)}
                  style={{width:"100%",marginBottom:12,padding:"11px",borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <Share2 size={14}/> Share Result
                </button>
              )}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>Retry</button>
                <button onClick={()=>{setStage(s=>s+1);}}
                  style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  Next Stage <ChevronRight size={14}/>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    
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

export default function TwentyFortyEightProPage() {
  return (
    <ErrorBoundary game="2048-pro">
      <TwentyFortyEightProPageInner/>
    </ErrorBoundary>
  );
}
