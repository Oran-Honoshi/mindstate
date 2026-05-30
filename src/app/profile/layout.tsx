import { BottomNav } from "@/components/nav/BottomNav";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}>
        {children}
      </div>
      <BottomNav />
    </>
  );
}
