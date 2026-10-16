
# iOS 27 UI rules (summary — full procedure: `{{SKILL_DIR}}/SKILL.md`)

Goal: screens that feel like Apple shipped them on iOS 27 (iOS 26 Liquid Glass + iOS 27 readability refinements).

## Hard rules
1. **Tab bar = navigation only** (3–5 top-level nouns). Never put actions in it. Merge tabs that show the same data.
2. **One primary action per screen**: a `+` in the navigation bar (plus `Edit` on detail screens). No duplicate triggers.
3. **Detail = push, create/edit = sheet, destructive = inside the edit sheet or a swipe action, always with confirmation or Undo.**
4. **One row = one tap target.** No "View ›" links, no repeated buttons; chevron means "navigates".
5. **Group instead of filter**; inset-grouped lists; separators inset to the text; sentence case; uppercase only for 13 pt section headers.
6. **Large title on root screens; inline title + glass chevron-only back button on pushed screens.**
7. **Liquid Glass only on the navigation layer** (tab bar, bar buttons, menus, sheets). Never on content. Must stay legible
   when fully opaque (iOS 27 transparency slider, Reduce Transparency) — no reliance on blur.
8. **Springs, not eases**; interruptible; ≤ 0.6 s; honour `prefers-reduced-motion`. Push with parallax + interactive edge-swipe back;
   large sheets recede the app and drag to dismiss; dirty forms ask "Discard Changes?".
9. **Quiet surfaces**: separate by tone and space, not lines; 2 % hairline + whisper shadow on cards; chrome uses the content material so it dissolves into the theme/background; one accent; stroke icons. SF Pro/Inter for UI, serif (New York/Newsreader) only for user content.
10. **Semantic colors only** (blue interactive, green good, orange attention, red destructive); light + dark; 44 pt targets; icons are one family.
11. **Design for real data**: ALL-CAPS names, odd phone formats, missing/broken images, empty lists, long text. No placeholder actions.
12. **Native targets (SwiftUI/UIKit): use system components** (`TabView`, `NavigationStack`, `List(.insetGrouped)`, `.sheet` + detents,
    `.confirmationDialog`, `.swipeActions`, `Menu`, `ContentUnavailableView`) — do not re-skin them or fake glass behind system bars.

## Process
Audit every element first (keep / move / merge / remove, with reasons) → define IA → tokens → kit components → screens →
verify with CI screenshots in light **and** dark and assert flows → report what was **not** verified (device blur, SF Pro, feel).

Details: `{{SKILL_DIR}}/references/` (audit-and-convert, design-tokens, visual-language, components, motion, web-implementation, native-swiftui, verification).
