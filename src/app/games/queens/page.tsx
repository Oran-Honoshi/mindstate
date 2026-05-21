"use client";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,ChevronRight}from"lucide-react";
import Link from"next/link";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import{Navbar}from"@/components/nav/Navbar";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{UndoButton}from"@/components/ui/UndoButton";
import{HintButton}from"@/components/ui/HintButton";

import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import{updateStreak}from"@/lib/supabase/streaks";
import{generateQueensBoard,validateQueens,solveQueens,type QueensBoard}from"@/lib/games/queensGenerator";

import { GamePageSchema } from "@/components/seo/GamePageSchema";

function getDifficulty(s:number):Difficulty{
  if(s===1)return"medium";
  const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;
  return h<20?"easy":h<70?"medium":"hard";
}

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

function QueensGameInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => getLastStage("queens"));
  const[board,setBoard]=useState<QueensBoard|null>(null);
  const[grid,setGrid]=useState<number[][]>([]);// 0=empty,1=mark,2=queen
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[showResume,setShowResume]=useState(false);
  const[resumeData,setResumeData]=useState<Record<string,unknown>|null>(null);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[gridHistory,setGridHistory]=useState<number[][][]>([]);
  const[showFeedback,setShowFeedback]=useState(false);
  const[feedbackCells,setFeedbackCells]=useState<Set<string>>(new Set());
  const[wrongCells,setWrongCells]=useState<Set<string>>(new Set());
  const[errors,setErrors]=useState<Set<string>>(new Set());
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  // Freeze game when user leaves the app
  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) {
      timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
    }}
  );

  const pausedRef=useRef(false);

  const loadStage=useCallback((s:number)=>{
    saveGameState("queens", {stage, savedAt: Date.now()});
    const diff=getDifficulty(s);
    const b=generateQueensBoard(`queens-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);
    setGrid(Array.from({length:b.size},()=>Array(b.size).fill(0)));
    setGridHistory([]);
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

  useEffect(()=>{
    const saved=loadGameState("queens");
    if(saved&&(saved.stage as number)>1){
      setResumeData(saved);
      setShowResume(true);
    } else {
      loadStage(stage);
    }
  },[]); // mount only
  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleCellClick(r:number,c:number){
    if(!board||completed)return;
    setGridHistory(h=>[...h.slice(-19),grid.map(r=>[...r])]);
    const ng=grid.map(row=>[...row]);
    ng[r][c]=(ng[r][c]+1)%3;// 0→1→2→0
    setGrid(ng);
    playClick();

    // Check for errors (queens touching)
    const queens:[number,number][]=[];
    ng.forEach((row,ri)=>row.forEach((v,ci)=>{if(v===2)queens.push([ri,ci]);}));
    // Highlight touching queens as errors
    const errs=new Set<string>();
    const qlist:[number,number][]=[];
    ng.forEach((row,r)=>row.forEach((v,c)=>{if(v===2)qlist.push([r,c]);}));
    for(let i=0;i<qlist.length;i++)for(let j=i+1;j<qlist.length;j++){
      const[r1,c1]=qlist[i],[r2,c2]=qlist[j];
      if(Math.abs(r1-r2)<=1&&Math.abs(c1-c2)<=1){errs.add(`${r1},${c1}`);errs.add(`${r2},${c2}`);}
    }
    setErrors(errs);
    if(errs.size>0)playError();

    if(validateQueens(board,ng)&&xpState){
      const earned=Math.max(1,finalizeXP(xpState)-hintsUsed*100);
      setFinalXP(earned);setCompleted(true);
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
          markStageCompleted("queens",stage);
          if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"queens",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}
    }
  }

  function handleUndo(){
    if(gridHistory.length===0)return;
    setGrid(gridHistory[gridHistory.length-1]);
    setGridHistory(h=>h.slice(0,-1));
    setErrors(new Set());
  }

  function handleHint(){
    if(!board||hintsUsed>=3||!xpState)return;
    const solution=solveQueens(board.size,board.regions);
    if(!solution)return;
    const ng=grid.map(row=>[...row]);
    // Place the first row that doesn't have a correct queen yet
    for(const[sr,sc] of solution){
      if(ng[sr][sc]!==2){
        // Clear the whole row first (remove wrong placements)
        for(let c=0;c<board.size;c++) ng[sr][c]=0;
        ng[sr][sc]=2;
        setGrid(ng);
        setHintsUsed(h=>h+1);
        // Deduct XP by pushing startTime back 3 minutes
        setXpState(prev => prev ? {...prev, hintsUsed: Math.min((prev.hintsUsed||0)+1, prev.maxHints)} : prev);
        playError();
        return;
      }
    }
  }

  function handleCheck(){
    if(!board||!xpState)return;
    const solution=solveQueens(board.size,board.regions);
    if(!solution)return;
    const solSet=new Set(solution.map(([r,c])=>`${r},${c}`));
    const correct=new Set<string>();
    const wrong=new Set<string>();
    grid.forEach((row,r)=>row.forEach((v,c)=>{
      if(v===2){
        if(solSet.has(`${r},${c}`)) correct.add(`${r},${c}`);
        else wrong.add(`${r},${c}`);
      }
    }));
    setFeedbackCells(correct);
    setWrongCells(wrong);
    setShowFeedback(true);
    setXpState(prev => prev ? {...prev, hintsUsed: Math.min((prev.hintsUsed||0)+1, prev.maxHints)} : prev);
    setTimeout(()=>{setShowFeedback(false);setFeedbackCells(new Set());setWrongCells(new Set());},2000);
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const cellSize=Math.floor(maxW/board.size);

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      <Navbar/>
      <GamePageSchema slug="queens" />
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:16}}>

        {/* Header */}
        <div style={{width:"100%",maxWidth:540,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"var(--shadow-sm)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,overflow:"hidden",flexShrink:1}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"var(--border)"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>Queens</span>
              <div style={{width:1,height:16,background:"var(--border)"}}/>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()} · {board.size}×{board.size}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
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
                      background:showFeedback&&feedbackCells.has(`${r},${c}`)?"#DCFCE7":showFeedback&&wrongCells.has(`${r},${c}`)?"#FEF2F2":hasError?"rgba(239,68,68,0.2)":pal.fill,
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
          <UndoButton onUndo={handleUndo} canUndo={gridHistory.length>0} disabled={completed}/>
          <HintButton
            hintsLeft={3-hintsUsed}
            xpCost={100}
            onUseHint={handleHint}
            disabled={completed}/>
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
      {showMap&&<StageMap gameSlug="queens" totalStages={1000} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={diff}
        xpEarned={finalXP}
        elapsed={elapsed}
        onRetry={()=>loadStage(stage)}
        onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{
          const text=`MindState · Queens Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.vercel.app"}).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");
        }}/>
</div>
  );
}
export default function QueensGame() {
  return (
    <ErrorBoundary game="queens">
      <QueensGameInner/>
    </ErrorBoundary>
  );
}
