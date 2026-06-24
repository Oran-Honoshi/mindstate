"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

interface PricingFaqItemProps {
  q: string;
  a: string;
}

export function PricingFaqItem({ q, a }: PricingFaqItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <Card variant="default" padding="0" onClick={() => setOpen((o) => !o)}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 15px" }}>
        <div style={{ flex: 1, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text)" }}>
          {q}
        </div>
        <Icon name={open ? "Minus" : "Plus"} size={15} color="var(--faint)" />
      </div>
      {open && (
        <div style={{ padding: "0 15px 14px", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", lineHeight: 1.55 }}>
          {a}
        </div>
      )}
    </Card>
  );
}
