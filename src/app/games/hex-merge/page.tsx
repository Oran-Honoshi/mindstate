"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "hex-merge";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ChevronRight}from"lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { useBoardWidth } from "@/hooks/useScreenWidth";
import{generateHex,mergeCells,hexToPixel,checkHexWin,HEX_DIRS,type HexBoard}from"@/lib/games/hexMergeGenerator";
import{createXPState,calculateXP,finalizeXP,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(s:number):Difficulty{if(s===1)return"medium";const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;return h<20?"easy":h<70?"medium":"hard";}

const TILE_COLORS:Record<number,{bg:string;text:string}>={0:{bg:"#F1EDE8",text:"transparent"},1:{bg:"#DBEAFE",text:"#1D4ED8"},2:{bg:"#BBF7D0",text:"#15803D"},4:{bg:"#FED7AA",text:"#C2410C"},8:{bg:"#FDE68A",text:"#B45309"},16:{bg:"#E9D5FF",text:"#7C3AED"},32:{bg:"#FECDD3",text:"#BE123C"},64:{bg:"#99F6E4",text:"#0F766E"},128:{bg:"var(--color-accent-primary)",text:"white"},256:{bg:"var(--color-accent-primary)",text:"white"},512:{bg:"var(--color-error)",text:"white"},1024:{bg:"#F59E0B",text:"white"}};
function tileColor(v:number):{bg:string;text:string}{return TILE_COLORS[v]??{bg:"#374151",text:"white"};}

function HexMergePageInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[board,setBoard]=useState<HexBoard|null>(null);
  const[cells,setCells]=useState<Map<string,number>>(new Map());
  const[selected,setSelected]=useState<[number,number]|null>(null);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[completed,setCompleted]=useState(false);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[finalXP,setFinalXP]=useState(0);
  const[bestTile,setBestTile]=useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const[history,setHistory]=useState<{cells:Map<string,number>;bestTile:number}[]>([]);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const boardWidth=useBoardWidth(32,460);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xpState.startTime)/1000));setLiveXP(calculateXP(xpState).currentXP);},500);}}
  );

  const diff=board?getDifficulty(stage):"easy";
  const target=diff==="easy"?64:diff==="medium"?128:256;

  const loadStage=useCallback((s:number)=>{
    saveGameState("hex-merge",{stage:s,savedAt:Date.now()});
    const d=getDifficulty(s);const b=generateHex(`hex-${d}-${s}`,d);const xp=createXPState(d);
    setBoard(b);setCells(new Map(b.cells));setSelected(null);
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);
    setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");setBestTile(0);
    setSolutionRevealed(false);
    setHistory([]);
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));setLiveXP(calculateXP(xp).currentXP);},500);
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleRevealSolution(){
    if(!xpState)return;
    setSolutionRevealed(true);
    setSelected(null);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  function handleHint(){
    if(!xpState||hintsUsed>=3||solutionRevealed)return;
    setHintsUsed(h=>h+1);
    setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
  }

  function handleUndo(){
    if(history.length===0)return;
    const last=history[history.length-1];
    setCells(last.cells);setBestTile(last.bestTile);setSelected(null);
    setHistory(h=>h.slice(0,-1));
    playClick();
  }

  function handleCellClick(q:number,r:number){
    if(!board||completed||solutionRevealed)return;
    const val=cells.get(`${q},${r}`)??0;
    if(selected===null){if(val===0)return;setSelected([q,r]);playClick();}
    else{
      const[sq,sr]=selected;
      if(sq===q&&sr===r){setSelected(null);return;}
      const nc=mergeCells(cells,sq,sr,q,r);
      if(nc){setHistory(h=>[...h.slice(-19),{cells:new Map(cells),bestTile}]);const newBest=Math.max(bestTile,...nc.values());setCells(nc);setBestTile(newBest);setSelected(null);playClick();
        if(checkHexWin(nc,target)&&xpState){
          const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
          setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
          clearGameState("hex-merge");if(timerRef.current)clearInterval(timerRef.current);
          playSuccess();setTimeout(()=>triggerConfetti(),80);markStageCompleted("hex-merge",stage);
          if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"hex-merge",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});}
        }
      }
      else{playError();setSelected([q,r]);}
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--color-text-secondary)",fontSize:13}}>Generating board...</p></div>);

  const hexSize=diff==="easy"?Math.floor(boardWidth/9):diff==="medium"?Math.floor(boardWidth/11):Math.floor(boardWidth/14);
  const svgSize=boardWidth;

  const hexCells:[number,number,number,number][]=[];
  for(const key of cells.keys()){const[q,r]=key.split(",").map(Number);const[x,y]=hexToPixel(q,r,hexSize);hexCells.push([q,r,x+svgSize/2,y+svgSize/2]);}

  function hexPoints(cx:number,cy:number,size:number):string{return Array.from({length:6},(_,i)=>{const angle=Math.PI/180*(60*i-30);return`${cx+size*Math.cos(angle)},${cy+size*Math.sin(angle)}`;}).join(" ");}

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Hex Merge"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
      >
        <GamePageSchema slug={GAME_SLUG} />
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"16px 16px 32px"}}>
          <div style={{fontSize:11,color:"var(--color-text-secondary)"}}>Best: {bestTile||"—"} · Target: {target}</div>

          {!solutionRevealed&&<div style={{fontSize:11,color:"var(--color-text-secondary)"}}>Click a tile to select · Click a matching neighbor to merge · Reach {target}</div>}

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"10px 20px",borderRadius:12,background:"rgba(255,68,68,0.08)",border:"0.5px solid rgba(255,68,68,0.2)",fontSize:13,fontWeight:600,color:"var(--color-error)",textAlign:"center",maxWidth:380}}>
              Target: {target} · Strategy: merge equal tiles outward from center · XP set to 1
            </motion.div>
          )}

          <div style={{width:"100%",maxWidth:boardWidth,overflow:"hidden"}}>
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}
              style={{width:"100%",height:"auto",borderRadius:20,border:"1.5px solid #E2E8F0",background:"#FAFAF9",boxShadow:"0 8px 24px rgba(0,0,0,0.07)",display:"block",opacity:solutionRevealed?0.75:1}}>
              {hexCells.map(([q,r,cx,cy])=>{
                const val=cells.get(`${q},${r}`)??0;
                const isSel=!solutionRevealed&&selected?.[0]===q&&selected?.[1]===r;
                const isAdj=!solutionRevealed&&selected!==null&&HEX_DIRS.some(([dq,dr])=>selected[0]+dq===q&&selected[1]+dr===r);
                const{bg,text}=tileColor(val);
                const canMerge=isAdj&&val>0&&cells.get(`${selected![0]},${selected![1]}`)===val;
                return(
                  <g key={`${q},${r}`} onClick={()=>handleCellClick(q,r)} style={{cursor:val>0&&!solutionRevealed?"pointer":"default"}}>
                    <polygon points={hexPoints(cx,cy,hexSize-2)} fill={isSel?"#EEF2FF":bg} stroke={isSel?"var(--color-accent-primary)":canMerge?"#22C55E":"#E2E8F0"} strokeWidth={isSel||canMerge?2.5:1}/>
                    {val>0&&(<text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:val>=100?hexSize*0.3:hexSize*0.38,fontWeight:700,fill:text,userSelect:"none"}}>{val}</text>)}
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>← Prev</button>
            <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Stage {stage} of {TOTAL_STAGES}</span>
            <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
          </div>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Hex Merge" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showMap&&<StageMap gameSlug="hex-merge" totalStages={TOTAL_STAGES} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Hex Merge Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
    </>
  );
}
export default function HexMergePage(){return<ErrorBoundary game="hex-merge"><HexMergePageInner/></ErrorBoundary>;}