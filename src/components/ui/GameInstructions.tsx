"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { SunIcon, MoonIcon } from "@/components/icons/GameIcons";

export interface GameInstructionsProps {
  game: string;
  onOpen?: () => void;
  onClose?: () => void;
  standalone?: boolean;  // open immediately, no trigger button
}

// ── Mini board snapshots ──────────────────────────────────────────────────────
function TangoSnapshot({ solved }: { solved: boolean }) {
  const board = solved
    ? [["S","M","S","M"],["M","S","M","S"],["S","M","S","M"],["M","S","M","S"]]
    : [["S",null,null,"M"],[null,"S","M",null],[null,"M","S",null],["M",null,null,"S"]];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,28px)",gap:3}}>
      {board.map((row,r)=>row.map((cell,c)=>(
        <div key={`${r}-${c}`} style={{width:28,height:28,borderRadius:6,background:cell?"white":"var(--color-surface-2)",border:"1px solid var(--color-border)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {cell==="S"&&<SunIcon size={14}/>}
          {cell==="M"&&<MoonIcon size={14}/>}
        </div>
      )))}
    </div>
  );
}

function QueensSnapshot({ solved }: { solved: boolean }) {
  // 4x4 grid: 4 color regions, one queen per row/col/region
  // Region map: each cell gets a color index
  const REGION = [
    [0,0,1,1],
    [0,0,1,1],
    [2,2,3,3],
    [2,2,3,3],
  ];
  const COLORS = ["#DBEAFE","#FED7AA","#BBF7D0","#E9D5FF"];
  const BORDER = ["#93C5FD","#FDBA74","#6EE7B7","#C4B5FD"];
  // Valid solution: one queen per row, col, region — no adjacency
  const SOLUTION = [[0,1],[1,3],[2,0],[3,2]];
  const queens = solved ? SOLUTION : [];
  const isQueen = (r:number,c:number) => queens.some(([qr,qc])=>qr===r&&qc===c);

  return (
    <div style={{border:"2px solid #374151",borderRadius:8,overflow:"hidden",display:"inline-block",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,28px)",gridTemplateRows:"repeat(4,28px)"}}>
        {REGION.map((row,r)=>row.map((rid,c)=>(
          <div key={`${r}-${c}`} style={{
            width:28,height:28,
            background:isQueen(r,c)?COLORS[rid]:COLORS[rid],
            border:`0.5px solid ${BORDER[rid]}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:14,
            boxShadow:isQueen(r,c)?`inset 0 0 0 2px ${BORDER[rid]}`:"none",
          }}>
            {isQueen(r,c) && "♛"}
          </div>
        )))}
      </div>
    </div>
  );
}

function SudokuSnapshot({ solved }: { solved: boolean }) {
  const puzzle = [[5,3,0,0],[6,0,0,1],[0,9,8,0],[8,0,0,0]];
  const solution = [[5,3,4,6],[6,7,2,1],[1,9,8,3],[8,5,9,7]];
  const grid = solved ? solution : puzzle;
  return (
    <div style={{border:"2px solid #374151",borderRadius:4,overflow:"hidden",display:"inline-block"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,22px)"}}>
        {grid.map((row,r)=>row.map((val,c)=>(
          <div key={`${r}-${c}`} style={{width:22,height:22,background:(!solved&&puzzle[r][c]===0)?"white":(!solved&&puzzle[r][c]!==0)?"#F8F7F5":solved&&puzzle[r][c]!==0?"#F0FDF4":"#EEF2FF",border:"0.5px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:(!solved&&puzzle[r][c]===0)?"transparent":"#374151"}}>
            {val||""}
          </div>
        )))}
      </div>
    </div>
  );
}

function FlowSnapshot({ solved }: { solved: boolean }) {
  const SIZE = 4;
  const dots: Record<string,string> = {"0,0":"var(--color-error)","0,3":"#3B82F6","3,0":"#22C55E","3,3":"#F59E0B"};
  const paths: Record<string,string> = solved ? {
    "0,0":"var(--color-error)","0,1":"var(--color-error)","0,2":"var(--color-error)","0,3":"#3B82F6",
    "1,0":"#22C55E","1,1":"var(--color-error)","1,2":"#3B82F6","1,3":"#3B82F6",
    "2,0":"#22C55E","2,1":"#F59E0B","2,2":"#F59E0B","2,3":"#3B82F6",
    "3,0":"#22C55E","3,1":"#F59E0B","3,2":"#F59E0B","3,3":"#F59E0B",
  } : {};
  return (
    <div style={{border:"1.5px solid var(--color-border)",borderRadius:6,overflow:"hidden",display:"inline-block"}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},22px)`}}>
        {Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>{
          const k=`${r},${c}`;
          const dot=dots[k];
          const fill=paths[k];
          return(
            <div key={k} style={{width:22,height:22,background:fill?`${fill}30`:"var(--color-surface-2)",border:"0.5px solid var(--color-border)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {dot&&<div style={{width:12,height:12,borderRadius:"50%",background:dot}}/>}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

function NonogramSnapshot({ solved }: { solved: boolean }) {
  const solution = [[1,0,1],[1,1,0],[0,1,1]];
  const grid = solved ? solution : [[1,0,0],[0,0,0],[0,0,0]];
  const rowClues = [[1,1],[2],[2]];
  const colClues = [[2],[2],[1,1]];
  return (
    <div style={{display:"inline-flex",flexDirection:"column",gap:0}}>
      <div style={{display:"flex",marginLeft:20}}>
        {colClues.map((cl,i)=>(
          <div key={i} style={{width:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",paddingBottom:2}}>
            {cl.map((n,j)=><span key={j} style={{fontSize:9,fontWeight:700,color:"var(--color-text-secondary)",lineHeight:1.2}}>{n}</span>)}
          </div>
        ))}
      </div>
      {solution.map((_,r)=>(
        <div key={r} style={{display:"flex",alignItems:"center"}}>
          <div style={{width:20,display:"flex",justifyContent:"flex-end",paddingRight:3,gap:2}}>
            {rowClues[r].map((n,i)=><span key={i} style={{fontSize:9,fontWeight:700,color:"var(--color-text-secondary)"}}>{n}</span>)}
          </div>
          {grid[r].map((cell,c)=>(
            <div key={c} style={{width:20,height:20,background:cell?"#1C1917":"var(--color-surface-2)",border:"0.5px solid var(--color-border)"}}/>
          ))}
        </div>
      ))}
    </div>
  );
}

function MinesweeperSnapshot({ solved }: { solved: boolean }) {
  const grid = [
    [{val:"✕",rev:solved},{val:"1",rev:true},{val:"",rev:true}],
    [{val:"1",rev:true},{val:"2",rev:true},{val:"1",rev:true}],
    [{val:"",rev:true},{val:"1",rev:true},{val:"✕",rev:solved}],
  ];
  const NC:Record<string,string>={"1":"#2563EB","2":"#16A34A"};
  return(
    <div style={{border:"1.5px solid var(--color-border)",borderRadius:6,overflow:"hidden",display:"inline-block"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,28px)"}}>
        {grid.map((row,r)=>row.map((cell,c)=>(
          <div key={`${r}-${c}`} style={{width:28,height:28,background:cell.rev?"#F8F7F5":"white",border:"0.5px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:NC[cell.val]||"inherit",boxShadow:!cell.rev?"inset 0 1px 0 rgba(255,255,255,0.8)":"none"}}>
            {cell.rev?cell.val:""}
          </div>
        )))}
      </div>
    </div>
  );
}

function ZipSnapshot({ solved }: { solved: boolean }) {
  const waypoints:Record<string,number>={"0,0":1,"0,3":2,"3,3":3,"3,0":4};
  const path = solved ? ["0,0","0,1","0,2","0,3","1,3","1,2","1,1","1,0","2,0","2,1","2,2","2,3","3,3","3,2","3,1","3,0"] : ["0,0"];
  const pathSet = new Set(path);
  return(
    <div style={{position:"relative",display:"inline-block"}}>
      <svg style={{position:"absolute",inset:0,pointerEvents:"none"}} width={4*26} height={4*26}>
        {path.slice(1).map((k,i)=>{
          const[r,c]=k.split(",").map(Number);
          const[pr,pc]=path[i].split(",").map(Number);
          return<line key={i} x1={pc*26+13} y1={pr*26+13} x2={c*26+13} y2={r*26+13} stroke="var(--color-accent-primary)" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>;
        })}
      </svg>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,26px)",gap:0}}>
        {Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>{
          const k=`${r},${c}`;
          const wp=waypoints[k];
          const inPath=pathSet.has(k);
          return(
            <div key={k} style={{width:26,height:26,background:inPath?"rgba(79,110,247,0.1)":"var(--color-surface-2)",border:"0.5px solid var(--color-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--color-accent-primary)"}}>
              {wp||""}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

function BridgesSnapshot({ solved }: { solved: boolean }) {
  const islands = [{r:0,c:0,n:2},{r:0,c:3,n:2},{r:3,c:0,n:2},{r:3,c:3,n:2}];
  const SIZE=4, CELL=24;
  return(
    <svg width={SIZE*CELL} height={SIZE*CELL} style={{border:"1px solid var(--color-border)",borderRadius:6,background:"var(--color-surface-2)"}}>
      {solved&&<>
        <line x1={12} y1={12} x2={84} y2={12} stroke="#374151" strokeWidth="2"/>
        <line x1={12} y1={84} x2={84} y2={84} stroke="#374151" strokeWidth="2"/>
        <line x1={12} y1={12} x2={12} y2={84} stroke="#374151" strokeWidth="2"/>
        <line x1={84} y1={12} x2={84} y2={84} stroke="#374151" strokeWidth="2"/>
      </>}
      {islands.map((isl,i)=>(
        <g key={i}>
          <circle cx={isl.c*CELL+CELL/2} cy={isl.r*CELL+CELL/2} r={CELL*0.35} fill={solved?"#22C55E":"var(--color-accent-primary)"}/>
          <text x={isl.c*CELL+CELL/2} y={isl.r*CELL+CELL/2+1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:11,fontWeight:700,fill:"white"}}>{isl.n}</text>
        </g>
      ))}
    </svg>
  );
}

function PatternSnapshot({ solved }: { solved: boolean }) {
  const seq = ["3","6","9","12"];
  const ans = "15";
  return(
    <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
      {seq.map((n,i)=>(
        <div key={i} style={{width:28,height:28,borderRadius:8,background:"var(--color-surface-2)",border:"1px solid var(--color-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--color-text-primary)"}}>
          {n}
        </div>
      ))}
      <div style={{fontSize:14,color:"var(--color-text-secondary)"}}>→</div>
      <div style={{width:28,height:28,borderRadius:8,border:`2px ${solved?"solid":"dashed"} var(--color-accent-primary)`,background:solved?"rgba(79,110,247,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--color-accent-primary)"}}>
        {solved?ans:"?"}
      </div>
    </div>
  );
}

function TwentyFortyEightSnapshot({ solved }: { solved: boolean }) {
  const before = [[2,4,0,0],[0,2,4,2],[4,0,2,0],[0,2,0,4]];
  const after =  [[0,0,2,4],[0,2,4,2],[0,4,2,0],[0,2,0,4]];
  const grid = solved ? after : before;
  const COLORS:Record<number,string>={0:"#EDE0C8",2:"#EEE4DA",4:"#EDE0C8",8:"#F2B179",16:"#F59563"};
  return(
    <div style={{background:"#BBADA0",borderRadius:8,padding:4,display:"inline-block"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,22px)",gap:3}}>
        {grid.map((row,r)=>row.map((val,c)=>(
          <div key={`${r}-${c}`} style={{width:22,height:22,borderRadius:4,background:COLORS[val]||"#F59563",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:val>=8?"white":"#776E65"}}>
            {val||""}
          </div>
        )))}
      </div>
    </div>
  );
}

function KakuroSnapshot({ solved }: { solved: boolean }) {
  // 3x3 correct kakuro: right clue bottom-right, down clue top-left
  const S=26;
  function ClueCell({down,right}:{down?:number;right?:number}){
    return(
      <div style={{width:S,height:S,background:"#2D3748",position:"relative",overflow:"hidden"}}>
        <svg width={S} height={S} style={{position:"absolute"}}>
          <line x1={1} y1={S-1} x2={S-1} y2={1} stroke="#4A5568" strokeWidth="1"/>
          {down&&<text x={3} y={11} style={{fontSize:8,fill:"white",fontWeight:700}}>{down}</text>}
          {right&&<text x={S-3} y={S-3} textAnchor="end" style={{fontSize:8,fill:"white",fontWeight:700}}>{right}</text>}
        </svg>
      </div>
    );
  }
  return(
    <div style={{border:"2px solid #2D3748",borderRadius:4,overflow:"hidden",display:"inline-block"}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(3,${S}px)`}}>
        {/* Row 0 */}
        <div style={{width:S,height:S,background:"#2D3748"}}/>
        <ClueCell down={6}/>
        <ClueCell down={7}/>
        {/* Row 1 */}
        <ClueCell right={9}/>
        {[solved?"5":"",solved?"4":""].map((v,i)=>(
          <div key={i} style={{width:S,height:S,background:solved?"#EEF2FF":"white",border:"0.5px solid #CBD5E0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--color-accent-primary)"}}>{v}</div>
        ))}
        {/* Row 2 */}
        <ClueCell right={4}/>
        {[solved?"1":"",solved?"3":""].map((v,i)=>(
          <div key={i} style={{width:S,height:S,background:solved?"#EEF2FF":"white",border:"0.5px solid #CBD5E0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--color-accent-primary)"}}>{v}</div>
        ))}
      </div>
    </div>
  );
}

function GravitySnapshot({ solved }: { solved: boolean }) {
  const COLORS = ["var(--color-error)","#3B82F6","#22C55E"];
  const before = [[0,1,2],[1,2,0],[2,0,1]];
  const after  = [[0,1,2],[0,1,2],[0,1,2]];
  const grid = solved ? after : before;
  return(
    <div style={{display:"flex",gap:4,alignItems:"flex-end"}}>
      {grid[0].map((_,col)=>(
        <div key={col} style={{display:"flex",flexDirection:"column-reverse",gap:3,background:"var(--color-surface-2)",borderRadius:6,padding:3}}>
          {grid.map((_,row)=>(
            <div key={row} style={{width:18,height:18,borderRadius:4,background:COLORS[grid[row][col]]}}/>
          ))}
        </div>
      ))}
    </div>
  );
}

function HexSnapshot({ solved }: { solved: boolean }) {
  const vals = solved ? [0,0,8,2,4,8,0,4,2] : [2,4,0,2,4,0,4,2,4];
  const COLORS:Record<number,string>={0:"#F1EDE8",2:"#DBEAFE",4:"#BBF7D0",8:"#FDE68A"};
  const positions = [[-1,-1],[-1,0],[0,-1],[0,0],[0,1],[1,-1],[1,0],[1,1],[-1,1]];
  const SIZE=18;
  function hexPts(cx:number,cy:number):string{
    return Array.from({length:6},(_,i)=>{const a=Math.PI/180*(60*i-30);return`${cx+SIZE*Math.cos(a)},${cy+SIZE*Math.sin(a)}`;}).join(" ");
  }
  return(
    <svg width={100} height={90} viewBox="-50 -45 100 90">
      {positions.map(([q,r],i)=>{
        const x=SIZE*(1.5*q);
        const y=SIZE*(Math.sqrt(3)/2*q+Math.sqrt(3)*r);
        const val=vals[i];
        return(
          <g key={i}>
            <polygon points={hexPts(x,y)} fill={COLORS[val]||"#EDE9FE"} stroke="var(--color-border)" strokeWidth="1"/>
            {val>0&&<text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:9,fontWeight:700,fill:"#374151"}}>{val}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function LogicPathSnapshot({ solved }: { solved: boolean }) {
  const SIZE=3,CELL=28;
  // Pipe types: [top,right,bottom,left]
  const pipes = solved
    ? [[false,true,false,false],[false,true,false,true],[false,false,false,true],
       [true,false,false,false],[true,true,true,false],[true,false,true,false],
       [false,true,true,false],[false,false,false,true],[true,false,false,false]]
    : [[false,true,false,false],[true,false,false,true],[false,false,true,false],
       [false,false,false,true],[true,true,false,false],[false,false,true,false],
       [false,true,true,false],[true,false,false,true],[true,false,false,false]];
  return(
    <div style={{border:"1.5px solid var(--color-border)",borderRadius:6,overflow:"hidden",display:"inline-block"}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},${CELL}px)`}}>
        {pipes.map((pipe,i)=>{
          const color="var(--color-accent-primary)";const c=CELL/2;const w=CELL*0.15;
          return(
            <div key={i} style={{width:CELL,height:CELL,background:"var(--color-surface-2)",border:"0.5px solid var(--color-border)",position:"relative"}}>
              <svg width={CELL} height={CELL} style={{position:"absolute"}}>
                {pipe[0]&&<rect x={c-w/2} y={0} width={w} height={c} fill={color} rx={2}/>}
                {pipe[1]&&<rect x={c} y={c-w/2} width={c} height={w} fill={color} rx={2}/>}
                {pipe[2]&&<rect x={c-w/2} y={c} width={w} height={c} fill={color} rx={2}/>}
                {pipe[3]&&<rect x={0} y={c-w/2} width={c} height={w} fill={color} rx={2}/>}
                <circle cx={c} cy={c} r={w*0.8} fill={color}/>
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LightUpSnapshot({ solved }: { solved: boolean }) {
  const grid = [
    [{t:"black",clue:1},{t:"white",bulb:solved},{t:"white",bulb:false}],
    [{t:"white",bulb:solved},{t:"black",clue:null},{t:"white",bulb:solved}],
    [{t:"white",bulb:false},{t:"white",bulb:solved},{t:"black",clue:0}],
  ] as {t:string;clue?:number|null;bulb?:boolean}[][];
  return(
    <div style={{border:"1.5px solid #374151",borderRadius:6,overflow:"hidden",display:"inline-block"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,26px)"}}>
        {grid.map((row,r)=>row.map((cell,c)=>(
          <div key={`${r}-${c}`} style={{width:26,height:26,background:cell.t==="black"?"#374151":cell.bulb?"#FFFBEB":"white",border:"0.5px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:cell.t==="black"?"white":"inherit"}}>
            {cell.t==="black"&&cell.clue!=null?cell.clue:""}
            {cell.t==="white"&&cell.bulb?"●":""}
          </div>
        )))}
      </div>
    </div>
  );
}

function PatchesSnapshot({ solved }: { solved: boolean }) {
  const COLORS = ["var(--color-error)","#3B82F6","#22C55E","#F59E0B"];
  const solution = [[0,0,1,1],[0,2,2,1],[3,2,2,1],[3,3,2,1]];
  const empty = [[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1]];
  const grid = solved ? solution : empty;
  return(
    <div style={{border:"1.5px solid var(--color-border)",borderRadius:6,overflow:"hidden",display:"inline-block"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,20px)"}}>
        {grid.map((row,r)=>row.map((val,c)=>(
          <div key={`${r}-${c}`} style={{width:20,height:20,background:val>=0?COLORS[val]:"var(--color-surface-2)",border:"0.5px solid var(--color-border)",opacity:0.9}}/>
        )))}
      </div>
    </div>
  );
}

function WordSlingSnapshot({ solved }: { solved: boolean }) {
  const letters = ["B","R","A","I","N","S","T","O","R","M"];
  const found = solved ? ["BRAIN","STORM","BORN"] : [];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
        {letters.map((l,i)=>(
          <div key={i} style={{width:20,height:20,borderRadius:5,background:"var(--color-surface-2)",border:"1px solid var(--color-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"var(--color-text-primary)"}}>{l}</div>
        ))}
      </div>
      {found.length>0&&(
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {found.map(w=><span key={w} style={{fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:6,background:"#F0FDF4",color:"#15803D"}}>{w}</span>)}
        </div>
      )}
    </div>
  );
}

function HeartsSnapshot({ solved }: { solved: boolean }) {
  const playerCards = ["A♠","7♣","3♥","K♦"];
  const cpuCard = solved ? "Q♠" : null;
  const playerPlay = solved ? "A♠" : null;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <div style={{display:"flex",gap:2}}>
        {playerCards.map((c,i)=>(
          <div key={i} style={{width:20,height:28,borderRadius:3,background:solved&&c==="A♠"?"#EEF2FF":"white",border:`1px solid ${solved&&c==="A♠"?"var(--color-accent-primary)":"#E2E8F0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:c.includes("♥")||c.includes("♦")?"#DC2626":"#1C1917"}}>{c}</div>
        ))}
      </div>
      {solved&&<div style={{display:"flex",gap:6,justifyContent:"center"}}>
        <div style={{width:20,height:28,borderRadius:3,background:"white",border:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:"#DC2626"}}>Q♠</div>
        <div style={{width:20,height:28,borderRadius:3,background:"#EEF2FF",border:"1px solid var(--color-accent-primary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700}}>A♠</div>
      </div>}
    </div>
  );
}

function SolitaireSnapshot({ solved }: { solved: boolean }) {
  const cols = solved
    ? [["A♥"],["A♦"],["A♣"],["A♠"]]
    : [["K♠","Q♥"],["J♣","10♦"],["9♠"],["8♥","7♣"]];
  return(
    <div style={{display:"flex",gap:4,alignItems:"flex-start"}}>
      {cols.map((col,ci)=>(
        <div key={ci} style={{display:"flex",flexDirection:"column",gap:-4}}>
          {col.map((card,i)=>(
            <div key={i} style={{width:22,height:30,borderRadius:3,background:"white",border:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:card.includes("♥")||card.includes("♦")?"#DC2626":"#1C1917",marginTop:i>0?-16:0,zIndex:i}}>{card}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

const SNAPSHOTS: Record<string, React.ComponentType<{solved:boolean}>> = {
  tango:          TangoSnapshot,
  queens:         QueensSnapshot,
  sudoku:         SudokuSnapshot,
  flow:           FlowSnapshot,
  nonogram:       NonogramSnapshot,
  minesweeper:    MinesweeperSnapshot,
  zip:            ZipSnapshot,
  bridges:        BridgesSnapshot,
  "pattern-match":PatternSnapshot,
  "2048-pro":     TwentyFortyEightSnapshot,
  kakuro:         KakuroSnapshot,
  "gravity-sort": GravitySnapshot,
  "hex-merge":    HexSnapshot,
  "logic-path":   LogicPathSnapshot,
  lightup:        LightUpSnapshot,
  patches:        PatchesSnapshot,
  "word-sling":   WordSlingSnapshot,
  hearts:         HeartsSnapshot,
  solitaire:      SolitaireSnapshot,
};

const INSTRUCTIONS: Record<string, {
  title: string; goal: string; rules: string[];
  dos: string[]; donts: string[]; hint: string;
}> = {
  tango: {
    title:"How to Play Tango",
    goal:"Fill every cell with a Sun ☀️ or Moon 🌙 so each row and column is balanced.",
    rules:["Every row must have equal Suns and Moons","Every column must have equal Suns and Moons","No three identical symbols in a row or column","= means two adjacent cells must match · × means they must differ"],
    dos:["Use = and × constraints as your starting clues","If a row has 3 Suns already, all remaining cells are Moons","Work rows and columns together"],
    donts:["Don't place 3 of the same symbol in a row","Don't ignore the constraint badges between cells"],
    hint:"Start with rows/cols that have the most given symbols.",
  },
  memory: {
    title:"How to Play Memory",
    goal:"Flip cards to find all matching pairs.",
    rules:["Tap any card to flip it face up","Tap a second card — if they match, they stay revealed","If they don't match, both flip back after 1 second","Find all pairs to complete the stage"],
    dos:["Remember where cards are after they flip back","Start from the corners — easier to track positions","Flip quickly to keep more XP"],
    donts:["Don't flip cards randomly — memorise positions","Don't wait too long — XP decays in real time"],
    hint:"Keep a mental map — first focus on one icon, find its pair.",
  },
  queens: {
    title:"How to Play Queens",
    goal:"Place exactly one queen () in each row, column, and color region.",
    rules:["Tap once → ✕ mark (excluded cell)","Tap twice →  queen","Tap three times → clear","Queens cannot touch each other — not even diagonally","One queen per row, column, and color region"],
    dos:["Use ✕ marks to eliminate impossible cells","Find regions with only one possible position first","Check both rows AND columns when placing"],
    donts:["Don't place queens diagonally adjacent to each other","Don't forget the color region constraint"],
    hint:"Small regions with few cells are the easiest to solve first.",
  },
  sudoku: {
    title:"How to Play Sudoku",
    goal:"Fill every cell so each row, column, and box contains 1–9 exactly once.",
    rules:["Tap a white cell to select it","Use the number pad below to fill it","Each number appears exactly once per row","Each number appears exactly once per column","Each number appears exactly once per box"],
    dos:["Start with rows/cols/boxes that are almost full","Use process of elimination","Scan all three constraints at once"],
    donts:["Don't guess — every puzzle has a logical solution","Don't ignore the box constraint"],
    hint:"Find cells where only one number is possible — called 'naked singles'.",
  },
  zip: {
    title:"How to Play Zip",
    goal:"Trace a continuous path that visits every cell and passes through waypoints in order.",
    rules:["Drag or tap adjacent cells to trace your path","You must visit numbered waypoints in order (1, 2, 3...)","Your path must cover every single cell","Tap your second-to-last cell to undo one step"],
    dos:["Plan your route before starting — look at all waypoints","Work backwards from the last waypoint","Leave yourself enough room to reach every corner"],
    donts:["Don't paint yourself into a corner","Don't skip waypoints — they must be visited in order"],
    hint:"The path must be a Hamiltonian path — every cell exactly once.",
  },
  minesweeper: {
    title:"How to Play Minesweeper",
    goal:"Reveal all safe cells without hitting a mine.",
    rules:["Left-click (or tap) to reveal a cell","Right-click (or long-press) to flag a suspected mine","Numbers show how many mines are in the 8 adjacent cells","Your first click is always safe"],
    dos:["Flag cells you're sure are mines","Use numbers to deduce safe cells nearby","If a number's mine count is already flagged, the other neighbours are safe"],
    donts:["Don't guess if you can deduce","Don't click flagged cells"],
    hint:"A '1' next to only one unrevealed cell → that cell is the mine.",
  },
  flow: {
    title:"How to Play Flow",
    goal:"Connect every color dot pair and fill every cell on the board.",
    rules:["Drag from one dot to its matching color dot","Paths cannot cross each other","Every single cell must be filled","Drag to draw — release to place"],
    dos:["Fill the board completely — empty cells mean failure","Start with dots in corners or edges — fewer options","Reroute earlier paths if you get stuck"],
    donts:["Don't leave any cell empty","Don't let paths cross"],
    hint:"Dots near corners usually have only one valid path — start there.",
  },
  nonogram: {
    title:"How to Play Nonogram",
    goal:"Shade cells to reveal a hidden pixel picture using row and column clues.",
    rules:["Numbers show runs of shaded cells in that row/column","Multiple numbers = multiple separate runs, in order","Runs must have at least one gap between them","Fill mode shades · Cross mode marks empty cells"],
    dos:["Start with rows/cols where the clue nearly fills the whole line","Cross out cells you know are empty","Overlap technique: large runs in short lines have guaranteed cells"],
    donts:["Don't shade cells you're not sure about","Don't forget gaps are required between runs"],
    hint:"A clue of [n] in a row of n cells → all n cells are filled.",
  },
  bridges: {
    title:"How to Play Bridges",
    goal:"Connect all islands with bridges so each island has exactly the right number.",
    rules:["Click between two islands to add a bridge","Click again to make it a double bridge","Click a third time to remove it","The number on each island = total bridges connecting it","Bridges cannot cross each other"],
    dos:["Islands with '1' and only one neighbor → that bridge is forced","Count how many bridges each island still needs","All islands must be connected in one group"],
    donts:["Don't add more bridges than an island's number allows","Don't let bridges cross"],
    hint:"An island with 4 and only 2 neighbors needs 2 bridges on each side.",
  },
  "pattern-match": {
    title:"How to Play Pattern Match",
    goal:"Study the sequence, identify the hidden rule, and choose the next item.",
    rules:["Look at the sequence of items shown","Find the mathematical or visual rule connecting them","Tap the correct answer from the 4 options","Use a hint to reveal the rule (costs 25% XP)"],
    dos:["Check differences between consecutive items first","Look for addition, multiplication, or alternating patterns","Check both value AND color/shape"],
    donts:["Don't just guess — use the hint if stuck","Don't ignore visual patterns (color, shape cycling)"],
    hint:"Try subtracting consecutive terms — a constant difference means arithmetic.",
  },
  "2048-pro": {
    title:"How to Play 2048 Pro",
    goal:"Merge tiles by sliding them — reach the target number to win.",
    rules:["Swipe (or use arrow keys) to slide all tiles","When two equal tiles collide, they merge into one","A new tile appears after each move","Reach the target tile (512 / 1024 / 2048) to win"],
    dos:["Keep your highest tile in one corner","Build a snake pattern toward the corner","Think 2–3 moves ahead"],
    donts:["Don't swipe randomly — plan each move","Don't let the board fill up with small tiles"],
    hint:"Keep your largest tile in the bottom-left corner and never swipe up.",
  },
  kakuro: {
    title:"How to Play Kakuro",
    goal:"Fill every white cell with a digit so each run of cells sums exactly to its clue.",
    rules:[
      "Dark clue cells have a diagonal line — number top-left = sum going DOWN, number bottom-right = sum going RIGHT",
      "Fill white cells with digits 1–9 only",
      "No digit may repeat within the same run (e.g. a run of 4 cannot be 2+2 — must be 1+3)",
      "Every run must total exactly its clue number",
    ],
    dos:[
      "Start with the most constrained runs — short runs with small or large sums have very few options",
      "2 cells summing to 3 → must be 1+2 (only option)",
      "2 cells summing to 17 → must be 8+9 (only option)",
      "Use elimination: if a digit appears in a crossing run, remove it from your options",
    ],
    donts:[
      "Don't repeat any digit within the same run",
      "Don't use 0 — only digits 1 through 9",
    ],
    hint:"Forced pairs: sum=3 (2 cells) → 1+2. Sum=16 → 7+9. Sum=17 → 8+9. These leave no choice.",
  },
  "gravity-sort": {
    title:"How to Play Gravity Sort",
    goal:"Sort all colored blocks so each column contains only one color.",
    rules:["Click a column to pick up its top block","Click another column to drop the block there","A column is full when it reaches the row limit","Sort all colors into their target columns to win"],
    dos:["Use the empty columns as temporary storage","Move blocks in reverse order — place the bottom ones first","Plan several moves ahead"],
    donts:["Don't fill your empty columns without a plan","Don't trap a color underneath the wrong color"],
    hint:"Think of it like Tower of Hanoi — use empty columns as buffers.",
  },
  "hex-merge": {
    title:"How to Play Hex Merge",
    goal:"Merge matching hexagonal tiles to reach the target value.",
    rules:["Click a tile to select it","Click an adjacent tile with the same value to merge","Merged tiles double in value","Reach the target tile (64 / 128 / 256) to win","Green highlighted tiles = valid merge targets"],
    dos:["Chain merges — merging creates new matching pairs","Work from the center outward","Look for clusters of the same value"],
    donts:["Don't merge tiles that don't match","Don't isolate your high-value tiles"],
    hint:"Create chains — merge two 4s into 8, then merge the 8s into 16.",
  },
  "logic-path": {
    title:"How to Play Logic Path",
    goal:"Rotate pipe tiles so every connection is valid — no open ends.",
    rules:["Click any unlocked tile to rotate it 90° clockwise","Pipes must connect to their neighbors on all shared sides","No pipe end may face the board edge","Locked tiles (🔒) cannot be rotated"],
    dos:["Start with corner tiles — they have the fewest options","Work outward from locked tiles","Check all four sides of each tile"],
    donts:["Don't leave any open pipe ends","Don't rotate locked tiles"],
    hint:"A straight pipe in a corner must align with both walls — only one rotation works.",
  },
    lightup: {
    title:"How to Play Light Up",
    goal:"Place light bulbs so every white cell is illuminated.",
    rules:[
      "Click any white cell to place a bulb 💡, click again to remove it",
      "Bulbs illuminate all cells in 4 directions (up/down/left/right) until blocked by a black cell",
      "Every white cell must be lit by at least one bulb",
      "No two bulbs may illuminate each other — they cannot be in the same line of sight",
      "Red numbered black cells = that cell must have EXACTLY that many bulbs touching it (up/down/left/right only). A red 0 means NO bulbs adjacent. A red 3 means exactly 3 bulbs must touch it.",
    ],
    dos:[
      "Start with numbered black cells — they tell you exactly how many bulbs go next to them",
      "A 0-clue cell means all its neighbors are bulb-free",
      "If a number matches its available neighbor count, fill all of them",
      "Use process of elimination — if a cell can only be lit one way, place that bulb",
    ],
    donts:[
      "Don't place two bulbs in the same row or column without a black cell between them",
      "Don't ignore numbered cells — they are the key constraints",
    ],
    hint:"Red numbered squares are your anchor points. Start there and work outward.",
  },
  patches: {
    title:"How to Play Patches",
    goal:"Tile the entire board using all the polyomino pieces — no gaps, no overlaps.",
    rules:["Select a piece from the palette below the board","Hover over the board to preview placement","Click to place the piece","Click a placed piece to pick it back up","All pieces must fit perfectly"],
    dos:["Start with the largest or most awkward pieces","Fill corners first — fewer options for odd shapes","Pick up and rearrange if you get stuck"],
    donts:["Don't leave gaps — every cell must be covered","Don't overlap pieces"],
    hint:"Place L-shaped pieces in corners first — they have very few valid positions.",
  },
  "word-sling": {
    title:"How to Play Word Sling",
    goal:"Build as many valid words as possible from your letter tiles.",
    rules:["Tap letters to add them to your current word","Tap Submit (or ✓) to submit the word","Tap the delete button to clear your current word","Find all hidden words to complete the stage","Longer words score more points"],
    dos:["Try 3-letter words first to get started","Look for common prefixes: UN-, RE-, PRE-","Look for common suffixes: -ING, -ED, -LY"],
    donts:["Don't submit the same word twice","Don't use letters you don't have"],
    hint:"Shuffle mentally — rearrange the tiles to spot hidden words.",
  },
  hearts: {
    title:"How to Play Hearts",
    goal:"Have fewer penalty points than the CPU after all 13 tricks.",
    rules:["Each ♥ heart = 1 penalty point","The ♠Q (Queen of Spades) = 13 penalty points","Select a card then tap 'Play' to play it","Higher card value wins the trick","Winner of each trick takes all penalty cards in it"],
    dos:["Avoid winning tricks that contain hearts or the Queen of Spades","Play low cards to let the CPU win risky tricks","Save high cards to win safe (no-penalty) tricks"],
    donts:["Don't play high cards when the trick contains hearts","Don't win a trick containing the Queen of Spades"],
    hint:"Play your lowest cards first to let the CPU absorb penalty cards.",
  },
  solitaire: {
    title:"How to Play Solitaire",
    goal:"Move all 52 cards to the four foundation piles (A→K per suit).",
    rules:["Click stock (top-left) to draw cards to the waste pile","Click a card to select it, click destination to move it","Tableau: stack in descending order, alternating red/black","Foundation: build up by suit from Ace to King","Face-down cards flip when they become the top card"],
    dos:["Move Aces and 2s to foundations immediately","Uncover face-down cards as quickly as possible","Use empty columns strategically for Kings"],
    donts:["Don't fill empty columns with non-Kings unnecessarily","Don't cycle through stock endlessly without a plan"],
    hint:"Prioritise uncovering face-down tableau cards over moving to foundations.",
  },
};

export function GameInstructions({ game, onOpen, onClose, standalone }: GameInstructionsProps) {
  const [open, setOpen] = useState(!!standalone);
  const info = INSTRUCTIONS[game];
  const Snapshot = SNAPSHOTS[game];
  // When standalone and closed, notify parent
  useEffect(() => {
    if (standalone && !open) onClose?.();
  }, [open, standalone]);

  function handleOpen() {
    setOpen(true);
    onOpen?.();
  }
  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  if (!info) return null;

  return (
    <>
      <button onClick={handleOpen}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:20, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", cursor:"pointer", fontSize:12, fontWeight:600, color:"var(--color-text-secondary)", boxShadow:"var(--shadow-sm)" }}>
        <HelpCircle size={13} color="var(--color-accent-primary)"/> How to play
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}
            onClick={e=>{if(e.target===e.currentTarget)handleClose();}}>
            <motion.div initial={{scale:0.92,y:24}} animate={{scale:1,y:0}} exit={{scale:0.92,y:24}}
              transition={{type:"spring",stiffness:380,damping:28}}
              style={{ background:"var(--color-surface)", borderRadius:28, maxWidth:500, width:"100%", maxHeight:"88vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.25)", position:"relative" }}>

              {/* Header */}
              <div style={{ padding:"22px 24px 16px", borderBottom:"0.5px solid var(--color-border)", position:"sticky", top:0, background:"var(--color-surface)", zIndex:1, borderRadius:"28px 28px 0 0" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                  <div>
                    <h2 style={{ fontSize:19, fontWeight:700, color:"var(--color-text-primary)", fontFamily:"var(--font-sans)", marginBottom:4 }}>{info.title}</h2>
                    <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.6 }}>{info.goal}</p>
                  </div>
                  <button onClick={handleClose}
                    style={{ padding:8, borderRadius:10, background:"var(--color-surface-2)", border:"none", cursor:"pointer", flexShrink:0 }}>
                    <X size={15} color="var(--color-text-secondary)"/>
                  </button>
                </div>
              </div>

              <div style={{ padding:"20px 24px 28px", display:"flex", flexDirection:"column", gap:20 }}>

                {/* Board snapshots — before/after */}
                {Snapshot && (
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"var(--color-text-secondary)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>
                      Before → After
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ marginBottom:6, display:"flex", justifyContent:"center" }}>
                          <Snapshot solved={false}/>
                        </div>
                        <p style={{ fontSize:10, color:"var(--color-text-secondary)", fontWeight:600 }}>Starting board</p>
                      </div>
                      <div style={{ fontSize:20, color:"var(--color-text-secondary)" }}>→</div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ marginBottom:6, display:"flex", justifyContent:"center" }}>
                          <Snapshot solved={true}/>
                        </div>
                        <p style={{ fontSize:10, color:"#22C55E", fontWeight:600 }}>Solved ✓</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rules */}
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:"var(--color-text-secondary)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>Rules</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {info.rules.map((rule,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(79,110,247,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"var(--color-accent-primary)", flexShrink:0, marginTop:1 }}>
                          {i+1}
                        </div>
                        <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.55 }}>{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Do / Don't */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div style={{ background:"rgba(34,197,94,0.07)", borderRadius:16, padding:14, border:"0.5px solid rgba(34,197,94,0.2)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                      <CheckCircle size={14} color="#16A34A"/>
                      <p style={{ fontSize:11, fontWeight:700, color:"#16A34A", textTransform:"uppercase", letterSpacing:"0.1em" }}>Do</p>
                    </div>
                    {info.dos.map((d,i) => <p key={i} style={{ fontSize:12, color:"#166534", lineHeight:1.55, marginBottom:6 }}>· {d}</p>)}
                  </div>
                  <div style={{ background:"rgba(239,68,68,0.06)", borderRadius:16, padding:14, border:"0.5px solid rgba(239,68,68,0.15)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                      <XCircle size={14} color="#DC2626"/>
                      <p style={{ fontSize:11, fontWeight:700, color:"#DC2626", textTransform:"uppercase", letterSpacing:"0.1em" }}>Don't</p>
                    </div>
                    {info.donts.map((d,i) => <p key={i} style={{ fontSize:12, color:"#991B1B", lineHeight:1.55, marginBottom:6 }}>· {d}</p>)}
                  </div>
                </div>

                {/* Pro tip */}
                <div style={{ background:"rgba(245,158,11,0.08)", borderRadius:16, padding:14, border:"0.5px solid rgba(245,158,11,0.25)", display:"flex", alignItems:"flex-start", gap:10 }}>
                  <Lightbulb size={16} color="#F59E0B" style={{ flexShrink:0, marginTop:1 }}/>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#B45309", marginBottom:4 }}>PRO TIP</p>
                    <p style={{ fontSize:13, color:"#92400E", lineHeight:1.6 }}>{info.hint}</p>
                  </div>
                </div>

                <button onClick={handleClose}
                  style={{ width:"100%", padding:13, borderRadius:14, border:"none", background:"linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", fontSize:13, fontWeight:700, color:"white", cursor:"pointer" }}>
                  Got it — Let's Play
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
