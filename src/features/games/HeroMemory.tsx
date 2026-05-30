"use client";
import { useState } from "react";

const SYMBOLS = ["◆", "●", "▲"];

export function HeroMemory() {
  const [cards] = useState(() => {
    const arr = [...SYMBOLS, ...SYMBOLS];
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
              width: 64, height: 64, borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              background: open ? "var(--color-surface)" : "var(--color-accent-primary)",
              color: "var(--color-text-primary)", fontSize: 26, fontWeight: 700,
              cursor: matched.has(c.id) ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s", fontFamily: "var(--font-sans)",
            }}
          >
            {open ? c.value : ""}
          </button>
        );
      })}
    </div>
  );
}
