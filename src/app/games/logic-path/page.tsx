"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,CheckCircle,ChevronRight,Share2,Lock}from"lucide-react";
import Link from"next/link";
import{Navbar}from"@/components/nav/Navbar";
import{generateLogicPath,rotatePipe,checkLogicPath,type LogicBoard,type PipeCell}from"@/lib/games/logicPathGenerator";
import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}
function shareResult(stage:number,xp:number,elapsed:string){const text=`⌀ MindState · Logic Path Stage ${stage} · ${xp} XP · ${elapsed}`;const url="https://mindstate.vercel.app";if(navigator.share)navigator.share({title:"MindState",text,url}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");}
function XPBar({xpState}:{xpState:XPState}){const[snap,setSnap]=useState(()=>calculateXP(xpState));useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);}

function PipeSVG({connections,color,size}:{connections:boolean[];color:string;size:number}){
  const c=size/2;const w=size*0.15;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {connections[0]&&<rect x={c-w/2} y={0} width={w} height={c} fill={color} rx={w/2}/>}
      {connections[1]&&<rect x={c} y={c-w/2} width={c} height={w} fill={color} rx={w/2}/>}
      {connections[2]&&<rect x={c-w/2} y={c} width={w} height={c} fill={color} rx={w/2}/>}
      {connections[3]&&<rect x={0} y={c-w/2} width={c} height={w} fill={color} rx={w/2}/>}
      <circle cx={c} cy={c} r={w*0.8} fill={color}/>
    </svg>
  );
}

export default function LogicPathPage(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<LogicBoard|null>(null);
  const[grid,setGrid]=useState<PipeCell[][]>([]);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generateLogicPath(`logic-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setGrid(b.grid.map(row=>row.map(cell=>({...cell,connections:[...cell.connections]}))));
    setXpState(xp);setCompleted(false);setFinalXP(0);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user)consumeToken(user.id);
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleRotate(r:number,c:number){
    if(!board||completed||grid[r][c].locked)return;
    const ng=grid.map(row=>row.map(cell=>({...cell,connections:[...cell.connections]})));
    ng[r][c].connections=rotatePipe(ng[r][c].connections);
    setGrid(ng);playClick();
    if(checkLogicPath(ng)&&xpState){
      const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"logic-path",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const cellSize=Math.floor(maxW/board.size);

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
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="logic-path"/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>
        <div style={{fontSize:11,color:"var(--text4)"}}>Click to rotate pipes · Connect all pipes so no end is open · 🔒 = locked</div>

        <div style={{border:"2px solid #E2E8F0",borderRadius:16,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.07)"}}>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${board.size},${cellSize}px)`}}>
            {grid.map((row,r)=>row.map((cell,c)=>{
              const valid=checkLogicPath(grid);
              return(
                <motion.button key={`${r}-${c}`}
                  onClick={()=>handleRotate(r,c)}
                  whileTap={!cell.locked?{scale:0.9}:{}}
                  style={{width:cellSize,height:cellSize,display:"flex",alignItems:"center",justifyContent:"center",
                    background:cell.locked?"#F8F7F5":"white",
                    borderRight:"0.5px solid #F0EDE8",borderBottom:"0.5px solid #F0EDE8",borderTop:"none",borderLeft:"none",
                    cursor:cell.locked?"not-allowed":"pointer",outline:"none",position:"relative"}}>
                  <PipeSVG connections={cell.connections} color={cell.color} size={cellSize-4}/>
                  {cell.locked&&<Lock size={10} color="#94A3B8" style={{position:"absolute",top:4,right:4}}/>}
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
