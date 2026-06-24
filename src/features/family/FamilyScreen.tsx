"use client";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Micro } from "@/components/ui/Micro";
import { Icon } from "@/components/ui/Icon";

interface FamilyScreenProps {
  onOpenInvite: () => void;
}

const MEMBERS = [
  { name: "Oran", lvl: 7, xp: 3240, you: true, isAdmin: true, ring: "var(--accent)" },
  { name: "Sara", lvl: 5, xp: 1840, you: false, isAdmin: false, ring: "var(--violet)" },
  { name: "Tom", lvl: 3, xp: 920, you: false, isAdmin: false, ring: "var(--gold)" },
].sort((a, b) => b.xp - a.xp);

const WINS = [
  { icon: "Crown" as const, text: "Oran completed Tango Stage 34", time: "2h ago", color: "var(--gold)" },
  { icon: "Trophy" as const, text: "Sara hit a 7-day streak", time: "Yesterday", color: "var(--violet)" },
  { icon: "Flame" as const, text: "Tom completed Memory Stage 8", time: "2d ago", color: "var(--medium)" },
];

const REMAINING_SEATS = 1;

function SecHead({ left, right }: { left: string; right?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 2px 12px" }}>
      <Micro>{left}</Micro>
      {right && <Micro>{right}</Micro>}
    </div>
  );
}

export function FamilyScreen({ onOpenInvite }: FamilyScreenProps) {
  return (
    <div style={{ padding: "16px 18px 28px" }}>
      {/* Plan badge */}
      <Card variant="default" padding="14px 16px">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
              Family Plan · 3 seats
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
              Billed monthly · $5/mo
            </div>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--easy)", padding: "4px 10px",
            background: "color-mix(in srgb, var(--easy) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--easy) 30%, transparent)",
            borderRadius: "var(--r-pill)",
          }}>
            Active
          </div>
        </div>
      </Card>

      {/* Family leaderboard */}
      <SecHead left="Family Leaderboard" right="This Week" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MEMBERS.map((m, i) => (
          <Card key={m.name} variant="default" padding="12px 14px" style={{
            display: "flex", alignItems: "center", gap: 12,
            ...(m.you ? { background: "color-mix(in srgb, var(--accent) 6%, transparent)", borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" } : {}),
          }}>
            <div style={{ width: 20, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--faint)" }}>
              {i + 1}
            </div>
            <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, padding: 2, background: m.ring, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                {m.name[0]}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{m.name}</span>
                {m.isAdmin && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--on-accent)", background: "var(--accent)", borderRadius: "var(--r-pill)", padding: "1px 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin</span>
                )}
                {i === 0 && <Icon name="Crown" size={12} color="var(--gold)" strokeWidth={2} />}
              </div>
              <div style={{ marginTop: 2 }}>
                <Micro color={m.you ? "var(--accent)" : "var(--muted)"} size={9}>Level {m.lvl}</Micro>
              </div>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: m.you ? "var(--accent)" : "var(--muted)" }}>
              {m.xp.toLocaleString()}
            </span>
          </Card>
        ))}
      </div>

      {/* Recent wins */}
      <SecHead left="Recent Wins" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {WINS.map((w, i) => (
          <Card key={i} variant="default" padding="12px" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--surf2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={w.icon} size={16} color={w.color} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>{w.text}</div>
              <div style={{ marginTop: 2 }}><Micro size={9}>{w.time}</Micro></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Invite */}
      {REMAINING_SEATS > 0 && (
        <>
          <SecHead left="Invite" />
          <Card variant="default" padding="14px 16px" onClick={onOpenInvite} style={{ display: "flex", alignItems: "center", gap: 12, borderStyle: "dashed" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: "color-mix(in srgb, var(--accent) 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="Plus" size={18} color="var(--accent)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text)" }}>
                Invite {REMAINING_SEATS} more
              </div>
              <div style={{ marginTop: 2 }}><Micro size={9}>Share a link · seats included in your plan</Micro></div>
            </div>
            <ChevronRight size={16} color="var(--faint)" />
          </Card>
        </>
      )}
    </div>
  );
}
