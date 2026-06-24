"use client";
import { useEffect, useRef, useState } from "react";

interface Stat { value: string; label: string; numeric?: number; suffix?: string; }

const STATS: Stat[] = [
  { value: "24",    label: "Logic games",    numeric: 24 },
  { value: "10k+",  label: "Active players" },
  { value: "4.9★",  label: "Average rating" },
  { value: "$2",    label: "Per month" },
];

function useCountUp(target: number | undefined, active: boolean, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active || target === undefined) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return count;
}

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.numeric, active);
  const display = stat.numeric !== undefined ? String(count) : stat.value;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32,
        color: "var(--accent)", lineHeight: 1,
      }}>
        {display}
      </div>
      <div style={{
        fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)", marginTop: 4,
      }}>
        {stat.label}
      </div>
    </div>
  );
}

export function StatsStrip() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setActive(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      background: "var(--surf)",
      borderTop: "0.5px solid var(--border)",
      borderBottom: "0.5px solid var(--border)",
      padding: "24px var(--screen-pad, 16px)",
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto",
        display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24,
      }}>
        {STATS.map((s) => <StatItem key={s.label} stat={s} active={active} />)}
      </div>
    </section>
  );
}
