# CI templates (copy into the target repo)

| File | Copy to | Notes |
| --- | --- | --- |
| `ci.yml` | `.github/workflows/ci.yml` | type-check + build. Adjust node version / package manager. |
| `screens.yml` | `.github/workflows/screens.yml` | builds with `NEXT_PUBLIC_OFFLINE=1`, runs the harness, force-pushes images to branch `ci-screenshots` (`if: always()`). Needs `permissions: contents: write`. Change the `branches:` filter. |
| `ci-screenshots.mjs` | `scripts/ci-screenshots.mjs` | **Project-specific example** — rewrite the `light()/dark()/flows()` steps for your screens, but keep the helpers (`step`, `check`, `settle`, `dragMouse`, crash guard, non-zero exit on failed assertion). |
| `fixture.example.json` | `scripts/fixture.json` | Production-like data incl. ALL-CAPS names, 10-digit phones, a broken image URL, expiring documents. Replace with your entities, and update the `SEED` map in `ci-screenshots.mjs` with your cache keys. |

The app must expose an **offline switch** (here `NEXT_PUBLIC_OFFLINE=1` disables the realtime backend) and read its cache from
`localStorage` so the fixture can be injected with `context.addInitScript`.

Fetch results locally:
```bash
# run inside the target repo; resolves its GitHub URL via the GitHub CLI
git clone --depth 1 --branch ci-screenshots "$(gh repo view --json url -q .url)" /tmp/shots && cat /tmp/shots/log.txt
```
