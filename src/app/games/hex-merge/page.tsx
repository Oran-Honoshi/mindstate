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
import{ArrowLeft,RotateCcw,ChevronRight}from"lucide-react";
import Link from"next/link";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{Navbar}from"@/components/nav/Navbar";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{HintButton}from"@/components/ui/HintButton";
import { ShowSolution } from "@/components/ui/ShowSolution";
import { useBoardWidth } from "@/hooks/useScreenWidth";
import{generateHex,mergeCells,hexToPixel,checkHexWin,HEX_DIRS,type HexBoard}from"@/lib/games/hexMergeGenerator";
import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import { GamePageSchema } from "@/components/seo/GamePageSchema";

function getDifficulty(s:number):Difficulty{if(s===1)return"medium";const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;return h<20?"easy":h<70?"medium":"hard";}
function XPBar({xpState}:{xpState:XPState}){const[snap,setSnap]=useState(()=>calculateXP(xpState));useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);}

const TILE_COLORS:Record<number,{bg:string;text:string}>={0:{bg:"#F1EDE8",text:"transparent"},1:{bg:"#DBEAFE",text:"#1D4ED8"},2:{bg:"#BBF7D0",text:"#15803D"},4:{bg:"#FED7AA",text:"#C2410C"},8:{bg:"#FDE68A",text:"#B45309"},16:{bg:"#E9D5FF",text:"#7C3AED"},32:{bg:"#FECDD3",text:"#BE123C"},64:{bg:"#99F6E4",text:"#0F766E"},128:{bg:"#4F6EF7",text:"white"},256:{bg:"#9C6BE8",text:"white"},512:{bg:"#EF4444",text:"white"},1024:{bg:"#F59E0B",text:"white"}};
function tileColor(v:number):{bg:string;text:string}{return TILE_COLORS[v]??{bg:"#374151",text:"white"};}

function HexMergePageInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[board,setBoard]=useState<HexBoard|null>(null);
  const[cells,setCells]=useState<Map<string,number>>(new Map());
  const[selected,setSelected]=useState<[number,number]|null>(null);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[finalXP,setFinalXP]=useState(0);
  const[bestTile,setBestTile]=useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const boardWidth=useBoardWidth(32,460);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{if(xpState&&!completed)timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}
  );

  const diff=board?getDifficulty(stage):"easy";
  const target=diff==="easy"?64:diff==="medium"?128:256;

  const loadStage=useCallback((s:number)=>{
    saveGameState("hex-merge",{stage:s,savedAt:Date.now()});
    const d=getDifficulty(s);const b=generateHex(`hex-${d}-${s}`,d);const xp=createXPState(d);
    setBoard(b);setCells(new Map(b.cells));setSelected(null);
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);setElapsed("00:00");setBestTile(0);
    setSolutionRevealed(false);
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  // ── Show Solution ──────────────────────────────────────────────────────────
  function handleRevealSolution(){
    if(!xpState)return;
    setSolutionRevealed(true);
    setSelected(null);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  function handleCellClick(q:number,r:number){
    if(!board||completed||solutionRevealed)return;
    const val=cells.get(`${q},${r}`)??0;
    if(selected===null){if(val===0)return;setSelected([q,r]);playClick();}
    else{
      const[sq,sr]=selected;
      if(sq===q&&sr===r){setSelected(null);return;}
      const nc=mergeCells(cells,sq,sr,q,r);
      if(nc){const newBest=Math.max(bestTile,...nc.values());setCells(nc);setBestTile(newBest);setSelected(null);playClick();
        if(checkHexWin(nc,target)&&xpState){const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);clearGameState("hex-merge");if(timerRef.current)clearInterval(timerRef.current);playSuccess();setTimeout(()=>triggerConfetti(),80);markStageCompleted("hex-merge",stage);if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"hex-merge",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}}}
      else{playError();setSelected([q,r]);}
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p></div>);

  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const hexSize=diff==="easy"?Math.floor(boardWidth/9):diff==="medium"?Math.floor(boardWidth/11):Math.floor(boardWidth/14);
  const svgSize=boardWidth;
  const currentXP=calculateXP(xpState).currentXP;

  const hexCells:[number,number,number,number][]=[];
  for(const key of cells.keys()){const[q,r]=key.split(",").map(Number);const[x,y]=hexToPixel(q,r,hexSize);hexCells.push([q,r,x+svgSize/2,y+svgSize/2]);}

  function hexPoints(cx:number,cy:number,size:number):string{return Array.from({length:6},(_,i)=>{const angle=Math.PI/180*(60*i-30);return`${cx+size*Math.cos(angle)},${cy+size*Math.sin(angle)}`;}).join(" ");}

  return(
    <div className="game-page">
      <Navbar/>
      <GamePageSchema slug="hex-merge" />
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>
        <div style={{width:"100%",maxWidth:540,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,overflow:"hidden",flexShrink:1}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>Hex Merge</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>TARGET {target}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"var(--text4)"}}>Best: {bestTile||"—"}</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {!solutionRevealed&&<div style={{fontSize:11,color:"var(--text4)"}}>Click a tile to select · Click a matching neighbor to merge · Reach {target}</div>}

        {solutionRevealed&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{padding:"10px 20px",borderRadius:12,background:"rgba(239,68,68,0.08)",border:"0.5px solid rgba(239,68,68,0.2)",fontSize:13,fontWeight:600,color:"#EF4444",textAlign:"center",maxWidth:380}}>
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
                  <polygon points={hexPoints(cx,cy,hexSize-2)} fill={isSel?"#EEF2FF":bg} stroke={isSel?"#4F6EF7":canMerge?"#22C55E":"#E2E8F0"} strokeWidth={isSel||canMerge?2.5:1}/>
                  {val>0&&(<text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:val>=100?hexSize*0.3:hexSize*0.38,fontWeight:700,fill:text,userSelect:"none"}}>{val}</text>)}
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <HintButton hintsLeft={3-hintsUsed} xpCost={100}
            onUseHint={()=>{if(!xpState||hintsUsed>=3||solutionRevealed)return;setHintsUsed(h=>h+1);setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);}}
            disabled={completed||solutionRevealed}/>
          <ShowSolution onReveal={handleRevealSolution} currentXP={currentXP} disabled={completed||solutionRevealed}/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 100</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      <OutOfTokensModal gameName="Hex Merge" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showMap&&<StageMap gameSlug="hex-merge" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={elapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Hex Merge Stage ${stage} · ${finalXP} XP · ${elapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
    </div>
  );
}
export default function HexMergePage(){return<ErrorBoundary game="hex-merge"><HexMergePageInner/></ErrorBoundary>;}