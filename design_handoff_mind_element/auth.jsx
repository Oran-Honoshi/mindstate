/* auth.jsx — Mind Element · Sign up / Sign in + post-signup onboarding.
   Themeable (dark/light/paper). Reuses brandkit + icons + app-screens-extra atoms. */

function Field({ label, type = 'text', placeholder, value, onChange, error }) {
  const t = useT();
  const [show, setShow] = React.useState(false);
  const isPw = type === 'password';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: FONTS.mono, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.muted, marginBottom: 7 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <input type={isPw && show ? 'text' : type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', background: t.surf2, border: `1px solid ${error ? TOKENS.hard : t.border}`, borderRadius: 11, padding: '12px 14px', paddingRight: isPw ? 40 : 14, fontFamily: FONTS.body, fontSize: 14, color: t.text, outline: 'none' }} />
        {isPw && <div className="as-tap" onClick={() => setShow((s) => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}><Icon name="eye" size={17} color={t.faint} stroke={2} /></div>}
      </div>
      {error && <div style={{ fontFamily: FONTS.body, fontSize: 11, color: TOKENS.hard, marginTop: 5 }}>{error}</div>}
    </div>
  );
}
function Social({ brand }) {
  const t = useT();
  const g = brand === 'google';
  return (
    <div className="as-tap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: t.surf2, border: `1px solid ${t.border}`, borderRadius: 11, padding: '11px 0', marginBottom: 9 }}>
      {g
        ? <svg width="16" height="16" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.6 9.2c0-.6 0-1.1-.2-1.6H9v3.2h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 15.9 5.4 18 9 18z"/><path fill="#FBBC05" d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5H.9C.3 6.2 0 7.5 0 9s.3 2.8.9 4z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.5.9 11.4 0 9 0 5.4 0 2.4 2.1.9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12a12 12 0 10-13.9 11.9v-8.4H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.2h3.4l-.5 3.5h-2.9v8.4A12 12 0 0024 12z"/></svg>}
      <span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: t.text }}>Continue with {g ? 'Google' : 'Facebook'}</span>
    </div>
  );
}
function Divider() { const t = useT(); return <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}><div style={{ flex: 1, height: 1, background: t.border }} /><span style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: '0.15em', color: t.faint }}>OR</span><div style={{ flex: 1, height: 1, background: t.border }} /></div>; }

function Brandline() {
  const t = useT();
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 26 }}><NodeMark size={26} bg={t.surf2} tone={t.accent} toneDeep={t.accent} /><span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, color: t.text }}>Mind Element</span></div>;
}

function SignUp({ go, onDone }) {
  const t = useT();
  const [u, setU] = React.useState(''); const [e, setE] = React.useState(''); const [p, setP] = React.useState('');
  const [err, setErr] = React.useState({});
  const submit = () => {
    const x = {};
    if (!u) x.u = 'Pick a username';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) x.e = 'Enter a valid email';
    if (p.length < 8) x.p = 'Min 8 characters';
    setErr(x);
    if (!Object.keys(x).length) onDone();
  };
  return (
    <div style={{ padding: '30px 24px' }}>
      <Brandline />
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><SparkyImg expr="happy" size={64} /></div>
      <h1 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: t.text, textAlign: 'center', margin: '0 0 4px' }}>Create account</h1>
      <p style={{ fontFamily: FONTS.body, fontSize: 13, color: t.muted, textAlign: 'center', margin: '0 0 24px' }}>Start training for free — no card needed.</p>
      <Field label="Username" placeholder="mindmaster" value={u} onChange={setU} error={err.u} />
      <Field label="Email" type="email" placeholder="you@example.com" value={e} onChange={setE} error={err.e} />
      <Field label="Password" type="password" placeholder="min 8 characters" value={p} onChange={setP} error={err.p} />
      <div style={{ marginTop: 6 }}><Btn kind="primary" icon="bolt" onClick={submit}>Create account</Btn></div>
      <Divider />
      <Social brand="google" /><Social brand="facebook" />
      <p style={{ fontFamily: FONTS.body, fontSize: 13, color: t.muted, textAlign: 'center', marginTop: 18 }}>Already have an account? <span className="as-tap" onClick={() => go('signin')} style={{ color: t.accent, fontWeight: 600 }}>Sign in</span></p>
    </div>
  );
}
function SignIn({ go, onDone }) {
  const t = useT();
  const [e, setE] = React.useState(''); const [p, setP] = React.useState('');
  return (
    <div style={{ padding: '30px 24px' }}>
      <Brandline />
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><SparkyImg expr="idle" size={64} /></div>
      <h1 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 24, color: t.text, textAlign: 'center', margin: '0 0 4px' }}>Welcome back</h1>
      <p style={{ fontFamily: FONTS.body, fontSize: 13, color: t.muted, textAlign: 'center', margin: '0 0 24px' }}>Pick up your streak where you left off.</p>
      <Field label="Email" type="email" placeholder="you@example.com" value={e} onChange={setE} />
      <Field label="Password" type="password" placeholder="your password" value={p} onChange={setP} />
      <div style={{ textAlign: 'right', marginTop: -6, marginBottom: 14 }}><span className="as-tap" style={{ fontFamily: FONTS.body, fontSize: 12, color: t.accent, fontWeight: 600 }}>Forgot password?</span></div>
      <Btn kind="primary" icon="arrowRight" onClick={onDone}>Sign in</Btn>
      <Divider />
      <Social brand="google" /><Social brand="facebook" />
      <p style={{ fontFamily: FONTS.body, fontSize: 13, color: t.muted, textAlign: 'center', marginTop: 18 }}>New here? <span className="as-tap" onClick={() => go('signup')} style={{ color: t.accent, fontWeight: 600 }}>Create an account</span></p>
    </div>
  );
}
const SLIDES = [
  { sparky: 'celebrate', tone: TOKENS.gold, kicker: 'Welcome', title: 'Welcome, Oran!', body: 'You’ve joined Mind Element — an elegant brain-training suite for the modern mind. Here’s what to expect.' },
  { icon: 'bolt', tone: TOKENS.cyan, kicker: 'Scoring', title: 'How XP works', body: 'Every stage starts at 1,000 XP and decays in real time — the faster you solve, the more you keep. Hints cost 25%. Practice mode is zero-pressure.' },
  { icon: 'calendar', tone: TOKENS.violet, kicker: 'Daily', title: 'Daily challenges', body: 'Every game has a free daily — a random stage from any difficulty. Complete it to grow your streak.' },
  { icon: 'users', tone: TOKENS.gold, kicker: 'Together', title: 'Family & friends', body: 'Create a family group, invite up to 6, and compete on a private leaderboard with real-time record alerts.' },
];
function Onboard({ onFinish }) {
  const t = useT();
  const [i, setI] = React.useState(0);
  const s = SLIDES[i]; const last = i === SLIDES.length - 1;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '30px 26px 26px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 'auto' }}>{SLIDES.map((_, k) => <div key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: k <= i ? t.accent : t.surf2 }} />)}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }} key={i}>
        <div style={{ animation: 'as-fadeup .3s ease-out both' }}>
          {s.sparky ? <SparkyImg expr={s.sparky} size={104} /> : <div style={{ width: 88, height: 88, borderRadius: 24, background: s.tone + '1e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><Icon name={s.icon} size={40} color={s.tone} stroke={2} fill={s.icon === 'bolt'} /></div>}
          <div style={{ fontFamily: FONTS.mono, fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: s.tone, marginTop: 22 }}>{s.kicker}</div>
          <h2 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 26, color: t.text, margin: '8px 0 12px' }}>{s.title}</h2>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, lineHeight: 1.6, color: t.muted, margin: '0 auto', maxWidth: 280 }}>{s.body}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        {i > 0 && <div style={{ flex: 1 }}><Btn kind="ghost" onClick={() => setI(i - 1)}>Back</Btn></div>}
        <div style={{ flex: 2 }}><Btn kind="primary" icon={last ? 'play' : 'arrowRight'} onClick={() => (last ? onFinish() : setI(i + 1))}>{last ? "Let’s go" : 'Next'}</Btn></div>
      </div>
    </div>
  );
}

function AuthApp() {
  const [theme, setTheme] = React.useState('dark');
  const [view, setView] = React.useState('signup');
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => { const fit = () => setScale(Math.min(1, (window.innerHeight - 150) / 812)); fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }, []);
  const t = makeT(theme, setTheme);
  const screens = {
    signup: <SignUp go={setView} onDone={() => setView('onboard')} />,
    signin: <SignIn go={setView} onDone={() => setView('onboard')} />,
    onboard: <Onboard onFinish={() => setView('signup')} />,
  };
  return (
    <TH.Provider value={t}>
      <div style={{ minHeight: '100vh', background: '#070809', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, padding: 16, gap: 14 }}>
        <div style={{ display: 'flex', gap: 6, background: '#14161B', border: '1px solid #2A2E37', borderRadius: 12, padding: 5 }}>
          {[['dark', 'Dark'], ['light', 'Light'], ['paper', 'Paper']].map(([k, l]) => <div key={k} className="as-tap" onClick={() => setTheme(k)} style={{ padding: '7px 18px', borderRadius: 8, fontFamily: FONTS.display, fontWeight: 700, fontSize: 12.5, background: theme === k ? TOKENS.cyan : 'transparent', color: theme === k ? '#06231f' : '#868D99' }}>{l}</div>)}
        </div>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}>
          <div style={{ width: 384, height: 812, background: '#000', borderRadius: 46, padding: 11, boxShadow: '0 40px 120px rgba(0,0,0,0.6), inset 0 0 0 2px #23262d' }}>
            <div style={{ width: '100%', height: '100%', background: t.bg, borderRadius: 36, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', zIndex: 20, pointerEvents: 'none' }}>
                <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 13, color: t.text }}>9:41</span>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 8, width: 96, height: 22, background: '#000', borderRadius: 12 }} />
                <Icon name="bolt" size={12} color={t.accent} stroke={2} fill />
              </div>
              <div style={{ position: 'absolute', inset: 0, paddingTop: 30, overflowY: 'auto' }} key={view + theme}><div style={{ minHeight: '100%', animation: 'as-fadeup .26s ease-out both' }}>{screens[view]}</div></div>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: '0.12em', color: '#5A606C' }}>{view === 'onboard' ? 'POST-SIGNUP ONBOARDING' : view.toUpperCase()}</div>
      </div>
    </TH.Provider>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<AuthApp />);
