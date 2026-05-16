"use client";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,CheckCircle,ChevronRight,Share2}from"lucide-react";
import Link from"next/link";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{Navbar}from"@/components/nav/Navbar";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{HintButton}from"@/components/ui/HintButton";

import{generateGravitySort,checkGravitySort,type GravityBoard}from"@/lib/games/gravitySortGenerator";
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
function shareResult(stage:number,xp:number,elapsed:string){const text=` MindState · Gravity Sort Stage ${stage} · ${xp} XP · ${elapsed}`;const url="https://mindstate.vercel.app";if(navigator.share)navigator.share({title:"MindState",text,url}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");}
function XPBar({xpState}:{xpState:XPState}){const[snap,setSnap]=useState(()=>calculateXP(xpState));useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);}

function GravitySortPageInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => getLastStage("gravity-sort"));
  const[board,setBoard]=useState<GravityBoard|null>(null);
  const[blocks,setBlocks]=useState<number[][]>([]);
  const[selected,setSelected]=useState<number|null>(null);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[showResume,setShowResume]=useState(false);
  const[resumeData,setResumeData]=useState<Record<string,unknown>|null>(null);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const[moves,setMoves]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  // Freeze game when user leaves the app
  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
    }}
  );


  const loadStage=useCallback((s:number)=>{
    saveGameState("gravity-sort", {stage, savedAt: Date.now()});
    const diff=getDifficulty(s);
    const b=generateGravitySort(`gravity-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setBlocks(b.blocks.map(col=>[...col]));setSelected(null);
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);setShowFeedback(false);setElapsed("00:00");setMoves(0);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user){
      const ok=consumeToken(user.id);
      if(!ok){setShowTokenModal(true);return;}
    }
  },[user]);

  useEffect(()=>{
    const saved=loadGameState("gravity-sort");
    if(saved&&(saved.stage as number)>1){
      setResumeData(saved);
      setShowResume(true);
    } else {
      loadStage(stage);
    }
  },[]); // mount only
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
        clearGameState("gravity-sort");
        if(timerRef.current)clearInterval(timerRef.current);
        playSuccess();setTimeout(()=>triggerConfetti(),80);
          markStageCompleted("gravity-sort",stage);
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
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,overflow:"hidden",flexShrink:1}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>Gravity Sort</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"var(--text4)"}}>Moves: {moves}</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="gravity-sort" onOpen={()=>{if(timerRef.current){clearInterval(timerRef.current);}}} onClose={()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}}}/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
              <button onClick={()=>setShowMap(true)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",fontSize:11,fontWeight:600}}>⊞</button>
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


        {/* Controls */}
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <HintButton
            hintsLeft={3-hintsUsed}
            xpCost={100}
            onUseHint={()=>{
              if(!board||!xpState||hintsUsed>=3||completed)return;
              // Find first block that is in wrong column and has a correct destination
              for(let fromCol=0;fromCol<blocks.length;fromCol++){
                const col=blocks[fromCol];
                if(col.length===0)continue;
                const topBlock=col[col.length-1];
                // This block belongs in column topBlock (each color maps to its index)
                if(fromCol===topBlock)continue; // already correct
                const toCol=topBlock;
                if(blocks[toCol].length<board.rows){
                  // Valid move: flash both columns
                  setSelected(fromCol);
                  setTimeout(()=>{
                    const nb=blocks.map((c:number[])=>[...c]);
                    const block=nb[fromCol].pop()!;
                    nb[toCol].push(block);
                    setBlocks(nb);setSelected(null);setMoves(m=>m+1);
                    playError();
                  },600);
                  setHintsUsed(h=>h+1);
                  setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
                  return;
                }
              }
              // No direct move found — just deduct XP
              setHintsUsed(h=>h+1);
              setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
            }}
            disabled={completed}/>
          </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      
      
      <OutOfTokensModal
        gameName="Gravity Sort"
        open={showTokenModal}
        onClose={()=>setShowTokenModal(false)}/>
      {showMap&&<StageMap gameSlug="gravity-sort" totalStages={1000} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={getDifficulty(stage)}
        xpEarned={finalXP}
        elapsed={elapsed}
        onRetry={()=>loadStage(stage)}
        onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{
          const text=`MindState · Gravity Sort Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.vercel.app"}).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");
        }}/>
</div>
  );
}

export default function GravitySortPage() {
  return (
    <ErrorBoundary game="gravity-sort">
      <GravitySortPageInner/>
    </ErrorBoundary>
  );
}
