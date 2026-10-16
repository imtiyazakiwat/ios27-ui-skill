# Contributing

Thanks for helping make this skill better. The goal is simple: an agent that follows it should produce screens that look and behave like Apple built them.

## Ground rules

- **Cite your source.** Changes to rules, metrics or behaviour need a link: an HIG page, a WWDC session (name + number), Apple sample code, or Apple developer docs. If a value is measured rather than published, say so and label it an approximation.
- **Keep `SKILL.md` lean.** It is loaded every time the skill triggers. Put detail in `references/` and link it from the table at the bottom of `SKILL.md`.
- **Write for agents.** Short imperative rules, concrete numbers, "do X, not Y". Avoid prose an agent cannot act on.
- **Stay framework-neutral** in the spec. Framework-specific code goes in `references/web-implementation.md` or `references/native-swiftui.md`.
- **No project-specific content.** Examples should use generic entities.

## Development

No dependencies to install. Node 18.17+.

```bash
node scripts/validate.mjs          # must pass before a PR is merged
node bin/cli.mjs --dir /tmp/demo   # try the installer locally
```

To try your branch in a real project:

```bash
npm pack                                   # creates ios27-ui-x.y.z.tgz
cd ../my-app && npx /path/to/ios27-ui-x.y.z.tgz
```

## What to work on

- Corrections when Apple updates the HIG or ships a new iOS point release.
- Missing components (e.g. search tokens, toolbars, pickers, widgets, iPad sidebars).
- SwiftUI / UIKit API updates in `references/native-swiftui.md`.
- New install targets in `bin/cli.mjs` (add to `TARGETS`, the README table, and the smoke test in `scripts/validate.mjs`).
- Before/after examples showing the skill in action.

## Pull requests

1. One topic per PR.
2. Run `node scripts/validate.mjs`.
3. Add a line to `CHANGELOG.md` under **Unreleased**.
4. Fill in the PR template, including sources.

## Releases (maintainers)

1. Move **Unreleased** entries in `CHANGELOG.md` under a new version heading.
2. `npm version patch|minor|major` (creates the commit and tag).
3. `git push --follow-tags`. The release workflow publishes to npm with provenance.

Versioning: patch for wording and fixes, minor for new guidance or targets, major for rule changes that would make an agent produce noticeably different UI, or CLI breaking changes.
