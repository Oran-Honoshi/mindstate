/* game-cards.jsx — comparison: icon vs board-render vs hybrid for the games grid.
   Uses the shared BoardPreview (previews.jsx, all 24 games). */
const D = TOKENS.theme.dark;
const Micro = ({ children, c, s = 9.5, st }) => (<div style={{ fontFamily: FONTS.mono, fontSize: s, letterSpacing: '0.18em', textTransform: 'uppercase', color: c || D.faint, ...st }}>{children}</div>);
const DIFF = { easy: TOKENS.easy, medium: TOKENS.medium, hard: TOKENS.hard };

function CardIcon({ game, name, diff, prog }) {
  return (<div style={{ background: D.surf, border: `1px solid ${D.border}`, borderRadius: 16, padding: 14, width: 200 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <GameIcon game={game} size={52} />
      <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: D.text }}>{name}</div><div style={{ display: 'flex', gap: 6, marginTop: 5, alignItems: 'center' }}><span style={{ fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIFF[diff] }}>{diff}</span><span style={{ fontFamily: FONTS.mono, fontSize: 8, color: D.faint }}>· {prog}/100</span></div></div>
    </div>
    <div style={{ height: 4, background: D.surf2, borderRadius: 2, marginTop: 12 }}><div style={{ width: prog + '%', height: '100%', background: TOKENS.cyan, borderRadius: 2 }} /></div>
  </div>);
}
function CardBoard({ game, name, diff, prog }) {
  return (<div style={{ background: D.surf, border: `1px solid ${D.border}`, borderRadius: 16, overflow: 'hidden', width: 200 }}>
    <div style={{ height: 138, background: D.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${D.border}`, overflow: 'hidden' }}><div style={{ transform: 'scale(0.92)' }}><BoardPreview game={game} size={18} gap={3} /></div></div>
    <div style={{ padding: 13 }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: D.text }}>{name}</div><div style={{ display: 'flex', gap: 6, marginTop: 5, alignItems: 'center' }}><span style={{ fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIFF[diff] }}>{diff}</span><span style={{ fontFamily: FONTS.mono, fontSize: 8, color: D.faint }}>· {prog}/100</span></div></div>
  </div>);
}
function CardHybrid({ game, name, diff, prog }) {
  return (<div style={{ background: D.surf, border: `1px solid ${D.border}`, borderRadius: 16, overflow: 'hidden', width: 200 }}>
    <div style={{ height: 128, background: `radial-gradient(120% 100% at 50% 0%, ${TOKENS.cyan}10, ${D.bg})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ transform: 'scale(0.82)', opacity: 0.95 }}><BoardPreview game={game} size={18} gap={3} /></div>
    </div>
    <div style={{ padding: '0 13px 13px', display: 'flex', alignItems: 'center', gap: 11, marginTop: -20, position: 'relative' }}>
      <div style={{ borderRadius: 14, boxShadow: '0 6px 18px rgba(0,0,0,0.55)' }}><GameIcon game={game} size={44} /></div>
      <div style={{ flex: 1, paddingTop: 20 }}><div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: D.text }}>{name}</div><div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}><span style={{ fontFamily: FONTS.mono, fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIFF[diff] }}>{diff}</span><span style={{ fontFamily: FONTS.mono, fontSize: 8, color: D.faint }}>· {prog}</span></div></div>
    </div>
  </div>);
}

const SAMPLE = [['tango', 'Tango', 'easy', 27], ['queens', 'Queens', 'easy', 12], ['flow', 'Flow', 'medium', 33], ['minesweeper', 'Minesweeper', 'hard', 2]];

function Compare() {
  const sections = [
    ['A · Icon only', 'Cleanest & most consistent. Best for nav, leaderboard, daily, mastery rows. Abstract — doesn’t show the game.', CardIcon],
    ['B · Board render', 'Most recognizable — shows the real game. Designed mini-board, not the noisy live thumbnail. Heavier; less brand-tight.', CardBoard],
    ['C · Hybrid (chosen)', 'Board preview for discovery + the icon as identity badge. Recognizable AND premium. Used on the big grid; icons everywhere small.', CardHybrid],
  ];
  return (
    <div style={{ minHeight: '100vh', background: D.bg, padding: '52px 32px 80px', fontFamily: FONTS.body }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Micro c={TOKENS.cyan}>Game cards · direction</Micro>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 34, color: D.text, marginTop: 8, letterSpacing: '-0.02em' }}>Icon, board render, or both?</div>
        <div style={{ fontFamily: FONTS.body, fontSize: 14, color: D.muted, marginTop: 10, maxWidth: 620, lineHeight: 1.55 }}>Same four games, three treatments. The board previews are <i>designed</i> renders of each game’s real screen — clean, not the busy live thumbnails. All 24 are built.</div>
        {sections.map(([title, desc, Card]) => (
          <div key={title} style={{ marginTop: 40 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, color: D.text }}>{title}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: D.muted, marginTop: 5, maxWidth: 640, lineHeight: 1.5 }}>{desc}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
              {SAMPLE.map(([g, n, d, p]) => <Card key={g} game={g} name={n} diff={d} prog={p} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<Compare />);
