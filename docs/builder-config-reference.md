# Builder → Render Engine: Config Reference

**Audience:** the team building the separate B2B **website-builder** software, and anyone who needs to understand the exact JSON it must produce.

**What this is.** This repo (`WhiteLabel-Business-Website`) is a **render engine**. It takes one JSON object — an `AppConfig` — and renders a complete, compliant business website from it. The builder's only job is to **produce a valid `AppConfig` JSON**. This document is the contract between the two.

**Source of truth (verified against code):**
- `types/config.types.ts` — the full `AppConfig` shape.
- `lib/complianceFilter.ts` — the rules the engine enforces at render time.
- `configs/system.json` — the section allowlist, unsafe-CTA list, fallbacks, default disclaimer.
- `modules/SectionRenderer.tsx` — how a section `type` is dispatched to a UI module.

> **Branch note.** The `categories` section, `ServiceItem.icon`, and `NavCta.external` currently live on the `docs/aarav-tenant-documentation` branch and are flagged **(aarav)** below. Everything else is on `main`. This doc documents the **superset** so the builder covers both.

---

## Part 1 — The big picture

### 1.1 What the builder outputs

A single JSON object with **8 required blocks** + **1 optional** (`layout`):

```json
{
  "tenant":     { },          // who the site is for
  "branding":   { },          // logo + 6 colors
  "seo":        { },          // page title, description, keywords
  "content":    {             // the page body
    "hero": { }, "about": { }, "services": [ ], "servicesMeta": { },
    "sections": [ ]           // ← the dynamic, ordered list of sections
  },
  "contact":    { },          // email / phone / address
  "features":   { },          // feature flags
  "compliance": { },          // mode + disclaimer
  "layout":     { }           // optional: nav, footer, sticky bar, legal pages
}
```

### 1.2 The two core ideas

1. **Sections are `{ type, data }`.** The body of the page (`content.sections[]`) is an **ordered list**. Each entry is an object with exactly two keys:
   - `type` — which section it is (picked from a fixed list).
   - `data` — the fields for that type. **Different `type` ⇒ different `data` fields.**

2. **Headings are "rich."** Many titles aren't plain strings — they're a `RichHeading` made of styled fragments (`parts[]`), so a heading can mix italics/accent color and line breaks. (See §4.)

### 1.3 Two things that are NOT sections

- `hero`, `about`, `services` are **top-level fields inside `content`** — they render in fixed positions. They are **not** entries in `sections[]`.
- `testimonials` appears in `configs/system.json` but has **no data shape defined** in the type system. **Do not offer it in the builder** until a shape exists.

---

## Part 2 — The builder flow (this is the important part)

### 2.1 Overall flow

```
1. User sets up identity       → tenant.name, tenant.category
2. User sets up branding       → logo upload(s) + 6 color pickers
3. User sets up SEO            → title, description, keywords[], OG image
4. User sets up hero (fixed)   → headline, tagline, image, primary CTA…
5. User optionally adds        → about, services
6. User builds the body:
      ┌─────────────────────────────────────────────┐
      │  [ + Add Section ]                           │
      │      → user picks a TYPE from the list       │
      │      → builder shows ONLY that type's fields │  ← §3 tells you which fields
      │      → user fills them                        │
      │      → builder appends { type, data } to      │
      │        content.sections[]                     │
      │  Sections are reorderable & removable.        │
      └─────────────────────────────────────────────┘
7. User sets contact + disclaimer
8. Builder emits the AppConfig JSON.
```

### 2.2 The section picker

When the user clicks **"Add Section"**, show these **11 choices** (and only these):

| Type | One-liner shown to the user |
|---|---|
| `features` | A grid of feature cards (title + description) |
| `categories` **(aarav)** | An interactive list of categories/tiles |
| `howItWorks` | Numbered steps explaining the process |
| `gallery` | A set of images with captions |
| `stats` | Big numbers / metrics |
| `savings` | A price-savings comparison table |
| `videoFeature` | A video block with a poster + scrolling text |
| `appStrip` | App-store download links |
| `faq` | Expandable question/answer list |
| `aiStore` | Media tiles (image/video) |
| `team` | Team quote + department breakdown |

### 2.3 Field-widget legend

Each field below maps to a specific input widget. Use this legend throughout §3:

| Symbol | Widget | Produces |
|---|---|---|
| **T** | single-line text input | `string` |
| **TA** | multi-line textarea | `string` |
| **RICH** | rich-heading editor (see §4) | `RichHeading` (`{ parts: [...] }`) |
| **IMG** | image upload → returns a path/URL | `string` |
| **COLOR** | color picker | hex `string` |
| **NUM** | number input | `number` |
| **URL** | url input | `string` |
| **LIST<…>** | repeatable rows; **add / remove / reorder**; each row has the listed fields | array |
| **TAGS** | repeatable single strings | `string[]` |
| **BOOL** | toggle | `boolean` |

`✓` = required · `○` = optional.

---

## Part 3 — "Pick a type → show these fields"

This is the heart of the builder. For each section type: the exact fields to render and their widgets. **Every section's heading fields (`heading`, `eyebrow`, `tagline`, etc.) are optional** unless marked `✓`. The **bolded array** is the required content of that section.

### `features`
```
eyebrow      ○  T      small label above the heading
heading      ○  RICH
items        ✓  LIST<                                    ← required
   title         ✓  T
   description    ✓  TA
>
```

### `categories` **(aarav)**
```
eyebrow      ○  T
heading      ○  RICH
tagline      ○  T      subheading line under the heading
items        ✓  LIST<                                    ← required
   title         ✓  T
   icon          ○  IMG    small icon/thumbnail
   description   ○  TA
>
```

### `howItWorks`
```
eyebrow      ○  T
heading      ○  RICH
ctaLabel     ○  T      optional button text
ctaHref      ○  URL
steps        ✓  LIST<                                    ← required
   step          ✓  NUM    step number (1, 2, 3…)
   title         ✓  T
   description   ✓  TA
>
```

### `gallery`
```
eyebrow      ○  T
heading      ○  RICH
images       ✓  LIST<                                    ← required
   src           ✓  IMG
   alt           ○  T      accessibility alt text
   caption       ○  T
>
```

### `stats`
```
eyebrow      ○  T
headline     ○  T      NOTE: plain text here, NOT rich
descriptor   ○  TA
items        ✓  LIST<                                    ← required
   value         ✓  T      e.g. "25"
   suffix        ○  T      e.g. "+"  or  " / day"
   label         ✓  T
   footnote      ○  T
>
```

### `savings`
```
eyebrow      ○  T
heading      ○  RICH
lede         ○  TA
items        ✓  LIST<                                    ← required
   name          ✓  T      e.g. "Diabetes Tablets"
   cat           ✓  T      category/detail line
   ourPrice      ○  NUM
   pct           ✓  NUM    savings percentage
   color         ○  COLOR  bar color
>
ledger       ○  GROUP{ receiptLabel:T, receiptValue:T,
                       averageLabel:T, averageValue:T, footnote:T }
videoPoster  ○  IMG
videoUrl     ○  URL
videoCopy    ○  GROUP{ tag:T, headline:T, ctaLabel:T }
```

### `videoFeature`
```
tag          ○  T
heading      ○  RICH
ctaLabel     ○  T
poster       ○  IMG    video thumbnail
videoUrl     ○  URL
marquee      ○  TAGS   scrolling strip of short words
```
*(No required array — a videoFeature can be just a poster + heading.)*

### `appStrip`
```
heading      ○  RICH
descriptor   ○  TA
logo         ○  IMG
appStoreUrl  ○  URL    Apple App Store link
googlePlayUrl○  URL    Google Play link
```

### `faq`
```
eyebrow      ○  T
heading      ○  RICH
lede         ○  TA
ctaLabel     ○  T
ctaHref      ○  URL
items        ✓  LIST<                                    ← required
   question        ✓  T
   answer          ✓  TA
   learnMoreLabel  ○  T
   learnMoreHref   ○  URL
>
```

### `aiStore`
```
eyebrow      ○  T
heading      ○  RICH
lede         ○  TA
tiles        ○  LIST<     (optional, but a tile-less aiStore renders little)
   image         ✓  IMG
   alt           ○  T
   tag           ○  T
   tagBg         ○  COLOR
   tagColor      ○  COLOR
   videoUrl      ○  URL
   background    ○  T       color or image
>
```

### `team`
```
eyebrow        ○  T
quote          ○  RICH    the team's mission line (rich)
signature      ○  T       e.g. "the UrMedz team"
signatureLabel ○  T       e.g. "Signed,"
logoMark       ○  IMG
departments    ○  LIST<
   code          ✓  T      e.g. "01"
   count         ✓  NUM    e.g. 75
   label         ✓  T      e.g. "Pharmacists"
   role          ✓  T
   bg            ✓  COLOR
   fg            ✓  COLOR
   detail        ✓  TA
>
credentials    ○  LIST<
   label         ✓  T
   value         ✓  T
>
```

---

## Part 4 — The rich-heading editor (`RichHeading`)

Fields marked **RICH** are not plain text. A heading is an **ordered list of styled fragments**:

```json
"heading": {
  "parts": [
    { "text": "Authentic", "br": true },
    { "text": "medicines, " },
    { "text": "fingertip-", "emphasis": "italic" },
    { "text": "fast." }
  ]
}
```

Each **part**:

| Field | Type | | Meaning |
|---|---|---|---|
| `text` | `string` | ✓ | the fragment's words |
| `emphasis` | `"italic"` \| `"italic-accent"` \| `"accent"` | ○ | visual style; omit = normal |
| `br` | `boolean` | ○ | `true` = force a line break **after** this fragment |

**Builder UI:** a repeatable list of fragments — each row a text input + an emphasis dropdown (None / Italic / Italic-accent / Accent) + a "break after" checkbox.

> **Simple mode is fine.** If you don't want a fragment editor yet, take one plain string and emit a single part: `{ "parts": [{ "text": "<the string>" }] }`. The engine renders that correctly.

---

## Part 5 — The top-level blocks (full schema)

### 5.1 `tenant` ✓
| Field | Widget | | Notes |
|---|---|---|---|
| `name` | T | ✓ | Business name, e.g. `"UrMedz"` |
| `category` | T | ✓ | Short descriptor, e.g. `"Pharmacy & Fulfilment"` |

### 5.2 `branding` ✓ — logo + the six colors
| Field | Widget | | Notes |
|---|---|---|---|
| `logo` | IMG | ○ | Square logo mark |
| `logoFull` | IMG | ○ | **Wide ~2:1** lockup logo (don't force a square preview) |
| `stylesheet` | T | ○ | Advanced custom-CSS path; usually omit |
| `colors` | GROUP | ✓ | The 6 colors below |

**`colors`** — collect **all six explicitly** (no auto-deriving):

| Color | Widget | | Engine fallback if omitted |
|---|---|---|---|
| `primary` | COLOR | ✓ | `#111827` |
| `secondary` | COLOR | ✓ | `#6B7280` |
| `background` | COLOR | ✓ | `#FFFFFF` |
| `text` | COLOR | ✓ | `#111827` |
| `accent` | COLOR | ○ | `#1F1E1B` (deeper accent for CTAs/hover) |
| `ink` | COLOR | ○ | `#0F0E0C` (highest contrast) |

These map to CSS variables `--brand-primary … --brand-ink`.

### 5.3 `seo` ✓
| Field | Widget | | |
|---|---|---|---|
| `title` | T | ✓ | Browser/page title |
| `description` | TA | ✓ | Meta description |
| `keywords` | TAGS | ✓ | List of keyword strings |
| `ogImage` | IMG | ○ | Social-share image |

### 5.4 `content.hero` ✓ (top-level, fixed position)
| Field | Widget | | Notes |
|---|---|---|---|
| `headline` | T | ✓ | Plain headline |
| `headlineRich` | RICH | ○ | Styled version (visually overrides `headline`) |
| `tagline` | TA | ✓ | Subheading |
| `image` | IMG | ○ | Hero image |
| `eyebrow` | T | ○ | Small label above headline |
| `cta` | GROUP | ✓ | **Primary CTA.** User types only `label`. Builder always sets `type: "safe-action"`. ⚠️ label is auto-sanitized (§6) |
| `secondaryCta` | GROUP{ label✓:T, href○:URL } | ○ | Secondary button |
| `proof` | TAGS | ○ | Short trust lines |
| `slides` | LIST<image✓:IMG, tag○:T, caption○:T> | ○ | Carousel |
| `meta` | LIST<value✓:T, suffix○:T, label✓:T> | ○ | Inline stats |
| `rail` | GROUP{ liveLabel:T, locationText:T, badgeColors:COLOR[], badgeText:T } | ○ | Live-status rail |

### 5.5 `content.about` ○
| Field | Widget | | |
|---|---|---|---|
| `description` | TA | ✓ *(if `about` present)* | Prose |
| `image` | IMG | ○ | |
| `eyebrow` | T | ○ | |
| `title` | RICH | ○ | |
| `lede` | TA | ○ | |
| `pillars` | LIST<n✓:T, title✓:T, body✓:TA, accent✓:COLOR, meta✓:T> | ○ | Numbered cards |

### 5.6 `content.services` ○ — `LIST<…>`
Each item: `title ✓ (T)`, `description ✓ (TA)`, `image ○ (IMG)`, `icon ○ (IMG)` **(aarav)**.

### 5.7 `content.servicesMeta` ○
Heading above the services grid: `eyebrow○:T`, `heading○:RICH`, `ctaLabel○:T`, `ctaHref○:URL`.

### 5.8 `content.sections[]` ✓
The ordered list of `{ type, data }` from **Part 3**.

### 5.9 `contact` ✓
| Field | Widget | | |
|---|---|---|---|
| `email` | T | ○ | |
| `phone` | T | ○ | |
| `address` | TA | ○ | |
*(Support/enquiry only — never a transactional/order form.)*

### 5.10 `features` ✓
| Field | Widget | | |
|---|---|---|---|
| `enableChat` | BOOL | ✓ | Support chat widget |
| `enableForms` | BOOL | ✓ | Enquiry forms |
| `enablePayments` | — | — | ⚠️ **Always forced `false`** by the engine — hide or disable in the builder |
| `enableCart` | — | — | ⚠️ **Always forced `false`** — hide or disable |

### 5.11 `compliance` ✓
| Field | Widget | | |
|---|---|---|---|
| `mode` | — | — | Builder always sets the literal `"business-profile-safe"` |
| `disclaimer` | TA | ○ | Footer disclaimer. If blank, the engine fills a default |

### 5.12 `layout` ○ (advanced — site renders fine without it)
- `nav` → `links: LIST<label✓:T, href✓:URL>`, `ctas: LIST<label✓:T, href✓:URL, variant○:(primary|ghost|accent), external○:BOOL>`
- `footer` → `headline○:RICH`, `ctaLabel○:T`, `ctaHref○:URL`, `description○:TA`, `addressLabel○:T`, `columns: LIST<heading✓:T, links:LIST<label,href>>`, `bottomTag○:T`
- `stickyCta` → `enabled○:BOOL`, `text○:T`, `ctaLabel○:T`, `ctaHref○:URL`
- `pages` → contact-page copy + legal pages (`disclaimer`, `privacyPolicy`, `termsAndConditions`, `deactivateAccount`) + `notFound`. Each legal page is heading + prose/list blocks. Treat as an advanced/optional area.

---

## Part 6 — Compliance rules the builder must respect

The engine runs `lib/complianceFilter.ts` **before rendering**. The builder should mirror these so users aren't surprised:

1. **Unsafe CTA labels are rewritten.** Only `content.hero.cta.label` is auto-checked. If it equals (case-insensitive) one of:
   `Buy Now`, `Order`, `Order Now`, `Checkout`, `Add to Cart`, `Pay`, `Pay Now`, `Subscribe & Pay`
   → it is replaced with **"Learn More"**. Guide users toward safe wording (this is a non-transactional business profile).
2. **Cart & payments cannot be enabled.** `enablePayments` and `enableCart` are forced `false` no matter what. Don't let users think otherwise.
3. **A disclaimer always renders.** If `compliance.disclaimer` is blank, the engine substitutes its default. Let users override it, but it's optional.
4. **Only allowlisted sections render.** Any section whose `type` isn't supported is silently dropped. The picker should offer only the 11 types in §2.2.
5. **Fixed literals the builder sets (never asks the user):** `content.hero.cta.type = "safe-action"`, `compliance.mode = "business-profile-safe"`.

---

## Part 7 — Worked example (a valid `AppConfig`)

```json
{
  "tenant": { "name": "UrMedz", "category": "Pharmacy & Fulfilment" },
  "branding": {
    "logo": "/uploads/logo.png",
    "logoFull": "/uploads/logo-full.png",
    "colors": {
      "primary": "#0A174C", "secondary": "#F4EFE6", "background": "#FFFFFF",
      "text": "#0A174C", "accent": "#1FAFA6", "ink": "#0A174C"
    }
  },
  "seo": {
    "title": "UrMedz — Authentic Medicines, Delivered",
    "description": "India's most trusted pharmaceutical retail and fulfilment company.",
    "keywords": ["online pharmacy", "medicine delivery", "Bengaluru"],
    "ogImage": "/uploads/og-image.jpg"
  },
  "content": {
    "hero": {
      "eyebrow": "Pharmacy · Est. 2024",
      "headline": "Authentic medicines, fingertip-fast.",
      "headlineRich": {
        "parts": [
          { "text": "Authentic", "br": true },
          { "text": "medicines, " },
          { "text": "fingertip-", "emphasis": "italic" },
          { "text": "fast." }
        ]
      },
      "tagline": "A network of 25 retail stores and same-day fulfilment.",
      "image": "/uploads/hero.png",
      "cta": { "label": "Learn More", "type": "safe-action" },
      "secondaryCta": { "label": "How It Works", "href": "/#services" },
      "proof": ["25+ retail stores", "10,000+ orders daily"]
    },
    "about": {
      "eyebrow": "About UrMedz",
      "description": "We are building India's most trusted pharmaceutical platform.",
      "image": "/uploads/about.jpg"
    },
    "services": [
      { "title": "Retail Stores", "description": "25 neighbourhood pharmacies.", "image": "/uploads/retail.jpg" }
    ],
    "sections": [
      {
        "type": "features",
        "data": {
          "eyebrow": "Why UrMedz",
          "heading": { "parts": [{ "text": "Pharmacy infrastructure, " }, { "text": "done right.", "emphasis": "italic-accent" }] },
          "items": [
            { "title": "Authenticity at the source", "description": "Sourced only from licensed distributors." },
            { "title": "Same-day fulfilment", "description": "Neighbourhood-fast delivery." }
          ]
        }
      },
      {
        "type": "gallery",
        "data": {
          "eyebrow": "Behind the platform",
          "heading": { "parts": [{ "text": "Where care meets craft" }] },
          "images": [
            { "src": "/uploads/shelf.jpg", "alt": "Pharmacy shelves", "caption": "Curated network" },
            { "src": "/uploads/team.jpg", "alt": "Staff at work" }
          ]
        }
      },
      {
        "type": "faq",
        "data": {
          "eyebrow": "Frequently asked",
          "heading": { "parts": [{ "text": "Questions, " }, { "text": "answered.", "emphasis": "italic-accent" }] },
          "items": [
            { "question": "Where do you source medicines?", "answer": "Exclusively from licensed distributors." }
          ]
        }
      }
    ]
  },
  "contact": { "email": "care@urmedz.in", "phone": "+91 80 4567 0049", "address": "Bengaluru 560049" },
  "features": { "enableChat": false, "enableForms": false, "enablePayments": false, "enableCart": false },
  "compliance": {
    "mode": "business-profile-safe",
    "disclaimer": "UrMedz Retail Pvt. Ltd. is a licensed pharmaceutical retail and fulfilment company."
  }
}
```

---

## Part 8 — Minimal valid config

The smallest object the engine renders without error (everything else degrades gracefully):

```json
{
  "tenant":   { "name": "Acme", "category": "Business" },
  "branding": { "colors": { "primary": "#0A174C", "secondary": "#F4EFE6", "background": "#FFFFFF", "text": "#0A174C" } },
  "seo":      { "title": "Acme", "description": "Acme business profile.", "keywords": [] },
  "content":  { "hero": { "headline": "Welcome to Acme", "tagline": "We do good work.", "cta": { "label": "Learn More", "type": "safe-action" } }, "sections": [] },
  "contact":  {},
  "features": { "enableChat": false, "enableForms": false, "enablePayments": false, "enableCart": false },
  "compliance": { "mode": "business-profile-safe", "disclaimer": "" }
}
```

A builder can ship a working site with just: `tenant`, `branding.colors`, `seo`, `content.hero`, `features`, `compliance` — then let the user add everything else progressively.

---

## Quick reference card

| Block | Required? | Key idea |
|---|---|---|
| `tenant` | ✓ | name + category |
| `branding` | ✓ | logo(s) + **6 colors** |
| `seo` | ✓ | title, description, keywords[] |
| `content.hero` | ✓ | headline, tagline, primary CTA |
| `content.about` / `services` | ○ | top-level, fixed position |
| `content.sections[]` | ✓ (can be empty) | ordered `{ type, data }` — **the builder's main canvas** |
| `contact` | ✓ | support-only (no order forms) |
| `features` | ✓ | chat/forms toggles; **cart & payments forced off** |
| `compliance` | ✓ | mode is fixed; disclaimer optional |
| `layout` | ○ | nav/footer/legal — advanced |

**11 section types:** `features` · `categories` (aarav) · `howItWorks` · `gallery` · `stats` · `savings` · `videoFeature` · `appStrip` · `faq` · `aiStore` · `team`.
