"use client";
import { useState, useEffect } from "react";

function fmt(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function StatusBar() {
  const [time, setTime] = useState(() => fmt(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(fmt(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        height: 30,
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        position: "relative",
        flexShrink: 0,
        zIndex: 60,
      }}
    >
      {/* Left: clock */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--text)",
        }}
      >
        {time}
      </span>

      {/* Center: Dynamic Island — always black, absolute */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: 4,
          width: 96,
          height: 22,
          background: "#000000",
          borderRadius: 99,
          pointerEvents: "none",
        }}
      />

      {/* Right: signal bars + battery */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {/* Signal bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          {[4, 7, 10, 13].map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: h,
                borderRadius: 1,
                background: i < 3 ? "var(--text)" : "var(--faint)",
              }}
            />
          ))}
        </div>
        {/* Battery — inline SVG, not in Icon library */}
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block" }}
        >
          <rect x="1" y="7" width="18" height="10" rx="2" />
          <path d="M23 11v2" />
          <rect x="3" y="9" width="10" height="6" rx="1" fill="var(--text)" stroke="none" />
        </svg>
      </div>
    </div>
  );
}
