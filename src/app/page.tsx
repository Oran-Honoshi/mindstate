"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

// ── Hero Memory: 3 pairs, unscored, 3 cols × 2 rows ───────────────────────────
const HERO_SYMBOLS = ["◆", "●", "▲"];

function HeroMemory() {
  const [cards] = useState(() => {
    const arr = [...HERO_SYMBOLS, ...HERO_SYMBOLS];
    let s = 1234;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const j = Math.abs(s) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.map((value, id) => ({ id, value }));
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());

  function flip(id: number) {
    if (flipped.includes(id) || matched.has(id) || flipped.length === 2) return;
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next.map(fid => cards.find(c => c.id === fid)!);
      if (a.value === b.value) {
        setMatched(m => new Set([...m, a.id, b.id]));
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 10 }}>
      {cards.map(c => {
        const open = flipped.includes(c.id) || matched.has(c.id);
        return (
          <button
            key={c.id}
            onClick={() => flip(c.id)}
            aria-label={open ? `Card ${c.value}` : "Face-down card"}
            style={{
              width: 64, height: 64,
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              background: open ? "var(--color-surface)" : "var(--color-accent-primary)",
              color: "var(--color-text-primary)",
              fontSize: 26, fontWeight: 700,
              cursor: matched.has(c.id) ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
              fontFamily: "var(--font-sans)",
            }}
          >
            {open ? c.value : ""}
          </button>
        );
      })}
    </div>
  );
}

// ── Game catalog ──────────────────────────────────────────────────────────────
type Difficulty = "Easy" | "Medium" | "Hard";
const GAMES: { slug: string; name: string; difficulty: Difficulty }[] = [
  { slug: "2048-pro",      name: "2048 Pro",         difficulty: "Hard"   },
  { slug: "bridges",       name: "Bridges",          difficulty: "Medium" },
  { slug: "flow",          name: "Flow",             difficulty: "Medium" },
  { slug: "gravity-sort",  name: "Gravity Sort",     difficulty: "Hard"   },
  { slug: "hearts",        name: "Hearts",           difficulty: "Easy"   },
  { slug: "hex-merge",     name: "Hex Merge",        difficulty: "Hard"   },
  { slug: "kakuro",        name: "Kakuro",           difficulty: "Medium" },
  { slug: "lightup",       name: "Light Up",         difficulty: "Medium" },
  { slug: "logic-path",    name: "Logic Path",       difficulty: "Hard"   },
  { slug: "memory",        name: "Memory",           difficulty: "Easy"   },
  { slug: "minesweeper",   name: "Minesweeper",      difficulty: "Medium" },
  { slug: "name-city",     name: "Name the City",    difficulty: "Easy"   },
  { slug: "name-country",  name: "Name the Country", difficulty: "Easy"   },
  { slug: "nonogram",      name: "Nonogram",         difficulty: "Medium" },
  { slug: "patches",       name: "Patches",          difficulty: "Hard"   },
  { slug: "pattern-match", name: "Pattern Match",    difficulty: "Hard"   },
  { slug: "pinpoint",      name: "Pinpoint",         difficulty: "Easy"   },
  { slug: "queens",        name: "Queens",           difficulty: "Medium" },
  { slug: "solitaire",     name: "Solitaire",        difficulty: "Easy"   },
  { slug: "sudoku",        name: "Mini Sudoku",      difficulty: "Easy"   },
  { slug: "tango",         name: "Tango",            difficulty: "Easy"   },
  { slug: "word-climb",    name: "Word Climb",       difficulty: "Medium" },
  { slug: "word-sling",    name: "Word Sling",       difficulty: "Hard"   },
  { slug: "zip",           name: "Zip",              difficulty: "Hard"   },
];

function GameTileIcon() {
  return (
    <svg width={36} height={36} viewBox="0 0 36 36" aria-hidden="true">
      <rect x={3}  y={3}  width={13} height={13} rx={2} fill="var(--color-accent-primary)"   opacity={0.85}/>
      <rect x={20} y={3}  width={13} height={13} rx={2} fill="var(--color-accent-secondary)" opacity={0.85}/>
      <rect x={3}  y={20} width={13} height={13} rx={2} fill="var(--color-accent-secondary)" opacity={0.85}/>
      <rect x={20} y={20} width={13} height={13} rx={2} fill="var(--color-accent-primary)"   opacity={0.85}/>
    </svg>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
const PLANS = [
  { name: "Individual", price: "$2",  blurb: "All 24 games, 100 stages each", priceId: "pri_01ks5tm2jqs69wrg92jxrc936b", highlight: false },
  { name: "Family 3",   price: "$5",  blurb: "Up to 3 members",               priceId: "pri_01ks5tnfpxvgdh2gkfm0k5pry8", highlight: true  },
  { name: "Family 7",   price: "$10", blurb: "Up to 7 members",               priceId: "pri_01ks5tpt6wsyn05gexnpade0a0", highlight: false },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuthStore();
  const accountHref = user ? "/profile" : "/auth/signin";
  const accountLabel = user ? "Profile" : "Sign In";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px",
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18,
          color: "var(--color-text-primary)", textDecoration: "none", letterSpacing: "-0.01em",
        }}>
          Mind Element
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/games" style={{ color: "var(--color-text-primary)", fontWeight: 600, textDecoration: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}>
            Games
          </Link>
          <ThemeSwitcher/>
          <Link href={accountHref} style={{
            padding: "8px 16px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-primary)",
            fontSize: 14, fontWeight: 600,
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
          }}>
            {accountLabel}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 28, padding: "96px 24px 80px", textAlign: "center",
      }}>
        <h1 style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 48,
          color: "var(--color-text-primary)", lineHeight: 1.1, margin: 0,
        }}>
          Sharper Every Day
        </h1>
        <p style={{
          fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: 18,
          color: "var(--color-text-secondary)", margin: 0, maxWidth: 520,
        }}>
          Six precision games. One daily practice.
        </p>
        <HeroMemory/>
        <Link href="/onboard" style={{
          padding: "14px 32px",
          borderRadius: "var(--radius)",
          background: "var(--color-accent-primary)",
          color: "var(--color-on-accent)",
          fontWeight: 700, fontSize: 16,
          textDecoration: "none",
          fontFamily: "var(--font-sans)",
        }}>
          Start Training
        </Link>
      </section>

      {/* GAMES */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 32,
          color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 40px",
        }}>
          24 Games. One Platform.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GAMES.map(g => (
            <Link key={g.slug} href={`/games/${g.slug}`} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              padding: 20, textDecoration: "none",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
            }}>
              <GameTileIcon/>
              <span style={{ fontSize: 14, fontWeight: 600, textAlign: "center" }}>{g.name}</span>
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: "2px 10px",
                borderRadius: "var(--radius)",
                background: "var(--color-surface-2)",
                color: "var(--color-text-secondary)",
                letterSpacing: "0.04em",
              }}>
                {g.difficulty}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 32,
          color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 40px",
        }}>
          Simple Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(p => (
            <div key={p.name} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              padding: 28,
              background: "var(--color-surface)",
              border: p.highlight
                ? "2px solid var(--color-accent-primary)"
                : "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>
                {p.name}
              </span>
              <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "var(--font-sans)", lineHeight: 1 }}>
                {p.price}
                <span style={{ fontSize: 14, fontWeight: 400, color: "var(--color-text-secondary)" }}>/month</span>
              </span>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", textAlign: "center", margin: 0 }}>
                {p.blurb}
              </p>
              <button
                onClick={() => console.log("paddle checkout", p.priceId)}
                style={{
                  marginTop: 8, padding: "10px 24px",
                  borderRadius: "var(--radius)",
                  background: "var(--color-accent-primary)",
                  color: "var(--color-on-accent)",
                  fontWeight: 700, fontSize: 14,
                  border: "none", cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Choose {p.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: 32, textAlign: "center",
        color: "var(--color-text-secondary)",
        borderTop: "1px solid var(--color-border)",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
      }}>
        Mind Element · Professional Brain Training
      </footer>
    </div>
  );
}
