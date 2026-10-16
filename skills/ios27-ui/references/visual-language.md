# Visual language: quiet surfaces

The target look: content-first, nearly chromeless screens where controls **dissolve into the theme**. Separation
comes from tone, weight and space, not from lines, shadows or color. Reference rendering:
`examples/notes-showcase.html` (an iOS Notes concept). Read the function you need, not the whole file:
`buildHomeScreen` (bento home, floating chrome, light + dark), `buildNewNoteScreen` (sheet over dimmed page,
AI chips), `buildFoldersScreen` (inset-grouped list), `buildAskNotesScreen` (answer card + sources),
`buildDarkThemeNoteScreen` and `buildKyotoPenScreen` (themed paper, serif editorial type), `buildTemplatesScreen`.

The showcase uses Tailwind via CDN and Google Fonts for convenience; treat it as a visual spec, not production
code. Tokens for everything below live in `assets/tokens.css` (section "Quiet surfaces"); ready-made classes in
`assets/quiet-kit.css`.

## The scale trap

The showcase phone is drawn at ≈ 0.835× a real 393 pt iPhone. Its 28 px title is a 34 pt Large Title; its 12.8 px
body is 15 pt Subheadline. **Build at real size with the HIG type scale** (`references/design-tokens.md`) and keep
every hit target ≥ 44 pt even where the visible circle is 36 pt. Copy proportions and restraint, not pixel values.

## Principles

1. **Tone, not lines.** Page `--surface-0` (#F2F2F6), content `--surface-1` (#FFF). A card's edge is a 2 % black
   hairline plus a whisper shadow (`0 1px 4px / 2 %`). If you can clearly see the border, it's too strong.
   Dark: card #161618 on #000 with a 6 % white hairline and **no shadow** (shadows don't read on black).
2. **Chrome is made of the same material as content.** Floating pills and circle buttons use the card surface
   (white / #18181B), a 4–5 % hairline and a soft float shadow. They sit on the background like cards, so the eye
   reads one family of objects. Blur only on chrome that overlaps scrolling content (composer, tab bar).
3. **One accent.** Blue (`--accent` #1B64F2 light, #0A84FF dark) appears only on: the primary action (`+`,
   checkmark), the selected tab, the caret, AI suggestions and unread dots. Everything else is ink.
4. **Three inks, then opacity.** `--ink-1` titles/body, `--ink-2` supporting text, `--ink-3` metadata. Anything
   less important fades with `opacity: .3–.4` instead of a fourth gray. Icons in headers use `--ink-icon`.
5. **Hierarchy by weight and size.** Section labels are 13 pt semibold with a 13 pt gray stroke icon (no uppercase,
   no colored headers). Titles carry negative tracking; metadata is regular weight.
6. **The background is the theme.** A note's paper (warm dotted, dark lined, plain) fills the whole screen, and the
   chrome tints toward it: on navy paper, pills become #1C1F2B with a 10 % white rim. Never a white toolbar on a
   themed page.
7. **Dim by tone, not by black.** Behind a sheet the page shifts one step darker (#F2F2F6 → #DFDFE4) and its pills
   drop to #ECECEF. The sheet (#F9F9FB, top radius 28) rises with a soft upward shadow. No 40 % black scrim on
   light mode.
8. **Generous rounding, consistent family.** Tiles 22, grouped lists 20, inner previews 14 → 9 (concentric),
   sheets 28 top, everything interactive is a capsule or a circle.
9. **Stroke icons, one weight.** 1.8–2 px stroke, round caps and joins, 13–15 pt. Filled glyphs only for the
   selected tab. Category color (folders) goes on the stroke, never as a filled tile.
10. **AI is quiet too.** Suggestions are tinted capsules (`--accent-soft` #E6F2FF) with a small sparkle and an
    inline blue verb ("Add"). Citations are numbered superscripts plus gray chips. No gradients, no glow.

## Layout recipes

**Root screen (Home)**
- Top-right chrome cluster: a capsule with 2–3 icon buttons + a circular avatar, same height (≈ 40 pt real).
  No nav bar background; the title sits directly on the page.
- Large title + one gray line of context ("Good morning · Monday, 28 September").
- Bento: one full-width "continue" tile, then a 2-column grid of tiles. Each tile: header (icon + 13 pt semibold
  label) at top, the one number or title that matters at bottom. Big numerals are Title-1 bold.
- Bottom stack, floating over content: composer capsule ("What's on your mind?" + blue `+` circle + mic/camera)
  above a capsule tab bar with a **separate** search circle. Selected tab = soft gray lens + accent icon/label.

**Sheet (create/edit)**
- Grabber 32 × 4, then a header row: circle `×` (surface-1, whisper shadow) · centered 15 pt semibold title ·
  blue circle `✓` with a tinted shadow. That's the whole toolbar.
- Body is bare text on the sheet surface. Formatting lives in a single capsule toolbar above the keyboard.

**List (Folders)**
- Title + count line, then one white group (radius 20), rows separated by 1 px `--hairline-row` inset to the text,
  colored stroke icon, ink-1 label, ink-3 count + gray chevron. Footer helper text in ink-3 below the group.

**Editorial note**
- Serif title (Title 2, semibold, −0.02em) and serif body (16–17 pt, line-height 1.6). Pull quotes: 2 px accent or
  paper-tinted left rule, italic, ink-2. Highlights are a soft marker fill with 2 px radius.

## Fonts

| Role | Stack | Notes |
| --- | --- | --- |
| UI | `--font` (SF Pro → Inter) | everything functional: titles, rows, chrome, tab labels |
| Editorial | `--font-serif` (New York → Newsreader → Georgia) | **only** user content in reading contexts: note titles/bodies, quotes |
| Numerals | `--font-rounded` or UI with `tabular-nums` | counts, times, money |

- On Apple devices `ui-serif` resolves to **New York**, Apple's system serif; Newsreader (Google Fonts, OFL) is the
  closest web fallback. Self-host it or load with `display=swap`.
- Tracking: titles −0.02 to −0.03em, headlines −0.015em, body −0.01em, captions 0. SF applies optical tracking
  itself, so these mostly correct the Inter fallback; they are safe on both.
- Weights: 400 body, 500 labels/tabs, 600 headers and nav titles, 700 large titles and key numerals. Never 300.
- Never mix two sans families. Serif never appears in chrome, buttons or tab bars.

## Accessibility guardrails (the showcase breaks some; you must not)

- Metadata gray: use `--ink-3` (#6C6C72 light, 5.2:1 on white). The showcase's #8E8E93 is 3.3:1 and fails AA for
  small text; reserve it for placeholders inside fields and disabled states.
- Accent on white: #1B64F2 (5.1:1) for text/links in light mode; #0A84FF only in dark (4.9:1 on #161618).
- Faded rows (`opacity .3`) must be non-essential (e.g. "more below" teasers) or also carry text that says why.
- Every hairline-only boundary must survive `prefers-contrast: more` (tokens raise them to 10–14 %).
- Floating chrome over content keeps an opaque fallback under `prefers-reduced-transparency`.

## Anti-patterns that break the quiet look

- Visible 1 px gray borders on cards, or a border **and** a heavy shadow.
- Colored section headers, colored card backgrounds, gradients on content.
- A filled nav/tool bar spanning the width on a root screen.
- More than one blue thing per region; blue text for non-interactive labels.
- Uppercase labels other than tiny HIG section headers; letter-spaced caps for decoration.
- Mixed icon styles (filled + outline, different stroke widths) in one row.
- Glass/blur on cards or list rows.
