/* rewards.jsx — Mind Element · Phase 2: gamification system (interactive).
   Account levels + per-game mastery + celebrations that scale to the moment,
   plus the redesigned stage-complete screen. Mobile-first, dark-led.
   No emoji — line icons only. Image-slots mark where bespoke (Gemini) art goes. */

const Sparky = QuantaMascot;
const D = TOKENS.theme.dark;

// Real Sparky art (sliced from the Gemini sheet, transparent PNGs)
function SparkyImg({ expr = 'idle', size = 120 }) {
  const map = { idle: 'idle', happy: 'happy', focused: 'focused', surprised: 'surprised', celebrate: 'celebrate', sleep: 'resting', resting: 'resting' };
  const f = map[expr] || 'idle';
  return <img src={'assets/sparky/' + f + '.png'} width={size} height={size} alt="Sparky" style={{ display: 'block', objectFit: 'contain' }} />;
}

// keyframes + base
if (!document.getElementById('me-rw-css')) {
  const s = document.createElement('style');
  s.id = 'me-rw-css';
  s.textContent = `
    @keyframes me-fall { 0%{transform:translateY(-10px) rotate(0);opacity:1} 85%{opacity:1} 100%{transform:translateY(860px) rotate(540deg);opacity:0} }
    @keyframes me-pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
    @keyframes me-fadeup { 0%{transform:translateY(14px);opacity:0} 100%{transform:translateY(0);opacity:1} }
    @keyframes me-slidedown { 0%{transform:translateY(-120%);opacity:0} 12%{transform:translateY(0);opacity:1} 88%{transform:translateY(0);opacity:1} 100%{transform:translateY(-120%);opacity:0} }
    @keyframes me-ring { 0%{transform:scale(.8);opacity:.5} 100%{transform:scale(1.6);opacity:0} }
    .me-tap{cursor:pointer;transition:transform .12s,filter .12s,background .15s} .me-tap:active{transform:scale(.97)}
    image-slot{--is-bg:#1D2027;border-radius:14px;overflow:hidden}
  `;
  document.head.appendChild(s);
}

// ── helpers ──────────────────────────────────────────────────────
function useCountUp(target, run, dur = 950) {
  const [v, setV] = React.useState(run ? 0 : target);
  React.useEffect(() => {
    if (!run) { setV(target); return; }
    let raf; const t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / dur); setV(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return v;
}
// Medal, TIER_COLORS, starPath now live in brandkit.jsx (shared by both prototypes).
function Confetti({ n = 22 }) {
  const pieces = React.useMemo(() => Array.from({ length: n }, (_, i) => ({
    x: Math.random() * 100, d: 1.8 + Math.random() * 1.6, delay: Math.random() * 0.5,
    c: [TOKENS.cyan, TOKENS.gold, TOKENS.violet][i % 3], r: Math.random() * 360, sq: i % 2,
  })), [n]);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
      {pieces.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.x + '%', top: -10, width: 7, height: 7, background: p.c, borderRadius: p.sq ? 1 : 7, transform: `rotate(${p.r}deg)`, animation: `me-fall ${p.d}s ${p.delay}s ease-in forwards` }} />
      ))}
    </div>
  );
}

// ── small UI atoms ───────────────────────────────────────────────
const Micro = ({ children, c, s = 9.5, st }) => (<div style={{ fontFamily: FONTS.mono, fontSize: s, letterSpacing: '0.2em', textTransform: 'uppercase', color: c || D.faint, ...st }}>{children}</div>);
const Btn = ({ children, kind = 'primary', icon, onClick }) => {
  const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, padding: '14px 0', borderRadius: 14, width: '100%', border: 'none' };
  const styles = {
    primary: { ...base, background: TOKENS.cyan, color: '#06231f' },
    ghost: { ...base, background: D.surf2, color: D.text },
    quiet: { ...base, background: 'transparent', color: D.muted, fontSize: 13, padding: '10px 0' },
  };
  return (<div className="me-tap" style={styles[kind]} onClick={onClick}>{icon && <Icon name={icon} size={kind === 'quiet' ? 15 : 18} color={kind === 'primary' ? '#06231f' : (kind === 'ghost' ? D.text : D.muted)} stroke={2.2} fill={icon === 'play' ? true : 'none'} />}{children}</div>);
};
const StatCell = ({ icon, label, value, color }) => (
  <div style={{ flex: 1, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 13, padding: '12px 8px', textAlign: 'center' }}>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 7 }}><Icon name={icon} size={16} color={color || D.muted} stroke={2} /></div>
    <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: D.text }}>{value}</div>
    <Micro s={8} st={{ marginTop: 3 }}>{label}</Micro>
  </div>
);
function Bar({ pct, from = TOKENS.cyan, to = TOKENS.cyan, h = 8 }) {
  return (<div style={{ height: h, background: D.surf2, borderRadius: h / 2, overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: `linear-gradient(90deg, ${from}, ${to})`, borderRadius: h / 2, transition: 'width .9s cubic-bezier(.2,.7,.3,1)' }} /></div>);
}

// faux backgrounds (so overlays read as in-app moments)
function FauxMap() {
  return (<div style={{ position: 'absolute', inset: 0, padding: 20, opacity: 0.5 }}>
    <Micro s={9} st={{ marginBottom: 14 }}>Progress · 8%</Micro>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9 }}>
      {Array.from({ length: 35 }).map((_, i) => (<div key={i} style={{ aspectRatio: '1', borderRadius: 9, background: i < 11 ? D.surf2 : D.surf, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.mono, fontSize: 10, color: i < 11 ? D.muted : D.faint }}>{i + 1}</div>))}
    </div>
  </div>);
}
function FauxGame() {
  return (<div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,34px)', gap: 5 }}>
      {Array.from({ length: 36 }).map((_, i) => (<div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: D.surf2, border: `1px solid ${D.border}` }} />))}
    </div>
  </div>);
}

// ════════════════════════════════════════════════════════════════
// MOMENT 1 · Redesigned Stage Complete
// ════════════════════════════════════════════════════════════════
function StageComplete({ onBack, onNext }) {
  const xp = useCountUp(971, true);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: D.bg, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220, background: 'radial-gradient(120% 90% at 50% -10%, rgba(255,194,75,0.13), transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', position: 'relative', zIndex: 2 }}>
        <div className="me-tap" onClick={onBack}><Icon name="arrowLeft" size={22} color={D.muted} /></div>
        <div style={{ flex: 1, textAlign: 'center' }}><Micro c={D.faint}>Queens · Stage 12</Micro></div>
        <div style={{ width: 22 }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 22px 22px', position: 'relative', zIndex: 2 }}>
        {/* hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 6 }}>
          <div style={{ position: 'relative', animation: 'me-pop .5s ease-out both' }}>
            <SparkyImg size={108} expr="happy" />
            <div style={{ position: 'absolute', right: -6, bottom: 2 }}><Medal tier="gold" size={42} /></div>
          </div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 56, color: TOKENS.cyan, lineHeight: 1, marginTop: 14, fontVariantNumeric: 'tabular-nums' }}>{xp.toLocaleString()}</div>
          <Micro c={D.muted} st={{ marginTop: 6 }}>XP Earned</Micro>
        </div>
        {/* breakdown */}
        <div style={{ display: 'flex', gap: 7, marginTop: 20, animation: 'me-fadeup .5s .2s both' }}>
          {[['bolt', 'Base', '700'], ['clock', 'Speed', '+200'], ['check', 'Flawless', '+71']].map(([ic, l, v]) => (
            <div key={l} style={{ flex: 1, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 11, padding: '9px 6px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, alignItems: 'center' }}><Icon name={ic} size={12} color={TOKENS.cyan} stroke={2.2} /><span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: D.text }}>{v}</span></div>
              <Micro s={7.5} st={{ marginTop: 4 }}>{l}</Micro>
            </div>
          ))}
        </div>
        {/* stats */}
        <div style={{ display: 'flex', gap: 7, marginTop: 10, animation: 'me-fadeup .5s .3s both' }}>
          <StatCell icon="clock" label="Time" value="0:08" />
          <StatCell icon="lightbulb" label="Hints" value="0" color={TOKENS.easy} />
          <StatCell icon="medal" label="Medal" value="Gold" color={TOKENS.gold} />
        </div>
        {/* mastery sliver */}
        <div style={{ marginTop: 14, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 14, padding: 14, animation: 'me-fadeup .5s .4s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Medal tier="silver" size={26} />
            <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 12.5, color: D.text }}>Queens mastery</div></div>
            <Micro s={9} c={D.muted}>27 / 30</Micro>
          </div>
          <Bar pct={90} from={TIER_COLORS.silver[1]} to={TIER_COLORS.silver[0]} h={6} />
          <div style={{ fontFamily: FONTS.body, fontSize: 11, color: D.muted, marginTop: 8 }}>3 more stages to <b style={{ color: D.text }}>Silver</b>.</div>
        </div>
      </div>
      {/* footer CTAs */}
      <div style={{ padding: '12px 22px 22px', display: 'flex', flexDirection: 'column', gap: 9, position: 'relative', zIndex: 2 }}>
        <Btn kind="primary" icon="play" onClick={onNext}>Next stage</Btn>
        <div style={{ display: 'flex', gap: 9 }}>
          <div style={{ flex: 1 }}><Btn kind="ghost" icon="grid" onClick={onBack}>Map</Btn></div>
          <div style={{ flex: 1 }}><Btn kind="ghost" icon="share">Share</Btn></div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOMENT 2 · Mastery up (medium card)
// ════════════════════════════════════════════════════════════════
function MasteryUp({ onClose }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: D.bg }}>
      <FauxMap />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,9,12,0.78)', backdropFilter: 'blur(3px)' }} />
      <Confetti n={14} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 26 }}>
        <div style={{ width: '100%', background: D.surf, border: `1px solid ${D.border}`, borderRadius: 22, padding: '28px 24px', textAlign: 'center', animation: 'me-pop .45s ease-out both', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <Micro c={TIER_COLORS.silver[0]}>Mastery unlocked</Micro>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 6px', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, border: `2px solid ${TIER_COLORS.silver[0]}`, opacity: 0.4, animation: 'me-ring 1.4s ease-out infinite' }} />
            <Medal tier="silver" size={84} pop />
          </div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 26, color: D.text, marginTop: 8 }}>Silver · Queens</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: D.muted, marginTop: 6, lineHeight: 1.5 }}>30 stages cleared. You're halfway to <b style={{ color: TOKENS.gold }}>Gold</b> — and climbing the Queens leaderboard.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 16, background: D.surf2, borderRadius: 10, padding: '8px 12px' }}>
            <SparkyImg size={30} expr="happy" /><span style={{ fontFamily: FONTS.body, fontSize: 12, color: D.muted }}>+150 XP bonus</span>
          </div>
          <div style={{ marginTop: 18 }}><Btn kind="primary" onClick={onClose}>Nice</Btn></div>
          <div style={{ marginTop: 4 }}><Btn kind="quiet" icon="share">Share milestone</Btn></div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOMENT 3 · Achievement (medium card, with art slot)
// ════════════════════════════════════════════════════════════════
function Achievement({ onClose }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: D.bg }}>
      <FauxMap />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,9,12,0.78)', backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 26 }}>
        <div style={{ width: '100%', background: D.surf, border: `1px solid ${D.border}`, borderRadius: 22, padding: '26px 24px', textAlign: 'center', animation: 'me-pop .45s ease-out both', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <Micro c={TOKENS.gold}>Achievement unlocked</Micro>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 8px' }}>
            <div style={{ position: 'relative', width: 92, height: 92 }}>
              <image-slot id="achv-speed-demon" src="assets/badges/speed.png" shape="rounded" radius="20" style={{ width: '92px', height: '92px', display: 'block' }} placeholder="Drop badge art"></image-slot>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(160deg,#1A1206,#0B0C0F)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.0 }} />
              </div>
            </div>
          </div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: D.text, marginTop: 8 }}>Speed Demon</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: D.muted, marginTop: 5 }}>Cleared a stage in under 30 seconds.</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: 'rgba(255,194,75,0.12)', border: `1px solid rgba(255,194,75,0.3)`, borderRadius: 9, padding: '6px 12px' }}>
            <Icon name="bolt" size={13} color={TOKENS.gold} stroke={2.2} /><span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: TOKENS.gold }}>+250 XP</span>
          </div>
          <div style={{ marginTop: 18 }}><Btn kind="primary" onClick={onClose}>Collect</Btn></div>
          <div style={{ marginTop: 4 }}><Btn kind="quiet" icon="share">Share</Btn></div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOMENT 4 · Level up (full takeover)
// ════════════════════════════════════════════════════════════════
function LevelUp({ onClose }) {
  return (
    <div style={{ height: '100%', position: 'relative', background: 'radial-gradient(130% 80% at 50% 16%, #15233a, #0B0C0F 62%)', display: 'flex', flexDirection: 'column' }}>
      <Confetti n={26} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, position: 'relative', zIndex: 4 }}>
        <Micro c={TOKENS.gold} s={11}>Level up</Micro>
        <div style={{ position: 'relative', margin: '22px 0 8px' }}>
          <div style={{ position: 'absolute', inset: -26, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,194,75,0.22), transparent 70%)' }} />
          <img src="assets/sparky/gold.png" width="128" height="128" alt="Sparky" style={{ display: 'block' }} />
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 44, color: D.text, letterSpacing: '-0.02em', marginTop: 12 }}>Level 7</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 6 }}><Icon name="crown" size={15} color={TOKENS.gold} stroke={2} /><span style={{ fontFamily: FONTS.body, fontSize: 14, color: D.muted }}>Tactician</span></div>
        <div style={{ width: '78%', marginTop: 26 }}>
          <Bar pct={64} from={TOKENS.cyan} to={TOKENS.gold} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}><Micro s={9} c={D.faint}>3,200 XP</Micro><Micro s={9} c={D.faint}>5,000 → LVL 8</Micro></div>
        </div>
        <div style={{ width: '78%', marginTop: 18, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(47,230,224,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="users" size={17} color={TOKENS.cyan} stroke={2} /></div>
          <div style={{ flex: 1 }}><Micro s={8} c={TOKENS.cyan}>Unlocked</Micro><div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 12.5, color: D.text, marginTop: 2 }}>Family challenge invites</div></div>
          <Icon name="check" size={18} color={TOKENS.easy} stroke={2.4} />
        </div>
      </div>
      <div style={{ padding: '0 30px 30px', position: 'relative', zIndex: 4 }}><Btn kind="primary" onClick={onClose}>Continue</Btn></div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOMENT 5 · Century milestone (full takeover)
// ════════════════════════════════════════════════════════════════
function Century({ onClose }) {
  const n = useCountUp(100, true, 1100);
  return (
    <div style={{ height: '100%', position: 'relative', background: 'radial-gradient(130% 80% at 50% 18%, #2a1d3a, #0B0C0F 62%)', display: 'flex', flexDirection: 'column' }}>
      <Confetti n={30} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, position: 'relative', zIndex: 4 }}>
        <Micro c={TOKENS.violet} s={11}>Milestone</Micro>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 110, lineHeight: 1, color: D.text, marginTop: 10, letterSpacing: '-0.04em', background: `linear-gradient(180deg, ${TOKENS.violet}, ${TOKENS.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{n}</div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: D.text, marginTop: 4 }}>Century Club</div>
        <div style={{ fontFamily: FONTS.body, fontSize: 13.5, color: D.muted, marginTop: 8, textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>100 stages of Queens, solved. You've joined the top 6% of all players.</div>
        <div style={{ marginTop: 18 }}><img src="assets/sparky/violet.png" width="60" height="60" alt="Sparky" style={{ display: 'block' }} /></div>
      </div>
      <div style={{ padding: '0 30px 30px', display: 'flex', flexDirection: 'column', gap: 9, position: 'relative', zIndex: 4 }}>
        <Btn kind="primary" onClick={onClose}>Continue</Btn>
        <Btn kind="quiet" icon="share">Share the moment</Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOMENT 6 · Quick-win toast (small)
// ════════════════════════════════════════════════════════════════
function Toast({ onBack }) {
  const [show, setShow] = React.useState(true);
  React.useEffect(() => { const t = setTimeout(() => setShow(false), 2600); return () => clearTimeout(t); }, [show]);
  return (
    <div style={{ height: '100%', position: 'relative', background: D.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
        <div className="me-tap" onClick={onBack}><Icon name="arrowLeft" size={22} color={D.muted} /></div>
        <div style={{ flex: 1, textAlign: 'center' }}><Micro c={D.faint}>Pattern Match · Stage 2</Micro></div>
        <div style={{ width: 22 }} />
      </div>
      <FauxGame />
      {show && (
        <div style={{ position: 'absolute', top: 56, left: 18, right: 18, zIndex: 5, animation: 'me-slidedown 2.6s ease-in-out both' }}>
          <div style={{ background: D.surf, border: `1px solid ${D.border}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(84,208,106,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={18} color={TOKENS.easy} stroke={2.6} /></div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: D.text }}>Stage cleared</div><Micro s={8.5} c={D.muted} st={{ marginTop: 2 }}>Solved in 0:11 · no hints</Micro></div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: TOKENS.cyan }}>+120</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 24, left: 22, right: 22 }}>
        <Btn kind="ghost" icon="undo" onClick={() => setShow(true)}>Replay toast</Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOMENT 7 · Your Levels (account + per-game mastery overview)
// ════════════════════════════════════════════════════════════════
function Levels({ onBack, equipped }) {
  const eq = figById(equipped || 'cyan');
  const games = [
    ['queens', 'Queens', 'silver', 27, 30], ['tango', 'Tango', 'gold', 58, 60], ['sudoku', 'Sudoku', 'diamond', 100, 100],
    ['zip', 'Zip', 'bronze', 14, 30], ['flow', 'Flow', null, 4, 10], ['memory', 'Memory', 'bronze', 11, 30],
  ];
  const achv = [['target', 'Speed Demon', true], ['flame', '30-day streak', true], ['trophy', 'Century', false], ['grid', 'Completionist', false]];
  return (
    <div style={{ height: '100%', background: D.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
        <div className="me-tap" onClick={onBack}><Icon name="arrowLeft" size={22} color={D.muted} /></div>
        <div style={{ flex: 1, textAlign: 'center' }}><Micro c={D.faint}>Your levels</Micro></div>
        <div style={{ width: 22 }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 18px 24px' }}>
        {/* account level card */}
        <div style={{ background: 'linear-gradient(155deg, #16202f, #14161B)', border: `1px solid ${D.border}`, borderRadius: 18, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative', width: 66, height: 66, flexShrink: 0, borderRadius: '50%', padding: 3, background: `conic-gradient(${TOKENS.gold}, ${TOKENS.cyan}, ${TOKENS.gold})` }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: D.surf, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FigureSparky fig={eq} size={50} expr="happy" /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: D.text }}>Level 7</div><div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="crown" size={13} color={TOKENS.gold} stroke={2} /><span style={{ fontFamily: FONTS.body, fontSize: 13, color: TOKENS.gold, fontWeight: 600 }}>Tactician</span></div></div>
              <div style={{ marginTop: 10 }}><Bar pct={64} from={TOKENS.cyan} to={TOKENS.gold} h={7} /></div>
              <Micro s={9} c={D.faint} st={{ marginTop: 6 }}>3,200 / 5,000 XP to Level 8</Micro>
            </div>
          </div>
        </div>
        {/* mini stats */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <StatCell icon="flame" label="Streak" value="28" color={TOKENS.medium} />
          <StatCell icon="grid" label="Stages" value="314" />
          <StatCell icon="bolt" label="Best" value="971" color={TOKENS.cyan} />
        </div>
        {/* per-game mastery */}
        <div style={{ marginTop: 22, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Micro>Per-game mastery</Micro><Micro s={9} c={D.faint}>6 / 24</Micro>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {games.map(([g, name, tier, cur, max]) => (
            <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 12, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 13, padding: 11 }}>
              <GameIcon game={g} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13.5, color: D.text }}>{name}</span>{tier && <span style={{ fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: TIER_COLORS[tier][0], background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 5 }}>{tier}</span>}</div>
                <div style={{ marginTop: 7 }}><Bar pct={(cur / max) * 100} from={tier ? TIER_COLORS[tier][1] : D.faint} to={tier ? TIER_COLORS[tier][0] : D.muted} h={5} /></div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>{tier ? <Medal tier={tier} size={30} /> : <div style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px dashed ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="lock" size={13} color={D.faint} stroke={1.8} /></div>}<Micro s={8} c={D.faint} st={{ marginTop: 4 }}>{cur}/{max}</Micro></div>
            </div>
          ))}
        </div>
        {/* achievements */}
        <div style={{ marginTop: 22, marginBottom: 10 }}><Micro>Achievements</Micro></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {achv.map(([ic, label, on]) => (
            <div key={label} style={{ background: D.surf, border: `1px solid ${on ? 'rgba(255,194,75,0.3)' : D.border}`, borderRadius: 13, padding: '14px 4px', textAlign: 'center', opacity: on ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name={ic} size={20} color={on ? TOKENS.gold : D.faint} stroke={1.8} /></div>
              <Micro s={7} st={{ marginTop: 8, lineHeight: 1.3 }}>{label}</Micro>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COLLECTIBLE SPARKY FIGURES
// ════════════════════════════════════════════════════════════════
const FIGURES = [
  { id: 'cyan', name: 'Sparky', tone: TOKENS.cyan, deep: TOKENS.cyanDeep, owned: true, req: 'Starter' },
  { id: 'rookie', name: 'Rookie', tone: TOKENS.easy, deep: '#2E8F45', owned: true, req: 'First game played' },
  { id: 'ember', name: 'Ember', tone: TOKENS.medium, deep: '#B5732F', acc: 'flame', owned: true, req: '7-day streak' },
  { id: 'champion', name: 'Champion', tone: TOKENS.gold, deep: TOKENS.goldDeep, acc: 'crown', owned: true, req: 'Reach Level 10' },
  { id: 'prism', name: 'Prism', tone: TOKENS.violet, deep: TOKENS.violetDeep, acc: 'spark', owned: true, req: 'Try all 24 games' },
  { id: 'sage', name: 'Sage', tone: '#6E8BFF', deep: '#3A4FB0', acc: 'star', owned: false, req: '5 Diamond masteries' },
  { id: 'daredevil', name: 'Daredevil', tone: TOKENS.hard, deep: '#B5343C', acc: 'bolt', owned: false, req: 'Clear 50 Hard stages' },
  { id: 'noir', name: 'Noir', tone: '#5A626E', deep: '#2A2E37', acc: 'eye', owned: false, req: '50 night plays' },
  { id: 'aurora', name: 'Aurora', tone: '#43E0B0', deep: '#1C8E73', acc: 'spark', owned: false, req: 'Reach Level 25' },
  { id: 'laureate', name: 'Laureate', tone: '#FFE08A', deep: '#C8881A', acc: 'trophy', owned: false, req: 'Top 100 global' },
  { id: 'royal', name: 'Royal', tone: '#B583FF', deep: '#6A3FC0', acc: 'crown', owned: false, req: 'Family champion' },
  { id: 'legend', name: 'Legend', tone: '#FF8A4B', deep: '#C2521A', acc: 'flame', owned: false, req: 'Clear 1,000 stages' },
];
const figById = (id) => FIGURES.find((f) => f.id === id) || FIGURES[0];

function FigureSparky({ fig, size = 72, locked = false, expr = 'happy' }) {
  // the default 'cyan' figure uses the real Sparky art; tinted variants stay vector until art is generated
  if (!locked && fig.id === 'cyan') {
    return <div style={{ position: 'relative', width: size, height: size }}><SparkyImg expr={expr} size={size} /></div>;
  }
  const tone = locked ? '#3A3F49' : fig.tone;
  const deep = locked ? '#23262d' : fig.deep;
  const a = size * 0.36;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <Sparky size={size} expr={locked ? 'sleep' : expr} tone={tone} toneDeep={deep} glow={!locked} />
      {fig.acc && !locked && (
        <div style={{ position: 'absolute', top: -3, right: -3, width: a, height: a, borderRadius: '50%', background: D.surf, border: `1.5px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={fig.acc} size={a * 0.56} color={fig.tone} stroke={2.2} fill={fig.acc === 'star'} />
        </div>
      )}
      {locked && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: a, height: a, borderRadius: '50%', background: 'rgba(8,9,12,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="lock" size={a * 0.5} color={D.muted} stroke={2.2} /></div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOMENT · Sparky collection (earn + equip figures)
// ════════════════════════════════════════════════════════════════
function Collection({ equipped, setEquipped, onBack }) {
  const eq = figById(equipped);
  const ownedCount = FIGURES.filter((f) => f.owned).length;
  return (
    <div style={{ height: '100%', background: D.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
        <div className="me-tap" onClick={onBack}><Icon name="arrowLeft" size={22} color={D.muted} /></div>
        <div style={{ flex: 1, textAlign: 'center' }}><Micro c={D.faint}>Sparky collection</Micro></div>
        <div style={{ width: 22 }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 24px' }}>
        {/* equipped hero */}
        <div style={{ background: `radial-gradient(120% 80% at 50% 0%, ${eq.tone}22, transparent 60%), ${D.surf}`, border: `1px solid ${D.border}`, borderRadius: 20, padding: '22px 18px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><FigureSparky fig={eq} size={104} expr="celebrate" /></div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: D.text, marginTop: 12 }}>{eq.name}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, background: 'rgba(47,230,224,0.12)', borderRadius: 8, padding: '4px 10px' }}><Icon name="check" size={12} color={TOKENS.cyan} stroke={2.6} /><span style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: '0.12em', color: TOKENS.cyan }}>EQUIPPED · SHOWN BY YOUR NAME</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 2px 12px' }}>
          <Micro>All figures</Micro><Micro s={9} c={D.faint}>{ownedCount} / {FIGURES.length} earned</Micro>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {FIGURES.map((f) => {
            const isEq = f.id === equipped;
            return (
              <div key={f.id} className={f.owned ? 'me-tap' : ''} onClick={() => f.owned && setEquipped(f.id)}
                style={{ background: D.surf, border: `1.5px solid ${isEq ? f.tone : D.border}`, borderRadius: 15, padding: '14px 6px 11px', textAlign: 'center', opacity: f.owned ? 1 : 0.92 }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><FigureSparky fig={f} size={58} locked={!f.owned} expr="idle" /></div>
                <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 11.5, color: f.owned ? D.text : D.muted, marginTop: 9 }}>{f.owned ? f.name : 'Locked'}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: '0.06em', color: isEq ? f.tone : D.faint, marginTop: 4, lineHeight: 1.35, minHeight: 18 }}>{isEq ? 'EQUIPPED' : (f.owned ? 'TAP TO EQUIP' : f.req.toUpperCase())}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOMENT · Leaderboard (figure + level by your name)
// ════════════════════════════════════════════════════════════════
function ringFor(level) { return level >= 25 ? TOKENS.violet : level >= 10 ? TOKENS.gold : TOKENS.cyan; }
function Leaderboard({ equipped }) {
  const [tab, setTab] = React.useState('global');
  const rows = [
    { rank: 1, name: 'Mara K.', fig: 'legend', lvl: 42, rank_name: 'Grandmaster', xp: 98230, stages: 612 },
    { rank: 2, name: 'devon_p', fig: 'laureate', lvl: 31, rank_name: 'Master', xp: 64120, stages: 488 },
    { rank: 3, name: 'yuki.s', fig: 'aurora', lvl: 26, rank_name: 'Master', xp: 51890, stages: 401 },
    { rank: 4, name: 'oransch', fig: equipped, lvl: 7, rank_name: 'Tactician', xp: 3200, stages: 314, you: true },
    { rank: 5, name: 'a_lopez', fig: 'champion', lvl: 12, rank_name: 'Sharp', xp: 2980, stages: 208 },
    { rank: 6, name: 'priya88', fig: 'ember', lvl: 9, rank_name: 'Adept', xp: 2410, stages: 176 },
  ];
  const rankMedal = { 1: 'gold', 2: 'silver', 3: 'bronze' };
  return (
    <div style={{ height: '100%', background: D.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 18px 8px' }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: D.text }}>Leaderboard</div>
        <Micro s={9} c={D.muted} st={{ marginTop: 4 }}>Your figure & level travel with your name</Micro>
        <div style={{ display: 'flex', gap: 6, marginTop: 14, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 11, padding: 4 }}>
          {[['global', 'Global'], ['family', 'Family']].map(([k, l]) => (
            <div key={k} className="me-tap" onClick={() => setTab(k)} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, background: tab === k ? D.surf2 : 'transparent', fontFamily: FONTS.body, fontWeight: 600, fontSize: 12.5, color: tab === k ? D.text : D.muted }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 18px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r) => {
          const f = figById(r.fig);
          const ring = ringFor(r.lvl);
          return (
            <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 12, background: r.you ? 'rgba(47,230,224,0.07)' : D.surf, border: `1px solid ${r.you ? 'rgba(47,230,224,0.4)' : D.border}`, borderRadius: 14, padding: '11px 13px' }}>
              <div style={{ width: 22, textAlign: 'center', flexShrink: 0 }}>{rankMedal[r.rank] ? <Medal tier={rankMedal[r.rank]} size={24} /> : <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: D.muted }}>{r.rank}</span>}</div>
              <div style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, padding: 3, background: `conic-gradient(${ring}, ${ring}99, ${ring})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: D.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FigureSparky fig={f} size={36} expr="idle" /></div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13.5, color: D.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>{r.you && <span style={{ fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.1em', color: TOKENS.cyan, border: `1px solid ${TOKENS.cyan}55`, borderRadius: 4, padding: '1px 4px' }}>YOU</span>}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}><span style={{ fontFamily: FONTS.mono, fontSize: 8.5, letterSpacing: '0.08em', color: ring }}>LV {r.lvl}</span><span style={{ fontFamily: FONTS.body, fontSize: 10.5, color: D.muted }}>{r.rank_name}</span></div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: r.you ? TOKENS.cyan : D.text }}>{r.xp.toLocaleString()}</div>
                <Micro s={7.5} c={D.faint} st={{ marginTop: 2 }}>{r.stages} stages</Micro>
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 6, background: D.surf, border: `1px dashed ${D.border}`, borderRadius: 13, padding: 13, display: 'flex', alignItems: 'center', gap: 11 }}>
          <Icon name="gift" size={18} color={TOKENS.violet} stroke={2} />
          <div style={{ fontFamily: FONTS.body, fontSize: 11.5, color: D.muted, lineHeight: 1.45 }}>Climb to <b style={{ color: D.text }}>Top 100</b> to unlock the <b style={{ color: '#FFE08A' }}>Laureate</b> figure.</div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MENU
// ════════════════════════════════════════════════════════════════
function Menu({ go, equipped }) {
  const eq = figById(equipped);
  const items = [
    ['stage', 'checkCircle', 'Stage complete', 'The redesigned reward screen', 'CORE', TOKENS.cyan],
    ['collection', 'grid', 'Sparky collection', 'Earn & equip figures', 'NEW', TOKENS.violet],
    ['leaderboard', 'chart', 'Leaderboard', 'Your figure by your name', '', D.muted],
    ['toast', 'bolt', 'Quick win', 'Lightweight XP toast', 'S', D.muted],
    ['mastery', 'medal', 'Mastery up', 'Per-game tier unlock', 'M', TIER_COLORS.silver[0]],
    ['achv', 'target', 'Achievement', 'Badge unlocked', 'M', TOKENS.gold],
    ['level', 'crown', 'Level up', 'Account level + rank', 'L', TOKENS.gold],
    ['century', 'trophy', 'Century', '100-stage milestone', 'L', TOKENS.violet],
    ['profile', 'user', 'Your levels', 'Account + mastery overview', '', D.muted],
  ];
  return (
    <div style={{ height: '100%', background: D.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 22px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><FigureSparky fig={eq} size={38} expr="happy" /><div><Micro c={TOKENS.cyan}>Phase 2 · interactive</Micro><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: D.text, marginTop: 2 }}>Sparky & rewards</div></div></div>
        <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: D.muted, marginTop: 10, lineHeight: 1.5 }}>Tap a moment to preview it. Celebrations scale to the achievement — a toast for a quick win, a card for a tier, a full takeover for a level.</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 22px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map(([k, ic, t, sub, tag, c]) => (
          <div key={k} className="me-tap" onClick={() => go(k)} style={{ display: 'flex', alignItems: 'center', gap: 13, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 14, padding: '14px 15px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: D.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={19} color={c} stroke={2} /></div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 14, color: D.text }}>{t}</div><div style={{ fontFamily: FONTS.body, fontSize: 11.5, color: D.muted, marginTop: 1 }}>{sub}</div></div>
            {tag && <div style={{ fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.1em', color: c, border: `1px solid ${c}40`, borderRadius: 6, padding: '3px 6px' }}>{tag}</div>}
            <Icon name="chevronRight" size={17} color={D.faint} stroke={2} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// APP + PHONE SHELL
// ════════════════════════════════════════════════════════════════
function App() {
  const [view, setView] = React.useState('menu');
  const [equipped, setEquipped] = React.useState('cyan');
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 70) / 812));
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);
  const back = () => setView('menu');
  const screens = {
    menu: <Menu go={setView} equipped={equipped} />,
    stage: <StageComplete onBack={back} onNext={() => setView('level')} />,
    toast: <Toast onBack={back} />,
    mastery: <MasteryUp onClose={back} />,
    achv: <Achievement onClose={back} />,
    level: <LevelUp onClose={back} />,
    century: <Century onClose={back} />,
    profile: <Levels onBack={back} equipped={equipped} />,
    collection: <Collection equipped={equipped} setEquipped={setEquipped} onBack={back} />,
    leaderboard: <Leaderboard equipped={equipped} />,
  };
  return (
    <div style={{ minHeight: '100vh', background: '#070809', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, padding: 16 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <div style={{ width: 384, height: 812, background: '#000', borderRadius: 46, padding: 11, boxShadow: '0 40px 120px rgba(0,0,0,0.6), inset 0 0 0 2px #23262d' }}>
          <div style={{ width: '100%', height: '100%', background: D.bg, borderRadius: 36, overflow: 'hidden', position: 'relative' }}>
            {/* status bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', zIndex: 20, pointerEvents: 'none' }}>
              <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: D.text }}>9:41</span>
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 8, width: 96, height: 22, background: '#000', borderRadius: 12 }} />
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}><Icon name="bolt" size={12} color={TOKENS.cyan} stroke={2} fill /><span style={{ fontFamily: FONTS.mono, fontSize: 10, color: D.muted }}>5/5</span></div>            </div>
            <div style={{ position: 'absolute', inset: 0, paddingTop: 30 }} key={view}>
              <div style={{ height: '100%', animation: 'me-fadeup .28s ease-out both' }}>{screens[view]}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
