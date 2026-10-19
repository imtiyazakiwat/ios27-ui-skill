# Design principles, materials and typography craft

Sources: WWDC26 *Principles of great design* (250), WWDC20 *The details of UI typography* (10175), WWDC25
*Meet Liquid Glass* (219), WWDC19 *Designing Audio-Haptic Experiences* (810). Use the principle names below when
you explain a decision in an audit table or report.

## 1. The eight principles, as decisions

| Principle | What it means on a screen | Test |
| --- | --- | --- |
| Purpose | Every element serves the screen's job; decide what **not** to build | Remove it: does anyone miss it? |
| Agency | People stay in control; easy undo; confirm only the destructive and irreversible | Can a slip be undone in one step? |
| Responsibility | Act in the user's interest: ask for permissions at the moment of need, explain why; anticipate misuse (especially AI output) | Would you be comfortable if the user saw exactly what happens? |
| Familiarity | Standard patterns, honest metaphors; same look = same behavior = same place | Can they predict the result before tapping? |
| Flexibility | Adapts to device, context, abilities, language; personalization where one layout can't fit all | Works at the largest text size, in dark mode, one-handed, with VoiceOver? |
| Simplicity (not minimalism) | Fewer steps and plainer words; the most important thing is the most obvious; advanced options one level deeper. Adding context can simplify | Can a new user do the main task without help? |
| Craft | Every spacing, timing and alignment value is deliberate and defensible | Pick any value: can you say why? |
| Delight | The result of the other seven, aimed at a chosen emotion (calm, confident, excited), not confetti | Name the emotion; does every choice reinforce it? |

Confirmations: overuse trains people to click through. Prefer Undo; confirm only what can't be undone.

## 2. Feedback, wayfinding, mapping, naming
- **Four kinds of feedback:** status (ongoing work), completion (it worked), warning (before a problem), error
  (what went wrong + how to fix). Validate forms **inline as people go**, not on submit.
- **Wayfinding:** every screen answers *Where am I? Where can I go? What's here? How do I get out?* Never trap the user
  (every sheet has Cancel/close, every pushed screen a back button).
- **Grouping and mapping:** proximity implies relationship; put a control next to what it changes and arrange
  controls to mirror what they affect. If a control needs a label to explain it, the mapping is weak.
- **Specific names beat safe generic ones:** name tabs and titles for their content ("Library", "Progress",
  "Invoices"), not umbrellas ("Home", "Dashboard", "Manage") unless that screen truly is a summary. Verbs on buttons
  ("Save invoice", "Send"), never "OK/Submit" when a verb fits.

## 3. Materials and depth (navigation layer only)
Complements the glass recipe in `references/design-tokens.md` and the surfaces in `references/visual-language.md`.

- **Translucent chrome, content underneath.** Bars, tab bars, toolbars and sheets float over content that scrolls
  beneath them, instead of opaque strips that consume space.
- **Weight encodes hierarchy:** heavier/denser materials for structural regions (sidebars, large sheets), lighter for
  small interactive elements (buttons, chips). Bigger surfaces read thicker: stronger blur and a deeper shadow.
- **Never stack translucent on translucent.** Glass over glass collapses legibility; the lower layer goes opaque.
- **Dim to focus, separate to keep flow.** A modal task dims and pushes the background back. A parallel, non-blocking
  panel uses separation and offset without a scrim.
- **Vibrancy over glass:** don't put flat mid-gray text on translucent surfaces. Use label colors with higher
  contrast, a slightly heavier weight and a touch more tracking; put saturated color on a solid layer, not the glass.
- **Scroll-edge effect, not dividers:** where content meets floating chrome, fade/blur a short edge; only where chrome
  actually overlaps content.
- **Materialize, don't just fade:** glass surfaces enter by animating blur radius + scale + opacity together, and exit
  the same way back toward their source.
- Accessibility: `prefers-reduced-transparency` → solid; `prefers-contrast: more` → near-solid with a defined border.

## 4. Typography craft
Detailed scale: `references/design-tokens.md`. Fonts and serif rules: `references/visual-language.md`.

- **Tracking is size-specific.** Large text tightens (negative tracking), small text loosens slightly, body ≈ 0.
  SF applies optical tracking automatically on Apple platforms; on the web set it per style (`--tracking-*`), never one
  global `letter-spacing`.
- **Leading runs inverse to size:** tight on large titles (~1.05–1.2), comfortable on body (~1.4–1.5), looser for
  scripts with tall ascenders/descenders (Devanagari, Thai, Arabic), tighter for dense data UI.
- **Hierarchy = size + weight + leading + color as a set.** Emphasize with weight before size; it adds presence
  without taking space.
- **Optical sizing:** use `font-optical-sizing: auto` with variable fonts (SF via system-ui, Inter 4, Newsreader).
- **Dynamic Type:** sizes in `rem`, layout spacing that scales with text, no fixed-height text containers, truncate only
  as a last resort and never truncate the primary label. Test at 200 %. Native: text styles (`.body`, `.headline`),
  never fixed point sizes.
- **System font first.** It ships optical sizes, tracking tables and legibility tuning. A custom face needs a reason
  (brand, editorial content) and must stay out of system chrome.
- Numbers that change or align: `font-variant-numeric: tabular-nums`.

## 5. Process
- **Prototype interactively.** An interactive demo beats a stack of static mocks and sets the bar for the final build.
  For any gesture-heavy screen, build the gesture first and tune it by hand.
- **Design interaction and visuals together**; motion is not a layer added after the pixels.
- **Review motion with fresh eyes in slow motion / frame by frame** (record at 60 fps, step through; see
  `references/verification.md`).
- Test with real people, real data and real context (one hand, walking, bright sun, large text).
