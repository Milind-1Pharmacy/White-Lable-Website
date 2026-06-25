# Vercel deployment (monorepo)

After the monorepo split, the repo has two apps under `apps/` plus shared
`packages/`. Vercel must be told which app to build via **Root Directory** — the
old single-app root (`/` or `app/(builder)`) no longer exists, which is why a stale
project fails with:

```
The specified Root Directory "app/(builder)" does not exist
```

There are two kinds of Vercel deployment: the **builder** (one project) and
optional **tenant demo sites** (one project per tenant).

---

## A. The Builder project (the authoring UI)

The builder is `apps/builder`, deployed from `main` as a normal dynamic Next.js app.

### Fix an existing project (the "Root Directory does not exist" error)

1. **Settings → General → Root Directory** → **Edit**
2. Change the old value (`app/(builder)` or `/`) → **`apps/builder`**
3. ✅ Tick **"Include files outside the root directory in the Build Step"**
   *(required — the builder imports `@wl/render-engine` + `@wl/config-types` from
   `packages/`, which live OUTSIDE `apps/builder`; without this the build can't
   resolve them)*
4. **Save** → **Redeploy**

### Create a fresh builder project

1. **Add New → Project** → import `White-Lable-Website`
2. **Production Branch**: `main`
3. **Root Directory**: `apps/builder` + ✅ "Include files outside the root directory"
4. **Framework Preset**: Next.js (auto-detected — leave it)
5. **Build & Output**: leave defaults (Install `npm install` at repo root → links the
   workspace; Build `next build`; Output `.next`)
6. **Environment Variables**:

   | Name | Value | Notes |
   |------|-------|-------|
   | `NEXT_PUBLIC_API_ENV` | `atest` | The ENV KEY — **no hyphen**. Maps to `…/a-test/` in `lib/api/env.ts`. Passing `a-test` is WRONG (falls back to `gamma`). |
   | `NEXT_PUBLIC_PUBLISH_API` | `1` | Turns on real publish (vs. demo mock). |
   | `NEXT_PUBLIC_PUBLISH_TOKEN` | `<session-token>` | Sent as the `session-token` header. |

   Do **NOT** set `TENANT` or `STATIC_EXPORT` — the builder is never a static export.
7. **Deploy.**

---

## B. Tenant demo sites (e.g. Aarav Pharmacy) — optional

> Production tenant sites are meant to deploy to **S3/CloudFront via CodeBuild**
> (built/published from the builder's **Publish** button). A Vercel tenant project is
> only for **development/demo** previews. The existing `deployment/*` branch projects
> can stay as-is and untouched.

To host a tenant site on Vercel from the monorepo, create one project per tenant —
all pointing at `apps/site`, differing only by `TENANT`:

1. **Add New → Project** → import the same repo
2. **Production Branch**: `main`
3. **Root Directory**: **`apps/site`** + ✅ "Include files outside the root directory"
4. **Environment Variables**:

   | Name | Value |
   |------|-------|
   | `TENANT` | `aarav_pharmacy` (or `urmedz`, `two_pharmacy`, …) |

5. **Deploy.**

### Caveats for tenant Vercel projects

- `apps/site` is `output: "export"` (static). Vercel serves the exported `out/`
  fine, but the project must build per-tenant via the `TENANT` env var above.
- **The tenant's config must exist in `apps/site/configs/`.** Currently present:
  `urmedz`, `two_pharmacy`, `medicine_pharmacy`, `lumen_wellness`, `app_master`.
  **`aarav_pharmacy.json` is NOT there yet** (it lived only on
  `deployment/aarav-tenant`) — add it to `apps/site/configs/` on `main` before
  deploying Aarav.

---

## Reference: what changed vs. the old single app

| | Old (single app) | New (monorepo) |
|--|------------------|----------------|
| Builder Root Directory | `/` or `app/(builder)` | **`apps/builder`** |
| Site Root Directory | `/` | **`apps/site`** |
| Cross-package imports | n/a (one folder) | needs **"include files outside root"** ✅ |
| Install | `npm install` at root | same (workspaces link automatically) |
| `STATIC_EXPORT` flag | toggled build mode | **gone** — site always static, builder always dynamic |

## Quick troubleshooting

- **"Root Directory does not exist"** → set it to `apps/builder` (builder) or
  `apps/site` (tenant), per above.
- **Build fails resolving `@wl/render-engine` / `@wl/config-types`** → the "Include
  files outside the root directory" checkbox is OFF. Turn it on.
- **Publish hits the wrong API** → `NEXT_PUBLIC_API_ENV` is `a-test` instead of
  `atest` (no hyphen).
