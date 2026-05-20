"use client";
import { useState, useEffect } from "react";

/**
 * Returns the current window inner width, safe for SSR.
 * Falls back to 390 (iPhone 14 viewport) on server.
 * Updates on resize.
 */
export function useScreenWidth(fallback = 390): number {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : fallback
  );

  useEffect(() => {
    function onResize() { setWidth(window.innerWidth); }
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}

/**
 * Returns a board pixel width capped to the viewport.
 * horizontalPadding: total px consumed by page chrome (nav padding × 2).
 * maxWidth: design maximum (e.g. 480).
 */
export function useBoardWidth(horizontalPadding = 48, maxWidth = 480): number {
  const screenWidth = useScreenWidth();
  return Math.min(screenWidth - horizontalPadding, maxWidth);
}