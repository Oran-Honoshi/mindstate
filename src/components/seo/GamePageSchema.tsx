// Auto-generated game schema component
// Usage: <GamePageSchema slug="tango" /> inside any game page return()
// Renders JSON-LD Game structured data for Google rich results + AI crawlers

const GAME_META: Record<string, { name: string; description: string }> = {
  "tango": {
    name: "Tango Logic Puzzle",
    description: "Balance rows and columns using Sun and Moon symbols with equal counts and no three in a row.",
  },
  "memory": {
    name: "Memory Card Game",
    description: "Flip cards to find matching pairs. Tests visual memory and pattern recall across 100 stages.",
  },
  "queens": {
    name: "Queens Constraint Puzzle",
    description: "Place one queen per row, column, and colored region without adjacency conflicts.",
  },
  "sudoku": {
    name: "Mini Sudoku",
    description: "Fill a 6x6 or 9x9 grid so every row, column, and box contains each number exactly once.",
  },
  "zip": {
    name: "Zip Path Puzzle",
    description: "Trace a single path through every cell in order, hitting numbered waypoints in sequence.",
  },
  "flow": {
    name: "Flow Connection Puzzle",
    description: "Draw paths to connect matching colored dots while filling every cell on the board.",
  },
  "bridges": {
    name: "Bridges Island Puzzle",
    description: "Connect islands with bridges so each island has exactly the required number of connections.",
  },
  "kakuro": {
    name: "Kakuro Number Puzzle",
    description: "Fill white cells with digits so each run sums to its clue with no repeated digits.",
  },
  "logic-path": {
    name: "Logic Path Pipe Puzzle",
    description: "Rotate pipe segments to create a fully connected network with no open ends.",
  },
  "lightup": {
    name: "Light Up Puzzle",
    description: "Place light bulbs to illuminate every white cell without any two bulbs shining on each other.",
  },
  "nonogram": {
    name: "Nonogram Pixel Puzzle",
    description: "Reveal a hidden pixel image using row and column number clues.",
  },
  "pattern-match": {
    name: "Pattern Match",
    description: "Identify the rule governing a sequence and select the correct next element.",
  },
  "patches": {
    name: "Patches Polyomino Puzzle",
    description: "Tile a grid completely using the provided polyomino pieces without gaps or overlaps.",
  },
  "2048-pro": {
    name: "2048 Pro Merge Puzzle",
    description: "Slide and merge numbered tiles to reach the target value before the board fills.",
  },
  "gravity-sort": {
    name: "Gravity Sort",
    description: "Move colored blocks between columns to sort each color into its own dedicated column.",
  },
  "hex-merge": {
    name: "Hex Merge Puzzle",
    description: "Select and merge adjacent hexagonal tiles of equal value to reach the target number.",
  },
  "word-sling": {
    name: "Word Sling Wordle",
    description: "Guess the hidden word in six attempts using color-coded letter feedback.",
  },
  "hearts": {
    name: "Hearts Card Game",
    description: "Play cards to avoid collecting hearts and the queen of spades in this trick-taking game.",
  },
  "solitaire": {
    name: "Solitaire Klondike",
    description: "Build four foundation piles from Ace to King by strategically moving cards between tableau columns.",
  },
  "minesweeper": {
    name: "Minesweeper",
    description: "Reveal safe cells and flag hidden mines using number clues about adjacent mine counts.",
  },
  "word-climb": {
    name: "Word Climb",
    description: "Transform one word into another by changing one letter at a time through valid intermediate words.",
  },
  "pinpoint": {
    name: "Pinpoint Word Game",
    description: "Identify the hidden word from a series of category clues revealed one at a time.",
  },
  "name-country": {
    name: "Name the Country",
    description: "Identify countries from their flags using Wordle-style letter feedback.",
  },
  "name-city": {
    name: "Name the City",
    description: "Identify cities from their flags and continent clues using Wordle-style letter feedback.",
  },
};

export function GamePageSchema({ slug }: { slug: string }) {
  const meta = GAME_META[slug];
  if (!meta) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": meta.name,
    "url": `https://mindstate.vercel.app/games/${slug}`,
    "description": meta.description,
    "gamePlatform": ["Web Application", "Progressive Web App"],
    "genre": "Logic Puzzle",
    "applicationCategory": "GameApplication",
    "numberOfPlayers": {
      "@type": "QuantitativeValue",
      "minValue": 1,
      "maxValue": 1,
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Children, Adults, Seniors",
    },
    "inLanguage": ["en", "es", "de", "fr", "pt", "nl", "he"],
    "isPartOf": {
      "@type": "WebApplication",
      "name": "MindElement",
      "url": "https://mindstate.vercel.app",
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free to play with 5 daily plays. Unlimited with Pro at $2/month.",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}