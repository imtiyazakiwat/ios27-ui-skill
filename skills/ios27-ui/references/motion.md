# Motion & gestures

Sources: WWDC18 *Designing Fluid Interfaces* (803), WWDC19 *Designing Audio-Haptic Experiences* (810), WWDC23
*Animate with springs* (10158). Helpers: `assets/motion.ts` (spring tokens), `assets/gestures.ts` (velocity,
projection, rubber-band, snapping).

**The through-line:** motion starts from the current on-screen value, inherits the finger's velocity, projects
momentum forward, and can be grabbed and reversed at any instant. Springs make all four natural.

## 1. Response: kill latency
- Feedback on **pointer-down**, commit on pointer-up. Never wait for `click` to highlight.
- Audit the input path: debounces, artificial timers, "wait for the transition" guards, the legacy tap delay
  (`touch-action: manipulation`). Anything non-essential on that path is a regression.
- Feedback is **continuous during** a gesture (drag, slider, drawer track 1:1), not only at the end.

## 2. Direct manipulation: 1:1 tracking
- Content stays glued to the finger and keeps the **grab offset** (never snap the element's center to the pointer).
- Pointer Events + `setPointerCapture` so tracking survives leaving the element; `touch-action` set on the drag axis
  (`pan-y` for a horizontal swipe row) so the browser doesn't steal the gesture.
- Keep a short position/time history (last ~100 ms) to compute release velocity (`createVelocityTracker`).

## 3. Interruptibility: the most important rule
- Never lock out input during a transition. A closing sheet that's grabbed again follows the finger.
- Always animate from the **presentation (live) value**, not the logical target. Read the current transform/motion
  value on interrupt; starting from the target causes a jump.
- Gesture-driven motion uses springs or motion values, **not CSS transitions or `@keyframes`** (they can't be grabbed
  and reversed smoothly). CSS transitions are fine for non-interactive state changes (color, a press scale).
- On reversal, **carry velocity through the re-target** (Framer Motion / Motion do this when you re-animate a motion
  value). A hard cut to a new animation is a velocity "brick wall".
- 2D motion = **independent X and Y springs**, each with its own velocity.

## 4. Springs, not durations
Apple describes a spring with two designer parameters; SwiftUI exposes the same idea as `duration` + `bounce`.

| Apple (UIKit / Fluid Interfaces) | SwiftUI | Framer Motion / Motion |
| --- | --- | --- |
| damping ratio `ζ` | `bounce = 1 − ζ` (for ζ ≤ 1) | `bounce` |
| response (s) | `duration` (perceptual) | `visualDuration` (recent versions; else `duration`, which includes the settle tail) |

- **Default: critically damped (ζ = 1, bounce 0)**, response 0.3–0.4 s. Calm, no overshoot.
- **Bounce only when the gesture carried momentum** (flick, throw, drag release): ζ ≈ 0.8 (bounce 0.2). Overshoot on
  a menu that just appeared is wrong; on a card you flicked it's right.
- Values Apple has shown: reposition (PiP) ζ 1.0 / 0.4 s; rotation ζ 0.8 / 0.4 s; drawer/sheet ζ 0.8 / 0.3 s.

### Spring tokens (`assets/motion.ts`)

| Token | duration | bounce | Use |
| --- | --- | --- | --- |
| smooth | 0.50 | 0 | layout changes, non-gesture transitions |
| snappy | 0.38 | 0.14 | menus, tab lens, segmented thumb, switch, snap-back |
| bouncy | 0.50 | 0.30 | icon selection pop |
| sheet | 0.50 | 0.06 | sheet present/dismiss without a fling |
| fling | 0.35 | 0.20 | anything released with velocity (sheet throw, card toss, carousel) |
| push | 0.46 | 0 | navigation push/pop |
| press | 0.28 | 0.30 | glass button / tile press (scale 0.9–0.97) |

Use `appleSpring(ζ, response)` to convert values from Apple talks. Everything settles visually in ≤ ~0.6 s.

## 5. Velocity handoff
When a drag ends, the animation continues at the finger's **exact** velocity, so there's no seam.
- Framer Motion / Motion: pass absolute px/s as `velocity`.
- APIs that want relative velocity (UIKit `initialSpringVelocity`, some libraries):
  `relative = velocity / (target − current)` (`relativeVelocity()`).

## 6. Momentum projection
Choose the target from **where the gesture is going**, not where it was released.
```ts
const projected = current + project(velocity);      // d ≈ 0.998 (UIScrollView normal); 0.99 = snappier
const target = nearest(snapPoints, projected);
animate(value, target, { ...spring.fling, velocity });
```
- `project(v, d) = (v / 1000) · d / (1 − d)` (Apple's sample code; exponential decay, not `v²/2a`).
- Decide commit vs. cancel with the **projection / velocity sign**, not the release position alone. A short fast
  flick toward "dismiss" dismisses.

## 7. Spatial consistency
- Enter and exit along the **same path**: in from the right → out to the right; up from the bottom → down.
- Anchor to the source: menus, popovers and zoom transitions grow from the trigger (`transform-origin` at the
  trigger's corner / matched geometry). Closing returns to it.
- Reversible transitions mirror their curve (with springs this is automatic).
- **Hint toward the outcome:** intermediate frames point where things are going (Control Center modules grow up and
  out toward the finger).

## 8. Rubber-banding
At a boundary, resist progressively, never hard-stop: `rubberband(overshoot, dimension, c = 0.55)`
= `(overshoot · dimension · c) / (dimension + c · |overshoot|)`. Release springs back with `snappy`.

## 9. Gesture checklist
- Tap: highlight on down; ~10 px slop around the target; dragging away cancels, dragging back re-arms.
- Drag/swipe: ~10 px hysteresis before committing to an axis, then 1:1.
- Recognize plausible gestures **in parallel** from the first move; cancel the losers once intent is clear. Avoid
  "final state only" recognizers (`swipeleft` events), which throw away continuous tracking.
- Only pay double-tap disambiguation delay where double-tap really exists.
- A click after a drag must be ignored.

## 10. Frames
- Animate only `transform` and `opacity`; `will-change` just before motion, removed after.
- `requestAnimationFrame` is the display clock; never `setInterval`.
- Keep per-frame movement small for large objects; very fast motion can use a subtle stretch instead of a hard streak.
- Review in slow motion / frame-by-frame (see `references/verification.md`).

## 11. Multimodal feedback (motion + sound + haptics)
1. **Causality:** fire on the causal event (toggle flips, item snaps home) and match its physical character.
2. **Harmony:** visual, sound and haptic on the **same frame**. Don't let a CSS transition lag the haptic.
3. **Utility:** only for meaningful moments (commit, snap, success, error). Over-feedback trains people to ignore it.

Web: `navigator.vibrate` works on Android Chrome; iOS Safari ignores it. Native: `.sensoryFeedback` (SwiftUI) /
`UIFeedbackGenerator`.

## 12. Reduced motion, transparency, contrast
Reduced motion means a **gentler equivalent, not no feedback**.
- `prefers-reduced-motion: reduce`: replace slides, springs, parallax and zooms with a ~200 ms **opacity cross-fade**
  (`spring.fade`); remove overshoot; keep color/opacity changes that aid comprehension. Gesture tracking stays 1:1
  (the user is causing it), but release animations become fades or short non-bouncy settles.
- `prefers-reduced-transparency: reduce`: solid surfaces, no blur.
- `prefers-contrast: more`: near-solid backgrounds with a defined border.
- Vestibular safety: no full-viewport moving backgrounds; no slow looping oscillation (≈ 0.2 Hz); fade big surfaces
  during large repositions; ease dark ↔ light changes instead of a brightness jump.

## iOS patterns (concrete)

### Navigation push/pop
- Incoming screen slides 100 % → 0; the screen beneath moves to **−30 %** and dims (≈ 14 % black); soft shadow on the
  incoming edge. Pop is the exact reverse.
- Drive all layers from **one** depth value per stack so push, pop and interactive swipe can never disagree.
- **Interactive pop:** 22 px left-edge zone, 1:1; commit if projected progress > 0.5 or velocity > ~520 px/s, else
  spring back with the release velocity. A swipe that starts during a transition grabs it (interrupt), never queues.
- Land **exactly** on the target (set the final value on completion and on a safety timeout); springs that stop within
  a rest delta leave 2–6 px strips.

### Sheets
- Rise with `sheet` (or `fling` when thrown); backdrop fades 0.3 s. Large sheets: the app layer scales to ≈ 0.92,
  gains radius, dims. Stacked sheets progressively dim and push back each parent.
- Drag header 1:1 (rubber-band upward past the top detent); choose the detent from the **projected** position;
  dismiss if projection passes ~40 % of height or velocity > ~700 px/s.
- Dirty form: snap back **and** ask to discard.
- Keyboard: lift the sheet body by the visual-viewport inset.

### Large title → inline title
Large title scrolls with content; inline title (17 semibold) fades in over ~24 px once the large block leaves.
Scroll-edge effect under the bar after ~14 px. Hero headers: image at ~0.4× scroll, scales up on overscroll.

### Micro-interactions
- Tab lens: shared-layout slide (snappy); icon pop (bouncy); selected icon heavier stroke.
- Segmented thumb: shared-layout slide. Switch thumb slides 22 px and stretches ×1.14 while pressed.
- Press: scale 0.9 glass circle, 0.95–0.97 tiles/primary, on pointer-down. Rows: background flash only.
- Menu: scale 0.5 → 1 from the trigger's corner (snappy); exit 0.14 s back toward the trigger.
- HUD: drops from −90 px with snappy.
- Swipe row: `touch-action: pan-y`, 10 px hysteresis, 1:1, rubber-band past the actions; open if projected past 1/3
  of the actions width; full swipe commits the destructive action only with Undo.

## Don'ts
No bounce on navigation. No animation on first paint of lists. No parallax on content cards. No spinners for local
data. Nothing settles slower than ~0.6 s. Never block input while animating (interrupt instead). No fixed-duration
eases for anything a finger can touch.
