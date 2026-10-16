import type { Transition } from 'framer-motion';

/**
 * Spring tokens modelled on SwiftUI's presets (duration + bounce):
 * smooth = no bounce, snappy = slight, bouncy = playful.
 */
export const spring = {
  smooth: { type: 'spring', duration: 0.5, bounce: 0 },
  snappy: { type: 'spring', duration: 0.38, bounce: 0.14 },
  bouncy: { type: 'spring', duration: 0.5, bounce: 0.3 },
  sheet: { type: 'spring', duration: 0.5, bounce: 0.06 },
  push: { type: 'spring', duration: 0.46, bounce: 0 },
  press: { type: 'spring', duration: 0.28, bounce: 0.3 },
} satisfies Record<string, Transition>;

export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Returns an instant transition when the user asked for reduced motion. */
export function tx(t: Transition): Transition {
  return reducedMotion() ? { duration: 0 } : t;
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Light haptic tick where supported (Android/Chrome); silently ignored on iOS Safari. */
export function haptic(ms = 8) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms);
  } catch {
    /* not supported */
  }
}
