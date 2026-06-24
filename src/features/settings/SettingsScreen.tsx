"use client";
import { ChevronRight, Globe, Crown, Lock, FileText, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Micro } from "@/components/ui/Micro";
import { Btn } from "@/components/ui/Btn";
import { Bar } from "@/components/ui/Bar";
import { Icon } from "@/components/ui/Icon";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { useSubScreen } from "@/components/shell/SubScreenContext";
import { ToggleRow } from "./ToggleRow";
import { ThemePickerRow } from "./ThemePickerRow";

function SectionLabel({ label }: { label: string }) {
  return <div style={{ margin: "22px 0 10px" }}><Micro color="var(--muted)">{label}</Micro></div>;
}

export function SettingsScreen() {
  const { isSilentMode, toggleSilentMode, isTimerEnabled, toggleTimer, isAccessibilityMode, toggleAccessibilityMode } = useSettingsStore();
  const { user, profile, signOut } = useAuthStore();
  const { openSubScreen } = useSubScreen();
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;
  const playsUsed = 3;
  const initial = (profile?.username ?? user?.email ?? "U")[0].toUpperCase();

  return (
    <div style={{ padding: "16px 18px 28px" }}>
      <SectionLabel label="Account" />
      <Card variant="default" padding="0">
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "0.5px solid var(--border)", cursor: "pointer" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--on-accent)", flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "var(--text)" }}>
              {profile?.username ?? "Unknown"}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {user?.email ?? ""}
            </div>
          </div>
          <ChevronRight size={16} color="var(--faint)" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}>
          <Globe size={18} color="var(--muted)" strokeWidth={1.8} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)", flex: 1 }}>Language</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", marginRight: 4 }}>English</span>
          <ChevronRight size={16} color="var(--faint)" />
        </div>
      </Card>

      <SectionLabel label="Subscription" />
      <Card variant="default" padding="0" style={{ background: `radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--accent) 8%, transparent), transparent), var(--surf)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "0.5px solid var(--border)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
              {isPro ? "Individual Plan" : "Free Plan"}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
              {isPro ? "Unlimited plays · all 24 games" : "5 daily plays · all 24 games"}
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--easy)", padding: "4px 10px", background: "color-mix(in srgb, var(--easy) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--easy) 30%, transparent)", borderRadius: "var(--r-pill)" }}>
            Active
          </div>
        </div>
        {!isPro && (
          <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text)" }}>Today&apos;s plays</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{playsUsed} / 5</span>
            </div>
            <Bar colorMode="accent" value={playsUsed / 5} height={4} />
          </div>
        )}
        <div onClick={() => openSubScreen('pricing')} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}>
          <Crown size={18} color="var(--gold)" strokeWidth={1.8} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)", flex: 1 }}>Manage Billing</span>
          <ChevronRight size={16} color="var(--faint)" />
        </div>
      </Card>

      <SectionLabel label="Gameplay" />
      <Card variant="default" padding="0">
        <ToggleRow iconName="Bell" label="Silent Mode" desc="No sounds or haptics" checked={isSilentMode} onToggle={toggleSilentMode} />
        <ToggleRow iconName="Bolt" label="Timer" desc="XP decays during play" checked={isTimerEnabled} onToggle={toggleTimer} />
        <ToggleRow iconName="Grid" label="Accessibility" desc="Larger targets, no timer pressure" checked={isAccessibilityMode} onToggle={toggleAccessibilityMode} hasBorder={false} />
      </Card>

      <SectionLabel label="Appearance" />
      <Card variant="default" padding="0">
        <ThemePickerRow />
      </Card>

      <SectionLabel label="About" />
      <Card variant="default" padding="0">
        <div onClick={() => window.open('/privacy', '_blank')} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "0.5px solid var(--border)", cursor: "pointer" }}>
          <Lock size={18} color="var(--muted)" strokeWidth={1.8} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)", flex: 1 }}>Privacy Policy</span>
          <ChevronRight size={16} color="var(--faint)" />
        </div>
        <div onClick={() => window.open('/terms', '_blank')} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "0.5px solid var(--border)", cursor: "pointer" }}>
          <FileText size={18} color="var(--muted)" strokeWidth={1.8} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)", flex: 1 }}>Terms of Service</span>
          <ChevronRight size={16} color="var(--faint)" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)", flex: 1 }}>App Version</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>v1.0.0</span>
        </div>
      </Card>

      <div style={{ marginTop: 22 }}>
        <Btn variant="danger" onClick={signOut}>
          <Icon name="X" size={16} style={{ marginRight: 6 }} />
          Sign Out
        </Btn>
      </div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <span
          style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--hard)", cursor: "pointer" }}
          onClick={() => { if (window.confirm("Delete your account? This cannot be undone.")) { /* TODO: delete account */ } }}
        >
          Delete account
        </span>
      </div>
    </div>
  );
}
