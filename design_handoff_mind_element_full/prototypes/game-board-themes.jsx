// game-board-themes.jsx
// Tango / Memory / Queens game boards rendered in each of the 3 screen-view themes:
//   - Light (warm minimal)
//   - Dark Cosmic (deep + glow)
//   - Paper (newsprint editorial)

const BF = window.GR_FONTS;

// ════════════════════════════════════════════════════════════════════════════
// Shared chrome — a thin top bar + bottom toolbar, themed per screen view
// ════════════════════════════════════════════════════════════════════════════

function TopBarLight({ title, stage, sub }) {
  return (
    <div style={{ padding: "0 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, background: "rgba(28,25,23,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: BF.F_DISPLAY, fontSize: 20, fontWeight: 600, letterSpacing: -0.3, color: "#1C1917" }}>{title}</div>
          <div style={{ fontSize: 10, color: "#78706A", fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 1 }}>{sub || `Stage ${stage}`}</div>
        </div>
      </div>
      <div style={{
        padding: "6px 11px", borderRadius: 99, background: "#fff",
        border: "1px solid rgba(28,25,23,0.1)", fontSize: 11, fontWeight: 700,
        fontFamily: BF.F_MONO, color: "#1C1917", display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: "#9C6BE8" }}/>
        847 XP
      </div>
    </div>
  );
}

function ToolBarLight() {
  return (
    <div style={{ padding: "0 20px", display: "flex", gap: 8, justifyContent: "center" }}>
      {[["Undo","↶"],["Hint","✦"],["Check","✓"]].map(([t,g],i)=>(
        <button key={i} style={{
          padding: "10px 18px", borderRadius: 99, background: i===1?"rgba(156,107,232,0.08)":"#fff",
          border: `1px solid ${i===1?"rgba(156,107,232,0.3)":"rgba(28,25,23,0.1)"}`,
          color: i===1?"#9C6BE8":"#3C3633", fontWeight: 600, fontSize: 12, fontFamily: BF.F_SANS,
          display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
        }}>
          <span style={{ fontSize: 13 }}>{g}</span>{t}
        </button>
      ))}
    </div>
  );
}

function TopBarDark({ title, stage, sub }) {
  return (
    <div style={{ padding: "0 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: BF.F_DISPLAY, fontSize: 20, fontWeight: 600, letterSpacing: -0.3, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 1 }}>{sub || `Stage ${stage}`}</div>
        </div>
      </div>
      <div style={{
        padding: "6px 11px", borderRadius: 99, background: "rgba(168,85,247,0.18)",
        border: "1px solid rgba(168,85,247,0.45)", fontSize: 11, fontWeight: 700,
        fontFamily: BF.F_MONO, color: "#E9D5FF", display: "flex", alignItems: "center", gap: 6,
        boxShadow: "0 0 16px rgba(168,85,247,0.3)",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: "#E9D5FF", boxShadow: "0 0 6px #E9D5FF" }}/>
        847 XP
      </div>
    </div>
  );
}

function ToolBarDark() {
  return (
    <div style={{ padding: "0 20px", display: "flex", gap: 8, justifyContent: "center" }}>
      {[["Undo","↶"],["Hint","✦"],["Check","✓"]].map(([t,g],i)=>(
        <button key={i} style={{
          padding: "10px 18px", borderRadius: 99,
          background: i===1?"rgba(168,85,247,0.22)":"rgba(255,255,255,0.06)",
          border: `1px solid ${i===1?"rgba(168,85,247,0.5)":"rgba(255,255,255,0.14)"}`,
          color: i===1?"#E9D5FF":"rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 12, fontFamily: BF.F_SANS,
          display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
          backdropFilter: "blur(8px)",
        }}>
          <span style={{ fontSize: 13 }}>{g}</span>{t}
        </button>
      ))}
    </div>
  );
}

function TopBarPaper({ title, stage, sub }) {
  return (
    <div style={{ padding: "0 20px 14px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontFamily: BF.F_TYPER, fontSize: 9, color: "#5C4F38", letterSpacing: 1.4, fontWeight: 700 }}>VOL.&nbsp;XII&nbsp;·&nbsp;DAILY</div>
        <div style={{ fontFamily: BF.F_TYPER, fontSize: 9, color: "#5C4F38", letterSpacing: 1, fontWeight: 700 }}>STAGE&nbsp;·&nbsp;{String(stage).padStart(2,"0")}</div>
      </div>
      <div style={{ borderTop: "3px double #1A1714", borderBottom: "0.5px solid #1A1714", padding: "6px 0", marginTop: 4 }}>
        <div style={{ fontFamily: BF.F_NEWS, fontSize: 26, fontWeight: 700, color: "#1A1714", letterSpacing: -0.3, lineHeight: 1, textAlign: "center" }}>
          {title}
        </div>
        {sub && <div style={{ fontFamily: BF.F_NEWS, fontStyle: "italic", fontSize: 11, color: "#4A4030", textAlign: "center", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ToolBarPaper() {
  return (
    <div style={{ padding: "0 20px", display: "flex", gap: 8, justifyContent: "center" }}>
      {["UNDO","HINT","CHECK"].map((t,i)=>(
        <button key={i} style={{
          padding: "8px 16px", background: "transparent",
          border: "1px solid #1A1714", borderRadius: 0,
          fontFamily: BF.F_TYPER, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
          color: "#1A1714", cursor: "pointer", boxShadow: i===1?"2px 2px 0 #1A1714":"none",
        }}>{t}</button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TANGO — 6×6 sun/moon balance
// ════════════════════════════════════════════════════════════════════════════

const TANGO = [
  ["S",null,null,"M",null,null],
  [null,"M",null,null,"S",null],
  [null,null,"S",null,null,"M"],
  ["M",null,null,"S",null,null],
  [null,"S",null,null,"M",null],
  [null,null,"M",null,null,"S"],
];
const TANGO_CONSTRAINTS = [
  {r:0,c:1,t:"r",k:"same"},{r:1,c:2,t:"r",k:"diff"},
  {r:2,c:0,t:"b",k:"same"},{r:4,c:3,t:"b",k:"diff"},
];

function TangoCell({ size, theme, given, val, isHint, isError, hasRight, rightK, hasBottom, bottomK, gap }) {
  const T = TANGO_THEMES[theme];
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: T.radius,
        background: isError ? T.errorBg : given ? T.givenBg : T.cellBg,
        border: T.borderWidth ? `${T.borderWidth}px solid ${isError ? T.errorBorder : given ? T.givenBorder : T.cellBorder}` : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: isHint ? `0 0 0 2px ${T.accent}, 0 4px 14px ${T.accent}55` : T.cellShadow,
        transition: "all 0.2s",
      }}>
        {val === "S" && T.sun(size)}
        {val === "M" && T.moon(size)}
        {!val && !isHint && <div style={{ width: 3, height: 3, borderRadius: 99, background: T.dot, opacity: 0.5 }}/>}
        {isHint && <div style={{ width: 7, height: 7, borderRadius: 99, background: T.accent, boxShadow: `0 0 8px ${T.accent}` }}/>}
      </div>
      {hasRight && (
        <div style={{
          position: "absolute", right: -(gap/2)-7, top: "50%", transform: "translateY(-50%)",
          zIndex: 5, width: 14, height: 14, borderRadius: 99,
          background: T.chipBg, border: `1.5px solid ${rightK==="same"?T.accent:T.ruby}`,
          color: rightK==="same"?T.accent:T.ruby,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, fontWeight: 800, fontFamily: BF.F_SANS,
        }}>{rightK==="same"?"=":"×"}</div>
      )}
      {hasBottom && (
        <div style={{
          position: "absolute", bottom: -(gap/2)-7, left: "50%", transform: "translateX(-50%)",
          zIndex: 5, width: 14, height: 14, borderRadius: 99,
          background: T.chipBg, border: `1.5px solid ${bottomK==="same"?T.accent:T.ruby}`,
          color: bottomK==="same"?T.accent:T.ruby,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, fontWeight: 800, fontFamily: BF.F_SANS,
        }}>{bottomK==="same"?"=":"×"}</div>
      )}
    </div>
  );
}

const TANGO_THEMES = {
  light: {
    gap: 5, radius: 10, borderWidth: 1, accent: "#9C6BE8", ruby: "#DC2626",
    cellBg: "#fff", cellBorder: "rgba(28,25,23,0.08)",
    givenBg: "rgba(28,25,23,0.04)", givenBorder: "rgba(28,25,23,0.1)",
    errorBg: "#FEF2F2", errorBorder: "#FCA5A5",
    cellShadow: "0 1px 0 rgba(28,25,23,0.03)", dot: "#1C1917", chipBg: "#fff",
    sun: (s) => (
      <svg width={s*0.62} height={s*0.62} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="6" fill="#F5B342"/>
        {[0,45,90,135,180,225,270,315].map(a=>(
          <line key={a} x1="12" y1="12" x2={12+Math.cos(a*Math.PI/180)*10} y2={12+Math.sin(a*Math.PI/180)*10}
            stroke="#F5B342" strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${0})`}/>
        ))}
      </svg>
    ),
    moon: (s) => (
      <svg width={s*0.62} height={s*0.62} viewBox="0 0 24 24">
        <path d="M16 4a9 9 0 1 0 4 12 7 7 0 0 1-4-12z" fill="#5B6FAE"/>
      </svg>
    ),
  },
  dark: {
    gap: 5, radius: 10, borderWidth: 1, accent: "#A855F7", ruby: "#F472B6",
    cellBg: "rgba(255,255,255,0.04)", cellBorder: "rgba(255,255,255,0.08)",
    givenBg: "rgba(255,255,255,0.09)", givenBorder: "rgba(255,255,255,0.18)",
    errorBg: "rgba(244,114,182,0.15)", errorBorder: "rgba(244,114,182,0.5)",
    cellShadow: "inset 0 1px 0 rgba(255,255,255,0.04)", dot: "#fff", chipBg: "#0E0C18",
    sun: (s) => (
      <div style={{
        width: s*0.5, height: s*0.5, borderRadius: 99,
        background: "radial-gradient(circle at 35% 35%, #FFE08A, #F59E0B)",
        boxShadow: "0 0 14px rgba(245,158,11,0.85), 0 0 28px rgba(245,158,11,0.4)",
      }}/>
    ),
    moon: (s) => (
      <div style={{
        width: s*0.5, height: s*0.5, borderRadius: 99,
        background: "radial-gradient(circle at 60% 40%, #E0CFFC 0%, #A855F7 70%)",
        boxShadow: `0 0 14px rgba(168,85,247,0.85), inset -${s*0.08}px 0 0 rgba(255,255,255,0.8)`,
      }}/>
    ),
  },
  paper: {
    gap: 0, radius: 0, borderWidth: 0.6, accent: "#1A1714", ruby: "#8C2A1F",
    cellBg: "#FFFCF1", cellBorder: "#1A1714",
    givenBg: "#E8DCBA", givenBorder: "#1A1714",
    errorBg: "rgba(140,42,31,0.12)", errorBorder: "#8C2A1F",
    cellShadow: "none", dot: "#1A1714", chipBg: "#FFFCF1",
    sun: (s) => <span style={{ fontFamily: BF.F_NEWS, fontSize: s*0.6, fontWeight: 700, color: "#A6651F", lineHeight: 0.9 }}>☀</span>,
    moon: (s) => <span style={{ fontFamily: BF.F_NEWS, fontSize: s*0.6, fontWeight: 700, color: "#1A1714", lineHeight: 0.9 }}>☾</span>,
  },
};

function TangoBoard({ theme, size }) {
  const T = TANGO_THEMES[theme];
  const cMap = new Map();
  TANGO_CONSTRAINTS.forEach(c => cMap.set(`${c.r}-${c.c}-${c.t}`, c.k));
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(6, ${size}px)`, gap: T.gap,
      padding: theme === "paper" ? 0 : 0,
      border: theme === "paper" ? "1px solid #1A1714" : "none",
      background: theme === "paper" ? "#FFFCF1" : "transparent",
    }}>
      {TANGO.map((row, r) => row.map((v, c) => (
        <TangoCell key={`${r}-${c}`}
          size={size} theme={theme}
          given={v !== null} val={v}
          isHint={r === 2 && c === 4}
          isError={r === 0 && c === 3}
          hasRight={cMap.has(`${r}-${c}-r`)} rightK={cMap.get(`${r}-${c}-r`)}
          hasBottom={cMap.has(`${r}-${c}-b`)} bottomK={cMap.get(`${r}-${c}-b`)}
          gap={T.gap}/>
      )))}
    </div>
  );
}

function TangoScreen({ theme }) {
  const isPaper = theme === "paper";
  const isDark = theme === "dark";
  const TopBar = isPaper ? TopBarPaper : isDark ? TopBarDark : TopBarLight;
  const ToolBar = isPaper ? ToolBarPaper : isDark ? ToolBarDark : ToolBarLight;
  const accent = isPaper ? "#1A1714" : isDark ? "#A855F7" : "#9C6BE8";
  return (
    <>
      <TopBar title="Tango" stage={23} sub={isPaper?"Balance the suns & moons":"BALANCE"}/>
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{
          height: 4, borderRadius: 99,
          background: isPaper ? "rgba(26,23,20,0.18)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(28,25,23,0.08)",
          marginBottom: 6, position: "relative",
        }}>
          <div style={{
            width: "62%", height: "100%", borderRadius: 99,
            background: isPaper ? "#1A1714" : `linear-gradient(90deg, ${accent}, #4F6EF7)`,
          }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, letterSpacing: 0.4 }}>
          <span style={{ color: isPaper?"#5C4F38":isDark?"rgba(255,255,255,0.55)":"#78706A" }}>1:23</span>
          <span style={{ color: isPaper?"#5C4F38":isDark?"rgba(255,255,255,0.55)":"#78706A" }}>HINTS · 2</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
        <div style={{ padding: isPaper ? 6 : 8, background: isPaper ? "transparent" : "transparent", borderRadius: 16 }}>
          <TangoBoard theme={theme} size={isPaper ? 46 : 44}/>
        </div>
      </div>
      <div style={{ paddingBottom: 22 }}>
        <ToolBar/>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MEMORY — 4×4 pair grid
// ════════════════════════════════════════════════════════════════════════════

// 8 distinct icons paired across a 4×4 grid. State reflects a real mid-game.
// `id` references the MEM_ICONS library (star/heart/diamond/crescent/flower/sun/bolt/drop).
const MEM_STATE = [
  {id:"star",     s:"matched"},{id:"crescent", s:"flipped"},{id:"flower", s:"none"},{id:"diamond", s:"none"},
  {id:"heart",    s:"matched"},{id:"sun",      s:"none"},   {id:"bolt",   s:"flipped"},{id:"drop",    s:"none"},
  {id:"heart",    s:"matched"},{id:"drop",     s:"none"},   {id:"star",   s:"matched"},{id:"flower",  s:"none"},
  {id:"bolt",     s:"none"},   {id:"diamond",  s:"none"},   {id:"crescent",s:"none"},  {id:"sun",     s:"none"},
];

function MemoryScreen({ theme }) {
  const isPaper = theme === "paper";
  const isDark = theme === "dark";
  const TopBar = isPaper ? TopBarPaper : isDark ? TopBarDark : TopBarLight;
  const ToolBar = isPaper ? ToolBarPaper : isDark ? ToolBarDark : ToolBarLight;

  const cardBackBg = isPaper ? "#1A1714"
    : isDark ? "linear-gradient(160deg,#1E1B4B,#312E81)"
    : "linear-gradient(160deg,#9C6BE8,#4F6EF7)";
  const cardFaceBg = isPaper ? "#FFFCF1" : isDark ? "rgba(255,255,255,0.06)" : "#fff";
  const matchedColor = isPaper ? "#1A1714" : isDark ? "#34D399" : "#059669";
  const matchedBg = isPaper ? "rgba(26,23,20,0.06)" : isDark ? "rgba(52,211,153,0.12)" : "rgba(5,150,105,0.08)";
  const cellBorder = isPaper ? "1px solid #1A1714" : isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(28,25,23,0.08)";
  const ICONS = window.MEM_ICONS || [];
  const iconBy = (id) => ICONS.find(i => i.id === id);

  return (
    <>
      <TopBar title="Memory" stage={12} sub={isPaper?"Find the matched pairs":"PAIRS"}/>

      <div style={{ padding: "0 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          padding: "5px 11px", borderRadius: 99,
          background: isPaper?"transparent":isDark?"rgba(168,85,247,0.18)":"rgba(156,107,232,0.1)",
          border: isPaper?"1px solid #1A1714":"none",
          fontFamily: isPaper?BF.F_TYPER:BF.F_MONO, fontSize: 10, fontWeight: 700,
          color: isPaper?"#1A1714":isDark?"#E9D5FF":"#9C6BE8", letterSpacing: 1,
        }}>×2 CHAIN</div>
        <div style={{ fontSize: 11, color: isPaper?"#4A4030":isDark?"rgba(255,255,255,0.6)":"#78706A" }}>
          <span style={{ fontFamily: BF.F_DISPLAY, fontSize: 18, fontWeight: 700, color: isPaper?"#1A1714":isDark?"#fff":"#1C1917" }}>3</span> / 8 pairs
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: isPaper?6:9, width: "100%" }}>
          {MEM_STATE.map((card, i) => {
            const isMatched = card.s === "matched";
            const isFlipped = card.s === "flipped";
            const isFace = isMatched || isFlipped;
            const ic = iconBy(card.id);
            const cardBg = isMatched ? matchedBg : isFace ? cardFaceBg : cardBackBg;
            // a pale tint of the icon color on the card face (light/dark only)
            const faceTint = ic ? ic.color : "#999";
            const lightFaceBg = isFace && !isMatched && !isPaper && !isDark
              ? `linear-gradient(180deg, ${faceTint}10, #fff)` : cardBg;
            const darkFaceBg = isFace && !isMatched && isDark
              ? `linear-gradient(180deg, ${faceTint}28, rgba(255,255,255,0.04))` : cardBg;
            const finalBg = isPaper ? cardBg : isDark ? darkFaceBg : lightFaceBg;
            const iconRender = ic && (isPaper ? ic.paper : isDark ? ic.dark : ic.light);
            return (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: isPaper?0:12,
                background: finalBg,
                border: isMatched
                  ? `1.5px solid ${matchedColor}`
                  : isFace
                    ? (isDark?`1px solid ${faceTint}55`:isPaper?"1px solid #1A1714":`1px solid ${faceTint}50`)
                    : cellBorder,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                boxShadow: isDark && !isFace ? "inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
              }}>
                {isFace && iconRender && iconRender(isPaper ? 30 : 32)}
                {!isFace && (
                  isPaper
                    ? <div style={{ fontFamily: BF.F_NEWS, fontStyle: "italic", fontSize: 22, fontWeight: 700, color: "#FFFCF1" }}>M</div>
                    : isDark
                      ? <>
                          {[[25,35],[65,30],[40,70],[80,75]].map(([x,y],j)=>(
                            <div key={j} style={{
                              position: "absolute", left: `${x}%`, top: `${y}%`,
                              width: 2, height: 2, borderRadius: 99, background: "#fff", opacity: 0.6,
                            }}/>
                          ))}
                        </>
                      : <div style={{
                          width: 14, height: 14, borderRadius: 99,
                          background: "rgba(255,255,255,0.3)", border: "1.5px solid rgba(255,255,255,0.6)",
                        }}/>
                )}
                {isMatched && (
                  <div style={{
                    position: "absolute", top: 4, right: 4,
                    width: 12, height: 12, borderRadius: 99,
                    background: matchedColor, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={isPaper?"#FFFCF1":isDark?"#0E0C18":"#fff"} strokeWidth="4">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ paddingBottom: 22 }}>
        <ToolBar/>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// QUEENS — 6×6, one marker per row/col/region, none adjacent
// (Original metaphors per theme: lanterns / stars / printer's ornaments)
// ════════════════════════════════════════════════════════════════════════════

const Q_SIZE = 6;
const Q_REGIONS = [
  [0,0,1,1,2,2],
  [0,3,3,1,2,2],
  [0,3,3,1,1,4],
  [5,5,3,4,4,4],
  [5,5,3,4,4,4],
  [5,5,5,3,4,4],
];
const Q_STATE = [
  [2,0,0,0,0,0],
  [0,0,0,2,0,0],
  [0,0,2,0,0,1],
  [0,0,0,0,0,2],
  [0,2,0,0,1,0],
  [0,0,0,0,0,0],
];

function QueensBoard({ theme, size }) {
  const palette = QUEENS_PALETTES[theme];
  const isPaper = theme === "paper";
  return (
    <div style={{
      borderRadius: isPaper ? 0 : 14,
      overflow: "hidden",
      border: palette.outerBorder,
      boxShadow: palette.outerShadow,
      background: palette.outerBg,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Q_SIZE}, ${size}px)` }}>
        {Q_REGIONS.map((row, r) => row.map((rid, c) => {
          const val = Q_STATE[r][c];
          const rightDiff = c < Q_SIZE-1 && Q_REGIONS[r][c+1] !== rid;
          const bottomDiff = r < Q_SIZE-1 && Q_REGIONS[r+1][c] !== rid;
          const pal = palette.regions[rid];
          const isFirstInRegion = !((c>0 && Q_REGIONS[r][c-1]===rid) || (r>0 && Q_REGIONS[r-1][c]===rid));
          const cellBg = isPaper
            ? PAPER_HATCH[pal.hatch] || "#FFFCF1"
            : pal.bg;
          return (
            <div key={`${r}-${c}`} style={{
              width: size, height: size, background: cellBg,
              borderRight: rightDiff ? palette.boundary : palette.innerLine,
              borderBottom: bottomDiff ? palette.boundary : palette.innerLine,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              {isFirstInRegion && (
                <div style={{
                  position: "absolute", top: 2, left: 3,
                  fontFamily: BF.F_MONO, fontSize: 8.5, fontWeight: 800,
                  letterSpacing: 0.3,
                  color: theme==="dark" ? pal.deep : isPaper ? "#1A1714" : pal.deep,
                  opacity: theme==="dark" ? 0.95 : isPaper ? 0.85 : 0.7,
                  pointerEvents: "none",
                }}>{pal.letter}</div>
              )}
              {val === 1 && palette.cross()}
              {val === 2 && palette.marker(rid, pal)}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// A crown SVG that works small. Used as the marker in every theme.
function CrownGlyph({ size = 18, color = "#1A1714", stroke = null, glow = null }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={glow ? { filter: `drop-shadow(0 0 6px ${glow})` } : undefined}>
      <path
        d="M3.2 9.2l3 8.2h11.6l3-8.2-4.6 3.4-3.2-6.4-2 4-2-4-3.2 6.4z"
        fill={color}
        stroke={stroke || color}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <rect x="6" y="18" width="12" height="2.4" rx="0.4" fill={color} stroke={stroke || color} strokeWidth="0.4"/>
      <circle cx="4"  cy="7.2" r="1.2" fill={color}/>
      <circle cx="20" cy="7.2" r="1.2" fill={color}/>
      <circle cx="12" cy="5.4" r="1.4" fill={color}/>
    </svg>
  );
}

const QUEENS_PALETTES = {
  light: {
    outerBorder: "1.5px solid #1C1917",
    outerShadow: "0 14px 30px rgba(28,25,23,0.12)",
    outerBg: "#fff",
    boundary: "3px solid #1C1917",
    innerLine: "0.5px solid rgba(28,25,23,0.18)",
    // 6 highly-distinguishable regions: red / amber / green / cyan / violet / pink
    regions: [
      { bg:"#FCA5A5", deep:"#9F1239", letter:"A" }, // red
      { bg:"#FCD34D", deep:"#854D0E", letter:"B" }, // amber
      { bg:"#86EFAC", deep:"#15803D", letter:"C" }, // green
      { bg:"#7DD3FC", deep:"#075985", letter:"D" }, // cyan
      { bg:"#C4B5FD", deep:"#5B21B6", letter:"E" }, // violet
      { bg:"#F9A8D4", deep:"#9D174D", letter:"F" }, // pink
    ],
    cross: () => <span style={{ color: "rgba(28,25,23,0.4)", fontSize: 14, lineHeight: 1 }}>×</span>,
    marker: (rid, pal) => <CrownGlyph size={22} color={pal.deep}/>,
  },
  dark: {
    outerBorder: "1px solid rgba(255,255,255,0.1)",
    outerShadow: "0 14px 36px rgba(0,0,0,0.6)",
    outerBg: "rgba(255,255,255,0.02)",
    boundary: "2.5px solid rgba(255,255,255,0.85)",
    innerLine: "0.5px solid rgba(255,255,255,0.07)",
    // Saturated neon-on-dark — each region clearly its own color.
    regions: [
      { bg:"rgba(248,113,113,0.22)", deep:"#F87171", letter:"A" }, // red
      { bg:"rgba(245,179,66,0.22)",  deep:"#F5B342", letter:"B" }, // amber
      { bg:"rgba(52,211,153,0.22)",  deep:"#34D399", letter:"C" }, // green
      { bg:"rgba(56,189,248,0.22)",  deep:"#38BDF8", letter:"D" }, // cyan
      { bg:"rgba(168,85,247,0.22)",  deep:"#C084FC", letter:"E" }, // violet
      { bg:"rgba(244,114,182,0.22)", deep:"#F472B6", letter:"F" }, // pink
    ],
    cross: () => <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 14, lineHeight: 1 }}>×</span>,
    marker: (rid, pal) => <CrownGlyph size={22} color={pal.deep} glow={pal.deep}/>,
  },
  paper: {
    outerBorder: "1.5px solid #1A1714",
    outerShadow: "3px 3px 0 #1A1714",
    outerBg: "#FFFCF1",
    boundary: "2.5px solid #1A1714",
    innerLine: "0.5px solid rgba(26,23,20,0.35)",
    // Paper uses HATCH PATTERNS (not color) for the 6 regions, plus a letter
    // label in the corner. Six distinct visual textures, all in ink.
    regions: [
      { bg:"#FFFCF1", deep:"#1A1714", letter:"A", hatch:"none"          },
      { bg:"#FFFCF1", deep:"#1A1714", letter:"B", hatch:"dots"          },
      { bg:"#FFFCF1", deep:"#1A1714", letter:"C", hatch:"diag"          },
      { bg:"#FFFCF1", deep:"#1A1714", letter:"D", hatch:"crosshatch"    },
      { bg:"#FFFCF1", deep:"#1A1714", letter:"E", hatch:"horiz"         },
      { bg:"#FFFCF1", deep:"#1A1714", letter:"F", hatch:"diag-reverse"  },
    ],
    cross: () => <span style={{ fontFamily: BF.F_TYPER, color: "#1A1714", fontSize: 12, opacity: 0.5 }}>×</span>,
    marker: (rid, pal) => <CrownGlyph size={20} color="#1A1714"/>,
  },
};

// Hatch backgrounds for the paper theme — gives each region its own texture.
const PAPER_HATCH = {
  none:          "#FFFCF1",
  dots:          "#FFFCF1 radial-gradient(rgba(26,23,20,0.55) 0.6px, transparent 1.1px) 0 0/5px 5px",
  diag:          "repeating-linear-gradient(45deg, rgba(26,23,20,0.55), rgba(26,23,20,0.55) 0.6px, transparent 0.6px, transparent 4px)",
  crosshatch:    "repeating-linear-gradient(45deg, rgba(26,23,20,0.55), rgba(26,23,20,0.55) 0.6px, transparent 0.6px, transparent 5px), repeating-linear-gradient(-45deg, rgba(26,23,20,0.55), rgba(26,23,20,0.55) 0.6px, transparent 0.6px, transparent 5px)",
  horiz:         "repeating-linear-gradient(0deg, rgba(26,23,20,0.45), rgba(26,23,20,0.45) 0.6px, transparent 0.6px, transparent 4px)",
  "diag-reverse":"repeating-linear-gradient(-45deg, rgba(26,23,20,0.55), rgba(26,23,20,0.55) 0.6px, transparent 0.6px, transparent 4px)",
};

function QueensScreen({ theme }) {
  const isPaper = theme === "paper";
  const isDark = theme === "dark";
  const TopBar = isPaper ? TopBarPaper : isDark ? TopBarDark : TopBarLight;
  const ToolBar = isPaper ? ToolBarPaper : isDark ? ToolBarDark : ToolBarLight;
  const accent = isPaper ? "#1A1714" : isDark ? "#A855F7" : "#9C6BE8";
  const title = "Crowns";
  const subtitle = theme === "dark" ? "ONE CROWN PER REGION"
    : theme === "paper" ? "One crown per row, column, region"
    : "ONE CROWN PER REGION";

  return (
    <>
      <TopBar title={title} stage={8} sub={subtitle}/>
      <div style={{ padding: "0 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: isPaper?"#4A4030":isDark?"rgba(255,255,255,0.6)":"#78706A" }}>Placed</span>
          <span style={{
            fontFamily: BF.F_DISPLAY, fontSize: 18, fontWeight: 700,
            color: isPaper?"#1A1714":isDark?"#fff":"#1C1917",
          }}>4 / 6</span>
        </div>
        <div style={{
          fontFamily: BF.F_MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
          color: isPaper?"#4A4030":isDark?"rgba(255,255,255,0.6)":"#78706A",
        }}>1:47</div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
        <QueensBoard theme={theme} size={isPaper?48:46}/>
      </div>
      <div style={{ paddingBottom: 22 }}>
        <ToolBar/>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Export
// ════════════════════════════════════════════════════════════════════════════

window.GameBoards = {
  TangoLight:    () => <TangoScreen theme="light"/>,
  TangoDark:     () => <TangoScreen theme="dark"/>,
  TangoPaper:    () => <TangoScreen theme="paper"/>,
  MemoryLight:   () => <MemoryScreen theme="light"/>,
  MemoryDark:    () => <MemoryScreen theme="dark"/>,
  MemoryPaper:   () => <MemoryScreen theme="paper"/>,
  QueensLight:   () => <QueensScreen theme="light"/>,
  QueensDark:    () => <QueensScreen theme="dark"/>,
  QueensPaper:   () => <QueensScreen theme="paper"/>,
};
