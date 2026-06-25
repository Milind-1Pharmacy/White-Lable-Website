# Backend Requirements — White-Label Website Builder

> **Self-contained handover for the backend builder (human or AI agent).** Read it
> top-to-bottom: it first explains the **frontend architecture you're integrating
> with**, then the exact API contract the frontend already calls, then the
> CodeBuild build/deploy flow. The frontend is **already implemented**; you build the
> backend it talks to. Validate `AppConfig` against `types/config.types.ts` and match
> the request/response shapes exactly — the frontend won't change to fit the backend.
>
> It merges the backend tech stack (SpaceMonk / BEArch), the API contract, and the
> build/deploy contract. The backend is the **only** component outside the frontend
> repo and is the **source of truth** for stored tenant configs.
>
> **Model: backend-oriented deployment.** The frontend repo only knows how to
> *build itself* (a `buildspec.yml` recipe). The backend owns everything about
> *deployment* — which tenant, the build status, writing the config to S3, and
> **triggering** the build via **AWS CodeBuild** (which fetches the config, builds,
> uploads to S3, invalidates the CDN). The frontend holds **no** bucket names or S3
> credentials in code; those are CodeBuild project / backend config. See **§4**.

---

## Frontend architecture (context — what you are integrating with)

> Read this first. It describes the frontend you must integrate with, so the contract
> below is unambiguous. You do **not** modify the frontend; you implement the backend
> it already calls.

### What the frontend is

A **config-driven, multi-tenant website platform** built with **Next.js 16 (App Router),
TypeScript, static export (`output: "export"`)**. It contains TWO apps in one repo:

1. **The render engine** — turns a single JSON object (`AppConfig`) into a complete
   static website (HTML/CSS/JS in an `out/` folder). The *same* component code renders
   every tenant; only the `AppConfig` differs. A build is per-tenant:
   `TENANT=<slug> next build` reads `configs/<slug>.json` (`lib/getConfig.ts`) → `out/`.
2. **The website builder** — a browser authoring UI (`app/(builder)/builder/`). A tenant
   owner fills a guided wizard; it edits an in-memory `AppConfig` draft, autosaves to
   the browser's **localStorage** (NOT to the backend), and on **Publish** POSTs the
   finished `AppConfig` to your backend.

### The one object that flows between us: `AppConfig`

Everything is one JSON object. Its canonical TypeScript shape is
`types/config.types.ts` (581 lines — **the source of truth you validate against**).
Top level:

```ts
type AppConfig = {
  tenant: Tenant;        // { name, category }
  branding: Branding;    // { logo?, logoFull?, theme?, colors{primary,secondary,background,text,accent?,ink?} }
  seo: Seo;              // { title, description, keywords[], ogImage?, siteUrl?, socialProfiles?[] }
  content: Content;      // { hero, about?, services?[], sections: Section[], order?: string[] }
  contact: Contact;      // { email?, phone?, address? }
  features: Features;    // { enableChat, enableForms, enablePayments, enableCart }
  compliance: Compliance;// { mode: "business-profile-safe", disclaimer }
  layout?: Layout;       // { nav, footer, stickyCta, pages{privacyPolicy,termsAndConditions,disclaimer,deactivateAccount,...} }
};
```

`content.sections[]` is a discriminated union — each is `{ type, data }` where `type` is
one of: `features · howItWorks · gallery · stats · savings · videoFeature · appStrip ·
faq · aiStore · team · categories`. `content.order[]` is the render order
(`["hero","about","services","section:<i>",…]`).

**You store this `AppConfig` verbatim** as the `tenantConfig` attribute and build from it.
You do not transform it (the browser already made it render-ready — see §2a).

### What the frontend already implements (you implement the matching server)

The frontend's API client is **fully written** in `lib/api/`. It already speaks your
contract; you just build the endpoints it calls:

| Frontend client file | Calls | You implement |
|---|---|---|
| `lib/api/publish.ts` → `publishTenant()` | `POST {base}tenant_config/publish` | the publish endpoint (§2, §2a) |
| `lib/api/publish.ts` → `getPublishStatus()` | `GET {base}tenant_config/status?slug=` | the status endpoint (§2a) |
| `lib/api/upload.ts` → `uploadImage()` | `POST {base}upload_url?platform=webstore` → then `PUT` to S3 | the presigned-URL endpoint (§2b) |
| `lib/api/endpoints.ts` | endpoint path map + URL builder | (just the paths above) |
| `lib/api/env.ts` | the base URL per environment | (your API host) |

- **Envelope:** the client unwraps `{ statusCode, data }` / `{ statusCode, error:{userMessage} }`.
  Return errors as `{ statusCode: 400, error: { userMessage: "…" } }`.
- **Auth:** the client sends the `session-token` header on every call.
- **Base URL:** chosen in `lib/api/env.ts` (prod/beta/test/… hosts on `apiv2.1pharmacy.io`).

### What the frontend does NOT do (so you know the boundaries)

- **Does not build in the browser** — it only sends `AppConfig`; the build runs server-side (§4).
- **Does not autosave to the backend** — drafts live in localStorage; the backend only
  receives the config on Publish. (There is no `PUT` autosave API.)
- **Does not enforce business compliance at submit** — the builder *mirrors* compliance
  for UX, but real enforcement runs in the render engine (`lib/complianceFilter.ts`) at
  build time, so a tampered config can't bypass it. You only validate the JSON *shape*.

---

## 0. Tech stack (from BEArch)

| What | Tech |
|------|------|
| Language | Python 3.9 |
| Platform | AWS Lambda (Serverless Framework) |
| Region | AWS Mumbai (`ap-south-1`) |
| Sync request timeout | 25 s |
| Async/background job timeout | 15 min (async Lambda) |
| Database | DynamoDB — single-table, no joins, GSIs for access patterns |
| Storage | S3 — images/files; presigned URLs for direct FE upload; public CDN URLs |
| Auth | Custom session tokens (phone + OTP); `session-token` header on every request. No JWT/OAuth |
| Push | Firebase Cloud Messaging (FCM), Android + iOS |
| API style | REST + JSON. **No** GraphQL/gRPC/**WebSocket**. CORS open. Universal envelope |

**Universal response envelope** (every endpoint):
```json
{ "statusCode": 200, "data": { ... } }
{ "statusCode": 400, "error": { "userMessage": "..." } }
```

**Constraints the design must respect:**
- **No WebSocket** → the builder **polls** for build progress (or you push via FCM).
- **Async jobs (15 min)** → publish is **fire-and-forget**: respond immediately, build
  in an async Lambda, report completion out-of-band.
- **NoSQL** → store the whole `AppConfig` pre-shaped; one item read, no field queries.
- **Session-token auth** on all user routes; a **service token** on the build-time read.

---

## 1. Data model (DynamoDB, single-table)

One config record per tenant. It is **1 user : 1 tenant**, so the slug is derived from
the user (no site-picker; login resolves the user's single site).

| Attribute | Notes |
|---|---|
| `id` | `TENANT#<slug>` (partition key) |
| `table` | `TENANT_CONFIG` |
| `cid` | Company id |
| `data` | `{table}_{slug}` (access key) |
| `slug` | tenant slug — unique; also the build target `TENANT=<slug>` and bucket name |
| `userId` | the single owning user (enforces 1:1 user→tenant) |
| `tenantConfig` | the full `AppConfig` JSON (matches `types/config.types.ts`) |
| `status` | `draft` \| `building` \| `live` \| `failed` |
| `sortKey` | `{table}_{status}` |
| `siteUrl` | the deployed bucket/CDN URL (set after a successful build) |
| `createdOn` | EPOCH |

- **GSI on `userId`** → login resolves "this user's one site" in a single lookup;
  enforces the 1:1 mapping.
- `tenantConfig` holds the full `AppConfig` verbatim — stored pre-shaped; the builder-load
  read returns the whole config in one item read (no joins, no per-field queries).
- **For the build**, the same `AppConfig` is also written to a small S3 object
  `s3://<configs-bucket>/<slug>.json` on publish (CodeBuild fetches it — see §4). DynamoDB
  is the source of truth; the S3 copy is the build input.

---

## 2. Endpoints

> **No `PUT` autosave API.** The builder autosaves to the browser's localStorage; the
> backend only needs the routes below. Persistence to the backend happens on **publish**.

| Method · Path | Auth | Purpose |
|---|---|---|
| `GET /tenant_config` | session-token | **Builder load** — return the authed user's `tenantConfig` (resolve `slug`/`cid` from the token; create an empty default on first use). |
| `POST /tenant_config/publish` | session-token | **Publish** — persist `tenantConfig`, set `status=building`, trigger the async build. Returns immediately. |
| `GET /tenant_config/status` | session-token | Builder **polls** this (~2 s) for `status` + `siteUrl`. |
| `POST /upload_url?platform=webstore` | session-token | Return an **S3 presigned PUT URL** so the builder uploads images directly to S3 (see §5 for the exact body/response the client expects). |

> The user-facing builder talks to the `/tenant_config` routes; the tenant is resolved
> from the session token, so the slug never appears in the path. The build runner reads
> the same stored record by slug (see §4).

**`GET /tenant_config` response** (builder load) — universal envelope:
```jsonc
{ "statusCode": 200, "data": {
    "slug": "urmedz",
    "tenantConfig": { /* the stored AppConfig */ },
    "status": "draft|building|live|failed",
    "siteUrl": "https://urmedz.1pharmacy.io"      // null/absent until first live
} }
```
- **First use (no record yet):** create + return a **valid empty `AppConfig`** — i.e. the
  shape the frontend's `BLANK()` factory produces (all fields present but empty: empty
  `tenant.name`, `seo`, `contact`; `content.hero` present with empty strings; empty
  `content.sections`; `theme:"default"`). It must be a structurally valid `AppConfig` so
  the builder and render engine don't choke. **Never return `null`/`{}` for `tenantConfig`.**

**Errors** (every endpoint): return `{ "statusCode": 400, "error": { "userMessage": "…" } }`.
The builder shows `userMessage` verbatim to the user, so make it human-readable.

**CORS:** the builder is a browser app — allow the builder's origin(s), the methods above,
and the `session-token` + `Content-Type` request headers on every `/tenant_config` route
and `/upload_url` (BEArch already runs CORS open).

### 2a. What the frontend already sends (implemented — handover contract)

The Publish button is **fully wired** on the FE side. The browser does **not** build —
it serializes the draft into a render-ready **flavor** and POSTs it. Client code:
`lib/api/publish.ts` (+ keys in `lib/api/endpoints.ts`), called from
`app/(builder)/builder/useBuilderState.tsx` → `doPublish()`.

**`POST /tenant_config/publish`** — body (header: `session-token`):
```jsonc
{
  "slug": "urmedz",            // derived from tenant.name; the build target + bucket name
  "theme": "urmedz",           // colour-theme name (already set in appConfig.branding.theme)
  "appConfig": { /* full, render-ready AppConfig */ }
}
```

`appConfig` is **render-ready** — the FE already inlines `content.sections` (client-only
`id`s stripped), bakes `content.order` (`["hero","about","services","section:<i>",…]`),
and pins `branding.theme`. So the backend stores `appConfig` **verbatim** as
`tenantConfig` (after validation §3).

- **`slug`** — the backend should derive/verify the slug from the **session token**, not
  trust the body value (anti-spoofing, §3). The body `slug` is a hint.
- **`theme`** — already lives inside `appConfig.branding.theme`; the top-level `theme` is a
  duplicate for convenience. The backend does **not** need it for the build (the build only
  uses `appConfig`). Store it or ignore it — it drives no backend logic.
- **Idempotency** — if Publish is clicked twice quickly, **latest wins**: dedupe by slug
  (e.g. ignore/queue a new build while one is already `building` for that slug, or cancel
  the in-flight one). Don't run two concurrent builds for the same tenant.

Expected response: `{ "statusCode": 200, "data": { "status": "building" } }` — fire-and-forget.

**`GET /tenant_config/status?slug=<slug>`** — polled every ~2 s. Expected `data`:
```jsonc
{ "status": "queued|building|live|failed", "siteUrl": "https://urmedz.1pharmacy.io", "message": "…" }
```
- **Status enum:** the stored record uses `draft|building|live|failed`; the status endpoint
  may also return `queued` (an accepted in-flight value the UI treats like `building`).
- **`siteUrl`** is `https://<slug>.1pharmacy.io` (the tenant's bucket/CDN domain — same as
  `BUCKET` in §4). Set it only on `live`.
- The overlay reacts: spinner while `queued|building`, success card + `siteUrl` on `live`,
  an error card showing `message` on `failed`. If the endpoint is unreachable, the FE shows
  "Couldn't publish" and keeps working — nothing is faked.

> The Publish flow runs a front-end **demo animation** by default (no network). To make it
> POST to the backend + poll for real, set **`NEXT_PUBLIC_PUBLISH_API=<backend base URL>`**.
> No code change — it's already wired (`lib/api/publish.ts`, `lib/api/env.ts`).

### 2b. Image upload — exact contract (`lib/api/upload.ts`)

A two-step presigned-S3 upload. The builder does step 1+2; you implement step 1's endpoint.

**Step 1 — the builder requests a presigned PUT URL:**
```
POST  {base}upload_url?platform=webstore        (header: session-token)
body:  { "filename": "<timestamp>_<sanitized-name>.png" }
```
Your response (universal envelope) **must** put the presigned URL at `data.uploadUrl`:
```jsonc
{ "statusCode": 200, "data": { "uploadUrl": "https://<bucket>.s3.amazonaws.com/...&X-Amz-..." } }
```

**Step 2 — the builder PUTs the file bytes directly to that S3 URL** (no backend involved):
`PUT <uploadUrl>` with headers `Content-Type: <file mime>` and `x-amz-acl: public-read`.
The builder then strips the query string → stores the clean public URL in the `AppConfig`.

Notes: the client validates the URL host is S3 (`*.amazonaws.com`) before PUTting; it
only uploads JPEG/PNG/WebP/GIF/SVG and ≤ 8 MB (validated client-side); the presigned URL
must allow a public-read PUT.

---

## 3. Validation & compliance (backend's job vs. NOT its job)

- **Backend MUST**: validate the incoming `AppConfig` against `types/config.types.ts`
  (reject malformed shapes with `400` + `userMessage`), and derive `slug` / `userId` /
  `cid` from the **session token** — never trust the body (anti-spoofing).
- **Backend does NOT** run business compliance. Unsafe-CTA rewriting, force-disabling
  cart/payments, and the default disclaimer are applied **in the render engine**
  (`lib/complianceFilter.ts`) at build time. The backend stores whatever the builder
  sends; the engine sanitizes on the way out. (The builder UI mirrors these rules for
  UX, but enforcement lives in the engine — so a tampered config still can't bypass it.)

---

## 4. Build & deploy — AWS CodeBuild (chosen path)

The build needs Node (`next build`), which the Python Lambda can't run. **We use AWS
CodeBuild** as the build runner: a managed Node machine that builds the tenant's site
and ships it to S3. The Python Lambda's only job is to **trigger** it. No server to
keep up, no Docker. (Free under the 100-min/month CodeBuild tier; ~$0.005/min after —
a tenant build is ~1–2 min, near-instant with the cache.)

**End-to-end sequence:**
```
Browser (builder)        Backend (Lambda)         DynamoDB / S3 configs        CodeBuild              S3 site bucket + CDN
      │  POST /publish        │                          │                         │                        │
      │ {slug,theme,appConfig}│                          │                         │                        │
      ├──────────────────────►│ validate (§3)            │                         │                        │
      │                       ├─ store tenantConfig ─────►│ (status=building)       │                        │
      │                       ├─ put config object ──────►│ s3://configs/<slug>.json│                        │
      │   200 {status:building}                           │                         │                        │
      │◄──────────────────────┤ start_build(slug, S3 URI)─┼────────────────────────►│ install→fetch config   │
      │  GET /status (poll 2s)│                          │                         │  →build→sync out/ ─────►│ (live site)
      │◄─────────────────────►│ (building…)              │                         │  emits Build State Chg │
      │                       │ EventBridge → status Lambda ◄───────────────────────┤ (SUCCEEDED/FAILED)     │
      │                       ├─ status=live, siteUrl ───►│                         │                        │
      │  GET /status → live + siteUrl                     │                         │                        │
      │◄──────────────────────┤  🎉 overlay shows the URL │                         │                        │
```

### What the backend does on `POST /tenant_config/publish`

```
1. validate appConfig (§3); store it as tenantConfig (DynamoDB); set status = "building"
2. write the SAME appConfig to a small S3 object:  s3://<configs-bucket>/<slug>.json
      (the config is too large to pass as a CodeBuild env var — see the box below)
3. respond IMMEDIATELY: { "statusCode": 200, "data": { "status": "building" } }
4. call codebuild.start_build(...) with the slug + the S3 URI (the ONLY build action)
5. (later) when the build finishes → write status = "live" (or "failed") + siteUrl
```

The backend does **not** run `npm` and does **not** upload the site — CodeBuild does both,
by reading `buildspec.yml` from this repo.

> ⚠️ **Do NOT pass the full `AppConfig` as a CodeBuild env var.** A real config (inlined
> sections, legal pages, URLs) exceeds CodeBuild's `start_build` / env-var size limits and
> the call will fail. The config travels via **S3**: the backend writes it to a small
> object and passes only the **slug + S3 URI**; the buildspec downloads it.

### The `start_build` call (Python, boto3)

```python
# Before this, the backend has written the config to S3, e.g.:
#   s3.put_object(Bucket=CONFIGS_BUCKET, Key=f"{slug}.json", Body=json.dumps(app_config))
codebuild.start_build(
    projectName="webstore-tenant-build",          # the CodeBuild project (one-time setup)
    sourceVersion=branch or "main",                # which branch/commit to build (see below)
    environmentVariablesOverride=[
        {"name": "TENANT",        "value": slug},                              # tenant slug
        {"name": "CONFIG_S3_URI", "value": f"s3://{CONFIGS_BUCKET}/{slug}.json"},  # where the config was written
        {"name": "BUCKET",        "value": f"{slug}.1pharmacy.io"},            # tenant's S3 SITE bucket (= live domain)
        {"name": "DISTRIBUTION",  "value": cloudfront_id_or_empty},            # optional CDN id ("" if none)
    ],
)
```

> Only small scalars are env vars (`slug`, S3 URI, bucket, CDN id). The large `AppConfig`
> is fetched from `CONFIG_S3_URI` inside the build.

### Which branch gets built

**Rule: if a branch is specified, build from it; otherwise build from `main`.**

- **Preferred — `sourceVersion`:** pass the branch (or commit SHA / tag) as `sourceVersion`.
  CodeBuild checks it out **before** `buildspec.yml` runs. If you pass nothing/empty, set
  the CodeBuild project's **default source branch to `main`**.
  ```python
  sourceVersion = branch if branch else "main"
  ```
- **Optional fallback — `BRANCH` env var:** the buildspec's `install` phase checks out
  `BRANCH` (before `npm ci`) only if it's set; unset → no-op. Use only if you're NOT
  relying on `sourceVersion`.

For now (engine on a feature branch), pass `sourceVersion="docs/system-architecture-flow"`;
once merged, pass nothing and it builds `main`.

### How the backend learns when it's done — use EventBridge

**Recommended (implement this one):** an **EventBridge rule** on CodeBuild's *"Build State
Change"* event (filter `detail.build-status` ∈ `SUCCEEDED|FAILED`, project =
`webstore-tenant-build`) → a small Lambda that reads the build's `TENANT` env var and
writes `status = live|failed` + `siteUrl = https://<slug>.1pharmacy.io` to DynamoDB.

> No polling-Lambda to keep warm. (Alternative, if you must: the publish handler could
> `codebuild.batch_get_builds([id])` until terminal — but prefer EventBridge.)

The builder is already polling `GET /tenant_config/status`, so once the record flips to
`live` + `siteUrl`, the publish overlay shows the live URL automatically.

### The build recipe — full `buildspec.yml` (verbatim)

CodeBuild reads **`buildspec.yml`** from the checked-out frontend repo root — the backend
does NOT script the build steps. This is the **exact file** (also committed at the repo
root); it is reproduced here in full so this document is self-contained. Env vars it
expects (= what `start_build` passes): `TENANT`, `CONFIG_S3_URI`, `BUCKET`, `DISTRIBUTION`
(and optional `BRANCH`).

```yaml
# buildspec.yml — AWS CodeBuild recipe for building ONE tenant's site.
#
# Backend-oriented: the backend's only job is to (a) write the tenant's AppConfig to
# a small S3 object, then (b) call codebuild.start_build with the slug + bucket. CodeBuild
# runs these phases on a managed Node machine:
#   1. install deps (cached, so only the first build is slow)
#   2. download the tenant's AppConfig from S3 → configs/<slug>.json
#   3. TENANT=<slug> next build  → ./out  (a complete static site)
#   4. upload ./out to that tenant's S3 site bucket + invalidate CloudFront
#
# WHY S3, not an env var: a full AppConfig (inlined sections, legal pages, URLs) easily
# exceeds CodeBuild's env-var / start_build size limits. So the config travels via S3,
# and only small scalars (slug, bucket, …) are passed as env vars.
#
# Which branch is built:
#   PREFERRED — the backend passes `sourceVersion` to start_build (e.g. "main" or a
#   feature branch / commit SHA). CodeBuild checks that out BEFORE this file runs.
#   If sourceVersion is omitted, set the CodeBuild project's default branch to "main".
#   OPTIONAL fallback — pass a BRANCH env var; the install phase checks it out (→ main
#   if unset). Use only if you're NOT relying on sourceVersion.
#
# Env vars the backend passes via environmentVariablesOverride on start_build:
#   TENANT         the tenant slug (e.g. "urmedz") — the build target + config filename
#   CONFIG_S3_URI  s3://<configs-bucket>/<slug>.json — where the backend wrote the AppConfig
#   BUCKET         the tenant's S3 SITE bucket (e.g. "urmedz.1pharmacy.io")
#   DISTRIBUTION   optional — the CloudFront distribution id to invalidate (may be empty)
#   BRANCH         optional — only used by the install-phase fallback below; defaults to main
#
# CodeBuild project settings: source = this repo; image = aws/codebuild/standard
# (Node 20); cache = Local (LOCAL_CUSTOM_CACHE) or S3, so node_modules persists.
#
# NOTE: CodeBuild runs phases in a FIXED order (install → pre_build → build →
# post_build), not file order — so the optional branch checkout lives at the START of
# `install`, BEFORE npm ci.

version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      # OPTIONAL branch checkout — runs FIRST, before npm ci. No-op unless BRANCH is set.
      - |
        if [ -d .git ] && [ -n "${BRANCH:-}" ]; then
          echo "Checking out branch: $BRANCH"
          git fetch --depth 1 origin "$BRANCH"
          git checkout -B "$BRANCH" "origin/$BRANCH"
        else
          echo "Using the source CodeBuild already checked out (sourceVersion / project default = main)."
        fi
      # Skip dev tooling (eslint/vitest) — not needed to build. Cached node_modules
      # makes this near-instant on repeat builds.
      - npm ci --omit=dev

  build:
    commands:
      # Fetch the tenant's AppConfig from S3 (written by the backend before start_build).
      - aws s3 cp "$CONFIG_S3_URI" "configs/$TENANT.json"
      # Build ONLY this tenant. next build reads process.env.TENANT → configs/$TENANT.json
      # (lib/getConfig.ts) and emits a static site to ./out.
      - TENANT="$TENANT" npm run build:tenant

  post_build:
    commands:
      # Ship the static output to the tenant's site bucket.
      - aws s3 sync out/ "s3://$BUCKET/" --delete
      # Invalidate CloudFront if a distribution id was supplied.
      - |
        if [ -n "${DISTRIBUTION:-}" ]; then
          aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths "/*"
        fi

# Cache node_modules between builds so npm ci is near-instant after the first run.
cache:
  paths:
    - 'node_modules/**/*'
```

The buildspec calls `npm run build:tenant`. That script (in the frontend repo's
`package.json`) is a tenant-agnostic build — it relies on the `TENANT` env var the
buildspec sets:

```jsonc
// package.json → scripts (relevant entries)
{
  "build": "next build",                 // default build (app_master fallback)
  "build:tenant": "next build",          // generic per-tenant build; reads process.env.TENANT
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run"
  // (older build:urmedz / sync:urmedz / deploy:urmedz exist for manual local deploys
  //  only — NOT the production path; the backend uses build:tenant + CodeBuild.)
}
```

### One-time CodeBuild project setup (AWS, not code)

- **Source:** this repo (GitHub). Branch via `sourceVersion` on `start_build` (default `main`).
- **Environment image:** `aws/codebuild/standard:*` (Node 20).
- **Cache:** Local (`LOCAL_CUSTOM_CACHE`) or S3 — so `node_modules` persists (`cache:`
  block in `buildspec.yml`).
- **CodeBuild project IAM role:** `s3:GetObject` on the **configs** bucket;
  `s3:PutObject`/`s3:DeleteObject`/`s3:ListBucket` on the tenant **site** buckets;
  `cloudfront:CreateInvalidation`.
- **Lambda (publish handler) IAM role:** `codebuild:StartBuild`, `s3:PutObject` on the
  configs bucket, plus its DynamoDB access.
- **Status Lambda IAM role:** read CodeBuild build (or just the EventBridge event) +
  DynamoDB write.

> Notes: the build reads `configs/$TENANT.json` (fetched from S3); no other network
> except installing deps. Output is `./out`; builder-only files (`public/preview*.css`,
> `public/site-css/preview-overrides.css`) are not part of `out`. `npm ci` runs per
> CodeBuild run but the cache makes it near-instant after the first.

---

## 5. Division of ownership (summary)

| Concern | Owner |
|---|---|
| Build the static site (`next build` → `out/`) | **Frontend repo** |
| Compliance enforcement at build (`complianceFilter.ts`) | **Frontend** (can't be bypassed) |
| `AppConfig` TypeScript shape (`types/config.types.ts`) | **Frontend** (canonical, shared) |
| Receiving Publish, auth, slug resolution | **Backend** |
| Storing `tenantConfig`, status, `siteUrl` (DynamoDB) | **Backend** |
| Writing the config to S3 (`s3://configs/<slug>.json`) for the build | **Backend** |
| **Triggering** the build (`codebuild.start_build` with slug + S3 URI) | **Backend** |
| Updating status→live/failed from the build result (EventBridge → Lambda) | **Backend** |
| Fetching the config, running the build, S3 upload, CDN invalidation | **AWS CodeBuild** (per `buildspec.yml`) |
| The build recipe (`buildspec.yml`) | **Frontend repo** |
| Presigned-upload endpoint (`/upload_url`) | **Backend** |
| Rendered site (static) | **S3 + CloudFront** |
