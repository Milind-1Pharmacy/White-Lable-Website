# Platform Documentation

Architecture and flow docs for the config-driven WhiteLabel business-profile website platform. Everything here is derived from the actual code in this repo.

## Contents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — What the platform is, the config-driven philosophy, the render pipeline, the server-component/static-export model, and the tech stack.
- [CONFIG_FLOW.md](./CONFIG_FLOW.md) — Deep dive on the config pipeline: loading, TENANT resolution, compliance filtering, theme CSS variables, SEO metadata, and the config shape.
- [MODULES.md](./MODULES.md) — How sections map to modules, what the dispatcher does (and does not) handle, and the steps to add a new module.
- [COMPLIANCE.md](./COMPLIANCE.md) — The business-profile-safe invariants enforced by `complianceFilter.ts` and `system.json`.
- [ROUTING.md](./ROUTING.md) — App Router structure: site routes, legal pages, the preview routes + TENANT gating, the `proxy.ts` edge handler, and static export.
- [MOTION.md](./MOTION.md) — The GSAP + ScrollTrigger animation system and its hard rules.
- [MULTI_TENANT.md](./MULTI_TENANT.md) — Tenancy model: the TENANT env, per-tenant configs and npm scripts, asset conventions, and the sync gotcha.

## Quick reference

| Concern | File |
| --- | --- |
| Config loader + tenant resolution | `lib/getConfig.ts` |
| Compliance filter | `lib/complianceFilter.ts` |
| Theme CSS variables | `lib/themeLoader.ts` |
| SEO metadata | `lib/seoBuilder.ts` |
| Animation primitives | `lib/motion.ts` |
| Section dispatcher | `modules/SectionRenderer.tsx` |
| Config types | `types/config.types.ts` |
| System ruleset + allowlist | `configs/system.json` |
| Active tenant config (fallback) | `configs/app_master.json` |
| Edge handler | `proxy.ts` |
| Next config (static export) | `next.config.ts` |
