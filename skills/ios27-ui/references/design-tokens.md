# Design tokens (validated in a shipped project; adjust to the HIG kit if it differs)

Apple publishes system colors and Dynamic Type sizes; it does **not** publish exact glass parameters or sheet radii.
Numbers marked ≈ were tuned visually. Official iOS 27 Figma/Sketch kits exist — prefer them when available.

## Typography (SF Pro on Apple devices; Inter as the non-Apple fallback)

Stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", var(--font-inter), "Inter", system-ui, sans-serif`.
Numbers/prices: `ui-rounded, "SF Pro Rounded"` → falls back to Inter (**never** let it fall to a wide system face).

| Style | Size / line | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| Large title | 34 / 41 | 700 | +0.4 | root screen title |
| Title 1 | 28 / 34 | 700 | +0.38 | detail header name |
| Title 2 | 22 / 28 | 700 | −0.26 | prominent section header |
| Title 3 | 20 / 25 | 600 | −0.45 | |
| Headline | 17 / 22 | 600 | −0.43 | row title (strong), nav title |
| Body | 17 / 22 | 400 | −0.43 | row title, fields |
| Callout | 16 / 21 | 400 | −0.31 | |
| Subheadline | 15 / 20 | 400 | −0.23 | row subtitle, values |
| Footnote | 13 / 18 | 400 | −0.08 | section header (UPPERCASE) / footer |
| Caption | 12 / 16 | 400–500 | 0 | tile labels |

Inputs ≥ 16 px (avoids iOS zoom-on-focus). Tabular numerals for money.

**Serif (`--font-serif`: `ui-serif, "New York", "Newsreader", Georgia, serif`)** — user content in reading contexts
only (note titles and bodies, quotes). Title 26 / 1.2, 600, −0.02em; body 17 / 1.6, 400. Never in chrome.

**Tracking on the web:** SF applies optical tracking automatically; for the Inter fallback use −0.03em titles,
−0.015em headlines, −0.01em body, 0 captions (`--tracking-*`). Weights: 400 / 500 / 600 / 700, never 300.

Quiet-surface tokens (`--surface-*`, `--ink-*`, `--hairline-*`, `--shadow-*`, `--radius-tile|group|sheet`) are
specified in `references/visual-language.md`.

## Colors (iOS 26/27 system palette)

Light / Dark:

| Token | Light | Dark |
| --- | --- | --- |
| blue (tint) | #0088FF | #0091FF |
| green | #34C759 | #30D158 |
| red | #FF383C | #FF4245 |
| orange | #FF8D28 | #FF9230 |
| indigo | #6155F5 | #6D7CFF |
| yellow | #FFCC00 | #FFD600 |
| gray | #8E8E93 | #8E8E93 |
| background (grouped) | #F2F2F7 | #000000 |
| cell / secondary grouped | #FFFFFF | #1C1C1E |
| elevated (sheet) bg / cell | #F2F2F7 / #FFF | #1C1C1E / #2C2C2E |
| label | #000 | #FFF |
| label 2 / 3 / 4 | 3C3C43 @ 60 / 30 / 18 % | EBEBF5 @ 60 / 30 / 16 % |
| separator | 3C3C43 @ 29 % | 545458 @ 60 % |
| fill 1–4 (controls) | 787880 @ 20 / 16 / 12 / 8 % | 787880 @ 36 / 32 / 24 / 18 % |

Rules: semantic names only (never hex in components); color is **meaning** (blue = interactive/in progress, green =
good/paid, orange = needs attention, red = destructive/expired). Never rely on color alone (add text/icon).
`prefers-contrast: more` → raise label-2 and separator opacity.

## Metrics (px/pt)

| Thing | Value |
| --- | --- |
| Screen horizontal margin | 16 |
| Nav bar content height | 44 (glass buttons 44 × 44) |
| Large-title block | top 2, bottom 14; title left inset = margin + 4 |
| Row min height | 44 (52 with two lines/forms) |
| Row padding | 10–12 v, 16 h; leading icon gap 12 |
| Separator | 0.5 px hairline, inset to text (16, or 58/72/84 with leading element) |
| Section gap | 28; header 13 pt above card, footer 13 pt below |
| Inset-grouped card radius | ≈ 26 (iOS 26 is rounder than iOS 18's 10) — keep concentric with inner elements |
| Icon tile | 30 × 30, radius 8; avatar 36–44 list, 96 detail; thumb 56, radius 12 |
| Tab bar | floating capsule, height ≈ 62, 20 side margin, bottom = max(safe-area − 10, 12); search = separate circle |
| Sheet radius | large ≈ 38 top; medium floats 8 px from edges, radius ≈ 38 |
| Buttons | prominent capsule height 50; segmented 36 capsule; switch 64 × 28 (capsule thumb) |
| Hit target | ≥ 44 × 44 always |
| Content bottom padding | tab-bar height + bottom margin + 28 (so the last row clears the bar) |

**Concentricity:** inner radius = outer radius − padding; capsules end-to-end with the display corners.

## Liquid Glass recipe (CSS) — navigation layer only

```css
.glass {
  background: rgba(255,255,255,.74);                 /* iOS 27: denser than iOS 26 (.6) */
  backdrop-filter: blur(20px) saturate(190%);
  box-shadow:
    inset 0 1px .5px rgba(255,255,255,.95),          /* brighter specular highlight (27) */
    0 0 0 .5px rgba(0,0,0,.09),                      /* darker edge (27) */
    0 10px 30px rgba(0,0,0,.10);
}
@media (prefers-reduced-transparency: reduce) { :root { --glass-bg: var(--cell); --glass-blur: 0px } }
```
- Opaque enough to read **without** blur support (headless browsers, low-power mode).
- Sheets: large sheet = opaque bg; medium = near-opaque floating panel (≈ 94 % bg).
- Scroll-edge effect: a gradient from the background color under bars (top 22 px beyond the bar; bottom fully opaque
  behind the tab bar) so rows never collide visually with controls.
- Pressed glass: scale ≈ 0.9 with a bouncy spring; selected tab lens slides with a snappy spring.

## Light/dark mechanics
Define tokens on `:root`, override in `@media (prefers-color-scheme: dark)`. Use `color-mix(in srgb, var(--tint) 15%, transparent)`
for tinted capsules so they work in both modes. Test both in CI screenshots.
