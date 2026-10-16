---
name: ios27-ui
description: Designs, audits, converts and builds app screens to match Apple's iOS 27 design language (Liquid Glass navigation layer, HIG components, spring motion, native gestures) in React/Next.js/CSS web apps and in SwiftUI/UIKit. Use when asked to redesign a UI to look or feel like iOS or "native Swift", to convert or update screens to Apple HIG, to clean up a messy UI with duplicate buttons, or to build tab bars, navigation stacks, large titles, sheets, inset-grouped lists, forms, menus, swipe actions or iOS-style animations.
---

# iOS 27 UI — design, audit, convert, build

Make an app feel like Apple's own team shipped it on **iOS 27** (iOS 26 Liquid Glass plus the iOS 27
readability/control refinements). This skill is a *process* plus a *spec*. Follow the process; pull the spec
from `references/` only when you need it.

Do not use it for Material/Android, or for brand-led marketing sites.

## What "iOS 27" means (get this right first)

- iOS 27 did **not** replace Liquid Glass; it is a readability and control pass on iOS 26: darker edge and
  brighter specular highlight on glass, more uniform refraction, better contrast, and a **user transparency
  slider** (Settings → Appearance → Liquid Glass, clear → fully tinted). Default glass is less transparent than iOS 26.
- Consequence: **never depend on transparency or blur for legibility.** Text on glass must be readable fully clear
  *and* fully opaque. Always provide an opaque fallback (`prefers-reduced-transparency`, no `backdrop-filter`).
- Glass belongs to the **navigation layer only** (tab bar, nav-bar buttons, menus, sheets, floating controls).
  Content (lists, cards, rows, photos) is never glass.
- Verify anything version-specific against current Apple sources before asserting it (see Phase 1).

## Operating principles

Apple's HIG principles, applied: **Purpose** (every element serves the screen's job), **Agency** (user in control;
easy undo, confirm destructive actions), **Familiarity** (use standard patterns), **Simplicity** (fewer elements,
one obvious action), **Craft** (alignment, states, edge cases), **Delight** (motion that explains).

Hard rules — violating any of these is a defect:

1. The **tab bar only navigates** (3–5 top-level nouns). Actions never live in it.
2. **One primary action per screen**, in the navigation bar (`+`), plus `Edit` on detail screens. No duplicate
   triggers for the same action anywhere on a screen.
3. **Detail = push. Create/edit = sheet. Destructive = inside the edit sheet or swipe action, behind a confirmation
   or with Undo.** Never an inline red button on a content screen.
4. **One row = one tap target.** No "View ›" text, no second button repeating what the row does.
5. **Group instead of filter.** Prefer sections (by status/date) over segmented filter bars. Segmented controls are
   for switching *views of the same data*, max 4 segments.
6. **Inset-grouped lists** for everything tabular; separators inset to the text; chevron = navigates.
7. **No emoji as icons**; no brand header repeated on every screen; no uppercase-everything; no card inside card.
   **Quiet surfaces:** separate by tone, weight and space, not lines or color. Cards are a 2 % hairline + whisper
   shadow on a #F2F2F6 page; chrome (pills, circle buttons) uses the same material as content so it dissolves into
   the theme; one accent color; three inks then opacity; one stroke-icon weight (`references/visual-language.md`).
   **Fonts:** SF Pro (Inter fallback) for all UI; New York / Newsreader serif only for user content in reading
   contexts; tabular numerals for counts and times. Never two sans families.
8. **Large title on root screens, inline title + glass back chevron (no title text) on pushed screens.**
9. **Springs, not eases.** Motion must be interruptible, respect `prefers-reduced-motion`, and never exceed ~0.6 s.
10. **Design for real data**, not the seed: ALL-CAPS names, 10-digit phones, missing/broken photos, long strings,
    zero items, huge numbers. Show placeholders instead of broken images.
11. **Dark mode and Dynamic-Type-friendly sizes from the start**; hit targets ≥ 44 pt; semantic colors only.
12. Never ship **placeholder behaviour** (a button that only toasts "coming soon"). Implement it or remove it.

## Workflow

Work in phases. Do not skip Phase 2 — the audit is what separates a redesign from a re-skin. Tell the user what you
decided and why; do not ask permission questions when the request is clear.

### Phase 0 — Orient
Read the repo: framework, data model, routes, every screen/component, build scripts, CI. Note what you **cannot**
run locally (no network, no Xcode, no browser). If you cannot build locally, plan to use CI as the compiler and
screenshot source (Phase 6; `references/verification.md`). Take **baseline screenshots** of the current UI.

### Phase 1 — Research (briefly, then act)
Check current Apple material for anything you will rely on: HIG (tab bars, toolbars, sheets, lists), WWDC25
*Get to know the new design system* (356), *Meet Liquid Glass* (219), *Build a UIKit/SwiftUI app with the new design*
(284/323), WWDC26 *Principles of great design* (250), *Design intuitive search experiences* (292), *Craft clear names*
(290), *What's new in SwiftUI* (269). If the web is blocked, use `references/` and say so. Mark unverified numbers as
approximations. Exact glass/radius values are not published by Apple; match concentricity to the screen corner.

### Phase 2 — Audit every element (`references/audit-and-convert.md`)
Produce an **element decision table** for each screen *before coding*: element → user goal it serves → duplicate of →
right place per HIG → decision (keep / move / merge / remove) → reason. Apply the necessity tests. Look for: duplicate
actions, tabs that show the same data, fake/placeholder actions, hard-coded values, filters that grouping could replace,
chrome that repeats on every screen.

### Phase 3 — Information architecture
Decide tabs, root screens, detail screens, sheets, and where each action lives. Merge redundant tabs. Add a summary
screen only if it answers "what needs my attention today?". Write the IA down (README or PR) so the user can review it.

### Phase 4 — Build bottom-up (`references/design-tokens.md`, `references/components.md`)
1. **Tokens** (colors, type, spacing, radii, glass, springs) — copy `assets/tokens.css` and `assets/motion.ts`.
   For the quiet, content-first look also copy `assets/quiet-kit.css` and match `examples/notes-showcase.html`
   (proportions and restraint; build at real iOS sizes, the showcase phone is drawn at ≈ 0.835×).
2. **Kit** (Screen/NavBar, BarButton, List/Row/Section, Controls, Menu, Sheet, ActionSheet, HUD, EmptyState).
3. **Screens**, root → detail → sheets. Reuse kit; never restyle per screen.
For web specifics (navigation stack, history sync, overlays) read `references/web-implementation.md`.
For real SwiftUI/UIKit read `references/native-swiftui.md` and **use system components — do not re-skin them.**

### Phase 5 — Motion & gestures (`references/motion.md`)
Push with parallax and interactive edge-swipe back; sheets that recede the app and drag to dismiss; large-title
collapse; press springs; menu origin scaling; Undo HUD; discard-changes guard on dirty forms.

### Phase 6 — Verify like a skeptic (`references/verification.md`)
Compile (type-check + build), then render on an iPhone profile in **light and dark**, drive real flows, and **assert**
behaviour (not just "page loads"). Open every screenshot at full size and write a defect list: truncation, stray
separators, overlaps under the tab bar, off-by-few-pixels edges, font fallback, contrast, tap-target size.
Fix in batches; re-run until clean. Never claim success from a green build alone.

### Phase 7 — Report honestly
Summarize: what changed in IA, what was removed and why, **behaviour changes the user must review** (data writes,
deleted routes, hard-coded business data), what was verified and how, and what was **not** verified (real-device
glass/blur, SF Pro, haptics, animation feel, keyboard behaviour). Do not overclaim "native Swift" for a web app —
say "follows the same patterns and behaviour".

## Conversion mode (existing screen → iOS 27)

1. Screenshot it. 2. List every element (audit table). 3. Map each to a standard component
(`references/components.md`). 4. Delete duplicates/chrome. 5. Rebuild with kit components. 6. Re-test with dirty data.
7. Diff behaviour: nothing the user relied on may silently disappear — relocate it and say where.

## Definition of done

- [ ] Element decision table exists for each screen; no duplicate actions remain.
- [ ] Tabs navigate only; one `+` per screen; delete lives in edit sheets with confirmation/Undo.
- [ ] Light + dark verified; legible with glass fully opaque; reduced-motion respected.
- [ ] Real-data edge cases handled (empty, long, missing image, odd formats).
- [ ] Type-check + build green; interaction assertions green; screenshots reviewed at full size.
- [ ] Report lists behaviour changes and unverified areas.

## References (load only what you need)

| File | Use for |
| --- | --- |
| `references/audit-and-convert.md` | Element decision table, necessity tests, anti-pattern fixes, IA rules |
| `references/design-tokens.md` | Colors, type scale, metrics, radii, glass recipe, dark mode |
| `references/visual-language.md` | Quiet-surface aesthetic, fonts, themed backgrounds, layout recipes, a11y guardrails |
| `references/components.md` | Anatomy and rules for each iOS component |
| `references/motion.md` | Spring tokens, transitions, gestures, thresholds |
| `references/web-implementation.md` | React/Next architecture, code patterns, gotchas |
| `references/native-swiftui.md` | SwiftUI/UIKit API mapping for iOS 26/27 |
| `references/verification.md` | CI-as-compiler, screenshot harness, assertions, defect hunting |
| `assets/` | `tokens.css`, `quiet-kit.css`, `motion.ts`, CI templates |
| `examples/notes-showcase.html` | Visual target (10 screens, light/dark/themed). Read one `build*Screen` function at a time |
