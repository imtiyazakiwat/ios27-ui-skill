# Security policy

## Supported versions

Only the latest published version of `ios27-ui` receives fixes.

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private reporting instead:
[Report a vulnerability](https://github.com/imtiyazakiwat/ios27-ui-skill/security/advisories/new).

You can expect an acknowledgement within 7 days. Relevant reports include:

- The installer (`bin/cli.mjs`) writing or deleting files outside the target directories.
- Skill content that instructs agents to run unsafe commands or leak secrets (prompt injection).
- Compromise of the npm package or release workflow.

## Supply chain

- The package has zero runtime dependencies.
- Every release is published from GitHub Actions with [npm provenance](https://docs.npmjs.com/generating-provenance-statements). Verify with `npm audit signatures`.
- `main` and `v*` tags are protected; releases can only come from reviewed code.
