"use client";
import Link from "next/link";
import { CheckCircle, Zap } from "lucide-react";
import { GameIcon } from "@/components/icons/GameIcons";
import { GAME_NAMES } from "@/features/daily/constants";
import { getDailyStageInfo } from "@/lib/games/dailyChallenge";
import type { GameSlug } from "@/lib/games/dailyChallenge";

const DIFF_COLOR: Record<string, string> = {
  easy:   "var(--color-accent-secondary)",
  medium: "var(--color-accent-primary)",
  hard:   "var(--color-error)",
};

interface Props {
  games: GameSlug[];
  completedToday: Set<string>;
  featuredSlug: string;
}

export function DailyGameGrid({ games, completedToday, featuredSlug }: Props) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--color-text-faint)", marginBottom: 12,
      }}>
        All daily challenges
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {games.filter(g => g !== featuredSlug).map((game) => {
          const done = completedToday.has(game);
          const { stage, difficulty } = getDailyStageInfo(game);
          return (
            <Link key={game} href={`/games/${game}?daily=1&from=daily`} style={{ display: "block", textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: 11, borderRadius: 16,
                background: "var(--color-surface)", border: "1px solid var(--color-border)",
              }}>
                <GameIcon slug={game} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13.5,
                    color: "var(--color-text-primary)",
                  }}>
                    {GAME_NAMES[game] ?? game}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 7.5, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: DIFF_COLOR[difficulty],
                    }}>
                      {difficulty}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 8,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: "var(--color-text-faint)",
                    }}>
                      Stage {stage}
                    </span>
                  </div>
                </div>
                {done ? (
                  <CheckCircle size={20} color="var(--color-accent-secondary)" strokeWidth={2} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <Zap size={12} fill="var(--color-accent-primary)" color="var(--color-accent-primary)" strokeWidth={0} />
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      color: "var(--color-text-secondary)",
                    }}>
                      +{stage}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
