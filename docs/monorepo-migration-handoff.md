# Monorepo migration — deploy handoff

The repo was split into an npm-workspaces monorepo (`apps/site`, `apps/builder`,
`packages/*`). All **code** changes are done and verified on the branch. Two
**deploy-platform** settings must be applied by a human/the backend before the new
layout deploys correctly — they are config in Vercel and AWS, not code.

## 1. Vercel (the builder)

The builder is now `apps/builder`, not the repo root.

- In the Vercel project → **Settings → General → Root Directory** → set to
  **`apps/builder`**.
- Build command / output: Vercel auto-detects Next.js; leave defaults. (It runs
  `next build` inside `apps/builder`, a normal dynamic app.)
- Install command: Vercel runs `npm install` at the repo root (workspaces), then
  builds the app — no change needed.
- Remove any `TENANT` / `STATIC_EXPORT` env vars from the builder project (the
  builder is never a static export).

## 2. CodeBuild (the tenant site)

The CodeBuild project already uses `buildspec.yml` from the repo root, which has
been rewired to build `apps/site`. Confirm:

- **Buildspec**: "Use a buildspec file" → `buildspec.yml` (unchanged).
- **Source version**: the branch with this migration (then `main` after merge).
- **Clear the CodeBuild cache once** after this lands — the cached `node_modules`
  predates the workspace layout. (The install guard will otherwise fail fast with a
  clear message.)
- No other change: the backend still passes `TENANT`, `CONFIG_S3_URI`, `BUCKET`,
  `AWS_REGION`, `DISTRIBUTION` exactly as before. The config is now written to
  `apps/site/configs/<slug>.json` by the buildspec's `pre_build`, and the site is
  synced from `apps/site/out/`.

## 3. Still-open infra items (unrelated to the split)

These were diagnosed earlier and remain backend/infra tasks:

- **CloudFront 403 → S3 origin access.** Even `/index.html` 403s, so CloudFront
  can't read the bucket — the public-bucket policy (set by the buildspec) and the
  distribution's origin-access model (likely OAC) are mismatched. Pick one:
  private bucket + OAC with a distribution-scoped policy, OR public bucket +
  CloudFront pointing at the S3 **website** endpoint. See `deploy-security-headers.md`.
- **TLS certificate** for `*.1pharmacy.io` on the `https` listener (the original
  `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`).

## What was verified in code

- All 4 workspaces typecheck clean; `apps/site` builds a static export with the
  **site at `/`** and **zero builder** in `out/`; `apps/builder` builds as a dynamic
  app at `/`; 86 tests pass.
- The full CodeBuild build phase was simulated locally from the repo root
  (`npm run build:site` → prune → `apps/site/out`): site at `/`, only the tenant's
  own assets (~18 MB for urmedz), no builder, no `/preview` leakage of foreign
  tenant asset folders.
```
