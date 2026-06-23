# Website Builder — Architecture & Progress

The **1Pharmacy Website Builder** is the in-house authoring app that lets a tenant
compose their site visually and produce an `AppConfig` JSON — the same contract the
render engine consumes. It lives in this repo as the second app described in
[`system-architecture.md`](./system-architecture.md) ("two apps, one repo").

Route: **`/builder`** (in the `app/(builder)` route group, outside `(site)` so it
skips the public Navbar/Footer/StickyCta).

---

## 1. What it is

A guided, single-tenant wizard with a live preview:

```
┌── header: 1Pharmacy logo · tenant chip · DRAFT · Saving/Saved · Preview · Publish ──┐
│ ┌────────────┐ ┌───────────────────────────┐ ┌────────────────────────────────────┐ │
│ │ left nav   │ │ editor (fields for step / │ │ LIVE PREVIEW                       │ │
│ │ stepper:   │ │ selected section)         │ │  ┌─ DESKTOP (real modules, iframe) │ │
│ │ Identity   │ │  · text/area/color/upload │ │  └─ MOBILE 375 (real modules)      │ │
│ │ Branding   │ │  · tags/toggle/rich       │ │  view toggle: All · Desktop · Mob  │ │
│ │ SEO        │ │  · services/group/note    │ │  zoom: − % + · reset               │ │
│ │ Sections ◀ │ │ Sections canvas:          │ │                                    │ │
│ │ Contact    │ │  drag-reorder cards,      │ │                                    │ │
│ │ Legal      │ │  add/duplicate/delete     │ │                                    │ │
│ └────────────┘ └───────────────────────────┘ └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

The builder edits an **in-memory `AppConfig` draft** (seeded with the UrMedz tenant).
There is no backend yet — autosave and Publish are simulated (the success screen and
`<slug>.1pharmacy.site` URL are placeholders). Backend wiring (`GET/PUT /tenant_config`,
S3 uploads, real publish/build) is out of scope per the architecture doc.

---

## 2. File map (`app/(builder)/`)

| File | Role |
|---|---|
| `layout.tsx` | Full-screen shell for the group; injects the `wb-spin`/`wb-pulse` keyframes. |
| `builder/page.tsx` | `"use client"` entry; mounts `<WebsiteBuilder/>`. |
| `builder/WebsiteBuilder.tsx` | The whole builder: state, header, nav stepper, editor fields, sections canvas, footer nav, preview pane, picker/publish/preview-sheet overlays, GSAP animations, autosave + publish simulation, and the preview **scale/fit** logic. |
| `builder/builderData.ts` | `STEPS`, `TYPES`, `PICKER_ORDER`, `CORE`, `DEFAULTS(type)`, and `INITIAL()` (a valid `AppConfig` draft seeded as UrMedz, incl. `branding.stylesheet`). |
| `builder/preview.tsx` | `BuilderPreview` — maps the active step / selected section to the **real** `modules/*.tsx` and renders them inside `PreviewFrame`. |
| `builder/PreviewFrame.tsx` | The isolated `<iframe>` that styles the real modules with the tenant CSS. |
| `builder/icons.tsx` | Inline SVG icon set + `icon(name,size,sw)` helper. |

---

## 3. The preview — the important part

The preview is a **true ditto of the live site**: it renders the *actual* section
modules (`Hero`, `About`, `Services`, `Stats`, `Savings`, `Team`, `Faq`, …) — not
hand-written approximations — styled by the *actual* tenant stylesheet.

### Why an iframe
The tenant stylesheets (`public/urmedz.css` ~3.6k lines, `public/aarav_pharmacy.css`
~3.9k lines) style **global** selectors (`body`, `*`, `.btn`, `.section`, `.hero`).
Loaded onto the builder page directly they would restyle the builder chrome. So each
preview frame is an **`<iframe>`** that owns its own document — zero CSS bleed, and the
modules render exactly as they do live.

### How `PreviewFrame` works
1. On mount, writes a base document with a `<base href={origin}/>` (so module image
   paths like `/urmedz/hero.png` resolve against the app origin).
2. Injects into the iframe `<head>`:
   - the tenant stylesheet `<link href={branding.stylesheet}>` (e.g. `/urmedz.css`),
   - Google Fonts (Instrument Serif + Geist + JetBrains Mono),
   - a colour-override `<style>` that re-maps `--accent`/`--ink`/`--cream`/`--mute`/
     `--line` + the six `--brand-*` from the **draft's** `branding.colors`, so the
     Branding step's colour picker drives the preview instead of the sheet's `:root`.
3. Sets **`data-tenant="<slug>"`** on the iframe `<html>` (derived from the stylesheet
   filename). The tenant CSS scopes its font bridge to `[data-tenant="…"]`, so this is
   required for the serif display font to resolve.
4. Renders the real modules into the iframe `<body>` via `ReactDOM.createPortal` — they
   stay live React components with the draft's `data`.
5. Measures `body.scrollHeight` (ResizeObserver on the body + `fonts.ready` + timed
   retries) and sets the iframe **element height** to it, so the frame shows the whole
   section (an iframe defaults to 150px and would otherwise clip the content).

### Frames, fit & zoom (in `WebsiteBuilder.tsx`)
- Two frames: **Desktop** (canvas width 1040) and **Mobile** (width 375, content-driven
  height). A view toggle switches **All / Desktop / Mobile**.
- `previewScale` is derived from the measured frame heights + the pane box, fitting the
  visible frame(s) into the pane (**width AND height**) so nothing overflows at 100%.
  In *All* view the two frames stack (desktop above mobile) and share one scale.
- The frame is `transform: scale(previewScale)` (× the user zoom factor).
- The pane is `overflow: auto`, so at 100% everything fits without scrolling, and
  **zooming in lets you scroll** to the overflow.

---

## 4. Schema mapping (builder ↔ real modules)

The builder edits the real `AppConfig` shape (`types/config.types.ts`):

- **Hero/About/Services** are fixed `content.{hero,about,services}` (the "CORE" blocks),
  not entries in `sections[]`.
- The **Sections canvas** edits `content.sections[]` — each `{ type, data }`.
- Rich headings round-trip into `headlineRich.parts` / `about.title` / each section
  `heading` (the rich fragment editor); the plain `headline` string is kept in sync.
- `hero.cta` is a `SafeActionCta` (`{label, type:"safe-action"}`); the secondary CTA is
  `hero.secondaryCta`.
- Compliance is mirrored in the UI only (payments/cart toggles locked off, safe-CTA
  hint); real enforcement stays in `lib/complianceFilter.ts` at build time.

### Section types offered
Mirrors what the live sites actually use (`urmedz` + `aarav`):
`appStrip · stats · savings · videoFeature · team · features · categories · howItWorks · faq`.
`DEFAULTS(type)` seeds each with realistic pharmacy copy.

---

## 5. The aarav merge (render engine)

The live aarav tenant was ahead of `main` in its worktree; its additions were merged so
the builder can render that look too:

- **`modules/Categories.tsx`** — the interactive categories section.
- **`types/config.types.ts`** — `CategoryItem`, `CategoriesSectionData`, `categories`
  added to `SectionType`/`Section`, `ServiceItem.icon?`, `NavLink.external?`.
- **`modules/SectionRenderer.tsx`** — `categories` dispatch case (dynamic import).
- Refined modules (generic aria-labels, min-height tweaks, Services icon support):
  `About, AppStrip, Faq, Gallery, Hero, HowItWorks, Services, Team`.
- **`public/aarav_pharmacy.css`** + `public/aarav_pharmacy/**` assets.

These are additive — existing render-engine routes (`/`, `/about`, `/preview/*`,
legal pages) are unaffected.

---

## 6. Progress log

| Done | Item |
|---|---|
| ✅ | Builder page ported from the Foundry design to React 19 + the real `AppConfig`. |
| ✅ | Renamed to **1Pharmacy Website Builder**; primary colour `#2E6ACF` (white theme). |
| ✅ | Zoom **+/−** buttons + % indicator + reset; pane scrolls when zoomed/overflowing. |
| ✅ | Section set + `DEFAULTS` reseeded to the **real** live pharmacy sections (incl. categories). |
| ✅ | aarav components + CSS + assets merged into `main`. |
| ✅ | Preview rewritten to render the **real modules** in an isolated **iframe** + tenant CSS. |
| ✅ | Iframe: `<base href>`, `data-tenant`, font + colour-override injection, content-height sizing. |
| ✅ | Desktop **and** mobile (375px) frames; All/Desktop/Mobile toggle; fit-to-box scaling. |
| ✅ | Fixed: empty-space, mobile overflow, `border`/`borderColor` console warning. |

### Known follow-ups / out of scope
- Backend: `GET/PUT /tenant_config`, S3 presigned uploads, real Publish → build trigger.
- Real image uploads (the `upload` field is a visual dropzone only).
- Item-level editors for every section type (currently eyebrow + heading inline; the rest
  is deferred to "the full editor").
- Let the Branding step switch `branding.stylesheet` (urmedz ↔ aarav) so the preview look
  follows the chosen tenant theme.
- Auth / single-tenant resolution from a session token.

---

## 7. Run & verify

```bash
npm run dev      # → http://localhost:3000/builder/
npm run lint     # clean
npm run build    # /builder exports statically; render-engine routes unaffected
```

In the preview, sections render as their real components: Stats = dark navy count-up,
Savings = cream card carousel with the serif % pill, Team = coloured department cards,
Hero = the 2-column grid with the slide carousel. Editing Branding colours updates the
preview live (the picker overrides the stylesheet's `:root`).

> Note: headless Chrome renders iframe images/webfonts unreliably; verify visually in a
> real browser.
