/**
 * @file validationSchema.ts
 * @description THE single source of truth for all Website Builder content validation:
 *  per-field character limits, per-section item min/max counts, required fields, and
 *  URL rules. Every editor field, item list, and the publish gate read from here — no
 *  validation logic is hardcoded in components. To change any limit, edit ONLY this file.
 *
 *  Char-limit VALUES are sensible defaults tuned to keep the UI clean across
 *  mobile/tablet/desktop; override them in TEXT_LIMITS without touching any component.
 * @responsibilities
 *  - TEXT_LIMITS: max character count per text-field id.
 *  - SECTION_RULES: per-section array (min/max), required fields, text-field→limit maps,
 *    item-level text-field→limit maps, and URL field rules.
 *  - URL_RULES: host/scheme patterns for store + video URLs.
 *  - validateDraft(): the one function the publish gate + completion meter call.
 * @dependencies @/lib/safeUrl, @/types/config.types
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */
import { safeHref, safeSrc } from "@/lib/safeUrl";
import type { AppConfig } from "@/types/config.types";

/* ────────────────────────────────────────────────────────────────────────────
 * 1. TEXT CHARACTER LIMITS — one entry per logical field type.
 *    Values are defaults; tune freely. Components reference these by id only.
 * ──────────────────────────────────────────────────────────────────────────── */
/** A character-length limit: a hard `max`, and an optional advisory `min`. */
export type CharLimit = { max: number; min?: number };

export const TEXT_LIMITS = {
  eyebrow: { max: 40 },
  badge: { max: 24 },
  sectionTitle: { max: 80, min: 6 },
  sectionSubtitle: { max: 120, min: 10 },
  description: { max: 200, min: 20 },
  longDescription: { max: 420, min: 20 },
  cardTitle: { max: 60, min: 3 },
  cardDescription: { max: 160, min: 10 },
  featureTitle: { max: 60, min: 3 },
  featureDescription: { max: 160, min: 10 },
  buttonLabel: { max: 24, min: 2 },
  faqQuestion: { max: 120, min: 8 },
  faqAnswer: { max: 600, min: 20 },
  teamName: { max: 40, min: 2 },
  teamRole: { max: 48, min: 3 },
  categoryName: { max: 40, min: 2 },
  categoryDescription: { max: 160, min: 8 },
  statLabel: { max: 40, min: 3 },
  statValue: { max: 12, min: 1 },
  statSuffix: { max: 8 },
  stepTitle: { max: 60, min: 3 },
  stepDescription: { max: 200, min: 10 },
  tag: { max: 28 },
  galleryCaption: { max: 28 },
  galleryTitle: { max: 60, min: 3 },
  galleryDescription: { max: 160, min: 8 },
  pillarTitle: { max: 48, min: 3 },
  pillarBody: { max: 160, min: 8 },
  ledgerNote: { max: 120 },
  heading: { max: 80, min: 4 },
  name: { max: 60, min: 2 },
  number: { max: 6 },
  altText: { max: 120 },
  email: { max: 80 },
  phone: { max: 28 },
  address: { max: 160 },
  seoTitle: { max: 70, min: 10 },
  seoDescription: { max: 180, min: 30 },
} as const satisfies Record<string, CharLimit>;

export type TextLimitId = keyof typeof TEXT_LIMITS;

/** The full {max,min} limit for an id (undefined → no limit). */
export function limit(id?: TextLimitId): CharLimit | undefined {
  return id ? TEXT_LIMITS[id] : undefined;
}
/** Just the hard max for an id (undefined → no cap). */
export function limitMax(id?: TextLimitId): number | undefined {
  return id ? TEXT_LIMITS[id].max : undefined;
}
/** Just the advisory min for an id (undefined → none). */
export function limitMin(id?: TextLimitId): number | undefined {
  return id ? (TEXT_LIMITS[id] as CharLimit).min : undefined;
}

/** Max links allowed in the top navigation bar. Kept low for UX: 5–7 is the
 *  scannable sweet spot; beyond ~6 the nav crowds the logo + CTAs and wraps.
 *  Single source of truth — tune here. */
export const MAX_NAV_LINKS = 6;

/* ────────────────────────────────────────────────────────────────────────────
 * 2. URL RULES — host/scheme checks layered on top of safeHref scheme safety.
 * ──────────────────────────────────────────────────────────────────────────── */
export const URL_RULES = {
  appleStore: { test: (v: string) => /apps\.apple\.com/i.test(v), hint: "must be an apps.apple.com link" },
  googlePlay: { test: (v: string) => /play\.google\.com/i.test(v), hint: "must be a play.google.com link" },
  video: { test: (v: string) => /^https?:\/\//i.test(v), hint: "must be a full https:// video URL" },
  any: { test: (v: string) => safeHref(v, "") !== "", hint: "must be a valid URL" },
} as const;

export type UrlRuleId = keyof typeof URL_RULES;

/* ────────────────────────────────────────────────────────────────────────────
 * 3. SECTION RULES — arrays (min/max), required fields, and text/URL field maps.
 *    Keyed by section type (dynamic sections) plus the core "hero"/"about"/
 *    "services"/"contact"/"seo" pseudo-sections.
 * ──────────────────────────────────────────────────────────────────────────── */
export type ArrayRule = { min?: number; max?: number; label: string; recommendMin?: number };
export type RequiredField = { key: string; label: string; kind: "text" | "url" | "image" };
export type UrlField = { key: string; rule: UrlRuleId; label: string };

export type SectionRule = {
  /** Section-level array fields → count limits (e.g. faq.items: {min:3}). */
  arrays?: Record<string, ArrayRule>;
  /** Top-level required fields (must be non-empty / a valid url / a valid image). */
  required?: RequiredField[];
  /** Section-level text data keys → a TEXT_LIMITS id (drives caps + counters). */
  textFields?: Partial<Record<string, TextLimitId>>;
  /** Item-level text fields per array: arrayKey → { itemKey → limit id }. */
  itemTextFields?: Record<string, Partial<Record<string, TextLimitId>>>;
  /** URL fields → which URL rule validates them. */
  urlFields?: UrlField[];
  /** Per-fragment char cap for this section's styled heading (rich field). */
  headingLimit?: TextLimitId;
};

export const SECTION_RULES: Record<string, SectionRule> = {
  // ── Core sections (live in config.content, not sections[]) ──
  hero: {
    arrays: {
      slides: { min: 1, max: 4, label: "Hero images" },
      meta: { max: 4, label: "Hero stats" },
    },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", headline: "sectionTitle", tagline: "sectionSubtitle" },
    itemTextFields: {
      slides: { tag: "tag", caption: "galleryCaption" },
      meta: { value: "statValue", suffix: "statSuffix", label: "statLabel" },
    },
  },
  about: {
    arrays: {
      pillars: { min: 1, max: 3, label: "Pillars" },
    },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", lede: "description", description: "longDescription" },
    itemTextFields: {
      pillars: { n: "number", title: "pillarTitle", body: "pillarBody", meta: "tag" },
    },
  },
  services: {
    arrays: {
      items: { min: 4, max: 6, label: "Service cards" },
    },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", ctaLabel: "buttonLabel" },
    itemTextFields: {
      items: { title: "cardTitle", description: "cardDescription" },
    },
  },

  // ── Dynamic sections ──
  appStrip: {
    required: [
      { key: "logo", label: "App logo", kind: "image" },
      { key: "appStoreUrl", label: "Apple App Store URL", kind: "url" },
      { key: "googlePlayUrl", label: "Google Play URL", kind: "url" },
    ],
    headingLimit: "heading",
    textFields: { descriptor: "description" },
    urlFields: [
      { key: "appStoreUrl", rule: "appleStore", label: "Apple App Store URL" },
      { key: "googlePlayUrl", rule: "googlePlay", label: "Google Play URL" },
    ],
  },
  stats: {
    arrays: { items: { max: 4, label: "Stat cards" } },
    textFields: { headline: "sectionTitle", descriptor: "sectionSubtitle" },
    itemTextFields: {
      items: { value: "statValue", suffix: "statSuffix", label: "statLabel", footnote: "tag" },
    },
  },
  savings: {
    arrays: { items: { max: 4, label: "Savings cards" } },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", lede: "description" },
    itemTextFields: { items: { name: "cardTitle", cat: "tag" } },
  },
  videoFeature: {
    required: [
      { key: "videoUrl", label: "Video URL", kind: "url" },
      { key: "poster", label: "Poster image", kind: "image" },
    ],
    headingLimit: "heading",
    textFields: { tag: "tag", ctaLabel: "buttonLabel" },
    urlFields: [{ key: "videoUrl", rule: "video", label: "Video URL" }],
  },
  team: {
    arrays: {
      departments: { min: 2, max: 4, label: "Departments" },
    },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", signature: "teamName", signatureLabel: "tag" },
    itemTextFields: {
      departments: { code: "number", label: "teamName", role: "teamRole", detail: "cardDescription" },
      credentials: { label: "statLabel", value: "sectionSubtitle" },
    },
  },
  features: {
    arrays: { items: { min: 2, max: 4, label: "Feature cards" } },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow" },
    itemTextFields: { items: { title: "featureTitle", description: "featureDescription" } },
  },
  categories: {
    arrays: { items: { recommendMin: 1, label: "Categories" } },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", tagline: "description" },
    itemTextFields: { items: { title: "categoryName", description: "categoryDescription" } },
  },
  howItWorks: {
    arrays: { steps: { min: 2, label: "Steps" } },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", ctaLabel: "buttonLabel" },
    itemTextFields: { steps: { title: "stepTitle", description: "stepDescription" } },
  },
  faq: {
    arrays: { items: { min: 3, label: "Questions" } },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", lede: "description", ctaLabel: "buttonLabel" },
    itemTextFields: { items: { question: "faqQuestion", answer: "faqAnswer", learnMoreLabel: "buttonLabel" } },
  },
  gallery: {
    arrays: { images: { min: 5, max: 7, label: "Gallery images" } },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", lede: "description" },
    itemTextFields: {
      images: { caption: "galleryCaption", title: "galleryTitle", description: "galleryDescription", alt: "altText" },
    },
  },
  aiStore: {
    arrays: { tiles: { min: 3, max: 5, label: "AI store cards" } },
    headingLimit: "heading",
    textFields: { eyebrow: "eyebrow", lede: "description" },
    itemTextFields: {
      tiles: { tag: "tag", title: "galleryTitle", description: "galleryDescription", alt: "altText" },
    },
  },

  // ── Step pseudo-sections (identity/seo/contact) ──
  seo: {
    textFields: { title: "seoTitle", description: "seoDescription" },
  },
  contact: {
    textFields: { email: "email", phone: "phone", address: "address" },
  },
};

/* ────────────────────────────────────────────────────────────────────────────
 * 4. VALIDATION — produce a flat, user-friendly issue list for a whole draft.
 * ──────────────────────────────────────────────────────────────────────────── */
export type ValidationIssue = {
  /** Section card id (for dynamic sections) so the UI can jump to it. */
  sectionId?: string;
  /** Wizard step id (for core/identity/seo/contact issues). */
  step?: string;
  /** Group label shown in the summary (e.g. "Services", "App strip"). */
  group: string;
  /** User-friendly message. */
  message: string;
  severity: "error" | "warn";
};

/** A draft section as held by the builder (id + type + free-form data). */
type DraftLike = { id: string; type: string; data: Record<string, unknown> };

/** True when a string value is present after trimming. */
function nonEmpty(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

/** Validate a single URL value against a rule (scheme-safe + host pattern). */
function urlValid(v: unknown, ruleId: UrlRuleId): boolean {
  if (!nonEmpty(v)) return false;
  const s = String(v).trim();
  if (safeHref(s, "") === "") return false; // unsafe scheme
  return URL_RULES[ruleId].test(s);
}

/** Check one section's data against its rule. Pushes issues into `out`. */
function checkSection(
  rule: SectionRule | undefined,
  data: Record<string, unknown>,
  ctx: { group: string; sectionId?: string; step?: string },
  out: ValidationIssue[],
) {
  if (!rule) return;
  const base = { group: ctx.group, sectionId: ctx.sectionId, step: ctx.step };

  // Array min/max + recommended-min (warn).
  for (const [key, r] of Object.entries(rule.arrays ?? {})) {
    const arr = Array.isArray(data[key]) ? (data[key] as unknown[]) : [];
    if (r.min != null && arr.length < r.min)
      out.push({ ...base, severity: "error", message: `${r.label}: add at least ${r.min} (you have ${arr.length}).` });
    if (r.max != null && arr.length > r.max)
      out.push({ ...base, severity: "error", message: `${r.label}: keep at most ${r.max} (you have ${arr.length}).` });
    if (r.recommendMin != null && arr.length < r.recommendMin)
      out.push({ ...base, severity: "warn", message: `${r.label}: add at least ${r.recommendMin} for a complete look.` });
  }

  // Required fields.
  for (const req of rule.required ?? []) {
    const v = data[req.key];
    const ok =
      req.kind === "image" ? nonEmpty(v) && safeSrc(String(v)) !== "" :
      req.kind === "url" ? nonEmpty(v) :
      nonEmpty(v);
    if (!ok) out.push({ ...base, severity: "error", message: `${req.label} is required.` });
  }

  // URL field host/scheme rules (only when a value is present — emptiness is a
  // "required" concern handled above, so we don't double-report).
  for (const uf of rule.urlFields ?? []) {
    const v = data[uf.key];
    if (nonEmpty(v) && !urlValid(v, uf.rule))
      out.push({ ...base, severity: "error", message: `${uf.label} ${URL_RULES[uf.rule].hint}.` });
  }
}

/**
 * validateDraft - The single entry point the publish gate (and completion meter)
 * call. Returns every blocking error + advisory warning across the whole draft.
 * @param config - the full AppConfig draft (core content + contact/seo).
 * @param sections - the builder's dynamic draft sections (id + type + data).
 */
export function validateDraft(config: AppConfig, sections: DraftLike[]): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const content = (config.content ?? {}) as Record<string, unknown>;

  // Core sections live on config.content.
  checkSection(SECTION_RULES.hero, (content.hero as Record<string, unknown>) ?? {}, { group: "Hero", step: "sections" }, out);
  checkSection(SECTION_RULES.about, (content.about as Record<string, unknown>) ?? {}, { group: "About", step: "sections" }, out);
  // Services is a bare array on content.services — wrap it for the array check.
  checkSection(SECTION_RULES.services, { items: (content.services as unknown[]) ?? [] }, { group: "Services", step: "sections" }, out);

  // SEO + Contact steps.
  checkSection(SECTION_RULES.seo, (config.seo as Record<string, unknown>) ?? {}, { group: "SEO", step: "seo" }, out);
  // Contact: at least one support method (email / phone / form).
  const contact = (config.contact as Record<string, unknown>) ?? {};
  const formsOn = !!(config.features as Record<string, unknown> | undefined)?.enableForms;
  if (!nonEmpty(contact.email) && !nonEmpty(contact.phone) && !formsOn)
    out.push({ group: "Contact", step: "contact", severity: "error", message: "Add at least one support method — email, phone, or enable the enquiry form." });

  // Dynamic sections.
  for (const sec of sections) {
    const rule = SECTION_RULES[sec.type];
    if (!rule) continue;
    const meta = SECTION_GROUP_LABEL[sec.type] ?? sec.type;
    checkSection(rule, sec.data ?? {}, { group: meta, sectionId: sec.id, step: "sections" }, out);
  }

  return out;
}

/** Human labels for the issue groups (matches the section picker labels). */
const SECTION_GROUP_LABEL: Record<string, string> = {
  appStrip: "App strip",
  stats: "Stats",
  savings: "Savings",
  videoFeature: "Video",
  team: "Team",
  features: "Features",
  categories: "Categories",
  howItWorks: "How it works",
  faq: "FAQ",
  gallery: "Gallery",
  aiStore: "AI store",
};

/** Only the blocking errors (publish gate uses this). */
export function blockingIssues(issues: ValidationIssue[]): ValidationIssue[] {
  return issues.filter((i) => i.severity === "error");
}
