# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## Unreleased

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
