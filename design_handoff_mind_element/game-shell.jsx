/* game-shell.jsx — Mind Element · Phase 3: redesigned in-game shell.
   Games → Stage map → Play (live, redesigned HUD) → Stage complete.
   Fixes the doubled back-nav: Back steps cleanly through the stack, no modal.
   Reuses brandkit + icons. Mobile-first, dark-led. No emoji. */

const D = TOKENS.theme.dark;
const SparkyImg = ({ expr = 'idle', size = 96 }) => {
  const map = { idle: 'idle', happy: 'happy', focused: 'focused', surprised: 'surprised', celebrate: 'celebrate', sleep: 'resting' };
  return <img src={'assets/sparky/' + (map[expr] || 'idle') + '.png'} width={size} height={size} alt="Sparky" style={{ display: 'block', objectFit: 'contain' }} />;
};

if (!document.getElementById('me-gs-css')) {
  const s = document.createElement('style'); s.id = 'me-gs-css';
  s.textContent = `
    @keyframes gs-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
    @keyframes gs-fadeup{0%{transform:translateY(12px);opacity:0}100%{transform:translateY(0);opacity:1}}
    @keyframes gs-fall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(820px) rotate(520deg);opacity:0}}
    .gs-tap{cursor:pointer;transition:transform .1s,background .15s,border-color .15s}.gs-tap:active{transform:scale(.96)}
  `;
  document.head.appendChild(s);
}
const Micro = ({ children, c, s = 9.5, st }) => (<div style={{ fontFamily: FONTS.mono, fontSize: s, letterSpacing: '0.2em', textTransform: 'uppercase', color: c || D.faint, ...st }}>{children}</div>);

// ── Tango cell suits (inline SVG, no emoji) ──────────────────────
function Sun({ size = 26 }) {
  return (<svg width={size} height={size} viewBox="0 0 40 40"><g stroke={TOKENS.gold} strokeWidth="2.4" strokeLinecap="round">{Array.from({ length: 8 }).map((_, i) => { const a = i * Math.PI / 4, x = 20 + Math.cos(a) * 15, y = 20 + Math.sin(a) * 15, x2 = 20 + Math.cos(a) * 18.5, y2 = 20 + Math.sin(a) * 18.5; return <line key={i} x1={x} y1={y} x2={x2} y2={y2} />; })}</g><circle cx="20" cy="20" r="10" fill={TOKENS.gold} /><circle cx="20" cy="20" r="10" fill="none" stroke="#E0941B" strokeOpacity="0.4" strokeWidth="1.5" /></svg>);
}
function Moon({ size = 26 }) {
  return (<svg width={size} height={size} viewBox="0 0 40 40"><path d="M27 8 a13 13 0 1 0 0 24 a10 10 0 0 1 0 -24 Z" fill={TOKENS.violet} /><path d="M27 8 a13 13 0 1 0 0 24 a10 10 0 0 1 0 -24 Z" fill="none" stroke="#5B49C9" strokeOpacity="0.5" strokeWidth="1.5" /></svg>);
}

// ── A lightly playable Tango board (demonstrates the play surface) ─
const TANGO_INIT = [
  [1, 0, 0, 0, 0, 2], [0, 0, 0, 2, 0, 0], [0, 0, 0, 0, 1, 0],
  [0, 2, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1], [2, 0, 0, 0, 0, 0],
];
const LOCKED = new Set(['0,0', '0,5', '1,3', '2,4', '3,1', '3,3', '4,5', '5,0']);
function TangoBoard({ grid, onTap }) {
  const cell = 46;
  return (
    <div style={{ background: D.surf, border: `1px solid ${D.border}`, borderRadius: 18, padding: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.35)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(6, ${cell}px)`, gap: 4 }}>
        {grid.map((row, r) => row.map((v, c) => {
          const locked = LOCKED.has(`${r},${c}`);
          return (
            <div key={`${r},${c}`} className={locked ? '' : 'gs-tap'} onClick={() => !locked && onTap(r, c)}
              style={{ width: cell, height: cell, borderRadius: 11, background: locked ? D.surf2 : D.bg, border: `1px solid ${locked ? '#33373F' : D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {v === 1 && <Sun />} {v === 2 && <Moon />}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PLAY — redesigned in-game shell
// ════════════════════════════════════════════════════════════════
function Play({ stage, onBack, onSolve }) {
  const [grid, setGrid] = React.useState(() => TANGO_INIT.map((r) => r.slice()));
  const [xp, setXp] = React.useState(1000);
  const [secs, setSecs] = React.useState(0);
  const [hints, setHints] = React.useState(3);
  const [practice, setPractice] = React.useState(false);
  const histRef = React.useRef([]);

  React.useEffect(() => {
    const t = setInterval(() => { setSecs((s) => s + 1); if (!practice) setXp((x) => Math.max(550, x - 4)); }, 1000);
    return () => clearInterval(t);
  }, [practice]);

  const tap = (r, c) => {
    histRef.current.push(grid.map((row) => row.slice()));
    setGrid((g) => g.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? (v + 1) % 3 : v))));
  };
  const undo = () => { const prev = histRef.current.pop(); if (prev) setGrid(prev); };
  const hint = () => { if (hints > 0) { setHints((h) => h - 1); if (!practice) setXp((x) => Math.round(x * 0.75)); } };
  const mm = String(Math.floor(secs / 60)).padStart(1, '0'), ss = String(secs % 60).padStart(2, '0');
  const xpPct = ((xp - 550) / (1000 - 550)) * 100;
  const xpColor = xp > 850 ? TOKENS.cyan : xp > 680 ? TOKENS.gold : TOKENS.hard;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: D.bg }}>
      {/* HUD top */}
      <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${D.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="gs-tap" onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, background: D.surf, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={18} color={D.text} /></div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: D.text }}>Tango</div>
            <Micro s={8.5} st={{ marginTop: 2 }}>Stage {stage} · Easy</Micro>
          </div>
          <div style={{ width: 34, display: 'flex', justifyContent: 'flex-end' }}><GameIcon game="tango" size={30} /></div>
        </div>
        {/* live score + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: xpColor, fontVariantNumeric: 'tabular-nums', transition: 'color .4s' }}>{xp}</span>
              <Micro s={8} c={D.faint}>{practice ? 'practice · no decay' : 'score · solve fast'}</Micro>
            </div>
            <div style={{ height: 5, background: D.surf2, borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: Math.max(4, xpPct) + '%', height: '100%', background: xpColor, borderRadius: 3, transition: 'width 1s linear, background .4s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 9, padding: '6px 10px' }}><Icon name="clock" size={13} color={D.muted} stroke={2} /><span style={{ fontFamily: FONTS.mono, fontSize: 12, color: D.text }}>{mm}:{ss}</span></div>
        </div>
      </div>

      {/* play area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 20, padding: '7px 14px' }}>
          <Sun size={16} /><Micro s={8} c={D.muted}>= moons per row & col</Micro><Moon size={16} /><span style={{ width: 1, height: 12, background: D.border, margin: '0 2px' }} /><Micro s={8} c={D.muted}>no 3 in a row</Micro>
        </div>
        <TangoBoard grid={grid} onTap={tap} />
        {/* practice toggle */}
        <div className="gs-tap" onClick={() => setPractice((p) => !p)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, padding: '8px 14px', borderRadius: 20, background: practice ? 'rgba(142,124,255,0.12)' : D.surf, border: `1px solid ${practice ? TOKENS.violet + '66' : D.border}` }}>
          <div style={{ width: 30, height: 17, borderRadius: 9, background: practice ? TOKENS.violet : D.surf2, position: 'relative', transition: 'background .2s' }}><div style={{ position: 'absolute', top: 2, left: practice ? 15 : 2, width: 13, height: 13, borderRadius: 7, background: '#fff', transition: 'left .2s' }} /></div>
          <Micro s={8.5} c={practice ? TOKENS.violet : D.muted}>Practice mode · zero pressure</Micro>
        </div>
      </div>

      {/* footer */}
      <div style={{ display: 'flex', gap: 9, padding: '12px 16px 20px', borderTop: `1px solid ${D.border}` }}>
        <div className="gs-tap" onClick={undo} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 13, padding: '11px 0' }}><Icon name="undo" size={19} color={D.text} stroke={2} /><Micro s={8}>Undo</Micro></div>
        <div className="gs-tap" onClick={hint} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 13, padding: '11px 0', opacity: hints ? 1 : 0.45 }}><Icon name="lightbulb" size={19} color={TOKENS.gold} stroke={2} /><Micro s={8} c={D.muted}>Hint · {hints} left</Micro></div>
        <div className="gs-tap" onClick={onSolve} style={{ flex: 1.4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: TOKENS.cyan, borderRadius: 13, padding: '11px 0' }}><Icon name="check" size={19} color="#06231f" stroke={2.6} /><span style={{ fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.15em', color: '#06231f', fontWeight: 700 }}>CHECK</span></div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STAGE MAP — redesigned
// ════════════════════════════════════════════════════════════════
function StageMap({ onBack, onPlay, current = 12 }) {
  const bands = [['Easy', 1, 30, TOKENS.easy], ['Medium', 31, 70, TOKENS.medium], ['Hard', 71, 100, TOKENS.hard]];
  const tier = (n) => (n < current ? (n % 7 === 0 ? 'gold' : n % 3 === 0 ? 'silver' : 'bronze') : null);
  return (
    <div style={{ height: '100%', background: D.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${D.border}` }}>
        <div className="gs-tap" onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, background: D.surf, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={18} color={D.text} /></div>
        <GameIcon game="tango" size={36} />
        <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, color: D.text }}>Tango</div><Micro s={8.5} st={{ marginTop: 2 }}>27 / 100 cleared</Micro></div>
        <div style={{ textAlign: 'center' }}><Medal tier="silver" size={30} /><Micro s={7} st={{ marginTop: 2 }}>Silver</Micro></div>
      </div>
      <div style={{ padding: '12px 18px 6px' }}><div style={{ height: 6, background: D.surf2, borderRadius: 3, overflow: 'hidden' }}><div style={{ width: '27%', height: '100%', background: `linear-gradient(90deg, ${TOKENS.cyan}, ${TOKENS.gold})` }} /></div></div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px 22px' }}>
        {bands.map(([name, lo, hi, col]) => (
          <div key={name} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 2px 12px' }}><span style={{ width: 7, height: 7, borderRadius: 4, background: col }} /><Micro c={col}>{name}</Micro><span style={{ flex: 1, height: 1, background: D.border }} /><Micro s={8} c={D.faint}>{lo}–{hi}</Micro></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9 }}>
              {Array.from({ length: hi - lo + 1 }).slice(0, name === 'Easy' ? 30 : 10).map((_, i) => {
                const n = lo + i; const done = n < current; const cur = n === current; const locked = n > current;
                const mt = tier(n);
                return (
                  <div key={n} className={locked ? '' : 'gs-tap'} onClick={() => !locked && onPlay(n)}
                    style={{ aspectRatio: '1', borderRadius: 12, background: cur ? 'rgba(47,230,224,0.1)' : D.surf, border: `1.5px solid ${cur ? TOKENS.cyan : D.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: locked ? 0.5 : 1 }}>
                    {done ? <Medal tier={mt} size={22} /> : locked ? <Icon name="lock" size={14} color={D.faint} stroke={2} /> : <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: cur ? TOKENS.cyan : D.text }}>{n}</span>}
                    {cur && <Micro s={6.5} c={TOKENS.cyan} st={{ marginTop: 3 }}>NOW</Micro>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// GAMES (entry, compact)
// ════════════════════════════════════════════════════════════════
function Games({ onPick }) {
  const list = [['tango', 'Tango', 'easy', true], ['queens', 'Queens', 'easy', true], ['memory', 'Memory', 'easy', false], ['sudoku', 'Sudoku', 'medium', false], ['zip', 'Zip', 'medium', false], ['flow', 'Flow', 'medium', false], ['bridges', 'Bridges', 'medium', false], ['nonogram', 'Nonogram', 'hard', false]];
  const dc = { easy: TOKENS.easy, medium: TOKENS.medium, hard: TOKENS.hard };
  return (
    <div style={{ height: '100%', background: D.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 18px 12px' }}>
        <Micro c={TOKENS.cyan}>Phase 3 · interactive</Micro>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 23, color: D.text, marginTop: 3 }}>In-game shell</div>
        <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: D.muted, marginTop: 8, lineHeight: 1.5 }}>Open <b style={{ color: D.text }}>Tango</b> to play the redesigned board. Back now steps cleanly: Play → Map → Games — no dead-end modal.</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {list.map(([g, name, diff, live]) => (
          <div key={g} className="gs-tap" onClick={() => onPick(g)} style={{ background: D.surf, border: `1px solid ${live ? 'rgba(47,230,224,0.35)' : D.border}`, borderRadius: 16, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <GameIcon game={g} size={50} />
              {live && <Micro s={7} c={TOKENS.cyan} st={{ border: `1px solid ${TOKENS.cyan}55`, borderRadius: 5, padding: '2px 5px' }}>LIVE</Micro>}
            </div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: D.text, marginTop: 11 }}>{name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}><span style={{ fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: dc[diff] }}>{diff}</span><span style={{ fontFamily: FONTS.mono, fontSize: 8, color: D.faint }}>· 27/100</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPLETE (compact)
// ════════════════════════════════════════════════════════════════
function Complete({ stage, onNext, onMap }) {
  return (
    <div style={{ height: '100%', background: 'radial-gradient(120% 70% at 50% 6%, rgba(255,194,75,0.12), transparent 55%), ' + D.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>{Array.from({ length: 16 }).map((_, i) => (<div key={i} style={{ position: 'absolute', left: (i * 6.3) + '%', top: -10, width: 7, height: 7, borderRadius: i % 2 ? 1 : 7, background: [TOKENS.cyan, TOKENS.gold, TOKENS.violet][i % 3], animation: `gs-fall ${2 + (i % 4) * 0.4}s ${(i % 5) * 0.15}s ease-in forwards` }} />))}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, position: 'relative', zIndex: 2 }}>
        <Micro c={D.faint}>Tango · Stage {stage}</Micro>
        <div style={{ position: 'relative', marginTop: 14, animation: 'gs-pop .5s ease-out both' }}><SparkyImg expr="celebrate" size={104} /><div style={{ position: 'absolute', right: -6, bottom: 2 }}><Medal tier="gold" size={40} /></div></div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 50, color: TOKENS.cyan, marginTop: 14, fontVariantNumeric: 'tabular-nums' }}>+862</div>
        <Micro c={D.muted} st={{ marginTop: 4 }}>XP Earned</Micro>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, width: '100%' }}>
          {[['clock', 'Time', '0:21'], ['lightbulb', 'Hints', '1'], ['medal', 'Medal', 'Gold']].map(([ic, l, v]) => (<div key={l} style={{ flex: 1, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 12, padding: '11px 4px', textAlign: 'center' }}><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}><Icon name={ic} size={15} color={D.muted} stroke={2} /></div><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: D.text }}>{v}</div><Micro s={7.5} st={{ marginTop: 2 }}>{l}</Micro></div>))}
        </div>
      </div>
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 9, position: 'relative', zIndex: 2 }}>
        <div className="gs-tap" onClick={onNext} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: TOKENS.cyan, color: '#06231f', fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, padding: '14px 0', borderRadius: 14 }}><Icon name="play" size={17} color="#06231f" fill />Next stage</div>
        <div className="gs-tap" onClick={onMap} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: D.surf2, color: D.text, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, padding: '14px 0', borderRadius: 14 }}><Icon name="grid" size={17} color={D.text} />Back to map</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// APP — clean navigation stack (the back-nav fix)
// ════════════════════════════════════════════════════════════════
function App() {
  const [stack, setStack] = React.useState(['games']);
  const [stage, setStage] = React.useState(12);
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => { const fit = () => setScale(Math.min(1, (window.innerHeight - 96) / 812)); fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }, []);
  const view = stack[stack.length - 1];
  const push = (v) => setStack((s) => [...s, v]);
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const goMap = () => setStack(['games', 'map']);

  const screens = {
    games: <Games onPick={() => push('map')} />,
    map: <StageMap onBack={pop} onPlay={(n) => { setStage(n); push('play'); }} current={stage} />,
    play: <Play stage={stage} onBack={pop} onSolve={() => push('complete')} />,
    complete: <Complete stage={stage} onNext={() => { setStage((n) => n + 1); setStack(['games', 'map', 'play']); }} onMap={goMap} />,
  };
  const crumbs = { games: ['Games'], map: ['Games', 'Tango map'], play: ['Games', 'Tango map', `Stage ${stage}`], complete: ['Games', 'Tango map', `Stage ${stage}`, 'Complete'] };

  return (
    <div style={{ minHeight: '100vh', background: '#070809', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, padding: 16, gap: 14 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <div style={{ width: 384, height: 812, background: '#000', borderRadius: 46, padding: 11, boxShadow: '0 40px 120px rgba(0,0,0,0.6), inset 0 0 0 2px #23262d' }}>
          <div style={{ width: '100%', height: '100%', background: D.bg, borderRadius: 36, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', zIndex: 20, pointerEvents: 'none' }}>
              <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: D.text }}>9:41</span>
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 8, width: 96, height: 22, background: '#000', borderRadius: 12 }} />
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}><Icon name="bolt" size={12} color={TOKENS.cyan} stroke={2} fill /><span style={{ fontFamily: FONTS.mono, fontSize: 10, color: D.muted }}>5/5</span></div>
            </div>
            <div style={{ position: 'absolute', inset: 0, paddingTop: 30 }} key={view}><div style={{ height: '100%', animation: 'gs-fadeup .26s ease-out both' }}>{screens[view]}</div></div>
          </div>
        </div>
      </div>
      {/* breadcrumb — shows the nav stack is clean */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: FONTS.mono, fontSize: 11, color: '#5A606C' }}>
        {crumbs[view].map((c, i) => (<React.Fragment key={i}>{i > 0 && <Icon name="chevronRight" size={11} color="#3A3F49" />}<span style={{ color: i === crumbs[view].length - 1 ? TOKENS.cyan : '#5A606C' }}>{c}</span></React.Fragment>))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
