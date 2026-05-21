// src/hooks/useShareTrigger.ts
// Call triggerShareAfterPurchase() right after Paddle checkout success.
// Call incrementShareSession() after every completed game.
// The ShareModal in layout listens for these events.

const SHARE_KEY = "me_share_state";
const SESSIONS_BEFORE_SHARE = 3; // Ask after 3 completed games
const DAYS_COOLDOWN = 14;         // Don't re-ask for 14 days

interface ShareState {
  sessions: number;
  lastShown: number;
}

function getState(): ShareState {
  if (typeof window === "undefined") return { sessions: 0, lastShown: 0 };
  try { return JSON.parse(localStorage.getItem(SHARE_KEY) ?? "{}"); }
  catch { return { sessions: 0, lastShown: 0 }; }
}

function saveState(s: Partial<ShareState>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHARE_KEY, JSON.stringify({ ...getState(), ...s }));
}

/** Call after Paddle checkout success */
export function triggerShareAfterPurchase() {
  window.dispatchEvent(new CustomEvent("me:share:purchase"));
}

/** Call after each completed game session */
export function incrementShareSession() {
  const s = getState();
  const newSessions = (s.sessions ?? 0) + 1;
  saveState({ sessions: newSessions });

  if (newSessions >= SESSIONS_BEFORE_SHARE) {
    const daysSince = (Date.now() - (s.lastShown ?? 0)) / (1000 * 60 * 60 * 24);
    if (!s.lastShown || daysSince >= DAYS_COOLDOWN) {
      saveState({ lastShown: Date.now(), sessions: 0 });
      // Slight delay so completion animation finishes first
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("me:share:session"));
      }, 2500);
    }
  }
}