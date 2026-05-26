"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "queens";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ChevronRight}from"lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import{createXPState,calculateXP,finalizeXP,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import{updateStreak}from"@/lib/supabase/streaks";
import{generateQueensBoard,validateQueens,solveQueens,type QueensBoard}from"@/lib/games/queensGenerator";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";

function getDifficulty(s:number):Difficulty{
  if(s===1)return"medium";
  const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;
  return h<20?"easy":h<70?"medium":"hard";
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const REGION_COLORS_LIGHT=[
  {fill:"#DBEAFE",border:"#1D4ED8",queen:"#1E3A8A"},
  {fill:"#FED7AA",border:"#C2410C",queen:"#7C2D12"},
  {fill:"#BBF7D0",border:"#15803D",queen:"#14532D"},
  {fill:"#E9D5FF",border:"#7C3AED",queen:"#4C1D95"},
  {fill:"#FECDD3",border:"#BE123C",queen:"#881337"},
  {fill:"#FDE68A",border:"#B45309",queen:"#78350F"},
  {fill:"#CFFAFE",border:"#0E7490",queen:"#164E63"},
  {fill:"#D1FAE5",border:"#065F46",queen:"#064E3B"},
];

const REGION_COLORS_DARK=[
  {fill:"rgba(59,130,246,0.12)",  border:"rgba(96,165,250,0.4)",  queen:"#60A5FA"},
  {fill:"rgba(249,115,22,0.10)",  border:"rgba(251,146,60,0.4)",  queen:"#FB923C"},
  {fill:"rgba(34,197,94,0.10)",   border:"rgba(74,222,128,0.4)",  queen:"#4ADE80"},
  {fill:"rgba(168,85,247,0.12)",  border:"rgba(192,132,252,0.4)", queen:"#C084FC"},
  {fill:"rgba(255,68,68,0.10)",   border:"rgba(252,165,165,0.4)", queen:"#FCA5A5"},
  {fill:"rgba(234,179,8,0.10)",   border:"rgba(253,224,71,0.4)",  queen:"#FDE047"},
  {fill:"rgba(6,182,212,0.10)",   border:"rgba(0,255,255,0.4)",  queen:"var(--color-accent-primary)"},
  {fill:"rgba(16,185,129,0.10)",  border:"rgba(52,211,153,0.4)",  queen:"#34D399"},
];

function useIsDark(){
  const[dark,setDark]=useState(false);
  useEffect(()=>{
    const check=()=>setDark(document.documentElement.getAttribute("data-theme")==="dark");
    check();
    const obs=new MutationObserver(check);
    obs.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
    return()=>obs.disconnect();
  },[]);
  return dark;
}

function QueensGameInner(){
  const{user}=useAuthStore();
  const isDark=useIsDark();
  const REGION_COLORS=isDark?REGION_COLORS_DARK:REGION_COLORS_LIGHT;

  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[board,setBoard]=useState<QueensBoard|null>(null);
  const[grid,setGrid]=useState<number[][]>([]);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[completed,setCompleted]=useState(false);
  const[showResume,setShowResume]=useState(false);
  const[resumeData,setResumeData]=useState<Record<string,unknown>|null>(null);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[gridHistory,setGridHistory]=useState<number[][][]>([]);
  const[errors,setErrors]=useState<Set<string>>(new Set());
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const pausedRef=useRef(false);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => {
      if (xpState && !completed) {
        timerRef.current = setInterval(() => {
          if (!pausedRef.current) {
            setElapsedSeconds(Math.floor((Date.now() - xpState.startTime) / 1000));
            setLiveXP(calculateXP(xpState).currentXP);
          }
        }, 500);
      }
    }
  );

  useEffect(()=>{
    let cancelled=false;
    getLastStageRemote(GAME_SLUG).then(remote=>{
      if(cancelled)return;
      if(remote>0&&remote>stage)setStage(remote);
    });
    return()=>{cancelled=true;};
  },[]);

  const loadStage=useCallback((s:number)=>{
    const currentUser=useAuthStore.getState().user;
    if(currentUser){const ok=consumeToken(currentUser.id);if(!ok){setShowTokenModal(true);return;}}
    saveGameState(GAME_SLUG,{stage:s,savedAt:Date.now()});
    const diff=getDifficulty(s);
    const b=generateQueensBoard(`queens-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);
    setGrid(Array.from({length:b.size},()=>Array(b.size).fill(0)));
    setGridHistory([]);
    setXpState(xp);setCompleted(false);setFinalXP(0);
    setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");
    setHintsUsed(0);setErrors(new Set());
    setSolutionRevealed(false);setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    pausedRef.current=false;
    timerRef.current=setInterval(()=>{
      if(!pausedRef.current){
        setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));
        setLiveXP(calculateXP(xp).currentXP);
      }
    },500);
  },[]);

  const resumeChecked=useRef(false);
  useEffect(()=>{
    if(!resumeChecked.current){
      resumeChecked.current=true;
      const saved=loadGameState(GAME_SLUG);
      if(saved&&(saved.stage as number)>1){setResumeData(saved);setShowResume(true);}
    }
    loadStage(stage);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[stage,loadStage]);

  function handleRevealSolution(){
    if(!board||!xpState)return;
    const solution=solveQueens(board.size,board.regions);
    if(!solution)return;
    const ng=Array.from({length:board.size},()=>Array(board.size).fill(0));
    solution.forEach(([r,c])=>{ng[r][c]=2;});
    setGrid(ng);setErrors(new Set());setSolutionRevealed(true);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  function handleCellClick(r:number,c:number){
    if(!board||completed||solutionRevealed)return;
    setGridHistory(h=>[...h.slice(-19),grid.map(r=>[...r])]);
    const ng=grid.map(row=>[...row]);
    ng[r][c]=(ng[r][c]+1)%3;
    setGrid(ng);
    saveGameState(GAME_SLUG,{stage,grid:ng,hintsUsed,startTime:xpState?.startTime,savedAt:Date.now()});
    playClick();
    const qlist:[number,number][]=[];
    ng.forEach((row,ri)=>row.forEach((v,ci)=>{if(v===2)qlist.push([ri,ci]);}));
    const errs=new Set<string>();
    for(let i=0;i<qlist.length;i++)for(let j=i+1;j<qlist.length;j++){
      const[r1,c1]=qlist[i],[r2,c2]=qlist[j];
      if(Math.abs(r1-r2)<=1&&Math.abs(c1-c2)<=1){errs.add(`${r1},${c1}`);errs.add(`${r2},${c2}`);}
    }
    setErrors(errs);
    if(errs.size>0)playError();
    if(validateQueens(board,ng)&&xpState){
      const earned=Math.max(1,finalizeXP(xpState)-hintsUsed*100);
      setFinalXP(earned);setCompleted(true);
      setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
      if(timerRef.current)clearInterval(timerRef.current);
      playSuccess();setTimeout(()=>triggerConfetti(),80);
      markStageCompleted(GAME_SLUG,stage);
      const next=getNextUncompletedStage(GAME_SLUG,TOTAL_STAGES);
      setNextUncompleted(next);
      if(shouldShowGameCompleteModal(GAME_SLUG,TOTAL_STAGES))setTimeout(()=>setShowGameComplete(true),1800);
      if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
      if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:GAME_SLUG,stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}
    }
  }

  function handleUndo(){
    if(gridHistory.length===0)return;
    setGrid(gridHistory[gridHistory.length-1]);
    setGridHistory(h=>h.slice(0,-1));
    setErrors(new Set());
  }

  function handleHint(){
    if(!board||hintsUsed>=3||!xpState||solutionRevealed)return;
    const solution=solveQueens(board.size,board.regions);
    if(!solution)return;
    const ng=grid.map(row=>[...row]);
    for(const[sr,sc] of solution){
      if(ng[sr][sc]!==2){
        for(let c=0;c<board.size;c++)ng[sr][c]=0;
        ng[sr][sc]=2;
        setGrid(ng);
        setHintsUsed(h=>h+1);
        setXpState(prev=>prev?{...prev,hintsUsed:Math.min((prev.hintsUsed||0)+1,prev.maxHints)}:prev);
        playError();return;
      }
    }
  }

  function handleCheck(){
    if(!board)return;
    const qlist:[number,number][]=[];
    grid.forEach((row,ri)=>row.forEach((v,ci)=>{if(v===2)qlist.push([ri,ci]);}));
    const errs=new Set<string>();
    for(let i=0;i<qlist.length;i++)for(let j=i+1;j<qlist.length;j++){
      const[r1,c1]=qlist[i],[r2,c2]=qlist[j];
      if(Math.abs(r1-r2)<=1&&Math.abs(c1-c2)<=1){errs.add(`${r1},${c1}`);errs.add(`${r2},${c2}`);}
    }
    setErrors(errs);
    if(errs.size>0)playError();
  }

  if(!board||!xpState)return(
    <div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"var(--color-text-secondary)",fontSize:13}}>Generating board...</p>
    </div>
  );

  const diff=getDifficulty(stage);
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,480):400;
  const cellSize=Math.floor(maxW/board.size);

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Queens"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug={GAME_SLUG}/>

        <div style={{fontSize:11,color:"var(--color-text-secondary)",textAlign:"center",marginBottom:8,
          ...(isDark?{color:"rgba(148,163,184,0.7)"}:{})}}>
          Tap once = mark · Tap twice = queen · Tap three = clear · One queen per row, column and region
        </div>

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"8px 20px",borderRadius:"var(--radius)",background:"rgba(255,68,68,0.08)",
              border:"0.5px solid rgba(255,68,68,0.2)",fontSize:13,fontWeight:600,color:"var(--color-error)",marginBottom:8}}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        <div style={{
          border:isDark?"1px solid rgba(0,255,255,0.15)":"2px solid #374151",
          borderRadius:14,overflow:"hidden",
          boxShadow:isDark
            ?"0 0 40px rgba(0,255,255,0.08), 0 8px 32px rgba(0,0,0,0.6)"
            :"var(--shadow-md)",
          ...(isDark?{background:"rgba(10,10,22,0.4)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}:{}),
        }}>
          {grid.map((row,r)=>(
            <div key={r} style={{display:"flex"}}>
              {row.map((val,c)=>{
                const rid=board.regions[r][c];
                const pal=REGION_COLORS[rid%REGION_COLORS.length];
                const isQueen=val===2;
                const isMark=val===1;
                const hasError=errors.has(`${r},${c}`);
                const isSolution=solutionRevealed&&isQueen;
                const rightBorder=c<board.size-1&&board.regions[r][c+1]!==rid;
                const bottomBorder=r<board.size-1&&board.regions[r+1][c]!==rid;
                return(
                  <button key={c} onClick={()=>handleCellClick(r,c)}
                    style={{
                      width:cellSize,height:cellSize,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      background:hasError?"rgba(255,68,68,0.2)":pal.fill,
                      cursor:solutionRevealed?"default":"pointer",outline:"none",
                      borderRight:rightBorder?`${isDark?"1.5":"2"}px solid ${pal.border}`:`0.5px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.1)"}`,
                      borderBottom:bottomBorder?`${isDark?"1.5":"2"}px solid ${pal.border}`:`0.5px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.1)"}`,
                      borderTop:"none",borderLeft:"none",
                      transition:"background 0.15s",position:"relative",
                    }}>
                    {isMark&&(
                      <span style={{
                        color:isDark?"rgba(255,68,68,0.45)":"#64748B",
                        fontWeight:700,lineHeight:1,
                        fontSize:Math.round(cellSize*0.35),
                        ...(isDark?{textShadow:"0 0 6px rgba(255,68,68,0.3)"}:{}),
                      }}>✕</span>
                    )}
                    {isQueen&&(
                      <motion.span
                        initial={{scale:0}} animate={{scale:1}}
                        style={{
                          color:isSolution?"var(--color-error)":hasError?"var(--color-error)":pal.queen,
                          lineHeight:1,
                          fontSize:Math.round(cellSize*0.5),
                          ...(isDark&&!hasError&&!isSolution?{filter:`drop-shadow(0 0 6px ${pal.queen})`}:{}),
                          ...(isDark&&hasError?{color:"var(--color-error)",filter:"drop-shadow(0 0 8px rgba(255,68,68,0.8))"}:{}),
                        }}>
                        ♛
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{padding:"7px 14px",borderRadius:"var(--radius)",border:"1px solid var(--color-border)",
              background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",
              fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>
            ← Prev
          </button>
          <button onClick={()=>loadStage(stage)}
            style={{padding:"7px 12px",borderRadius:"var(--radius)",border:"1px solid var(--color-border)",
              background:"var(--color-surface)",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary)"}}>
            Restart
          </button>
          <button onClick={()=>setShowMap(true)}
            style={{padding:"7px 12px",borderRadius:"var(--radius)",border:"1px solid var(--color-border)",
              background:"var(--color-surface)",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary)",fontWeight:600}}>
            Map
          </button>
          <button onClick={()=>setStage(s=>s+1)}
            style={{display:"flex",alignItems:"center",gap:4,padding:"7px 14px",borderRadius:"var(--radius)",
              border:"1px solid var(--color-border)",background:"var(--color-surface)",
              cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Queens" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>

      {showResume&&resumeData&&(
        <ResumeModal gameSlug={GAME_SLUG} stageName={`Stage ${resumeData.stage}`} savedAt={resumeData.savedAt as number}
          onResume={()=>{const s=resumeData!;setShowResume(false);setResumeData(null);setStage(s.stage as number);if(s.grid)setTimeout(()=>setGrid(s.grid as number[][]),150);}}
          onStartFresh={()=>{clearGameState(GAME_SLUG);setShowResume(false);setResumeData(null);loadStage(stage);}}/>
      )}

      {showMap&&<StageMap gameSlug={GAME_SLUG} totalStages={TOTAL_STAGES} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}

      <CompletionPopup open={completed} stage={stage} difficulty={diff} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onGoToLatest={nextUncompleted!=null?()=>{setCompleted(false);setStage(nextUncompleted!);}:undefined}
        nextUncompletedStage={nextUncompleted??undefined}
        onShare={()=>{const text=`Mind Element · Queens Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"Mind Element",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>

      <GameCompleteModal open={showGameComplete} gameName="Queens" totalStages={TOTAL_STAGES}
        onPlayAgain={()=>{setShowGameComplete(false);setStage(1);}}
        onClose={()=>setShowGameComplete(false)}/>
    </>
  );
}

export default function QueensGame(){return<ErrorBoundary game={GAME_SLUG}><QueensGameInner/></ErrorBoundary>;}