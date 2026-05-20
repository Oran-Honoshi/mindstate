// JSON-LD Schema components for SEO + AI crawlers
// FAQPage, HowTo, Organization, WebApplication, Game schemas

const DOMAIN = "https://mindstate.vercel.app";

const FAQ_DATA = [
  { q: "Is MindState free to use?",
    a: "Yes — free users get 5 plays per day across all 24 games. Daily challenges are always free. Subscribe for unlimited access at $2/month." },
  { q: "What does Pro include?",
    a: "Unlimited plays across all 24 games, all 100 stages per game, family leaderboards for up to 7 members, and early access to new games." },
  { q: "How much does Pro cost?",
    a: "Individual Pro is $2/month. Family plans start at $5/month for 3 members and $10/month for 7 members." },
  { q: "Can I cancel anytime?",
    a: "Yes. Cancel from your profile settings at any time. You keep access until the end of your billing period." },
  { q: "What are the 24 games?",
    a: "Tango, Memory, Queens, Sudoku, Zip, Minesweeper, Flow, Nonogram, Bridges, Pattern Match, 2048 Pro, Kakuro, Gravity Sort, Hex Merge, Logic Path, Light Up, Patches, Word Sling, Hearts, Solitaire, Word Climb, Pinpoint, Name the Country, and Name the City." },
  { q: "Is MindState appropriate for young children?",
    a: "Yes. The logic puzzle format builds spatial reasoning, pattern recognition, and strategic thinking without sensory overload. Games are ad-free and distraction-free, making them a screen time option parents can feel good about." },
  { q: "Can the games help older adults maintain mental agility?",
    a: "Yes. Regular engagement with algorithmic logic puzzles exercises fluid intelligence, visual working memory, and cognitive pattern-tracking. MindState also includes an Accessibility Mode with larger touch targets and optional timer-free play, designed for comfortable daily use at any age." },
  { q: "How does the family group billing work?",
    a: "One monthly charge covers up to 3 or 7 independent player profiles. Each family member gets their own progress, XP, and stage history, plus access to a shared family leaderboard showing everyone's daily challenge results." },
  { q: "Do I need an account to play?",
    a: "No — you can play as a guest. Creating a free account saves your progress, streaks, and XP scores to the global leaderboard." },
  { q: "Does it work offline?",
    a: "Yes. MindState is a Progressive Web App. Install it to your home screen and play without an internet connection." },
  { q: "Are new games coming?",
    a: "Yes — additional games are in development including Chess Puzzles, Cryptogram, and Calcudoku. Pro subscribers get early access first." },
  { q: "What languages does MindState support?",
    a: "MindState supports 7 languages: English, Spanish, German, French, Portuguese, Dutch, and Hebrew with full right-to-left layout." },
  { q: "Is MindState good for brain training?",
    a: "MindState covers 24 logic disciplines spanning spatial reasoning, numerical logic, memory, and pattern recognition. Daily practice across disciplines supports cognitive fitness for children, professionals, and seniors alike." },
];

export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MindState",
    "url": DOMAIN,
    "logo": `${DOMAIN}/icons/icon-512.png`,
    "description": "MindState is a minimalist brain-training PWA for children, professionals, and seniors — 24 logic games, 100 stages each, ad-free.",
    "sameAs": [],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebAppSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MindState",
    "url": DOMAIN,
    "applicationCategory": "EducationalApplication, GameApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires a modern web browser. Installable as a PWA on iOS and Android.",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "0",
      "highPrice": "10.00",
      "offerCount": "4",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free",
          "price": "0",
          "priceCurrency": "USD",
          "description": "5 daily plays across all 24 games. Daily challenges always free.",
        },
        {
          "@type": "Offer",
          "name": "Individual Pro",
          "price": "2.00",
          "priceCurrency": "USD",
          "description": "Unlimited plays, all 100 stages per game, global leaderboard.",
        },
        {
          "@type": "Offer",
          "name": "Family 3",
          "price": "5.00",
          "priceCurrency": "USD",
          "description": "3 member profiles, family leaderboard, all Individual Pro features.",
        },
        {
          "@type": "Offer",
          "name": "Family 7",
          "price": "10.00",
          "priceCurrency": "USD",
          "description": "7 member profiles, family leaderboard, all Individual Pro features.",
        },
      ],
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Children, Adults, Seniors, Families",
    },
    "description": "24 precision logic games for every mind. Sharper every day.",
    "featureList": [
      "24 logic and word games",
      "100 algorithmic stages per game",
      "Daily challenges",
      "XP scoring with real-time decay",
      "Hint system",
      "Family group leaderboards",
      "Cross-device PWA, works offline",
      "Accessibility mode for seniors",
      "Ad-free",
    ],
    "inLanguage": ["en", "es", "de", "fr", "pt", "nl", "he"],
    "screenshot": `${DOMAIN}/og-image.png`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function HowToSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to play MindState brain training games",
    "description": "Get started with MindState in 3 steps",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Choose a game",
        "text": "Browse 24 logic disciplines — from Tango and Queens to Sudoku and Nonogram. Each has 100 stages from Easy to Hard. Three games are always free.",
      },
      {
        "@type": "HowToStep",
        "name": "Solve the puzzle",
        "text": "Use logic to complete each stage. XP decays over time so faster, cleaner solves earn more points. Use hints sparingly — each costs 100 XP.",
      },
      {
        "@type": "HowToStep",
        "name": "Build your streak",
        "text": "Play daily challenges to build a streak. 7 consecutive days earns 10 bonus plays. Your XP and progress are saved to the global and family leaderboards.",
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Per-game schema — use in each game's page.tsx generateMetadata or as a component
export function GameSchema({ slug, name, description }: { slug: string; name: string; description: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": name,
    "url": `${DOMAIN}/games/${slug}`,
    "description": description,
    "gamePlatform": "Web Application, Progressive Web App",
    "genre": "Logic Puzzle",
    "applicationCategory": "GameApplication",
    "audience": {
      "@type": "Audience",
      "audienceType": "Children, Adults, Seniors",
    },
    "inLanguage": ["en", "es", "de", "fr", "pt", "nl", "he"],
    "isPartOf": {
      "@type": "WebApplication",
      "name": "MindState",
      "url": DOMAIN,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export { FAQ_DATA };