"use client";
import { useRef, useEffect, Children, ReactNode } from "react";

interface TabShellProps {
  activeTab: number;
  onTabChange: (n: number) => void;
  children: ReactNode;
}

export function TabShell({ activeTab, onTabChange, children }: TabShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tabCount = Children.count(children);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const isRTL = document.documentElement.dir === "rtl";
    const target = isRTL ? tabCount - 1 - activeTab : activeTab;
    isSyncing.current = true;
    el.scrollTo({ left: target * el.offsetWidth, behavior: "smooth" });
    const id = setTimeout(() => { isSyncing.current = false; }, 520);
    return () => clearTimeout(id);
  }, [activeTab, tabCount]);

  function handleScroll() {
    if (isSyncing.current) return;
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const isRTL = document.documentElement.dir === "rtl";
      const rawIdx = Math.round(el.scrollLeft / (el.offsetWidth || 1));
      const idx = isRTL ? tabCount - 1 - rawIdx : rawIdx;
      onTabChange(Math.max(0, Math.min(idx, tabCount - 1)));
    }, 80);
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="tab-shell-scroll"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "row",
        overflowX: "auto",
        overflowY: "hidden",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        // scrollBehavior is handled via scrollTo() calls, not CSS
      }}
    >
      {Children.map(children, (child) => (
        <div
          style={{
            minWidth: "100%",
            height: "100%",
            scrollSnapAlign: "start",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
