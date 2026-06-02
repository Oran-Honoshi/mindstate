"use client";
import Link from "next/link";
import { Play } from "lucide-react";
import { GameIcon } from "@/components/icons/GameIcons";
import { GAME_NAMES } from "@/features/daily/constants";
import { getDailyStageInfo } from "@/lib/games/dailyChallenge";

interface Props {
  slug: string;
  isCompleted: boolean;
}

export function DailyFeatured({ slug, isCompleted }: Props) {
  const gameName = GAME_NAMES[slug] ?? slug;
  const { stage } = getDailyStageInfo(slug);

  return (
    <div style={{ marginBottom: 24 }}>
      <Link href={`/games/${slug}?daily=1&from=daily`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{
          background: "radial-gradient(120% 90% at 0% 0%, rgba(47,230,224,0.1), transparent 60%), var(--color-surface)",
          border: "1px solid rgba(47,230,224,0.33)",
          borderRadius: 16, padding: 16,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <GameIcon slug={slug} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "var(--color-accent-primary)", marginBottom: 4,
            }}>
              {isCompleted ? "COMPLETED · STAGE" : "FEATURED · STAGE"} {stage}
            </div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
              color: "var(--color-text-primary)",
            }}>
              {gameName}
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "var(--color-accent-primary)", color: "var(--color-on-accent)",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
            padding: "9px 14px", borderRadius: 10, flexShrink: 0,
          }}>
            <Play size={13} fill="var(--color-on-accent)" color="var(--color-on-accent)" />
            {isCompleted ? "Again" : "Play"}
          </div>
        </div>
      </Link>
    </div>
  );
}
