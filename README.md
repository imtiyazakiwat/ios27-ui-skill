# ios27-ui

An agent skill that teaches AI coding agents to design, audit and build app screens the way Apple ships them on iOS 27: Liquid Glass on the navigation layer only, HIG components, spring motion, native gestures. Works for React / Next.js / CSS web apps and for SwiftUI / UIKit.

```bash
npx ios27-ui
```

That installs the skill for Claude Code, plus any other agent whose folder already exists in your project (`.kiro`, `.agents`, `.cursor`, `.windsurf`, `.github/instructions`).

## What it does

The skill is a process plus a spec. Your agent will:

1. Audit every element on a screen (keep / move / merge / remove, with reasons) before touching code.
2. Fix the information architecture: tabs only navigate, one primary action per screen, detail = push, edit = sheet.
3. Build bottom-up from tokens (`tokens.css`, `motion.ts`) to kit components to screens.
4. Add iOS motion: push with parallax, edge-swipe back, receding sheets, large-title collapse, Undo HUD.
5. Verify with screenshots in light and dark, and report what it could not verify.

Twelve hard rules (no actions in the tab bar, no glass on content, springs not eases, design for real data, and more) are in [`skill/ios27-ui/SKILL.md`](skill/ios27-ui/SKILL.md).

## Install

```bash
npx ios27-ui                     # Claude Code + detected tools, in the current project
npx ios27-ui claude kiro cursor  # pick targets
npx ios27-ui --all               # every target
npx ios27-ui --global            # skills into ~/.claude/skills, ~/.kiro/skills, ~/.agents/skills
npx ios27-ui update              # overwrite with the latest version
npx ios27-ui list                # what's installed, and whether an update is available
npx ios27-ui remove              # uninstall everything this tool installed
```

Add `--dry-run` to preview, `--dir <path>` to target another project.

| Target | Installs | Type |
| --- | --- | --- |
| `claude` | `.claude/skills/ios27-ui/` | Full skill |
| `kiro` | `.kiro/skills/ios27-ui/` | Full skill |
| `agents` | `.agents/skills/ios27-ui/` (Codex and other tools on the open Agent Skills layout) | Full skill |
| `cursor` | `.cursor/rules/ios27-ui.mdc` | Summary rule pointing at the full skill |
| `windsurf` | `.windsurf/rules/ios27-ui.md` | Summary rule |
| `copilot` | `.github/instructions/ios27-ui.instructions.md` | Summary rule |

Rule targets are project-only. If you install only rule targets, the full skill also goes into `.agents/skills/` so the rule has something to point at.

The installer never overwrites files it did not create unless you pass `--force`.

## Usage

Ask your agent things like:

- "Redesign the settings screen to feel like iOS 27."
- "Audit this app for duplicate actions and non-HIG patterns."
- "Convert this list to an inset-grouped list with swipe actions."
- "Build a tab bar with a navigation stack and edge-swipe back."

## Repository layout

```
skill/ios27-ui/        the skill (this is what gets installed)
  SKILL.md             entry point: rules + workflow, kept short
  references/          detail loaded on demand (tokens, components, motion, SwiftUI, verification)
  assets/              tokens.css, motion.ts, CI screenshot harness templates
adapters/rules.md      summary used for Cursor / Windsurf / Copilot rule files
bin/cli.mjs            zero-dependency installer
scripts/validate.mjs   frontmatter, link, size and CLI smoke checks (runs in CI and before publish)
```

## Contributing

Contributions are welcome, especially corrections backed by Apple sources (HIG pages, WWDC session numbers), SwiftUI API updates, and new component patterns. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Disclaimer

Not affiliated with or endorsed by Apple. iOS, Liquid Glass and SF Pro are Apple trademarks. Exact glass and radius values are not published by Apple; the values here are approximations.

## License

[MIT](LICENSE)
