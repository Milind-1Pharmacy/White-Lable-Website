# Monorepo layout

This repo is an **npm-workspaces monorepo** with two apps and two shared packages.
It replaced a single Next.js app where the builder and the site shared one root
route — which caused the builder to deploy into tenant S3 buckets and forced the
site homepage onto a `/site` route. After the split, each app owns its own `/` and
the builder is **physically absent** from the site build.

## Workspaces

```
package.json                     # "workspaces": ["packages/*", "apps/*"]
tsconfig.base.json               # shared compiler options
buildspec.yml                    # CodeBuild → builds apps/site only

packages/
  config-types/                  # @wl/config-types — AppConfig/SystemConfig types
    src/config.types.ts
  render-engine/                 # @wl/render-engine — the SHARED render layer
    src/modules/*                #   Hero…Categories, SectionRenderer, RichHeading
    src/components/*             #   layout (Navbar/Footer/StickyCta/Container),
                                 #   common (SectionWrapper/MobileCarousel/LegalArticle/SEO),
                                 #   motion (MotionProvider), forms, ui (button/input/card/badge)
    src/lib/*                    #   getConfig, complianceFilter, themeBridge, themeLoader,
                                 #   renderOrder, legalRoutes, safeUrl, seoBuilder, motion,
                                 #   utils, useIsMobile (+ co-located *.test.ts)
    src/types/ui.types.ts

apps/
  site/                          # @wl/site — PUBLIC render engine (static → S3)
    app/page.tsx                 #   the HOMEPAGE, served at "/"  (was (site)/site/page.tsx)
    app/layout.tsx               #   root: fonts+motion + tenant theme + Navbar/Footer/CTA + SEO
    app/{about,services,contact,disclaimer,privacy-policy,terms-conditions,deactivate-account}/
    app/preview/**               #   admin preview index + [slug] (reads configs)
    app/{robots,sitemap}.ts, app/not-found.tsx, app/globals.css
    configs/                     #   tenant JSON + system.json
    public/                      #   site-css + tenant asset folders
    proxy.ts                     #   DEV-only edge headers
    next.config.ts               #   output:'export' ALWAYS
  builder/                       # @wl/builder — authoring UI (dynamic → Vercel)
    app/page.tsx                 #   WebsiteBuilder at "/"
    app/builder/**               #   state, fields, components, sections, preview
    app/layout.tsx               #   fonts+motion shell + builder frame + loader keyframes
    app/globals.css, public/site-css   #   preview iframe loads the same shared CSS
    lib/api/**                   #   publish, upload, endpoints, env, versionConfig
    next.config.ts               #   dynamic (no output)

scripts/prune-tenant-assets.mjs  # post-build: drop foreign tenant folders from apps/site/out
```

## Import conventions

- **Apps → shared code:** `@wl/render-engine/<subpath>` (e.g.
  `@wl/render-engine/modules/Hero`, `@wl/render-engine/lib/getConfig`,
  `@wl/render-engine/components/layout/Navbar`); types via `@wl/config-types`.
- **Inside `packages/render-engine`:** self-reference via `@wl/render-engine/*`
  (resolved through the package `exports` map) — NOT `@/`. This makes imports
  resolve identically in tsc, vitest, and Next without an alias base.
- **App-local imports:** each app's `@/*` → its own root (e.g. the builder's
  `@/lib/api/publish` → `apps/builder/lib/api/publish`).
- Both `next.config.ts` set `transpilePackages: ["@wl/render-engine", "@wl/config-types"]`
  so the apps compile the packages' TS/TSX source directly (no prebuilt dist).

## Build & deploy

| App | Command | Output | Target |
|-----|---------|--------|--------|
| Site (tenant) | `TENANT=<slug> npm run build:site` | `apps/site/out` (static, `/` = site) | S3/CloudFront via `buildspec.yml` |
| Builder | `npm run build:builder` | dynamic server | Vercel |

`buildspec.yml` (CodeBuild) installs the workspace (`npm ci`), pulls the tenant
config to `apps/site/configs/<slug>.json`, builds `build:site`, prunes foreign
tenant assets from `apps/site/out`, then `aws s3 sync apps/site/out/`. There is **no
`STATIC_EXPORT` flag and no `promote-site-root.mjs`** — the site is a static export
that owns `/` by construction, and the builder isn't in this app at all.

## Deploy-platform settings (apply once)

- **Vercel** (builder): set the project **Root Directory** to `apps/builder`.
- **CodeBuild** (site): the build is driven by `buildspec.yml` at the repo root,
  which already builds `apps/site`. Ensure the project uses "Use a buildspec file".
