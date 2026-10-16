# Components: anatomy and rules (iOS 26/27)

## Tab bar
- Floating glass capsule near the bottom; **navigation only**. 3–5 tabs, icon (regular weight; heavier when selected) + 10 pt label.
- Selected tab: tinted icon/label + a "lens" capsule that **slides** between tabs (spring). Tapping the active tab: pops
  to root; at root, scrolls to top.
- Search, when present, is a separate glass circle at the trailing end / a tab with the search role (iOS 18+ `Tab(role: .search)`).
- Persistent across pushes. Hide only for full-screen modal flows. Content scrolls beneath it with a bottom scroll-edge fade.
- iOS 26+ can minimize on scroll (`tabBarMinimizeBehavior(.onScrollDown)`): optional polish.

## Navigation bar (transparent, glass buttons)
- No bar background. Buttons are 44 pt glass circles/capsules floating over content; a soft scroll-edge fade appears under
  them once content scrolls.
- Root: **large title** (34 bold) left-aligned in content; trailing: `+` (primary), optional "…" menu. Max two trailing buttons.
- Pushed: leading glass **chevron only** (no previous-title text), centered inline title (fades in after the large header
  scrolls away), trailing `Edit`.
- Text buttons are capsules; icon buttons are circles. A prominent (tinted) button is reserved for the one commit action
  in sheets (✓).

## Lists (inset grouped)
- Section = optional header (13 pt UPPERCASE secondary) + rounded card + optional footer (13 pt secondary, explains the
  section or shows a total).
- Row: [leading] title (17) / subtitle (15, secondary) / detail (13) … [value|trailing] [chevron]. Title strong (600) only for
  the identifying text. Truncate with ellipsis; never wrap rows to 3+ lines of title.
- Separator hairline inset to the text edge; none above the first row or below the last.
- Press state: row background flashes `pressed` color immediately and fades out (~0.4 s). No scale on rows.
- Chevron ⇒ pushes a screen. Value + up/down chevrons ⇒ pop-up menu. Blue text ⇒ action. Red text ⇒ destructive.
- Leading elements: **icon tile** (30 pt colored rounded square, white glyph) for settings/actions/alerts; **avatar** for
  people; **thumbnail** for things with photos (placeholder glyph when missing).
- **Swipe actions** (trailing): one red Delete (84 pt wide). Provide a non-gesture path too (row → detail → delete).
- Empty state: centered large glyph (secondary), 22 pt bold title, 15 pt message, one prominent capsule button.

## Detail header patterns
- **Person** (Contacts): avatar 96, name 28 bold, subtitle, status dot + label, then **action tiles** (Call, WhatsApp,
  Advance, Expense…) — 4 max, equal width, 64 pt tall, tinted symbol + 12 pt label.
- **Thing** (truck/vehicle): hero photo behind the nav bar with parallax/stretch; compact (≈ 210) gradient + glyph when no
  photo; model as title; identifier (plate) + attribute beneath.
- **Transaction** (trip/invoice): route/timeline card → tiles → payment summary card (big amount, progress meter, caption).

## Sheets
- **Large** (forms): near-full height, ~38 pt top radius, **app recedes** (scale ≈ 0.92, rounded, dim). Header: ✕ (glass
  circle, left) · title · ✓ (prominent glass circle, right, disabled until valid). Drag header to dismiss.
- **Medium** (details, quick inputs): floating panel inset 8 pt from edges, grabber visible, content can scroll.
- Dirty form + ✕/swipe/backdrop/back ⇒ action sheet "Discard Changes" (red) / "Keep Editing". Clean ⇒ dismiss immediately.
- Amount-first for money; labeled rows (label left, value right) for the rest; native select/date pickers; suggestion
  chips (horizontal scroll) only for frequent free text; keyboard inset so fields stay visible.

## Menus & action sheets
- **Pull-down menu** from a "…" button or pop-up row: glass panel ≈ 254 pt wide, springs out of the trigger's corner;
  items 46 pt, trailing icon, leading ✓ for the selected option, destructive in red; Esc/outside tap closes.
- **Action sheet** (confirmation / export choice): bottom, two glass groups — actions, then a separate bold **Cancel**.
  Title 13 pt semibold + message 13 pt. Destructive red. Use for every irreversible action.
- Alerts (centered) only for blocking errors.

## Controls
- **Segmented**: capsule, 36 pt, sliding white thumb (spring). 2–4 segments, short labels.
- **Switch**: 64 × 28 capsule thumb, green on, thumb stretches while pressed.
- **Buttons**: prominent capsule (50 pt, tint fill, white label) for the one main action in a flow; tinted (15 % tint fill)
  for secondary; plain text for tertiary. Full-width in forms/footers. Disabled = fill-gray + label-3.
- **Fields**: no borders; the row is the field. Placeholder = label-3. Right-aligned values in label-left forms.
- **Capsule/badge**: 26 pt tall, tinted bg (15 %) + colored 13 pt semibold text. Use sparingly (expiry, status).
- **Meter/progress**: 8 pt capsule track, green fill.

## HUD / toasts
Top-center glass capsule, check glyph + 15 pt semibold text, auto-dismiss (~2.4 s; ~5 s with **Undo**). Success feedback
only — never for errors that need action (use inline text or an alert).

## Content states to always design
loading (skeleton or nothing—never a spinner on a cached app), empty, error (inline, recoverable), offline (footer text),
long text (ellipsis), many items (sections, optionally search), zero money (show "Paid"/"—").
