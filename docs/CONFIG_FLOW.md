# Config Flow

Deep dive on how a config file becomes a rendered, compliant page: loading, tenant resolution, compliance filtering, theming, SEO, and the config shape.

## The pipeline

```
configs/system.json ──┐
configs/<tenant>.json ─┼─► getConfig() ─► applyCompliance() ─► ResolvedConfig
  (or app_master.json)─┘                                         { app, system }
```

All loaders live in `lib/getConfig.ts` and are wrapped in React `cache()`, so each config file is read and parsed at most once per request/render pass.

## Loading

- `readJson<T>(filename)` (`lib/getConfig.ts:29`) reads + `JSON.parse`s a file from the `configs/` directory.
- `getSystemConfig()` (`lib/getConfig.ts:38`) loads `system.json` — the shared ruleset.
- `getAppConfig()` (`lib/getConfig.ts:46`) loads the active tenant config (see resolution below).
- `getConfig()` (`lib/getConfig.ts:63`) loads both in parallel, runs `applyCompliance()`, and returns `{ app, system }` as a `ResolvedConfig`.

There is **no schema validation step** — "validation" here means defensive reads and graceful degradation rather than a validator that throws. Malformed JSON throws at parse time; missing optional fields are simply skipped downstream.

## Tenant resolution and fallback

`getAppConfig()` resolves the active tenant from the `TENANT` environment variable:

```
TENANT set?
  ├─ yes → read configs/<TENANT>.json   (".json" appended if absent)
  │         └─ on read/parse error → fall through to app_master
  └─ no  → read configs/app_master.json
```

So a plain `npm run build` (no `TENANT`) always serves `configs/app_master.json`. This is why any content change to a live tenant must be made in **both** the tenant file and `app_master.json` — see [MULTI_TENANT.md](./MULTI_TENANT.md).

`RESERVED_FILES` (`system.json`, `app_master.json`) are excluded from tenant listing/lookup so they never appear as selectable previews.

### Per-slug loading (previews)

- `listConfigs()` (`lib/getConfig.ts:81`) summarizes every non-reserved `*.json` in `configs/` into `{ slug, name, category, colors, logo }`, skipping files that fail to parse.
- `getConfigBySlug(slug)` (`lib/getConfig.ts:110`) validates the slug against `/^[a-z0-9_-]+$/i`, rejects reserved files, loads `<slug>.json`, applies compliance, and returns `null` on any failure (never throws). Used by the `/preview/[slug]` route.

## Compliance filtering

`applyCompliance(rawApp, system)` (`lib/complianceFilter.ts:67`) runs before any module renders and returns a sanitized copy of the config. Summary:

- Rewrites the hero CTA label via `sanitizeCta()` (unsafe → fallback) and forces `type: "safe-action"`.
- Filters `content.sections[]` down to types on `system.sectionAllowlist`.
- Force-sets every flag in `system.compliance.forceDisabledFeatures` to `false`.
- Guarantees `compliance.disclaimer` (tenant value, else `system.compliance.defaultDisclaimer`) and pins `compliance.mode` to `"business-profile-safe"`.

Full detail in [COMPLIANCE.md](./COMPLIANCE.md).

## Theming (`lib/themeLoader.ts`)

- `resolveColors(config)` (`:19`) merges the tenant's `branding.colors` with `system.branding.fallbackColors`, guaranteeing all six brand colors. `accent` and `ink` fall back to `text` if neither tenant nor system supplies them.
- `colorsToCssVars()` / `themeStyle()` (`:38`, `:54`) emit the six CSS variables `--brand-primary`, `--brand-secondary`, `--brand-background`, `--brand-text`, `--brand-accent`, `--brand-ink`.
- `themeStyle()` is applied as an inline `style` on `<html>`/`<body>` (`app/layout.tsx`) and the site wrapper (`app/(site)/layout.tsx`). Tailwind references them as `bg-[var(--brand-primary)]`, etc.
- `branding.stylesheet`, if present, is injected as a `<link rel="stylesheet">` in the root layout `<head>`.

## SEO (`lib/seoBuilder.ts`)

`buildMetadata(config, pageTitle?)` (`lib/seoBuilder.ts:26`) builds a Next.js `Metadata` object from `seo.*` and `tenant.name`:

- Title: `"<pageTitle> | <tenant.name>"` when a page title is passed, else `seo.title`.
- `description`, `keywords`, `applicationName`.
- Open Graph (`type: website`, `siteName`, optional 1200×630 `ogImage`) and a `summary_large_image` Twitter card.
- `metadataBase` comes from `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3000`).

Each page/layout calls `buildMetadata` from its `generateMetadata()`; legal pages pass a page title (e.g. `"Privacy Policy"`).

## Config shape

Defined in `types/config.types.ts`. The tenant config is `AppConfig`:

```ts
type AppConfig = {
  tenant:     { name; category };
  branding:   { logo?; logoFull?; stylesheet?; colors };   // colors: primary/secondary/background/text + accent?/ink?
  seo:        { title; description; keywords[]; ogImage? };
  content:    { hero; about?; services?; servicesMeta?; sections[] };
  contact:    { email?; phone?; address? };
  features:   { enableChat; enableForms; enablePayments; enableCart };
  compliance: { mode: "business-profile-safe"; disclaimer };
  layout?:    { nav?; footer?; stickyCta?; pages? };        // pages: contact/legal/notFound copy
};
```

- **content.hero** (`HeroContent`) — headline (plain or `headlineRich` parts), tagline, CTA, optional secondary CTA, proof items, slides, meta, rail.
- **content.about / services / servicesMeta** — rendered explicitly by the home page, not through the dispatcher.
- **content.sections[]** — a `Section` discriminated union (`{ type; data }`); each type maps to a module. See [MODULES.md](./MODULES.md). Allowed types: `features`, `howItWorks`, `gallery`, `stats`, `savings`, `videoFeature`, `appStrip`, `faq`, `aiStore`, `team` (plus `hero`/`about`/`services`/`testimonials` on the allowlist).
- **RichHeading** — headings are `parts[]` with optional `br` and `emphasis` (`italic`, `italic-accent`, `accent`), rendered by `modules/RichHeading.tsx`.

The shared ruleset is `SystemConfig`: `sectionAllowlist`, `sectionMapping`, `compliance` (unsafe labels, fallback, force-disabled features, default disclaimer), `rendering` (`revalidateSeconds: 3600`), `routing.requiredPages`, and `branding.fallbackColors`.

## Graceful degradation

The app must render with partial/missing config. Patterns enforced in the code:

- The home page guards each top section: `AppStrip` renders only if an `appStrip` section exists; `About` only if it has any content (`hasAbout` check in `app/(site)/page.tsx:36`); `Services` only if the array is non-empty.
- `SectionRenderer` returns `null` for an empty list and for any unknown `section.type` (the `default` case).
- Modules render nothing rather than erroring when their data slice is empty.
- `themeLoader` fills missing colors from system fallbacks; `seoBuilder` omits OG/Twitter images when `ogImage` is absent.
- Legal/not-found pages read optional `layout.pages.*` fields and skip any that are missing.

Never assume a field exists; skip the section or fall back to a default.
