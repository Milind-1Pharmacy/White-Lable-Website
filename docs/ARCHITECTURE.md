# Architecture

High-level view of the platform: a single Next.js (App Router) codebase that renders a complete, compliant business-profile website from one JSON config file per tenant.

## What it is

The same component code serves every tenant. Nothing about a specific business lives in the components — content, branding, links, SEO, and feature flags all come from a tenant config file (`configs/<tenant>.json`, falling back to `configs/app_master.json`). Swap the config (and its `public/<project>/` assets) and you have a new site with no code changes.

The shared, tenant-agnostic ruleset lives in `configs/system.json`: the section allowlist, compliance rules, fallback colors, and rendering defaults.

## The one rule

**No business content lives in components.** Modules are stateless: they accept a config slice as props and render. If you find yourself typing a tenant's name, copy, or color into a `.tsx` file, route it through config instead.

Second invariant: **the app must render with partial or missing config.** Every config field is treated as potentially absent — a missing section is skipped, a missing color falls back to a system default, and the page never crashes. See [CONFIG_FLOW.md](./CONFIG_FLOW.md#graceful-degradation).

## Render pipeline

```
 configs/<tenant>.json  (or app_master.json fallback)
 configs/system.json
            │
            ▼
 lib/getConfig.ts            getConfig() = getSystemConfig() + getAppConfig()
   • react cache() memoized
   • TENANT env → configs/<TENANT>.json, else app_master.json
            │
            ▼
 lib/complianceFilter.ts     applyCompliance(rawApp, system)
   • rewrite unsafe CTA labels       • force-disable payments/cart
   • filter sections by allowlist    • guarantee footer disclaimer
            │
            ▼
 ResolvedConfig { app, system }
            │
   ┌────────┼─────────────────────────────┐
   ▼        ▼                              ▼
 lib/themeLoader.ts   lib/seoBuilder.ts   app pages + modules
  --brand-* CSS vars   Next Metadata       Hero / About / Services
  on <body>/<html>     (OG + Twitter)      + SectionRenderer dispatch
```

- `lib/getConfig.ts:63` — `getConfig()` loads system + app config in parallel and runs the compliance filter before returning. All loaders are wrapped in React `cache()` so a request loads each file once.
- `lib/complianceFilter.ts:67` — `applyCompliance()` returns a sanitized copy; compliance always wins over tenant config. See [COMPLIANCE.md](./COMPLIANCE.md).
- `lib/themeLoader.ts:54` — `themeStyle()` produces the `--brand-*` CSS variables applied as inline style on `<html>` (`app/layout.tsx`) and the site wrapper (`app/(site)/layout.tsx`).
- `lib/seoBuilder.ts:26` — `buildMetadata()` builds the Next.js `Metadata` object from `seo.*`.

## Page assembly

The home page (`app/(site)/page.tsx`) renders fixed top-of-page modules explicitly, then dispatches the rest:

```
HomePage
 ├─ <Hero data={content.hero} />
 ├─ <AppStrip ... />            (only if a section of type "appStrip" exists)
 ├─ <About data={content.about} />   (only if about has any content)
 ├─ <Services ... />           (only if services array is non-empty)
 └─ <SectionRenderer sections={remaining} />   (everything else, by type)
```

`SectionRenderer` (`modules/SectionRenderer.tsx`) is the dispatcher for the data-driven `content.sections[]` list — see [MODULES.md](./MODULES.md).

## Rendering model

- **Server components by default.** `"use client"` is added only where state/effects/browser APIs are needed (e.g. animation-driven and interactive modules).
- **Static export.** `next.config.ts` sets `output: "export"` — the build emits static HTML to `out/` for hosting on S3 + CloudFront. Image optimization is disabled (`images.unoptimized`) because there is no Node runtime at serve time; `trailingSlash: true` so `/about` → `/about/index.html`.
- **`revalidate = 3600`** is exported by pages/layouts (ISR intent). Under static export the HTML is generated at build time; the platform is rebuilt and re-synced per deploy.
- **Edge headers** are set by `proxy.ts` (Next 16.2's renamed middleware) — security headers on every matched response. See [ROUTING.md](./ROUTING.md#edge-handler).

## Tech stack

Next.js 16.2 (App Router) · React 19 · TypeScript · TailwindCSS v4 · shadcn/ui on `@base-ui/react` · GSAP + ScrollTrigger · npm.

Notable version specifics (see project `CLAUDE.md`): Tailwind v4 (`@import "tailwindcss"`), shadcn `Button` does not support `asChild` (compose `buttonVariants()` with `cn()`), and the edge handler is `proxy.ts` not `middleware.ts`.
