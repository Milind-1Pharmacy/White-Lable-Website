# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A **config-driven Next.js (App Router) platform** that generates compliant, SEO-friendly business profile websites from a single JSON file. The same component code serves every tenant — only `configs/app_master.json` changes. The platform is single-tenant today and upgradeable to multi-tenant.

Stack: Next.js (App Router) · TypeScript · TailwindCSS · shadcn/ui · npm.

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

When adding a new section type: define its shape in `types/config.types.ts`, add the mapping in the section dispatcher, and ensure the module renders nothing (not an error) if its data is missing.

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
- **Image optimization** via `next/image` — pull URLs from config, never inline.
- **404 fallback** lives in `app/not-found.tsx`.
- Lazy-load non-critical modules (`next/dynamic`) when they aren't above the fold.

## Project gotchas (Next 16.2 + shadcn base-ui)

- The edge handler file is `proxy.ts` at the repo root and exports `function proxy()` — Next 16.2 renamed `middleware` → `proxy`. Do not bring back a `middleware.ts`.
- This shadcn revision uses `@base-ui/react/button`. The `Button` does **not** support `asChild`. To make a `<Link>` look like a button, compose `buttonVariants(...)` with `cn()` on the link itself (see `modules/Hero.tsx`, `app/not-found.tsx`).
- Tailwind v4 is in use (`@import "tailwindcss"` in `app/globals.css`). Brand colors are CSS variables on `<body>` set via `lib/themeLoader.ts`; reference them as `bg-[var(--brand-primary)]`, etc.

## Adding a new module

1. Add the section's type definition to `types/config.types.ts`.
2. Add the module file under `modules/` and export a server component that takes its config slice as props.
3. Register the type in the section dispatcher (where the mapping table above is implemented).
4. Add the type to the system allowlist in `configs/system.json` so the compliance filter permits it.
5. Update the mock `configs/app_master.json` with an example so the demo renders the new section.
