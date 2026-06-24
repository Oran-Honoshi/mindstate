"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSubScreen } from "./SubScreenContext";
import { SubScreenShell } from "./SubScreenShell";
import { FamilyScreen } from "@/features/family/FamilyScreen";
import { SettingsScreen } from "@/features/settings/SettingsScreen";
import { PricingScreen } from "@/features/pricing/PricingScreen";
import { InviteModal } from "@/components/modals/InviteModal";

const INVITE_MEMBERS = [
  { name: "Oran", initial: "O" },
  { name: "Sara", initial: "S" },
];

export function SubScreenLayer() {
  const { activeSub, closeSubScreen } = useSubScreen();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {activeSub === "family" && (
          <SubScreenShell key="family" title="Family" onClose={closeSubScreen}>
            <FamilyScreen onOpenInvite={() => setInviteOpen(true)} />
          </SubScreenShell>
        )}
        {activeSub === "settings" && (
          <SubScreenShell key="settings" title="Settings" onClose={closeSubScreen}>
            <SettingsScreen />
          </SubScreenShell>
        )}
        {activeSub === "pricing" && (
          <SubScreenShell key="pricing" title="Plans" onClose={closeSubScreen}>
            <PricingScreen />
          </SubScreenShell>
        )}
      </AnimatePresence>

      <InviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        inviteCode="ORAN-7F2K"
        memberCount={2}
        maxSeats={3}
        members={INVITE_MEMBERS}
      />
    </>
  );
}
