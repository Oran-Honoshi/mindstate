/* game-screens.jsx — Mind Element · themed game screens + stage path.
   Game picker → winding stage path → play screen. Dark / Light / Paper.
   Reuses brandkit + icons + previews + app-screens-extra atoms (useT, makeT, TH, Card, SecHead, Micro). */

const GS_GAMES = [
  ['tango','Tango','easy'],['memory','Memory','easy'],['queens','Queens','easy'],['sudoku','Mini Sudoku','medium'],
  ['zip','Zip','medium'],['flow','Flow','medium'],['bridges','Bridges','medium'],['kakuro','Kakuro','hard'],
  ['logicpath','Logic Path','medium'],['lightup','Light Up','medium'],['nonogram','Nonogram','hard'],['patternmatch','Pattern Match','easy'],
  ['patches','Patches','medium'],['2048','2048 Pro','medium'],['gravity','Gravity Sort','medium'],['hexmerge','Hex Merge','hard'],
  ['wordsling','Word Sling','easy'],['hearts','Hearts','medium'],['solitaire','Solitaire','easy'],['minesweeper','Minesweeper','hard'],
  ['wordclimb','Word Climb','easy'],['pinpoint','Pinpoint','easy'],['namecountry','Name the Country','easy'],['namecity','Name the City','medium'],
];
const GS_DIFF = { easy: TOKENS.easy, medium: TOKENS.medium, hard: TOKENS.hard };
const nameOf = (id) => (GS_GAMES.find((x) => x[0] === id) || ['', id])[1];

if (!document.getElementById('gs2-css')) { const s = document.createElement('style'); s.id = 'gs2-css';
  s.textContent = '@keyframes gs2-pulse{0%{transform:translate(-50%,-50%) scale(1);opacity:.6}100%{transform:translate(-50%,-50%) scale(1.9);opacity:0}}@keyframes gs2-fade{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(s); }

// ── GRID (themed game picker, hybrid cards) ─────────────────────
function GSGrid({ onPick }) {
  const t = useT();
  return (
    <div style={{ padding: '16px 16px 22px' }}>
      <Micro c={t.accent}>The collection</Micro>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: t.text, marginTop: 3 }}>Pick a discipline</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
        {GS_GAMES.map(([g, name, diff]) => (
          <div key={g} className="as-tap" onClick={() => onPick(g)} style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ height: 84, background: `radial-gradient(120% 100% at 50% 0%, ${t.accent}12, ${t.bg})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ transform: 'scale(0.56)' }}><BoardPreview game={g} size={18} gap={3} t={t} /></div>
            </div>
            <div style={{ padding: '0 10px 10px', display: 'flex', alignItems: 'center', gap: 8, marginTop: -15, position: 'relative' }}>
              <div style={{ borderRadius: 11, boxShadow: '0 5px 14px rgba(0,0,0,0.45)' }}><GameIcon game={g} size={36} /></div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 13 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                <span style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: GS_DIFF[diff] }}>{diff}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STAGE PATH (winding, polished) ──────────────────────────────
function StagePath({ game, onBack, onPlay }) {
  const t = useT();
  const N = 14, W = 300, spacing = 70, top = 46, amp = 84, current = 8;
  const pts = Array.from({ length: N }, (_, i) => ({ x: W / 2 + amp * Math.sin(i * 0.8), y: top + i * spacing }));
  const height = top * 2 + (N - 1) * spacing;
  const line = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <div style={{ height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${t.border}` }}>
        <div className="as-tap" onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, background: t.surf, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={18} color={t.text} /></div>
        <GameIcon game={game} size={34} />
        <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: t.text }}>{nameOf(game)}</div><Micro s={8} st={{ marginTop: 2 }}>Stage {current + 1} of 100</Micro></div>
        <div style={{ textAlign: 'center' }}><Medal tier="silver" size={28} /></div>
      </div>
      <div style={{ padding: '10px 16px 4px' }}><div style={{ height: 6, background: t.surf2, borderRadius: 3, overflow: 'hidden' }}><div style={{ width: '9%', height: '100%', background: `linear-gradient(90deg, ${t.accent}, ${TOKENS.gold})` }} /></div></div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ position: 'relative', width: W, height, margin: '8px auto 30px' }}>
          <svg width={W} height={height} style={{ position: 'absolute', inset: 0 }}>
            <polyline points={line(pts)} fill="none" stroke={t.border} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2 12" />
            <polyline points={line(pts.slice(0, current + 1))} fill="none" stroke={t.accent} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2 12" />
          </svg>
          {pts.map((p, i) => {
            const done = i < current, cur = i === current, locked = i > current;
            const milestone = (i + 1) % 5 === 0;
            return (
              <div key={i} className={locked ? '' : 'as-tap'} onClick={() => !locked && onPlay(i + 1)} style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%,-50%)' }}>
                {cur && <div style={{ position: 'absolute', left: '50%', top: '50%', width: 54, height: 54, borderRadius: '50%', border: `2px solid ${t.accent}`, animation: 'gs2-pulse 1.6s ease-out infinite' }} />}
                <div style={{ width: cur ? 54 : 46, height: cur ? 54 : 46, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  background: cur ? t.accent : done ? t.surf : t.surf, border: `2px solid ${cur ? t.accent : done ? (milestone ? TOKENS.gold : t.accent) : t.border}` }}>
                  {done ? (milestone ? <Medal tier="gold" size={26} /> : <Icon name="check" size={18} color={t.accent} stroke={2.6} />)
                    : locked ? <Icon name="lock" size={15} color={t.faint} stroke={2} />
                    : <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, color: t.onAccent }}>{i + 1}</span>}
                </div>
                {cur && <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6, fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.12em', color: t.accent, whiteSpace: 'nowrap' }}>NOW</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── interactive Tango board (themed) ────────────────────────────
const T_INIT = [[1,0,0,0,0,2],[0,0,0,2,0,0],[0,0,0,0,1,0],[0,2,0,1,0,0],[0,0,0,0,0,1],[2,0,0,0,0,0]];
const T_LOCK = new Set(['0,0','0,5','1,3','2,4','3,1','3,3','4,5','5,0']);
function TangoLive({ t }) {
  const [grid, setGrid] = React.useState(() => T_INIT.map((r) => r.slice()));
  const cell = 44;
  const tap = (r, c) => { if (T_LOCK.has(`${r},${c}`)) return; setGrid((g) => g.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? (v + 1) % 3 : v)))); };
  return (
    <div style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 18, padding: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(6, ${cell}px)`, gap: 4 }}>
        {grid.map((row, r) => row.map((v, c) => { const lk = T_LOCK.has(`${r},${c}`); return (
          <div key={`${r},${c}`} className={lk ? '' : 'as-tap'} onClick={() => tap(r, c)} style={{ width: cell, height: cell, borderRadius: 11, background: lk ? t.surf2 : t.bg, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {v === 1 && <MiniSun s={26} />}{v === 2 && <MiniMoon s={26} />}
          </div>); }))}
      </div>
    </div>
  );
}

// ── MEMORY: collectible card deck (backs + flip + emblem faces) ──
const EMBLEMS = [
  { a: '#FF6B9D', b: '#C23B6E' }, { a: '#4FC3F7', b: '#1565C0' }, { a: '#FFD54F', b: '#F57F17' }, { a: '#FF8A80', b: '#D32F2F' },
  { a: '#80DEEA', b: '#00838F' }, { a: '#B388FF', b: '#5E35B1' }, { a: '#CE93D8', b: '#7B1FA2' }, { a: '#FFE082', b: '#FF8F00' },
];
function Sym({ i, s }) {
  const f = '#fff';
  const sym = [
    <path d="M12 3 L20 9 L12 21 L4 9 Z" fill={f} />,
    <g fill={f}><circle cx="12" cy="12" r="5.5" /><ellipse cx="12" cy="12" rx="9.5" ry="3.2" fill="none" stroke={f} strokeWidth="1.8" transform="rotate(-22 12 12)" /></g>,
    <path d="M12 2.5 L14.6 9 L21.5 9.4 L16 13.8 L17.8 20.5 L12 16.6 L6.2 20.5 L8 13.8 L2.5 9.4 L9.4 9 Z" fill={f} />,
    <path d="M12 20 C 4 14, 4 7, 9 8 C 11 8.4, 12 10.5, 12 11.2 C 12 10.5, 13 8.4, 15 8 C 20 7, 20 14, 12 20 Z" fill={f} />,
    <path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z" fill={f} />,
    <path d="M12 3 C 17 10, 18 13, 18 15 a6 6 0 0 1 -12 0 C 6 13, 7 10, 12 3 Z" fill={f} />,
    <g fill={f}>{[0,1,2,3,4,5].map((k)=>{const a=k*Math.PI/3;return <circle key={k} cx={12+Math.cos(a)*5.5} cy={12+Math.sin(a)*5.5} r="3" />;})}<circle cx="12" cy="12" r="3.2" fill="#fff" /></g>,
    <path d="M13 3L5 13h6l-1 8 8-10h-6z" fill={f} />,
  ][i % 8];
  return <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }}>{sym}</svg>;
}
function Emblem({ i, size }) {
  const e = EMBLEMS[i % 8];
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: size * 0.16, background: `linear-gradient(150deg, ${e.a}, ${e.b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 0 0 1.5px rgba(255,255,255,0.18)' }}>
      <Sym i={i} s={size * 0.5} />
    </div>
  );
}
function CardBack({ size, t }) {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: size * 0.16, background: `linear-gradient(150deg, ${t.accent}26, ${t.surf2})`, border: `1px solid ${t.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${t.accent}22 1px, transparent 1px)`, backgroundSize: '8px 8px', opacity: 0.5 }} />
      <NodeMark size={size * 0.42} bg="transparent" frame={false} tone={t.accent} toneDeep={t.accent} />
    </div>
  );
}
const FACE_IDS = [0, 1, 2, 3, 5, 6, 7, 8];
function MemoryCard({ i, emblem, faceUp, w, h, t, onTap }) {
  const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', borderRadius: w * 0.16, display: 'block' };
  return (
    <div className="as-tap" onClick={onTap} style={{ width: w, height: h, perspective: 700 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform .45s cubic-bezier(.3,.7,.3,1)', transform: faceUp ? 'rotateY(180deg)' : 'none' }}>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: w * 0.16, boxShadow: `inset 0 0 0 1px ${t.border}` }}><img src="assets/cards/back.png" alt="" style={imgStyle} /></div>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><img src={'assets/memory/face-' + FACE_IDS[emblem] + '.png'} alt="" style={imgStyle} /></div>
      </div>
    </div>
  );
}
function MemoryBoard({ t }) {
  const layout = [0,3,5,1, 6,2,0,7, 4,1,3,6, 2,7,5,4];
  const [flipped, setFlipped] = React.useState([2]);
  const [matched, setMatched] = React.useState(() => new Set([5, 12]));
  const busy = React.useRef(false);
  const tap = (i) => {
    if (busy.current || matched.has(i) || flipped.includes(i)) return;
    const nf = [...flipped, i];
    if (nf.length >= 2) {
      setFlipped(nf.slice(-2));
      const [a, b] = nf.slice(-2);
      if (layout[a] === layout[b]) { setMatched((m) => new Set([...m, a, b])); setFlipped([]); }
      else { busy.current = true; setTimeout(() => { setFlipped([]); busy.current = false; }, 750); }
    } else setFlipped(nf);
  };
  const w = 70, h = 84;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Micro s={8} c={t.muted}>Pairs {matched.size / 2} / 8</Micro>
        <Micro s={8} c={t.accent}>Tap to flip</Micro>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(4, ${w}px)`, gap: 8 }}>
        {layout.map((em, i) => <MemoryCard key={i} i={i} emblem={em} faceUp={flipped.includes(i) || matched.has(i)} w={w} h={h} t={t} onTap={() => tap(i)} />)}
      </div>
    </div>
  );
}

// ── NAME THE CITY / COUNTRY (educational guess + facts reveal) ──
const NAME_DATA = {
  namecity: { q: 'Which city is this?', answer: 'Kyoto', slot: 'guess-city-kyoto', sub: 'Japan', photo: 'assets/places/kyoto.png',
    options: ['Lisbon', 'Kyoto', 'Cairo', 'Oslo'],
    facts: ['Japan’s capital for over 1,000 years', 'Home to 1,600+ Buddhist temples', 'Famous for spring cherry blossoms'] },
  namecountry: { q: 'Name this country', answer: 'Japan', slot: 'guess-country-japan', flag: 'jp', photo: 'assets/places/japan.png',
    options: ['Thailand', 'Japan', 'Peru', 'Norway'],
    facts: ['Made up of 14,000+ islands', 'Capital: Tokyo — the world’s largest metro', 'Home of the bullet train (Shinkansen)'] },
};
function Flag({ code, w = 30 }) {
  const h = w * 0.66;
  if (code === 'jp') return <svg width={w} height={h} viewBox="0 0 30 20" style={{ display: 'block', borderRadius: 3 }}><rect width="30" height="20" fill="#fff" /><circle cx="15" cy="10" r="5.5" fill="#BC002D" /></svg>;
  return null;
}
function NameGuess({ game, t }) {
  const d = NAME_DATA[game];
  const [picked, setPicked] = React.useState(null);
  const correct = picked === d.answer;
  const reset = () => setPicked(null);
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${t.border}`, position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        {React.createElement('image-slot', { id: d.slot, src: d.photo, shape: 'rect', style: { width: '100%', height: '172px', display: 'block' }, placeholder: game === 'namecity' ? 'City image' : 'Country image' })}
        {correct && d.flag && <div style={{ position: 'absolute', top: 10, right: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.4)', borderRadius: 4 }}><Flag code={d.flag} w={38} /></div>}
      </div>
      {!correct ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: t.text, textAlign: 'center', marginBottom: 12 }}>{d.q}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {d.options.map((o) => {
              const wrong = picked === o && o !== d.answer;
              return (
                <div key={o} className="as-tap" onClick={() => setPicked(o)} style={{ textAlign: 'center', padding: '13px 8px', borderRadius: 12, fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, background: wrong ? TOKENS.hard + '22' : t.surf, color: wrong ? TOKENS.hard : t.text, border: `1.5px solid ${wrong ? TOKENS.hard : t.border}` }}>{o}</div>
              );
            })}
          </div>
          {picked && !correct && <div style={{ textAlign: 'center', marginTop: 10, fontFamily: FONTS.body, fontSize: 12, color: TOKENS.hard }}>Not quite — try again.</div>}
        </div>
      ) : (
        <div style={{ marginTop: 16, background: `radial-gradient(120% 80% at 50% 0%, ${TOKENS.gold}14, ${t.surf})`, border: `1px solid ${t.border}`, borderRadius: 16, padding: 18, animation: 'gs2-fade .3s ease-out both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><Icon name="checkCircle" size={18} color={TOKENS.easy} stroke={2.2} /><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 20, color: t.text }}>{d.answer}</div>{d.sub && <span style={{ fontFamily: FONTS.body, fontSize: 12, color: t.muted }}>· {d.sub}</span>}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 8 }}><Icon name="lightbulb" size={12} color={TOKENS.gold} stroke={2} /><Micro s={8} c={TOKENS.gold}>Did you know?</Micro></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {d.facts.map((f, i) => <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><div style={{ width: 5, height: 5, borderRadius: 3, background: t.accent, marginTop: 6, flexShrink: 0 }} /><span style={{ fontFamily: FONTS.body, fontSize: 12.5, lineHeight: 1.5, color: t.text }}>{f}</span></div>)}
          </div>
          <div className="as-tap" onClick={reset} style={{ marginTop: 16, textAlign: 'center', background: t.accent, color: t.onAccent, fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, padding: '12px 0', borderRadius: 12 }}>Next · +180 XP</div>
        </div>
      )}
    </div>
  );
}

// ── PLAY (themed shell) ─────────────────────────────────────────
function GSPlay({ game, stage, onBack }) {
  const t = useT();
  const [xp, setXp] = React.useState(1000);
  const [secs, setSecs] = React.useState(0);
  React.useEffect(() => { const i = setInterval(() => { setSecs((s) => s + 1); setXp((x) => Math.max(560, x - 4)); }, 1000); return () => clearInterval(i); }, [game, stage]);
  const xpc = xp > 850 ? t.accent : xp > 680 ? TOKENS.gold : TOKENS.hard;
  const mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, '0');
  const footer = [['undo', 'Undo', t.text, false], ['lightbulb', 'Hint · 3', TOKENS.gold, false], ['check', 'Check', t.onAccent, true]];
  return (
    <div style={{ height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="as-tap" onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, background: t.surf, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={18} color={t.text} /></div>
          <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: t.text }}>{nameOf(game)}</div><Micro s={8} st={{ marginTop: 2 }}>Stage {stage}</Micro></div>
          <GameIcon game={game} size={30} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: xpc, fontVariantNumeric: 'tabular-nums', transition: 'color .4s' }}>{xp}</span><Micro s={8}>score · solve fast</Micro></div>
            <div style={{ height: 5, background: t.surf2, borderRadius: 3, marginTop: 6, overflow: 'hidden' }}><div style={{ width: ((xp - 560) / 440 * 100) + '%', height: '100%', background: xpc, transition: 'width 1s linear, background .4s' }} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: t.surf, border: `1px solid ${t.border}`, borderRadius: 9, padding: '6px 10px' }}><Icon name="clock" size={13} color={t.muted} stroke={2} /><span style={{ fontFamily: FONTS.mono, fontSize: 12, color: t.text }}>{mm}:{ss}</span></div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
        {game === 'tango'
          ? <TangoLive t={t} />
          : game === 'memory'
          ? <MemoryBoard t={t} />
          : (game === 'namecity' || game === 'namecountry')
          ? <NameGuess game={game} t={t} />
          : <div style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 18, padding: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BoardPreview game={game} size={36} gap={5} t={t} /></div>}
        {game !== 'tango' && game !== 'memory' && game !== 'namecity' && game !== 'namecountry' && <Micro s={8} c={t.faint} st={{ marginTop: 16 }}>Live board · Tango & Memory are the interactive demos</Micro>}
      </div>
      <div style={{ display: 'flex', gap: 9, padding: '12px 16px 18px', borderTop: `1px solid ${t.border}` }}>
        {footer.map(([ic, l, col, prim]) => (
          <div key={l} className="as-tap" style={{ flex: prim ? 1.4 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: prim ? t.accent : t.surf, border: `1px solid ${prim ? t.accent : t.border}`, borderRadius: 13, padding: '11px 0' }}>
            <Icon name={ic} size={19} color={col} stroke={2.2} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: prim ? t.onAccent : t.muted }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── APP (theme switcher + nav) ──────────────────────────────────
function GSApp() {
  const [theme, setTheme] = React.useState('dark');
  const [stack, setStack] = React.useState(['grid']);
  const [game, setGame] = React.useState('tango');
  const [stage, setStage] = React.useState(9);
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => { const fit = () => setScale(Math.min(1, (window.innerHeight - 150) / 812)); fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }, []);
  const t = makeT(theme, setTheme);
  const view = stack[stack.length - 1];
  const pop = () => setStack((s) => s.length > 1 ? s.slice(0, -1) : s);
  const screens = {
    grid: <GSGrid onPick={(g) => { setGame(g); setStack(['grid', 'path']); }} />,
    path: <StagePath game={game} onBack={pop} onPlay={(n) => { setStage(n); setStack(['grid', 'path', 'play']); }} />,
    play: <GSPlay game={game} stage={stage} onBack={pop} />,
  };
  const themes = [['dark', 'Dark'], ['light', 'Light'], ['paper', 'Paper']];
  const crumbs = { grid: ['Games'], path: ['Games', nameOf(game)], play: ['Games', nameOf(game), `Stage ${stage}`] };
  return (
    <TH.Provider value={t}>
      <div style={{ minHeight: '100vh', background: '#070809', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, padding: 16, gap: 14 }}>
        {/* theme switcher */}
        <div style={{ display: 'flex', gap: 6, background: '#14161B', border: '1px solid #2A2E37', borderRadius: 12, padding: 5 }}>
          {themes.map(([k, l]) => (<div key={k} className="as-tap" onClick={() => setTheme(k)} style={{ padding: '7px 18px', borderRadius: 8, fontFamily: FONTS.display, fontWeight: 700, fontSize: 12.5, background: theme === k ? TOKENS.cyan : 'transparent', color: theme === k ? '#06231f' : '#868D99' }}>{l}</div>))}
        </div>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}>
          <div style={{ width: 384, height: 812, background: '#000', borderRadius: 46, padding: 11, boxShadow: '0 40px 120px rgba(0,0,0,0.6), inset 0 0 0 2px #23262d' }}>
            <div style={{ width: '100%', height: '100%', background: t.bg, borderRadius: 36, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', zIndex: 20, pointerEvents: 'none' }}>
                <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: t.text }}>9:41</span>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 8, width: 96, height: 22, background: '#000', borderRadius: 12 }} />
                <Icon name="bolt" size={12} color={t.accent} stroke={2} fill />
              </div>
              <div style={{ position: 'absolute', inset: 0, paddingTop: 30 }} key={view + theme}><div style={{ height: '100%', animation: 'gs2-fade .26s ease-out both' }}>{screens[view]}</div></div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: FONTS.mono, fontSize: 11, color: '#5A606C' }}>
          {crumbs[view].map((c, i) => (<React.Fragment key={i}>{i > 0 && <Icon name="chevronRight" size={11} color="#3A3F49" />}<span style={{ color: i === crumbs[view].length - 1 ? TOKENS.cyan : '#5A606C' }}>{c}</span></React.Fragment>))}
        </div>
      </div>
    </TH.Provider>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<GSApp />);
