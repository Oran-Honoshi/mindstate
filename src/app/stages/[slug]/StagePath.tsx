"use client";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StagePathProps {
  slug: string;
  completed: Set<number>;
  lastStage: number;
}

const NODE_R = 23;
const AMPLITUDE = 84;
const VSPACING = 70;
const SVG_W = 300;
const TOTAL = 100;

function nodePos(i: number) {
  return {
    x: SVG_W / 2 + AMPLITUDE * Math.sin(i * 0.8),
    y: i * VSPACING + 35,
  };
}

export function StagePath({ slug, completed, lastStage }: StagePathProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentPos = nodePos(lastStage - 1);
  const svgHeight = (TOTAL - 1) * VSPACING + 35 + 80;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [lastStage]);

  const positions = Array.from({ length: TOTAL }, (_, i) => nodePos(i));
  const allPoints = positions.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const donePoints = positions.slice(0, lastStage).map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <>
      <style>{`
        @keyframes stageNodePulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.1; }
        }
        .snp { animation: stageNodePulse 1.8s ease-in-out infinite; }
      `}</style>
      <div style={{ position: "relative" }}>
        <div
          ref={scrollRef}
          style={{
            position: "absolute",
            top: Math.max(0, currentPos.y - NODE_R - 10),
            height: NODE_R * 2 + 20,
            width: 1,
            pointerEvents: "none",
          }}
        />
        <svg
          width={SVG_W}
          height={svgHeight}
          viewBox={`0 0 ${SVG_W} ${svgHeight}`}
          style={{ display: "block", margin: "0 auto", overflow: "visible" }}
        >
          {/* Background dashed path */}
          <polyline
            points={allPoints}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={2}
            strokeDasharray="4 6"
          />
          {/* Completed path */}
          {lastStage > 1 && (
            <polyline
              points={donePoints}
              fill="none"
              stroke="var(--color-accent-primary)"
              strokeWidth={2}
              strokeOpacity={0.55}
            />
          )}

          {positions.map((pos, i) => {
            const stageNum = i + 1;
            const done = completed.has(stageNum);
            const current = stageNum === lastStage;
            const locked = stageNum > lastStage;
            const isMilestone = stageNum % 5 === 0;

            const strokeColor = done || current
              ? "var(--color-accent-primary)"
              : isMilestone
              ? "var(--color-gold)"
              : "var(--color-border)";

            const fillColor = done
              ? "rgba(47,230,224,0.12)"
              : current
              ? "rgba(47,230,224,0.07)"
              : isMilestone
              ? "rgba(255,194,75,0.07)"
              : "var(--color-surface)";

            const textColor = done || current
              ? "var(--color-accent-primary)"
              : isMilestone
              ? "var(--color-gold)"
              : locked
              ? "var(--color-text-faint)"
              : "var(--color-text-secondary)";

            return (
              <g
                key={i}
                onClick={() => !locked && router.push(`/games/${slug}?stage=${stageNum}`)}
                style={{ cursor: locked ? "not-allowed" : "pointer" }}
              >
                {/* Milestone dashed ring */}
                {isMilestone && (
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={NODE_R + 5}
                    fill="none"
                    stroke="var(--color-gold)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={locked ? 0.15 : 0.45}
                  />
                )}

                {/* Pulse ring for current stage */}
                {current && (
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={NODE_R + 7}
                    fill="none"
                    stroke="var(--color-accent-primary)"
                    strokeWidth={1.5}
                    className="snp"
                  />
                )}

                {/* Main node */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={NODE_R}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={done || current ? 2 : 1.5}
                  opacity={locked ? 0.28 : 1}
                />

                {/* Label or checkmark */}
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fontSize={done ? 13 : stageNum >= 100 ? 9 : 11}
                  fill={textColor}
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                  opacity={locked ? 0.28 : 1}
                >
                  {done ? "✓" : stageNum}
                </text>

                {/* NOW label */}
                {current && (
                  <text
                    x={pos.x + NODE_R + 9}
                    y={pos.y + 4}
                    fontSize={8}
                    fill="var(--color-accent-primary)"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                    letterSpacing="0.1em"
                  >
                    NOW
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}
