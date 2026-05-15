"use client";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ReviewModal } from "./ReviewModal";

// Global review trigger - checks localStorage and shows modal at right moment
// Add <ReviewTrigger/> to any page you want to check
export function ReviewTrigger({ trigger }: { trigger: "first_win"|"subscription"|"milestone" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only run client-side
    const key = `mindstate-review-shown-${trigger}`;
    if (localStorage.getItem(key)) return;

    // Check if this trigger should fire
    if (trigger === "first_win") {
      const wins = parseInt(localStorage.getItem("mindstate-wins") ?? "0");
      if (wins >= 1) {
        localStorage.setItem(key, "1");
        setTimeout(() => setShow(true), 2000);
      }
    } else if (trigger === "milestone") {
      const stages = parseInt(localStorage.getItem("mindstate-stages-completed") ?? "0");
      if (stages >= 10) {
        localStorage.setItem(key, "1");
        setTimeout(() => setShow(true), 2000);
      }
    }
  }, [trigger]);

  // Increment win count on mount if this is a post-win page
  useEffect(() => {
    if (trigger === "first_win") {
      const count = parseInt(localStorage.getItem("mindstate-wins") ?? "0") + 1;
      localStorage.setItem("mindstate-wins", String(count));
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <ReviewModal trigger={trigger} onClose={() => setShow(false)} />
      )}
    </AnimatePresence>
  );
}
