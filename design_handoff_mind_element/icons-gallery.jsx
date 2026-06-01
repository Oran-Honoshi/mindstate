/* icons-gallery.jsx — Mind Element · Phase 5: the full 24-game icon set. */
const D = TOKENS.theme.dark;
const GAMES24 = [
  ['tango', 'Tango', 'easy'], ['memory', 'Memory', 'easy'], ['queens', 'Queens', 'easy'], ['sudoku', 'Mini Sudoku', 'medium'],
  ['zip', 'Zip', 'medium'], ['flow', 'Flow', 'medium'], ['bridges', 'Bridges', 'medium'], ['kakuro', 'Kakuro', 'hard'],
  ['logicpath', 'Logic Path', 'medium'], ['lightup', 'Light Up', 'medium'], ['nonogram', 'Nonogram', 'hard'], ['patternmatch', 'Pattern Match', 'easy'],
  ['patches', 'Patches', 'medium'], ['2048', '2048 Pro', 'medium'], ['gravity', 'Gravity Sort', 'medium'], ['hexmerge', 'Hex Merge', 'hard'],
  ['wordsling', 'Word Sling', 'easy'], ['hearts', 'Hearts', 'medium'], ['solitaire', 'Solitaire', 'easy'], ['minesweeper', 'Minesweeper', 'hard'],
  ['wordclimb', 'Word Climb', 'easy'], ['pinpoint', 'Pinpoint', 'easy'], ['namecountry', 'Name the Country', 'easy'], ['namecity', 'Name the City', 'medium'],
];
const DIFF = { easy: TOKENS.easy, medium: TOKENS.medium, hard: TOKENS.hard };

function Gallery() {
  return (
    <div style={{ minHeight: '100vh', background: D.bg, padding: '56px 24px 80px', fontFamily: FONTS.body }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <NodeMark size={34} bg={D.surf2} />
          <div style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: '0.2em', color: D.accent, textTransform: 'uppercase' }}>Phase 5 · icon system</div>
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 38, color: D.text, letterSpacing: '-0.02em' }}>24 games, one visual family.</div>
        <div style={{ fontFamily: FONTS.body, fontSize: 15, color: D.muted, marginTop: 10, maxWidth: 560, lineHeight: 1.55 }}>A shared rounded tile plus a single-idea geometric glyph per game. Each reads at any size — grid, daily, leaderboard, app icon — and replaces the tiny live-board thumbnails. Built from primitives, no emoji.</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 18, marginTop: 40 }}>
          {GAMES24.map(([g, name, diff]) => (
            <div key={g} style={{ background: D.surf, border: `1px solid ${D.border}`, borderRadius: 16, padding: '20px 12px 14px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><GameIcon game={g} size={76} /></div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, color: D.text, marginTop: 14 }}>{name}</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIFF[diff], marginTop: 5 }}>{diff}</div>
            </div>
          ))}
        </div>

        {/* scale check */}
        <div style={{ marginTop: 48, fontFamily: FONTS.mono, fontSize: 10, letterSpacing: '0.2em', color: D.faint, textTransform: 'uppercase', marginBottom: 16 }}>Reads at every size</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap', background: D.surf, border: `1px solid ${D.border}`, borderRadius: 16, padding: 24 }}>
          {[96, 64, 48, 36, 28, 22].map((s) => (
            <div key={s} style={{ textAlign: 'center' }}>
              <GameIcon game="queens" size={s} />
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: D.faint, marginTop: 8 }}>{s}px</div>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            {['tango', 'flow', 'hexmerge', 'hearts', 'namecity'].map((g) => <GameIcon key={g} game={g} size={40} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<Gallery />);
