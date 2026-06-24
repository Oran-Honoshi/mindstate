"use client";
import { ReactNode, useEffect, useRef } from "react";

interface CelebrationOverlayProps {
  background: string;
  autoDismissMs?: number;
  onDismiss: () => void;
  children: ReactNode;
}

export function CelebrationOverlay({ background, autoDismissMs, onDismiss, children }: CelebrationOverlayProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!autoDismissMs) return;
    timerRef.current = setTimeout(onDismiss, autoDismissMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoDismissMs, onDismiss]);

  return (
    <>
      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.96) }
          to   { opacity: 1; transform: scale(1) }
        }
      `}</style>
      <div
        onClick={onDismiss}
        style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "32px var(--screen-pad)",
          background,
          animation: "overlayIn 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        }}
      >
        {children}
      </div>
    </>
  );
}
