"use client";

import { GameIcon } from "@/components/icons/GameIcons";

export function GameSnapshot({ slug }: { slug: string }) {
  const snaps: Record<string, React.ReactNode> = {

    "tango": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(79,110,247,0.04)" rx={10}/>
        {[[1,0,1,0],[0,1,0,1],[1,0,1,0],[0,1,0,1]].map((row,r)=>row.map((isSun,c)=>(
          <g key={`${r}-${c}`}>
            <rect x={c*20+6} y={r*20+6} width={18} height={18} rx={5} fill="white" stroke="rgba(0,0,0,0.08)" strokeWidth={1}/>
            {isSun
              ? <circle cx={c*20+15} cy={r*20+15} r={5} fill="#F59E0B"/>
              : <path d={`M${c*20+15},${r*20+10} a5,5 0 0,0 0,10`} fill="#6366F1"/>}
          </g>
        )))}
        <circle cx={26} cy={15} r={4} fill="white" stroke="var(--color-accent-primary)" strokeWidth={1}/>
        <text x={26} y={18} textAnchor="middle" style={{fontSize:6,fontWeight:700,fill:"var(--color-accent-primary)"}}>=</text>
        <circle cx={46} cy={35} r={4} fill="white" stroke="var(--color-error)" strokeWidth={1}/>
        <text x={46} y={38} textAnchor="middle" style={{fontSize:6,fontWeight:700,fill:"var(--color-error)"}}>x</text>
      </svg>
    ),

    "memory": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(79,110,247,0.04)" rx={10}/>
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>{
          const r=Math.floor(i/4),c=i%4;
          const revealed=[0,4,7,11].includes(i);
          return(
            <g key={i}>
              <rect x={c*20+6} y={r*22+8} width={17} height={19} rx={4}
                fill={revealed?"white":"var(--color-accent-primary)"} stroke={revealed?"#E2E8F0":"none"} strokeWidth={1} opacity={revealed?1:0.8}/>
              {revealed&&<circle cx={c*20+14.5} cy={r*22+17.5} r={5}
                fill={[0,4].includes(i)?"var(--color-error)":"#3B82F6"} opacity={0.8}/>}
            </g>
          );
        })}
      </svg>
    ),

    "queens": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(79,110,247,0.04)" rx={10}/>
        {[[0,0,1,1],[0,0,1,1],[2,2,3,3],[2,2,3,3]].map((row,r)=>row.map((rid,c)=>{
          const colors=["#DBEAFE","#FED7AA","#BBF7D0","#E9D5FF"];
          const hasQueen=(r===0&&c===1)||(r===1&&c===3)||(r===2&&c===0)||(r===3&&c===2);
          return(
            <g key={`${r}-${c}`}>
              <rect x={c*20+6} y={r*20+6} width={19} height={19} fill={colors[rid]} stroke="rgba(0,0,0,0.1)" strokeWidth={0.5}/>
              {hasQueen&&<text x={c*20+15.5} y={r*20+19} textAnchor="middle" style={{fontSize:11,fill:"#1C1917"}}>♛</text>}
            </g>
          );
        }))}
      </svg>
    ),

    "sudoku": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(220,38,38,0.04)" rx={10}/>
        {[[5,3,0,6],[6,0,2,0],[0,9,0,3],[8,0,9,7]].map((row,r)=>row.map((val,c)=>(
          <g key={`${r}-${c}`}>
            <rect x={c*19+8} y={r*19+8} width={17} height={17}
              fill={val>0?"#F8F7F5":"white"}
              stroke={c===1||r===1?"#374151":"#E2E8F0"}
              strokeWidth={c===1||r===1?1.5:0.5}/>
            {val>0&&<text x={c*19+16.5} y={r*19+19} textAnchor="middle"
              style={{fontSize:9,fontWeight:700,fill:"#374151"}}>{val}</text>}
          </g>
        )))}
        <rect x={8} y={8} width={36} height={36} fill="none" stroke="#374151" strokeWidth={1.5}/>
        <rect x={46} y={8} width={36} height={36} fill="none" stroke="#374151" strokeWidth={1.5}/>
        <rect x={8} y={46} width={36} height={36} fill="none" stroke="#374151" strokeWidth={1.5}/>
        <rect x={46} y={46} width={36} height={36} fill="none" stroke="#374151" strokeWidth={1.5}/>
      </svg>
    ),

    "zip": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(13,148,136,0.04)" rx={10}/>
        <polyline points="15,15 15,40 40,40 40,15 65,15 65,40 65,65 40,65 15,65 15,40"
          fill="none" stroke="var(--color-accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        {[[15,15,1],[65,15,2],[65,65,3],[15,65,4]].map(([x,y,n],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r={10} fill="white" stroke="var(--color-accent-primary)" strokeWidth={2}/>
            <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
              style={{fontSize:10,fontWeight:700,fill:"var(--color-accent-primary)"}}>{n}</text>
          </g>
        ))}
        {[[40,40],[40,15],[40,65],[15,40],[65,40]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={4} fill="rgba(79,110,247,0.3)"/>
        ))}
      </svg>
    ),

    "flow": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(79,110,247,0.04)" rx={10}/>
        <circle cx={10} cy={10} r={9} fill="var(--color-error)"/>
        <circle cx={80} cy={10} r={9} fill="#3B82F6"/>
        <circle cx={10} cy={80} r={9} fill="#22C55E"/>
        <circle cx={80} cy={80} r={9} fill="#F59E0B"/>
        <polyline points="10,10 10,45 45,45 45,10 80,10" fill="none" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <polyline points="10,10 10,80" fill="none" stroke="var(--color-error)" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
        <polyline points="10,80 45,80 45,45 80,45 80,80" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <polyline points="80,10 80,45" fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
        {[22.5,45,67.5].map(x=><line key={x} x1={x} y1={0} x2={x} y2={90} stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>)}
        {[22.5,45,67.5].map(y=><line key={y} x1={0} y1={y} x2={90} y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>)}
      </svg>
    ),

    "bridges": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(180,83,9,0.04)" rx={10}/>
        <line x1={18} y1={18} x2={72} y2={18} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={18} y1={22} x2={72} y2={22} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={18} y1={72} x2={72} y2={72} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={18} y1={18} x2={18} y2={72} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={72} y1={18} x2={72} y2={72} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={72} y1={22} x2={72} y2={72} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        {[[18,18,3],[72,18,2],[18,72,2],[72,72,3],[45,45,4]].map(([x,y,n],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r={13} fill="var(--color-accent-primary)"/>
            <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:11,fontWeight:700,fill:"white"}}>{n}</text>
          </g>
        ))}
      </svg>
    ),

    "kakuro": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(29,78,216,0.04)" rx={10}/>
        {[
          ["B17","W","W","W"],["W","B6","W","W"],["B","W","W","B12"],["W","W","B","W"],
        ].map((row,r)=>row.map((cell,c)=>{
          const x=c*22+4,y=r*22+4;
          const isBlack=cell.startsWith("B");
          const clue=isBlack&&cell.length>1?cell.slice(1):"";
          return(
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={21} height={21} fill={isBlack?"#374151":"white"} stroke="#E2E8F0" strokeWidth={0.5}/>
              {isBlack&&clue&&(
                <><line x1={x} y1={y} x2={x+21} y2={y+21} stroke="#555" strokeWidth={0.5}/>
                <text x={x+15} y={y+19} style={{fontSize:7,fill:"white",fontWeight:700}}>{clue}</text></>
              )}
              {!isBlack&&r+c>0&&(
                <text x={x+10.5} y={y+14} textAnchor="middle" style={{fontSize:9,fontWeight:700,fill:"var(--color-accent-primary)"}}>
                  {[[4,3,2],[2,1],[5,3],[4]][r]?.[c-1]||""}
                </text>
              )}
            </g>
          );
        }))}
      </svg>
    ),

    "logic-path": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(8,145,178,0.04)" rx={10}/>
        {[
          [[false,true,false,false],[true,false,false,true],[false,false,true,false]],
          [[false,false,true,false],[true,true,true,false],[true,false,false,true]],
          [[true,true,false,false],[false,false,false,true],[true,false,false,false]],
        ].map((row,r)=>row.map((pipe,c)=>{
          const cx=c*28+18,cy=r*28+18,w=5,color="var(--color-accent-primary)";
          return(
            <g key={`${r}-${c}`}>
              <rect x={cx-14} y={cy-14} width={26} height={26} fill="rgba(79,110,247,0.06)" rx={5}/>
              {pipe[0]&&<rect x={cx-w/2} y={cy-14} width={w} height={14} fill={color} rx={2}/>}
              {pipe[1]&&<rect x={cx} y={cy-w/2} width={14} height={w} fill={color} rx={2}/>}
              {pipe[2]&&<rect x={cx-w/2} y={cy} width={w} height={14} fill={color} rx={2}/>}
              {pipe[3]&&<rect x={cx-14} y={cy-w/2} width={14} height={w} fill={color} rx={2}/>}
              <circle cx={cx} cy={cy} r={w*0.9} fill={color}/>
            </g>
          );
        }))}
      </svg>
    ),

    "lightup": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(202,138,4,0.04)" rx={10}/>
        {[[0,1,0,1],[1,0,1,0],[0,1,0,0],[1,0,1,1]].map((row,r)=>row.map((hasLight,c)=>(
          <g key={`${r}-${c}`}>
            <rect x={c*20+5} y={r*20+5} width={19} height={19} fill={hasLight?"#FFFBEB":"rgba(55,65,81,0.08)"} rx={3}/>
            {hasLight&&<text x={c*20+14.5} y={r*20+19} textAnchor="middle" style={{fontSize:13}}>●</text>}
          </g>
        )))}
        {[[0,0],[1,1],[2,3],[3,2]].map(([r,c],i)=>(
          <g key={i}>
            <rect x={c*20+5} y={r*20+5} width={19} height={19} fill="#374151" rx={3}/>
            {i===0&&<text x={c*20+14.5} y={r*20+17} textAnchor="middle" style={{fontSize:8,fontWeight:700,fill:"white"}}>2</text>}
          </g>
        ))}
      </svg>
    ),

    "nonogram": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(190,24,93,0.04)" rx={10}/>
        {[["2"],["1","1"],["3"],["1","2"],["2"]].map((cl,i)=>cl.map((n,j)=>(
          <text key={`${i}-${j}`} x={28+i*12} y={8+j*10} textAnchor="middle" style={{fontSize:8,fontWeight:700,fill:"#374151"}}>{n}</text>
        )))}
        {[["2"],["1","1"],["3"],["2"],["1","2"]].map((cl,r)=>(
          <text key={r} x={18} y={30+r*12} textAnchor="middle" style={{fontSize:8,fontWeight:700,fill:"#374151"}}>{cl.join(" ")}</text>
        ))}
        {[[1,0,1,0,1],[0,1,0,1,0],[1,1,1,0,0],[0,1,0,1,1],[1,0,0,1,0]].map((row,r)=>row.map((cell,c)=>(
          <rect key={`${r}-${c}`} x={22+c*12} y={24+r*12} width={11} height={11} fill={cell?"#1C1917":"rgba(0,0,0,0.06)"} rx={2}/>
        )))}
      </svg>
    ),

    "pattern-match": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(124,58,237,0.04)" rx={10}/>
        {[3,6,9,12].map((n,i)=>(
          <g key={i}>
            <rect x={i*18+5} y={20} width={16} height={16} rx={4} fill="rgba(124,58,237,0.12)" stroke="#7C3AED" strokeWidth={1}/>
            <text x={i*18+13} y={31} textAnchor="middle" style={{fontSize:9,fontWeight:700,fill:"#7C3AED"}}>{n}</text>
          </g>
        ))}
        <text x={77} y={31} style={{fontSize:12,fill:"#94A3B8"}}>→</text>
        <rect x={5} y={50} width={30} height={20} rx={6} fill="rgba(124,58,237,0.08)" stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="4"/>
        <text x={20} y={63} textAnchor="middle" style={{fontSize:10,fontWeight:700,fill:"#7C3AED"}}>?</text>
        {[12,15,18,9].map((n,i)=>(
          <g key={i}>
            <rect x={40+i*12} y={50} width={11} height={20} rx={4}
              fill={n===15?"rgba(124,58,237,0.2)":"rgba(0,0,0,0.04)"}
              stroke={n===15?"#7C3AED":"#E2E8F0"} strokeWidth={1}/>
            <text x={45+i*12} y={63} textAnchor="middle" style={{fontSize:8,fontWeight:700,fill:n===15?"#7C3AED":"#94A3B8"}}>{n}</text>
          </g>
        ))}
        <text x={45} y={85} textAnchor="middle" style={{fontSize:8,fill:"#94A3B8"}}>Add 3 each time</text>
      </svg>
    ),

    "patches": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(245,158,11,0.04)" rx={10}/>
        {[[0,0,1,1,1],[0,0,2,1,3],[0,2,2,3,3],[4,2,2,3,3],[4,4,2,4,3]].map((row,r)=>row.map((pid,c)=>{
          const colors=["var(--color-error)","#3B82F6","#22C55E","#F59E0B","#A855F7"];
          return<rect key={`${r}-${c}`} x={c*16+8} y={r*16+8} width={15} height={15} fill={colors[pid]} opacity={0.8} rx={3}/>;
        }))}
      </svg>
    ),

    "2048-pro": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="#FAF8EF" rx={10}/>
        <rect x={4} y={4} width={82} height={82} rx={8} fill="#BBADA0"/>
        {[[2,4,8,16],[32,64,128,256],[0,2,4,8],[0,0,2,4]].map((row,r)=>row.map((val,c)=>{
          const clrs:Record<number,string>={0:"#CDC1B4",2:"#EEE4DA",4:"#EDE0C8",8:"#F2B179",16:"#F59563",32:"#F67C5F",64:"#F65E3B",128:"#EDCF72",256:"#EDC22E"};
          const textClr=val>4?"white":"#776E65";
          return(
            <g key={`${r}-${c}`}>
              <rect x={c*19+8} y={r*19+8} width={17} height={17} rx={3} fill={clrs[val]||"#CDC1B4"}/>
              {val>0&&<text x={c*19+16.5} y={r*19+19} textAnchor="middle" style={{fontSize:7,fontWeight:700,fill:textClr}}>{val}</text>}
            </g>
          );
        }))}
      </svg>
    ),

    "gravity-sort": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(194,65,12,0.04)" rx={10}/>
        {[["var(--color-error)","#3B82F6","#22C55E","#F59E0B"],["#3B82F6","#22C55E","var(--color-error)","#3B82F6"],["#22C55E","#F59E0B","#3B82F6","var(--color-error)"],["#F59E0B","var(--color-error)","#F59E0B","#22C55E"]].map((col,ci)=>col.map((color,ri)=>(
          <rect key={`${ci}-${ri}`} x={ci*21+6} y={ri*18+10} width={18} height={15} rx={4} fill={color} opacity={0.85}/>
        )))}
        <text x={45} y={86} textAnchor="middle" style={{fontSize:12,fill:"#94A3B8"}}>↓</text>
      </svg>
    ),

    "hex-merge": (
      <svg width={90} height={90} viewBox="-45 -45 90 90">
        <rect x={-45} y={-45} width={90} height={90} fill="rgba(13,148,136,0.04)" rx={10}/>
        {[[-1,-1,2,"#DBEAFE"],[0,-1,4,"#BBF7D0"],[1,-2,2,"#DBEAFE"],[-1,0,4,"#BBF7D0"],[0,0,8,"#FDE68A"],[1,-1,4,"#BBF7D0"],[-1,1,2,"#DBEAFE"],[0,1,4,"#BBF7D0"],[1,0,2,"#DBEAFE"]].map(([q,r,val,color],i)=>{
          const x=16*(1.5*(q as number));
          const y=16*(Math.sqrt(3)/2*(q as number)+Math.sqrt(3)*(r as number));
          const pts=Array.from({length:6},(_,k)=>{const a=Math.PI/180*(60*k-30);return`${x+14*Math.cos(a)},${y+14*Math.sin(a)}`;}).join(" ");
          return(<g key={i}><polygon points={pts} fill={color as string} stroke="rgba(0,0,0,0.1)" strokeWidth={0.5}/><text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:9,fontWeight:700,fill:"#374151"}}>{val}</text></g>);
        })}
      </svg>
    ),

    "word-sling": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(4,120,87,0.04)" rx={10}/>
        {"MINDSTATE".split("").map((l,i)=>(
          <g key={i}>
            <rect x={i%5*16+8} y={Math.floor(i/5)*18+8} width={14} height={16} rx={3} fill="white" stroke="#E2E8F0" strokeWidth={1}/>
            <text x={i%5*16+15} y={Math.floor(i/5)*18+19} textAnchor="middle" dominantBaseline="middle" style={{fontSize:8,fontWeight:700,fill:"#1C1917"}}>{l}</text>
          </g>
        ))}
        <rect x={8} y={58} width={42} height={14} rx={7} fill="#F0FDF4" stroke="#86EFAC" strokeWidth={1}/>
        <text x={29} y={67} textAnchor="middle" style={{fontSize:8,fontWeight:700,fill:"#15803D"}}>MIND</text>
        <rect x={54} y={58} width={30} height={14} rx={7} fill="#F0FDF4" stroke="#86EFAC" strokeWidth={1}/>
        <text x={69} y={67} textAnchor="middle" style={{fontSize:8,fontWeight:700,fill:"#15803D"}}>STATE</text>
      </svg>
    ),

    "hearts": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(225,29,72,0.04)" rx={10}/>
        {[["A♠","#1C1917"],["K♥","#DC2626"],["Q♦","#DC2626"],["J♣","#1C1917"],["10♠","#1C1917"]].map(([card,color],i)=>(
          <g key={i} transform={`rotate(${(i-2)*8}, 45, 120)`}>
            <rect x={18+i*2} y={20} width={22} height={34} rx={4} fill="white" stroke="#E2E8F0" strokeWidth={1.5}/>
            <text x={29+i*2} y={38} textAnchor="middle" style={{fontSize:8,fontWeight:700,fill:color as string}}>{card}</text>
          </g>
        ))}
        <text x={45} y={80} textAnchor="middle" style={{fontSize:9,fontWeight:600,fill:"#94A3B8"}}>Avoid ♥ Q♠</text>
      </svg>
    ),

    "solitaire": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(21,128,61,0.06)" rx={10}/>
        {["♥","♦","♣","♠"].map((suit,i)=>(
          <g key={i}>
            <rect x={i*20+6} y={5} width={17} height={23} rx={3} fill="white" stroke="#E2E8F0" strokeWidth={1}/>
            <text x={i*20+14.5} y={19} textAnchor="middle" style={{fontSize:10,fill:i<2?"#DC2626":"#1C1917"}}>{suit}</text>
          </g>
        ))}
        {[["K♠","Q♥"],["J♣","10♦"],["9♠","8♥"],["7♣"]].map((col,ci)=>col.map((card,ri)=>(
          <g key={`${ci}-${ri}`}>
            <rect x={ci*22+3} y={ri*12+35} width={20} height={18} rx={2} fill="white" stroke="#E2E8F0" strokeWidth={1}/>
            <text x={ci*22+13} y={ri*12+47} textAnchor="middle" style={{fontSize:6,fontWeight:700,fill:card.includes("♥")||card.includes("♦")?"#DC2626":"#1C1917"}}>{card}</text>
          </g>
        )))}
      </svg>
    ),

    "minesweeper": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(153,27,27,0.04)" rx={10}/>
        {[[null,"1","1",null],[null,"1","✕",null],["1","2","2","1"],["✕","1",null,null]].map((row,r)=>row.map((cell,c)=>(
          <g key={`${r}-${c}`}>
            <rect x={c*21+5} y={r*21+5} width={19} height={19}
              fill={cell===null?"#D1D5DB":cell==="✕"?"#FEE2E2":"#F3F4F6"} rx={3}/>
            {cell&&cell!=="✕"&&<text x={c*21+14.5} y={r*21+18} textAnchor="middle"
              style={{fontSize:10,fontWeight:700,fill:cell==="1"?"#2563EB":cell==="2"?"#16A34A":"#DC2626"}}>{cell}</text>}
            {cell==="✕"&&<text x={c*21+14.5} y={r*21+18} textAnchor="middle" style={{fontSize:12}}>✕</text>}
          </g>
        )))}
      </svg>
    ),

    // ── NEW: Word Climb ───────────────────────────────────────────────────────
    "word-climb": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(34,197,94,0.04)" rx={10}/>
        {/* Word ladder — each rung differs by one letter */}
        {[["CAT","#22C55E"],["COT","var(--color-accent-primary)"],["COG","var(--color-accent-primary)"],["DOG","#F59E0B"]].map(([word,color],r)=>(
          <g key={r}>
            {/* Rung line */}
            <rect x={12} y={r*18+14} width={66} height={14} rx={7}
              fill={`${color}15`} stroke={color} strokeWidth={1}/>
            <text x={45} y={r*18+24} textAnchor="middle"
              style={{fontSize:10,fontWeight:700,fill:color,letterSpacing:4}}>{word}</text>
          </g>
        ))}
        {/* Arrow indicating climb */}
        <text x={80} y={45} style={{fontSize:16,fill:"#94A3B8"}}>↑</text>
        <text x={30} y={85} textAnchor="middle"
          style={{fontSize:8,fill:"#94A3B8"}}>change one letter</text>
      </svg>
    ),

    // ── NEW: Pinpoint ─────────────────────────────────────────────────────────
    "pinpoint": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(239,68,68,0.04)" rx={10}/>
        {/* Category clues */}
        {["Movies","Action","Sci-Fi"].map((clue,i)=>(
          <g key={i}>
            <rect x={8} y={i*16+8} width={60} height={13} rx={6}
              fill={i===2?"rgba(79,110,247,0.15)":"var(--bg2,#F8F7F5)"}
              stroke={i===2?"var(--color-accent-primary)":"#E2E8F0"} strokeWidth={1}/>
            <text x={38} y={i*16+18} textAnchor="middle"
              style={{fontSize:9,fontWeight:600,fill:i===2?"var(--color-accent-primary)":"#64748B"}}>{clue}</text>
            {i<2&&<text x={72} y={i*16+18} style={{fontSize:9,fill:"#94A3B8"}}>▼</text>}
          </g>
        ))}
        {/* Answer box */}
        <rect x={8} y={60} width={74} height={22} rx={8}
          fill="rgba(79,110,247,0.08)" stroke="var(--color-accent-primary)" strokeWidth={1.5} strokeDasharray="4"/>
        <text x={45} y={75} textAnchor="middle"
          style={{fontSize:11,fontWeight:700,fill:"var(--color-accent-primary)"}}>INCEPTION?</text>
      </svg>
    ),

    // ── NEW: Name the Country ─────────────────────────────────────────────────
    "name-country": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(59,130,246,0.04)" rx={10}/>
        {/* Simple flag stripes — looks like a generic flag */}
        <rect x={12} y={20} width={50} height={36} rx={3} fill="#1D4ED8"/>
        <rect x={12} y={20} width={50} height={12} rx={3} fill="var(--color-error)"/>
        <rect x={12} y={44} width={50} height={12} rx={0} fill="var(--color-error)"/>
        {/* White middle stripe */}
        <rect x={12} y={32} width={50} height={12} rx={0} fill="white"/>
        {/* Flag pole */}
        <rect x={10} y={14} width={3} height={46} rx={1} fill="#94A3B8"/>
        {/* Question mark overlay */}
        <circle cx={70} cy={60} r={14} fill="white" stroke="var(--color-accent-primary)" strokeWidth={2}/>
        <text x={70} y={65} textAnchor="middle"
          style={{fontSize:16,fontWeight:700,fill:"var(--color-accent-primary)"}}>?</text>
      </svg>
    ),

    // ── NEW: Name the City ────────────────────────────────────────────────────
    "name-city": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(99,102,241,0.04)" rx={10}/>
        {/* Simple skyline */}
        <rect x={6}  y={55} width={10} height={28} rx={2} fill="#6366F1" opacity={0.7}/>
        <rect x={18} y={42} width={12} height={41} rx={2} fill="var(--color-accent-primary)" opacity={0.9}/>
        <rect x={32} y={50} width={8}  height={33} rx={2} fill="#6366F1" opacity={0.7}/>
        <rect x={42} y={35} width={14} height={48} rx={2} fill="var(--color-accent-primary)"/>
        <rect x={58} y={48} width={10} height={35} rx={2} fill="#6366F1" opacity={0.8}/>
        <rect x={70} y={58} width={14} height={25} rx={2} fill="#6366F1" opacity={0.6}/>
        {/* Ground */}
        <rect x={0} y={82} width={90} height={8} fill="#E2E8F0" rx={0}/>
        {/* Pin */}
        <circle cx={49} cy={22} r={8} fill="var(--color-error)"/>
        <path d="M49,30 L49,42" stroke="var(--color-error)" strokeWidth={2}/>
        <circle cx={49} cy={22} r={4} fill="white"/>
      </svg>
    ),

  };

  const snap = snaps[slug];
  if (!snap) return <GameIcon slug={slug} size={52} />;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {snap}
    </div>
  );
}