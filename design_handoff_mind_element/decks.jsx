/* decks.jsx — Mind Element · Memory pack (18 faces + back) + a full playing deck
   for Solitaire/Hearts, plus table mockups. Themeable. Self-contained gallery.
   Needs brandkit + icons + app-screens-extra (useT/makeT/TH). */

// ── Memory emblem pack (rendered — 18 distinct faces) ────────────
const EMB = [
  ['#FF6B9D','#C23B6E'],['#4FC3F7','#1565C0'],['#FFD54F','#F57F17'],['#FF8A80','#D32F2F'],['#80DEEA','#00838F'],['#B388FF','#5E35B1'],
  ['#CE93D8','#7B1FA2'],['#FFE082','#FF8F00'],['#A5D6A7','#2E7D32'],['#90CAF9','#1976D2'],['#FFAB91','#E64A19'],['#F48FB1','#AD1457'],
  ['#81D4FA','#0277BD'],['#C5E1A5','#558B2F'],['#FFCC80','#EF6C00'],['#B39DDB','#512DA8'],['#B0BEC5','#455A64'],['#80CBC4','#00695C'],
];
const EMB_NAMES = ['Gem','Orbit','Star','Heart','Hex','Drop','Bloom','Bolt','Leaf','Moon','Sun','Prism','Tile','Pentad','Ring','Plus','Cloud','Spark'];
function DSym({ i, s }) {
  const f = '#fff';
  const sym = [
    <path d="M12 3 L20 9 L12 21 L4 9 Z" fill={f} />,
    <g fill={f}><circle cx="12" cy="12" r="5.5" /><ellipse cx="12" cy="12" rx="9.5" ry="3.2" fill="none" stroke={f} strokeWidth="1.8" transform="rotate(-22 12 12)" /></g>,
    <path d="M12 2.5 L14.6 9 L21.5 9.4 L16 13.8 L17.8 20.5 L12 16.6 L6.2 20.5 L8 13.8 L2.5 9.4 L9.4 9 Z" fill={f} />,
    <path d="M12 20 C 4 14, 4 7, 9 8 C 11 8.4, 12 10.5, 12 11.2 C 12 10.5, 13 8.4, 15 8 C 20 7, 20 14, 12 20 Z" fill={f} />,
    <path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z" fill={f} />,
    <path d="M12 3 C 17 10, 18 13, 18 15 a6 6 0 0 1 -12 0 C 6 13, 7 10, 12 3 Z" fill={f} />,
    <g fill={f}>{[0,1,2,3,4,5].map((k)=>{const a=k*Math.PI/3;return <circle key={k} cx={12+Math.cos(a)*5.5} cy={12+Math.sin(a)*5.5} r="3" />;})}<circle cx="12" cy="12" r="3.2" /></g>,
    <path d="M13 3L5 13h6l-1 8 8-10h-6z" fill={f} />,
    <path d="M12 21 C 5 18, 4 8, 12 3 C 20 8, 19 18, 12 21 Z M12 6 L12 19" fill={f} stroke="#fff" />,
    <path d="M16 4 C 10 4, 6 7.5, 6 12 C 6 16.5, 10 20, 16 20 C 11.5 16.5, 11.5 7.5, 16 4 Z" fill={f} />,
    <g fill={f}><circle cx="12" cy="12" r="5" />{[0,1,2,3,4,5,6,7].map((k)=>{const a=k*Math.PI/4;return <line key={k} x1={12+Math.cos(a)*7} y1={12+Math.sin(a)*7} x2={12+Math.cos(a)*9.5} y2={12+Math.sin(a)*9.5} stroke={f} strokeWidth="2" strokeLinecap="round" />;})}</g>,
    <path d="M12 3 L21 19 L3 19 Z" fill={f} />,
    <rect x="5" y="5" width="14" height="14" rx="3" fill={f} />,
    <path d="M12 3 L20 9 L17 19 L7 19 L4 9 Z" fill={f} />,
    <path d="M12 4 a8 8 0 1 0 0.001 0 Z M12 9 a3 3 0 1 1 -0.001 0 Z" fill={f} fillRule="evenodd" />,
    <path d="M10 4 h4 v6 h6 v4 h-6 v6 h-4 v-6 h-6 v-4 h6 Z" fill={f} />,
    <path d="M7 18 a4 4 0 0 1 0 -8 a5 5 0 0 1 9.5 -1 a4 4 0 0 1 0.5 9 Z" fill={f} />,
    <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={f} />,
  ][i];
  return <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }}>{sym}</svg>;
}
function EmblemCard({ i, w = 74 }) {
  const [a, b] = EMB[i]; const h = w * 1.32;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.15, background: `linear-gradient(150deg, ${a}, ${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.4), inset 0 0 0 1.5px rgba(255,255,255,0.18), 0 4px 12px rgba(0,0,0,0.18)' }}>
      <DSym i={i} s={w * 0.46} />
    </div>
  );
}
function DeckBack({ w = 74, t }) {
  const h = w * 1.32;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.15, background: `linear-gradient(150deg, ${t.accent}30, ${t.surf2})`, border: `1px solid ${t.accent}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${t.accent}26 1px, transparent 1px)`, backgroundSize: '9px 9px', opacity: 0.55 }} />
      <NodeMark size={w * 0.44} bg="transparent" frame={false} tone={t.accent} toneDeep={t.accent} />
    </div>
  );
}

// ── Playing deck (Solitaire / Hearts) ───────────────────────────
function Pip({ suit, size, color }) {
  const p = {
    hearts: 'M12 21 C 3 14, 3 6, 8.5 7 C 11 7.5, 12 10, 12 11 C 12 10, 13 7.5, 15.5 7 C 21 6, 21 14, 12 21 Z',
    diamonds: 'M12 2 L20 12 L12 22 L4 12 Z',
    spades: 'M12 3 C 12 3, 4 9.5, 4 14 a3.7 3.7 0 0 0 6.6 2.3 C 10.2 18, 9 20, 8 21 L16 21 C 15 20, 13.8 18, 13.4 16.3 a3.7 3.7 0 0 0 6.6 -2.3 C 20 9.5, 12 3, 12 3 Z',
  }[suit];
  if (suit === 'clubs') return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}><g fill={color}><circle cx="12" cy="8" r="3.4" /><circle cx="8" cy="13.5" r="3.4" /><circle cx="16" cy="13.5" r="3.4" /><path d="M10.5 14 Q12 19 9 21 L15 21 Q12 19 13.5 14 Z" /></g></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}><path d={p} fill={color} /></svg>;
}
function PlayingCard({ rank, suit, w = 48, faceDown, t }) {
  const h = w * 1.4;
  if (faceDown) return <DeckBack w={w} t={t} />;
  const red = suit === 'hearts' || suit === 'diamonds';
  const col = red ? '#E0395A' : '#23262d';
  const court = ['J', 'Q', 'K'].includes(rank);
  const Corner = ({ flip }) => (
    <div style={{ position: 'absolute', [flip ? 'bottom' : 'top']: 4, [flip ? 'right' : 'left']: 5, transform: flip ? 'rotate(180deg)' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
      <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: w * 0.26, color: col }}>{rank}</span>
      <Pip suit={suit} size={w * 0.18} color={col} />
    </div>
  );
  return (
    <div style={{ width: w, height: h, background: '#fff', borderRadius: w * 0.12, border: '1px solid rgba(0,0,0,0.14)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', position: 'relative', flexShrink: 0 }}>
      <Corner /><Corner flip />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {court ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}><Icon name="crown" size={w * 0.4} color={col} stroke={2} /><Pip suit={suit} size={w * 0.22} color={col} /></div> : <Pip suit={suit} size={w * 0.46} color={col} />}
      </div>
    </div>
  );
}

const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS = ['spades','hearts','diamonds','clubs'];

// ── gallery ─────────────────────────────────────────────────────
const Mono = ({ children, c, s = 10 }) => { const t = useT(); return <div style={{ fontFamily: FONTS.mono, fontSize: s, letterSpacing: '0.2em', textTransform: 'uppercase', color: c || t.accent }}>{children}</div>; };
function Head({ kicker, title, desc }) { const t = useT(); return <div style={{ marginBottom: 26 }}><Mono>{kicker}</Mono><h2 style={{ fontFamily: t.key === 'paper' ? FONTS.serif : FONTS.display, fontWeight: 700, fontSize: 30, color: t.text, margin: '8px 0 0', fontStyle: t.key === 'paper' ? 'italic' : 'normal' }}>{title}</h2>{desc && <p style={{ fontFamily: FONTS.body, fontSize: 14, color: t.muted, margin: '8px 0 0', maxWidth: 620, lineHeight: 1.55 }}>{desc}</p>}</div>; }
function ThemeBar() { const t = useT(); return <div style={{ display: 'flex', gap: 5, background: t.surf, border: `1px solid ${t.border}`, borderRadius: 11, padding: 5 }}>{[['dark','Dark'],['light','Light'],['paper','Paper']].map(([k,l])=><div key={k} className="as-tap" onClick={()=>t.setTheme(k)} style={{ padding:'7px 16px', borderRadius:8, fontFamily:FONTS.display, fontWeight:700, fontSize:12.5, background:t.key===k?t.accent:'transparent', color:t.key===k?t.onAccent:t.muted }}>{l}</div>)}</div>; }

function Gallery() {
  const t = useT();
  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: FONTS.body }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 28px 90px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <NodeMark size={30} bg={t.surf2} tone={t.accent} toneDeep={t.accent} />
          <span style={{ fontFamily: t.key === 'paper' ? FONTS.serif : FONTS.display, fontWeight: 700, fontSize: 19, color: t.text }}>Decks & Packs</span>
          <div style={{ flex: 1 }} /><ThemeBar />
        </div>

        <Head kicker="Memory · pack 01 — Classic" title="18 collectible faces + a branded back" desc="Rendered in-house (no external art needed) — each face is self-contained so the same pack reads on dark, light and paper. 18 faces = up to 18 pairs; hard levels use 15. Earn new packs (Cosmos, Garden, Creatures) by leveling up." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ textAlign: 'center' }}><DeckBack w={74} t={t} /><div style={{ fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.1em', color: t.faint, marginTop: 7, textTransform: 'uppercase' }}>Back</div></div>
          {EMB.map((_, i) => <div key={i} style={{ textAlign: 'center' }}><EmblemCard i={i} w={74} /><div style={{ fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.06em', color: t.faint, marginTop: 7, textTransform: 'uppercase' }}>{EMB_NAMES[i]}</div></div>)}
        </div>

        <div style={{ height: 1, background: t.border, margin: '52px 0' }} />

        <Head kicker="Solitaire · Hearts" title="A full 52-card deck" desc="One brand-consistent face style — coral hearts & diamonds, slate spades & clubs, crown court cards — plus the shared card back. Drives Solitaire, Hearts and any future card game." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, overflowX: 'auto', paddingBottom: 6 }}>
          {SUITS.map((s) => (
            <div key={s} style={{ display: 'flex', gap: 6 }}>
              {RANKS.map((r) => <PlayingCard key={r} rank={r} suit={s} w={48} t={t} />)}
              <div style={{ width: 10 }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 44 }} className="lp-hero">
          <div>
            <Head kicker="In play" title="Solitaire" />
            <div style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 18, padding: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[['7s',1],['As',2],['Kh',3],['5d',2],['Tc',1],['Qs',2],['3h',1]].map(([id, down], ci) => {
                const r = id[0] === 'T' ? '10' : id[0].toUpperCase(); const su = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }[id[1]];
                return <div key={ci} style={{ position: 'relative', width: 38, height: 38 * 1.4 + down * 14 }}>
                  {Array.from({ length: down }).map((_, k) => <div key={k} style={{ position: 'absolute', top: k * 14, left: 0 }}><PlayingCard rank="" suit="s" w={38} faceDown t={t} /></div>)}
                  <div style={{ position: 'absolute', top: down * 14, left: 0 }}><PlayingCard rank={r} suit={su} w={38} t={t} /></div>
                </div>;
              })}
            </div>
          </div>
          <div>
            <Head kicker="In play" title="Hearts" />
            <div style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 18, padding: '34px 20px 20px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex' }}>
                {[['A','hearts'],['K','hearts'],['Q','spades'],['9','diamonds'],['7','clubs'],['4','hearts'],['2','spades']].map(([r, s], i, arr) => {
                  const mid = (arr.length - 1) / 2;
                  return <div key={i} style={{ marginLeft: i ? -16 : 0, transform: `rotate(${(i - mid) * 7}deg) translateY(${Math.abs(i - mid) * 5}px)`, transformOrigin: 'bottom center' }}><PlayingCard rank={r} suit={s} w={46} t={t} /></div>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function DecksApp() {
  const [theme, setTheme] = React.useState('dark');
  const t = makeT(theme, setTheme);
  React.useEffect(() => { document.body.style.background = t.bg; }, [t.bg]);
  return <TH.Provider value={t}><Gallery /></TH.Provider>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<DecksApp />);
