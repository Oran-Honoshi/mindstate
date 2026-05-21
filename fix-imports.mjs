import fs from "fs";

const files = [
  "src/app/games/2048-pro/page.tsx",
  "src/app/games/sudoku/page.tsx",
  "src/app/games/zip/page.tsx",
  "src/app/games/flow/page.tsx",
  "src/app/games/bridges/page.tsx",
  "src/app/games/kakuro/page.tsx",
  "src/app/games/logic-path/page.tsx",
  "src/app/games/lightup/page.tsx",
  "src/app/games/nonogram/page.tsx",
  "src/app/games/pattern-match/page.tsx",
  "src/app/games/patches/page.tsx",
  "src/app/games/gravity-sort/page.tsx",
  "src/app/games/hex-merge/page.tsx",
  "src/app/games/word-sling/page.tsx",
  "src/app/games/hearts/page.tsx",
  "src/app/games/solitaire/page.tsx",
  "src/app/games/minesweeper/page.tsx",
  "src/app/games/word-climb/page.tsx",
  "src/app/games/pinpoint/page.tsx",
  "src/app/games/name-country/page.tsx",
  "src/app/games/name-city/page.tsx",
  "src/app/games/tango/page.tsx",
  "src/app/games/memory/page.tsx",
  "src/app/games/queens/page.tsx",
];

let fixed = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let src = fs.readFileSync(f, "utf8");
  const hasUsage = src.includes("GameCompleteModal");
  const hasImport = src.includes("@/components/ui/GameCompleteModal");
  if (hasUsage && !hasImport) {
    src = src.replace(
      /import\s*\{\s*CompletionPopup\s*\}\s*from\s*["']@\/components\/ui\/CompletionPopup["'];/,
      `import { CompletionPopup } from "@/components/ui/CompletionPopup";\nimport { GameCompleteModal } from "@/components/ui/GameCompleteModal";`
    );
    fs.writeFileSync(f, src);
    console.log("Fixed:", f);
    fixed++;
  }
}
console.log(fixed + " files fixed");