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
  /** Released with velocity (flick, throw). Pass the gesture velocity alongside. */
  fling: { type: 'spring', duration: 0.35, bounce: 0.2 },
  /** Reduced-motion replacement for slides/springs: animate opacity only with this. */
  fade: { type: 'tween', duration: 0.2, ease: 'easeOut' },
} satisfies Record<string, Transition>;

/**
 * Convert Apple's (damping ratio, response) to a Framer Motion / Motion spring.
 * bounce = 1 − ζ for ζ ≤ 1. Uses `visualDuration` (≈ response) where the library supports it.
 */
export function appleSpring(dampingRatio: number, response: number): Transition {
  return { type: 'spring', bounce: Math.max(0, 1 - dampingRatio), visualDuration: response } as Transition;
}

export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reduced motion = gentler, not none. Returns a short fade transition; pair it with variants that change
 * opacity instead of position/scale (references/motion.md §12).
 */
export function tx(t: Transition): Transition {
  return reducedMotion() ? spring.fade : t;
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
