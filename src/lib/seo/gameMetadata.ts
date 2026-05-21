// Shared metadata generator for all game pages
// Usage in each game's page.tsx:
//
//   import { generateGameMetadata } from "@/lib/seo/gameMetadata";
//   export const metadata = generateGameMetadata("tango");
//
// Or as a function for dynamic routes:
//   export function generateMetadata() {
//     return generateGameMetadata("tango");
//   }

import type { Metadata } from "next";

const GAME_META: Record<string, { name: string; description: string; keywords: string[] }> = {
  "tango": {
    name: "Tango Logic Puzzle",
    description: "Balance rows and columns using Sun and Moon symbols. Equal counts per line, no three in a row. 100 stages from Easy to Hard.",
    keywords: ["tango puzzle", "logic game", "sun moon puzzle", "brain training"],
  },
  "memory": {
    name: "Memory Card Game",
    description: "Flip cards to find matching pairs. 100 stages with increasing pair counts. Tests visual memory and pattern recall.",
    keywords: ["memory game", "card matching", "brain training", "concentration game"],
  },
  "queens": {
    name: "Queens Constraint Puzzle",
    description: "Place one queen per row, column, and colored region without adjacency. 100 stages of constraint logic.",
    keywords: ["queens puzzle", "constraint puzzle", "logic game", "n-queens"],
  },
  "sudoku": {
    name: "Mini Sudoku",
    description: "Fill a 6×6 or 9×9 grid so every row, column, and box contains each number exactly once. 100 stages.",
    keywords: ["sudoku", "mini sudoku", "number puzzle", "logic puzzle"],
  },
  "zip": {
    name: "Zip Path Puzzle",
    description: "Trace a single path through every cell in order, hitting numbered waypoints in sequence. 100 stages.",
    keywords: ["zip puzzle", "path puzzle", "hamiltonian path", "logic game"],
  },
  "flow": {
    name: "Flow Connection Puzzle",
    description: "Draw paths to connect matching colored dots while filling every cell on the board. 100 stages.",
    keywords: ["flow game", "flow free", "color connection puzzle", "logic game"],
  },
  "bridges": {
    name: "Bridges Island Puzzle",
    description: "Connect islands with bridges so each island has exactly the required number of connections. 100 stages.",
    keywords: ["bridges puzzle", "hashiwokakero", "island bridges", "logic puzzle"],
  },
  "kakuro": {
    name: "Kakuro Number Puzzle",
    description: "Fill white cells with digits so each run sums to its clue with no repeated digits. 100 stages.",
    keywords: ["kakuro", "cross sums", "number puzzle", "logic puzzle"],
  },
  "logic-path": {
    name: "Logic Path Pipe Puzzle",
    description: "Rotate pipe segments to create a fully connected network with no open ends. 100 stages.",
    keywords: ["pipe puzzle", "logic path", "network puzzle", "rotation puzzle"],
  },
  "lightup": {
    name: "Light Up Puzzle",
    description: "Place light bulbs to illuminate every white cell without any two bulbs shining on each other. 100 stages.",
    keywords: ["light up puzzle", "akari", "illumination puzzle", "logic puzzle"],
  },
  "nonogram": {
    name: "Nonogram Pixel Puzzle",
    description: "Reveal a hidden pixel image using row and column number clues. 100 stages from Easy to Hard.",
    keywords: ["nonogram", "picross", "pixel puzzle", "logic puzzle"],
  },
  "pattern-match": {
    name: "Pattern Match",
    description: "Identify the rule governing a sequence and select the correct next element. 100 stages.",
    keywords: ["pattern matching", "sequence puzzle", "IQ test", "brain training"],
  },
  "patches": {
    name: "Patches Polyomino Puzzle",
    description: "Tile a grid completely using the provided polyomino pieces without gaps or overlaps. 100 stages.",
    keywords: ["polyomino puzzle", "tiling puzzle", "patches game", "logic puzzle"],
  },
  "2048-pro": {
    name: "2048 Pro Merge Puzzle",
    description: "Slide and merge numbered tiles to reach the target value before the board fills. 100 stages with escalating targets.",
    keywords: ["2048 game", "merge puzzle", "number puzzle", "2048 pro"],
  },
  "gravity-sort": {
    name: "Gravity Sort",
    description: "Move colored blocks between columns to sort each color into its own dedicated column. 100 stages.",
    keywords: ["gravity sort", "block sorting", "color sort puzzle", "logic game"],
  },
  "hex-merge": {
    name: "Hex Merge Puzzle",
    description: "Select and merge adjacent hexagonal tiles of equal value to reach the target number. 100 stages.",
    keywords: ["hex merge", "hexagon puzzle", "merge game", "logic puzzle"],
  },
  "word-sling": {
    name: "Word Sling",
    description: "Guess the hidden word in six attempts using color-coded letter feedback. 100 stages with increasing word length.",
    keywords: ["wordle", "word game", "word puzzle", "letter game"],
  },
  "hearts": {
    name: "Hearts Card Game",
    description: "Play cards to avoid collecting hearts and the queen of spades. 100 stages of trick-taking strategy.",
    keywords: ["hearts card game", "trick taking", "card game", "strategy game"],
  },
  "solitaire": {
    name: "Solitaire Klondike",
    description: "Build four foundation piles from Ace to King by strategically moving cards between tableau columns. 100 stages.",
    keywords: ["solitaire", "klondike solitaire", "card game", "patience"],
  },
  "minesweeper": {
    name: "Minesweeper",
    description: "Reveal safe cells and flag hidden mines using number clues about adjacent mine counts. 100 stages.",
    keywords: ["minesweeper", "mine puzzle", "logic deduction", "classic game"],
  },
  "word-climb": {
    name: "Word Climb",
    description: "Transform one word into another by changing one letter at a time through valid intermediate words. 100 stages.",
    keywords: ["word ladder", "word climb", "word game", "vocabulary puzzle"],
  },
  "pinpoint": {
    name: "Pinpoint Word Game",
    description: "Identify the hidden word from a series of category clues revealed one at a time. 100 stages.",
    keywords: ["pinpoint game", "word guessing", "category clues", "word game"],
  },
  "name-country": {
    name: "Name the Country",
    description: "Identify countries from their flags using Wordle-style letter feedback. 100 stages across all continents.",
    keywords: ["name the country", "flag quiz", "geography game", "country guessing"],
  },
  "name-city": {
    name: "Name the City",
    description: "Identify cities from their flags and continent clues using Wordle-style letter feedback. 100 stages.",
    keywords: ["name the city", "city quiz", "geography game", "city guessing"],
  },
};

export function generateGameMetadata(slug: string): Metadata {
  const meta = GAME_META[slug];
  if (!meta) return { title: "MindElement" };

  return {
    title: meta.name,
    description: meta.description,
    keywords: [
      ...meta.keywords,
      "MindElement", "brain training", "logic puzzle", "free puzzle game",
    ],
    openGraph: {
      title: `${meta.name} | MindElement`,
      description: meta.description,
      url: `https://mindelement.app/games/${slug}`,
      siteName: "MindElement",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.name} | MindElement`,
      description: meta.description,
      images: ["/og-image.png"],
    },
  };
}

export { GAME_META };