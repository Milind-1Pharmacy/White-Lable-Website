# Modules & Section Dispatch

How config sections map to React modules, what the dispatcher handles, and how to add a new section type.

## Two kinds of sections

The home page (`app/(site)/page.tsx`) splits rendering into two groups:

1. **Fixed top-of-page modules**, rendered explicitly by the page from dedicated config fields:
   - `Hero` ← `content.hero`
   - `AppStrip` ← the first `appStrip` section (pulled out of the list)
   - `About` ← `content.about` (only if it has content)
   - `Services` ← `content.services` (only if non-empty)
2. **Everything else** in `content.sections[]`, dispatched in order by `SectionRenderer`.

So `hero`, `about`, and `services` exist on the system allowlist but are **not** handled by the dispatcher's `switch` — they're rendered directly. `appStrip` is dispatcher-capable but the home page extracts it to render near the top. The `/preview/[slug]` route passes the full `sections[]` list (including any `appStrip`) straight to `SectionRenderer`.

## Dispatch table

`modules/SectionRenderer.tsx:68` maps `section.type` → module:

| Config `type`  | Module                       | Loading          |
| -------------- | ---------------------------- | ---------------- |
| `features`     | `modules/Features.tsx`       | static import    |
| `howItWorks`   | `modules/HowItWorks.tsx`     | static import    |
| `gallery`      | `modules/Gallery.tsx`        | static import    |
| `stats`        | `modules/Stats.tsx`          | `next/dynamic`   |
| `savings`      | `modules/Savings.tsx`        | `next/dynamic`   |
| `videoFeature` | `modules/VideoFeature.tsx`   | `next/dynamic`   |
| `appStrip`     | `modules/AppStrip.tsx`       | `next/dynamic`   |
| `faq`          | `modules/Faq.tsx`            | `next/dynamic`   |
| `aiStore`      | `modules/AIStore.tsx`        | `next/dynamic`   |
| `team`         | `modules/Team.tsx`           | `next/dynamic`   |
| _(unknown)_    | `null`                       | —                |

Below-the-fold modules are lazy-loaded via `next/dynamic` to keep initial JS small. `appStrip` and `team` also receive `branding` for brand-aware rendering.

Modules rendered outside the dispatcher: `Hero.tsx`, `About.tsx`, `Services.tsx`, plus `RichHeading.tsx` (a shared helper for `parts[]` headings, not a section).

> Note: `system.json`'s `sectionAllowlist` and `sectionMapping` also list `testimonials` (→ `modules/Testimonials.tsx`), but there is no `Testimonials.tsx` module and no `testimonials` case in the dispatcher, so a `testimonials` section currently renders nothing (`default → null`).

## What each module renders

- **Hero** — headline (plain or rich), tagline, primary/secondary CTA, optional proof, slides, meta stats, rail badges.
- **About** — eyebrow, rich title, lede/description, and "pillar" items.
- **Services** — service cards (title, description, thumbnail) plus optional `servicesMeta` heading/CTA.
- **Features** — heading + a list of feature items.
- **HowItWorks** — numbered steps + optional CTA.
- **Gallery** — image grid with captions.
- **Stats** — headline + animated stat items.
- **Savings** — comparison items, a receipt-style ledger, and an optional video.
- **VideoFeature** — poster/video with a heading and marquee.
- **AppStrip** — app-download band (logo, App Store / Google Play links).
- **Faq** — accordion of question/answer items.
- **AIStore** — tiled feature grid with optional per-tile media.
- **Team** — quote/signature, department breakdown, credentials.

(Exact props are the `*SectionData` types in `types/config.types.ts`.)

## The "render nothing if data missing" rule

Every module must render `null` (not throw, not error) when its data is absent or empty. This is what makes the partial-config invariant hold (see [CONFIG_FLOW.md](./CONFIG_FLOW.md#graceful-degradation)). The dispatcher reinforces it: empty `sections` and unknown types both return `null`.

## Adding a new module

Verified against the codebase, the steps are:

1. **Define the data shape** in `types/config.types.ts`: add a `<Name>SectionData` type, add the literal to the `SectionType` union, and add a member to the `Section` union (`{ type: "<name>"; data: <Name>SectionData }`).
2. **Create the module** under `modules/<Name>.tsx` exporting a (server by default) component that takes its `data` slice as props and renders `null` when empty.
3. **Register it in the dispatcher** `modules/SectionRenderer.tsx`: import (static or `next/dynamic` if below the fold) and add a `case "<name>":` to the `switch`.
4. **Add the type to the allowlist** in `configs/system.json` (`sectionAllowlist`, and `sectionMapping` for documentation) — otherwise `complianceFilter` strips it before it reaches the dispatcher.
5. **Add an example** to `configs/app_master.json` (and any tenant config) so the section actually renders.

Skipping step 4 is the common failure: the section is silently filtered out by compliance. See [COMPLIANCE.md](./COMPLIANCE.md#section-allowlist).
