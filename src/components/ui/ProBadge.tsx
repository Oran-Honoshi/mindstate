"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { ProModal } from "@/components/modals/ProModal";
import { useAuthStore } from "@/store/authStore";

interface ProBadgeProps {
  feature: string;
  children: React.ReactNode;
}

export function ProGate({ feature, children }: ProBadgeProps) {
  const { profile } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  if (isPro) return <>{children}</>;

  return (
    <>
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowModal(true)}>
        <div style={{ opacity: 0.5, pointerEvents: "none", userSelect: "none" }}>
          {children}
        </div>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.6)", borderRadius: "inherit",
          backdropFilter: "blur(2px)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 20,
            background: "white", border: "0.5px solid rgba(0,0,0,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontSize: 12, fontWeight: 700, color: "var(--color-accent-primary)",
          }}>
            <Lock size={12} /> Pro
          </div>
        </div>
      </div>
      <ProModal open={showModal} onClose={() => setShowModal(false)} feature={feature} />
    </>
  );
}

export function ProBanner({ feature }: { feature: string }) {
  const [showModal, setShowModal] = useState(false);
  const { profile } = useAuthStore();
  const isPro = profile?.subscription_status !== "free";
  if (isPro) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 14,
          border: "none", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg,rgba(79,110,247,0.08),rgba(156,107,232,0.1))",
          borderTop: "1px solid rgba(79,110,247,0.15)",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Lock size={14} color="var(--color-accent-primary)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-accent-primary)" }}>
            Unlock {feature} with Pro
          </span>
        </div>
        <span style={{ fontSize: 12, color: "var(--color-accent-primary)", fontWeight: 700 }}>$2/mo →</span>
      </button>
      <ProModal open={showModal} onClose={() => setShowModal(false)} feature={feature} />
    </>
  );
}
