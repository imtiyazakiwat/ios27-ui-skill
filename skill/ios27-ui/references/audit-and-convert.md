# Audit & convert: think like the Apple design team

Goal: decide what *should* exist before deciding how it looks. A re-skin of a bad structure is still bad.

## 1. Element decision table (write one per screen, before coding)

| Element | Job it does for the user | Duplicate of / overlaps | Right place per HIG | Decision | Why |
| --- | --- | --- | --- | --- | --- |
| "Add Truck" pill in header | create a record | tab bar? no. nav `+` | nav bar trailing | **Move** → nav `+` | one primary action |
| "View Voucher ›" text + button + row tap | open detail | the row itself | row tap only | **Remove** x2 | one row = one target |
| Brand avatar + "SUHEL ROADLINES" on every tab | identity | large title | none (Apple apps don't) | **Remove** | chrome without purpose |

Decisions are only: **Keep / Move / Merge / Remove**. Every "Remove" and "Move" must say where the capability went.

## 2. Necessity tests (apply to every element)

1. **Purpose** — which user goal does this serve *on this screen*? No answer → remove.
2. **Duplicate** — does anything else on the screen (or tab bar) trigger the same thing? Keep the standard one.
3. **Frequency × risk** — frequent & safe → visible. Rare → menu/sheet. Destructive → edit sheet + confirm/Undo.
4. **Standard component** — is there an iOS component for this (Menu, swipe action, segmented control, action sheet)?
   Use it instead of inventing a pill/chip/card.
5. **Information value** — does the text/number help a decision *now*? Move metadata to the detail screen.
6. **Placement** — navigation → tab bar; screen action → nav bar; item action → row swipe/context menu/detail;
   secondary actions → "…" menu; commits → sheet's ✓.
7. **Honesty** — is the control real? Placeholder/toast-only actions are removed or implemented.

## 3. Anti-patterns → iOS fix

| Smell | Fix |
| --- | --- |
| Header "Add X" pill **and** FAB/tab action | single nav-bar `+` |
| Two tabs listing the same entity | one tab; second view becomes a section or a summary row |
| Filter chips/segmented bar for status | sections grouped by status (counts in header) |
| Row with 3 buttons + "View ›" | row navigates; actions in detail or swipe/context menu |
| Export Excel/PDF buttons repeated per screen | "…" menu on lists; one "Export…" row (action sheet) on details |
| `+ Advance` `+ Kharch` `Call` pills | Contacts-style **action tiles** under the header |
| Delete button on the content screen | inside Edit sheet (bottom, red) + confirmation; ledger rows: swipe + **Undo** |
| Emoji icons, mixed icon styles | one icon family, regular weight, tinted tiles (Settings-style) |
| Cards inside cards, shadows everywhere | flat inset-grouped sections on grouped background |
| Uppercase bold labels everywhere | sentence case; uppercase 13 pt only for section headers |
| Subtitle under every large title | drop it (use a date/summary only where it is information) |
| Brand header on each screen | none; app name belongs to the Home/Today large title or nowhere |
| Wizard/toast "coming soon" | build the form or remove the entry point |
| Long status pills on every row | status shown by grouping or a dot + 15 pt text |
| Fake default values (phone numbers, bank details) | empty + remembered per entity; centralise business constants in one file |

## 4. Information architecture rules

- **Tabs** are top-level *nouns* users revisit. 3–5. Merge tabs that show the same records.
- Add a **Today/Home** summary only if it answers "what needs attention?" — tiles for counts, one *Needs Attention* list
  (expiring documents, overdue payments, blocked items), a footer for sync state.
- **Detail screens** follow Contacts: header (avatar/hero + name + status) → action tiles → grouped sections →
  related records → "Export…" → nothing red at the bottom (delete is in Edit).
- **Forms** are large sheets: ✕ left, title center, prominent ✓ right (disabled until valid). Amount first when money
  is the point. Suggestion chips only for frequent free-text values. Native pickers (select/date) for choices.
- **Quick state changes** (status, attendance) use a pop-up menu row, not a navigation hop.
- **Search**: iOS 26+ puts search in the toolbar/bottom or as a dedicated tab; add it when lists can exceed ~15 items.
- **Names matter** (WWDC26 *Craft clear names*): use the words users already use (their domain), keep labels short,
  consistent, and verb-first for actions.

## 5. Behaviour-preservation checklist (conversion must not lose features)

For every removed control write: *"was X on screen Y → now Z"*. Typical relocations: exports → "…" menu / "Export…" row;
status filters → grouping; vouchers → row tap → sheet; call/WhatsApp → action tiles; delete → edit sheet.
List data-affecting changes separately (writes to the database, id formats, seeding, cleared ledgers) for review.
