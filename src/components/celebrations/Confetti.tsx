"use client";
import { useMemo } from "react";

const DEFAULT_COLORS = [
  "var(--accent)", "var(--gold)", "var(--violet)", "var(--easy)", "var(--hard)",
];

interface ConfettiProps {
  count?: number;
  colors?: string[];
}

export function Confetti({ count = 30, colors = DEFAULT_COLORS }: ConfettiProps) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 20,
      w: 4 + Math.random() * 4,
      h: 8 + Math.random() * 10,
      isCircle: Math.random() < 0.3,
      color: colors[i % colors.length],
      rot: -45 + Math.random() * 90,
      dur: 2.5 + Math.random() * 1.5,
      delay: Math.random() * 0.8,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <>
      <style>{`
        @keyframes confettiDrop {
          0%   { transform: translateY(0) rotate(var(--rot)); opacity: 1 }
          80%  { opacity: 1 }
          100% { transform: translateY(100vh) rotate(calc(var(--rot) + 180deg)); opacity: 0 }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        {pieces.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.w,
              height: p.isCircle ? p.w : p.h,
              borderRadius: p.isCircle ? "50%" : 2,
              background: p.color,
              // @ts-expect-error CSS custom property
              "--rot": `${p.rot}deg`,
              animation: `confettiDrop ${p.dur}s ${p.delay}s ease-in both`,
            }}
          />
        ))}
      </div>
    </>
  );
}
