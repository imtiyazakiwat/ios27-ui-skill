# ios27-ui: iOS 27 Liquid Glass UI skill for AI coding agents

[![npm](https://img.shields.io/npm/v/ios27-ui)](https://www.npmjs.com/package/ios27-ui)
[![npm downloads](https://img.shields.io/npm/dm/ios27-ui)](https://www.npmjs.com/package/ios27-ui)
[![GitHub stars](https://img.shields.io/github/stars/imtiyazakiwat/ios27-ui-skill?style=flat)](https://github.com/imtiyazakiwat/ios27-ui-skill/stargazers)
[![CI](https://github.com/imtiyazakiwat/ios27-ui-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/imtiyazakiwat/ios27-ui-skill/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)
[![good first issues](https://img.shields.io/github/issues/imtiyazakiwat/ios27-ui-skill/good%20first%20issue)](https://github.com/imtiyazakiwat/ios27-ui-skill/labels/good%20first%20issue)

**ios27-ui** is an open-source agent skill that makes **Claude Code, Cursor, Codex, Kiro, GitHub Copilot and Windsurf** design, audit and build app screens the way Apple ships them on **iOS 27**: Liquid Glass on the navigation layer, Apple Human Interface Guidelines (HIG) components, spring motion and native gestures. It works for **SwiftUI / UIKit** and for **React / Next.js / CSS** web apps.

```bash
npx ios27-ui
```

[![ios27-ui: iOS 27 Liquid Glass UI for AI coding agents](https://raw.githubusercontent.com/imtiyazakiwat/ios27-ui-skill/main/docs/og.png)](https://imtiyazakiwat.github.io/ios27-ui-skill/)

## Why

Ask an AI agent to "make it look like iOS" and you usually get a re-skin: blur everywhere, buttons duplicated in the tab bar, ease-in-out animations, cards inside cards. This skill gives the agent Apple's actual rules and a process to follow, so the result behaves like a native app instead of looking vaguely like one.

## What your agent will do

1. **Audit every element** on a screen (keep / move / merge / remove, with reasons) before touching code.
2. **Fix the information architecture**: tabs only navigate, one primary action per screen, detail = push, edit = sheet, delete needs confirmation or Undo.
3. **Build bottom-up** from tokens ([`tokens.css`](skills/ios27-ui/assets/tokens.css), [`motion.ts`](skills/ios27-ui/assets/motion.ts)) to kit components to screens.
4. **Add iOS motion**: push with parallax, edge-swipe back, receding sheets, large-title collapse, Undo HUD, all interruptible and reduced-motion aware.
5. **Verify** with screenshots in light and dark mode, and report what it could not verify.

Twelve hard rules (no actions in the tab bar, no glass on content, springs not eases, design for real data, and more) are in [`skills/ios27-ui/SKILL.md`](skills/ios27-ui/SKILL.md).

## Install

Pick whichever fits your setup. They all install the same skill.

**npx (any agent, auto-detects your tools)**

```bash
npx ios27-ui                     # Claude Code + detected tools, in the current project
npx ios27-ui claude kiro cursor  # pick targets
npx ios27-ui --all               # every target
npx ios27-ui --global            # skills into ~/.claude/skills, ~/.kiro/skills, ~/.agents/skills
npx ios27-ui update              # overwrite with the latest version
npx ios27-ui list                # what's installed, and whether an update is available
npx ios27-ui remove              # uninstall everything this tool installed
```

Add `--dry-run` to preview, `--dir <path>` to target another project. The installer never overwrites files it did not create unless you pass `--force`.

**Agent Skills CLI ([skills.sh](https://skills.sh))**

```bash
npx skills add imtiyazakiwat/ios27-ui-skill
```

**Claude Code plugin**

```text
/plugin marketplace add imtiyazakiwat/ios27-ui-skill
/plugin install ios27-ui@ios27-ui-skill
```

### Supported tools

| Target | Installs | Type |
| --- | --- | --- |
| `claude` | `.claude/skills/ios27-ui/` | Full skill (Claude Code) |
| `kiro` | `.kiro/skills/ios27-ui/` | Full skill (Kiro) |
| `agents` | `.agents/skills/ios27-ui/` | Full skill (Codex and other tools on the open Agent Skills layout) |
| `cursor` | `.cursor/rules/ios27-ui.mdc` | Cursor rule pointing at the full skill |
| `windsurf` | `.windsurf/rules/ios27-ui.md` | Windsurf rule |
| `copilot` | `.github/instructions/ios27-ui.instructions.md` | GitHub Copilot instructions |

Rule targets are project-only. If you install only rule targets, the full skill also goes into `.agents/skills/` so the rule has something to point at.

## Example prompts

- "Redesign the settings screen to feel like iOS 27."
- "Audit this app for duplicate actions and non-HIG patterns."
- "Convert this list to an inset-grouped list with swipe actions."
- "Build a tab bar with a navigation stack and edge-swipe back."
- "Add a Liquid Glass tab bar that stays legible with Reduce Transparency on."
- "Port this React screen to SwiftUI using system components."

## FAQ

**What is an agent skill?** A folder with a `SKILL.md` file (name, description, instructions) plus optional references and assets. Agents load it automatically when your request matches the description. It follows the open [Agent Skills](https://agentskills.io) format.

**Does it work without Claude?** Yes. The same skill folder works in Kiro, Codex and other `.agents/skills` tools, and the installer writes rule files for Cursor, Windsurf and Copilot.

**Is it only for SwiftUI?** No. It covers React, Next.js and plain CSS web apps (navigation stacks, sheets, glass, springs) and maps every pattern to SwiftUI / UIKit system components for native apps.

**iOS 26 or iOS 27?** Liquid Glass shipped in iOS 26. iOS 27 refines it for readability (defined edges, transparency slider). The skill targets iOS 27 and treats iOS 26 as the baseline.

## Repository layout

```
skills/ios27-ui/       the skill (this is what gets installed)
  SKILL.md             entry point: rules + workflow, kept short
  references/          detail loaded on demand (tokens, components, motion, SwiftUI, verification)
  assets/              tokens.css, motion.ts, CI screenshot harness templates
.claude-plugin/        Claude Code plugin + marketplace manifests
adapters/rules.md      summary used for Cursor / Windsurf / Copilot rule files
bin/cli.mjs            zero-dependency installer
docs/                  landing page (GitHub Pages), social card, llms.txt
scripts/validate.mjs   frontmatter, link, size and CLI smoke checks (runs in CI and before publish)
```

## Contributing

Contributions are welcome, especially corrections backed by Apple sources (HIG pages, WWDC session numbers), SwiftUI API updates, and new component patterns. Start with a [good first issue](https://github.com/imtiyazakiwat/ios27-ui-skill/labels/good%20first%20issue), ask in [Discussions](https://github.com/imtiyazakiwat/ios27-ui-skill/discussions), and read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

If the skill helped you, a ⭐ helps other developers find it.

## Disclaimer

Not affiliated with or endorsed by Apple. iOS, Liquid Glass and SF Pro are Apple trademarks. Exact glass and radius values are not published by Apple; the values here are approximations.

## License

[MIT](LICENSE)
