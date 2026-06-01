/* landing.jsx — Mind Element marketing page. Themeable (dark/light/paper).
   Reuses brandkit + icons + previews + app-screens-extra atoms (useT/makeT/TH/Card/Btn/Micro/SecHead).
   Phone mockups render the real app (dark internals) on any page theme. */
const Dk = TOKENS.theme.dark;
const headFont = (t) => (t.key === 'paper' ? FONTS.serif : FONTS.display);
const LP_GAMES = [
  ['tango','Tango','easy'],['memory','Memory','easy'],['queens','Queens','easy'],['sudoku','Mini Sudoku','medium'],
  ['zip','Zip','medium'],['flow','Flow','medium'],['bridges','Bridges','medium'],['kakuro','Kakuro','hard'],
  ['logicpath','Logic Path','medium'],['lightup','Light Up','medium'],['nonogram','Nonogram','hard'],['patternmatch','Pattern Match','easy'],
  ['patches','Patches','medium'],['2048','2048 Pro','medium'],['gravity','Gravity Sort','medium'],['hexmerge','Hex Merge','hard'],
  ['wordsling','Word Sling','easy'],['hearts','Hearts','medium'],['solitaire','Solitaire','easy'],['minesweeper','Minesweeper','hard'],
  ['wordclimb','Word Climb','easy'],['pinpoint','Pinpoint','easy'],['namecountry','Name the Country','easy'],['namecity','Name the City','medium'],
];
const LP_DIFF = { easy: TOKENS.easy, medium: TOKENS.medium, hard: TOKENS.hard };

// ── phone shell (dark app internals) ─────────────────────────────
function Phone({ children, w = 250, tilt = 0, z = 1, lift = 0 }) {
  const h = w * 2.04;
  return (
    <div style={{ width: w, height: h, background: '#000', borderRadius: w * 0.13, padding: w * 0.03, boxShadow: '0 30px 70px rgba(0,0,0,0.45), inset 0 0 0 1.5px #23262d', transform: `rotate(${tilt}deg) translateY(${lift}px)`, zIndex: z, flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', background: Dk.bg, borderRadius: w * 0.1, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', width: w * 0.26, height: 7, background: '#000', borderRadius: 5, zIndex: 5 }} />
        {children}
      </div>
    </div>
  );
}
const PMicro = ({ children, c, s = 8 }) => <div style={{ fontFamily: FONTS.mono, fontSize: s, letterSpacing: '0.16em', textTransform: 'uppercase', color: c || Dk.faint }}>{children}</div>;

function ScreenGrid() {
  return (
    <div style={{ padding: '26px 12px 12px', height: '100%' }}>
      <PMicro c={Dk.muted}>The collection</PMicro>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: Dk.text, marginTop: 3, marginBottom: 10 }}>All games</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {['tango','queens','flow','sudoku','minesweeper','hexmerge'].map((g) => (
          <div key={g} style={{ background: Dk.surf, border: `1px solid ${Dk.border}`, borderRadius: 11, overflow: 'hidden' }}>
            <div style={{ height: 50, background: `radial-gradient(120% 100% at 50% 0%, ${Dk.accent}12, ${Dk.bg})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><div style={{ transform: 'scale(0.4)' }}><BoardPreview game={g} size={18} gap={3} /></div></div>
            <div style={{ padding: '0 7px 7px', display: 'flex', alignItems: 'center', gap: 6, marginTop: -10 }}><div style={{ borderRadius: 8 }}><GameIcon game={g} size={26} /></div><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 9, color: Dk.text, paddingTop: 9 }}>{g[0].toUpperCase() + g.slice(1)}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ScreenCelebrate() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', background: 'radial-gradient(120% 70% at 50% 14%, #15233a, ' + Dk.bg + ' 62%)' }}>
      {[[24,60,TOKENS.cyan],[180,80,TOKENS.gold],[40,150,TOKENS.violet],[170,170,TOKENS.cyan],[110,40,TOKENS.gold]].map(([x,y,c],i)=><div key={i} style={{ position:'absolute', left:x, top:y, width:6, height:6, borderRadius:i%2?1:6, background:c, opacity:.85 }} />)}
      <div style={{ position: 'relative' }}><div style={{ position: 'absolute', inset: -18, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,194,75,0.22), transparent 70%)' }} /><img src="assets/sparky/celebrate.png" width="96" height="96" alt="Sparky celebrating" style={{ display: 'block' }} /></div>
      <PMicro c={TOKENS.gold} s={8}>Level up</PMicro>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, color: Dk.text, marginTop: 6 }}>Level 7</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 11, color: Dk.muted, marginTop: 2 }}>Tactician</div>
      <div style={{ width: '76%', marginTop: 16 }}><div style={{ height: 7, background: Dk.surf2, borderRadius: 4, overflow: 'hidden' }}><div style={{ width: '64%', height: '100%', background: `linear-gradient(90deg, ${TOKENS.cyan}, ${TOKENS.gold})` }} /></div></div>
    </div>
  );
}
function ScreenLeaders() {
  const rows = [['Mara K.','#FF8A4B',42,98230,'gold'],['devon_p','#FFE08A',31,64120,'silver'],['yuki.s','#43E0B0',26,51890,'bronze'],['you',null,7,3200,null]];
  return (
    <div style={{ padding: '26px 12px 12px', height: '100%' }}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: Dk.text }}>Leaderboard</div>
      <PMicro c={Dk.muted} s={7}>Your figure travels with you</PMicro>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        {rows.map((r, i) => { const ring = r[2] >= 25 ? TOKENS.violet : r[2] >= 10 ? TOKENS.gold : TOKENS.cyan; const you = r[0] === 'you';
          return (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: you ? TOKENS.cyan + '12' : Dk.surf, border: `1px solid ${you ? TOKENS.cyan + '55' : Dk.border}`, borderRadius: 10, padding: 7 }}>
            <div style={{ width: 14, textAlign: 'center', fontFamily: FONTS.display, fontWeight: 700, fontSize: 10, color: Dk.muted }}>{r[4] ? '' : i + 1}</div>
            {r[4] ? <Medal tier={r[4]} size={18} /> : null}
            <div style={{ width: 30, height: 30, borderRadius: '50%', padding: 2, background: `conic-gradient(${ring},${ring}88,${ring})` }}><div style={{ width: '100%', height: '100%', borderRadius: '50%', background: Dk.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{you ? <img src="assets/sparky/idle.png" width="22" height="22" alt="" /> : <QuantaMascot size={22} tone={r[1]} toneDeep={r[1]} />}</div></div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 10, color: Dk.text }}>{you ? 'oransch' : r[0]}</div><PMicro c={ring} s={6.5}>Lv {r[2]}</PMicro></div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 10, color: you ? TOKENS.cyan : Dk.text }}>{r[3].toLocaleString()}</div>
          </div>);
        })}
      </div>
    </div>
  );
}

// ── sections ─────────────────────────────────────────────────────
function Nav() {
  const t = useT();
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: t.bg + 'ee', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${t.border}` }}>
      <nav style={{ maxWidth: 1120, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14 }} aria-label="Primary">
        <NodeMark size={26} bg={t.surf2} tone={t.accent} toneDeep={t.accent} />
        <span style={{ fontFamily: headFont(t), fontWeight: 700, fontSize: 17, color: t.text }}>Mind Element</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 22, marginRight: 8 }} className="lp-navlinks">
          {['Games', 'Daily', 'Family', 'Pricing'].map((l) => <a key={l} href={'#' + l.toLowerCase()} style={{ fontFamily: FONTS.body, fontSize: 13.5, color: t.muted, textDecoration: 'none', fontWeight: 500 }}>{l}</a>)}
        </div>
        <ThemeToggle />
        <a href="#pricing" style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: t.onAccent, background: t.accent, padding: '9px 16px', borderRadius: 10, textDecoration: 'none' }}>Start free</a>
      </nav>
    </header>
  );
}
function ThemeToggle() {
  const t = useT();
  const opts = [['dark', 'D'], ['light', 'L'], ['paper', 'P']];
  return (
    <div style={{ display: 'flex', gap: 3, background: t.surf, border: `1px solid ${t.border}`, borderRadius: 9, padding: 3 }} role="group" aria-label="Theme">
      {opts.map(([k, l]) => <button key={k} onClick={() => t.setTheme(k)} title={k} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, background: t.key === k ? t.accent : 'transparent', color: t.key === k ? t.onAccent : t.muted }}>{l}</button>)}
    </div>
  );
}
function Hero() {
  const t = useT();
  return (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '60px 24px 40px', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 40, alignItems: 'center' }} className="lp-hero">
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${t.border}`, borderRadius: 20, padding: '6px 12px' }}><span style={{ width: 7, height: 7, borderRadius: 4, background: TOKENS.easy }} /><span style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: '0.16em', color: t.muted }}>LIVE · FREE TO START</span></div>
        <h1 style={{ fontFamily: headFont(t), fontWeight: 700, fontSize: 'clamp(44px, 6vw, 72px)', lineHeight: 0.98, color: t.text, letterSpacing: t.key === 'paper' ? '-0.01em' : '-0.03em', margin: '20px 0 0', fontStyle: t.key === 'paper' ? 'italic' : 'normal' }}>Sharper<br />every day.</h1>
        <p style={{ fontFamily: FONTS.body, fontSize: 17, lineHeight: 1.55, color: t.muted, maxWidth: 440, marginTop: 20 }}>24 precision logic games, 100 algorithmic stages each. Score faster, earn XP, build streaks, collect Sparky, and climb the leaderboard with your family.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <a href="#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: t.onAccent, background: t.accent, padding: '14px 22px', borderRadius: 12, textDecoration: 'none' }}>Start training free <Icon name="arrowRight" size={17} color={t.onAccent} stroke={2.4} /></a>
          <a href="#games" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: t.text, background: 'transparent', border: `1px solid ${t.border}`, padding: '14px 22px', borderRadius: 12, textDecoration: 'none' }}>See all 24 games</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 26 }}>
          <div style={{ display: 'flex' }}>{['#FF8A4B','#FFE08A','#43E0B0','#8E7CFF'].map((c,i)=><div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: t.surf, border: `2px solid ${t.bg}`, marginLeft: i?-8:0, display:'flex',alignItems:'center',justifyContent:'center' }}><QuantaMascot size={20} tone={c} toneDeep={c} /></div>)}</div>
          <span style={{ fontFamily: FONTS.body, fontSize: 12.5, color: t.muted }}>Loved by players everywhere</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="assets/marketing/hero.png" alt="Mind Element shown on three phones" style={{ width: '100%', maxWidth: 540, borderRadius: 22, display: 'block', filter: 'drop-shadow(0 30px 70px rgba(0,0,0,0.4))' }} />
      </div>
    </section>
  );
}
function Stats() {
  const t = useT();
  const s = [['24', 'Games'], ['2,400+', 'Stages'], ['0', 'Ads, ever'], ['Free', 'To start']];
  return (
    <section style={{ borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, background: t.surf }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {s.map(([n, l]) => <div key={l} style={{ textAlign: 'center' }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, color: t.text }}>{n}</div><div style={{ fontFamily: FONTS.mono, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.muted, marginTop: 4 }}>{l}</div></div>)}
      </div>
    </section>
  );
}
function SectionHead({ kicker, title }) {
  const t = useT();
  return (<div style={{ marginBottom: 30 }}><div style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.accent }}>{kicker}</div><h2 style={{ fontFamily: headFont(t), fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', color: t.text, margin: '10px 0 0', letterSpacing: '-0.02em', fontStyle: t.key === 'paper' ? 'italic' : 'normal' }}>{title}</h2></div>);
}
function How() {
  const t = useT();
  const steps = [['grid', 'Pick a discipline', '24 logic games, each with its own rhythm. Start free with any — no account needed.'], ['flame', 'Train daily', 'XP decays in real time — the faster you solve, the more you earn. Build a streak.'], ['crown', 'Level up & compete', 'Earn levels, unlock Sparky figures, and climb family & global leaderboards.']];
  return (
    <section id="games" style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px' }}>
      <SectionHead kicker="How it works" title="Three steps to sharper." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="lp-3col">
        {steps.map(([ic, h, p], i) => (
          <article key={h} style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: t.accent }}>0{i + 1}</span><div style={{ width: 40, height: 40, borderRadius: 11, background: t.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={20} color={t.accent} stroke={2} /></div></div>
            <h3 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 19, color: t.text, margin: '18px 0 8px' }}>{h}</h3>
            <p style={{ fontFamily: FONTS.body, fontSize: 13.5, lineHeight: 1.55, color: t.muted, margin: 0 }}>{p}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
function Audiences() {
  const t = useT();
  const a = [['The parent', 'Screen time worth defending', 'Structural logic and spatial reasoning, not scrolling. Grows with your child from first puzzles to advanced strategy.', 'Ages 8–80'], ['The professional', '3-minute cognitive reset', 'One game between meetings. Spatial reasoning resets working memory faster than scrolling social.', '~3 min / session'], ['The senior', 'Agility is a choice', 'Clinical logic layouts for daily use at any age. Accessibility mode scales touch targets, timers, contrast.', 'Accessibility mode']];
  return (
    <section style={{ background: t.surf2 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px' }}>
        <SectionHead kicker="Who trains here" title="One platform. Every generation." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="lp-3col">
          {a.map(([k, h, p, tag]) => (
            <article key={k} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 18, padding: 24 }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.accent }}>{k}</div>
              <h3 style={{ fontFamily: headFont(t), fontWeight: 700, fontSize: 21, color: t.text, margin: '12px 0 10px', fontStyle: t.key === 'paper' ? 'italic' : 'normal' }}>{h}</h3>
              <p style={{ fontFamily: FONTS.body, fontSize: 13.5, lineHeight: 1.55, color: t.muted, margin: '0 0 16px' }}>{p}</p>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.faint }}>{tag}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function Collection() {
  const t = useT();
  return (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px' }}>
      <SectionHead kicker="The collection" title="An evolving vault. One subscription." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {LP_GAMES.map(([g, name, diff]) => (
          <article key={g} style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 70, background: `radial-gradient(120% 100% at 50% 0%, ${t.accent}12, ${t.bg})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><div style={{ transform: 'scale(0.5)' }}><BoardPreview game={g} size={18} gap={3} t={t} /></div></div>
            <div style={{ padding: '0 11px 11px', display: 'flex', alignItems: 'center', gap: 8, marginTop: -14 }}><div style={{ borderRadius: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}><GameIcon game={g} size={38} /></div><div style={{ paddingTop: 12, minWidth: 0 }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 12.5, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div><span style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: LP_DIFF[diff] }}>{diff}</span></div></div>
          </article>
        ))}
      </div>
    </section>
  );
}
function Engagement() {
  const t = useT();
  const feats = [['crown', 'Levels & ranks', 'Every solve earns XP toward your next level and rank — Spark to Grandmaster.'], ['medal', 'Per-game mastery', 'Bronze to Diamond on all 24 games. A visible reason to go deep, not just wide.'], ['star', 'Collectible Sparky', 'Earn figures by leveling and hitting milestones — then wear them by your name.']];
  return (
    <section style={{ background: t.surf2 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="lp-hero">
        <div>
          <SectionHead kicker="Engagement" title="Progress you can feel." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {feats.map(([ic, h, p]) => (
              <div key={h} style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: t.bg, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={20} color={TOKENS.gold} stroke={2} fill={ic === 'star'} /></div>
                <div><h3 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: t.text, margin: '2px 0 4px' }}>{h}</h3><p style={{ fontFamily: FONTS.body, fontSize: 13, lineHeight: 1.5, color: t.muted, margin: 0 }}>{p}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Phone w={236}><ScreenCelebrate /></Phone></div>
      </div>
    </section>
  );
}
function LearnWorld() {
  const t = useT();
  return (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '8px 24px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center' }} className="lp-hero">
      <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${t.border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.28)' }}><img src="assets/places/kyoto.png" alt="Kyoto at golden hour" style={{ width: '100%', display: 'block' }} /></div>
      <div>
        <SectionHead kicker="Learn as you play" title="See the world, sharpen your mind." />
        <p style={{ fontFamily: FONTS.body, fontSize: 14.5, lineHeight: 1.6, color: t.muted, margin: '0 0 16px', maxWidth: 440 }}>Name the City and Name the Country turn geography into a game. Guess the place, then unlock real facts about it — a little smarter every round. Built for curious kids and the whole family.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['Stylized art for hundreds of places', 'Three fresh facts on every correct answer', 'Flags, capitals & landmarks worth remembering'].map((f) => <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="check" size={15} color={t.accent} stroke={2.6} /><span style={{ fontFamily: FONTS.body, fontSize: 13.5, color: t.text }}>{f}</span></div>)}
        </div>
      </div>
    </section>
  );
}
function Pricing() {
  const t = useT();
  const plans = [['Free', '$0', ['All 24 games', '5 plays / day', 'Global leaderboard'], false], ['Individual', '$2', ['Unlimited play', 'Every figure', 'Thousands of stages'], false], ['Family', '$5', ['Up to 3 profiles', 'Family leaderboard', 'Shared milestones'], true], ['Grand', '$10', ['Up to 7 profiles', 'One bill, all seats', 'Everything in Family'], false]];
  return (
    <section id="pricing" style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}><div style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.accent }}>Pricing</div><h2 style={{ fontFamily: headFont(t), fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', color: t.text, margin: '10px 0 8px', fontStyle: t.key === 'paper' ? 'italic' : 'normal' }}>Simple, honest pricing.</h2><p style={{ fontFamily: FONTS.body, fontSize: 14, color: t.muted, margin: 0 }}>Less than a coffee. Invest in the sharpest version of your household.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="lp-price">
        {plans.map(([n, pr, fe, pop]) => (
          <div key={n} style={{ position: 'relative', background: pop ? `linear-gradient(160deg, ${t.accent}1F, ${t.surf})` : t.surf, border: `1.5px solid ${pop ? t.accent : t.border}`, borderRadius: 18, padding: 22 }}>
            {pop && <div style={{ position: 'absolute', top: -10, left: 22, background: t.accent, color: t.onAccent, fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.12em', padding: '4px 9px', borderRadius: 6, textTransform: 'uppercase' }}>Most popular</div>}
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: t.text }}>{n}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, margin: '8px 0 16px' }}><span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 32, color: pop ? t.accent : t.text }}>{pr}</span><span style={{ fontFamily: FONTS.mono, fontSize: 9, color: t.muted }}>/mo</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>{fe.map((f) => <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="check" size={14} color={pop ? t.accent : TOKENS.easy} stroke={2.6} /><span style={{ fontFamily: FONTS.body, fontSize: 12.5, color: t.text }}>{f}</span></div>)}</div>
            <a href="#" style={{ display: 'block', textAlign: 'center', fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, padding: '11px 0', borderRadius: 11, textDecoration: 'none', background: pop ? t.accent : t.surf2, color: pop ? t.onAccent : t.text }}>{n === 'Free' ? 'Start free' : 'Start trial'}</a>
          </div>
        ))}
      </div>
    </section>
  );
}
const FAQS = [
  ['Do I need a credit card for the free plan?', 'No. The free plan is free forever — 5 plays a day across all 24 games, no card required.'],
  ['How does the XP and scoring work?', 'Each stage starts at 1,000 XP and decays in real time — the faster you solve, the more you keep. Hints cost a percentage; Practice mode removes all pressure.'],
  ['What are Sparky figures?', 'Collectible looks for your avatar, earned by leveling up and hitting milestones, displayed next to your name on every leaderboard.'],
  ['How does family pricing work?', 'Family Choice ($5/mo) covers up to 3 independent profiles with a shared family leaderboard; Grand Family ($10/mo) covers up to 7. One bill.'],
  ['Can I cancel anytime?', 'Yes — upgrade, downgrade or cancel anytime from Settings. Paid plans start with a 3-day free trial.'],
];
function FAQ() {
  const t = useT();
  const [open, setOpen] = React.useState(0);
  return (
    <section id="faq" style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}><h2 style={{ fontFamily: headFont(t), fontWeight: 700, fontSize: 'clamp(26px,3.4vw,36px)', color: t.text, margin: 0, fontStyle: t.key === 'paper' ? 'italic' : 'normal' }}>Common questions</h2></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FAQS.map(([q, a], i) => (
          <div key={i} onClick={() => setOpen(open === i ? -1 : i)} style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 14, padding: '16px 18px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><h3 style={{ flex: 1, fontFamily: FONTS.body, fontWeight: 600, fontSize: 14.5, color: t.text, margin: 0 }}>{q}</h3><Icon name={open === i ? 'close' : 'chevronRight'} size={16} color={t.faint} stroke={2} /></div>
            {open === i && <p style={{ fontFamily: FONTS.body, fontSize: 13.5, lineHeight: 1.6, color: t.muted, margin: '12px 0 0' }}>{a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
function Footer() {
  const t = useT();
  return (
    <footer style={{ borderTop: `1px solid ${t.border}`, background: t.surf }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <NodeMark size={24} bg={t.surf2} tone={t.accent} toneDeep={t.accent} />
        <span style={{ fontFamily: headFont(t), fontWeight: 700, fontSize: 16, color: t.text }}>Mind Element</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 20 }}>{['Privacy', 'Terms', 'Contact'].map((l) => <a key={l} href="#" style={{ fontFamily: FONTS.body, fontSize: 13, color: t.muted, textDecoration: 'none' }}>{l}</a>)}</div>
        <div style={{ fontFamily: headFont(t), fontStyle: t.key === 'paper' ? 'italic' : 'normal', fontWeight: 700, fontSize: 14, color: t.faint, width: '100%', marginTop: 8 }}>Sharper every day.</div>
      </div>
    </footer>
  );
}

function Landing() {
  const [theme, setTheme] = React.useState('paper');
  const t = makeT(theme, setTheme);
  React.useEffect(() => { document.body.style.background = t.bg; }, [t.bg]);
  return (
    <TH.Provider value={t}>
      <div style={{ background: t.bg, minHeight: '100vh', fontFamily: FONTS.body }}>
        <Nav /><main><Hero /><Stats /><How /><Audiences /><Collection /><LearnWorld /><Engagement /><Pricing /><FAQ /></main><Footer />
      </div>
    </TH.Provider>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<Landing />);
