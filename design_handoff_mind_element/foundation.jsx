/* foundation.jsx — Mind Element · Brand & Mascot Foundation canvas.
   Uses DesignCanvas + brandkit primitives. Mobile-first, dark-led,
   themeable (dark/light/paper). */

const D = TOKENS.theme.dark;

// ── shared atoms ─────────────────────────────────────────────────
const Micro = ({ children, c, mb }) => (
  <div style={{ fontFamily: FONTS.mono, fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: c || D.faint, marginBottom: mb || 0 }}>{children}</div>
);
const H = ({ children, c, s = 22, mb }) => (
  <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: s, letterSpacing: '-0.02em', color: c || D.text, marginBottom: mb || 0, lineHeight: 1.1 }}>{children}</div>
);
const Body = ({ children, c, s = 13, mt }) => (
  <div style={{ fontFamily: FONTS.body, fontSize: s, lineHeight: 1.55, color: c || D.muted, marginTop: mt || 0 }}>{children}</div>
);
const Pad = ({ children, p = 26, bg = D.bg, style }) => (
  <div style={{ padding: p, background: bg, height: '100%', boxSizing: 'border-box', ...style }}>{children}</div>
);

// ── DIRECTION ────────────────────────────────────────────────────
function Approach() {
  const Row = ({ k, children }) => (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: D.accent, flexShrink: 0, width: 22, fontWeight: 700 }}>{k}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
  return (
    <Pad p={30}>
      <Micro c={D.accent} mb={14}>Mind Element · brand foundation</Micro>
      <H s={30} mb={10}>The plan, in one frame.</H>
      <Body s={13.5} c={D.muted}>You said yes to everything — so I'm sequencing it. This canvas locks the <b style={{ color: D.text }}>brand layer</b> first because every celebration, level badge and screen depends on it. React to these, we lock a direction, then I build the gamification flows and screens as a real prototype.</Body>
      <div style={{ height: 1, background: D.border, margin: '22px 0' }} />
      <Row k="01"><H s={15} mb={3}>Keep the cyan, make it ownable</H><Body s={12.5}>Electric cyan stays the signature. I've paired it with a <b style={{ color: TOKENS.violet }}>violet</b> (the "mind") and a <b style={{ color: TOKENS.gold }}>gold</b> reserved for rewards — so a celebration finally <i>looks</i> different from the UI.</Body></Row>
      <Row k="02"><H s={15} mb={3}>One mascot, four ways to draw it</H><Body s={12.5}>The mascot is a living puzzle <i>cell</i> — the atom every game is built from. On-brand, ageless, and simple enough to animate. Four executions to pick from.</Body></Row>
      <Row k="03"><H s={15} mb={3}>Themeable by token</H><Body s={12.5}>Dark, Light and Paper all render from the same variables — no separate designs to maintain.</Body></Row>
      <Row k="04"><H s={15} mb={3}>Tone: warm-premium (≈55)</H><Body s={12.5}>Confident and clean enough to pay for; genuinely joyful at the moments that matter.</Body></Row>
    </Pad>
  );
}

function Naming() {
  const names = [
    ['Quanta', 'a unit of mind', true],
    ['Pip', 'small, friendly, daily', false],
    ['Echo', 'patterns that return', false],
    ['Nodi', 'a node that thinks', false],
    ['Spark', 'the flash of solving', false],
  ];
  return (
    <Pad p={28}>
      <Micro c={D.accent} mb={14}>Working names</Micro>
      <H s={22} mb={6}>What do we call it?</H>
      <Body s={12.5} mt={0}>Shortlist for the mascot. Tell me which to use across celebrations & onboarding.</Body>
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {names.map(([n, d, hot]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '12px 14px', background: hot ? 'rgba(47,230,224,0.08)' : D.surf, border: `1px solid ${hot ? 'rgba(47,230,224,0.35)' : D.border}`, borderRadius: 12 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: hot ? D.accent : D.text }}>{n}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, color: D.muted }}>{d}</div>
            {hot && <div style={{ marginLeft: 'auto', fontFamily: FONTS.mono, fontSize: 8.5, letterSpacing: '0.15em', color: D.accent }}>MY PICK</div>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <Micro mb={10}>The line</Micro>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 19, color: D.text, letterSpacing: '-0.02em' }}>Sharper every day.</div>
        <Body s={12} mt={4}>Already yours — I'd keep it. The mascot makes it feel earned.</Body>
      </div>
    </Pad>
  );
}

// ── PALETTE ──────────────────────────────────────────────────────
function MiniApp({ t }) {
  return (
    <div style={{ background: t.bg, borderRadius: 14, padding: 12, border: `1px solid ${t.border}` }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <NodeMark size={22} bg={t.surf2} tone={t.accent} toneDeep={t.accent} />
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 12, color: t.text }}>Mind Element</div>
        <div style={{ marginLeft: 'auto', fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: t.accent, background: t.surf, padding: '3px 7px', borderRadius: 6 }}>971 XP</div>
      </div>
      {/* game tile row */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
        {['tango', 'zip', 'flow'].map((g) => (
          <div key={g} style={{ flex: 1, background: t.surf, borderRadius: 10, padding: 7, border: `1px solid ${t.border}` }}>
            <GameIcon game={g} size={34} />
            <div style={{ fontFamily: FONTS.body, fontSize: 8.5, fontWeight: 600, color: t.text, marginTop: 5, textTransform: 'capitalize' }}>{g}</div>
          </div>
        ))}
      </div>
      {/* primary button */}
      <div style={{ background: t.accent, color: t.bg, fontFamily: FONTS.display, fontWeight: 700, fontSize: 11, textAlign: 'center', padding: '9px 0', borderRadius: 9 }}>Start training</div>
    </div>
  );
}
function PaletteCard({ tk, name }) {
  const t = TOKENS.theme[tk];
  const toks = [['bg', t.bg], ['surface', t.surf], ['surface-2', t.surf2], ['border', t.border], ['text', t.text], ['muted', t.muted], ['accent', t.accent]];
  return (
    <Pad p={20} bg={t.surf2}>
      <Micro c={t.muted} mb={12}>{name}</Micro>
      <MiniApp t={t} />
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {toks.map(([n, v]) => <Swatch key={n} color={v} name={n} val={v} text={t.text} />)}
      </div>
    </Pad>
  );
}
function SemanticCard() {
  const group = (title, items) => (
    <div style={{ marginBottom: 18 }}>
      <Micro mb={10}>{title}</Micro>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map(([c, n, v]) => <Swatch key={n} color={c} name={n} val={v} />)}
      </div>
    </div>
  );
  return (
    <Pad p={24}>
      {group('Brand', [[TOKENS.cyan, 'Cyan · focus', '#2FE6E0'], [TOKENS.violet, 'Violet · mind', '#8E7CFF'], [TOKENS.gold, 'Gold · reward', '#FFC24B']])}
      {group('Difficulty', [[TOKENS.easy, 'Easy', '#54D06A'], [TOKENS.medium, 'Medium', '#F5A623'], [TOKENS.hard, 'Hard', '#FF5C66']])}
      <div style={{ background: D.surf, border: `1px solid ${D.border}`, borderRadius: 12, padding: 14 }}>
        <Body s={11.5} c={D.muted}><b style={{ color: TOKENS.gold }}>Gold is sacred</b> — it appears <i>only</i> for achievements, level-ups and medals, never in chrome. That's what makes a reward feel like one.</Body>
      </div>
    </Pad>
  );
}

// ── TYPE ─────────────────────────────────────────────────────────
function TypeCard() {
  const row = (label, font, weight, sample, size, extra) => (
    <div style={{ marginBottom: 20 }}>
      <Micro mb={8}>{label}</Micro>
      <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, color: D.text, lineHeight: 1.1, letterSpacing: extra || 'normal' }}>{sample}</div>
    </div>
  );
  return (
    <Pad p={30}>
      <Micro c={D.accent} mb={14}>Type system</Micro>
      <div style={{ display: 'flex', gap: 30 }}>
        <div style={{ flex: 1 }}>
          {row('Display · Space Grotesk 700', FONTS.display, 700, 'Sharper every day.', 32, '-0.02em')}
          {row('Numerals · the XP voice', FONTS.display, 700, '971 · Lv 7 · 28-day streak', 22)}
          {row('Body · DM Sans', FONTS.body, 400, 'One queen per row, column and region. Tap once to mark, twice to place.', 14)}
          <div style={{ marginBottom: 4 }}>
            <Micro mb={8}>Micro-label · Space Mono</Micro>
            <div style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.2em', color: D.muted }}>FEATURED TODAY · STAGE 1/100</div>
          </div>
        </div>
        <div style={{ width: 200, borderLeft: `1px solid ${D.border}`, paddingLeft: 24 }}>
          <Micro mb={10}>Paper headline option</Micro>
          <div style={{ fontFamily: FONTS.serif, fontWeight: 700, fontStyle: 'italic', fontSize: 26, color: D.text, lineHeight: 1.05 }}>An Evolving Vault.</div>
          <Body s={12} mt={10}>Spectral (serif) carries the editorial Paper theme; Space Grotesk leads Dark & Light. Same hierarchy, two voices.</Body>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['Display', '32 / 24 / 19'], ['Body', '15 / 14 / 13'], ['Micro', '11 / 10']].map(([a, b]) => (
              <div key={a} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.mono, fontSize: 10.5, color: D.muted }}><span>{a}</span><span style={{ color: D.faint }}>{b}</span></div>
            ))}
          </div>
        </div>
      </div>
    </Pad>
  );
}

// ── MASCOT ───────────────────────────────────────────────────────
function MascotCard({ Comp, expr, name, tagline, why, panel }) {
  return (
    <Pad p={24}>
      <div style={{ background: panel || 'radial-gradient(circle at 50% 38%, rgba(47,230,224,0.13), transparent 65%)', borderRadius: 16, padding: '28px 0 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${D.border}` }}>
        <Comp size={150} expr={expr} />
        <div style={{ display: 'flex', gap: 14, marginTop: 22 }}>
          {['happy', 'focused', 'surprised'].map((e) => <Comp key={e} size={44} expr={e} />)}
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <H s={22} mb={3}>{name}</H>
        <div style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: '0.15em', color: D.accent, textTransform: 'uppercase', marginBottom: 10 }}>{tagline}</div>
        <Body s={12.5}>{why}</Body>
      </div>
    </Pad>
  );
}

function Expressions() {
  const set = [['idle', 'Idle'], ['happy', 'Happy'], ['focused', 'Focused'], ['surprised', 'Surprised'], ['celebrate', 'Celebrate'], ['sleep', 'Resting']];
  return (
    <Pad p={28}>
      <Micro c={D.accent} mb={6}>One mascot, a whole emotional range</Micro>
      <H s={20} mb={4}>Expressions drive the moments.</H>
      <Body s={12.5} mt={0}>Same shape, swappable eyes. <i>Focused</i> while you play, <i>celebrate</i> on a clear, <i>resting</i> on empty states — built from primitives so each is one cheap animation.</Body>
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
        {set.map(([e, l]) => (
          <div key={e} style={{ background: D.surf, border: `1px solid ${D.border}`, borderRadius: 12, padding: '14px 6px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><QuantaMascot size={58} expr={e} /></div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 8.5, letterSpacing: '0.1em', color: D.muted, marginTop: 10, textTransform: 'uppercase' }}>{l}</div>
          </div>
        ))}
      </div>
    </Pad>
  );
}

// phone-shaped "mascot in context"
function MascotContext() {
  return (
    <div style={{ height: '100%', background: D.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {/* confetti */}
        {[[40, 60, TOKENS.cyan], [220, 90, TOKENS.gold], [70, 150, TOKENS.violet], [200, 180, TOKENS.cyan], [150, 50, TOKENS.gold], [30, 230, TOKENS.violet], [240, 240, TOKENS.cyan]].map(([x, y, c], i) => (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: 7, height: 7, borderRadius: i % 2 ? 2 : 7, background: c, opacity: 0.85, transform: `rotate(${i * 40}deg)` }} />
        ))}
        <div style={{ width: 120, height: 120, borderRadius: 60, background: 'radial-gradient(circle, rgba(255,194,75,0.22), transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <QuantaMascot size={120} expr="celebrate" tone={TOKENS.gold} toneDeep={TOKENS.goldDeep} />
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: '0.2em', color: TOKENS.gold, marginTop: 22 }}>LEVEL UP</div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, color: D.text, marginTop: 6, letterSpacing: '-0.02em' }}>Level 7</div>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: D.muted, marginTop: 4 }}>Sharpshooter</div>
        {/* xp bar */}
        <div style={{ width: '80%', marginTop: 20 }}>
          <div style={{ height: 8, background: D.surf2, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: '64%', height: '100%', background: `linear-gradient(90deg, ${TOKENS.cyan}, ${TOKENS.gold})` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: FONTS.mono, fontSize: 9, color: D.faint }}><span>3,200 XP</span><span>5,000</span></div>
        </div>
        <div style={{ marginTop: 22, background: TOKENS.cyan, color: D.bg, fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, padding: '11px 30px', borderRadius: 11 }}>Keep going</div>
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 8.5, letterSpacing: '0.12em', color: D.faint, textAlign: 'center', padding: '10px 0', borderTop: `1px solid ${D.border}` }}>CELEBRATION · LOADING · EMPTY STATE</div>
    </div>
  );
}

// ── APP ICON ─────────────────────────────────────────────────────
function IconStudies() {
  const items = [['core', 'Core', 'Mascot-forward'], ['mark', 'Mark', 'Symbol only'], ['invert', 'Invert', 'Cyan ground'], ['gold', 'Reward', 'Seasonal/pro']];
  return (
    <Pad p={28}>
      <Micro c={D.accent} mb={6}>App icon</Micro>
      <H s={20} mb={4}>One squircle, four readings.</H>
      <Body s={12.5} mt={0}>Same geometry as the mascot so the icon and the in-app character are unmistakably one brand.</Body>
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {items.map(([v, n, d]) => (
          <div key={v} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))' }}><AppIcon size={96} variant={v} /></div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: D.text, marginTop: 12 }}>{n}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 11, color: D.muted, marginTop: 1 }}>{d}</div>
          </div>
        ))}
      </div>
    </Pad>
  );
}
function HomeScreen() {
  const apps = [['#3478F6'], ['#34C759'], ['#FF9500'], ['#FF2D55'], ['#5856D6'], ['#FF3B30'], ['#30B0C7'], ['#AF52DE']];
  return (
    <div style={{ height: '100%', background: 'linear-gradient(160deg, #2a2350, #0d1530 60%, #06203a)', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 40, color: '#fff', textAlign: 'center', marginTop: 8, opacity: 0.95 }}>9:41</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 28 }}>Monday, June 1</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, justifyItems: 'center' }}>
        {apps.slice(0, 7).map((c, i) => (<div key={i} style={{ width: 52, height: 52, borderRadius: 13, background: c[0], opacity: 0.9 }} />))}
        <div style={{ textAlign: 'center' }}>
          <div style={{ filter: 'drop-shadow(0 6px 14px rgba(47,230,224,0.4))' }}><AppIcon size={52} variant="core" /></div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', justifyItems: 'center', marginTop: 6 }}>
        <div style={{ gridColumn: '4', fontFamily: FONTS.body, fontSize: 9.5, color: '#fff', marginTop: -8 }}>Mind Element</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 22, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 16px' }}>
        {['#fff', '#fff', '#fff'].map((c, i) => <div key={i} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.25)' }} />)}
        <AppIcon size={38} variant="core" />
      </div>
    </div>
  );
}

// ── GAME ICONS ───────────────────────────────────────────────────
function IconGrid() {
  const games = [['tango', 'Tango'], ['queens', 'Queens'], ['memory', 'Memory'], ['sudoku', 'Sudoku'], ['zip', 'Zip'], ['flow', 'Flow'], ['bridges', 'Bridges'], ['nonogram', 'Nonogram']];
  return (
    <Pad p={28}>
      <Micro c={D.accent} mb={6}>Game-icon system · 8 of 24</Micro>
      <H s={20} mb={4}>Every game, one visual family.</H>
      <Body s={12.5} mt={0}>A shared tile + a single-idea geometric glyph per game. Replaces the tiny live-board thumbnails with marks that read at any size — grid, card, daily, leaderboard.</Body>
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, justifyItems: 'center' }}>
        {games.map(([g, l]) => (
          <div key={g} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><GameIcon game={g} size={64} /></div>
            <div style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, color: D.text, marginTop: 9 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, fontFamily: FONTS.mono, fontSize: 9.5, color: D.faint, letterSpacing: '0.1em' }}>+ 16 MORE IN PHASE 5</div>
    </Pad>
  );
}
function CardContext() {
  return (
    <Pad p={26}>
      <Micro c={D.accent} mb={14}>On a game card</Micro>
      {/* new card */}
      <div style={{ background: D.surf, border: `1px solid ${D.border}`, borderRadius: 16, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <GameIcon game="queens" size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: D.text }}>Queens</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 8.5, letterSpacing: '0.1em', color: TOKENS.easy, background: 'rgba(84,208,106,0.14)', padding: '3px 7px', borderRadius: 5 }}>EASY</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: D.faint }}>12 / 100</span>
            </div>
          </div>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: TOKENS.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', color: D.bg, fontWeight: 700, fontFamily: FONTS.display }}>▶</div>
        </div>
        <div style={{ height: 5, background: D.surf2, borderRadius: 3, marginTop: 14, overflow: 'hidden' }}>
          <div style={{ width: '12%', height: '100%', background: TOKENS.cyan }} />
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 12, padding: 12 }}>
          <GameIcon game="flow" size={42} />
          <div style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, color: D.text, marginTop: 8 }}>Flow</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.1em', color: TOKENS.medium, marginTop: 3 }}>MEDIUM</div>
        </div>
        <div style={{ flex: 1, background: D.surf, border: `1px solid ${D.border}`, borderRadius: 12, padding: 12 }}>
          <GameIcon game="zip" size={42} />
          <div style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, color: D.text, marginTop: 8 }}>Zip</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.1em', color: TOKENS.hard, marginTop: 3 }}>HARD</div>
        </div>
      </div>
      <Body s={11.5} mt={16}>Title gets real weight, the icon does the recognising, difficulty + progress stay legible. Compare to today's text-only cards.</Body>
    </Pad>
  );
}

// ── CANVAS ───────────────────────────────────────────────────────
function Foundation() {
  return (
    <DesignCanvas>
      <DCSection id="direction" title="Direction" subtitle="What I'm proposing — start here">
        <DCArtboard id="approach" label="The plan" width={560} height={640}><Approach /></DCArtboard>
        <DCArtboard id="naming" label="Naming" width={340} height={640}><Naming /></DCArtboard>
      </DCSection>

      <DCSection id="palette" title="Palette · themeable" subtitle="Cyan DNA kept & evolved. Same tokens render in all three themes — these are live previews, not swatches on white.">
        <DCArtboard id="dark" label="Dark (lead)" width={300} height={520}><PaletteCard tk="dark" name="Dark · default" /></DCArtboard>
        <DCArtboard id="light" label="Light" width={300} height={520}><PaletteCard tk="light" name="Light" /></DCArtboard>
        <DCArtboard id="paper" label="Paper" width={300} height={520}><PaletteCard tk="paper" name="Paper · editorial" /></DCArtboard>
        <DCArtboard id="semantic" label="Brand & semantic" width={300} height={520}><SemanticCard /></DCArtboard>
      </DCSection>

      <DCSection id="type" title="Type" subtitle="Three voices: a geometric display, a humane body, a mono for labels — plus a serif for Paper.">
        <DCArtboard id="typecard" label="Type system" width={600} height={420}><TypeCard /></DCArtboard>
      </DCSection>

      <DCSection id="mascot" title="Mascot · four directions" subtitle="The mascot is a living puzzle cell. Pick one (or a blend) — each works as icon, celebration star, loader and avatar.">
        <DCArtboard id="quanta" label="A · Quanta (geometric)" width={300} height={560}>
          <MascotCard Comp={QuantaMascot} expr="idle" name="Quanta" tagline="Geometric element · my pick" why="A living puzzle cell with a spark. Premium, ageless, instantly the brand. The faint inner frame ties it to every game's grid." />
        </DCArtboard>
        <DCArtboard id="pip" label="B · Pip (creature)" width={300} height={560}>
          <MascotCard Comp={PipMascot} expr="happy" name="Pip" tagline="Friendly creature · kid-warm" why="Softer, with feet, blush and a smile. Skews younger and more huggable — great for celebrations, a touch less premium in chrome." panel="radial-gradient(circle at 50% 38%, rgba(142,124,255,0.14), transparent 65%)" />
        </DCArtboard>
        <DCArtboard id="glyph" label="C · Glyph (line)" width={300} height={560}>
          <MascotCard Comp={GlyphMascot} expr="focused" name="Glyph" tagline="Line companion · sophisticated" why="Outline-only, single weight. The most grown-up and the easiest to animate as a stroke. Reads quietly next to dense puzzles." />
        </DCArtboard>
        <DCArtboard id="node" label="D · Node (symbol)" width={300} height={560}>
          <MascotCard Comp={NodeMark} expr="idle" name="Node" tagline="Symbol only · no character" why="If you'd rather not have a face at all: a 'logic path' tracing through grid nodes. Pure mark — works where a mascot would be too playful." panel="radial-gradient(circle at 50% 38%, rgba(47,230,224,0.10), transparent 65%)" />
        </DCArtboard>
        <DCArtboard id="expr" label="Expressions" width={560} height={300}><Expressions /></DCArtboard>
        <DCArtboard id="ctx" label="In context (phone)" width={300} height={600}><MascotContext /></DCArtboard>
      </DCSection>

      <DCSection id="appicon" title="App icon" subtitle="Same squircle geometry as the mascot — icon and character read as one brand.">
        <DCArtboard id="studies" label="Icon studies" width={520} height={340}><IconStudies /></DCArtboard>
        <DCArtboard id="home" label="On the home screen" width={300} height={600}><HomeScreen /></DCArtboard>
      </DCSection>

      <DCSection id="gameicons" title="Game icons · system teaser" subtitle="A consistent tile + one-idea glyph per game, replacing today's tiny live-board thumbnails.">
        <DCArtboard id="grid" label="Icon grid" width={460} height={420}><IconGrid /></DCArtboard>
        <DCArtboard id="cardctx" label="On a game card" width={320} height={500}><CardContext /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Foundation />);
