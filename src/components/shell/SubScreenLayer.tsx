"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSubScreen } from "./SubScreenContext";
import { SubScreenShell } from "./SubScreenShell";
import { FamilyScreen } from "@/features/family/FamilyScreen";
import { SettingsScreen } from "@/features/settings/SettingsScreen";
import { PricingScreen } from "@/features/pricing/PricingScreen";
import { InviteModal } from "@/components/modals/InviteModal";
import { useAuthStore } from "@/store/authStore";

export function SubScreenLayer() {
  const { activeSub, closeSubScreen } = useSubScreen();
  const [inviteOpen, setInviteOpen] = useState(false);
  const { user, profile } = useAuthStore();
  const myName = profile?.username ?? user?.email?.split('@')[0] ?? 'You';
  const myInitial = myName[0]?.toUpperCase() ?? 'Y';
  const inviteMembers = [
    { name: myName, initial: myInitial },
    { name: "Sara", initial: "S" },
  ];

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
        inviteCode="INVITE-CODE"
        memberCount={2}
        maxSeats={3}
        members={inviteMembers}
      />
    </>
  );
}
