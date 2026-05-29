"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "hex-merge";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{useSearchParams}from"next/navigation";
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
import { useSettingsStore } from "@/store/settingsStore";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(s:number):Difficulty{if(s===1)return"medium";const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;return h<20?"easy":h<70?"medium":"hard";}

// Light palette — warm pastels
const TILE_COLORS_LIGHT:Record<number,{bg:string;text:string}>={
  0:{bg:"#F1EDE8",text:"transparent"},
  1:{bg:"#DBEAFE",text:"#1D4ED8"},2:{bg:"#BBF7D0",text:"#15803D"},
  4:{bg:"#FED7AA",text:"#C2410C"},8:{bg:"#FDE68A",text:"#B45309"},
  16:{bg:"#E9D5FF",text:"#7C3AED"},32:{bg:"#FECDD3",text:"#BE123C"},
  64:{bg:"#99F6E4",text:"#0F766E"},
  128:{bg:"var(--color-accent-primary)",text:"#000"},
  256:{bg:"var(--color-accent-primary)",text:"#000"},
  512:{bg:"var(--color-error)",text:"white"},
  1024:{bg:"#F59E0B",text:"white"},
};
// Dark palette — translucent neon tints
const TILE_COLORS_DARK:Record<number,{bg:string;text:string}>={
  0:{bg:"rgba(255,255,255,0.03)",text:"transparent"},
  1:{bg:"rgba(59,130,246,0.22)",text:"#93C5FD"},
  2:{bg:"rgba(34,197,94,0.22)",text:"#86EFAC"},
  4:{bg:"rgba(249,115,22,0.22)",text:"#FED7AA"},
  8:{bg:"rgba(234,179,8,0.22)",text:"#FDE68A"},
  16:{bg:"rgba(168,85,247,0.22)",text:"#D8B4FE"},
  32:{bg:"rgba(244,63,94,0.22)",text:"#FCA5A5"},
  64:{bg:"rgba(20,184,166,0.22)",text:"#5EEAD4"},
  128:{bg:"rgba(0,255,255,0.28)",text:"var(--color-accent-primary)"},
  256:{bg:"rgba(0,255,255,0.38)",text:"var(--color-accent-primary)"},
  512:{bg:"rgba(255,68,68,0.28)",text:"var(--color-error)"},
  1024:{bg:"rgba(245,158,11,0.35)",text:"#F59E0B"},
};

function HexMergePageInner(){
  const{user}=useAuthStore();
  const { theme } = useSettingsStore();
  const searchParams=useSearchParams();
  const isDaily=searchParams.get("daily")==="1";
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
  const[hintCell,setHintCell]=useState<[number,number]|null>(null);
  const hintTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
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
    setHintCell(null);
    if(hintTimerRef.current){clearTimeout(hintTimerRef.current);hintTimerRef.current=null;}
    setHistory([]);
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));setLiveXP(calculateXP(xp).currentXP);},500);
    if(user&&!isDaily){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
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
    if(!board||!xpState||hintsUsed>=3||solutionRevealed)return;
    let bestVal=0;
    let best:[number,number]|null=null;
    for(const[key,val]of cells.entries()){
      if(val===0)continue;
      const[q,r]=key.split(",").map(Number);
      for(const[dq,dr]of HEX_DIRS){
        if(cells.get(`${q+dq},${r+dr}`)===val&&val*2>bestVal){bestVal=val*2;best=[q,r];}
      }
    }
    if(!best)return;
    setHintCell(best);
    if(hintTimerRef.current)clearTimeout(hintTimerRef.current);
    hintTimerRef.current=setTimeout(()=>setHintCell(null),2000);
    setHintsUsed(h=>h+1);
    setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
    playError();
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

  const palette = theme === "dark" ? TILE_COLORS_DARK : TILE_COLORS_LIGHT;
  function tileColor(v:number):{bg:string;text:string}{return palette[v]??{bg: theme==="dark"?"rgba(100,100,120,0.3)":"#374151",text:"white"};}

  const boardBg = theme === "dark"
    ? `radial-gradient(circle, rgba(0,255,255,0.09) 1px, transparent 1px), #060d18`
    : theme === "light"
    ? `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px), #f8f9fb`
    : `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px), #f5f0e8`;

  const navBtnStyle = {
    padding: "8px 18px", borderRadius: 10,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    cursor: "pointer", fontSize: 11,
    fontFamily: "var(--font-mono)",
    color: "var(--color-text-secondary)",
    fontWeight: 600, letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  };

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
          <div style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",letterSpacing:"0.05em"}}>
            BEST {bestTile||"—"} · TARGET {target} · CLICK TILE → CLICK MATCHING NEIGHBOR TO MERGE
          </div>

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"10px 20px",borderRadius:12,background:"color-mix(in srgb, var(--color-error) 8%, transparent)",border:"0.5px solid color-mix(in srgb, var(--color-error) 20%, transparent)",fontSize:12,fontWeight:600,color:"var(--color-error)",textAlign:"center",maxWidth:380,fontFamily:"var(--font-mono)"}}>
              TARGET {target} · STRATEGY: MERGE EQUAL TILES OUTWARD FROM CENTER
            </motion.div>
          )}

          <div style={{
            padding: 10, borderRadius: 20,
            background: boardBg, backgroundSize: "18px 18px",
            border: "1px solid color-mix(in srgb, var(--color-accent-primary) 14%, transparent)",
            boxShadow: theme === "dark"
              ? "0 0 0 1px rgba(0,255,255,0.03), 0 20px 64px rgba(0,0,0,0.5)"
              : "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}
              style={{width:"100%",height:"auto",borderRadius:14,display:"block",opacity:solutionRevealed?0.72:1}}>
              {theme === "dark" && (
                <defs>
                  <filter id="glow-hex-high" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="glow-hex-sel" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
              )}
              {hexCells.map(([q,r,cx,cy])=>{
                const val=cells.get(`${q},${r}`)??0;
                const isSel=!solutionRevealed&&selected?.[0]===q&&selected?.[1]===r;
                const isAdj=!solutionRevealed&&selected!==null&&HEX_DIRS.some(([dq,dr])=>selected[0]+dq===q&&selected[1]+dr===r);
                const isHint=!isSel&&hintCell?.[0]===q&&hintCell?.[1]===r;
                const{bg,text}=tileColor(val);
                const canMerge=isAdj&&val>0&&cells.get(`${selected![0]},${selected![1]}`)===val;
                const isHighValue = val >= 64;
                const glowIntensity = val >= 512 ? 2.2 : val >= 128 ? 1.5 : val >= 64 ? 0.9 : 0;
                return(
                  <g key={`${q},${r}`} onClick={()=>handleCellClick(q,r)} style={{cursor:val>0&&!solutionRevealed?"pointer":"default"}}>
                    <polygon points={hexPoints(cx,cy,hexSize-2)}
                      fill={isSel ? (theme==="dark" ? "rgba(0,255,255,0.14)" : "color-mix(in srgb, var(--color-accent-primary) 12%, var(--color-surface))") : bg}
                      stroke={isSel?"var(--color-accent-primary)":isHint?"var(--color-accent-secondary)":canMerge?"var(--color-accent-secondary)":theme==="dark"?"rgba(255,255,255,0.08)":"var(--color-border)"}
                      strokeWidth={isSel ? 2.5 : isHint||canMerge ? 2 : 1}
                      filter={theme==="dark" ? (isSel ? "url(#glow-hex-sel)" : isHighValue ? "url(#glow-hex-high)" : undefined) : undefined}
                      style={{
                        filter: theme==="dark" && isHighValue && !isSel
                          ? `drop-shadow(0 0 ${hexSize * glowIntensity * 0.14}px ${bg})`
                          : isSel && theme==="dark"
                          ? "drop-shadow(0 0 8px rgba(0,255,255,0.6))"
                          : undefined,
                      }}
                    />
                    {val>0&&(
                      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
                        style={{
                          fontSize: val>=100 ? hexSize*0.3 : hexSize*0.38,
                          fontWeight: 700, fill: text, userSelect: "none",
                          fontFamily: "var(--font-mono)",
                        }}>
                        {val}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>{ if(stage>1){ clearGameState(GAME_SLUG); setStage(s=>s-1); } }} disabled={stage===1}
              style={{...navBtnStyle, opacity:stage===1?0.38:1, cursor:stage===1?"not-allowed":"pointer"}}>
              ← PREV
            </button>
            <span style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",fontWeight:600,letterSpacing:"0.06em"}}>
              STAGE {stage}/{TOTAL_STAGES}
            </span>
            <button onClick={()=>{ clearGameState(GAME_SLUG); setStage(s=>s+1); }}
              style={{...navBtnStyle, display:"flex", alignItems:"center", gap:4, cursor:"pointer"}}>
              NEXT <ChevronRight size={12}/>
            </button>
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
