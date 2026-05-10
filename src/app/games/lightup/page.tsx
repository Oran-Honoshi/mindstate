"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,CheckCircle,ChevronRight,Share2}from"lucide-react";
import Link from"next/link";
import{Navbar}from"@/components/nav/Navbar";
import{generateLightUp,computeLighting,checkLightUp,type LightBoard,type LightCell}from"@/lib/games/lightUpGenerator";
import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}
function shareResult(stage:number,xp:number,elapsed:string){const text=`💡 MindState · Light Up Stage ${stage} · ${xp} XP · ${elapsed}`;const url="https://mindstate.vercel.app";if(navigator.share)navigator.share({title:"MindState",text,url}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");}
function XPBar({xpState}:{xpState:XPState}){const[snap,setSnap]=useState(()=>calculateXP(xpState));useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);}

export default function LightUpPage(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<LightBoard|null>(null);
  const[grid,setGrid]=useState<LightCell[][]>([]);
  const[lighting,setLighting]=useState<ReturnType<typeof computeLighting>>({lit:new Set(),conflicts:new Set(),blackErrors:new Set()});
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generateLightUp(`light-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setGrid(b.grid.map(row=>[...row]));
    setLighting({lit:new Set(),conflicts:new Set(),blackErrors:new Set()});
    setXpState(xp);setCompleted(false);setFinalXP(0);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user)consumeToken(user.id);
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleCell(r:number,c:number){
    if(!board||completed)return;
    const cell=grid[r][c];
    if(cell.type==="black")return;
    const ng=grid.map(row=>[...row]);
    ng[r][c]=cell.type==="bulb"?{type:"white",lit:false}:{type:"bulb"};
    setGrid(ng);
    const lt=computeLighting(ng);
    setLighting(lt);
    if(lt.conflicts.size>0||lt.blackErrors.size>0)playError();
    else playClick();
    if(checkLightUp(ng)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"lightup",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}}
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const cellSize=Math.floor(maxW/board.size);
  const totalWhite=grid.flat().filter(c=>c.type!=="black").length;
  const litCount=lighting.lit.size;

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
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()} · {board.size}×{board.size}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:"var(--text4)"}}>{litCount}/{totalWhite} lit</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="lightup"/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>
        <div style={{fontSize:11,color:"var(--text4)",textAlign:"center"}}>
          Click white cells to place 💡 bulbs · Light must reach every white cell<br/>
          Black numbers = required adjacent bulbs · Bulbs can't light each other
        </div>

        <div style={{border:"2px solid #374151",borderRadius:14,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${cellSize}px)`}}>
            {grid.map((row,r)=>row.map((cell,c)=>{
              const k=`${r},${c}`;
              const isLit=lighting.lit.has(k);
              const isConflict=lighting.conflicts.has(k);
              const isBlackErr=lighting.blackErrors.has(k);
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
                  whileTap={{scale:0.9}}
                  style={{width:cellSize,height:cellSize,display:"flex",alignItems:"center",justifyContent:"center",
                    background:isConflict?"#FEF2F2":isLit?"#FFFBEB":"#FAFAF9",
                    borderRight:"0.5px solid #E8E4DE",borderBottom:"0.5px solid #E8E4DE",borderTop:"none",borderLeft:"none",
                    cursor:"pointer",outline:"none",fontSize:Math.round(cellSize*0.5),
                    boxShadow:isLit&&!isBulb?`inset 0 0 ${cellSize/2}px rgba(253,224,71,0.3)`:"none"}}>
                  {isBulb&&<span style={{filter:isConflict?"grayscale(1)":"none"}}>💡</span>}
                </motion.button>
              );
            }))}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>
      <AnimatePresence>
        {completed&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
          <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} style={{background:"var(--surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
            <CheckCircle size={48} color="#22C55E" style={{margin:"0 auto 16px"}}/>
            <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif",marginBottom:4}}>Stage {stage} Complete</h2>
            <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>{elapsed} · {diff}</p>
            <div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}><p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4}}>XP EARNED</p><p style={{fontSize:48,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p></div>
            <button onClick={()=>shareResult(stage,finalXP,elapsed)} style={{width:"100%",marginBottom:12,padding:"11px",borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Share2 size={14}/> Share Result</button>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>Retry</button>
              <button onClick={()=>{setCompleted(false);setStage(s=>s+1);}} style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Next Stage <ChevronRight size={14}/></button>
            </div>
          </motion.div>
        </motion.div>)}
      </AnimatePresence>
    </div>
  );
}
