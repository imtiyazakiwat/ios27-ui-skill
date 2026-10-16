# Web implementation (React / Next.js / Framer Motion)

Suggested file layout: `lib/nav.tsx` (per-tab stacks), `lib/backStack.ts` (history sync), `components/kit/*`
(Screen, BarButton, List, Controls, Menu), `components/overlay/OverlayProvider.tsx` (sheets, dialogs, HUD),
`components/nav/*` (NavStack, TabBar), `app/globals.css` (tokens). If the project already has equivalents, extend them.
**Check the project's framework docs first** (e.g. Next.js majors change APIs) — the patterns below are framework-neutral.

## Architecture

Single-page client shell, not route-per-screen: iOS push needs the previous screen to stay mounted (parallax, interactive
swipe-back, preserved scroll position per tab).

```
App
 ├ DataProvider (cache-first + realtime sync, optimistic writes)
 ├ NavProvider  (per-tab route stacks + one `depth` MotionValue per tab)
 └ OverlayProvider (sheets, action sheets, HUD, menu portal host; exposes `receded`)
     └ AppLayer.is-receded ─ TabPane ×N (visibility:hidden when inactive; keeps state) ─ NavStack ─ Layers
       TabBar (floating)
```

### Navigation stack in ~40 lines of idea
- Layer `i` (root = 0) x = `incoming*100% − covered*30%` where `incoming = 1 − clamp(depth−(i−1), 0, 1)`,
  `covered = clamp(depth−i, 0, 1)`. Dim = `covered × 0.14`.
- `push`: append route, `depth.set(n)`, wait one frame, animate to `n+1`. `pop`: animate to `n−1`, then remove the route.
- Serialise operations per tab with a promise queue; ignore a duplicate push within ~600 ms.
- Edge swipe component sets `depth` directly while dragging, then `finishSwipe(commit)`.
- Lower layers get `inert` + `aria-hidden`.
- Tab re-tap: pop to root, else scroll to top (signal via context counter).

### Back button / history (Android, Safari swipe, browser Back)
`pushBack(fn)` pushes a history entry and registers a closer; `releaseBack(ids)` removes entries when closed inside the app
with a single `history.go(-n)` and a `skip` counter so the resulting `popstate` is ignored. Handle forward navigation by
undoing it. **Push history in event handlers, never in effects** (React StrictMode double-invokes effects). Dirty sheets
re-arm their entry and ask to discard.

### Overlays
- `present(element, {detent})`, `confirm({title,message,actions,cancelLabel})`, `toast(text,{undo})`.
- Sheet content uses `useSheet()` → `dismiss`, `requestDismiss`, `setDirty`, `startDrag`.
- Sheets/menus render into a host inside the device frame (`position:absolute`, not `fixed`) so desktop previews clip correctly.
- Use `px` (not `%`) for sheet exit/enter y; mixed-unit tween glitches.

### Data layer
- Cache-first (localStorage) → render immediately → subscribe to realtime → reconcile. Keep `ref`s mirroring state so
  consecutive mutations never read stale lists. Write only changed objects (`prev !== next` by identity).
- Keep cross-entity links consistent in one function (truck↔driver assignment).
- Seed demo data **once per database** (marker doc), never "when empty".
- Offline switch (`NEXT_PUBLIC_OFFLINE=1`) so CI/screenshots never touch production.
- Strip `undefined` before writing to Firestore (`JSON.parse(JSON.stringify(x))`).
- Detail screens use a `useStable(value)` hook so a just-deleted record keeps rendering while its screen slides away.

## Gotchas learned the hard way

| Symptom | Cause → fix |
| --- | --- |
| Swipe release also opens the row | The click fires **before** the drag-end callback → set a `dragged` flag on drag **start**, ignore clicks while set (clear ~120 ms after end) |
| Pushed screen 2–6 px off from the edge | Spring stops inside `restDelta` (unit = screens!) → `restDelta: 0.0005`, `mv.set(target)` on complete **and** on a safety timeout |
| Stray divider line in a stat card | Generic `.card > * + *::before` separators → add `.card.plain` for non-row cards |
| Text under glass unreadable in some browsers | `backdrop-filter` missing/blurred away → raise glass alpha (.74), keep scroll-edge gradient solid behind bars |
| Wide, ugly digits | `ui-rounded` stack ended in a system face → add the Inter variable before `system-ui` |
| Menu closes but next click is blocked | Click outside the viewport in tests, or exit animation still running → test with in-viewport coordinates; add Esc handler |
| Duplicated text matches in tests | Hidden tab panes are still in the DOM → scope queries to `.tab-pane[data-active="true"]` |
| iOS zoom on input focus | Font-size < 16 px → inputs 17 px |
| Status bar text unreadable | `black-translucent` forces white text → use `default` for light backgrounds |
| `h1` etc. look unstyled | Tailwind preflight resets elements → style explicitly |
| Two quick history closes lose one | Batch into one `history.go(-n)` or delay the second close until the first animation ends |
| Sheet jumps with keyboard | Layout viewport doesn't shrink on iOS → `visualViewport` inset into a CSS var added to sheet bottom padding |

## Performance & a11y
Lazy-import heavy libs (xlsx, jsPDF) inside the action. `role=tab/tablist/switch/dialog/alertdialog/menu`, `aria-label` on
every icon-only button, `aria-pressed` on segments, `inert` on covered screens, visible `:focus-visible` ring, 44 pt targets,
`prefers-reduced-motion`, `prefers-contrast`, `prefers-reduced-transparency`.

## Documents/exports
jsPDF built-in fonts have no ₹ glyph → print "Rs." (or embed a font). Indian grouping: `Intl.NumberFormat('en-IN')`;
compact "₹1.46 L / ₹2.3 Cr" in tight tiles.
