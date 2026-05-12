"use client";

import { GameIcon } from "@/components/icons/GameIcons";

export function GameSnapshot({ slug }: { slug: string }) {
  const snaps: Record<string, React.ReactNode> = {
    "flow": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(79,110,247,0.04)" rx={10}/>
        {/* Dots */}
        <circle cx={10} cy={10} r={9} fill="#EF4444"/>
        <circle cx={80} cy={10} r={9} fill="#3B82F6"/>
        <circle cx={10} cy={80} r={9} fill="#22C55E"/>
        <circle cx={80} cy={80} r={9} fill="#F59E0B"/>
        {/* Paths */}
        <polyline points="10,10 10,45 45,45 45,10 80,10" fill="none" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <polyline points="10,10 10,80" fill="none" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
        <polyline points="10,80 45,80 45,45 80,45 80,80" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <polyline points="80,10 80,45" fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
        {/* Cell grid faint */}
        {[22.5,45,67.5].map(x=><line key={x} x1={x} y1={0} x2={x} y2={90} stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>)}
        {[22.5,45,67.5].map(y=><line key={y} x1={0} y1={y} x2={90} y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>)}
      </svg>
    ),
    "bridges": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(180,83,9,0.04)" rx={10}/>
        {/* Bridges */}
        <line x1={18} y1={18} x2={72} y2={18} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={18} y1={22} x2={72} y2={22} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={18} y1={72} x2={72} y2={72} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={18} y1={18} x2={18} y2={72} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={72} y1={18} x2={72} y2={72} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        <line x1={72} y1={22} x2={72} y2={72} stroke="#374151" strokeWidth="3" opacity="0.6"/>
        {/* Islands */}
        {[[18,18,3],[72,18,2],[18,72,2],[72,72,3],[45,45,4]].map(([x,y,n],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r={13} fill="#4F6EF7"/>
            <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:11,fontWeight:700,fill:"white"}}>{n}</text>
          </g>
        ))}
      </svg>
    ),
    "nonogram": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(190,24,93,0.04)" rx={10}/>
        {/* Column clues */}
        {[["2"],["1","1"],["3"],["1","2"],["2"]].map((cl,i)=>
          cl.map((n,j)=>(
            <text key={`${i}-${j}`} x={28+i*12} y={8+j*10} textAnchor="middle"
              style={{fontSize:8,fontWeight:700,fill:"#374151"}}>{n}</text>
          ))
        )}
        {/* Row clues */}
        {[["2"],["1","1"],["3"],["2"],["1","2"]].map((cl,r)=>(
          <text key={r} x={18} y={30+r*12} textAnchor="middle"
            style={{fontSize:8,fontWeight:700,fill:"#374151"}}>{cl.join(" ")}</text>
        ))}
        {/* Grid */}
        {[[1,0,1,0,1],[0,1,0,1,0],[1,1,1,0,0],[0,1,0,1,1],[1,0,0,1,0]].map((row,r)=>
          row.map((cell,c)=>(
            <rect key={`${r}-${c}`} x={22+c*12} y={24+r*12} width={11} height={11}
              fill={cell?"#1C1917":"rgba(0,0,0,0.06)"} rx={2}/>
          ))
        )}
      </svg>
    ),
    "pattern-match": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(124,58,237,0.04)" rx={10}/>
        {/* Sequence boxes */}
        {[3,6,9,12].map((n,i)=>(
          <g key={i}>
            <rect x={i*18+5} y={20} width={16} height={16} rx={4}
              fill="rgba(124,58,237,0.12)" stroke="#7C3AED" strokeWidth={1}/>
            <text x={i*18+13} y={31} textAnchor="middle"
              style={{fontSize:9,fontWeight:700,fill:"#7C3AED"}}>{n}</text>
          </g>
        ))}
        {/* Arrow */}
        <text x={77} y={31} style={{fontSize:12,fill:"#94A3B8"}}>→</text>
        {/* Answer box */}
        <rect x={5} y={50} width={30} height={20} rx={6}
          fill="rgba(124,58,237,0.08)" stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="4"/>
        <text x={20} y={63} textAnchor="middle"
          style={{fontSize:10,fontWeight:700,fill:"#7C3AED"}}>?</text>
        {/* Options */}
        {[12,15,18,9].map((n,i)=>(
          <g key={i}>
            <rect x={40+i*12} y={50} width={11} height={20} rx={4}
              fill={n===15?"rgba(124,58,237,0.2)":"rgba(0,0,0,0.04)"}
              stroke={n===15?"#7C3AED":"#E2E8F0"} strokeWidth={1}/>
            <text x={45+i*12} y={63} textAnchor="middle"
              style={{fontSize:8,fontWeight:700,fill:n===15?"#7C3AED":"#94A3B8"}}>{n}</text>
          </g>
        ))}
        <text x={45} y={85} textAnchor="middle"
          style={{fontSize:8,fill:"#94A3B8"}}>Add 3 each time</text>
      </svg>
    ),
    "2048-pro": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="#FAF8EF" rx={10}/>
        <rect x={4} y={4} width={82} height={82} rx={8} fill="#BBADA0"/>
        {[[2,4,8,16],[32,64,128,256],[0,2,4,8],[0,0,2,4]].map((row,r)=>
          row.map((val,c)=>{
            const clrs:Record<number,string>={0:"#CDC1B4",2:"#EEE4DA",4:"#EDE0C8",8:"#F2B179",16:"#F59563",32:"#F67C5F",64:"#F65E3B",128:"#EDCF72",256:"#EDC22E"};
            const textClr = val > 4 ? "white" : "#776E65";
            return(
              <g key={`${r}-${c}`}>
                <rect x={c*19+8} y={r*19+8} width={17} height={17} rx={3} fill={clrs[val]||"#CDC1B4"}/>
                {val>0&&<text x={c*19+16.5} y={r*19+19} textAnchor="middle"
                  style={{fontSize:7,fontWeight:700,fill:textClr}}>{val}</text>}
              </g>
            );
          })
        )}
      </svg>
    ),
    "kakuro": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(29,78,216,0.04)" rx={10}/>
        {/* Grid 4x4 */}
        {[
          ["B17","W","W","W"],
          ["W","B6","W","W"],
          ["B","W","W","B12"],
          ["W","W","B","W"],
        ].map((row,r)=>row.map((cell,c)=>{
          const x=c*22+4, y=r*22+4;
          const isBlack=cell.startsWith("B");
          const clue=isBlack&&cell.length>1?cell.slice(1):"";
          return(
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={21} height={21}
                fill={isBlack?"#374151":"white"} stroke="#E2E8F0" strokeWidth={0.5}/>
              {isBlack&&clue&&(
                <>
                  <line x1={x} y1={y} x2={x+21} y2={y+21} stroke="#555" strokeWidth={0.5}/>
                  <text x={x+15} y={y+19} style={{fontSize:7,fill:"white",fontWeight:700}}>{clue}</text>
                </>
              )}
              {!isBlack&&r+c>0&&(
                <text x={x+10.5} y={y+14} textAnchor="middle"
                  style={{fontSize:9,fontWeight:700,fill:"#4F6EF7"}}>
                  {[[4,3,2],[2,1],[5,3],[4]][r]?.[c-1]||""}
                </text>
              )}
            </g>
          );
        }))}
      </svg>
    ),
    "gravity-sort": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(194,65,12,0.04)" rx={10}/>
        {/* Columns with mixed blocks */}
        {[
          ["#EF4444","#3B82F6","#22C55E","#F59E0B"],
          ["#3B82F6","#22C55E","#EF4444","#3B82F6"],
          ["#22C55E","#F59E0B","#3B82F6","#EF4444"],
          ["#F59E0B","#EF4444","#F59E0B","#22C55E"],
        ].map((col,ci)=>col.map((color,ri)=>(
          <rect key={`${ci}-${ri}`} x={ci*21+6} y={ri*18+10} width={18} height={15}
            rx={4} fill={color} opacity={0.85}/>
        )))}
        {/* Arrow down */}
        <text x={45} y={86} textAnchor="middle" style={{fontSize:12,fill:"#94A3B8"}}>↓</text>
      </svg>
    ),
    "hex-merge": (
      <svg width={90} height={90} viewBox="-45 -45 90 90">
        <rect x={-45} y={-45} width={90} height={90} fill="rgba(13,148,136,0.04)" rx={10}/>
        {[
          [-1,-1,2,"#DBEAFE"],[0,-1,4,"#BBF7D0"],[1,-2,2,"#DBEAFE"],
          [-1,0,4,"#BBF7D0"],[0,0,8,"#FDE68A"],[1,-1,4,"#BBF7D0"],
          [-1,1,2,"#DBEAFE"],[0,1,4,"#BBF7D0"],[1,0,2,"#DBEAFE"],
        ].map(([q,r,val,color],i)=>{
          const x=16*(1.5*(q as number));
          const y=16*(Math.sqrt(3)/2*(q as number)+Math.sqrt(3)*(r as number));
          const pts=Array.from({length:6},(_,k)=>{
            const a=Math.PI/180*(60*k-30);
            return`${x+14*Math.cos(a)},${y+14*Math.sin(a)}`;
          }).join(" ");
          return(
            <g key={i}>
              <polygon points={pts} fill={color as string} stroke="rgba(0,0,0,0.1)" strokeWidth={0.5}/>
              <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
                style={{fontSize:9,fontWeight:700,fill:"#374151"}}>{val}</text>
            </g>
          );
        })}
      </svg>
    ),
    "logic-path": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(8,145,178,0.04)" rx={10}/>
        {/* 3x3 pipe grid */}
        {[
          [[false,true,false,false],[true,false,false,true],[false,false,true,false]],
          [[false,false,true,false],[true,true,true,false],[true,false,false,true]],
          [[true,true,false,false],[false,false,false,true],[true,false,false,false]],
        ].map((row,r)=>row.map((pipe,c)=>{
          const cx=c*28+18,cy=r*28+18,w=5,color="#4F6EF7";
          return(
            <g key={`${r}-${c}`}>
              <rect x={cx-14} y={cy-14} width={26} height={26}
                fill="rgba(79,110,247,0.06)" rx={5}/>
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
        {/* 4x4 grid */}
        {[
          [0,1,0,1],[1,0,1,0],[0,1,0,0],[1,0,1,1]
        ].map((row,r)=>row.map((hasLight,c)=>(
          <g key={`${r}-${c}`}>
            <rect x={c*20+5} y={r*20+5} width={19} height={19}
              fill={hasLight?"#FFFBEB":"rgba(55,65,81,0.08)"} rx={3}/>
            {hasLight&&<text x={c*20+14.5} y={r*20+19} textAnchor="middle"
              style={{fontSize:13}}>●</text>}
          </g>
        )))}
        {/* Black cells */}
        {[[0,0],[1,1],[2,3],[3,2]].map(([r,c],i)=>(
          <g key={i}>
            <rect x={c*20+5} y={r*20+5} width={19} height={19} fill="#374151" rx={3}/>
            {i===0&&<text x={c*20+14.5} y={r*20+17} textAnchor="middle"
              style={{fontSize:8,fontWeight:700,fill:"white"}}>2</text>}
          </g>
        ))}
      </svg>
    ),
    "patches": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(245,158,11,0.04)" rx={10}/>
        {/* 5x5 polyomino tiling */}
        {[
          [0,0,1,1,1],[0,0,2,1,3],[0,2,2,3,3],
          [4,2,2,3,3],[4,4,2,4,3]
        ].map((row,r)=>row.map((pid,c)=>{
          const colors=["#EF4444","#3B82F6","#22C55E","#F59E0B","#A855F7"];
          return<rect key={`${r}-${c}`} x={c*16+8} y={r*16+8} width={15} height={15}
            fill={colors[pid]} opacity={0.8} rx={3}/>;
        }))}
      </svg>
    ),
    "word-sling": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(4,120,87,0.04)" rx={10}/>
        {/* Letter tiles */}
        {"MINDSTATE".split("").map((l,i)=>(
          <g key={i}>
            <rect x={i%5*16+8} y={Math.floor(i/5)*18+8} width={14} height={16}
              rx={3} fill="white" stroke="#E2E8F0" strokeWidth={1}/>
            <text x={i%5*16+15} y={Math.floor(i/5)*18+19} textAnchor="middle"
              dominantBaseline="middle"
              style={{fontSize:8,fontWeight:700,fill:"#1C1917"}}>{l}</text>
          </g>
        ))}
        {/* Found word */}
        <rect x={8} y={58} width={42} height={14} rx={7}
          fill="#F0FDF4" stroke="#86EFAC" strokeWidth={1}/>
        <text x={29} y={67} textAnchor="middle"
          style={{fontSize:8,fontWeight:700,fill:"#15803D"}}>MIND</text>
        <rect x={54} y={58} width={30} height={14} rx={7}
          fill="#F0FDF4" stroke="#86EFAC" strokeWidth={1}/>
        <text x={69} y={67} textAnchor="middle"
          style={{fontSize:8,fontWeight:700,fill:"#15803D"}}>STATE</text>
        <text x={45} y={82} textAnchor="middle"
          style={{fontSize:8,fill:"#94A3B8"}}>2 words found</text>
      </svg>
    ),
    "hearts": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(225,29,72,0.04)" rx={10}/>
        {/* Hand of cards */}
        {[["A♠","#1C1917"],["K♥","#DC2626"],["Q♦","#DC2626"],["J♣","#1C1917"],["10♠","#1C1917"]].map(([card,color],i)=>(
          <g key={i} transform={`rotate(${(i-2)*8}, 45, 120)`}>
            <rect x={18+i*2} y={20} width={22} height={34} rx={4}
              fill="white" stroke="#E2E8F0" strokeWidth={1.5}/>
            <text x={29+i*2} y={38} textAnchor="middle"
              style={{fontSize:8,fontWeight:700,fill:color as string}}>{card}</text>
          </g>
        ))}
        <text x={45} y={80} textAnchor="middle"
          style={{fontSize:9,fontWeight:600,fill:"#94A3B8"}}>Avoid ♥ Q♠</text>
      </svg>
    ),
    "solitaire": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(21,128,61,0.06)" rx={10}/>
        {/* Foundation piles */}
        {["♥","♦","♣","♠"].map((suit,i)=>(
          <g key={i}>
            <rect x={i*20+6} y={5} width={17} height={23} rx={3}
              fill="white" stroke="#E2E8F0" strokeWidth={1}/>
            <text x={i*20+14.5} y={19} textAnchor="middle"
              style={{fontSize:10,fill:i<2?"#DC2626":"#1C1917"}}>{suit}</text>
          </g>
        ))}
        {/* Tableau columns */}
        {[["K♠","Q♥"],["J♣","10♦"],["9♠","8♥"],["7♣"]].map((col,ci)=>
          col.map((card,ri)=>(
            <g key={`${ci}-${ri}`}>
              <rect x={ci*22+3} y={ri*12+35} width={20} height={18} rx={2}
                fill="white" stroke="#E2E8F0" strokeWidth={1}
                style={{zIndex:ri}}/>
              <text x={ci*22+13} y={ri*12+47} textAnchor="middle"
                style={{fontSize:6,fontWeight:700,
                  fill:card.includes("♥")||card.includes("♦")?"#DC2626":"#1C1917"}}>
                {card}
              </text>
            </g>
          ))
        )}
      </svg>
    ),
    "minesweeper": (
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect width={90} height={90} fill="rgba(153,27,27,0.04)" rx={10}/>
        {[
          [null,"1","1",null],[null,"1","✕",null],
          ["1","2","2","1"],["✕","1",null,null],
        ].map((row,r)=>row.map((cell,c)=>(
          <g key={`${r}-${c}`}>
            <rect x={c*21+5} y={r*21+5} width={19} height={19}
              fill={cell===null?"#D1D5DB":cell==="✕"?"#FEE2E2":"#F3F4F6"} rx={3}/>
            {cell&&cell!=="✕"&&<text x={c*21+14.5} y={r*21+18} textAnchor="middle"
              style={{fontSize:10,fontWeight:700,
                fill:cell==="1"?"#2563EB":cell==="2"?"#16A34A":"#DC2626"}}>{cell}</text>}
            {cell==="✕"&&<text x={c*21+14.5} y={r*21+18} textAnchor="middle"
              style={{fontSize:12}}>✕</text>}
          </g>
        )))}
      </svg>
    ),
  };

  const snap = snaps[slug];
  if (!snap) return <GameIcon slug={slug} size={52}/>;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
      {snap}
    </div>
  );
}
