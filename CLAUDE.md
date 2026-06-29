# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Monorepo layout (read first — paths below this section may be pre-split)

This repo is an **npm-workspaces monorepo**. The old single-app layout (`app/(site)`,
`app/(builder)`, root `modules/`, `lib/`, `types/`) was split into:

```
packages/config-types   → @wl/config-types   — the AppConfig/SystemConfig types
packages/render-engine   → @wl/render-engine   — SHARED: modules/*, components/*,
                            and shared lib/* (getConfig, complianceFilter, themeBridge,
                            themeLoader, renderOrder, legalRoutes, safeUrl, seoBuilder,
                            motion, utils, useIsMobile) + types/ui.types
apps/site                → @wl/site   — the PUBLIC render engine. STATIC export
                            (output:'export' ALWAYS, no STATIC_EXPORT flag). The
                            homepage is apps/site/app/page.tsx → served at "/"
                            (there is NO /site route anymore). Owns configs/, public/,
                            proxy.ts. /preview lives here (it reads configs).
apps/builder             → @wl/builder   — the authoring UI. DYNAMIC app → Vercel.
                            Owns "/", lib/api/* (publish/upload). Imports
                            @wl/render-engine for the live preview iframe.
```

**Import rules:** apps import shared code as `@wl/render-engine/<subpath>` (e.g.
`@wl/render-engine/modules/Hero`, `@wl/render-engine/lib/getConfig`,
`@wl/render-engine/components/layout/Navbar`) and types as `@wl/config-types`.
Inside `packages/render-engine`, files **self-reference** via `@wl/render-engine/*`
(not `@/`) so they resolve identically in tsc, vitest, and Next. Each app keeps
`@/*` → its own root (e.g. the builder's `@/lib/api/publish`).

**Build/deploy:** `npm run build:site` (static → `apps/site/out`, the site at `/`,
zero builder) for tenant S3 deploys via `buildspec.yml`; `npm run build:builder`
(dynamic) for Vercel. The `promote-site-root.mjs` workaround is **deleted** — the
site owns `/` natively. `scripts/prune-tenant-assets.mjs` now targets `apps/site/out`.

**Vercel (monorepo):** the project **Root Directory** must point at the app you're
deploying — **`apps/builder`** for the builder, **`apps/site`** (+ `TENANT=<slug>`
env) for a tenant demo site — and **"Include files outside the root directory in the
Build Step" must be ON** (apps import `@wl/*` from `packages/`). A stale project on
the old `app/(builder)` path fails with "Root Directory does not exist". The
`NEXT_PUBLIC_API_ENV` env key is **`atest`** (no hyphen). Full steps:
`docs/vercel-deployment.md`.

**Deploy the builder via CLI:** `npm i -g vercel` (not installed by default), then
`(cd apps/builder && vercel --prod --yes)` — running from `apps/builder/` selects the
`whitelabel-builder` project unambiguously (live at `whitelabel-builder-six.vercel.app`).
A push to `main` also auto-deploys via the GitHub integration. `NEXT_PUBLIC_*` are baked
at **build** time, so changing an env value or code requires a **redeploy** to take effect.

### Monorepo gotchas (learned)

- **Verify per-workspace, not from root:** run `(cd apps/site && npx tsc --noEmit)` /
  `(cd apps/builder && npx tsc)` per app/package — a root `tsc` follows imports into
  `packages/` and re-checks them under the wrong `@/` base (false errors). `npm test`
  (vitest) still runs from root; builds are `npm run build:site` / `build:builder`.
- **Lint doesn't run standalone** — `npx eslint` from root fails ("eslint.config not
  found") and `npx next lint` mangles args. Verify via per-app `tsc --noEmit` + a build
  (`build:builder` / `build:site` run lint as part of `next build`).
- **"preview = live" has ONE exception: the display font.** The builder preview iframe
  loads **Instrument Serif** (a `<link>` in `PreviewFrame.tsx`, bound to `--font-display`
  via `_base.tokens.css`), but the LIVE site binds whatever `apps/site/app/layout.tsx`
  registers through `next/font` to `--font-display`. If those differ, headings render at
  different heights → a bug shows on live but NOT in preview (e.g. a wrapping heading
  overlapping the grid/mosaic below in `.ais__head`/`.egal__head`, fixed with `min-height`
  on the heading). Keep the live `--font-display` == Instrument Serif; tune heading metrics
  against LIVE, not preview.
- **CodeBuild runs `npm ci --omit=dev`**, so build-time tooling lives in `apps/site`
  **`dependencies`** (`@tailwindcss/postcss`, `tailwindcss`, `typescript`, `@types/*`)
  and `*.test.ts(x)` are excluded from `tsconfig` — else `next build` fails on missing
  CSS/type deps. A stale CodeBuild node_modules cache can still poison it: clear the
  cache (the install guard fails fast if `@tailwindcss/postcss` is absent).
- **Validate `buildspec.yml` with a real YAML parser** before committing (pyyaml in a
  venv) — a line starting with `"` is read as a quoted scalar and CodeBuild aborts with
  "found character that cannot start any token". Use block scalars (`- |`) for shell
  snippets containing quotes.
- **If a CodeBuild failure's commands don't match `buildspec.yml`** (e.g. the log shows
  `npm run build:tenant` / `--omit=dev` but the repo file doesn't), CodeBuild is using
  an **inline buildspec** or an old commit — not the repo file. Fix the project's "Use a
  buildspec file" setting, not just the repo.
- **Publish API (`lib/api` in `apps/builder`):** responses double-wrap the payload
  (`{data:{data:{status}}}`) — `readStatusObject` peels both; `NEXT_PUBLIC_API_ENV` is
  the key **`atest`** (no hyphen → `…/a-test/`); token via `NEXT_PUBLIC_PUBLISH_TOKEN`.
- **Demo/seed images are S3 URLs now** (`1p-b2c-files.s3…`), not local `/urmedz/*` paths
  — `app_master.json` and the builder seed (`builderData.ts`) were rewired so no tenant
  asset folder ships to every site. Bump `DRAFT_KEY` (`wb:appConfig:vN`) when the
  builder seed shape changes.

The architectural sections below still describe behavior accurately (config flow,
compliance, animation, security), but **translate any `app/(site)`, `app/(builder)`,
`modules/`, `lib/`, `types/` path to its new home above.** New docs:
`docs/monorepo-layout.md`, `docs/vercel-deployment.md`,
`docs/monorepo-migration-handoff.md`.

## Project

A **config-driven Next.js (App Router) platform** that generates compliant, SEO-friendly business profile websites from a single JSON file. The same component code serves every tenant — only `configs/app_master.json` changes. The platform is single-tenant today and upgradeable to multi-tenant.

Stack: Next.js (App Router) · TypeScript · TailwindCSS · shadcn/ui · npm.

This repo is also intended to host a second **form-builder app** (the authoring UI that emits an `AppConfig` JSON) alongside the render engine — see `docs/system-architecture.md`. A client-side builder now lives at `app/(builder)/builder/` (route group `(builder)` keeps it out of the public `(site)` chrome). It edits an in-memory `AppConfig` draft and previews it by rendering the **real `modules/*.tsx`** inside an isolated `<iframe>` (`PreviewFrame.tsx`), styled by `public/preview.css` (builder-only — never shipped). The builder is modular: `WebsiteBuilder.tsx` is a ~36-line composition root; state lives in `useBuilderState.tsx`, field descriptors in `fieldBuilders.tsx`, with `builderStyles/Helpers/Types.ts`, `components/*` and `sections/*`. Debug the relevant file, not one monolith.

## Common commands

```bash
npm install      # install dependencies (first run)
npm run dev      # local dev server (http://localhost:3000) — Turbopack
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

To add another shadcn component (only ones referenced in the spec are installed: button, card, input, badge):

```bash
npx shadcn@latest add <component>
```

## The one rule

**No business content lives in components.** Tenant-specific text, branding, links, and feature flags come exclusively from `configs/app_master.json`. Components and modules are stateless — they accept props derived from config and render. If you find yourself typing a tenant's name, copy, or color into a `.tsx` file, stop and route it through config instead.

A second invariant: **the app must render with partial or missing config**. Treat every config field as potentially absent and degrade gracefully (skip the section, fall back to a system default, never crash the page).

## Config flow

```
configs/app_master.json
        │
        ▼
lib/getConfig.ts          ← loads + validates config (server-side)
        │
        ▼
lib/complianceFilter.ts   ← rewrites/strips fields per compliance rules
        │
        ▼
modules/*.tsx             ← receives sanitized props, renders
```

`configs/system.json` holds architecture defaults and the compliance ruleset that `complianceFilter.ts` enforces. It is not tenant-specific.

## Tenant selection (multi-tenant)

- `lib/getConfig.ts` reads `process.env.TENANT` → loads `configs/<TENANT>.json` (e.g. `TENANT=aarav_pharmacy`). If `TENANT` is unset/unreadable it **falls back to `configs/app_master.json`**.
- **Edit BOTH the tenant file AND `app_master.json`** for any content change to a live tenant — a plain `npm run build` (no TENANT) serves `app_master.json`, so they must stay in sync. Easiest: `cp configs/<tenant>.json configs/app_master.json`.
- Per-tenant build/deploy scripts in `package.json` follow `build:<tenant>` / `sync:<tenant>` / `deploy:<tenant>` (`TENANT=<tenant> next build`).
- `app/preview/[slug]/page.tsx` builds a preview page per config; `generateStaticParams` is gated so a `TENANT`-scoped build emits only that tenant — a plain build ships **all** tenants' `/preview/*` pages.

`lib/themeLoader.ts` reads `branding.colors` and exposes them as CSS variables for Tailwind. `lib/seoBuilder.ts` builds Next.js `Metadata` from `seo.*`.

## Section mapping

`content.sections[]` entries are dispatched to modules by `type`:

| Config `type`  | Module file              |
| -------------- | ------------------------ |
| `hero`         | `modules/Hero.tsx`       |
| `about`        | `modules/About.tsx`      |
| `services`     | `modules/Services.tsx`   |
| `features`     | `modules/Features.tsx`   |
| `howItWorks`   | `modules/HowItWorks.tsx` |
| `gallery`      | `modules/Gallery.tsx`    |

When adding a new section type: define its shape in `types/config.types.ts`, add the mapping in the section dispatcher, and ensure the module renders nothing (not an error) if its data is missing.

## Gotchas learned

- After editing config JSON / the stylesheet, validate: `node -e "JSON.parse(require('fs').readFileSync('configs/<f>.json','utf8'))"` and check CSS braces balance. `Edit` matches break often because a linter reformats the JSON (multi-line ↔ single-line) — re-Read before editing.
- `useIsMobile()` (and all hooks) must be called BEFORE any early `return null` — eslint `rules-of-hooks` errors otherwise. `npm run build` does not fail on lint; run `npm run lint` separately.
- `npm run lint` enforces `react-hooks/refs` as an **error**: building event-handler descriptors during render (handlers that transitively read a ref) trips a false "ref accessed during render". Scope a `/* eslint-disable react-hooks/refs */` to that file with a justification — the handlers only fire in events, never during render.
- Section headings use rich `parts[]` with `br`/`emphasis` (`italic`, `italic-accent`); keep tenant `ariaLabel`s on `MobileCarousel` generic, never hardcode a tenant name in a shared module.
- Logo is a wide ~2:1 lockup (no square mark): set `next/image` width/height to that ratio + size via CSS height/`width:auto`, or it stretches.
- Compliance: the website is **non-transactional** (links to the app/WhatsApp to order); WhatsApp is **support/enquiry only — never "order on WhatsApp"** (Meta policy).

## Compliance invariants

`lib/complianceFilter.ts` runs before any module renders. It:

- Rewrites unsafe CTA labels (e.g. "Buy Now", "Order") to safe equivalents ("Learn More", "Contact Us").
- Force-disables `features.enablePayments` and `features.enableCart` regardless of config — these never render in `business-profile-safe` mode.
- Ensures `compliance.disclaimer` is rendered in the footer on every page; falls back to the system default if the tenant didn't supply one.
- Suppresses any section type not on the system allowlist.
- Routes communication through support-only flows (no transactional forms, no checkout).

Compliance always wins. If config and compliance disagree, compliance is what renders.

## Rendering rules

- **Server components by default.** Add `"use client"` only when a component genuinely needs state, effects, or browser APIs (e.g. a chat widget).
- **Static + ISR for pages.** All pages export `revalidate = 3600` for hourly ISR. Legal pages (`privacy-policy`, `terms-and-conditions`, `disclaimer`) must always exist regardless of tenant config.
- **Route groups to escape chrome:** the public Navbar/Footer/StickyCta live in `app/(site)/layout.tsx`. A page that must NOT inherit them goes in its own group (e.g. `app/(builder)/…`) with its own `layout.tsx`; it still inherits the root `app/layout.tsx` (fonts, `MotionProvider`, tenant `--brand-*` vars on `<body>`).
- **Image optimization** via `next/image` — pull URLs from config, never inline.
- **404 fallback** lives in `app/not-found.tsx`.
- Lazy-load non-critical modules (`next/dynamic`) when they aren't above the fold.
- **Legal & contact pages MUST use the `.legal-page` shell, not `SectionWrapper`.** `SectionWrapper`'s
  `py-24` (96px) doesn't clear the ~84px FIXED navbar → heading overlaps the nav. `LegalArticle` + the
  contact page emit `.legal-page`/`.legal-wrap`/`.legal-*` (from `site-css/blocks/legal.css`, which has the
  nav-clearing `clamp(120px,…)` top padding) so they match the builder's `LegalPreview` (preview = live).
  Don't reintroduce `SectionWrapper` on these routes.
- **Static-export `<Link>` prefetch 403s on S3:** Next auto-prefetches route data (`/privacy-policy/` etc.)
  which S3 can't serve → 403 console noise (harmless, click still works). Nav/Footer `<Link>`s use
  `prefetch={false}`; keep it on any new config-driven link in those shared layout components.

## Animation patterns (GSAP + ScrollTrigger)

Animation primitives live in `lib/motion.ts` (`fadeUp`, `staggerCards`, `parallaxImage`, `imageReveal`). All client modules use `gsap.context()` for scoped cleanup. Hard rules:

- **Use `gsap.from()`, never `gsap.fromTo()`** for entry animations. If the trigger never fires (HMR, Strict Mode, fast scroll), content stays at its natural visible state. `fromTo` locks invisible state.
- **Always set `clearProps: "transform,opacity"`** so GSAP wipes inline styles after completion — prevents stale state across HMR.
- **Use `start: "top 95%"`** for entry triggers, not 80%. Above-the-fold content fires immediately.
- **Inner image refs that get parallaxed need `-inset-[6%]` overscan** (not `inset-0`). GSAP `yPercent` translation otherwise reveals blank wrapper edges. See `modules/Hero.tsx`, `modules/About.tsx`, `modules/Gallery.tsx`.
- **Don't stack CSS `scale-[1.x]` on the same element GSAP transforms.** Use `-inset-[N%]` (layout) for overscan instead.
- **`ScrollTrigger` must be registered at `lib/motion.ts` module load** (not in a `useEffect`). Otherwise modules race the provider mount and log "Missing plugin?".
- All presets honor `prefers-reduced-motion: reduce` via `REDUCED_MOTION` constant — they bail to `null` and elements render at their natural state.
- Lenis was tried and removed — it conflicts with sticky headers and breaks scroll. `scroll-behavior: smooth` on `html` is enough.

## Tenant assets

Per-tenant images live under `public/<project>/` (e.g. `public/demo_proj/`). Sub-folder for service thumbnails: `public/<project>/services/`. The JSON references these paths absolutely (`/demo_proj/hero.png`). When swapping tenants, drop new assets into a new folder and update `configs/app_master.json` paths — no component changes.

Standard slots: `logo.png`, `hero.png`, `about.png`, `og-image.png`, `services/<slug>.png`, plus any gallery images.

### Asset upload & generation workflow (learned)

- **Demo/brand assets live on S3 bucket `1p-b2c-files`** (public-read). Upload directly:
  `aws s3 cp <file> s3://1p-b2c-files/<key> --acl public-read --content-type image/png`, then confirm with
  `curl -s -o /dev/null -w '%{http_code}' https://1p-b2c-files.s3.amazonaws.com/<key>` (expect 200).
- **Key convention is slug-prefixed flat:** `<tenant_slug>_<slot>.png` (e.g. `meri_medicines_hero.png`,
  `aarav_pharmacy_categories_medicines.png`) — mirror it for new assets.
- **User-pasted images** land at a temp cache path that is **cleared quickly** — always `ls`/`file` the path
  FIRST and upload before it disappears; only edit config AFTER a confirmed HTTP 200.
- **Crop multi-panel images with ImageMagick** (`magick <src> -crop WxH+X+Y +repage out.png`); `sips --crop`
  is centre-only (no offset). `Read` the crops to verify framing before uploading.
- **`Services` module renders `s.icon`, NOT `s.image`** — a service with only `image` shows no icon. Hero
  `image` and About `image` are non-rendered fallbacks (Hero uses `slides`; About renders no image).
- **Verify a config/asset change actually rendered** by grepping the static export after `npm run build:site`:
  `grep -o '<tenant_slug>_[a-z_]*\.png' apps/site/out/index.html`.

## Project gotchas (Next 16.2 + shadcn base-ui)

- The edge handler file is `proxy.ts` at the repo root and exports `function proxy()` — Next 16.2 renamed `middleware` → `proxy`. Do not bring back a `middleware.ts`.
- This shadcn revision uses `@base-ui/react/button`. The `Button` does **not** support `asChild`. To make a `<Link>` look like a button, compose `buttonVariants(...)` with `cn()` on the link itself (see `modules/Hero.tsx`, `app/not-found.tsx`).
- Tailwind v4 is in use (`@import "tailwindcss"` in `app/globals.css`). Brand colors are CSS variables on `<body>` set via `lib/themeLoader.ts`; reference them as `bg-[var(--brand-primary)]`, etc.
- `<body>` has `suppressHydrationWarning` to silence ColorZilla / similar browser extensions injecting `cz-shortcut-listen` attributes. Don't remove it — the hydration mismatch is from the extension, not the app.
- `Container` is `max-w-7xl` (1280px) with `lg:px-12 xl:px-16` padding. Don't downsize to `max-w-6xl` — gutters become too wide on 1440px+ screens.
- The Hero `<section>` has `overflow-hidden` for the floating decorative blobs. Anything with negative absolute insets (e.g. floating badge tags) outside a child gets clipped — put overlays *inside* the inner rounded card.
- Brand palette has six CSS vars: `--brand-primary`, `--brand-secondary`, `--brand-background`, `--brand-text`, `--brand-accent` (deeper accent for CTAs/hover), `--brand-ink` (highest contrast). All defined in `lib/themeLoader.ts` and `configs/system.json` fallbacks.

## Website builder gotchas (`app/(builder)/builder/`)

- **Site CSS is shared blocks + small colour-theme tokens** (under `public/site-css/`). `blocks.css` `@import`s one small file per block (`blocks/hero.css`, `team.css`, … — edit a block there, not a monolith). `themes/<name>.tokens.css` sets ONLY colours (imports `_base.tokens.css` for fonts/gutter). A site = `blocks.css` + one theme file; **both preview AND deploy load the same files**, so preview = live. The old per-tenant monoliths (`urmedz.css`/`aarav_pharmacy.css`/`preview.css`) are deleted — don't recreate them.
- **Colours flow through ONE bridge (`lib/themeBridge.ts`).** The 6 brand colours map to the vars the stylesheet reads (`--accent`/`--ink`/`--cream`/`--mute`/`--line` + `--brand-*`). `PreviewFrame.overrideCss` (preview) and `themeLoader.themeStyle` (live `(site)/layout`) both call it — so user colours apply identically in preview and on the live site. Editing the map in one place fixes both.
- **`branding.theme`** (name) selects the live token file; legacy `branding.stylesheet` still derives a theme name as a fallback. Theme presets live in `app/(builder)/builder/themePresets.ts`; the Branding step's picker fills the 6 colour fields from the chosen preset.
- **`public/site-css/preview-overrides.css` is builder-preview ONLY** (Team-quote wrap fix for the narrow iframe). Loaded only by the in-pane preview, never `published`/deploy. Never deploy it.
- **Editor fields are built in TWO parallel paths** in `fieldBuilders.tsx`: `buildCoreFields` (hero/about/services — hand-rolled literals) and `buildSectionDetailFields` (every dynamic section, via the `txt`/`area`/`itemList` helpers). They do NOT share code — a field-level change (limits, props) must be applied to BOTH or core blocks silently miss it.
- **All content validation is schema-driven** (`app/(builder)/builder/validationSchema.ts`): `TEXT_LIMITS` (`{max,min}`), `SECTION_RULES` (array min/max, required, text/url field maps, `headingLimit`), `validateDraft()`. Editors + `FieldRow` + the publish gate read from it — change a limit there ONLY, never hardcode in components. `FieldRow.tsx` renders the counters/badges; inputs hard-cap via `maxLength={f.max}`.
- **`DRAFT_KEY` (`wb:appConfig:vN` in `builderHelpers.ts`) is a CACHE version, NOT a reset switch.** Bump `N` ONLY on a genuine draft-SHAPE change (a field added/renamed/retyped in `builderData.ts` `BLANK`/`INITIAL`/`DEFAULTS`). NEVER bump for a value/text/UI-only change — and even then, `loadDraft` now **migrates the newest older `vN` draft forward** (`migrateLegacyDraft` → re-save under the current key → `pruneLegacyDrafts`), so a bump is a cache refresh, never a data wipe. Only explicit "Clear all data" / "Restore published" empties a draft.
- **Builder load order is local-draft-FIRST, then server fallback** (`useBuilderState` hydration effect): (1) current-version localStorage draft wins → (2) migrated older draft → (3) **no local draft** → async `getTenantConfig()` (the documented `GET /tenant_config`, gated on `NEXT_PUBLIC_PUBLISH_API`) seeds from the last-published config, guarded by a `userTouched` ref so it never clobbers fresh edits → (4) `BLANK()`. The "Restore published" header button (`resetToPublished`, NOT dev-gated) pulls the same endpoint on demand. Never add a backend autosave — the doc specifies no `PUT`; localStorage is the only draft store and the backend persists only on publish.
- **Don't invent backend endpoints.** The only tenant routes are `tenant_config` (GET load), `tenant_config/publish` (POST), `tenant_config/status` (GET) — see `docs/backend-requirements.md` §2. `getTenantConfig`/`publishTenant`/`getPublishStatus` in `lib/api/publish.ts` map to exactly these. The universal envelope is `{statusCode, data}`; `unwrap()` peels it.
- If builder changes don't appear in the browser, the long-running `npm run dev` has stale HMR: `lsof -ti:3000 | xargs kill -9; rm -rf .next; npm run dev`. (`npm run build` ignores lint; the `(site)/layout.tsx` manual-`<link>` warning is expected.)
- **Components portaled into the preview iframe (e.g. `Navbar`) must read scroll/resize from their OWN `ownerDocument`/`defaultView`, not the JS-global `window`** (which is the parent frame). Otherwise scroll-driven state (e.g. nav's `is-scrolled`) never fires in preview.
- **GSAP/measure effects in `useBuilderState.tsx` query DOM ids** rendered in `sections/*` (`#wb-editor-body`, `#wb-sec-list`, `#wb-preview-scroll`, `#wb-picker-pop`, `#wb-publish-card`, `#wb-check-path`, `[data-confetti]`, `.wb-sec-card`). Renaming one silently breaks animations — keep them byte-identical.
- **localStorage hydration is post-mount, not in `useState`** (`loadDraft` in an effect, gated by a `hydrated` ref). Reading localStorage in the lazy initializer causes a server/client hydration mismatch.
- **Lint enforces `react-hooks/refs` + `react-hooks/set-state-in-effect` as errors.** Scope a justified `/* eslint-disable */` rather than restructuring. Building `Field` descriptors that read refs only trips `react-hooks/refs` inside a component render — it's fine in the `fieldBuilders.tsx` factory.
- **Preview iframe perf:** inject the tenant `<link>` ONCE (re-adding it per render re-fetches ~3.6k lines of CSS and flashes the frame); keep `onMeasure` in a ref so the measure effect stays mounted-once.
- **Drag-reorder uses a stable `blockOrder` (card ids)** → derived `content.order` (`section:<index>` tokens). Hero is pinned first. `minmax(0,1fr)` / flex `min-width:0` is the fix for grid columns that collapse to one-word-per-line wrapping.

## Security boundaries (use these for any config-driven sink)

- **Config URLs** (href/src from tenant config) → wrap with `safeHref`/`safeSrc` from `lib/safeUrl.ts` before rendering into `<a>`/`<Link>`/`<img>`/`<video>`. They reject `javascript:`/`data:`/`vbscript:`/`//host`. `complianceFilter.ts` only sanitizes CTA *labels*, not hrefs.
- **Brand colours** reach an injected iframe `<style>` (`PreviewFrame.overrideCss`) — sanitize to hex/rgb/hsl before interpolation; `loadDraft` also scrubs them (localStorage is tamperable).
- **Image upload** (`lib/api/upload.ts`) needs a `session-token`; validates type/size, sanitizes the filename, allowlists the S3 host. **Publish never builds in the browser** — `doPublish` POSTs a flavor `{slug,theme,appConfig}` and polls; the backend runs `TENANT=<slug> next build`.
- **`proxy.ts` is DEV-ONLY.** Under `output: "export"` (static S3+CloudFront deploy) edge handlers/middleware do NOT run, so its headers are absent on the live site. Production security headers (enforced CSP, X-Frame-Options, HSTS, …) are set by a CloudFront response-headers policy — see `docs/deploy-security-headers.md`. Never rely on proxy.ts for prod security.
- **The preview-iframe legal-nav `postMessage`** targets a concrete origin (never `"*"`) via `postLegalNav` in `lib/legalRoutes.ts`; listeners (`useBuilderState`, `Overlays`) validate `e.origin` (own origin, or `"null"` for the opaque srcdoc frame).

## Adding a new module

1. Add the section's type definition to `types/config.types.ts`.
2. Add the module file under `modules/` and export a server component that takes its config slice as props.
3. Register the type in the section dispatcher (where the mapping table above is implemented).
4. Add the type to the system allowlist in `configs/system.json` so the compliance filter permits it.
5. Update the mock `configs/app_master.json` with an example so the demo renders the new section.
