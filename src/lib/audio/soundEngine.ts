let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function isSilent(): boolean {
  try {
    const raw = localStorage.getItem("mindstate-settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.isSilentMode === true;
    }
  } catch {}
  return false;
}

function vibrate(pattern: number | number[]): void {
  if (isSilent()) return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function playTone(frequency: number, type: OscillatorType, duration: number, gainValue: number, fadeOut = true): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  gainNode.gain.setValueAtTime(gainValue, ctx.currentTime);
  if (fadeOut) {
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  }
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playClick(): void {
  if (isSilent()) return;
  playTone(800, "square", 0.06, 0.08);
  vibrate(10);
}

export function playSuccess(): void {
  if (isSilent()) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, "sine", 0.4, 0.15), i * 80);
  });
  vibrate([30, 50, 30]);
}

export function playError(): void {
  if (isSilent()) return;
  playTone(120, "sawtooth", 0.3, 0.2);
  vibrate([50, 30, 50]);
}

export function playTick(): void {
  if (isSilent()) return;
  playTone(440, "sine", 0.05, 0.03);
}

export function playHint(): void {
  if (isSilent()) return;
  playTone(660, "sine", 0.15, 0.1);
  setTimeout(() => playTone(520, "sine", 0.15, 0.08), 100);
  vibrate(20);
}

export function playUnlock(): void {
  if (isSilent()) return;
  const notes = [440, 554.37, 659.25, 880];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, "triangle", 0.3, 0.12), i * 60);
  });
  vibrate([20, 40, 20, 40, 60]);
}
