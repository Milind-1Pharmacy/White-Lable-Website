# White-Label Platform: Architecture & Data Flow

**Audience:** anyone who needs the end-to-end picture — how a tenant's site is authored, stored, built, and
served. For the exact JSON shape, see the companion **[Builder → Render Engine: Config Reference](./builder-config-reference.md)**.

**One sentence:** A customer authors their site in the **form-builder app (in this repo)** → Submit POSTs the
`AppConfig` JSON to **your backend** (the single source of truth) → the **render-engine app (also in this repo)**
fetches it back at **build time** → exports a static site → uploads it to that tenant's **bucket**. The live
site never calls back.

**This repo holds two apps (monorepo-style):**

1. **Form-builder app** — the authoring UI the customer uses. Its only output is an `AppConfig` JSON, which it
   POSTs to your backend on Submit.
2. **Render-engine app** — the existing site renderer. At build time it fetches one tenant's `AppConfig` from
   the backend and produces a static export.

They **deploy separately** but live in one repo and **share the same `AppConfig` types** (`types/config.types.ts`)
— one definition, no drift between builder output and renderer input.

**No CMS.** Sanity / Contentful are intentionally not used: the form-builder is built in-house in this repo, so
a CMS would only be a redundant second copy of the same JSON. Your backend/DB owns content; your object store
(S3) owns images.

**One tenant per user.** Each user account owns **exactly one** tenant site (a 1:1 mapping, `user → slug`).
There is no multi-site dashboard or site-picker: after login the user goes straight into *their own* builder.
The backend resolves the tenant slug from the authenticated user, so the builder and every API call are always
scoped to that single tenant. (Multi-tenant-per-user is explicitly out of scope.)

---

## 1. The four stages at a glance

```
  AUTHOR (this repo)      PERSIST (external)        BUILD (this repo)        SERVE
┌──────────────┐  Submit ┌──────────────┐  trigger ┌───────────────┐ upload ┌──────────┐
│ Form-builder │───────▶ │ Your backend │ ───────▶ │ Render engine │ ─────▶ │ Tenant   │
│ app          │ POST    │ + DB (truth) │  build   │ app           │  out/  │ bucket   │
│              │AppConfig│ images → S3  │          │ next build    │        │ (static) │
└──────────────┘         └──────────────┘          └───────────────┘        └──────────┘
     ▲                          │                          │                      │
  customer               read API  ◀──── GET /tenant_config/:slug ──────────┘      │
  (your auth)            /tenant_config/:slug                                  visitors

  └──────────── one repo, shared types/config.types.ts ───────────┘
```

| Stage | Owner | Holds | Produces |
|---|---|---|---|
| 1. Author | **Form-builder app (this repo)** | form state | an `AppConfig`-shaped JSON |
| 2. Persist | Your backend/DB *(external)* | the canonical JSON per tenant; images in S3 | a read API + a build trigger |
| 3. Build | **Render-engine app (this repo)** | nothing — fetches per build | static HTML (`out/`) |
| 4. Serve | Bucket (S3 + CDN) | the static site | the live website |

---

## 2. Stage 1 — Author (form-builder app, in this repo)

- Customer logs in (your auth, your user accounts — not CMS seats) and opens the **form-builder app**.
- The builder renders the authoring UI:
  - Fixed fields mirror `AppConfig`: `tenant`, `branding` (logo + 6 colors), `seo`, `content.hero`,
    optional `about` / `services`.
  - **`sections[]`** is the page-builder canvas: **Add Section → pick 1 of 11 types → fill that type's
    fields → drag to reorder / remove.** (Field-by-field spec: see the Config Reference, Part 3.)
  - Headings use the **RichHeading** editor (`parts[]` with `italic` / `accent` / line-break).
  - **Image uploads** go to **your object store (S3)**; the form stores the returned CDN **URL string**.
- The builder's output **is** a single `AppConfig` JSON object — the contract in `builder-config-reference.md`.
- On **Submit**, the builder `POST`s that JSON to your backend.

> The form-builder and the render engine share `types/config.types.ts`, so the JSON the builder emits is, by
> construction, exactly what the renderer consumes.

---

## 3. Stage 2 — Persist (your backend / DB = source of truth, external)

The backend is the **only** component outside this repo. On receiving the Submit `POST`, it:

1. **Validates** the payload against `types/config.types.ts` (reject malformed configs).
2. **Stores** the `AppConfig` JSON in the DB, keyed by **tenant slug** (e.g. `slug = "tenant-x"`).
3. Confirms images live in S3 and the JSON references their **absolute CDN URLs**.
4. **Triggers a build** for that tenant (see Stage 3).

The backend exposes a **read API** the render-engine app calls at build time:

| Route | Returns |
|---|---|
| `GET /tenant_config/:slug` | that tenant's full `AppConfig` JSON, or `404` |
| `GET /tenant_config/list` *(optional)* | `[{ slug, name, category, colors, logo }]` — for the `/preview` index |

> **Compliance is NOT the backend's job.** The render engine re-applies `lib/complianceFilter.ts` after
> fetching, so unsafe CTAs, payments/cart, and the disclaimer are enforced no matter what the backend returns.

---

## 4. Stage 3 — Build (render-engine app, in this repo)

A CI job runs per tenant: `TENANT=<slug> CONFIG_API_URL=<backend> next build`.

Data path inside the engine (only the **source** differs from today; shape is unchanged):

```
process.env.TENANT  ─┐
CONFIG_API_URL ──────┤
                     ▼
  lib/getConfig.ts → loadAppConfig(slug)
        ├─ CONFIG_API_URL set? → lib/configSource.ts → GET /tenant_config/:slug → AppConfig
        └─ else / on 404      → readJson("configs/<slug>.json")   (local dev + safety net)
                     │
                     ▼
  applyCompliance(rawApp, system)      ← lib/complianceFilter.ts (server-side, unbypassable)
                     │
                     ▼
  ResolvedConfig { app, system }  →  cached via React cache()
                     │
        ┌────────────┼─────────────────────────┐
        ▼            ▼                           ▼
  themeLoader    seoBuilder               page/module render
  (CSS vars)     (Metadata)               Hero / About / Services
                                          + SectionRenderer(sections[])
                     │
                     ▼
            next build → static export (out/)
```

- **Only `lib/getConfig.ts` internals change** (plus a new `lib/configSource.ts`). `types/config.types.ts`,
  every file in `app/**` and `modules/**`, and `lib/complianceFilter.ts` are untouched — they already consume
  `AppConfig` through `getConfig()`.
- `configs/system.json` stays a **local file** (it's platform rules, not tenant content).
- `next.config` uses `output: "export"` + `images.unoptimized` (or a CDN loader) + `remotePatterns` for the
  image host, so static output ships to a bucket and backend-returned image URLs load.

---

## 5. Stage 4 — Serve (bucket)

- The build's `out/` directory is uploaded to **that tenant's bucket** (S3 static hosting + CloudFront, or
  equivalent).
- The **live site is fully static** — it does not call your backend, your DB, or any CMS at runtime.
- Re-publishing = customer edits in the form-builder again → Submit → new build → re-upload. (Optionally tie a
  custom domain / subdomain per tenant at the CDN layer.)

---

## 6. Repo layout (two apps, one repo)

| Part | Lives in | Deploys to | Reads/Writes |
|---|---|---|---|
| Render-engine app | this repo (current `app/`, `modules/`, `lib/`) | per-tenant bucket (static) | reads `AppConfig` from backend at build |
| Form-builder app | this repo (separate app/package) | your platform (the authoring product) | writes `AppConfig` to backend on Submit |
| Shared `AppConfig` types | `types/config.types.ts` | — | imported by both apps |

> Both apps share the repo and the type definitions; they are built and deployed independently.

---

## 7. Source-of-truth map

| Concern | Lives in | Notes |
|---|---|---|
| Tenant content (`AppConfig`) | **Your backend/DB** | canonical; one record per slug |
| Tenant images | **Your S3** | JSON stores CDN URLs |
| Platform rules (`system.json`, allowlist, compliance) | **This repo** | not tenant-specific |
| The `AppConfig` TypeScript shape | `types/config.types.ts` | canonical; shared by both apps |
| Compliance enforcement | `lib/complianceFilter.ts` | runs at build, after fetch |
| Rendered site | **Bucket** | static, immutable until next build |

---

## 8. What this repo changes (summary)

1. New **form-builder app** in the repo — authoring UI; POSTs `AppConfig` to the backend on Submit.
2. New `lib/configSource.ts` — `fetchAppConfig(slug)` → `GET ${CONFIG_API_URL}/tenant_config/:slug`.
3. `lib/getConfig.ts` — swap data source to backend-first, local-JSON fallback; keep all three function
   signatures and `applyCompliance` / `cache()` exactly as-is.
4. `next.config` (render engine) — enable static export + image config for bucket hosting.

Out of scope: the backend/DB + read API (external), and CI/deploy/bucket provisioning. Those are documented
here as **contracts**, not built in this repo.

---

## Verification (for the implementation that follows this doc)

1. **Local fallback:** `CONFIG_API_URL` unset → `npm run dev` / `TENANT=<slug> npm run build` read
   `configs/*.json` and render as today.
2. **Backend parity:** stub `GET /tenant_config/<slug>` with the current JSON → `TENANT=<slug> CONFIG_API_URL=<stub>
   next build` → diff HTML of `/`, `/about`, `/services`, legal pages vs. the local-JSON build (must match).
3. **Builder → renderer round-trip:** author a config in the form-builder, POST it to the stub backend, build
   from it, confirm the rendered site matches the authored content.
4. **Compliance holds:** unsafe CTA rewritten, payments/cart forced off, disclaimer present — regardless of
   backend output.
5. **Graceful 404:** unknown slug → falls back to `app_master.json` / degrades without crashing.
6. **Static export:** `out/` is produced; images load from the CDN host.

---

## Backend Requirements (what the backend team must implement)

> Stack reference: see **[BEArch.md](./BEArch.md)** — Python 3.9 · AWS Lambda · DynamoDB (single-table) · S3 ·
> session-token auth · REST+JSON envelope. Everything below is expressed against that stack. The backend is
> the **only** component outside this repo; it is the **source of truth** for tenant configs.

### 1. Data model (DynamoDB, single-table)

One config record per tenant. Because it's 1 user : 1 tenant, the slug is derived from the user.

| Attribute | Notes |
|---|---|
| `id` | `TENANT#<slug>` |
| `table` | `TENANT_CONFIG` |
|`cid`|`Company id`|
|`data`|` {table}_{slug}`
| `slug` | tenant slug (unique; also the build target `TENANT=<slug>`) |
| `userId` | the single owning user (enforces 1:1 user→tenant) |
| `tenantConfig` | the full `AppConfig` JSON (matches `types/config.types.ts`) |
| `status` | `draft` \| `building` \| `live` \| `failed` |
|`sortKey`|`{table}_{status}`
| `siteUrl` | the deployed bucket/CDN URL (set after a successful build) |
| `createdOn` | EPOCH|

- **GSI** — keyed on `userId` (→ resolves `cid` / `slug`), so login can resolve "this user's one site" in a
  single lookup. Enforces the 1:1 `user → tenant` mapping.
- `id` = `TENANT#<slug>`, `data` = `{table}_{slug}`, `sortKey` = `{table}_{status}` — the access keys are
  pre-shaped so the record is fetched by a single key lookup.
- The **`tenantConfig`** attribute holds the full `AppConfig` JSON. It is stored pre-shaped (DynamoDB has no
  joins); no per-field querying is needed — the render engine reads the whole `AppConfig` in one item read.

### 2. Endpoints (REST + JSON envelope, `session-token` header)

All responses use the universal envelope: `{ "statusCode": 200, "data": {...} }` /
`{ "statusCode": 400, "error": { "userMessage": "..." } }`.

| Method · Path | Auth | Purpose |
|---|---|---|
| `GET /tenant_config` | session-token | **Builder load** — return the authed user's `tenantConfig` draft (resolve `slug`/`cid` from token; create an empty default on first use). |
| `PUT /tenant_config` | session-token | **Builder autosave / Submit body** — validate + upsert `tenantConfig` for the user's slug. |
| `POST /tenant_config/publish` | session-token | **Submit** — persist, set `status=building`, and trigger the build job (async Lambda). Returns immediately. |
| `GET /tenant_config/status` | session-token | Builder polls this for `status` + `siteUrl` (no WebSocket — use polling or FCM push). |
| `POST /tenant_config/upload-url` | session-token | Return an **S3 presigned URL** so the builder uploads logo/hero/gallery images directly to S3; the returned **public CDN URL** is what goes into the `AppConfig`. |
| `GET /tenant_config/:slug` | service token | **Build-time read** — the render engine fetches the full `AppConfig` by slug. Used by `lib/configSource.ts`. Not user-auth'd; gate with an internal/service token. |
| `GET /tenant_config/list` *(optional)* | service token | Summaries `[{ slug, name, category, colors, logo }]` for the `/preview` index. |

> The user-facing builder talks to the `/tenant_config` routes (the tenant is resolved from the session token,
> so the slug never appears in the path). The render engine reads `/tenant_config/:slug` with a service token at
> build time. Same stored record, two readers.

#### 2a. What the front-end already sends (implemented — handover contract)

The builder's **Publish** button is fully wired on the FE side. The browser does **not** build — it
serializes the draft into a publishable **flavor** and POSTs it; the backend runs the per-tenant build/deploy.
Client code: **`lib/api/publish.ts`** (+ endpoint keys in `lib/api/endpoints.ts`), called from
`app/(builder)/builder/useBuilderState.tsx` → `doPublish()`.

**`POST tenant_config/publish`** — body the builder sends (header: `session-token`):

```jsonc
{
  "slug": "urmedz",              // derived from tenant.name; the build target TENANT=<slug> + bucket name
  "theme": "urmedz",             // chosen in the Branding step → which CSS flavor ships (urmedz | aarav_pharmacy)
  "appConfig": { /* full AppConfig */ }
}
```

The `appConfig` is **render-ready** — the FE already:
- inlines the draft's sections into `content.sections` (the builder's client-only `id`s are stripped);
- bakes the unified block order into `content.order` (`["hero","about","services","section:<i>",…]`);
- pins `branding.stylesheet` to the chosen theme (`/<theme>.css`) — **never** the builder-only `preview.css`.

So the backend can store `appConfig` verbatim as `tenantConfig` (after validation §3). Expected response
(universal envelope): `{ "statusCode": 200, "data": { "status": "building" } }` — fire-and-forget.

**`GET tenant_config/status?slug=<slug>`** — the builder polls every ~2s (no WebSocket). Expected
`data` shape:

```jsonc
{ "status": "queued|building|live|failed", "siteUrl": "https://urmedz.1pharmacy.site", "message": "…" }
```

The builder's publish overlay reacts to this: spinner while `queued|building`, success card + `siteUrl`
on `live`, an error card on `failed`. If the endpoint is unreachable (backend not built yet) the FE shows a
clear "Couldn't publish" message and the builder keeps working — nothing is faked.

> CSS note: the published site ships the **per-flavor** stylesheet (`/urmedz.css`, `/aarav_pharmacy.css`) — a
> minified copy is a backend build-step concern. `public/preview.css` is **builder-only** and must never be
> deployed.

### 3. Validation & compliance (backend's job vs. NOT its job)

- **Backend MUST**: validate the incoming `AppConfig` (stored as `tenantConfig`) against
  `types/config.types.ts` (reject malformed shapes with a `400` + `userMessage`), and enforce that
  `slug` / `userId` / `cid` can't be spoofed (derive them from the session token, never trust the body).
- **Backend does NOT** run business compliance. Unsafe-CTA rewriting, force-disabling cart/payments, and the
  default disclaimer are applied **server-side in the render engine** (`lib/complianceFilter.ts`) at build time.
  The backend stores whatever the builder sends; the engine sanitizes on the way out. (The builder UI *mirrors*
  these rules for UX, but enforcement lives in the engine.)

### 4. Build trigger & deploy (async Lambda, 15-min budget)

`POST /config/publish` kicks an **async Lambda** (background job, ≤15 min) that:

1. Sets `status=building`.
2. Runs the render-engine build for that tenant: `TENANT=<slug> CONFIG_API_URL=<backend> next build`
   (the build calls back to `GET /tenant_config/:slug`).
3. Uploads the static `out/` to that tenant's **S3 bucket** (+ CloudFront).
4. Writes back `status=live` (or `failed`) and `siteUrl`.
5. Notifies the user via **FCM push** and/or the builder's `GET /tenant_config/status` polling.

> Sync request timeout is 25s, so publish must be **fire-and-forget**: respond `202`-style immediately, do the
> build in the async Lambda, report completion out-of-band. This matches BEArch's "async jobs → FCM/polling".

### 5. Constraints carried over from BEArch

- **No WebSocket** → builder polls `GET /tenant_config/status` (or receives FCM push) for build progress.
- **S3 presigned uploads** → images never pass through Lambda bodies; the builder uploads directly, stores the
  CDN URL in the config.
- **Images JPEG/PNG, size-checked on FE** before requesting an upload URL.
- **Session-token auth** on all `/tenant_config` routes; a separate **service token** on `/tenant_config/:slug`
  for the engine.
- **Single-table, pre-shaped** → the whole `AppConfig` is one item read; no joins, no field-level queries.

---

## Appendix — User Flow (form-builder UI)

The end-user is a **single-tenant owner**: one account → one site. The flow is a guided wizard whose steps
follow the `AppConfig` shape, ending in a Submit that deploys their site.

### A. Navigation map

```
  ┌────────────┐   login (your auth)   ┌──────────────────────────────────────┐
  │  Sign in   │ ────────────────────▶ │  Builder (their ONE tenant)          │
  └────────────┘   backend resolves    │  left-nav stepper, autosaves a draft │
                   user → slug          └──────────────────────────────────────┘
                                              │ (no site-picker — 1 user : 1 slug)
   ┌──────────────────────────────────────────┼───────────────────────────────────┐
   ▼            ▼            ▼          ▼       ▼        ▼          ▼         ▼       ▼
 1 Identity  2 Branding  3 SEO     4 Hero   5 About  6 Services 7 SECTIONS 8 Contact 9 Legal
                                  (fixed)   (opt)    (opt)      (canvas)            /Layout
                                              │
                              each step edits one in-memory AppConfig draft
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  Preview    │  renders the draft with the SAME
                                       │ (optional)  │  render modules → WYSIWYG
                                       └─────────────┘
                                              │
                                              ▼ [ Submit / Publish ]
                          POST AppConfig → backend → validate → store(slug) → trigger build
                                              │
                                              ▼
                          ┌─────────────────────────────────────────────┐
                          │ Status screen: "Building…" → "Live"          │
                          │ shows the tenant's bucket/site URL           │
                          └─────────────────────────────────────────────┘
```

### B. Step-by-step (what the user does → what it writes)

| # | Screen | User does | Writes to `AppConfig` |
|---|---|---|---|
| 1 | **Identity** | enters business name + category | `tenant.name`, `tenant.category` |
| 2 | **Branding** | uploads logo / wide logo (→ S3), picks 6 brand colors | `branding.logo`, `branding.logoFull`, `branding.colors.*` |
| 3 | **SEO** | page title, description, keywords, OG image | `seo.*` |
| 4 | **Hero** *(required)* | headline (plain or RichHeading), tagline, image, primary CTA label, optional proof/slides | `content.hero.*` |
| 5 | **About** *(optional)* | description, image, numbered pillars | `content.about.*` |
| 6 | **Services** *(optional)* | add/edit/reorder service cards | `content.services[]` |
| 7 | **Sections** *(the canvas)* | **Add Section → pick 1 of 11 types → fill that type's fields**; drag to reorder, duplicate, remove | `content.sections[]` (each `{type,data}`) |
| 8 | **Contact** | email / phone / address (support-only) | `contact.*` |
| 9 | **Legal & Layout** *(advanced)* | disclaimer; optional nav/footer/legal pages | `compliance.disclaimer`, `layout.*` |

### C. The Sections canvas (Step 7, the core interaction)

```
  [ + Add Section ]
        │ opens a picker of 11 types:
        │   features · howItWorks · gallery · stats · savings ·
        │   videoFeature · appStrip · faq · aiStore · team · categories
        ▼
  pick a type ─▶ builder shows ONLY that type's fields (see Config Reference, Part 3)
        │           e.g. "faq" → eyebrow, heading (RichHeading), items[]{question, answer}
        ▼
  fill ─▶ appends { type, data } to content.sections[]
        │
        ▼
  the section appears as a draggable card in an ordered list:
        ⠿ Features         [edit] [duplicate] [↑↓] [remove]
        ⠿ Gallery          [edit] [duplicate] [↑↓] [remove]
        ⠿ FAQ              [edit] [duplicate] [↑↓] [remove]
```

The order of cards = the render order on the live site.

### D. What happens after Submit (UI ↔ architecture)

1. **Builder** POSTs the assembled `AppConfig` to the **backend** (Stage 2).
2. **Backend** validates against `types/config.types.ts`, stores it under the user's `slug`, and **triggers a
   build**.
3. **Render-engine app** fetches that `AppConfig` (`GET /tenant_config/:slug`), applies compliance, exports static
   HTML (Stage 3).
4. Output is uploaded to the **tenant's bucket** (Stage 4); the **status screen** flips to “Live” and shows the
   URL.
5. **Editing later** = the user re-enters the same builder (their draft is pre-loaded from the stored config),
   changes something, Submits again → re-build → re-upload. Same one slug, every time.

> **Guardrails surfaced in the UI:** the builder should mirror compliance so users aren't surprised — steer CTA
> labels toward safe wording, hide cart/payments toggles (force-off), and treat the disclaimer as
> always-present. Final enforcement still happens server-side in `lib/complianceFilter.ts`.
