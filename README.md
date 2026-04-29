# WhiteLabel Business Profile Platform

A config-driven Next.js (App Router) platform that generates compliant, SEO-friendly business profile websites from a single JSON file. Swap `configs/app_master.json` and you have a new tenant — no component changes.

## Stack

Next.js (App Router) · TypeScript · TailwindCSS · shadcn/ui · npm.

## Bootstrap

The Next.js app has not been initialized in this directory yet. To scaffold it:

```bash
npx create-next-app@latest . --ts --app --tailwind --eslint --use-npm
npx shadcn@latest init
```

Then preserve the existing `configs/`, `CLAUDE.md`, and this `README.md` while adding the directories listed in [`CLAUDE.md`](./CLAUDE.md) (`modules/`, `lib/`, `types/`, etc.).

## Common commands (after bootstrap)

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Config

- [`configs/app_master.json`](./configs/app_master.json) — the active tenant's content, branding, contact, feature flags, and compliance settings. **All tenant changes happen here.**
- [`configs/system.json`](./configs/system.json) — architecture defaults, the section allowlist, and the compliance ruleset. Tenant-agnostic.

## Architecture

See [`CLAUDE.md`](./CLAUDE.md) for the config flow, compliance invariants, section mapping, and the rules for adding a new module.
# White-Lable-Website
