/* app-screens-extra.jsx — Mind Element · Phase 4 (part 1).
   Theme context + shared atoms + Family / Settings / Pricing screens.
   Loaded BEFORE app-screens.jsx. Live theming: dark / light / paper. */

const TH = React.createContext(null);
const useT = () => React.useContext(TH);
function makeT(key, setTheme) {
  const base = TOKENS.theme[key];
  return { ...base, key, setTheme, onAccent: key === 'dark' ? '#06231f' : '#ffffff' };
}

if (!document.getElementById('as-css')) {
  const s = document.createElement('style'); s.id = 'as-css';
  s.textContent = `
    .as-tap{cursor:pointer;transition:transform .1s,background .15s,border-color .15s}.as-tap:active{transform:scale(.97)}
    @keyframes as-fadeup{0%{transform:translateY(12px);opacity:0}100%{transform:translateY(0);opacity:1}}
    @keyframes as-slidein{0%{transform:translateX(100%)}100%{transform:translateX(0)}}
  `;
  document.head.appendChild(s);
}

// ── atoms ────────────────────────────────────────────────────────
function Micro({ children, c, s = 9.5, st }) { const t = useT(); return <div style={{ fontFamily: FONTS.mono, fontSize: s, letterSpacing: '0.18em', textTransform: 'uppercase', color: c || t.faint, ...st }}>{children}</div>; }
function Card({ children, p = 16, style, onClick, tap }) { const t = useT(); return <div className={tap ? 'as-tap' : ''} onClick={onClick} style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 16, padding: p, ...style }}>{children}</div>; }
function Bar({ pct, from, to, h = 8 }) { const t = useT(); return <div style={{ height: h, background: t.surf2, borderRadius: h / 2, overflow: 'hidden' }}><div style={{ width: Math.max(2, pct) + '%', height: '100%', background: `linear-gradient(90deg, ${from || t.accent}, ${to || from || t.accent})`, borderRadius: h / 2 }} /></div>; }
function Btn({ children, kind = 'primary', icon, onClick, full = true }) {
  const t = useT();
  const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONTS.display, fontWeight: 700, fontSize: 14.5, padding: '13px 18px', borderRadius: 13, border: 'none', width: full ? '100%' : 'auto' };
  const map = { primary: { ...base, background: t.accent, color: t.onAccent }, ghost: { ...base, background: t.surf2, color: t.text }, outline: { ...base, background: 'transparent', color: t.text, border: `1px solid ${t.border}` } };
  return <div className="as-tap" style={map[kind]} onClick={onClick}>{icon && <Icon name={icon} size={17} color={kind === 'primary' ? t.onAccent : t.text} stroke={2.2} fill={icon === 'play'} />}{children}</div>;
}
function StatCell({ icon, label, value, color }) { const t = useT(); return <div style={{ flex: 1, background: t.surf, border: `1px solid ${t.border}`, borderRadius: 13, padding: '13px 6px', textAlign: 'center' }}><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 7 }}><Icon name={icon} size={16} color={color || t.muted} stroke={2} /></div><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, color: t.text }}>{value}</div><Micro s={8} st={{ marginTop: 3 }}>{label}</Micro></div>; }
function SparkyImg({ expr = 'idle', size = 80 }) { const map = { idle: 'idle', happy: 'happy', focused: 'focused', surprised: 'surprised', celebrate: 'celebrate', sleep: 'resting' }; return <img src={'assets/sparky/' + (map[expr] || 'idle') + '.png'} width={size} height={size} alt="Sparky" style={{ display: 'block', objectFit: 'contain' }} />; }
function MemberAvatar({ tone = TOKENS.cyan, deep, size = 44, ring, img = false, expr = 'idle' }) {
  const t = useT();
  const inner = img ? <SparkyImg expr={expr} size={size - 12} /> : <QuantaMascot size={size - 12} expr={expr} tone={tone} toneDeep={deep || tone} />;
  if (!ring) return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{inner}</div>;
  return <div style={{ width: size, height: size, borderRadius: '50%', padding: 3, background: `conic-gradient(${ring},${ring}88,${ring})`, flexShrink: 0 }}><div style={{ width: '100%', height: '100%', borderRadius: '50%', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{inner}</div></div>;
}
function Toggle({ on, onClick, color }) { const t = useT(); return <div className="as-tap" onClick={onClick} style={{ width: 46, height: 27, borderRadius: 14, background: on ? (color || t.accent) : t.surf2, position: 'relative', transition: 'background .2s', flexShrink: 0, border: `1px solid ${t.border}` }}><div style={{ position: 'absolute', top: 2, left: on ? 21 : 2, width: 21, height: 21, borderRadius: 11, background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} /></div>; }
function SecHead({ children, right }) { return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 2px 12px' }}><Micro>{children}</Micro>{right}</div>; }
function SubScreen({ title, onBack, children }) {
  const t = useT();
  return (
    <div style={{ height: '100%', background: t.bg, display: 'flex', flexDirection: 'column', animation: 'as-slidein .25s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: `1px solid ${t.border}` }}>
        <div className="as-tap" onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, background: t.surf, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" size={18} color={t.text} /></div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: t.text }}>{title}</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 28px' }}>{children}</div>
    </div>
  );
}

// ── FAMILY ───────────────────────────────────────────────────────
function FamilyScreen({ onBack, go }) {
  const t = useT();
  const members = [
    { name: 'Mom', tone: TOKENS.gold, deep: TOKENS.goldDeep, lvl: 14, xp: 12840, you: false },
    { name: 'You', img: true, lvl: 7, xp: 3200, you: true },
    { name: 'Maya', tone: TOKENS.violet, deep: TOKENS.violetDeep, lvl: 9, xp: 5410, you: false },
    { name: 'Dad', tone: TOKENS.easy, deep: '#2E8F45', lvl: 6, xp: 2180, you: false },
  ].sort((a, b) => b.xp - a.xp);
  const feed = [
    ['crown', 'Mom reached Level 14', '2h ago', TOKENS.gold],
    ['trophy', 'Dad joined the Century Club on Sudoku', 'Yesterday', TOKENS.violet],
    ['flame', 'Maya hit a 12-day streak', '2d ago', TOKENS.medium],
  ];
  return (
    <SubScreen title="Family" onBack={onBack}>
      <Card p={18} style={{ background: `radial-gradient(120% 80% at 0% 0%, ${TOKENS.violet}1A, transparent 60%), ${t.surf}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: t.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="users" size={22} color={TOKENS.violet} stroke={2} /></div>
          <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, color: t.text }}>The Cohen Family</div><Micro s={8.5} st={{ marginTop: 3 }}>4 of 7 seats · Family plan</Micro></div>
        </div>
      </Card>
      <SecHead right={<Micro s={9} c={t.faint}>This week</Micro>}>Family leaderboard</SecHead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map((m, i) => (
          <Card key={m.name} p={11} style={{ display: 'flex', alignItems: 'center', gap: 12, background: m.you ? 'rgba(47,230,224,0.06)' : t.surf, borderColor: m.you ? t.accent + '66' : t.border }}>
            <div style={{ width: 20, fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: t.muted, textAlign: 'center' }}>{i + 1}</div>
            <MemberAvatar size={42} img={m.img} tone={m.tone} deep={m.deep} ring={i === 0 ? TOKENS.gold : t.border} expr={i === 0 ? 'happy' : 'idle'} />
            <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13.5, color: t.text }}>{m.name}</div><Micro s={8} c={m.you ? t.accent : t.muted} st={{ marginTop: 2 }}>Level {m.lvl}</Micro></div>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: m.you ? t.accent : t.text }}>{m.xp.toLocaleString()}</div>
          </Card>
        ))}
      </div>
      <SecHead>Invite</SecHead>
      <Card p={14} tap style={{ display: 'flex', alignItems: 'center', gap: 12, borderStyle: 'dashed' }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: t.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="gift" size={18} color={t.accent} stroke={2} /></div>
        <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: t.text }}>Invite 3 more</div><Micro s={8} st={{ marginTop: 2 }}>Share a link · seats included in your plan</Micro></div>
        <Icon name="chevronRight" size={16} color={t.faint} />
      </Card>
      <SecHead>Recent wins</SecHead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {feed.map(([ic, txt, time, c], i) => (
          <Card key={i} p={12} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: t.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={16} color={c} stroke={2} /></div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: t.text }}>{txt}</div><Micro s={7.5} st={{ marginTop: 2 }}>{time}</Micro></div>
          </Card>
        ))}
      </div>
    </SubScreen>
  );
}

// ── SETTINGS ─────────────────────────────────────────────────────
function SettingsScreen({ onBack, go }) {
  const t = useT();
  const [silent, setSilent] = React.useState(false);
  const [daily, setDaily] = React.useState(true);
  const [streak, setStreak] = React.useState(true);
  const themes = [['dark', 'Dark'], ['light', 'Light'], ['paper', 'Paper']];
  const langs = ['English', 'Español', 'Deutsch', 'Français', 'Português', 'עברית'];
  const [lang, setLang] = React.useState('English');
  const Field = ({ label, value }) => (<div style={{ marginBottom: 12 }}><Micro s={8.5} st={{ marginBottom: 6 }}>{label}</Micro><div style={{ background: t.surf2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '11px 13px', fontFamily: FONTS.body, fontSize: 13.5, color: t.text }}>{value}</div></div>);
  return (
    <SubScreen title="Settings" onBack={onBack}>
      <Micro c={t.accent} st={{ marginBottom: 10 }}>Profile</Micro>
      <Card p={16}>
        <Field label="Username" value="oransch" />
        <Field label="Email" value="oran@example.com" />
        <Btn kind="primary" icon="check">Save changes</Btn>
      </Card>
      <Micro c={t.accent} st={{ margin: '22px 0 10px' }}>Preferences</Micro>
      <Card p={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13.5, color: t.text }}>Silent mode</div><Micro s={8} st={{ marginTop: 2 }}>Disable sounds & haptics</Micro></div>
          <Toggle on={silent} onClick={() => setSilent((v) => !v)} />
        </div>
        <div style={{ padding: '14px 0', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13.5, color: t.text, marginBottom: 3 }}>Theme</div>
          <Micro s={8} st={{ marginBottom: 10 }}>Live — changes the whole app</Micro>
          <div style={{ display: 'flex', gap: 7 }}>
            {themes.map(([k, l]) => (
              <div key={k} className="as-tap" onClick={() => t.setTheme(k)} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 9, fontFamily: FONTS.body, fontWeight: 600, fontSize: 12.5, background: t.key === k ? t.accent : t.surf2, color: t.key === k ? t.onAccent : t.muted, border: `1px solid ${t.key === k ? t.accent : t.border}` }}>{l}</div>
            ))}
          </div>
        </div>
        <div style={{ paddingTop: 14 }}>
          <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13.5, color: t.text, marginBottom: 10 }}>Language</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {langs.map((l) => (<div key={l} className="as-tap" onClick={() => setLang(l)} style={{ padding: '7px 12px', borderRadius: 9, fontFamily: FONTS.body, fontSize: 12, background: lang === l ? t.accent : t.surf2, color: lang === l ? t.onAccent : t.muted, border: `1px solid ${lang === l ? t.accent : t.border}` }}>{l}</div>))}
          </div>
        </div>
      </Card>
      <Micro c={t.accent} st={{ margin: '22px 0 10px' }}>Subscription</Micro>
      <Card p={16} style={{ background: `radial-gradient(120% 80% at 100% 0%, ${t.accent}14, transparent 60%), ${t.surf}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: t.text }}>Free plan</div><Micro s={8} st={{ marginTop: 3 }}>5 daily plays · all 24 games</Micro></div>
          <Btn kind="primary" icon="bolt" full={false} onClick={() => go('pricing')}>Upgrade</Btn>
        </div>
        <div style={{ marginTop: 14 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><Micro s={8}>Today's plays</Micro><Micro s={8} c={t.accent}>5 / 5</Micro></div><Bar pct={100} /></div>
      </Card>
      <Micro c={t.accent} st={{ margin: '22px 0 10px' }}>Notifications</Micro>
      <Card p={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: `1px solid ${t.border}` }}><div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13.5, color: t.text }}>Daily reminder</div><Micro s={8} st={{ marginTop: 2 }}>Nudge to play your daily</Micro></div><Toggle on={daily} onClick={() => setDaily((v) => !v)} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14 }}><div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13.5, color: t.text }}>Streak alerts</div><Micro s={8} st={{ marginTop: 2 }}>Warn before a streak breaks</Micro></div><Toggle on={streak} onClick={() => setStreak((v) => !v)} color={TOKENS.medium} /></div>
      </Card>
      <div style={{ marginTop: 22 }}><Btn kind="outline" icon="lock">Sign out</Btn></div>
    </SubScreen>
  );
}

// ── PRICING ──────────────────────────────────────────────────────
function PricingScreen({ onBack }) {
  const t = useT();
  const [open, setOpen] = React.useState(0);
  const plans = [
    { name: 'Free', price: '$0', tag: '', feats: ['All 24 games', '5 plays / day', 'Global leaderboard', 'Accessibility mode'], cta: 'Current plan', pop: false },
    { name: 'Individual', price: '$2', tag: '', feats: ['Unlimited daily play', 'Every figure unlockable', 'Thousands of stages', '3-day free trial'], cta: 'Start free trial', pop: false },
    { name: 'Family Choice', price: '$5', tag: 'Most popular', feats: ['Up to 3 profiles', 'Shared family leaderboard', 'Family milestones & figures', 'Unlimited daily play'], cta: 'Protect your household', pop: true },
    { name: 'Grand Family', price: '$10', tag: '', feats: ['Up to 7 profiles', 'Everything in Family', 'Master billing dashboard', 'One bill, all seats'], cta: 'Access Grand Vault', pop: false },
  ];
  const faqs = [
    ['Do I need a card for the free plan?', 'No. The free plan is free forever — 5 plays a day across all 24 games, no card needed.'],
    ['How does the 3-day trial work?', 'Full Pro access for 3 days. Cancel anytime before it ends and you are not charged.'],
    ['Can I change plans later?', 'Yes — upgrade, downgrade or cancel anytime from Settings. Changes apply next cycle.'],
    ['What are Sparky figures?', 'Collectible looks for your avatar, earned by leveling and milestones, shown by your name on leaderboards.'],
  ];
  return (
    <SubScreen title="Pricing" onBack={onBack}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: t.text }}>Simple, honest pricing</div>
        <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: t.muted, marginTop: 6 }}>Less than a coffee. Invest in the sharpest version of your household.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 18 }}>
        {plans.map((p) => (
          <div key={p.name} style={{ position: 'relative', background: p.pop ? `linear-gradient(160deg, ${t.accent}1F, ${t.surf})` : t.surf, border: `1.5px solid ${p.pop ? t.accent : t.border}`, borderRadius: 18, padding: 18 }}>
            {p.pop && <div style={{ position: 'absolute', top: -10, left: 18, background: t.accent, color: t.onAccent, fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.12em', padding: '4px 9px', borderRadius: 6, textTransform: 'uppercase' }}>{p.tag}</div>}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: t.text }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}><span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 26, color: p.pop ? t.accent : t.text }}>{p.price}</span><Micro s={8}>/mo</Micro></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0 16px' }}>
              {p.feats.map((f) => (<div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="check" size={14} color={p.pop ? t.accent : TOKENS.easy} stroke={2.6} /><span style={{ fontFamily: FONTS.body, fontSize: 12.5, color: t.text }}>{f}</span></div>))}
            </div>
            <Btn kind={p.pop ? 'primary' : 'ghost'}>{p.cta}</Btn>
          </div>
        ))}
      </div>
      <SecHead>Common questions</SecHead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map(([q, a], i) => (
          <Card key={i} p={0} tap onClick={() => setOpen(open === i ? -1 : i)} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 15px' }}>
              <div style={{ flex: 1, fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: t.text }}>{q}</div>
              <Icon name={open === i ? 'close' : 'chevronRight'} size={15} color={t.faint} stroke={2} />
            </div>
            {open === i && <div style={{ padding: '0 15px 15px', fontFamily: FONTS.body, fontSize: 12, color: t.muted, lineHeight: 1.55 }}>{a}</div>}
          </Card>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 18 }}><Micro s={8}>Cancel anytime · payments secured by Paddle</Micro></div>
    </SubScreen>
  );
}

Object.assign(window, { TH, useT, makeT, Micro, Card, Bar, Btn, StatCell, SparkyImg, MemberAvatar, Toggle, SecHead, SubScreen, FamilyScreen, SettingsScreen, PricingScreen });
