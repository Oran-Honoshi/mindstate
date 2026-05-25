// path-difficulty.jsx
// Stage-map PATH STYLE options + difficulty progression picker.
// Path styles all show the same data (100 stages, ~ stage 24 current) so
// the user can directly compare visual approaches.

const PF = window.GR_FONTS;

const STAGE_COUNT = 100;
const CURRENT = 24;
function stageState(n) {
  if (n < CURRENT) return n % 3 === 0 ? "medaled" : "done";
  if (n === CURRENT) return "current";
  if (n <= CURRENT + 4) return "next";
  return "locked";
}

// ════════════════════════════════════════════════════════════════════════════
// Shared header for path screens
// ════════════════════════════════════════════════════════════════════════════

function MapHeader({ theme, title, sub }) {
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  if (isPaper) {
    return (
      <div style={{ padding: "0 22px 12px" }}>
        <div style={{ fontFamily: PF.F_TYPER, fontSize: 9, color: "#5C4F38", letterSpacing: 1.5, fontWeight: 700, textAlign: "center" }}>
          A MAP OF THE PROGRESS
        </div>
        <div style={{ borderTop: "3px double #1A1714", borderBottom: "0.5px solid #1A1714", padding: "6px 0", marginTop: 6 }}>
          <div style={{ fontFamily: PF.F_NEWS, fontSize: 24, fontWeight: 700, color: "#1A1714", letterSpacing: -0.2, textAlign: "center" }}>
            {title}
          </div>
          <div style={{ fontFamily: PF.F_NEWS, fontStyle: "italic", fontSize: 11, color: "#4A4030", textAlign: "center", marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: "0 22px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 10,
          background: isDark?"rgba(255,255,255,0.08)":"rgba(28,25,23,0.06)",
          border: isDark?"1px solid rgba(255,255,255,0.12)":"none",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isDark?"#fff":"#1C1917"} strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: PF.F_DISPLAY, fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: isDark?"#fff":"#1C1917" }}>{title}</div>
          <div style={{ fontSize: 10, color: isDark?"rgba(255,255,255,0.55)":"#78706A", fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 1 }}>{sub}</div>
        </div>
        <div style={{
          padding: "5px 10px", borderRadius: 99,
          background: isDark?"rgba(168,85,247,0.18)":"rgba(156,107,232,0.12)",
          border: isDark?"1px solid rgba(168,85,247,0.45)":"1px solid rgba(156,107,232,0.3)",
          color: isDark?"#E9D5FF":"#9C6BE8",
          fontFamily: PF.F_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
          boxShadow: isDark?"0 0 14px rgba(168,85,247,0.3)":"none",
        }}>RESUME · {CURRENT}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// A · Squares grid (current pattern, refined)
// ════════════════════════════════════════════════════════════════════════════

function PathSquares({ theme }) {
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const cell = (s, n) => {
    const palettes = {
      light: {
        done: { bg: "#D1FADF", border: "#34D399", color: "#065F46" },
        medaled: { bg: "#FEF3C7", border: "#F59E0B", color: "#92400E" },
        current: { bg: "#fff", border: "#9C6BE8", color: "#9C6BE8", shadow: "0 0 0 2px rgba(156,107,232,0.4)" },
        next: { bg: "#F8F4ED", border: "rgba(28,25,23,0.15)", color: "#3C3633" },
        locked: { bg: "#F8F4ED", border: "rgba(28,25,23,0.08)", color: "rgba(28,25,23,0.35)" },
      },
      dark: {
        done: { bg: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.6)", color: "#34D399" },
        medaled: { bg: "rgba(245,179,66,0.18)", border: "rgba(245,179,66,0.7)", color: "#F5B342" },
        current: { bg: "rgba(168,85,247,0.18)", border: "#A855F7", color: "#E9D5FF", shadow: "0 0 12px rgba(168,85,247,0.6)" },
        next: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" },
        locked: { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" },
      },
      paper: {
        done: { bg: "#E8DCBA", border: "#1A1714", color: "#1A1714" },
        medaled: { bg: "#FFCFA8", border: "#1A1714", color: "#1A1714" },
        current: { bg: "#FFFCF1", border: "#1A1714", color: "#1A1714", shadow: "1.5px 1.5px 0 #1A1714" },
        next: { bg: "#FFFCF1", border: "#1A1714", color: "#1A1714" },
        locked: { bg: "transparent", border: "rgba(26,23,20,0.4)", color: "rgba(26,23,20,0.45)" },
      },
    };
    const p = palettes[theme][s];
    return p;
  };
  return (
    <>
      <MapHeader theme={theme} title="Tango" sub={`${CURRENT-1} / 100 cleared`}/>
      <div style={{ padding: "0 20px", flex: 1, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
          {Array.from({length: STAGE_COUNT}).map((_, i) => {
            const n = i + 1;
            const s = stageState(n);
            const p = cell(s, n);
            return (
              <div key={n} style={{
                aspectRatio: "1",
                background: p.bg,
                border: `1px solid ${p.border}`,
                borderRadius: isPaper ? 0 : 6,
                color: p.color,
                fontFamily: PF.F_MONO, fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                boxShadow: p.shadow || "none",
                opacity: s === "locked" && n > CURRENT + 12 ? 0.6 : 1,
              }}>
                {n}
                {s === "medaled" && (
                  <div style={{
                    position: "absolute", top: -2, right: -2, width: 6, height: 6, borderRadius: 99,
                    background: isPaper?"#1A1714":isDark?"#F5B342":"#F59E0B",
                    boxShadow: isDark?"0 0 4px #F5B342":"none",
                  }}/>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <DifficultyLegend theme={theme}/>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// B · Winding river — SVG snake path with stage pins
// ════════════════════════════════════════════════════════════════════════════

function buildWindingPath() {
  // Generate 100 points laying out a winding river through 360×640 area
  const cols = 5;
  const rowH = 50; // distance between rows
  const startY = 30;
  const leftX = 50;
  const rightX = 310;
  const pts = [];
  for (let i = 0; i < STAGE_COUNT; i++) {
    const row = Math.floor(i / cols);
    const colInRow = i % cols;
    const goingRight = row % 2 === 0;
    const cx = goingRight
      ? leftX + colInRow * ((rightX - leftX) / (cols - 1))
      : rightX - colInRow * ((rightX - leftX) / (cols - 1));
    const wiggle = Math.sin(i * 0.85) * 6;
    pts.push({ x: cx + wiggle, y: startY + row * rowH });
  }
  return pts;
}

function PathWinding({ theme }) {
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const pts = buildWindingPath();
  const totalH = pts[pts.length-1].y + 30;

  const pathD = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i-1];
    const cpx = (prev.x + p.x) / 2;
    return `Q ${cpx} ${prev.y} ${p.x} ${p.y}`;
  }).join(" ");

  const palette = {
    light: { line: "#9C6BE8", lineDim: "rgba(28,25,23,0.18)",
      done: "#34D399", current: "#9C6BE8", next: "#F8F4ED", locked: "rgba(28,25,23,0.18)",
      doneBd: "#34D399", currentBd: "#9C6BE8", nextBd: "rgba(28,25,23,0.18)", lockedBd: "rgba(28,25,23,0.12)",
      doneInk: "#fff", currentInk: "#fff", nextInk: "#1C1917", lockedInk: "rgba(28,25,23,0.35)",
      currentHalo: "rgba(156,107,232,0.35)", medal: "#F59E0B",
    },
    dark: { line: "#A855F7", lineDim: "rgba(255,255,255,0.1)",
      done: "rgba(52,211,153,0.6)", current: "#A855F7", next: "rgba(255,255,255,0.08)", locked: "rgba(255,255,255,0.04)",
      doneBd: "#34D399", currentBd: "#E9D5FF", nextBd: "rgba(255,255,255,0.2)", lockedBd: "rgba(255,255,255,0.08)",
      doneInk: "#0E0C18", currentInk: "#fff", nextInk: "#fff", lockedInk: "rgba(255,255,255,0.3)",
      currentHalo: "rgba(168,85,247,0.65)", medal: "#F5B342",
    },
    paper: { line: "#1A1714", lineDim: "rgba(26,23,20,0.3)",
      done: "#E8DCBA", current: "#FFFCF1", next: "#FFFCF1", locked: "transparent",
      doneBd: "#1A1714", currentBd: "#1A1714", nextBd: "#1A1714", lockedBd: "rgba(26,23,20,0.45)",
      doneInk: "#1A1714", currentInk: "#1A1714", nextInk: "#1A1714", lockedInk: "rgba(26,23,20,0.5)",
      currentHalo: "rgba(26,23,20,0.0)", medal: "#1A1714",
    },
  }[theme];

  return (
    <>
      <MapHeader theme={theme} title="The Winding Way" sub={`${CURRENT-1} / 100 · path style`}/>
      <div style={{ flex: 1, overflow: "auto", padding: "8px 0 12px" }}>
        <div style={{ position: "relative", width: 360, height: totalH, margin: "0 auto" }}>
          <svg width="360" height={totalH} style={{ position: "absolute", inset: 0 }}>
            <defs>
              {isDark && (
                <filter id="glow-line">
                  <feGaussianBlur stdDeviation="2.5" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              )}
            </defs>
            {/* dashed remaining path */}
            <path d={pathD} stroke={palette.lineDim} strokeWidth={isPaper?1.5:2} fill="none"
              strokeDasharray={isPaper?"2 4":"4 5"} strokeLinecap="round"/>
            {/* completed portion */}
            <path
              d={pathD}
              stroke={palette.line}
              strokeWidth={isPaper?2.5:3.5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(CURRENT-1)/STAGE_COUNT * 2400} 9999`}
              filter={isDark?"url(#glow-line)":undefined}
            />
          </svg>
          {pts.map((p, i) => {
            const n = i + 1;
            const s = stageState(n);
            const isCurrent = s === "current";
            const isDone = s === "done" || s === "medaled";
            const isNext = s === "next";
            const isLocked = s === "locked";
            const sz = isCurrent ? 36 : (isDone ? 22 : isNext ? 24 : 18);
            const bg = isDone ? palette.done : isCurrent ? palette.current : isNext ? palette.next : palette.locked;
            const bd = isDone ? palette.doneBd : isCurrent ? palette.currentBd : isNext ? palette.nextBd : palette.lockedBd;
            const ink = isDone ? palette.doneInk : isCurrent ? palette.currentInk : isNext ? palette.nextInk : palette.lockedInk;
            const showN = !isLocked || n <= CURRENT + 6;
            return (
              <div key={n} style={{
                position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)",
                width: sz, height: sz, borderRadius: 99,
                background: bg, border: `${isCurrent?2:1.5}px solid ${bd}`,
                color: ink, fontFamily: PF.F_MONO, fontSize: isCurrent?12:9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isCurrent
                  ? (isPaper?"2px 2px 0 #1A1714":`0 0 0 6px ${palette.currentHalo}, 0 6px 16px ${palette.currentHalo}`)
                  : (isDark && isDone ? "0 0 6px rgba(52,211,153,0.5)" : "none"),
                zIndex: isCurrent ? 5 : 2,
              }}>
                {isDone && !s.includes("medal") && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="3.5"><path d="M5 13l4 4L19 7"/></svg>
                )}
                {isDone && s === "medaled" && (
                  <span style={{ fontFamily: PF.F_DISPLAY, fontSize: 11, fontWeight: 800, color: ink }}>★</span>
                )}
                {!isDone && showN && n}
                {!isDone && !showN && <div style={{ width: 4, height: 4, borderRadius: 99, background: ink, opacity: 0.5 }}/>}
              </div>
            );
          })}
        </div>
      </div>
      <DifficultyLegend theme={theme}/>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// C · Constellation — nodes as stars connected by thin lines
// ════════════════════════════════════════════════════════════════════════════

function buildConstellation() {
  // Pseudo-random but stable: build a node cloud and order by index
  const pts = [];
  let x = 60, y = 30;
  for (let i = 0; i < STAGE_COUNT; i++) {
    const dx = (((i * 73 + 17) % 91) - 45) * 1.1;
    const dy = 18 + (((i * 31 + 5) % 13));
    x += dx * 0.45;
    y += dy * 0.85;
    if (x < 40) x = 40 + ((i*17)%30);
    if (x > 320) x = 320 - ((i*23)%30);
    pts.push({ x, y });
  }
  return pts;
}

function PathConstellation({ theme }) {
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const pts = buildConstellation();
  const totalH = pts[pts.length-1].y + 40;
  const palette = {
    light: { line:"rgba(156,107,232,0.65)", lineDim:"rgba(28,25,23,0.15)",
      starDone:"#9C6BE8", starCurrent:"#9C6BE8", starNext:"#1C1917", starLocked:"rgba(28,25,23,0.25)",
      halo:"rgba(156,107,232,0.4)", medal:"#F59E0B",
      bg: "transparent",
    },
    dark: { line:"rgba(168,85,247,0.7)", lineDim:"rgba(255,255,255,0.1)",
      starDone:"#A855F7", starCurrent:"#E9D5FF", starNext:"#fff", starLocked:"rgba(255,255,255,0.35)",
      halo:"rgba(168,85,247,0.65)", medal:"#F5B342",
      bg: "transparent",
    },
    paper: { line:"#1A1714", lineDim:"rgba(26,23,20,0.35)",
      starDone:"#1A1714", starCurrent:"#1A1714", starNext:"#1A1714", starLocked:"rgba(26,23,20,0.45)",
      halo:"transparent", medal:"#1A1714",
      bg: "transparent",
    },
  }[theme];

  return (
    <>
      <MapHeader theme={theme} title="Star Chart" sub={`${CURRENT-1} / 100 · constellation`}/>
      <div style={{ flex: 1, overflow: "auto", padding: "8px 0 12px" }}>
        <div style={{ position: "relative", width: 360, height: totalH, margin: "0 auto" }}>
          <svg width="360" height={totalH} style={{ position: "absolute", inset: 0 }}>
            {pts.slice(0,-1).map((p, i) => {
              const next = pts[i+1];
              const n = i + 1;
              const isCompleted = n < CURRENT;
              return (
                <line key={i} x1={p.x} y1={p.y} x2={next.x} y2={next.y}
                  stroke={isCompleted ? palette.line : palette.lineDim}
                  strokeWidth={isCompleted ? (isPaper?1.5:1.6) : 0.8}
                  strokeDasharray={isCompleted ? "none" : (isPaper?"2 3":"3 4")}
                  strokeLinecap="round"/>
              );
            })}
          </svg>
          {pts.map((p, i) => {
            const n = i + 1;
            const s = stageState(n);
            const isCurrent = s === "current";
            const isDone = s === "done" || s === "medaled";
            const sz = isCurrent ? 14 : isDone ? 9 : 7;
            const color = isDone ? palette.starDone : isCurrent ? palette.starCurrent : (s === "locked" ? palette.starLocked : palette.starNext);
            return (
              <div key={n} style={{
                position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)",
                width: sz, height: sz,
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                background: color,
                filter: isCurrent
                  ? (isDark?`drop-shadow(0 0 8px ${palette.halo})`:isPaper?"none":`drop-shadow(0 0 6px ${palette.halo})`)
                  : (isDark && isDone ? `drop-shadow(0 0 4px ${palette.halo})` : "none"),
                zIndex: isCurrent ? 5 : 2,
              }}/>
            );
          })}
          {/* Label the current star */}
          {(() => {
            const cur = pts[CURRENT-1];
            return (
              <div style={{
                position: "absolute", left: cur.x + 14, top: cur.y - 8,
                fontFamily: PF.F_MONO, fontSize: 10, fontWeight: 700,
                color: isPaper?"#1A1714":isDark?"#E9D5FF":"#9C6BE8",
                background: isPaper?"#FFFCF1":isDark?"rgba(14,12,24,0.85)":"#fff",
                padding: "3px 7px", borderRadius: 99,
                border: isPaper?"1px solid #1A1714":isDark?"1px solid rgba(168,85,247,0.5)":"1px solid rgba(156,107,232,0.3)",
                boxShadow: isPaper?"1px 1px 0 #1A1714":"none",
                whiteSpace: "nowrap", zIndex: 8,
              }}>STAGE {CURRENT}</div>
            );
          })()}
        </div>
      </div>
      <DifficultyLegend theme={theme}/>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// D · Topographic — terraced levels (mountain ascent metaphor)
// ════════════════════════════════════════════════════════════════════════════

function PathTopo({ theme }) {
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  // 10 elevations × 10 stages each
  const tiers = Array.from({length: 10}).map((_, ti) => ({
    elev: ti, // 0 = base, 9 = summit
    stages: Array.from({length: 10}).map((__, si) => ti * 10 + si + 1),
  }));
  const palette = {
    light: {
      easyHue: "#D1FADF", easyEdge: "#34D399",
      medHue: "#FEF3C7", medEdge: "#F59E0B",
      hardHue: "#FCE7F3", hardEdge: "#EC4899",
      done: "#1C1917", doneFill: "#fff", doneStroke: "#34D399",
      current: "#9C6BE8", currentFill: "#fff",
      lockedFill: "transparent", lockedStroke: "rgba(28,25,23,0.2)", lockedInk: "rgba(28,25,23,0.5)",
    },
    dark: {
      easyHue: "rgba(52,211,153,0.18)", easyEdge: "rgba(52,211,153,0.55)",
      medHue: "rgba(245,179,66,0.18)", medEdge: "rgba(245,179,66,0.55)",
      hardHue: "rgba(244,114,182,0.18)", hardEdge: "rgba(244,114,182,0.55)",
      done: "#fff", doneFill: "rgba(52,211,153,0.25)", doneStroke: "#34D399",
      current: "#E9D5FF", currentFill: "rgba(168,85,247,0.3)",
      lockedFill: "rgba(255,255,255,0.03)", lockedStroke: "rgba(255,255,255,0.15)", lockedInk: "rgba(255,255,255,0.35)",
    },
    paper: {
      easyHue: "#E8DCBA", easyEdge: "#1A1714",
      medHue: "#FFCFA8", medEdge: "#1A1714",
      hardHue: "#D4B896", hardEdge: "#1A1714",
      done: "#1A1714", doneFill: "#FFFCF1", doneStroke: "#1A1714",
      current: "#1A1714", currentFill: "#FFFCF1",
      lockedFill: "transparent", lockedStroke: "rgba(26,23,20,0.4)", lockedInk: "rgba(26,23,20,0.45)",
    },
  }[theme];

  return (
    <>
      <MapHeader theme={theme} title="The Ascent" sub={`${CURRENT-1} / 100 · climbing`}/>
      <div style={{ flex: 1, overflow: "auto", padding: "0 18px 8px" }}>
        <div style={{ display: "flex", flexDirection: "column-reverse", gap: 0 }}>
          {tiers.map((tier) => {
            const isEasy = tier.elev < 3;
            const isMed = tier.elev >= 3 && tier.elev < 7;
            const isHard = tier.elev >= 7;
            const tierBg = isEasy ? palette.easyHue : isMed ? palette.medHue : palette.hardHue;
            const tierEdge = isEasy ? palette.easyEdge : isMed ? palette.medEdge : palette.hardEdge;
            // narrowing as we go up
            const inset = tier.elev * 4;
            return (
              <div key={tier.elev} style={{
                position: "relative",
                background: tierBg,
                borderTop: `1.5px solid ${tierEdge}`,
                margin: `0 ${inset}px`,
                padding: "8px 10px",
                borderRadius: isPaper?0:tier.elev===9?"10px 10px 0 0":0,
              }}>
                <div style={{
                  position: "absolute", left: 8, top: 6,
                  fontFamily: PF.F_TYPER, fontSize: 8, fontWeight: 700, letterSpacing: 1,
                  color: tierEdge,
                }}>
                  {isEasy?"EASY":isMed?"MEDIUM":"HARD"} · {tier.elev*10+1}–{tier.elev*10+10}
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: 14, gap: 4 }}>
                  {tier.stages.map(n => {
                    const s = stageState(n);
                    const isCurrent = s === "current";
                    const isDone = s === "done" || s === "medaled";
                    const isMedaled = s === "medaled";
                    return (
                      <div key={n} style={{
                        width: 22, height: 22, borderRadius: 99,
                        background: isCurrent?palette.currentFill:isDone?palette.doneFill:palette.lockedFill,
                        border: `${isCurrent?2:1.2}px solid ${isCurrent?palette.current:isDone?palette.doneStroke:palette.lockedStroke}`,
                        color: isCurrent?palette.current:isDone?palette.done:palette.lockedInk,
                        fontFamily: PF.F_MONO, fontSize: 8.5, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: isCurrent
                          ? (isPaper?"1.5px 1.5px 0 #1A1714":isDark?"0 0 10px rgba(168,85,247,0.65)":"0 0 0 4px rgba(156,107,232,0.25)")
                          : "none",
                        position: "relative",
                      }}>
                        {isDone && !isMedaled && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={palette.done} strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>
                        )}
                        {isMedaled && <span style={{ fontSize: 10 }}>★</span>}
                        {!isDone && n}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Shared difficulty legend (small bar at bottom of map)
// ════════════════════════════════════════════════════════════════════════════

function DifficultyLegend({ theme }) {
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const c = {
    light: { easy:"#34D399", med:"#F59E0B", hard:"#EC4899", text:"#78706A" },
    dark: { easy:"#34D399", med:"#F5B342", hard:"#F472B6", text:"rgba(255,255,255,0.55)" },
    paper: { easy:"#1A1714", med:"#1A1714", hard:"#1A1714", text:"#4A4030" },
  }[theme];
  return (
    <div style={{ padding: "0 22px 20px" }}>
      <div style={{ display: "flex", height: 4, borderRadius: 99, overflow: "hidden", marginBottom: 6,
        background: isPaper?"transparent":"transparent",
        border: isPaper?"0.5px solid #1A1714":"none",
      }}>
        <div style={{ flex: 30, background: c.easy, opacity: isPaper?0.25:0.75 }}/>
        <div style={{ flex: 40, background: c.med, opacity: isPaper?0.5:0.75 }}/>
        <div style={{ flex: 30, background: c.hard, opacity: isPaper?0.85:0.55 }}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: c.text, fontWeight: 700, letterSpacing: 0.6,
        fontFamily: isPaper?PF.F_TYPER:PF.F_SANS }}>
        <span>EASY · 1–30</span>
        <span>MEDIUM · 31–70</span>
        <span>HARD · 71–100</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Difficulty mode picker — Mix vs Straight Increasing
// (Shown as a dedicated screen, but in app this would be a sheet/modal)
// ════════════════════════════════════════════════════════════════════════════

function DifficultyPicker({ theme, selected = "straight" }) {
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const palette = {
    light: { ink:"#1C1917", ink2:"#3C3633", ink3:"#78706A", accent:"#9C6BE8", surface:"#fff", surfaceAlt:"#F8F4ED", border:"rgba(28,25,23,0.1)" },
    dark: { ink:"#fff", ink2:"rgba(255,255,255,0.85)", ink3:"rgba(255,255,255,0.55)", accent:"#A855F7", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.02)", border:"rgba(255,255,255,0.1)" },
    paper: { ink:"#1A1714", ink2:"#3C3022", ink3:"#5C4F38", accent:"#1A1714", surface:"#FFFCF1", surfaceAlt:"rgba(232,220,186,0.4)", border:"#1A1714" },
  }[theme];

  const options = [
    {
      id: "straight",
      title: isPaper?"Steady Climb":"Straight Climb",
      sub: "Easy → Medium → Hard",
      desc: isPaper?"Begin gently and ascend in earnest.":"Master the basics before stepping up. Predictable, satisfying.",
      icon: "straight",
    },
    {
      id: "mix",
      title: isPaper?"Mixed Bag":"Mixed Difficulty",
      sub: "Easy & Hard, side by side",
      desc: isPaper?"A varied diet. Easy palate cleansers between feats.":"Surprises keep you sharp. A breather follows every brain-buster.",
      icon: "mix",
    },
  ];

  return (
    <>
      <MapHeader theme={theme} title="Difficulty" sub="How should stages progress?"/>
      <div style={{ flex: 1, padding: "8px 20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {options.map(opt => {
          const isSel = opt.id === selected;
          return (
            <div key={opt.id} style={{
              padding: 16, borderRadius: isPaper?0:14,
              background: isSel
                ? (isPaper?"#FFFCF1":isDark?"rgba(168,85,247,0.12)":"#fff")
                : palette.surfaceAlt,
              border: `${isSel?2:1}px solid ${isSel?palette.accent:palette.border}`,
              boxShadow: isSel
                ? (isPaper?"3px 3px 0 #1A1714":isDark?"0 0 24px rgba(168,85,247,0.3)":"0 8px 24px rgba(28,25,23,0.06)")
                : "none",
              position: "relative",
            }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <DifficultyIcon kind={opt.icon} theme={theme} active={isSel}/>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: isPaper?PF.F_NEWS:PF.F_DISPLAY,
                    fontSize: 17, fontWeight: 600, color: palette.ink, letterSpacing: -0.2,
                  }}>{opt.title}</div>
                  <div style={{
                    fontFamily: isPaper?PF.F_TYPER:PF.F_MONO,
                    fontSize: 9.5, color: palette.accent, fontWeight: 700, letterSpacing: 1, marginTop: 2,
                  }}>{opt.sub.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: palette.ink2, lineHeight: 1.5, marginTop: 8 }}>{opt.desc}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: 99,
                  border: `1.5px solid ${isSel?palette.accent:palette.border}`,
                  background: isSel?palette.accent:"transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {isSel && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isPaper?"#FFFCF1":isDark?"#0E0C18":"#fff"} strokeWidth="4">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
              </div>
              {/* Mini preview strip */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px dashed ${palette.border}` }}>
                <DifficultyStrip kind={opt.icon} theme={theme}/>
              </div>
            </div>
          );
        })}
        <div style={{ flex: 1 }}/>
        <button style={{
          padding: "14px 20px", borderRadius: isPaper?0:14,
          background: palette.accent, color: isPaper?"#FFFCF1":isDark?"#0E0C18":"#fff",
          border: isPaper?"1.5px solid #1A1714":"none",
          fontFamily: isPaper?PF.F_TYPER:PF.F_SANS,
          fontSize: 13, fontWeight: 700, letterSpacing: isPaper?1.5:0,
          cursor: "pointer",
          boxShadow: isPaper?"3px 3px 0 #1A1714":isDark?"0 8px 24px rgba(168,85,247,0.4)":"0 6px 18px rgba(156,107,232,0.3)",
        }}>{isPaper?"SET COURSE":"Save preference"}</button>
      </div>
    </>
  );
}

function DifficultyIcon({ kind, theme, active }) {
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const accent = isPaper?"#1A1714":isDark?"#A855F7":"#9C6BE8";
  const dim = isPaper?"rgba(26,23,20,0.35)":isDark?"rgba(255,255,255,0.25)":"rgba(28,25,23,0.25)";
  return (
    <div style={{
      width: 44, height: 44, flexShrink: 0,
      borderRadius: isPaper?0:10,
      background: active?(isPaper?"#FFFCF1":isDark?"rgba(168,85,247,0.18)":"rgba(156,107,232,0.1)"):"transparent",
      border: isPaper?"1px solid #1A1714":"none",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {kind === "straight" ? (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          {[5,9,13,17,21].map((y,i)=> {
            const sizes = [3, 4.5, 6.5, 8.5, 10.5];
            return <rect key={i} x={(28 - sizes[i])/2} y={y} width={sizes[i]} height="2" rx="1" fill={active?accent:dim}/>;
          })}
        </svg>
      ) : (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          {[5,9,13,17,21].map((y,i)=>{
            const order = [6, 3, 9, 4, 7]; // mixed sizes
            return <rect key={i} x={(28 - order[i])/2} y={y} width={order[i]} height="2" rx="1" fill={active?accent:dim}/>;
          })}
        </svg>
      )}
    </div>
  );
}

function DifficultyStrip({ kind, theme }) {
  const isDark = theme === "dark";
  const isPaper = theme === "paper";
  const c = {
    light: { e:"#34D399", m:"#F59E0B", h:"#EC4899", text:"#78706A" },
    dark: { e:"#34D399", m:"#F5B342", h:"#F472B6", text:"rgba(255,255,255,0.55)" },
    paper: { e:"#1A1714", m:"#1A1714", h:"#1A1714", text:"#4A4030" },
  }[theme];
  // 20 segments
  let seq;
  if (kind === "straight") {
    seq = [...Array(6).fill("e"), ...Array(8).fill("m"), ...Array(6).fill("h")];
  } else {
    // pseudo-random mix
    seq = "emhemhmehemhheemmhmh".split("").map(ch => ch==="e"?"e":ch==="m"?"m":"h");
    while (seq.length < 20) seq.push("m");
    seq = seq.slice(0, 20);
  }
  const color = (k) => k==="e"?c.e:k==="m"?c.m:c.h;
  const opacity = (k) => isPaper ? (k==="e"?0.25:k==="m"?0.5:0.85) : 0.78;
  return (
    <div>
      <div style={{ display: "flex", gap: 2, height: 10 }}>
        {seq.map((k, i) => (
          <div key={i} style={{
            flex: 1, background: color(k), opacity: opacity(k),
            borderRadius: isPaper?0:2,
            border: isPaper?`0.5px solid #1A1714`:"none",
          }}/>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: c.text, fontWeight: 700, letterSpacing: 0.6, marginTop: 5,
        fontFamily: isPaper?PF.F_TYPER:PF.F_SANS }}>
        <span>Stage 1</span><span>Stage 100</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Export
// ════════════════════════════════════════════════════════════════════════════

window.PathStyles = {
  // Path A is currently the squares — rendered in all 3 themes
  Squares:       (props) => <PathSquares theme={props.theme}/>,
  Winding:       (props) => <PathWinding theme={props.theme}/>,
  Constellation: (props) => <PathConstellation theme={props.theme}/>,
  Topo:          (props) => <PathTopo theme={props.theme}/>,
  Difficulty:    (props) => <DifficultyPicker theme={props.theme} selected={props.selected || "straight"}/>,
};
