/**
 * patch-smart-routing.mjs
 * Run from project root: node patch-smart-routing.mjs
 */

import fs from "fs";
import path from "path";

const GAMES = [
  ["tango",         "Tango",            100,  "src/app/games/tango/page.tsx"],
  ["memory",        "Memory",           100,  "src/app/games/memory/page.tsx"],
  ["queens",        "Queens",           1000, "src/app/games/queens/page.tsx"],
  ["sudoku",        "Mini Sudoku",      1000, "src/app/games/sudoku/page.tsx"],
  ["zip",           "Zip",              1000, "src/app/games/zip/page.tsx"],
  ["flow",          "Flow",             100,  "src/app/games/flow/page.tsx"],
  ["bridges",       "Bridges",          1000, "src/app/games/bridges/page.tsx"],
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

let patched = 0, skipped = 0, notFound = 0;

for (const [slug, gameName, totalStages, filePath] of GAMES) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠  NOT FOUND: ${filePath}`);
    notFound++;
    continue;
  }

  let src = fs.readFileSync(filePath, "utf8");

  // Guard: skip if already patched
  if (src.includes("shouldShowGameCompleteModal")) {
    console.log(`✓  already patched: ${slug}`);
    skipped++;
    continue;
  }

  // ── 1. Expand stageProgress import ───────────────────────────────────────
  src = src.replace(
    /import\s*\{([^}]*getLastStage[^}]*)\}\s*from\s*["']@\/lib\/games\/stageProgress["']/,
    (match, inner) => {
      const existing = inner.split(",").map(s => s.trim()).filter(Boolean);
      const toAdd = ["getLastStageRemote", "getNextUncompletedStage", "shouldShowGameCompleteModal"];
      const merged = [...new Set([...existing, ...toAdd])].join(", ");
      return `import { ${merged} } from "@/lib/games/stageProgress"`;
    }
  );

  // ── 2. Add GameCompleteModal import after CompletionPopup import ──────────
  if (!src.includes("GameCompleteModal")) {
    src = src.replace(
      /import\s*\{\s*CompletionPopup\s*\}\s*from\s*["']@\/components\/ui\/CompletionPopup["'];/,
      `import { CompletionPopup } from "@/components/ui/CompletionPopup";\nimport { GameCompleteModal } from "@/components/ui/GameCompleteModal";`
    );
  }

  // ── 3. Add TOTAL_STAGES + GAME_SLUG constants after "use client" ──────────
  if (!src.includes("TOTAL_STAGES")) {
    src = src.replace(
      /^"use client";/m,
      `"use client";\nconst TOTAL_STAGES = ${totalStages};\nconst GAME_SLUG = "${slug}";`
    );
  }

  // ── 4. Wrap getLastStage init with Math.max(1, ...) ───────────────────────
  src = src.replace(
    new RegExp(`useState\\(\\(\\)\\s*=>\\s*getLastStage\\(["']${slug}["']\\)\\)`),
    `useState(() => Math.max(1, getLastStage(GAME_SLUG)))`
  );

  // ── 5. Cross-device sync useEffect ───────────────────────────────────────
  if (!src.includes("getLastStageRemote")) {
    const syncEffect = `
  // Cross-device stage sync
  useEffect(() => {
    let cancelled = false;
    getLastStageRemote(GAME_SLUG).then(remote => {
      if (cancelled) return;
      if (remote > 0 && remote > stage) setStage(remote);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
`;
    src = src.replace(
      /(const loadStage\s*=\s*useCallback)/,
      syncEffect + "$1"
    );
  }

  // ── 6. Add state vars after solutionRevealed ──────────────────────────────
  if (!src.includes("nextUncompleted")) {
    src = src.replace(
      /const\s*\[solutionRevealed,\s*setSolutionRevealed\]\s*=\s*useState\(false\);/,
      `const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);`
    );
  }

  // ── 7. Reset nextUncompleted inside loadStage ────────────────────────────
  if (!src.includes("setNextUncompleted(null)")) {
    src = src.replace(
      /setSolutionRevealed\(false\);/,
      `setSolutionRevealed(false);\n    setNextUncompleted(null);`
    );
  }

  // ── 8. Smart routing after markStageCompleted ────────────────────────────
  if (!src.includes("getNextUncompletedStage")) {
    const smartLines = `
      const _next = getNextUncompletedStage(GAME_SLUG, TOTAL_STAGES);
      setNextUncompleted(_next);
      if (shouldShowGameCompleteModal(GAME_SLUG, TOTAL_STAGES)) {
        setTimeout(() => setShowGameComplete(true), 1800);
      }`;
    // Try quoted slug form first
    const quotedPattern = new RegExp(
      `(markStageCompleted\\(["']${slug}["'],\\s*stage\\);)`
    );
    if (quotedPattern.test(src)) {
      src = src.replace(quotedPattern, `$1${smartLines}`);
    } else {
      // Fall back to GAME_SLUG variable form
      src = src.replace(
        /(markStageCompleted\(GAME_SLUG,\s*stage\);)/,
        `$1${smartLines}`
      );
    }
  }

  // ── 9. Add onGoToLatest + nextUncompletedStage to CompletionPopup ─────────
  if (!src.includes("onGoToLatest")) {
    // Add props after the last onNext={...} before the closing of CompletionPopup
    src = src.replace(
      /(onNext=\{[^\}]+\})\s*(onShare|\/>)/g,
      `$1\n        onGoToLatest={nextUncompleted != null ? () => { setCompleted(false); setStage(nextUncompleted!); } : undefined}\n        nextUncompletedStage={nextUncompleted ?? undefined}\n        $2`
    );
  }

  // ── 10. Add <GameCompleteModal> just before the closing export default ─────
  if (!src.includes("<GameCompleteModal")) {
    src = src.replace(
      /(\n\nexport default function)/,
      `\n      <GameCompleteModal\n        open={showGameComplete}\n        gameName="${gameName}"\n        totalStages={TOTAL_STAGES}\n        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}\n        onClose={() => setShowGameComplete(false)}\n      />\n$1`
    );
  }

  fs.writeFileSync(filePath, src, "utf8");
  console.log(`✅  patched: ${slug} (${totalStages} stages)`);
  patched++;
}

console.log(`\nDone — ${patched} patched, ${skipped} already done, ${notFound} not found.`);