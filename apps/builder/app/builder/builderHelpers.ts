/**
 * @file builderHelpers.ts
 * @description Pure, stateless helpers for the Website Builder — string/clone
 *  utilities, localStorage draft persistence, id generation, CTA-variant preview
 *  styling, and step copy. None of these touch React state.
 * @responsibilities
 *  - headingText / clone / sameOrder / prefersReducedMotion utilities.
 *  - DRAFT_KEY + loadDraft/saveDraft (SSR-guarded localStorage persistence).
 *  - genId, PRODUCT_NAME, PUBLISH_DOMAIN, CTA_VARIANTS, ctaPreviewStyle.
 *  - stepTitle / stepSub copy.
 * @dependencies react (CSSProperties type), @wl/config-types, ./builderData
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import type React from "react";
import type { AppConfig, RichHeading } from "@wl/config-types";
import type { DraftSection, StepId } from "./builderData";
import { richHeadingToText } from "@wl/render-engine/modules/RichHeading";

/** Join a RichHeading's parts (or a plain string) into one display string, with
 *  the SAME smart spacing the heading renders with (so labels/SEO text match). */
export function headingText(rh: RichHeading | string | undefined): string {
  return richHeadingToText(rh);
}

/** Whether the visitor prefers reduced motion (resolved once on the client). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** The button variants a nav CTA can use, with their preview swatch styling. */
export const CTA_VARIANTS: Array<{ value: string; label: string }> = [
  { value: "primary", label: "Primary — solid ink" },
  { value: "accent", label: "Accent — brand colour" },
  { value: "ghost", label: "Ghost — outline" },
];
/** Build an inline style for a mini button preview of a CTA variant. */
export function ctaPreviewStyle(variant: string, colors: { ink?: string; text?: string; accent?: string; primary?: string; background?: string }): React.CSSProperties {
  const ink = colors.ink || colors.text || "#0A174C";
  const accent = colors.accent || colors.primary || "#1FAFA6";
  // Use longhand border props only (never the `border` shorthand) so switching
  // variants doesn't mix shorthand+longhand and trip React's styling warning.
  const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", borderWidth: 1, borderStyle: "solid", borderColor: "transparent" };
  if (variant === "accent") return { ...base, background: accent, color: "#fff" };
  if (variant === "ghost") return { ...base, background: "transparent", color: ink, borderColor: "rgba(0,0,0,.18)" };
  return { ...base, background: ink, color: "#fff" }; // primary
}

/** Deep clone helper (mirrors the design's JSON round-trip for immutable updates). */
export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

/** Shallow array equality for order-token lists. */
export function sameOrder(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** localStorage key for the persisted draft. The `vN` suffix is a CACHE VERSION,
 *  NOT a reset switch: `loadDraft` MIGRATES the newest older draft forward instead of
 *  discarding it (see migrateLegacyDraft), so a bump never wipes a user's in-progress
 *  work. Only an explicit "Clear all data" / "Reset to published" empties a draft.
 *
 *  WHEN TO BUMP N: ONLY on a genuine draft-SHAPE change — a field added, renamed, or
 *  retyped in BLANK()/INITIAL()/DEFAULTS() (builderData.ts) such that an old cached
 *  draft would be structurally wrong. NEVER bump for a value/text/UI-only change (e.g.
 *  changing default copy or a URL) — that costs users their work for no structural
 *  reason. (v13 was such a needless bump; the migration now makes even that harmless.)
 *  v13: removed the fabricated "<slug>.1pharmacy.site" URL + generic sticky text.
 *  v12 was the BLANK()-default clean-slate change. */
export const DRAFT_KEY = "wb:appConfig:v13";

/** The localStorage key family for persisted drafts — every version shares this stem. */
const DRAFT_KEY_PREFIX = "wb:appConfig:v";

/** A CSS colour value is safe only if it's a hex or rgb/hsl function literal. */
const SAFE_COLOR_RE = /^(?:#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(?:rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s/]+\))$/;

/**
 * Sanitize the brand colours on a restored config IN PLACE. localStorage is
 * attacker-tamperable (XSS on the origin, a browser extension); a crafted colour
 * like `red}body{…` would otherwise flow into the preview's injected <style>.
 * Any value that isn't a plain hex/rgb/hsl literal is replaced with a default.
 */
function sanitizeColors(config: AppConfig): void {
  const colors = config?.branding?.colors as Record<string, unknown> | undefined;
  if (!colors) return;
  const DEFAULTS: Record<string, string> = {
    primary: "#0A174C", secondary: "#F4EFE6", background: "#F4EFE6",
    text: "#0A174C", accent: "#1FAFA6", ink: "#0A174C",
  };
  for (const k of Object.keys(colors)) {
    const v = colors[k];
    if (typeof v !== "string" || !SAFE_COLOR_RE.test(v.trim())) {
      colors[k] = DEFAULTS[k] ?? "#000000";
    }
  }
}

/** A persisted draft passed the shape guard, or null if the raw value is unusable. */
function parseDraft(raw: string | null): { config: AppConfig; sections: DraftSection[]; blockOrder: string[] } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Minimal shape guard: must have a branding+content config and a sections array.
    if (parsed && parsed.config && parsed.config.branding && parsed.config.content && Array.isArray(parsed.sections)) {
      // Scrub tamperable brand colours before they can reach the injected <style>.
      sanitizeColors(parsed.config as AppConfig);
      // blockOrder may be absent in an older draft — default to hero+core+sections.
      const blockOrder: string[] = Array.isArray(parsed.blockOrder)
        ? parsed.blockOrder
        : ["hero", "about", "services", ...parsed.sections.map((s: DraftSection) => s.id)];
      return { config: parsed.config, sections: parsed.sections, blockOrder };
    }
  } catch {
    /* corrupt draft — caller falls back */
  }
  return null;
}

/** Numeric version embedded in a `wb:appConfig:vN` key (NaN if it doesn't match). */
function draftKeyVersion(key: string): number {
  return key.startsWith(DRAFT_KEY_PREFIX) ? Number(key.slice(DRAFT_KEY_PREFIX.length)) : NaN;
}

/**
 * When the CURRENT key has no draft (e.g. we just bumped the version), find the
 * highest-numbered OLDER `wb:appConfig:vN` draft that still parses, and return it so
 * loadDraft can adopt it. This is what makes a version bump a cache-refresh rather
 * than a data-wipe: the user's most recent work carries forward to the new key.
 * Returns null when there's genuinely nothing to migrate.
 */
function migrateLegacyDraft(): { config: AppConfig; sections: DraftSection[]; blockOrder: string[] } | null {
  const current = draftKeyVersion(DRAFT_KEY);
  // Collect every older draft key, newest first.
  const olderKeys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    const v = draftKeyVersion(k);
    if (Number.isFinite(v) && v < current) olderKeys.push(k);
  }
  olderKeys.sort((a, b) => draftKeyVersion(b) - draftKeyVersion(a)); // highest version first
  for (const k of olderKeys) {
    const draft = parseDraft(window.localStorage.getItem(k));
    if (draft) return draft;
  }
  return null;
}

/**
 * Read the persisted draft. Order:
 *  1. the CURRENT-version draft, if present;
 *  2. else the newest OLDER-version draft, MIGRATED forward (so a version bump never
 *     loses work — the migrated draft is immediately re-saved under DRAFT_KEY by the
 *     builder's autosave, and the stale keys can be pruned later).
 * Returns null only when there is no usable draft anywhere (truly fresh visitor).
 */
export function loadDraft(): { config: AppConfig; sections: DraftSection[]; blockOrder: string[] } | null {
  if (typeof window === "undefined") return null;
  const current = parseDraft(window.localStorage.getItem(DRAFT_KEY));
  if (current) return current;
  const migrated = migrateLegacyDraft();
  if (migrated) {
    // Adopt it under the current key immediately so a reload before the first edit
    // (which would otherwise trigger autosave) still finds the draft, then drop the
    // stale older keys so versions don't pile up in localStorage.
    saveDraft(migrated.config, migrated.sections, migrated.blockOrder);
    pruneLegacyDrafts();
  }
  return migrated;
}

/** Remove every `wb:appConfig:vN` key OLDER than the current one (post-migration). */
function pruneLegacyDrafts(): void {
  if (typeof window === "undefined") return;
  const current = draftKeyVersion(DRAFT_KEY);
  const stale: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    const v = draftKeyVersion(k);
    if (Number.isFinite(v) && v < current) stale.push(k);
  }
  stale.forEach((k) => window.localStorage.removeItem(k));
}

/** Persist the whole draft (config + sections + block order) to localStorage. */
export function saveDraft(config: AppConfig, sections: DraftSection[], blockOrder: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ config, sections, blockOrder }));
  } catch {
    /* quota / serialization failure — non-fatal */
  }
}

let SEQ = 100;
/** Generate a stable client-side section id. */
export function genId(): string {
  return "s" + SEQ++;
}

/** Product name shown in the header (placeholder until final branding lands). */
export const PRODUCT_NAME = "1Pharmacy Website Builder";
/** Short label for the published-site placeholder domain. */
export const PUBLISH_DOMAIN = "1pharmacy.site";

/** The editor body title for a wizard step. */
export function stepTitle(id: StepId): string {
  return ({ identity: "Business identity", branding: "Branding & colours", seo: "Search & metadata", sections: "Build your page", navigation: "Navigation & footer", legal: "Contact & legal" } as Record<StepId, string>)[id];
}
/** The editor body subtitle for a wizard step. */
export function stepSub(id: StepId): string {
  return ({
    identity: "Tell us who this site is for.",
    branding: "Set the six colour tokens and logo that theme your whole site.",
    seo: "How your site appears in search and when shared.",
    sections: "Add, reorder and edit the blocks that make up your page. Drag to rearrange.",
    navigation: "Your nav links, footer and sticky call-to-action.",
    legal: "Contact details, terms, privacy and your disclaimer.",
  } as Record<StepId, string>)[id];
}
