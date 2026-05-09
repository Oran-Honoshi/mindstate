"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";

const BRAND_COLORS = ["#7C9E87","#3B6FE8","#8B6FC0","#C4785A","#4DB6AC","#E8A830","#F472B6"];

export function triggerConfetti() {
  const count = 180;
  const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 9999 };
  function fire(particleRatio: number, opts: object) {
    confetti({ ...defaults, ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: BRAND_COLORS,
      shapes: ["circle","square"],
    });
  }
  fire(0.25, { origin:{ x:0.2, y:0.6 } });
  fire(0.2,  { origin:{ x:0.8, y:0.6 } });
  fire(0.35, { origin:{ x:0.5, y:0.5 }, startVelocity:45 });
  fire(0.1,  { origin:{ x:0.1, y:0.4 } });
  fire(0.1,  { origin:{ x:0.9, y:0.4 } });
}

export function useConfettiOnMount() {
  useEffect(() => { triggerConfetti(); }, []);
}
