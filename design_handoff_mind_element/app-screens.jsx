/* app-screens.jsx — Mind Element · Phase 4 (part 2).
   Header + bottom nav + Games / Daily / Leaderboard / Profile + App shell.
   Loaded AFTER app-screens-extra.jsx (atoms, theme, Family/Settings/Pricing). */

const GAMES = [
  ['tango', 'Tango', 'easy', 27], ['queens', 'Queens', 'easy', 12], ['memory', 'Memory', 'easy', 40],
  ['sudoku', 'Sudoku', 'medium', 8], ['zip', 'Zip', 'medium', 14], ['flow', 'Flow', 'medium', 33],
  ['bridges', 'Bridges', 'medium', 5], ['nonogram', 'Nonogram', 'hard', 2], ['kakuro', 'Kakuro', 'hard', 0],
  ['lightup', 'Light Up', 'medium', 19], ['patches', 'Patches', 'medium', 11], ['gravity', 'Gravity Sort', 'medium', 7],
];
const DIFF = { easy: TOKENS.easy, medium: TOKENS.medium, hard: TOKENS.hard };
const ringFor = (lvl) => (lvl >= 25 ? TOKENS.violet : lvl >= 10 ? TOKENS.gold : TOKENS.cyan);

function GameIconSafe({ game, size }) { return <GameIcon game={game} size={size} />; }

function Header({ go, tab }) {
  const t = useT();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 12px', borderBottom: `1px solid ${t.border}` }}>
      <NodeMark size={24} bg={t.surf2} tone={t.accent} toneDeep={t.accent} />
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: t.text }}>Mind Element</div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8, padding: '5px 9px' }}><Icon name="bolt" size={12} color={t.accent} stroke={2} fill /><span style={{ fontFamily: FONTS.mono, fontSize: 10, color: t.muted }}>5/5</span></div>
      <div className="as-tap" onClick={() => go('settings')} style={{ width: 32, height: 32, borderRadius: 9, background: t.surf, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="settings" size={16} color={t.muted} stroke={2} /></div>
      <div className="as-tap" onClick={() => go(null, 'you')} style={{ width: 32, height: 32 }}><MemberAvatar size={32} img expr="idle" /></div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const t = useT();
  const items = [['games', 'grid', 'Games'], ['daily', 'calendar', 'Daily'], ['leaders', 'chart', 'Leaders'], ['you', 'user', 'You']];
  return (
    <div style={{ display: 'flex', borderTop: `1px solid ${t.border}`, background: t.surf, paddingBottom: 6 }}>
      {items.map(([k, ic, l]) => (
        <div key={k} className="as-tap" onClick={() => setTab(k)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0 6px' }}>
          <Icon name={ic} size={20} color={tab === k ? t.accent : t.faint} stroke={2} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: tab === k ? t.accent : t.faint }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

// ── GAMES dashboard ──────────────────────────────────────────────
function GamesScreen({ go, setTab }) {
  const t = useT();
  return (
    <div style={{ padding: '16px 18px 22px' }}>
      <Micro s={8.5}>Monday, June 1</Micro>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: t.text, marginTop: 4 }}>Good morning, Oran.</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Card p={14} style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="flame" size={16} color={TOKENS.medium} stroke={2} /><Micro s={8}>Streak</Micro></div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: t.text, marginTop: 8 }}>28 <span style={{ fontSize: 12, color: t.muted, fontWeight: 500 }}>days</span></div>
        </Card>
        <Card p={14} style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="crown" size={16} color={TOKENS.gold} stroke={2} /><Micro s={8}>Level 7</Micro></div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: t.text, marginTop: 8 }}>Tactician</div>
          <div style={{ marginTop: 7 }}><Bar pct={64} from={TOKENS.cyan} to={TOKENS.gold} h={5} /></div>
        </Card>
      </div>
      {/* daily banner */}
      <div className="as-tap" onClick={() => setTab('daily')} style={{ marginTop: 12, background: `linear-gradient(120deg, ${t.accent}, ${t.accent}cc)`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.15em', color: t.onAccent, opacity: 0.8 }}>TODAY'S CHALLENGE</div><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: t.onAccent, marginTop: 4 }}>Queens · Stage 615</div></div>
        <div style={{ background: t.onAccent, color: t.accent, fontFamily: FONTS.display, fontWeight: 700, fontSize: 12, padding: '9px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="play" size={13} color={t.accent} fill />Play</div>
      </div>
      <SecHead right={<Micro s={9} c={t.faint}>24 titles</Micro>}>All games</SecHead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {GAMES.map(([g, name, diff, prog]) => (
          <div key={g} className="as-tap" style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ height: 92, background: `radial-gradient(120% 100% at 50% 0%, ${t.accent}12, ${t.bg})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              <div style={{ transform: 'scale(0.6)' }}><BoardPreview game={g} size={18} gap={3} /></div>
              {prog === 0 && <div style={{ position: 'absolute', top: 8, right: 8, fontFamily: FONTS.mono, fontSize: 7, letterSpacing: '0.1em', color: t.accent, border: `1px solid ${t.accent}55`, borderRadius: 5, padding: '2px 5px', background: t.bg }}>NEW</div>}
            </div>
            <div style={{ padding: '0 11px 11px', display: 'flex', alignItems: 'center', gap: 9, marginTop: -16, position: 'relative' }}>
              <div style={{ borderRadius: 12, boxShadow: '0 5px 14px rgba(0,0,0,0.5)' }}><GameIcon game={g} size={38} /></div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 14 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13.5, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}><span style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIFF[diff] }}>{diff}</span><span style={{ fontFamily: FONTS.mono, fontSize: 7.5, color: t.faint }}>· {prog}/100</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DAILY ────────────────────────────────────────────────────────
function DailyScreen() {
  const t = useT();
  const items = [['tango', 'Tango', 'easy', 353], ['memory', 'Memory', 'easy', 687], ['queens', 'Queens', 'medium', 615], ['sudoku', 'Sudoku', 'medium', 486], ['zip', 'Zip', 'hard', 231], ['nonogram', 'Nonogram', 'hard', 395], ['flow', 'Flow', 'medium', 488], ['bridges', 'Bridges', 'easy', 120]];
  return (
    <div style={{ padding: '16px 18px 22px' }}>
      <Micro s={8.5}>Monday, June 1</Micro>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: t.text, marginTop: 4 }}>Daily challenges</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}><Icon name="clock" size={13} color={t.muted} stroke={2} /><span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.muted }}>17:20:37 left</span></div>
      <div style={{ marginTop: 14 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}><Micro s={8.5}>3 / 15 today</Micro><Micro s={8.5} c={t.accent}>20%</Micro></div><Bar pct={20} from={t.accent} to={TOKENS.gold} /></div>
      <div style={{ marginTop: 18, background: `radial-gradient(120% 90% at 0% 0%, ${t.accent}1A, transparent 60%), ${t.surf}`, border: `1px solid ${t.accent}55`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <GameIcon game="queens" size={52} />
        <div style={{ flex: 1 }}><Micro s={8} c={t.accent}>Featured · Stage 615</Micro><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: t.text, marginTop: 3 }}>Queens</div></div>
        <Btn kind="primary" icon="play" full={false}>Play</Btn>
      </div>
      <SecHead>All daily challenges</SecHead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(([g, name, diff, stg], i) => (
          <Card key={g} p={11} tap style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <GameIconSafe game={g} size={40} />
            <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13.5, color: t.text }}>{name}</div><div style={{ display: 'flex', gap: 6, marginTop: 3 }}><span style={{ fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIFF[diff] }}>{diff}</span><Micro s={8} c={t.faint}>Stage {stg}</Micro></div></div>
            {i < 3 ? <Icon name="checkCircle" size={20} color={TOKENS.easy} stroke={2} /> : <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="bolt" size={12} color={t.accent} stroke={2} fill /><span style={{ fontFamily: FONTS.mono, fontSize: 10, color: t.muted }}>+{stg}</span></div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── LEADERBOARD ──────────────────────────────────────────────────
function LeaderboardScreen() {
  const t = useT();
  const [scope, setScope] = React.useState('global');
  const rows = [
    { name: 'Mara K.', tone: '#FF8A4B', lvl: 42, xp: 98230, stages: 612 },
    { name: 'devon_p', tone: '#FFE08A', lvl: 31, xp: 64120, stages: 488 },
    { name: 'yuki.s', tone: '#43E0B0', lvl: 26, xp: 51890, stages: 401 },
    { name: 'oransch', img: true, lvl: 7, xp: 3200, stages: 314, you: true },
    { name: 'a_lopez', tone: TOKENS.gold, lvl: 12, xp: 2980, stages: 208 },
    { name: 'priya88', tone: TOKENS.medium, lvl: 9, xp: 2410, stages: 176 },
  ];
  const med = { 0: 'gold', 1: 'silver', 2: 'bronze' };
  return (
    <div style={{ padding: '16px 18px 22px' }}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: t.text }}>Leaderboard</div>
      <Micro s={8.5} st={{ marginTop: 4 }}>Your figure & level by your name</Micro>
      <div style={{ display: 'flex', gap: 6, marginTop: 14, background: t.surf, border: `1px solid ${t.border}`, borderRadius: 11, padding: 4 }}>
        {[['global', 'Global'], ['family', 'Family']].map(([k, l]) => (<div key={k} className="as-tap" onClick={() => setScope(k)} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, background: scope === k ? t.surf2 : 'transparent', fontFamily: FONTS.body, fontWeight: 600, fontSize: 12.5, color: scope === k ? t.text : t.muted }}>{l}</div>))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto' }}>
        {['All games', 'Tango', 'Queens', 'Sudoku'].map((c, i) => (<div key={c} style={{ fontFamily: FONTS.body, fontSize: 11.5, fontWeight: 600, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap', background: i === 0 ? t.accent : t.surf, color: i === 0 ? t.onAccent : t.muted, border: `1px solid ${i === 0 ? t.accent : t.border}` }}>{c}</div>))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        {rows.map((r, i) => (
          <Card key={r.name} p={11} style={{ display: 'flex', alignItems: 'center', gap: 11, background: r.you ? `${t.accent}12` : t.surf, borderColor: r.you ? t.accent + '66' : t.border }}>
            <div style={{ width: 22, textAlign: 'center' }}>{med[i] ? <Medal tier={med[i]} size={24} /> : <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: t.muted }}>{i + 1}</span>}</div>
            <MemberAvatar size={44} img={r.img} tone={r.tone} deep={r.tone} ring={ringFor(r.lvl)} expr="idle" />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13.5, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>{r.you && <span style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: '0.1em', color: t.accent, border: `1px solid ${t.accent}55`, borderRadius: 4, padding: '1px 4px' }}>YOU</span>}</div><Micro s={8} c={ringFor(r.lvl)} st={{ marginTop: 3 }}>Level {r.lvl} · {r.stages} stages</Micro></div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: r.you ? t.accent : t.text }}>{r.xp.toLocaleString()}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── PROFILE (You) ────────────────────────────────────────────────
function ProfileScreen({ go }) {
  const t = useT();
  const achv = [['target', 'Speed Demon', true], ['flame', '30-day streak', true], ['medal', 'Silver Queens', true], ['trophy', 'Century', false], ['grid', 'Completionist', false], ['star', 'Perfect', false]];
  const mastery = [['tango', 'Tango', 'gold', 58, 60], ['queens', 'Queens', 'silver', 27, 30], ['sudoku', 'Sudoku', 'diamond', 100, 100]];
  const links = [['family', 'users', 'Family', TOKENS.violet], ['pricing', 'bolt', 'Go Pro', TOKENS.gold], ['settings', 'settings', 'Settings', t.muted]];
  return (
    <div style={{ padding: '16px 18px 22px' }}>
      <Card p={18} style={{ background: `radial-gradient(120% 80% at 0% 0%, ${t.accent}14, transparent 55%), ${t.surf}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <MemberAvatar size={64} img expr="happy" ring={ringFor(7)} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 19, color: t.text }}>oransch</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 3 }}><Icon name="crown" size={12} color={TOKENS.gold} stroke={2} /><span style={{ fontFamily: FONTS.body, fontSize: 12.5, color: TOKENS.gold, fontWeight: 600 }}>Level 7 · Tactician</span></div>
            <div style={{ marginTop: 9 }}><Bar pct={64} from={t.accent} to={TOKENS.gold} h={6} /></div>
            <Micro s={8} c={t.faint} st={{ marginTop: 5 }}>3,200 / 5,000 XP to Level 8</Micro>
          </div>
        </div>
      </Card>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <StatCell icon="bolt" label="Total XP" value="48.2k" color={t.accent} />
        <StatCell icon="grid" label="Stages" value="314" />
        <StatCell icon="flame" label="Streak" value="28" color={TOKENS.medium} />
        <StatCell icon="target" label="Games" value="6/24" />
      </div>
      <SecHead right={<span className="as-tap" onClick={() => go('settings')} style={{ fontFamily: FONTS.body, fontSize: 11, color: t.accent, fontWeight: 600 }}>Manage</span>}>Quick links</SecHead>
      <div style={{ display: 'flex', gap: 8 }}>
        {links.map(([k, ic, l, c]) => (
          <Card key={k} p={14} tap onClick={() => go(k)} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icon name={ic} size={20} color={c} stroke={2} fill={ic === 'bolt'} /></div>
            <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 12, color: t.text }}>{l}</div>
          </Card>
        ))}
      </div>
      <SecHead right={<Micro s={9} c={t.faint}>3 / 9</Micro>}>Achievements</SecHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {achv.map(([ic, l, on]) => (<Card key={l} p={0} style={{ padding: '15px 6px', textAlign: 'center', opacity: on ? 1 : 0.45, borderColor: on ? TOKENS.gold + '40' : t.border }}><div style={{ display: 'flex', justifyContent: 'center' }}><Icon name={ic} size={20} color={on ? TOKENS.gold : t.faint} stroke={1.8} fill={ic === 'star' && on} /></div><Micro s={7} st={{ marginTop: 8 }}>{l}</Micro></Card>))}
      </div>
      <SecHead right={<span className="as-tap" onClick={() => go(null,'leaders')} style={{ fontFamily: FONTS.body, fontSize: 11, color: t.accent, fontWeight: 600 }}>View all</span>}>Per-game mastery</SecHead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mastery.map(([g, name, tier, cur, max]) => (
          <Card key={g} p={11} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <GameIcon game={g} size={40} />
            <div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: t.text }}>{name}</span><span style={{ fontFamily: FONTS.mono, fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: TIER_COLORS[tier][0] }}>{tier}</span></div><div style={{ marginTop: 7 }}><Bar pct={(cur / max) * 100} from={TIER_COLORS[tier][1]} to={TIER_COLORS[tier][0]} h={5} /></div></div>
            <Medal tier={tier} size={28} />
          </Card>
        ))}
      </div>
      <div onClick={() => go('pricing')} className="as-tap" style={{ marginTop: 18, background: `linear-gradient(120deg, ${t.accent}, ${t.accent}bb)`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <SparkyImg expr="celebrate" size={44} />
        <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: t.onAccent }}>Unlock unlimited play</div><div style={{ fontFamily: FONTS.body, fontSize: 11, color: t.onAccent, opacity: 0.85, marginTop: 2 }}>All figures · family leaderboard · $2/mo</div></div>
        <Icon name="chevronRight" size={18} color={t.onAccent} />
      </div>
    </div>
  );
}

// ── APP SHELL ────────────────────────────────────────────────────
function App() {
  const [theme, setTheme] = React.useState('dark');
  const [tab, setTab] = React.useState('games');
  const [sub, setSub] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => { const fit = () => setScale(Math.min(1, (window.innerHeight - 70) / 812)); fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }, []);
  const t = makeT(theme, setTheme);
  const go = (subName, tabName) => { if (tabName) { setTab(tabName); setSub(null); } else setSub(subName); };

  const tabs = {
    games: <GamesScreen go={go} setTab={setTab} />,
    daily: <DailyScreen />,
    leaders: <LeaderboardScreen />,
    you: <ProfileScreen go={go} />,
  };
  const subs = {
    family: <FamilyScreen onBack={() => setSub(null)} go={go} />,
    settings: <SettingsScreen onBack={() => setSub(null)} go={go} />,
    pricing: <PricingScreen onBack={() => setSub(null)} />,
  };

  return (
    <TH.Provider value={t}>
      <div style={{ minHeight: '100vh', background: '#070809', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, padding: 16 }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <div style={{ width: 384, height: 812, background: '#000', borderRadius: 46, padding: 11, boxShadow: '0 40px 120px rgba(0,0,0,0.6), inset 0 0 0 2px #23262d' }}>
            <div style={{ width: '100%', height: '100%', background: t.bg, borderRadius: 36, overflow: 'hidden', position: 'relative' }}>
              {/* status bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', zIndex: 30, pointerEvents: 'none' }}>
                <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: t.text }}>9:41</span>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 8, width: 96, height: 22, background: '#000', borderRadius: 12 }} />
                <Icon name="bolt" size={12} color={t.accent} stroke={2} fill />
              </div>
              {/* main tab view */}
              <div style={{ position: 'absolute', inset: 0, paddingTop: 30, display: 'flex', flexDirection: 'column' }}>
                <Header go={go} tab={tab} />
                <div style={{ flex: 1, overflowY: 'auto' }} key={tab}><div style={{ animation: 'as-fadeup .26s ease-out both' }}>{tabs[tab]}</div></div>
                <BottomNav tab={tab} setTab={(k) => { setTab(k); setSub(null); }} />
              </div>
              {/* sub-screen overlay */}
              {sub && <div style={{ position: 'absolute', top: 30, left: 0, right: 0, bottom: 0, zIndex: 25 }}>{subs[sub]}</div>}
            </div>
          </div>
        </div>
      </div>
    </TH.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
