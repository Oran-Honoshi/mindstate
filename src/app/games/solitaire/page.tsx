"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "solitaire";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ChevronRight,RefreshCw}from"lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
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
type Suit="♥"|"♦"|"♣"|"♠";
type Card={suit:Suit;value:number;label:string;faceUp:boolean};
function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}
function makeDeck(seed:number):Card[]{const suits:Suit[]=["♥","♦","♣","♠"];const labels=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];const deck=suits.flatMap(suit=>labels.map((label,i)=>({suit,value:i+1,label,faceUp:false})));const rng=mulberry32(seed);for(let i=deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
function isRed(suit:Suit){return suit==="♥"||suit==="♦";}
function canStack(card:Card,onto:Card|null):boolean{if(!onto)return card.value===13;return isRed(card.suit)!==isRed(onto.suit)&&card.value===onto.value-1;}
function canFoundation(card:Card,top:Card|null):boolean{if(!top)return card.value===1;return card.suit===top.suit&&card.value===top.value+1;}
function cardColor(suit:Suit){return suit==="♥"||suit==="♦"?"#DC2626":"var(--color-text-primary)";}

function CardUI({card,small,onClick,selected}:{card:Card;small?:boolean;onClick?:()=>void;selected?:boolean}){
  const w=small?36:48,h=small?52:68;
  if(!card.faceUp)return(<div style={{width:w,height:h,borderRadius:6,background:"linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))",border:"1.5px solid rgba(255,255,255,0.3)",flexShrink:0}}/>);
  return(<motion.div onClick={onClick} whileHover={onClick?{y:-3}:{}} style={{width:w,height:h,borderRadius:6,background:selected?"color-mix(in srgb, var(--color-accent-primary) 12%, var(--color-surface))":"var(--color-surface)",border:`1.5px solid ${selected?"var(--color-accent-primary)":"var(--color-border)"}`,cursor:onClick?"pointer":"default",display:"flex",flexDirection:"column",padding:"3px 4px",boxShadow:selected?"0 0 0 2px var(--color-accent-primary)":"0 2px 4px rgba(0,0,0,0.08)",flexShrink:0}}>
    <span style={{fontSize:small?11:12,fontWeight:700,color:cardColor(card.suit),lineHeight:1}}>{card.label}</span>
    <span style={{fontSize:small?14:16,color:cardColor(card.suit),lineHeight:1}}>{card.suit}</span>
  </motion.div>);
}

function SolitairePageInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[tableau,setTableau]=useState<Card[][]>([]);
  const[stock,setStock]=useState<Card[]>([]);
  const[waste,setWaste]=useState<Card[]>([]);
  const[foundations,setFoundations]=useState<Card[][]>([[],[],[],[]]);
  const[selected,setSelected]=useState<{pile:"tableau"|"waste"|"foundation";col:number;idx:number}|null>(null);
  const[moves,setMoves]=useState(0);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[completed,setCompleted]=useState(false);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[finalXP,setFinalXP]=useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const[history,setHistory]=useState<{tableau:Card[][];stock:Card[];waste:Card[];foundations:Card[][];moves:number}[]>([]);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{
      if(xpState&&!completed){
        timerRef.current=setInterval(()=>{
          setElapsedSeconds(Math.floor((Date.now()-xpState.startTime)/1000));
          setLiveXP(calculateXP(xpState).currentXP);
        },500);
      }
    }
  );

  const loadStage=useCallback((s:number)=>{
    saveGameState("solitaire",{stage:s,savedAt:Date.now()});
    const diff=getDifficulty(s);
    const deck=makeDeck(seedToNum(`solitaire-${diff}-${s}`));
    const tab:Card[][]=[];let idx=0;
    for(let col=0;col<7;col++){const pile:Card[]=[];for(let row=0;row<=col;row++){pile.push({...deck[idx++],faceUp:row===col});}tab.push(pile);}
    setTableau(tab);setStock(deck.slice(idx).map(c=>({...c,faceUp:false})));
    setWaste([]);setFoundations([[],[],[],[]]);setSelected(null);setMoves(0);
    const xp=createXPState(diff);
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);
    setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");
    setSolutionRevealed(false);setNextUncompleted(null);
    setHistory([]);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{
      setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));
      setLiveXP(calculateXP(xp).currentXP);
    },500);
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleRevealSolution(){
    if(!xpState)return;
    setSolutionRevealed(true);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  function pushHistory(){
    setHistory(h=>[...h.slice(-19),{
      tableau:tableau.map(p=>p.map(c=>({...c}))),
      stock:stock.map(c=>({...c})),
      waste:waste.map(c=>({...c})),
      foundations:foundations.map(p=>p.map(c=>({...c}))),
      moves
    }]);
  }

  function handleUndo(){
    if(history.length===0||completed||solutionRevealed)return;
    const last=history[history.length-1];
    setTableau(last.tableau);setStock(last.stock);setWaste(last.waste);
    setFoundations(last.foundations);setMoves(last.moves);
    setSelected(null);
    setHistory(h=>h.slice(0,-1));
    playClick();
  }

  function drawCard(){
    if(solutionRevealed)return;
    pushHistory();
    if(stock.length===0){setStock([...waste].reverse().map(c=>({...c,faceUp:false})));setWaste([]);return;}
    const card={...stock[stock.length-1],faceUp:true};
    setStock(s=>s.slice(0,-1));setWaste(w=>[...w,card]);setSelected(null);playClick();
  }
  function checkWin(f:Card[][]){return f.every(pile=>pile.length===13);}

  function handleFoundationClick(fi:number){
    if(solutionRevealed)return;
    const top=foundations[fi][foundations[fi].length-1]??null;
    if(selected){
      let card:Card|null=null;
      if(selected.pile==="waste")card=waste[waste.length-1]??null;
      else if(selected.pile==="tableau"){const pile=tableau[selected.col];card=pile[selected.idx]??null;}
      if(card&&canFoundation(card,top)){
        pushHistory();
        const nf=foundations.map((p,i)=>i===fi?[...p,card!]:p);
        if(selected.pile==="waste")setWaste(w=>w.slice(0,-1));
        else setTableau(t=>{const nt=t.map(p=>[...p]);nt[selected.col]=nt[selected.col].slice(0,selected.idx);if(nt[selected.col].length>0)nt[selected.col][nt[selected.col].length-1].faceUp=true;return nt;});
        setFoundations(nf);setSelected(null);setMoves(m=>m+1);playSuccess();
        if(checkWin(nf)&&xpState){const earned=finalizeXP(xpState);setFinalXP(earned);setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));setCompleted(true);if(timerRef.current)clearInterval(timerRef.current);setTimeout(()=>triggerConfetti(),80);markStageCompleted("solitaire",stage);if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"solitaire",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});}}
        return;
      }
    }
    setSelected({pile:"foundation",col:fi,idx:foundations[fi].length-1});playClick();
  }

  function tryMoveToFoundation(card:Card,sourceType:"waste"|"tableau",sourceCol:number,sourceIdx:number):boolean{
    for(let fi=0;fi<4;fi++){const top=foundations[fi][foundations[fi].length-1]??null;if(canFoundation(card,top)){pushHistory();const nf=foundations.map((p,i)=>i===fi?[...p,card]:p);if(sourceType==="waste")setWaste(w=>w.slice(0,-1));else setTableau(t=>{const nt=t.map(p=>[...p]);nt[sourceCol]=nt[sourceCol].slice(0,sourceIdx);if(nt[sourceCol].length>0)nt[sourceCol][nt[sourceCol].length-1].faceUp=true;return nt;});setFoundations(nf);setSelected(null);setMoves(m=>m+1);playSuccess();if(checkWin(nf)&&xpState){const earned=finalizeXP(xpState);setFinalXP(earned);setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));setCompleted(true);if(timerRef.current)clearInterval(timerRef.current);setTimeout(()=>triggerConfetti(),80);if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"solitaire",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});}}return true;}}return false;
  }

  function handleTableauClick(col:number,idx:number){
    if(solutionRevealed)return;
    const pile=tableau[col];
    if(pile.length===0){if(selected){const movingCards=selected.pile==="tableau"?tableau[selected.col].slice(selected.idx):selected.pile==="waste"?[waste[waste.length-1]]:[];if(movingCards.length===0){setSelected(null);return;}if(movingCards[0].value===13){pushHistory();const nt=tableau.map(p=>[...p]);nt[col]=[...movingCards];if(selected.pile==="tableau"){nt[selected.col]=nt[selected.col].slice(0,selected.idx);if(nt[selected.col].length>0)nt[selected.col][nt[selected.col].length-1].faceUp=true;}else if(selected.pile==="waste")setWaste(w=>w.slice(0,-1));setTableau(nt);setSelected(null);setMoves(m=>m+1);playClick();}else setSelected(null);}return;}
    const card=pile[idx];if(!card)return;
    if(!card.faceUp){if(idx===pile.length-1){pushHistory();const nt=tableau.map(p=>[...p]);nt[col][idx]={...nt[col][idx],faceUp:true};setTableau(nt);setMoves(m=>m+1);playClick();}return;}
    if(selected?.pile==="tableau"&&selected.col===col&&selected.idx===idx){if(idx===pile.length-1&&tryMoveToFoundation(card,"tableau",col,idx))return;setSelected(null);return;}
    if(selected){const onto=pile[pile.length-1];const movingCards=selected.pile==="tableau"?tableau[selected.col].slice(selected.idx):selected.pile==="waste"?[waste[waste.length-1]]:[];if(movingCards.length===0){setSelected(null);return;}const topMoving=movingCards[0];if(canStack(topMoving,onto)){pushHistory();const nt=tableau.map(p=>[...p]);nt[col]=[...nt[col],...movingCards];if(selected.pile==="tableau"){nt[selected.col]=nt[selected.col].slice(0,selected.idx);if(nt[selected.col].length>0)nt[selected.col][nt[selected.col].length-1].faceUp=true;}else if(selected.pile==="waste")setWaste(w=>w.slice(0,-1));setTableau(nt);setSelected(null);setMoves(m=>m+1);playClick();return;}setSelected(null);}
    setSelected({pile:"tableau",col,idx});playClick();
  }

  function handleWasteClick(){
    if(solutionRevealed||waste.length===0)return;
    const card=waste[waste.length-1];
    if(selected?.pile==="waste"){if(tryMoveToFoundation(card,"waste",0,waste.length-1))return;setSelected(null);return;}
    setSelected({pile:"waste",col:0,idx:waste.length-1});playClick();
  }

  function handleHint(){
    if(!xpState||completed||hintsUsed>=3||solutionRevealed)return;
    if(waste.length>0){const card=waste[waste.length-1];for(let fi=0;fi<4;fi++){const top=foundations[fi][foundations[fi].length-1]??null;if(canFoundation(card,top)){setSelected({pile:"waste",col:0,idx:waste.length-1});setHintsUsed(h=>h+1);setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);playError();return;}}for(let col=0;col<tableau.length;col++){const pile=tableau[col];const onto=pile.length>0?pile[pile.length-1]:null;if(canStack(card,onto)){setSelected({pile:"waste",col:0,idx:waste.length-1});setHintsUsed(h=>h+1);setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);playError();return;}}}
    drawCard();setHintsUsed(h=>h+1);setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);playError();
  }

  if(!xpState)return(<div style={{minHeight:"100vh",background:"#0F4C2A",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>Dealing cards...</p></div>);

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Solitaire"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
      >
        <GamePageSchema slug="solitaire" />

        <div style={{background:"linear-gradient(135deg,#0F4C2A,#1A6B3A)",borderRadius:20,padding:16,width:"100%",maxWidth:620,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",textAlign:"center"}}>Moves: {moves}</div>

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"10px 20px",borderRadius:12,background:"color-mix(in srgb, var(--color-error) 10%, transparent)",border:"0.5px solid color-mix(in srgb, var(--color-error) 30%, transparent)",fontSize:13,fontWeight:600,color:"var(--color-error)",textAlign:"center"}}>
              Strategy: Build foundations A→K · Expose face-down cards · Move Kings to empty columns · XP set to 1
            </motion.div>
          )}

          <div style={{display:"flex",gap:6,alignItems:"flex-start",padding:"0 4px"}}>
            <div onClick={drawCard} style={{width:48,height:68,borderRadius:6,cursor:solutionRevealed?"not-allowed":"pointer",border:"2px dashed rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,opacity:solutionRevealed?0.5:1}}>
              {stock.length>0?<CardUI card={stock[stock.length-1]}/>:<RefreshCw size={18} color="rgba(255,255,255,0.4)"/>}
            </div>
            <div onClick={handleWasteClick} style={{width:48,height:68,flexShrink:0}}>
              {waste.length>0?<CardUI card={waste[waste.length-1]} selected={selected?.pile==="waste"} onClick={handleWasteClick}/>:<div style={{width:48,height:68,borderRadius:6,border:"2px dashed rgba(255,255,255,0.2)"}}/>}
            </div>
            <div style={{flex:1}}/>
            {foundations.map((pile,i)=>{const top=pile[pile.length-1];const suits:Suit[]=["♥","♦","♣","♠"];return(<div key={i} onClick={()=>handleFoundationClick(i)} style={{width:48,height:68,borderRadius:6,border:`2px solid ${selected?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.2)"}`,cursor:solutionRevealed?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{top?<CardUI card={top} onClick={()=>handleFoundationClick(i)}/>:<span style={{fontSize:20,color:"rgba(255,255,255,0.3)"}}>{suits[i]}</span>}</div>);})}
          </div>

          <div style={{display:"flex",gap:4,alignItems:"flex-start",padding:"0 4px",overflowX:"auto"}}>
            {tableau.map((pile,col)=>(
              <div key={col} style={{flex:1,minWidth:44,position:"relative",minHeight:80}}>
                {pile.length===0?(<div onClick={()=>handleTableauClick(col,0)} style={{width:"100%",height:68,borderRadius:6,border:"2px dashed rgba(255,255,255,0.2)",cursor:solutionRevealed?"not-allowed":"pointer"}}/>):(
                  <div style={{position:"relative"}}>
                    {pile.map((card,i)=>(<div key={`${card.suit}${card.label}${i}`} style={{position:"absolute",top:i*18,left:0,right:0,zIndex:i}}><CardUI card={card} small selected={selected?.pile==="tableau"&&selected.col===col&&selected.idx<=i&&card.faceUp} onClick={()=>handleTableauClick(col,i)}/></div>))}
                    <div style={{height:68+Math.max(0,pile.length-1)*18}}/>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Stage {stage} of 100</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Solitaire" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showMap&&<StageMap gameSlug="solitaire" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Solitaire Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
    </>
  );
}
export default function SolitairePage(){return<ErrorBoundary game="solitaire"><SolitairePageInner/></ErrorBoundary>;}