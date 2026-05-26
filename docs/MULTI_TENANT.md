# Multi-Tenant

How tenancy works: selecting a tenant at build time, per-tenant configs and scripts, asset conventions, and the gotchas that keep tenants in sync.

The platform is single-tenant per build today (`system.json` → `"mode": "single-tenant"`) and structured to scale to many tenants: one config file per tenant, selected via an env var.

## Tenant selection

`lib/getConfig.ts` (`getAppConfig`, `:46`) resolves the active tenant from `process.env.TENANT`:

```
TENANT=urmedz  →  configs/urmedz.json   (".json" appended if omitted)
TENANT unset   →  configs/app_master.json
read error     →  falls back to configs/app_master.json
```

So `configs/app_master.json` is the default any time `TENANT` is unset or the tenant file can't be read.

## The sync gotcha

A plain `npm run build` (no `TENANT`) serves `app_master.json`. Therefore any content change to a live tenant must be made in **both** the tenant file **and** `app_master.json`, or the two drift.

Easiest workflow: edit the tenant file, then copy it over the master:

```bash
cp configs/<tenant>.json configs/app_master.json
```

## Per-tenant npm scripts

`package.json` defines tenant-scoped scripts following the `build:<tenant>` / `sync:<tenant>` / `deploy:<tenant>` convention. The current tenant (`urmedz`) shows the full pattern:

```jsonc
"build:urmedz":      "TENANT=urmedz next build",                          // static export → out/
"sync:urmedz":       "aws s3 sync out/ s3://www.urmedz.in/ --delete --profile urmedz",
"invalidate:urmedz": "aws cloudfront create-invalidation --profile urmedz --paths \"/*\" ...",
"deploy:urmedz":     "npm run build:urmedz && npm run sync:urmedz"
```

`build:<tenant>` sets `TENANT` so `getConfig` picks `configs/<tenant>.json`; `sync:<tenant>` pushes the static `out/` to the tenant's S3 bucket; `invalidate:<tenant>` busts the CloudFront cache; `deploy:<tenant>` chains build + sync. Add a parallel set of four scripts per new tenant.

## Config validation tip

After editing a config JSON, validate it before building:

```bash
node -e "JSON.parse(require('fs').readFileSync('configs/<file>.json','utf8'))"
```

(Editors/linters reformat JSON between multi-line and single-line, which breaks exact-match edits — re-read before editing.)

## Asset convention

Per-tenant images live under `public/<project>/` and are referenced by absolute path in the config (`/<project>/hero.png`). Service thumbnails go in `public/<project>/services/`. Standard slots:

```
public/<project>/
  logo.png
  hero.png
  about.png
  og-image.png
  services/<slug>.png
  ... gallery images
```

Swapping tenants is: drop assets into a new folder, point the new config's paths at them — no component changes.

## Preview gating

The `/preview` index and `/preview/[slug]` pages enumerate tenants from the `*.json` files present in `configs/` at build time (`listConfigs()`), excluding the reserved `system.json` and `app_master.json`. See [ROUTING.md](./ROUTING.md#preview-routes--tenant-gating).

Because `generateStaticParams()` builds one preview per config file, a plain build emits `/preview/*` for **all** tenants whose configs are present. For a tenant-scoped production build, ensure only the intended config files are in `configs/` so the build doesn't ship other tenants' previews.

## Theming per tenant

Each tenant's `branding.colors` flow through `lib/themeLoader.ts` into the six `--brand-*` CSS variables, with `system.branding.fallbackColors` filling any gaps. The preview layout applies each tenant's theme independently. See [CONFIG_FLOW.md](./CONFIG_FLOW.md#theming-libthemeloaderts).
