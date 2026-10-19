# Verification: be your own skeptical reviewer

A green build proves nothing about UX. Verify in layers and **look at the pixels**.

## 1. CI as the compiler (when you can't build locally)
Typical sandbox: no package registry, no browser. Make CI do it:
- `ci.yml`: `npm ci` → `tsc --noEmit` → `npm run build` on every push. Poll with `gh run list` / `gh run view`.
  (If `gh run view --log` is forbidden, make the test script write its own log file and publish it.)
- `screens.yml`: build with an **offline flag**, start the server, run Playwright **WebKit** with an iPhone device profile,
  write PNGs + `log.txt` to a `shots/` dir, force-push to a `ci-screenshots` branch (`if: always()`), then fetch that branch
  locally and open the images. Templates: `assets/ci/`.
- Seed the app from a **fixture that looks like production** (ALL-CAPS names, 10-digit phones, a broken image URL, an
  expiring document, a delivered + unpaid trip, an empty-state variant). Never hit the production DB from CI.

## 2. Drive real flows (not just screenshots)
Use accessible roles/names (`getByRole('tab', {name})`, `getByRole('button', {name})`). Wait with `waitForTimeout` after
transitions (CI is slow: 1.5–2.2 s for sheets). Scroll via `el.scrollTop = y` (not smooth). Click only inside the viewport.
Scope text queries to the active tab pane.

Minimum assertions for an iOS-style app:
1. Swipe-to-delete removes the row, an **Undo** HUD appears, Undo restores it.
2. Interactive edge-swipe back returns to the list.
3. Dirty form + ✕ → "Discard changes?" action sheet appears.
4. Create flow end to end: fill form → ✓ → new item appears in the list and totals update.
5. Browser Back closes the sheet first, then pops the screen, then the next sheet again (history sync).
6. Menu opens, items work, outside tap / Esc closes.
Make the job **fail** (non-zero exit) on any failed assertion, but still publish artifacts.

## 3. Screenshot review protocol
Capture: every root tab, every detail (scrolled + unscrolled), every sheet, a menu, an action sheet, an empty state,
**light and dark**. Open each at full size and write defects with coordinates/area:

- Truncated or wrapped titles/values; overlapping text under the tab bar or nav buttons.
- Stray lines (separators in non-row cards), double borders, mis-aligned insets.
- A sliver of the previous screen at an edge (animation not landing), wrong dimming, content not clearing the tab bar.
- Fonts falling back to a wide face; numbers not tabular; icon weights inconsistent.
- Contrast on glass in both modes; disabled vs enabled commit button; focus rings.
- Placeholder vs real data (missing photo, ALL-CAPS name) rendering.
Fix in one batch → push → re-run → compare. Repeat until a pass finds nothing.

## 3b. Motion review (fluid-interface checks)
Drive these in the browser harness and assert, don't eyeball:
- Press feedback appears on `pointerdown` (screenshot between down and up).
- Grab a sheet/drawer mid-animation: it follows the pointer from its current position (no jump).
- Fast short flick commits; slow long drag below threshold springs back (projection, not position).
- Drag past a boundary: displacement < pointer travel (rubber-band), springs back on release.
- `reducedMotion: 'reduce'` context: transitions become fades; nothing slides or bounces.
- Record a video (`recordVideo`) and step through frames for jumps, strobing and 2–6 px landing strips.

## 4. Things CI cannot prove — say so in the report
Real backdrop blur/refraction and SF Pro (headless Linux WebKit), animation feel and frame rate, haptics,
on-screen keyboard behaviour, installed-PWA/standalone quirks, the OS transparency slider. Ask the user to check these
on a device and list exactly what to look at.

## 5. Report template
```
Verified: type-check + build; N interaction assertions (list); light+dark screenshots reviewed.
Not verified: <device-only items>.
Behaviour changes to review: <data writes, removed routes, deleted files, hard-coded business data, id formats>.
Where did X go: <old control → new location>.
```
