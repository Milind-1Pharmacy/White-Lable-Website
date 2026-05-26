# Routing

The App Router structure: public site routes, legal pages, the internal preview routes and their TENANT gating, the edge handler, and the static-export model.

## Route tree

```
app/
├─ layout.tsx                  Root layout: fonts, theme vars, MotionProvider, base metadata
├─ globals.css                 Tailwind v4 entry
├─ icon.png / apple-icon.png   App icons
├─ (site)/                     Public site (route group — no URL segment)
│   ├─ layout.tsx              Navbar + Footer + StickyCta + StructuredData, theme wrapper
│   ├─ page.tsx                "/"  home
│   ├─ about/page.tsx          "/about"
│   ├─ services/page.tsx       "/services"
│   ├─ contact/page.tsx        "/contact"
│   ├─ privacy-policy/page.tsx "/privacy-policy"
│   ├─ terms-conditions/page.tsx     "/terms-conditions"
│   ├─ disclaimer/page.tsx     "/disclaimer"
│   ├─ deactivate-account/page.tsx   "/deactivate-account"
│   └─ not-found.tsx           404 within the site group
└─ preview/                    Internal tenant previews (noindex)
    ├─ page.tsx                "/preview"  index grid of all tenants
    └─ [slug]/
        ├─ layout.tsx          Per-tenant theme frame; 404 if slug invalid
        └─ page.tsx            "/preview/<slug>"  full render of one config
```

The `(site)` group keeps the public layout (navbar/footer/sticky CTA) separate from the preview layout without adding a URL segment.

## Legal & required pages

`system.json` → `routing.requiredPages` lists the pages every tenant must have: `/`, `/about`, `/services`, `/contact`, `/privacy-policy`, `/terms-conditions`, `/disclaimer`. These pages always exist as routes regardless of tenant config; their copy comes from `layout.pages.*` and degrades gracefully when fields are missing (rendered via `LegalArticle`). `/deactivate-account` is an additional legal/account page present in the route tree.

> The actual route segment is `terms-conditions` (matching `routing.requiredPages`), not `terms-and-conditions`.

## Home page assembly

`app/(site)/page.tsx` loads config via `getConfig()`, renders `Hero`, an optional `AppStrip`, `About` (if it has content), `Services` (if non-empty), then dispatches the remaining `content.sections[]` through `SectionRenderer`. See [MODULES.md](./MODULES.md).

## Preview routes & TENANT gating

- `/preview` (`app/preview/page.tsx`) — internal index listing every non-reserved tenant config via `listConfigs()`. `force-static`, `robots: noindex`.
- `/preview/[slug]` (`app/preview/[slug]/page.tsx`) — renders one tenant config loaded by `getConfigBySlug(slug)`; `notFound()` if the slug is invalid/missing. Marked `robots: { index: false, follow: false }`.
- `generateStaticParams()` returns one entry per config from `listConfigs()`, and `dynamicParams = false` so only pre-listed slugs are emitted.

**Gating gotcha:** `listConfigs()` reads whatever `*.json` files are in `configs/` at build time. A plain build (no `TENANT`) therefore emits `/preview/*` pages for **all** tenants. A `TENANT`-scoped build should be paired with limiting which config files are present so the build emits only that tenant's preview. See [MULTI_TENANT.md](./MULTI_TENANT.md).

## Edge handler

`proxy.ts` at the repo root is the Next 16.2 edge handler (the framework renamed `middleware` → `proxy`; do **not** add a `middleware.ts`). `proxy()` sets hardening headers on every matched response:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

The matcher `/((?!_next/static|_next/image|favicon.ico).*)` skips static assets.

## Rendering & export

- Pages/layouts export `revalidate = 3600` (hourly ISR intent).
- `next.config.ts` sets `output: "export"` → a static HTML build in `out/` for S3 + CloudFront. `images.unoptimized: true` (no serve-time Node runtime); `trailingSlash: true` so `/about` → `/about/index.html`. Because of static export, content updates ship via rebuild + sync rather than runtime revalidation.
- `app/(site)/not-found.tsx` is the 404 fallback, with copy from `layout.pages.notFound`.
