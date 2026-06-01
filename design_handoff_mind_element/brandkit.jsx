/* brandkit.jsx — Mind Element design foundation primitives.
   Geometric, themeable SVG mascots + icons + design tokens.
   Exports to window: TOKENS, FONTS, EyePair, QuantaMascot, PipMascot,
   GlyphMascot, NodeMark, AppIcon, GameIcon, Swatch.
   All marks are built from primitives (rounded rects, circles, arcs, lines)
   so they stay crisp at any size and read for kids and adults alike. */

// ── Design tokens ────────────────────────────────────────────────
const TOKENS = {
  theme: {
    dark:  { bg: '#0B0C0F', surf: '#14161B', surf2: '#1D2027', border: '#2A2E37',
             text: '#F4F6F8', muted: '#868D99', faint: '#5A606C', accent: '#2FE6E0' },
    light: { bg: '#F5F6F8', surf: '#FFFFFF', surf2: '#EDEFF3', border: '#E2E5EB',
             text: '#15171C', muted: '#5C6370', faint: '#9AA1AD', accent: '#0FB3AC' },
    paper: { bg: '#ECE3D0', surf: '#F5EFE0', surf2: '#E5DAC0', border: '#D6C9AB',
             text: '#241A0C', muted: '#7A6A4A', faint: '#A8967A', accent: '#0E8B90' },
  },
  // brand accents — cyan DNA kept, evolved + given supporting hues
  cyan: '#2FE6E0', cyanDeep: '#0E8E93', cyanSoft: '#8FF3EE',
  violet: '#8E7CFF', violetDeep: '#5B49C9',
  gold: '#FFC24B', goldDeep: '#E0941B',
  // difficulty (refined from the live app's green/amber/red)
  easy: '#54D06A', medium: '#F5A623', hard: '#FF5C66',
};

const FONTS = {
  display: "'Space Grotesk', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'Space Mono', ui-monospace, monospace",
  serif: "'Spectral', Georgia, serif",
};

// ── Eyes ─────────────────────────────────────────────────────────
function EyePair({ expr = 'idle', cx = 60, cy = 60, gap = 21, r = 7.5, color = '#0B0C0F' }) {
  const lx = cx - gap, rx = cx + gap;
  const sw = 4.2;
  if (expr === 'happy') {
    const d = (x) => `M ${x - r} ${cy + 2.5} Q ${x} ${cy - r + 1} ${x + r} ${cy + 2.5}`;
    return (<g fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"><path d={d(lx)} /><path d={d(rx)} /></g>);
  }
  if (expr === 'focused') {
    return (<g stroke={color} strokeWidth={sw} strokeLinecap="round">
      <line x1={lx - r} y1={cy} x2={lx + r} y2={cy} /><line x1={rx - r} y1={cy} x2={rx + r} y2={cy} /></g>);
  }
  if (expr === 'sleep') {
    const d = (x) => `M ${x - r} ${cy} Q ${x} ${cy + r} ${x + r} ${cy}`;
    return (<g fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"><path d={d(lx)} /><path d={d(rx)} /></g>);
  }
  if (expr === 'surprised') {
    return (<g><circle cx={lx} cy={cy} r={r + 1} fill={color} /><circle cx={rx} cy={cy} r={r + 1} fill={color} />
      <circle cx={lx + 2} cy={cy - 2.5} r={1.8} fill="#fff" opacity=".85" /><circle cx={rx + 2} cy={cy - 2.5} r={1.8} fill="#fff" opacity=".85" /></g>);
  }
  if (expr === 'celebrate') {
    const star = (x) => {
      const o = r, i = r * 0.36;
      return `M ${x} ${cy - o} L ${x + i} ${cy - i} L ${x + o} ${cy} L ${x + i} ${cy + i} L ${x} ${cy + o} L ${x - i} ${cy + i} L ${x - o} ${cy} L ${x - i} ${cy - i} Z`;
    };
    return (<g fill={color}><path d={star(lx)} /><path d={star(rx)} /></g>);
  }
  // idle
  return (<g fill={color}>
    <circle cx={lx} cy={cy} r={r} /><circle cx={rx} cy={cy} r={r} />
    <circle cx={lx + 2} cy={cy - 2.4} r={1.9} fill="#fff" opacity=".8" /><circle cx={rx + 2} cy={cy - 2.4} r={1.9} fill="#fff" opacity=".8" /></g>);
}

// ── Mascot A · Quanta (geometric "element" / living cell) ─────────
function QuantaMascot({ size = 120, expr = 'idle', tone = TOKENS.cyan, toneDeep = TOKENS.cyanDeep, glow = true }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`q${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone} /><stop offset="1" stopColor={toneDeep} />
        </linearGradient>
        <radialGradient id={`qg${id}`} cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && <rect x="14" y="16" width="92" height="92" rx="30" fill={tone} opacity="0.18" />}
      <rect x="18" y="18" width="84" height="84" rx="27" fill={`url(#q${id})`} />
      <rect x="18" y="18" width="84" height="84" rx="27" fill={`url(#qg${id})`} />
      {/* faint inner "cell" frame — ties the mascot to the puzzle grid */}
      <rect x="30" y="30" width="60" height="60" rx="17" fill="none" stroke="#0B0C0F" strokeOpacity="0.10" strokeWidth="2" />
      <EyePair expr={expr} cx={60} cy={62} gap={18} r={7} color="#0B1316" />
      {/* spark antenna */}
      <line x1="60" y1="18" x2="60" y2="8" stroke={tone} strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="6" r="4.5" fill={tone} />
      <circle cx="60" cy="6" r="8" fill={tone} opacity="0.25" />
    </svg>
  );
}

// ── Mascot B · Pip (friendly creature) ───────────────────────────
function PipMascot({ size = 120, expr = 'happy', tone = TOKENS.cyan, toneDeep = TOKENS.cyanDeep }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`p${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone} /><stop offset="1" stopColor={toneDeep} />
        </linearGradient>
      </defs>
      {/* antennae */}
      <line x1="44" y1="24" x2="38" y2="10" stroke={toneDeep} strokeWidth="3" strokeLinecap="round" />
      <circle cx="37" cy="8" r="4" fill={TOKENS.gold} />
      <line x1="76" y1="24" x2="82" y2="10" stroke={toneDeep} strokeWidth="3" strokeLinecap="round" />
      <circle cx="83" cy="8" r="4" fill={TOKENS.gold} />
      {/* feet */}
      <rect x="40" y="98" width="14" height="12" rx="6" fill={toneDeep} />
      <rect x="66" y="98" width="14" height="12" rx="6" fill={toneDeep} />
      {/* body — tall rounded blob */}
      <rect x="20" y="22" width="80" height="82" rx="38" fill={`url(#p${id})`} />
      <ellipse cx="60" cy="44" rx="30" ry="20" fill="#fff" opacity="0.18" />
      {/* belly cell badge */}
      <rect x="46" y="74" width="28" height="20" rx="7" fill="#0B0C0F" opacity="0.12" />
      <EyePair expr={expr} cx={60} cy={58} gap={17} r={8} color="#0B1316" />
      {/* blush */}
      <circle cx="36" cy="70" r="5" fill={TOKENS.hard} opacity="0.32" />
      <circle cx="84" cy="70" r="5" fill={TOKENS.hard} opacity="0.32" />
      {/* smile */}
      <path d="M 51 73 Q 60 80 69 73" fill="none" stroke="#0B1316" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Mascot C · Glyph (line companion) ────────────────────────────
function GlyphMascot({ size = 120, expr = 'focused', tone = TOKENS.cyan }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ display: 'block' }}>
      <rect x="20" y="22" width="80" height="80" rx="26" fill="none" stroke={tone} strokeWidth="5" />
      <rect x="34" y="36" width="52" height="52" rx="15" fill="none" stroke={tone} strokeWidth="2.4" strokeOpacity="0.5" />
      <line x1="60" y1="22" x2="60" y2="10" stroke={tone} strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="7" r="5" fill="none" stroke={tone} strokeWidth="4" />
      <EyePair expr={expr} cx={60} cy={62} gap={17} r={7} color={tone} />
    </svg>
  );
}

// ── Mark D · Node (symbol-only logo mark, no face) ────────────────
function NodeMark({ size = 120, tone = TOKENS.cyan, toneDeep = TOKENS.cyanDeep, bg = '#14161B', frame = true }) {
  const id = React.useId().replace(/:/g, '');
  // a "logic path" tracing through grid nodes — the act of solving, distilled
  const pts = [[34, 86], [34, 52], [60, 52], [60, 34], [86, 34], [86, 78]];
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`n${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tone} /><stop offset="1" stopColor={toneDeep} />
        </linearGradient>
      </defs>
      {frame && <rect x="14" y="14" width="92" height="92" rx="26" fill={bg} />}
      {/* faint grid dots */}
      <g fill={tone} opacity="0.16">
        {[34, 60, 86].map((x) => [34, 52, 78].map((y) => <circle key={x + '-' + y} cx={x} cy={y} r="2.2" />))}
      </g>
      <path d={d} stroke={`url(#n${id})`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[0][0]} cy={pts[0][1]} r="7" fill={tone} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="7" fill={TOKENS.gold} />
    </svg>
  );
}

// ── App icon (iOS squircle) ──────────────────────────────────────
function AppIcon({ size = 120, variant = 'core', radius = 0.225 }) {
  const id = React.useId().replace(/:/g, '');
  const rx = size * radius;
  const Frame = ({ children, fill }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0.3" y2="1">
          {variant === 'invert'
            ? (<><stop offset="0" stopColor={TOKENS.cyan} /><stop offset="1" stopColor={TOKENS.cyanDeep} /></>)
            : variant === 'gold'
            ? (<><stop offset="0" stopColor="#1A1206" /><stop offset="1" stopColor="#0B0C0F" /></>)
            : (<><stop offset="0" stopColor="#1A1E26" /><stop offset="1" stopColor="#0B0C0F" /></>)}
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="120" height="120" rx={120 * radius} fill={`url(#bg${id})`} />
      {children}
    </svg>
  );
  if (variant === 'invert') {
    return (<Frame><g transform="translate(18,18) scale(0.7)"><NodeMark size={120} bg="transparent" frame={false} tone="#06363A" toneDeep="#06363A" /></g>
      <g transform="translate(0,0)"><path d="M40 78 L40 52 L60 52 L60 40 L80 40 L80 74" stroke="#0B0C0F" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="40" cy="78" r="6.5" fill="#0B0C0F" /><circle cx="80" cy="74" r="6.5" fill="#0B0C0F" /></g></Frame>);
  }
  if (variant === 'gold') {
    return (<Frame><g transform="translate(15,15) scale(0.75)"><QuantaMascot size={120} expr="celebrate" tone={TOKENS.gold} toneDeep={TOKENS.goldDeep} /></g></Frame>);
  }
  if (variant === 'mark') {
    return (<Frame><g transform="translate(8,8) scale(0.87)"><NodeMark size={120} frame={false} /></g></Frame>);
  }
  // core
  return (<Frame><g transform="translate(13,13) scale(0.78)"><QuantaMascot size={120} expr="idle" /></g></Frame>);
}

// ── Unified game-icon system (teaser) ────────────────────────────
function GameTile({ children, bg = '#14161B', size = 72 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" style={{ display: 'block' }}>
      <rect x="0" y="0" width="72" height="72" rx="18" fill={bg} />
      <rect x="0.6" y="0.6" width="70.8" height="70.8" rx="17.6" fill="none" stroke="#fff" strokeOpacity="0.06" />
      {children}
    </svg>
  );
}
function GameIcon({ game = 'tango', size = 72 }) {
  const C = TOKENS.cyan, V = TOKENS.violet, G = TOKENS.gold, E = TOKENS.easy, H = TOKENS.hard, M = TOKENS.medium;
  const m = {
    tango: (<g><circle cx="27" cy="36" r="9" fill={G} /><circle cx="27" cy="36" r="9" fill="none" stroke="#E0941B" strokeOpacity="0.4" strokeWidth="1.4" /><path d="M50 26 C 41 26, 38 31, 38 37 C 38 43, 41 48, 50 48 C 44 42, 44 32, 50 26 Z" fill={V} /></g>),
    queens: (<g><path d="M24 46 L24 32 L30 38 L36 28 L42 38 L48 32 L48 46 Z" fill={C} /><rect x="24" y="46" width="24" height="5" rx="2" fill={C} /></g>),
    memory: (<g><rect x="20" y="22" width="22" height="28" rx="5" fill={V} opacity="0.55" /><rect x="32" y="26" width="22" height="28" rx="5" fill={C} /><circle cx="43" cy="40" r="5" fill="#0B0C0F" /></g>),
    sudoku: (<g stroke={C} strokeWidth="2" opacity="0.85"><rect x="22" y="22" width="28" height="28" rx="3" fill="none" /><line x1="31.3" y1="22" x2="31.3" y2="50" /><line x1="40.6" y1="22" x2="40.6" y2="50" /><line x1="22" y1="31.3" x2="50" y2="31.3" /><line x1="22" y1="40.6" x2="50" y2="40.6" /></g>),
    zip: (<g fill="none" stroke={C} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M24 48 L24 30 L48 30 L48 48" /><circle cx="24" cy="48" r="5" fill={C} /><circle cx="48" cy="48" r="5" fill={G} /></g>),
    flow: (<g fill="none"><path d="M24 28 Q24 48 48 48" stroke={H} strokeWidth="5" strokeLinecap="round" /><circle cx="24" cy="28" r="6" fill={H} /><circle cx="48" cy="48" r="6" fill={H} /></g>),
    bridges: (<g><circle cx="26" cy="36" r="8" fill="none" stroke={C} strokeWidth="3" /><circle cx="50" cy="36" r="8" fill="none" stroke={C} strokeWidth="3" /><line x1="34" y1="33" x2="42" y2="33" stroke={C} strokeWidth="2.5" /><line x1="34" y1="39" x2="42" y2="39" stroke={C} strokeWidth="2.5" /></g>),
    nonogram: (<g fill={C}>{[[0,0],[1,0],[2,1],[0,2],[2,2]].map(([c,r],i)=><rect key={i} x={24+c*9} y={24+r*9} width="7" height="7" rx="1.5" />)}<g fill="none" stroke={C} strokeOpacity="0.3" strokeWidth="1">{[0,1,2].map(c=>[0,1,2].map(r=><rect key={c+'-'+r} x={24+c*9} y={24+r*9} width="7" height="7" rx="1.5" />))}</g></g>),
    kakuro: (<g><rect x="22" y="22" width="28" height="28" rx="4" fill="none" stroke={C} strokeWidth="2" /><path d="M22 22 L50 50" stroke={C} strokeWidth="1.6" /><path d="M22 22 L50 22 L50 50 Z" fill={C} fillOpacity="0.16" /><text x="43" y="33" fontSize="9" fill={C} fontFamily="monospace" textAnchor="middle">7</text><text x="30" y="47" fontSize="9" fill={C} fontFamily="monospace" textAnchor="middle">4</text></g>),
    logicpath: (<g fill="none" stroke={C} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M24 26 L24 40 L40 40 L40 30 L48 30" /><circle cx="24" cy="26" r="4.5" fill={C} /><circle cx="48" cy="30" r="4.5" fill={G} /></g>),
    lightup: (<g><rect x="22" y="22" width="11" height="11" rx="2" fill="#2A2E37" /><rect x="39" y="39" width="11" height="11" rx="2" fill="#2A2E37" /><g stroke={G} strokeWidth="2.2" strokeLinecap="round"><line x1="36" y1="22" x2="36" y2="27" /><line x1="36" y1="45" x2="36" y2="50" /><line x1="22" y1="36" x2="27" y2="36" /><line x1="45" y1="36" x2="50" y2="36" /></g><circle cx="36" cy="36" r="6.5" fill={G} /></g>),
    patternmatch: (<g><circle cx="23" cy="30" r="3.5" fill={C} /><rect x="30" y="26.5" width="7" height="7" rx="1.5" fill={V} /><path d="M46 26 l4 7 l-8 0 z" fill={G} /><rect x="29" y="40" width="14" height="11" rx="2" fill="none" stroke={C} strokeWidth="1.6" strokeDasharray="3 2" /><text x="36" y="49" fontSize="9" fill={C} fontFamily="monospace" textAnchor="middle">?</text></g>),
    patches: (<g>{[[22,22,V],[35,22,C],[22,35,G],[35,35,H]].map(([x,y,c],i)=><rect key={i} x={x} y={y} width="13" height="13" rx="3" fill={c} />)}</g>),
    '2048': (<g>{[[24,24,V],[38,24,V],[24,38,G],[38,38,C]].map(([x,y,c],i)=><rect key={i} x={x} y={y} width="12" height="12" rx="3" fill={c} opacity={i<2?1:0.85} />)}</g>),
    gravity: (<g>{[26,36,46].map((x,ci)=>(<g key={ci}><rect x={x-5} y="24" width="10" height="26" rx="5" fill="#1D2027" />{[0,1].map(ri=><circle key={ri} cx={x} cy={42-ri*10} r="4" fill={[C,G,V,H][(ci+ri)%4]} />)}</g>))}</g>),
    hexmerge: (<g><path d="M36 22 L48 29 L48 43 L36 50 L24 43 L24 29 Z" fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round" /><path d="M36 30 L42 33.5 L42 40 L36 43.5 L30 40 L30 33.5 Z" fill={C} fillOpacity="0.8" /></g>),
    wordsling: (<g>{['A','B','C'].map((ch,i)=>(<g key={i}><rect x={22+i*10} y="30" width="8.5" height="11" rx="2" fill={i===1?G:'#1D2027'} stroke={E} strokeWidth="1" /><text x={26.2+i*10} y="38.5" fontSize="7" fill={i===1?'#0B0C0F':E} fontFamily="monospace" textAnchor="middle" fontWeight="bold">{ch}</text></g>))}</g>),
    hearts: (<g><path d="M36 47 C 24 38, 24 28, 31 28 C 34.5 28, 36 31, 36 33 C 36 31, 37.5 28, 41 28 C 48 28, 48 38, 36 47 Z" fill={H} /></g>),
    solitaire: (<g><g transform="rotate(-10 34 38)"><rect x="25" y="26" width="17" height="23" rx="3" fill="#23262d" stroke={C} strokeWidth="1.3" /></g><g transform="rotate(7 41 38)"><rect x="33" y="25" width="17" height="23" rx="3" fill="#2A2E37" stroke={C} strokeWidth="1.3" /><path d="M41.5 41 C 37 37, 37 32.5, 40.3 33.6 C 41 33.8, 41.5 34.8, 41.5 35.3 C 41.5 34.8, 42 33.8, 42.7 33.6 C 46 32.5, 46 37, 41.5 41 Z" fill={H} /></g></g>),
    minesweeper: (<g><rect x="22" y="22" width="28" height="28" rx="4" fill="#1D2027" stroke="#33373F" strokeWidth="1" /><g stroke={H} strokeWidth="2" strokeLinecap="round"><line x1="36" y1="28" x2="36" y2="44" /><line x1="28" y1="36" x2="44" y2="36" /><line x1="30.5" y1="30.5" x2="41.5" y2="41.5" /><line x1="41.5" y1="30.5" x2="30.5" y2="41.5" /></g><circle cx="36" cy="36" r="5.5" fill={H} /></g>),
    wordclimb: (<g><path d="M22 50 L50 22" stroke={E} strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.4" />{[0,1,2].map(i=>(<rect key={i} x={24+i*9} y={43-i*9} width="9" height="9" rx="2" fill={E} opacity={0.5+i*0.25} />))}</g>),
    pinpoint: (<g><circle cx="36" cy="36" r="13" fill="none" stroke={C} strokeWidth="2" /><circle cx="36" cy="36" r="7" fill="none" stroke={C} strokeWidth="2" /><circle cx="36" cy="36" r="2.6" fill={G} /></g>),
    namecountry: (<g><line x1="26" y1="22" x2="26" y2="50" stroke={C} strokeWidth="2.5" strokeLinecap="round" /><rect x="26" y="24" width="22" height="4" fill={C} /><rect x="26" y="28" width="22" height="4" fill="#E8EDF2" /><rect x="26" y="32" width="22" height="4" fill={E} /></g>),
    namecity: (<g>{[[24,38,C],[31,30,V],[38,34,G],[45,26,C]].map(([x,y,c],i)=><rect key={i} x={x} y={y} width="6" height={50-y} rx="1.5" fill={c} fillOpacity="0.92" />)}</g>),
  };
  return <GameTile size={size}>{m[game] || m.tango}</GameTile>;
}

// ── Color swatch helper (used on the canvas) ─────────────────────
function Swatch({ color, name, val, text = '#fff' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: color, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }} />
      <div style={{ lineHeight: 1.25 }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 600, color: text }}>{name}</div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, color: text, opacity: 0.5 }}>{val || color}</div>
      </div>
    </div>
  );
}

// ── Medals (shared — used across rewards + game shell) ───────────
if (typeof document !== 'undefined' && !document.getElementById('me-kit-css')) {
  const s = document.createElement('style'); s.id = 'me-kit-css';
  s.textContent = '@keyframes me-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}';
  document.head.appendChild(s);
}
function starPath(cx, cy, r, inner) {
  let p = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? inner : r; p += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); }
  return p + 'Z';
}
const TIER_COLORS = { bronze: ['#E7B07E', '#B5732F'], silver: ['#E2E8EF', '#97A3B0'], gold: ['#FFD479', '#E0941B'], diamond: ['#A6F6F0', '#2FE6E0'] };
function Medal({ tier = 'gold', size = 64, pop }) {
  const [a, b] = TIER_COLORS[tier] || TIER_COLORS.gold;
  const id = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'block', animation: pop ? 'me-pop .5s ease-out both' : 'none' }}>
      <defs><linearGradient id={`m${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <path d="M20 6 L26 30 L18 30 Z" fill={b} opacity="0.85" /><path d="M44 6 L38 30 L46 30 Z" fill={a} opacity="0.85" />
      <circle cx="32" cy="38" r="20" fill={`url(#m${id})`} />
      <circle cx="32" cy="38" r="20" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="32" cy="38" r="14" fill="none" stroke="#0B0C0F" strokeOpacity="0.12" strokeWidth="1.5" />
      <path d={starPath(32, 38, 9, 3.8)} fill="#fff" fillOpacity="0.92" />
    </svg>
  );
}

Object.assign(window, { TOKENS, FONTS, EyePair, QuantaMascot, PipMascot, GlyphMascot, NodeMark, AppIcon, GameIcon, GameTile, Swatch, Medal, TIER_COLORS, starPath });
