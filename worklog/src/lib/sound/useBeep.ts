import { useCallback, useEffect, useRef } from "react";

// A drag across the slider crosses 48 quarter-hour steps. Without a floor the
// feedback becomes a machine-gun rattle, so beeps are rate-limited rather than
// fired per change event.
const MIN_INTERVAL_MS = 45;
const BASE_HZ = 660;
const RANGE_HZ = 440;
const PEAK_GAIN = 0.05;

/**
 * Short synthesized tone for slider feedback.
 *
 * Synthesized rather than an audio file: no asset to ship, no decode latency,
 * and the pitch can carry information. The AudioContext is created on first
 * use — browsers block one constructed before a user gesture — and audio is
 * treated as a nicety throughout: any failure is swallowed so a blocked or
 * unsupported context can never break entering hours.
 */
export function useBeep() {
  const contextRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef(0);

  useEffect(() => {
    return () => {
      void contextRef.current?.close().catch(() => {});
      contextRef.current = null;
    };
  }, []);

  /** `position` is 0–1 and maps to pitch, so higher hours sound higher. */
  return useCallback((position = 0) => {
    // Users who ask for reduced motion are usually asking for reduced sensory
    // load generally; there is no separate media query for sound.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const now = performance.now();
    if (now - lastPlayedRef.current < MIN_INTERVAL_MS) return;
    lastPlayedRef.current = now;

    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;

      const context = (contextRef.current ??= new Ctor());
      if (context.state === "suspended") void context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const clamped = Math.min(Math.max(position, 0), 1);

      oscillator.type = "sine";
      oscillator.frequency.value = BASE_HZ + clamped * RANGE_HZ;

      // A short envelope rather than a raw start/stop: switching a gain of 0
      // instantly produces an audible click at the edges of the tone.
      const start = context.currentTime;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, start + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.06);
    } catch {
      // Audio is never load-bearing here.
    }
  }, []);
}
