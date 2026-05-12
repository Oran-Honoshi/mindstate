"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,CheckCircle,ChevronRight,Share2}from"lucide-react";
import Link from"next/link";
import{Navbar}from"@/components/nav/Navbar";
import{generateGravitySort,checkGravitySort,type GravityBoard}from"@/lib/games/gravitySortGenerator";
import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{HintButton}from"@/components/ui/HintButton";
import{ShowSolution}from"@/components/ui/ShowSolution";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}
function shareResult(stage:number,xp:number,elapsed:string){const text=` MindState · Gravity Sort Stage ${stage} · ${xp} XP · ${elapsed}`;const url="https://mindstate.vercel.app";if(navigator.share)navigator.share({title:"MindState",text,url}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");}
function XPBar({xpState}:{xpState:XPState}){const[snap,setSnap]=useState(()=>calculateXP(xpState));useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);}

export default function GravitySortPage(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<GravityBoard|null>(null);
  const[blocks,setBlocks]=useState<number[][]>([]);
  const[selected,setSelected]=useState<number|null>(null);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const[moves,setMoves]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generateGravitySort(`gravity-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setBlocks(b.blocks.map(col=>[...col]));setSelected(null);
    setXpState(xp);setCompleted(false);setFinalXP(0);setElapsed("00:00");setMoves(0);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user)consumeToken(user.id);
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleColClick(col:number){
    if(!board||completed)return;
    if(selected===null){
      if(blocks[col].length===0)return;
      setSelected(col);playClick();
    } else {
      if(selected===col){setSelected(null);return;}
      // Move top block from selected to col
      if(blocks[col].length>=board.rows){playError();setSelected(null);return;}
      if(blocks[selected].length===0){setSelected(col);return;}
      const nb=blocks.map(c=>[...c]);
      const block=nb[selected].pop()!;
      nb[col].push(block);
      setBlocks(nb);setSelected(null);setMoves(m=>m+1);playClick();
      if(checkGravitySort(board,nb)&&xpState){
        const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
        if(timerRef.current)clearInterval(timerRef.current);
        playSuccess();setTimeout(()=>triggerConfetti(),80);
        if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"gravity-sort",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}}
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const blockSize=56;const gap=8;

  return(
    <div className="game-page">
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:20}}>
        <div style={{width:"100%",maxWidth:520,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"var(--text4)"}}>Moves: {moves}</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="gravity-sort" onOpen={()=>{if(timerRef.current){clearInterval(timerRef.current);}}} onClose={()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}}}/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{fontSize:11,color:"var(--text4)",textAlign:"center"}}>
          Click a column to pick up its top block · Click another to drop it
          <br/>Sort each color into its own column
        </div>

        {/* Target indicator */}
        <div style={{display:"flex",gap:gap}}>
          {board.colors.map((color,i)=>(
            <div key={i} style={{width:blockSize,textAlign:"center"}}>
              <div style={{width:blockSize,height:6,borderRadius:3,background:color,opacity:0.4,marginBottom:2}}/>
              <span style={{fontSize:9,color:"var(--text4)"}}>col {i+1}</span>
            </div>
          ))}
          {Array.from({length:board.cols-board.colors.length},(_,i)=>(
            <div key={`empty-${i}`} style={{width:blockSize,textAlign:"center"}}>
              <div style={{width:blockSize,height:6,borderRadius:3,background:"#E2E8F0",marginBottom:2}}/>
              <span style={{fontSize:9,color:"var(--text4)"}}>free</span>
            </div>
          ))}
        </div>

        {/* Columns */}
        <div style={{display:"flex",gap:gap,alignItems:"flex-end"}}>
          {blocks.map((col,ci)=>{
            const isSelected=selected===ci;
            const colColor=ci<board.colors.length?board.colors[ci]:undefined;
            const isSorted=col.length>0&&col.every(b=>b===ci)&&ci<board.colors.length;
            return(
              <motion.div key={ci}
                onClick={()=>handleColClick(ci)}
                animate={isSelected?{y:-8}:{y:0}}
                transition={{type:"spring",stiffness:400,damping:25}}
                style={{cursor:"pointer",display:"flex",flexDirection:"column-reverse",gap:4,
                  width:blockSize,minHeight:board.rows*blockSize+board.rows*4,
                  background:isSelected?"rgba(79,110,247,0.06)":"#F8F7F5",
                  borderRadius:14,padding:6,border:`2px solid ${isSelected?"#4F6EF7":isSorted?"#22C55E":"#E2E8F0"}`,
                  transition:"border-color 0.2s,background 0.2s",
                  position:"relative"}}>
                {col.map((block,bi)=>(
                  <motion.div key={`${ci}-${bi}`}
                    initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}}
                    transition={{type:"spring",stiffness:400,damping:25}}
                    style={{width:"100%",height:blockSize-12,borderRadius:10,
                      background:board.colors[block],
                      boxShadow:`0 3px 10px ${board.colors[block]}60`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:18,flexShrink:0}}>
                    {bi===col.length-1&&isSelected&&"↑"}
                  </motion.div>
                ))}
                {isSorted&&(
                  <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",fontSize:16}}></div>
                )}
              </motion.div>
            );
          })}
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
            <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>{moves} moves · {elapsed}</p>
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
