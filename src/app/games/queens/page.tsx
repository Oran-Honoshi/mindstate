"use client";
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,ChevronRight}from"lucide-react";
import Link from"next/link";
import{Navbar}from"@/components/nav/Navbar";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{HintButton}from"@/components/ui/HintButton";
import{CheckProgressButton}from"@/components/ui/CheckProgressButton";

import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import{updateStreak}from"@/lib/supabase/streaks";
import{generateQueensBoard,validateQueens,type QueensBoard}from"@/lib/games/queensGenerator";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}

const REGION_COLORS=[
  {fill:"#DBEAFE",border:"#1D4ED8",queen:"#1E3A8A"},
  {fill:"#FED7AA",border:"#C2410C",queen:"#7C2D12"},
  {fill:"#BBF7D0",border:"#15803D",queen:"#14532D"},
  {fill:"#E9D5FF",border:"#7C3AED",queen:"#4C1D95"},
  {fill:"#FECDD3",border:"#BE123C",queen:"#881337"},
  {fill:"#FDE68A",border:"#B45309",queen:"#78350F"},
  {fill:"#CFFAFE",border:"#0E7490",queen:"#164E63"},
  {fill:"#D1FAE5",border:"#065F46",queen:"#064E3B"},
];

function XPBar({xpState}:{xpState:XPState}){
  const[snap,setSnap]=useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}>
        <motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span>
      <span style={{fontSize:11,color:"var(--text4)"}}>XP</span>
    </div>
  );
}

export default function QueensGame(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<QueensBoard|null>(null);
  const[grid,setGrid]=useState<number[][]>([]);// 0=empty,1=mark,2=queen
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const[errors,setErrors]=useState<Set<string>>(new Set());
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const pausedRef=useRef(false);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generateQueensBoard(`queens-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);
    setGrid(Array.from({length:b.size},()=>Array(b.size).fill(0)));
    setXpState(xp);setCompleted(false);setFinalXP(0);
    setElapsed("00:00");setHintsUsed(0);setShowFeedback(false);setErrors(new Set());
    if(timerRef.current)clearInterval(timerRef.current);
    pausedRef.current=false;
    timerRef.current=setInterval(()=>{
      if(!pausedRef.current)setElapsed(formatElapsed(xp.startTime));
    },1000);
    if(user){
      const ok=consumeToken(user.id);
      if(!ok){setShowTokenModal(true);return;}
    }
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleCellClick(r:number,c:number){
    if(!board||completed)return;
    const ng=grid.map(row=>[...row]);
    ng[r][c]=(ng[r][c]+1)%3;// 0→1→2→0
    setGrid(ng);
    playClick();

    // Check for errors (queens touching)
    const queens:[number,number][]=[];
    ng.forEach((row,ri)=>row.forEach((v,ci)=>{if(v===2)queens.push([ri,ci]);}));
    const placedMap2=new Map<string,boolean>();
    ng.forEach((row,ri)=>row.forEach((v,ci)=>{if(v===2)placedMap2.set(`${ri},${ci}`,true);}));
    const {errors:errs}=validateQueens(placedMap2,board.solution);
    setErrors(errs);
    if(errs.size>0)playError();

    const vq=validateQueens(placedMap2,board.solution);
    if(vq.correct&&xpState){
      const earned=Math.max(1,finalizeXP(xpState)-hintsUsed*100);
      setFinalXP(earned);setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"queens",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}
    }
  }

  function handleHint(){
    if(!board||hintsUsed>=3||!xpState)return;
    // Place one correct queen
    const sol=board.solution;
    const ng=grid.map(row=>[...row]);
    for(let r=0;r<board.size;r++){
      for(let c=0;c<board.size;c++){
        if(sol[r][c]===2&&ng[r][c]!==2){
          ng[r][c]=2;
          setGrid(ng);setHintsUsed(h=>h+1);
          xpState.startTime=xpState.startTime-60000;
          playClick();return;
        }
      }
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const cellSize=Math.floor(maxW/board.size);

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:16}}>

        {/* Header */}
        <div style={{width:"100%",maxWidth:540,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"var(--shadow-sm)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"var(--border)"}}/>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()} · {board.size}×{board.size}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="queens"
                onOpen={()=>{pausedRef.current=true;}}
                onClose={()=>{pausedRef.current=false;}}/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{fontSize:11,color:"var(--text4)",textAlign:"center"}}>
          Tap once = mark · Tap twice = queen · Tap three times = clear · One queen per row, column and region
        </div>

        {/* Board */}
        <div style={{border:"2px solid #374151",borderRadius:12,overflow:"hidden",boxShadow:"var(--shadow-md)"}}>
          {grid.map((row,r)=>(
            <div key={r} style={{display:"flex"}}>
              {row.map((val,c)=>{
                const rid=board.regions[r][c];
                const pal=REGION_COLORS[rid%REGION_COLORS.length];
                const isQueen=val===2;
                const isMark=val===1;
                const hasError=errors.has(`${r},${c}`);
                const rightBorder=c<board.size-1&&board.regions[r][c+1]!==rid;
                const bottomBorder=r<board.size-1&&board.regions[r+1][c]!==rid;
                return(
                  <button
                    key={c}
                    onClick={()=>handleCellClick(r,c)}
                    style={{
                      width:cellSize,height:cellSize,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      background:hasError?"rgba(239,68,68,0.2)":pal.fill,
                      cursor:"pointer",outline:"none",
                      borderRight:rightBorder?`2px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.1)",
                      borderBottom:bottomBorder?`2px solid ${pal.border}`:"0.5px solid rgba(0,0,0,0.1)",
                      borderTop:"none",borderLeft:"none",
                      fontSize:Math.round(cellSize*0.5),
                      transition:"background 0.1s",
                      position:"relative",
                    }}>
                    {isMark&&<span style={{color:"#64748B",fontWeight:700,lineHeight:1,fontSize:Math.round(cellSize*0.4)}}>✕</span>}
                    {isQueen&&(
                      <motion.span
                        initial={{scale:0}}
                        animate={{scale:1}}
                        style={{color:hasError?"#EF4444":pal.queen,lineHeight:1,fontSize:Math.round(cellSize*0.5)}}>
                        ♛
                      </motion.span>
                    )}
                  </button>
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
            onUseHint={handleHint}
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

        {/* Stage nav */}
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      
      <OutOfTokensModal
        gameName="Queens"
        open={showTokenModal}
        onClose={()=>setShowTokenModal(false)}/>
      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={diff}
        xpEarned={finalXP}
        maxXP={xpState?.maxXP??1000}
        elapsed={elapsed}
        onRetry={()=>loadStage(stage)}
        onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{
          const text=`MindState · Queens Stage ${stage} · ${finalXP} XP · ${elapsed}`;
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
