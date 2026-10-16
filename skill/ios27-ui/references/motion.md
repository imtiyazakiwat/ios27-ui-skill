# Motion & gestures

Principle: motion explains cause and effect, stays **interruptible**, and uses **springs** (duration + bounce, as in
SwiftUI) — not fixed-duration eases. Everything ≤ ~0.6 s. Respect `prefers-reduced-motion` (swap to instant).

## Spring tokens (SwiftUI-style: `duration`, `bounce`)

| Token | duration | bounce | Use |
| --- | --- | --- | --- |
| smooth | 0.50 | 0 | general layout changes |
| snappy | 0.38 | 0.14 | menus, tab lens, segmented thumb, switch, snap-back |
| bouncy | 0.50 | 0.30 | icon selection pop |
| sheet | 0.50 | 0.06 | present/dismiss sheets and action sheets |
| push | 0.46 | 0 | navigation push/pop |
| press | 0.28 | 0.30 | glass button / tile press (scale 0.9–0.97) |

Framer Motion: `{ type: 'spring', duration, bounce }`. CSS fallback: `cubic-bezier(0.32, 0.72, 0, 1)` ≈ iOS ease-out.

## Navigation push/pop
- Incoming screen slides from 100 % → 0; the screen beneath moves to **−30 %** and dims (≈ 14 % black); a soft shadow on the
  incoming edge. Pop is the exact reverse.
- Drive *all* layers from **one** animated "depth" value per stack so push, pop and the interactive swipe can never disagree.
- **Interactive pop:** 22 px left-edge zone; follow the finger 1:1; commit if progress > 0.4 or velocity > ~520 px/s,
  else spring back. Disable while a transition runs.
- Always land **exactly** on the target (set the final value on completion and on a safety timeout) — springs that stop
  within a "rest delta" leave visible 2–6 px strips.

## Sheets
- Rise from the bottom with the `sheet` spring; backdrop fades (0.3 s). Large sheets: the app layer scales to ≈ 0.92,
  gains radius, dims (CSS transition ~0.5 s with the iOS ease).
- Drag header downward 1:1; dismiss if offset > ~130 px or velocity > ~700 px/s; otherwise snap back with `snappy`.
- Dirty form: snap back **and** ask to discard.
- Keyboard: lift the sheet body by the visual-viewport inset.

## Large title → inline title
Large title scrolls with content. Inline title (17 semibold, centered) fades in over ~24 px once the large block leaves.
Scroll-edge fade under the nav bar appears after ~14 px of scroll. Hero headers: image translates at ~0.4× scroll and
scales up on overscroll (rubber-band).

## Micro-interactions
- Tab lens: shared-layout slide (snappy); icon scale pop (bouncy); selected icon heavier stroke.
- Segmented thumb: shared-layout slide. Switch thumb: slides 22 px and stretches ×1.14 while pressed.
- Buttons/tiles: `whileTap` scale (0.9 glass circle, 0.95–0.97 tiles/primary). Rows: background flash only.
- Menu: scale 0.5 → 1 from the trigger's corner (snappy), exit 0.14 s.
- HUD: drops from −90 px with snappy spring.
- Swipe row: drag with 12 % elastic overscroll; open if past 1/3 or velocity < −450; click after a drag must be ignored.
- Haptics: tick on selection changes and destructive confirmations (`navigator.vibrate` only works on Android; iOS Safari
  ignores it — in native use `sensoryFeedback`).

## Don'ts
No bounce on navigation. No animation on first paint of lists. No parallax on content cards. No spinners for local data.
No motion > 0.6 s. Never block input while animating (interrupt instead).
