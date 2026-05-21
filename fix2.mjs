import fs from "fs";

const GAMES = [
  ["tango",         "Tango",            100,  "src/app/games/tango/page.tsx"],
  ["memory",        "Memory",           100,  "src/app/games/memory/page.tsx"],
  ["queens",        "Queens",           1000, "src/app/games/queens/page.tsx"],
  ["sudoku",        "Mini Sudoku",      1000, "src/app/games/sudoku/page.tsx"],
  ["zip",           "Zip",              1000, "src/app/games/zip/page.tsx"],
  ["flow",          "Flow",             100,  "src/app/games/flow/page.tsx"],
  ["bridges",       "Bridges",         1000, "src/app/games/bridges/page.tsx"],
  ["kakuro",        "Kakuro",           1000, "src/app/games/kakuro/page.tsx"],
  ["logic-path",    "Logic Path",       1000, "src/app/games/logic-path/page.tsx"],
  ["lightup",       "Light Up",         100,  "src/app/games/lightup/page.tsx"],
  ["nonogram",      "Nonogram",         100,  "src/app/games/nonogram/page.tsx"],
  ["pattern-match", "Pattern Match",    100,  "src/app/games/pattern-match/page.tsx"],
  ["patches",       "Patches",          1000, "src/app/games/patches/page.tsx"],
  ["2048-pro",      "2048 Pro",         1000, "src/app/games/2048-pro/page.tsx"],
  ["gravity-sort",  "Gravity Sort",     100,  "src/app/games/gravity-sort/page.tsx"],
  ["hex-merge",     "Hex Merge",        100,  "src/app/games/hex-merge/page.tsx"],
  ["word-sling",    "Word Sling",       1000, "src/app/games/word-sling/page.tsx"],
  ["hearts",        "Hearts",           1000, "src/app/games/hearts/page.tsx"],
  ["solitaire",     "Solitaire",        1000, "src/app/games/solitaire/page.tsx"],
  ["minesweeper",   "Minesweeper",      1000, "src/app/games/minesweeper/page.tsx"],
  ["word-climb",    "Word Climb",       100,  "src/app/games/word-climb/page.tsx"],
  ["pinpoint",      "Pinpoint",         100,  "src/app/games/pinpoint/page.tsx"],
  ["name-country",  "Name the Country", 100,  "src/app/games/name-country/page.tsx"],
  ["name-city",     "Name the City",    100,  "src/app/games/name-city/page.tsx"],
];

let fixed = 0;

for (const [slug, gameName, totalStages, filePath] of GAMES) {
  if (!fs.existsSync(filePath)) {
    console.warn(`SKIP (not found): ${filePath}`);
    continue;
  }

  let src = fs.readFileSync(filePath, "utf8");
  let changed = false;

  // ── Fix 1: add missing GameCompleteModal import ───────────────────────────
  if (src.includes("GameCompleteModal") && !src.includes("@/components/ui/GameCompleteModal")) {
    src = src.replace(
      /import\s*\{\s*CompletionPopup\s*\}\s*from\s*["']@\/components\/ui\/CompletionPopup["'];/,
      `import { CompletionPopup } from "@/components/ui/CompletionPopup";\nimport { GameCompleteModal } from "@/components/ui/GameCompleteModal";`
    );
    changed = true;
    console.log(`  + added GameCompleteModal import: ${slug}`);
  }

  // ── Fix 2: add missing state vars if not present ──────────────────────────
  if (src.includes("showGameComplete") && !src.includes("useState(false); // gcm")) {
    // Check if the useState declarations are actually missing (outside component)
    // We detect this by checking if showGameComplete appears only in JSX, not in useState
    if (!src.includes("const [showGameComplete")) {
      // Find the solutionRevealed useState and add after it
      src = src.replace(
        /const \[solutionRevealed, setSolutionRevealed\] = useState\(false\);/,
        `const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false); // gcm`
      );
      changed = true;
      console.log(`  + added state vars: ${slug}`);
    }
  }

  // ── Fix 3: move misplaced <GameCompleteModal> inside the component ─────────
  // The patch placed it after the closing } of the inner function, before export default.
  // Pattern: it appears between the last }) of the inner function and "export default"
  const misplacedPattern = /\n(\s*<GameCompleteModal[\s\S]*?\/>\n)([\s\S]*?export default)/;
  if (misplacedPattern.test(src)) {
    // Remove it from where it is
    const modalMatch = src.match(/<GameCompleteModal[\s\S]*?\/>/);
    if (modalMatch) {
      const modalJSX = modalMatch[0];
      // Remove the misplaced one
      src = src.replace(/\n\s*<GameCompleteModal[\s\S]*?\/>\n(\s*\nexport default)/, "\n$1");
      // Now insert it inside the return statement, just before the closing </div> before export default
      // Find the last </div> before export default in the inner component's return
      src = src.replace(
        /(\s*<\/div>\s*\);\s*\})\s*\nexport default/,
        `\n      <GameCompleteModal\n        open={showGameComplete}\n        gameName="${gameName}"\n        totalStages={TOTAL_STAGES}\n        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}\n        onClose={() => setShowGameComplete(false)}\n      />\n$1\nexport default`
      );
      changed = true;
      console.log(`  + moved GameCompleteModal inside component: ${slug}`);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, src, "utf8");
    console.log(`✅ fixed: ${slug}`);
    fixed++;
  } else {
    console.log(`✓  no changes needed: ${slug}`);
  }
}

console.log(`\nDone — ${fixed} files fixed.`);