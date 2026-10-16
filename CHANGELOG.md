# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## Unreleased

## 0.3.0

- New `references/visual-language.md`: quiet-surface aesthetic (separation by tone not lines, chrome in the content material so it dissolves into the theme, one accent, three inks, themed paper backgrounds, tone-dimmed sheets), layout recipes, fonts and a11y guardrails.
- Fonts: serif `--font-serif` (New York → Newsreader) for user content only, tracking tokens, weight rules.
- `assets/tokens.css`: quiet-surface tokens (surfaces, ink, hairlines, shadows, radii) for light, dark and increased contrast; fixed a bug where an undefined `--font-inter` made the whole font stack fall back to the browser serif.
- `assets/quiet-kit.css`: framework-neutral classes (tiles, bento, groups, pills, floating dock with scroll-edge fade, sheets, AI suggestions, paper themes).
- `examples/notes-showcase.html` (visual target) and `examples/quiet-kit-demo.html` (real-size reproduction using only the kit).

## 0.2.0

- Skill moved to `skills/ios27-ui/` (standard layout), so `npx skills add imtiyazakiwat/ios27-ui-skill` works and skills.sh can index it.
- Claude Code plugin and marketplace manifests: `/plugin marketplace add imtiyazakiwat/ios27-ui-skill`.
- Landing page on GitHub Pages with Open Graph card, structured data, sitemap and `llms.txt`.
- README and npm metadata rewritten for search (description, keywords, FAQ, example prompts).
- Community files: Code of Conduct, security policy, CODEOWNERS, feature template, Dependabot for Actions.
- `main` and `v*` tags protected by rulesets; single `ci-ok` required check.

## 0.1.0

- Initial release: `ios27-ui` skill (SKILL.md, 7 references, tokens, motion springs, CI screenshot templates).
- `npx ios27-ui` installer for Claude Code, Kiro, `.agents` (Codex), Cursor, Windsurf and GitHub Copilot.
