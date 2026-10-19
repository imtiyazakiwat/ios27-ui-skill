/**
 * Gesture physics helpers (framework-neutral, zero dependencies).
 * Spec: references/motion.md §2–§9. Values follow Apple's "Designing Fluid Interfaces" (WWDC18) sample code.
 */

/** UIScrollView deceleration rates. */
export const DECELERATION = { normal: 0.998, fast: 0.99 } as const;

/**
 * Distance a flick travels before coming to rest (exponential decay, as in Apple's sample code).
 * @param velocity px/s (signed)
 */
export function project(velocity: number, decelerationRate: number = DECELERATION.normal): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Nearest snap point to a (projected) position. */
export function nearest(points: readonly number[], value: number): number {
  return points.reduce((best, p) => (Math.abs(p - value) < Math.abs(best - value) ? p : best), points[0]);
}

/** Pick a snap target from release position + velocity in one call. */
export function snapTarget(points: readonly number[], current: number, velocity: number, rate?: number): number {
  return nearest(points, current + project(velocity, rate));
}

/** Velocity relative to the remaining distance, for APIs that want normalized spring velocity (UIKit-style). */
export function relativeVelocity(velocity: number, current: number, target: number): number {
  const distance = target - current;
  return distance === 0 ? 0 : velocity / distance;
}

/**
 * Progressive resistance past a boundary (UIScrollView-style).
 * @param overshoot how far past the bound the finger is (signed px)
 * @param dimension size of the scrolling axis (px)
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Clamp a dragged value to [min, max] with rubber-banding outside the range. */
export function rubberbandClamp(value: number, min: number, max: number, dimension: number, constant = 0.55): number {
  if (value < min) return min + rubberband(value - min, dimension, constant);
  if (value > max) return max + rubberband(value - max, dimension, constant);
  return value;
}

/**
 * Release-velocity tracker. Feed it every pointermove; read px/s on pointerup.
 * Uses samples from the last `windowMs` so a pause before release correctly reads as ~0.
 */
export function createVelocityTracker(windowMs = 100) {
  let samples: { t: number; x: number; y: number }[] = [];
  return {
    reset() {
      samples = [];
    },
    add(x: number, y: number, t: number = performance.now()) {
      samples.push({ t, x, y });
      while (samples.length > 2 && t - samples[0].t > windowMs) samples.shift();
    },
    /** px/s on each axis; 0 if the pointer was still for longer than the window. */
    velocity(now: number = performance.now()): { x: number; y: number } {
      const recent = samples.filter((s) => now - s.t <= windowMs);
      if (recent.length < 2) return { x: 0, y: 0 };
      const a = recent[0];
      const b = recent[recent.length - 1];
      const dt = (b.t - a.t) / 1000;
      return dt > 0 ? { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt } : { x: 0, y: 0 };
    },
  };
}

/**
 * Axis lock with hysteresis: returns null until the pointer has moved `slop` px, then the dominant axis.
 * Run every recognizer in parallel and cancel the ones whose axis lost.
 */
export function lockAxis(dx: number, dy: number, slop = 10): 'x' | 'y' | null {
  if (Math.hypot(dx, dy) < slop) return null;
  return Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
}
