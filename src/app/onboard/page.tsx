"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { StepWelcome } from "./StepWelcome";
import { StepIntent } from "./StepIntent";
import { StepName } from "./StepName";
import { StepTheme } from "./StepTheme";

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 28, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 8,
            borderRadius: 4,
            transition: "all 0.35s ease",
            width: i === step ? 24 : 8,
            background: i <= step ? "var(--color-accent-primary)" : "var(--color-border)",
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<string | null>(null);
  const [name, setName] = useState("");

  const next = () => setStep(s => s + 1);

  const finish = async () => {
    const trimmed = name.trim();
    if (trimmed) {
      localStorage.setItem("guest_name", trimmed);
      if (user) {
        const supabase = createClient();
        await supabase.from("profiles").update({ username: trimmed }).eq("id", user.id);
      }
    }
    if (intent) localStorage.setItem("onboard_intent", intent);
    localStorage.setItem("onboarded", "1");
    router.push("/games");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <ProgressDots step={step} total={4} />
      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        <AnimatePresence mode="wait">
          {step === 0 && <StepWelcome key="s0" onNext={next} />}
          {step === 1 && <StepIntent key="s1" selected={intent} onSelect={setIntent} onNext={next} />}
          {step === 2 && <StepName key="s2" value={name} onChange={setName} onNext={next} />}
          {step === 3 && <StepTheme key="s3" onFinish={finish} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
