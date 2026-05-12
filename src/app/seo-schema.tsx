// JSON-LD Schema components for SEO + AI crawlers
// FAQPage, HowTo, Organization, WebApplication schemas

const FAQ_DATA = [
  { q:"Is MindState free to use?",
    a:"Yes — free users get 5 plays per day across all 20 games. Daily challenges are always free. Subscribe for unlimited access at $2/month." },
  { q:"What does Pro include?",
    a:"Unlimited plays across all 20 games, all 1,000 stages per game, family leaderboards for up to 7 members, and early access to new games." },
  { q:"How much does Pro cost?",
    a:"Individual Pro is $2/month. Family plans start at $5/month for 3 members and $10/month for 7 members." },
  { q:"Can I cancel anytime?",
    a:"Yes. Cancel from your profile settings at any time. You keep access until the end of your billing period." },
  { q:"What are the 20 games?",
    a:"Tango, Memory, Queens, Sudoku, Zip, Minesweeper, Flow, Nonogram, Bridges, Pattern Match, 2048 Pro, Kakuro, Gravity Sort, Hex Merge, Logic Path, Light Up, Patches, Word Sling, Hearts, and Solitaire." },
  { q:"Do I need an account to play?",
    a:"No — you can play as a guest. Creating a free account saves your progress, streaks, and XP scores." },
  { q:"Does it work offline?",
    a:"Yes. MindState is a Progressive Web App. Install it to your home screen and play without an internet connection." },
  { q:"Are new games coming?",
    a:"Yes — 6 new games are in development including Chess Puzzles, Cryptogram, and Calcudoku. Pro subscribers get early access first." },
  { q:"What languages does MindState support?",
    a:"MindState supports 7 languages: English, Spanish, German, French, Portuguese, Dutch, and Hebrew (with full RTL layout)." },
  { q:"Is MindState good for brain training?",
    a:"MindState offers 20 logic disciplines — from spatial reasoning (Nonogram, Patches) to numerical logic (Sudoku, Kakuro) to memory and pattern recognition. Daily practice across disciplines is backed by cognitive research." },
];

export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a }
    }))
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
    "url": "https://mindstate.vercel.app",
    "logo": "https://mindstate.vercel.app/icons/icon-512.png",
    "description": "MindState is a minimalist brain-training suite for adults featuring 20 logic games and 1,000 stages each.",
    "sameAs": []
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
    "url": "https://mindstate.vercel.app",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier with 5 daily plays. Pro at $2/month."
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1200"
    },
    "description": "20 precision logic games for the modern mind. Sharper every day.",
    "inLanguage": ["en","es","de","fr","pt","nl","he"]
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
        "text": "Browse 20 logic disciplines — from Tango and Queens to Sudoku and Nonogram. Each has 1,000 stages from Easy to Hard."
      },
      {
        "@type": "HowToStep",
        "name": "Solve the puzzle",
        "text": "Use logic to complete each stage. XP decays over time so faster, cleaner solves earn more points. Use hints sparingly — each costs 100 XP."
      },
      {
        "@type": "HowToStep",
        "name": "Build your streak",
        "text": "Play daily challenges to build a streak. 7 consecutive days earns 10 bonus plays. Your XP and progress are saved to the global leaderboard."
      }
    ]
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export { FAQ_DATA };
