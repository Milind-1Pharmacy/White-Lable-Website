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
| `gallery`      | `modules/Gallery.tsx`    |

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

## Project gotchas (Next 16.2 + shadcn base-ui)

- The edge handler file is `proxy.ts` at the repo root and exports `function proxy()` — Next 16.2 renamed `middleware` → `proxy`. Do not bring back a `middleware.ts`.
- This shadcn revision uses `@base-ui/react/button`. The `Button` does **not** support `asChild`. To make a `<Link>` look like a button, compose `buttonVariants(...)` with `cn()` on the link itself (see `modules/Hero.tsx`, `app/not-found.tsx`).
- Tailwind v4 is in use (`@import "tailwindcss"` in `app/globals.css`). Brand colors are CSS variables on `<body>` set via `lib/themeLoader.ts`; reference them as `bg-[var(--brand-primary)]`, etc.
- `<body>` has `suppressHydrationWarning` to silence ColorZilla / similar browser extensions injecting `cz-shortcut-listen` attributes. Don't remove it — the hydration mismatch is from the extension, not the app.
- `Container` is `max-w-7xl` (1280px) with `lg:px-12 xl:px-16` padding. Don't downsize to `max-w-6xl` — gutters become too wide on 1440px+ screens.
- The Hero `<section>` has `overflow-hidden` for the floating decorative blobs. Anything with negative absolute insets (e.g. floating badge tags) outside a child gets clipped — put overlays *inside* the inner rounded card.
- Brand palette has six CSS vars: `--brand-primary`, `--brand-secondary`, `--brand-background`, `--brand-text`, `--brand-accent` (deeper accent for CTAs/hover), `--brand-ink` (highest contrast). All defined in `lib/themeLoader.ts` and `configs/system.json` fallbacks.

## Adding a new module

1. Add the section's type definition to `types/config.types.ts`.
2. Add the module file under `modules/` and export a server component that takes its config slice as props.
3. Register the type in the section dispatcher (where the mapping table above is implemented).
4. Add the type to the system allowlist in `configs/system.json` so the compliance filter permits it.
5. Update the mock `configs/app_master.json` with an example so the demo renders the new section.
